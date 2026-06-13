import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { doc, getDoc, getFirestore, onSnapshot, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const scenesConfig = window.AleriaOrteScenes || {};
const fb = scenesConfig.inlineFirebase || {};

const firebaseConfig = fb.config || {
  apiKey: "AIzaSyCgSej0WkSlkfAlySKZAdCyu4JjTNZEnYg",
  authDomain: "aleriaprojekt.firebaseapp.com",
  projectId: "aleriaprojekt",
  storageBucket: "aleriaprojekt.firebasestorage.app",
  messagingSenderId: "377039244960",
  appId: "1:377039244960:web:27ab9971f25657224403c5",
};

const collectionName = fb.collection || "orte_inline_content";
const appName = fb.appName || "orte-inline-content";
const app = getApps().some((item) => item.name === appName)
  ? getApp(appName)
  : initializeApp(firebaseConfig, appName);
const db = getFirestore(app);

window.OrteInlineFirebase = {
  collectionName,
  async load(pageId) {
    const snap = await getDoc(getRef(pageId));
    return snap.exists() ? normalizePayload(snap.data()) : null;
  },
  async save(pageId, payload) {
    const normalized = normalizePayload(payload);
    await setDoc(getRef(pageId), {
      id: getDocId(pageId),
      type: "orte-inline-content",
      schemaVersion: 1,
      data: JSON.stringify(normalized),
      updatedAtClient: Date.now(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },
  subscribe(pageId, onNext, onError) {
    return onSnapshot(getRef(pageId), (snap) => {
      onNext(snap.exists() ? normalizePayload(snap.data()) : null);
    }, (error) => {
      if (onError) onError(error);
    });
  },
};

window.dispatchEvent(new Event("orte-inline-firebase-ready"));

function getRef(pageId) {
  return doc(db, collectionName, getDocId(pageId));
}

function getDocId(pageId) {
  return String(pageId || "grossstadt-vorlage")
    .trim()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "grossstadt-vorlage";
}

function normalizePayload(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  if (typeof source.data === "string") {
    try {
      return normalizePayload(JSON.parse(source.data));
    } catch (error) {
      return { texts: {}, images: {} };
    }
  }

  return {
    texts: normalizeTextRecord(source.texts),
    images: normalizeImageRecord(source.images),
  };
}

function normalizeTextRecord(record) {
  return Object.fromEntries(Object.entries(record && typeof record === "object" ? record : {})
    .map(([key, value]) => [String(key), String(value ?? "")]));
}

function normalizeImageRecord(record) {
  return Object.fromEntries(Object.entries(record && typeof record === "object" ? record : {})
    .map(([key, value]) => {
      const item = value && typeof value === "object" ? value : {};
      return [String(key), {
        src: String(item.src || ""),
        href: String(item.href || ""),
        alt: String(item.alt || ""),
      }];
    }));
}
