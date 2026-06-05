import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const collectionName = "characterDatabase";

window.CharacterDB = {
  async loadAll() {
    const snap = await getDocs(collection(db, collectionName));
    return snap.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
  },
  async upsert(character) {
    const id = character.id || makeCharacterId(character);
    await setDoc(doc(db, collectionName, id), {
      ...character,
      id,
      type: "character",
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return id;
  },
};

function makeCharacterId(character) {
  const parts = [
    character.land,
    character.county,
    character.barony,
    character.settlement,
    character.fullName || `${character.name || ""} ${character.surname || ""}`,
  ];
  return parts.filter(Boolean).join("-").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

window.dispatchEvent(new Event("character-db-ready"));
