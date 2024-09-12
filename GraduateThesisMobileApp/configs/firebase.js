// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Constants from "expo-constants"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAVwT8Ky3Rz2eXdCs4LYF8DI-JPVOoy1Oo",
  authDomain: "graduate-thesis-app.firebaseapp.com",
  projectId: "graduate-thesis-app",
  storageBucket: "graduate-thesis-app.appspot.com",
  messagingSenderId: "526031833879",
  appId: "1:526031833879:web:fdc03e1c8cb9a41348c552",
  measurementId: "G-FWLG30THPH"
};

// Initialize Firebase
initializeApp(firebaseConfig)
export const MyAuth = getAuth();
export const MyDatabase = getFirestore();