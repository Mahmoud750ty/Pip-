// src/lib/firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAUVtQUa4dMPA7MVF5wAJSxB-UvCuZQo7o",
    authDomain: "pipbeachplug.firebaseapp.com",
    projectId: "pipbeachplug",
    //
    //  vvvvvvvvvvvvv   THIS IS THE CORRECTED LINE   vvvvvvvvvvvvv
    //
    storageBucket: "pipbeachplug.firebasestorage.app",
    //
    messagingSenderId: "962943218026",
    appId: "1:962943218026:web:a21c164e452b0c67347513",
    measurementId: "G-P30RJPFEQ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services and export them for use in other parts of your app
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, auth, storage };