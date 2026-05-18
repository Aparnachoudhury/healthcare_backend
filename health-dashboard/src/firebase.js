// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAaRlwxf8W-KVgZ4q7H3nogjccA6NV1q1U",
  authDomain: "healthcare-dashboard-c15ae.firebaseapp.com",
  projectId: "healthcare-dashboard-c15ae",
  storageBucket: "healthcare-dashboard-c15ae.firebasestorage.app",
  messagingSenderId: "518393532824",
  appId: "1:518393532824:web:65de87003cc070d49fdbed",
  measurementId: "G-5HCY5N64RY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);