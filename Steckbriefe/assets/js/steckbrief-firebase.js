import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const cfg = window.STECKBRIEF_CONFIG || {};
const fb = cfg.firebase || {};

const firebaseConfig = fb.config || {
  apiKey: "AIzaSyCgSej0WkSlkfAlySKZAdCyu4JjTNZEnYg",
  authDomain: "aleriaprojekt.firebaseapp.com",
  projectId: "aleriaprojekt",
  storageBucket: "aleriaprojekt.firebasestorage.app",
  messagingSenderId: "377039244960",
  appId: "1:377039244960:web:27ab9971f25657224403c5",
};

const data = window.STECKBRIEF_DATA || {};
const docId = fb.docId || cfg.docId || data.meta?.id || makeId(data);
const collectionName = fb.collection || "steckbriefe";
const appName = fb.appName || `steckbrief-${docId}`;

const app = initializeApp(firebaseConfig, appName);
const db = getFirestore(app);

window.SteckbriefFirebase = {
  docId,
  collectionName,
  async load() {
    const snap = await getDoc(doc(db, collectionName, docId));
    if (!snap.exists()) return null;
    return JSON.parse(snap.data().data || "{}");
  },
  async save(payload) {
    await setDoc(doc(db, collectionName, docId), {
      id: docId,
      type: "steckbrief",
      data: JSON.stringify(payload),
      hierarchy: payload.hierarchie || [],
      fullName: payload.name?.vollstaendig || "",
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },
  sub(cb) {
    return onSnapshot(doc(db, collectionName, docId), (snap) => {
      if (!snap.exists()) return;
      cb(JSON.parse(snap.data().data || "{}"));
    });
  },
};

window.dispatchEvent(new Event("steckbrief-firebase-ready"));

function makeId(payload) {
  const hierarchy = (payload.hierarchie || []).map((entry) => entry.name);
  const name = payload.name?.vollstaendig || "steckbrief";
  return [...hierarchy, name].filter(Boolean).join("-").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
