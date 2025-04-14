// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDecGG4IJiXtvbzjv3rTViYKXn3gfyesFM",
    authDomain: "uts3-2d0d5.firebaseapp.com",
    projectId: "uts3-2d0d5",
    storageBucket: "uts3-2d0d5.firebasestorage.app",
    messagingSenderId: "963795817450",
    appId: "1:963795817450:web:297cc57cff09e238521893"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);