import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsxqWNWxK86POzLK3650TI9s7zH-fladQ",
  authDomain: "flowin-app-aduracak.firebaseapp.com",
  projectId: "flowin-app-aduracak",
  storageBucket: "flowin-app-aduracak.firebasestorage.app",
  messagingSenderId: "406978216777",
  appId: "1:406978216777:web:48765a3712067db8269098",
  measurementId: "G-XLX8ZNBVZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Connect to emulators if in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment these lines if you want to use Firebase emulators
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

export default app;