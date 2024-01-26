// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_vXQXScynW7j7t7R3VPmDBrGhkX9Z9QQ",
  authDomain: "testing-project-2a232.firebaseapp.com",
  databaseURL: "https://testing-project-2a232-default-rtdb.firebaseio.com",
  projectId: "testing-project-2a232",
  storageBucket: "testing-project-2a232.appspot.com",
  messagingSenderId: "647235298187",
  appId: "1:647235298187:web:36b84e9a1d2cd0723d058e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
