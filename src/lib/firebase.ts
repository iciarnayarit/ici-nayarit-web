// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD9qnr9DPguuid5bnmD0USPOdd_Vg4IxFk",
  authDomain: "iciar-nayarit.firebaseapp.com",
  projectId: "iciar-nayarit",
  storageBucket: "iciar-nayarit.firebasestorage.app",
  messagingSenderId: "246832318757",
  appId: "1:246832318757:web:65efe19ab2fb2a592c32cc",
  measurementId: "G-9F94FMT7RD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}
export { app, analytics };
