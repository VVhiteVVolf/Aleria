import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const cfg = window.TAFEL_CONFIG || {};
const fb = cfg.firebase || {};

const firebaseConfig = fb.config || {
  apiKey: "AIzaSyCgSej0WkSlkfAlySKZAdCyu4JjTNZEnYg",
  authDomain: "aleriaprojekt.firebaseapp.com",
  projectId: "aleriaprojekt",
  storageBucket: "aleriaprojekt.firebasestorage.app",
  messagingSenderId: "377039244960",
  appId: "1:377039244960:web:27ab9971f25657224403c5",
};

const boardId = cfg.boardId || "template-tafel";
const collection = fb.collection || "anzeigetafeln";
const docId = fb.docId || boardId;
const appName = fb.appName || `tafel-${boardId}`;
const legacy = fb.legacyImport || null;

const app = initializeApp(firebaseConfig, appName);
const db = getFirestore(app);

function sd(state) {
  const d = document.getElementById("sdot");
  if (d) d.className = state;
}

function saveData(data) {
  return setDoc(doc(db, collection, docId), {
    data: JSON.stringify(data),
    ts: serverTimestamp(),
  });
}

window._fb = {
  async saveAll(data) {
    sd("sv");
    try {
      await saveData(data);
      sd("");
    } catch (e) {
      console.error(e);
      sd("er");
    }
  },
  sub(cb) {
    let triedLegacy = false;
    onSnapshot(doc(db, collection, docId), async (snap) => {
      if (snap.exists()) {
        cb(JSON.parse(snap.data().data || "{}"));
        return;
      }
      if (!legacy?.migrateIfEmpty || triedLegacy) return;
      triedLegacy = true;
      try {
        const oldSnap = await getDoc(doc(db, legacy.collection, legacy.docId));
        if (!oldSnap.exists()) return;
        const oldData = JSON.parse(oldSnap.data().data || "{}");
        await saveData(oldData);
        cb(oldData);
      } catch (e) {
        console.error(e);
        sd("er");
      }
    });
  },
};

window.dispatchEvent(new Event("fb-ready"));
