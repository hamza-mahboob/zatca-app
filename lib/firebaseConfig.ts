import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA_XsfO0wnm7U49Jl-eC4IcP_p9V37eMx0",
    authDomain: "zatca-app.firebaseapp.com",
    projectId: "zatca-app",
    storageBucket: "zatca-app.firebasestorage.app",
    messagingSenderId: "485129398210",
    appId: "1:485129398210:web:e05eb3c401e641b1dc185b"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
