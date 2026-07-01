/**
 * Studio-clean capture: getUserMedia with all browser DSP OFF (no AGC / noise
 * suppression / echo cancellation) so it records exactly what your interface
 * sends, then WebAudio PCM -> 16-bit WAV. A ScriptProcessor is used on purpose:
 * it's deprecated but universally supported and dead-simple, which matters more
 * than being modern for a short-clip recorder. Also exposes a live level.
 */

export interface InputDevice {
  deviceId: string;
  label: string;
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const bytesPerSample = 2; // 16-bit
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  const dataLen = samples.length * bytesPerSample;
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLen, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true); // byte rate
  view.setUint16(32, bytesPerSample, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeStr(36, 'data');
  view.setUint32(40, dataLen, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    off += 2;
  }
  return new Blob([view], { type: 'audio/wav' });
}

function merge(chunks: Float32Array[]): Float32Array {
  let len = 0;
  for (const c of chunks) len += c.length;
  const out = new Float32Array(len);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out;
}

export class Capture {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private chunks: Float32Array[] = [];
  private recording = false;
  private meter: Float32Array = new Float32Array(1024);
  private gainNode: GainNode | null = null;
  private hp: BiquadFilterNode | null = null;
  private eqLowNode: BiquadFilterNode | null = null;
  private eqMidNode: BiquadFilterNode | null = null;
  private eqHighNode: BiquadFilterNode | null = null;
  gainDb = 0;
  eqLow = 0;
  eqMid = 0;
  eqHigh = 0;
  lastPeakDb = -Infinity;
  lastRmsDb = -Infinity;
  deviceId: string | null = null;
  sampleRate = 48000;
  ready = false;

  /** Ask for mic permission (needed before device labels are visible). */
  async enable(deviceId?: string): Promise<void> {
    this.dispose();
    const audio: MediaTrackConstraints = {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      channelCount: 1,
    };
    if (deviceId) audio.deviceId = { exact: deviceId };
    this.stream = await navigator.mediaDevices.getUserMedia({ audio });
    const Ctx: typeof AudioContext =
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ||
      window.AudioContext;
    this.ctx = new Ctx();
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.sampleRate = this.ctx.sampleRate;
    const source = this.ctx.createMediaStreamSource(this.stream);
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = Math.pow(10, this.gainDb / 20);
    // Fixed low-cut (rumble / plosive hygiene) + 3-band tone shaping.
    this.hp = this.ctx.createBiquadFilter();
    this.hp.type = 'highpass';
    this.hp.frequency.value = 80;
    this.eqLowNode = this.ctx.createBiquadFilter();
    this.eqLowNode.type = 'lowshelf';
    this.eqLowNode.frequency.value = 200;
    this.eqLowNode.gain.value = this.eqLow;
    this.eqMidNode = this.ctx.createBiquadFilter();
    this.eqMidNode.type = 'peaking';
    this.eqMidNode.frequency.value = 2500;
    this.eqMidNode.Q.value = 1;
    this.eqMidNode.gain.value = this.eqMid;
    this.eqHighNode = this.ctx.createBiquadFilter();
    this.eqHighNode.type = 'highshelf';
    this.eqHighNode.frequency.value = 6000;
    this.eqHighNode.gain.value = this.eqHigh;
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.meter = new Float32Array(this.analyser.fftSize);
    this.processor = this.ctx.createScriptProcessor(4096, 1, 1);
    this.processor.onaudioprocess = (e) => {
      if (!this.recording) return;
      this.chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    };
    const mute = this.ctx.createGain();
    mute.gain.value = 0; // keep the graph pulling without monitoring
    // source -> gain -> low-cut -> low/mid/high EQ -> analyser -> capture -> muted out.
    // Everything sits pre-analyser, so the meter + recording reflect the processed sound.
    source.connect(this.gainNode);
    this.gainNode.connect(this.hp);
    this.hp.connect(this.eqLowNode);
    this.eqLowNode.connect(this.eqMidNode);
    this.eqMidNode.connect(this.eqHighNode);
    this.eqHighNode.connect(this.analyser);
    this.analyser.connect(this.processor);
    this.processor.connect(mute);
    mute.connect(this.ctx.destination);
    this.deviceId = deviceId ?? this.stream.getAudioTracks()[0]?.getSettings().deviceId ?? null;
    this.ready = true;
  }

  async listInputs(): Promise<InputDevice[]> {
    const all = await navigator.mediaDevices.enumerateDevices();
    return all
      .filter((d) => d.kind === 'audioinput')
      .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Input ${i + 1}` }));
  }

  begin(): void {
    this.chunks = [];
    this.recording = true;
  }

  /** Stop and return the take as a WAV blob (empty-safe). Also computes level stats. */
  end(): Blob {
    this.recording = false;
    const samples = merge(this.chunks);
    let peak = 0;
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      const a = Math.abs(samples[i]);
      if (a > peak) peak = a;
      sum += samples[i] * samples[i];
    }
    this.lastPeakDb = peak > 0 ? 20 * Math.log10(peak) : -Infinity;
    const rms = samples.length ? Math.sqrt(sum / samples.length) : 0;
    this.lastRmsDb = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
    return encodeWav(samples, this.sampleRate);
  }

  /** Software input gain in dB, applied to capture + meter (source stays clean). */
  setGain(db: number): void {
    this.gainDb = db;
    if (this.gainNode) this.gainNode.gain.value = Math.pow(10, db / 20);
  }

  /** 3-band tone shaping in dB (low shelf @200Hz / mid peak @2.5k / high shelf @6k). */
  setEq(low: number, mid: number, high: number): void {
    this.eqLow = low;
    this.eqMid = mid;
    this.eqHigh = high;
    if (this.eqLowNode) this.eqLowNode.gain.value = low;
    if (this.eqMidNode) this.eqMidNode.gain.value = mid;
    if (this.eqHighNode) this.eqHighNode.gain.value = high;
  }

  /** Live peak level in dBFS (-60..0), post-gain, for the meter. */
  meterDb(): number {
    if (!this.analyser) return -60;
    this.analyser.getFloatTimeDomainData(this.meter);
    let peak = 0;
    for (let i = 0; i < this.meter.length; i++) {
      const a = Math.abs(this.meter[i]);
      if (a > peak) peak = a;
    }
    return peak > 0 ? Math.max(-60, 20 * Math.log10(peak)) : -60;
  }

  get isRecording(): boolean {
    return this.recording;
  }

  /** Current input level 0..1 (RMS), for the meter. */
  level(): number {
    if (!this.analyser) return 0;
    this.analyser.getFloatTimeDomainData(this.meter);
    let sum = 0;
    for (let i = 0; i < this.meter.length; i++) sum += this.meter[i] * this.meter[i];
    return Math.min(1, Math.sqrt(sum / this.meter.length) * 3);
  }

  dispose(): void {
    this.recording = false;
    this.ready = false;
    if (this.processor) this.processor.onaudioprocess = null;
    try {
      this.stream?.getTracks().forEach((t) => t.stop());
    } catch {
      /* ignore */
    }
    try {
      void this.ctx?.close();
    } catch {
      /* ignore */
    }
    this.ctx = null;
    this.stream = null;
    this.analyser = null;
    this.processor = null;
    this.gainNode = null;
    this.hp = null;
    this.eqLowNode = null;
    this.eqMidNode = null;
    this.eqHighNode = null;
  }
}
