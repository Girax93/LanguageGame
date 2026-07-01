/**
 * Minimal store-mode (no compression) ZIP read/write — just enough to package a
 * contributor's take files + manifest for Export, and unpack them on Import.
 * No deflate: audio is already compressed, so store-mode keeps this tiny and
 * dependency-free. Pure logic (Uint8Array / DataView / Blob), unit-testable.
 */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export interface ZipEntry { path: string; data: Uint8Array; }

const ENC = new TextEncoder();
const DEC = new TextDecoder();

export function zipStore(entries: ZipEntry[]): Blob {
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const e of entries) {
    const name = ENC.encode(e.path);
    const crc = crc32(e.data);
    const size = e.data.length;

    const lh = new Uint8Array(30 + name.length);
    const lv = new DataView(lh.buffer);
    lv.setUint32(0, 0x04034b50, true); // local file header sig
    lv.setUint16(4, 20, true);         // version needed
    lv.setUint16(6, 0x0800, true);     // flags: UTF-8 filenames
    lv.setUint16(8, 0, true);          // method: store
    lv.setUint16(10, 0, true);         // mod time
    lv.setUint16(12, 0, true);         // mod date
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true);      // compressed size
    lv.setUint32(22, size, true);      // uncompressed size
    lv.setUint16(26, name.length, true);
    lv.setUint16(28, 0, true);         // extra len
    lh.set(name, 30);
    parts.push(lh, e.data);

    const ch = new Uint8Array(46 + name.length);
    const cv = new DataView(ch.buffer);
    cv.setUint32(0, 0x02014b50, true); // central dir header sig
    cv.setUint16(4, 20, true);         // version made by
    cv.setUint16(6, 20, true);         // version needed
    cv.setUint16(8, 0x0800, true);     // flags
    cv.setUint16(10, 0, true);         // method
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, name.length, true);
    cv.setUint16(30, 0, true);         // extra
    cv.setUint16(32, 0, true);         // comment
    cv.setUint16(34, 0, true);         // disk number
    cv.setUint16(36, 0, true);         // internal attrs
    cv.setUint32(38, 0, true);         // external attrs
    cv.setUint32(42, offset, true);    // local header offset
    ch.set(name, 46);
    central.push(ch);

    offset += lh.length + size;
  }

  const cdSize = central.reduce((n, c) => n + c.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);   // EOCD sig
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, offset, true);      // central dir offset
  ev.setUint16(20, 0, true);

  return new Blob([...parts, ...central, eocd], { type: 'application/zip' });
}

/** Parse a store-mode zip via its central directory. Ignores compressed entries. */
export function unzipStore(buf: ArrayBuffer): ZipEntry[] {
  const bytes = new Uint8Array(buf);
  const view = new DataView(buf);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= 0; i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) return [];
  const count = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);
  const out: ZipEntry[] = [];
  for (let i = 0; i < count; i++) {
    if (p + 46 > bytes.length || view.getUint32(p, true) !== 0x02014b50) break;
    const method = view.getUint16(p + 10, true);
    const size = view.getUint32(p + 24, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const lho = view.getUint32(p + 42, true);
    const name = DEC.decode(bytes.subarray(p + 46, p + 46 + nameLen));
    const lNameLen = view.getUint16(lho + 26, true);
    const lExtraLen = view.getUint16(lho + 28, true);
    const dataStart = lho + 30 + lNameLen + lExtraLen;
    if (method === 0) out.push({ path: name, data: bytes.slice(dataStart, dataStart + size) });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

export const zipText = {
  encode: (s: string): Uint8Array => ENC.encode(s),
  decode: (b: Uint8Array): string => DEC.decode(b),
};
