import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCZtuWWn33lCgCuon0bmqLNoVh6uh-Qh_Y",
  authDomain: "lab-memewall.firebaseapp.com",
  projectId: "lab-memewall",
  storageBucket: "lab-memewall.firebasestorage.app",
  messagingSenderId: "471379921727",
  appId: "1:471379921727:web:e11864f5447834408ce18a",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};
