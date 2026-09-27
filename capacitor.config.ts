import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blacklovelink.app',
  appName: 'BlackLoveLink',
  webDir: 'dist',
  // When running on a real device during development, point to your local/Vercel URL
  // Comment this out for production builds
  // server: {
  //   url: 'https://blacklovelink.vercel.app',
  //   cleartext: true,
  // },
  android: {
    allowMixedContent: false,
    backgroundColor: '#141720',
    // Enables edge-to-edge rendering
    captureInput: false,
  },
  plugins: {
    // Splash screen config (uses native splash in Capacitor)
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    // Status bar — themed to obsidian dark
    StatusBar: {
      style: 'dark',
      backgroundColor: '#141720',
    },
  },
};

export default config;
