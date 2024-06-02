// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAiVwKfk5e7UU_7itgAKX2ihu99jsTb0eM",
  authDomain: "mahichat-51608.firebaseapp.com",
  projectId: "mahichat-51608",
  storageBucket: "mahichat-51608.appspot.com",
  messagingSenderId: "173072295005",
  appId: "1:173072295005:web:930282a237d3522f6c59b4",
  measurementId: "G-FWVKD7XY8Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth=getAuth()
export const db=getFirestore()
export const storage=getStorage()