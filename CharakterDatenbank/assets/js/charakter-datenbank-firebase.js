import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgSej0WkSlkfAlySKZAdCyu4JjTNZEnYg",
  authDomain: "aleriaprojekt.firebaseapp.com",
  projectId: "aleriaprojekt",
  storageBucket: "aleriaprojekt.firebasestorage.app",
  messagingSenderId: "377039244960",
  appId: "1:377039244960:web:27ab9971f25657224403c5",
};

const app = initializeApp(firebaseConfig, "charakter-datenbank");
const db = getFirestore(app);
const collectionName = "characters";

window.CharacterDB = {
  async loadAll() {
    const snap = await getDocs(collection(db, collectionName));
    return snap.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
  }
};

window.dispatchEvent(new Event("character-db-ready"));
