import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the same build works on the web *and* inside the
// Capacitor native shells (which load assets from the local filesystem).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
