// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdIaP40a2Sbwfg_loLeHgH0UIV4lEWRXs",
  authDomain: "studio-5757745802-11667.firebaseapp.com",
  projectId: "studio-5757745802-11667",
  storageBucket: "studio-5757745802-11667.appspot.com",
  messagingSenderId: "918694849663",
  appId: "1:918694849663:web:54a0ce3328b6040685234a"
};

// Initialize Firebase
function initializeFirebase() {
    if (!getApps().length) {
        return initializeApp(firebaseConfig);
    } else {
        return getApp();
    }
}

export const firebaseApp = initializeFirebase();
