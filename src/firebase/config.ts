// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Verificar se as variáveis de ambiente do Firebase estão definidas
if (!process.env.FIREBASE_API_KEY) {
  throw new Error("FIREBASE_API_KEY não está definido nas variáveis de ambiente")
}

if (!process.env.FIREBASE_AUTH_DOMAIN) {
  throw new Error("FIREBASE_AUTH_DOMAIN não está definido nas variáveis de ambiente")
}

if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error("FIREBASE_PROJECT_ID não está definido nas variáveis de ambiente")
}

if (!process.env.FIREBASE_STORAGE_BUCKET) {
  throw new Error("FIREBASE_STORAGE_BUCKET não está definido nas variáveis de ambiente")
}

if (!process.env.FIREBASE_MESSAGING_SENDER_ID) {
  throw new Error("FIREBASE_MESSAGING_SENDER_ID não está definido nas variáveis de ambiente")
}

if (!process.env.FIREBASE_APP_ID) {
  throw new Error("FIREBASE_APP_ID não está definido nas variáveis de ambiente")
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
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
