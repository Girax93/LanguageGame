import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// Resolve extensionless relative imports (Vite-style) for `node --experimental-strip-types`.
export async function resolve(spec, ctx, next) {
  if (spec.startsWith('./') || spec.startsWith('../')) {
    const base = new URL(spec, ctx.parentURL);
    if (!existsSync(fileURLToPath(base))) {
      for (const ext of ['.ts', '.tsx', '/index.ts']) {
        const cand = new URL(spec + ext, ctx.parentURL);
        if (existsSync(fileURLToPath(cand))) return { url: cand.href, shortCircuit: true };
      }
    }
  }
  return next(spec, ctx);
}
