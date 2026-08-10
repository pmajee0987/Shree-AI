import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shree.app',
  appName: 'Shree',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
