import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('.', import.meta.url));

// Relative base so the same build works on the web *and* inside the
// Capacitor native shells (which load assets from the local filesystem).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      // Two entry points: the game (index.html) and the dev/contributor voice
      // recorder (recorder.html), so the recorder is reachable at /recorder.html
      // once deployed. It is never linked from the game UI.
      input: {
        main: resolve(root, 'index.html'),
        recorder: resolve(root, 'recorder.html'),
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
