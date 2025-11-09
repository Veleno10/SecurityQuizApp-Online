// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOSRU9RpimU91QBcHU_DD7J8MYa3Na73g",
  authDomain: "securityquizapp.firebaseapp.com",
  projectId: "securityquizapp",
  storageBucket: "securityquizapp.firebasestorage.app",
  messagingSenderId: "245494246657",
  appId: "1:245494246657:web:216bccf8be46db1c3bff00"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);