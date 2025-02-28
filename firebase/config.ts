import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCjabuDLYOS0prgAeRgWTZ9A4KaInVKdEw",
  authDomain: "dejavu-pub-feaa1.firebaseapp.com",
  projectId: "dejavu-pub-feaa1",
  storageBucket: "dejavu-pub-feaa1.firebasestorage.app",
  messagingSenderId: "705084001604",
  appId: "1:705084001604:web:5c94a006d1c4131a541b11",
  measurementId: "G-7J3QJ36EG8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };