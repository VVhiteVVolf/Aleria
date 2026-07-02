import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { deleteDoc, doc, getDoc, getFirestore, onSnapshot, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const config = window.AleriaOrteScenes?.inlineFirebase || {};
const firebaseConfig = config.config || {
  apiKey: "AIzaSyCgSej0WkSlkfAlySKZAdCyu4JjTNZEnYg",
  authDomain: "aleriaprojekt.firebaseapp.com",
  projectId: "aleriaprojekt",
  storageBucket: "aleriaprojekt.firebasestorage.app",
  messagingSenderId: "377039244960",
  appId: "1:377039244960:web:27ab9971f25657224403c5",
};

const appName = config.marketAppName || "orte-market-modules";
const collectionName = config.marketCollection || "orte_market_modules";
const app = getApps().some((item) => item.name === appName)
  ? getApp(appName)
  : initializeApp(firebaseConfig, appName);
const db = getFirestore(app);

window.OrteMarketFirebase = {
  collectionName,
  async load(pageId) {
    const snap = await getDoc(getRef(pageId));
    return snap.exists() ? normalizePayload(snap.data()) : null;
  },
  async save(pageId, payload) {
    const normalized = normalizePayload(payload);
    await setDoc(getRef(pageId), {
      id: getDocId(pageId),
      type: "orte-market-modules",
      schemaVersion: 1,
      data: JSON.stringify(normalized),
      updatedAtClient: Date.now(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },
  async reset(pageId) {
    await deleteDoc(getRef(pageId));
  },
  subscribe(pageId, onNext, onError) {
    return onSnapshot(getRef(pageId), (snap) => {
      onNext(snap.exists() ? normalizePayload(snap.data()) : null);
    }, (error) => {
      if (onError) onError(error);
    });
  },
};

window.dispatchEvent(new Event("orte-market-firebase-ready"));

function getRef(pageId) {
  return doc(db, collectionName, getDocId(pageId));
}

function getDocId(pageId) {
  return String(pageId || "zunfts-vorlage")
    .trim()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "zunfts-vorlage";
}

function normalizePayload(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  if (typeof source.data === "string") {
    try {
      return normalizePayload(JSON.parse(source.data));
    } catch {
      return { modules: [] };
    }
  }
  return {
    schemaVersion: Number(source.schemaVersion) || 1,
    savedAtClient: Number(source.savedAtClient || source.updatedAtClient) || 0,
    modules: Array.isArray(source.modules) ? source.modules : [],
  };
}
