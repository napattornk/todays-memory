import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.todaysmemory.app',
  appName: "Today's Memory",
  webDir: 'dist',
  backgroundColor: '#faf7f2',
  ios: {
    contentInset: 'always',
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#faf7f2',
      showSpinner: false,
    },
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: false,
      androidIsEncryption: false,
      androidBiometric: {
        biometricAuth: false,
      },
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#a9714a',
    },
  },
}

export default config
