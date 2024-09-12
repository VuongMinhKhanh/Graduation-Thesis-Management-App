import "dotenv/config";

export default {
  "expo": {
    "name": "ecoursemobilev1",
    "slug": "ecoursemobilev1",
    "version": "1.0.0",
    "assetBundlePatterns": [
      "**/*"
    ],
    "android": {
      "googleServicesFile": "./android/app/google-services.json",
      "package": "com.anonymous.ecoursemobilev1"
    }
  },
  "name": "Graduate Thesis App",
  extra: {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
  },
  "plugins": [
    "@react-native-firebase/app",
    "@react-native-firebase/database",
    "@react-native-firebase/firestore",
    // "@react-native-firebase/auth",
    // "@react-native-firebase/crashlytics",
    [
      "expo-build-properties",
      {
        "ios": {
          "useFrameworks": "static"
        }
      }
    ]
  ]
}
