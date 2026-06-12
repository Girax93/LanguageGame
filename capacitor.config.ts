import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.aribenjamin.languagegames',
  appName: 'Language Games',
  // Vite builds the web app into dist/. Capacitor copies this into the
  // native iOS/Android projects on `npx cap sync`.
  webDir: 'dist',
};

export default config;
