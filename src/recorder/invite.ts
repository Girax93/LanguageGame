/**
 * Encrypted, tamper-proof invite tokens (AES-GCM) — no server.
 *
 * A contributor link is `…/recorder.html?c=<token>`. The token hides the name +
 * language (encrypted, not readable), is unguessable (random 96-bit IV), and
 * rejects any tampering (GCM auth tag) — so a friend can't edit their assigned
 * name/language, and a stranger can't forge one. The key is baked in (obfuscated)
 * since there's no backend; worst case if extracted, someone runs a recorder that
 * writes to THEIR OWN disk — Ari still controls what he Imports.
 */

// Obfuscated 256-bit key. Not real secrecy against a determined reverse-engineer;
// enough to stop friends from tampering with their link (see file header).
const KEY_BYTES = new Uint8Array([
  0x53, 0x1f, 0x9a, 0x27, 0xb4, 0xe0, 0x6c, 0xd8, 0x11, 0x74, 0x3e, 0xa2, 0x8b, 0x55, 0xc9, 0x0d,
  0x66, 0xf1, 0x22, 0x9e, 0x4a, 0xd3, 0x77, 0x10, 0xbc, 0x38, 0x85, 0xe7, 0x2b, 0x50, 0x99, 0xc4,
]);

let keyP: Promise<CryptoKey> | null = null;
function key(): Promise<CryptoKey> {
  if (!keyP) keyP = crypto.subtle.importKey('raw', KEY_BYTES, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  return keyP;
}

function b64urlEncode(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str: string): Uint8Array {
  const s = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(s + '==='.slice((s.length + 3) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export interface Invite { name: string; lang: string; }

export async function encodeInvite(inv: Invite): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify({ n: inv.name, l: inv.lang }));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(), data));
  const packed = new Uint8Array(iv.length + ct.length);
  packed.set(iv, 0);
  packed.set(ct, iv.length);
  return b64urlEncode(packed);
}

export async function decodeInvite(token: string): Promise<Invite | null> {
  try {
    const packed = b64urlDecode(token);
    if (packed.length < 13) return null;
    const iv = packed.subarray(0, 12);
    const ct = packed.subarray(12);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, await key(), ct);
    const obj = JSON.parse(new TextDecoder().decode(new Uint8Array(pt)));
    if (obj && typeof obj.n === 'string' && typeof obj.l === 'string') return { name: obj.n, lang: obj.l };
    return null;
  } catch {
    return null;
  }
}
