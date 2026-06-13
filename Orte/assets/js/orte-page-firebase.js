import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { doc, getDoc, getFirestore, onSnapshot, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const scenesConfig = window.AleriaOrteScenes || {};
const fb = scenesConfig.pageFirebase || scenesConfig.firebase || {};

const firebaseConfig = fb.config || {
  apiKey: "AIzaSyCgSej0WkSlkfAlySKZAdCyu4JjTNZEnYg",
  authDomain: "aleriaprojekt.firebaseapp.com",
  projectId: "aleriaprojekt",
  storageBucket: "aleriaprojekt.firebasestorage.app",
  messagingSenderId: "377039244960",
  appId: "1:377039244960:web:27ab9971f25657224403c5",
};

const collectionName = fb.pageCollection || "orte_pages";
const appName = fb.pageAppName || "orte-pages";
const app = getApps().some((item) => item.name === appName)
  ? getApp(appName)
  : initializeApp(firebaseConfig, appName);
const db = getFirestore(app);

window.OrtePageFirebase = {
  collectionName,
  async loadPage(pageId) {
    const snap = await getDoc(getPageRef(pageId));
    return snap.exists() ? normalizePayload(snap.data()) : null;
  },
  async savePage(pageId, payload) {
    const normalized = normalizePayload(payload);
    await setDoc(getPageRef(pageId), {
      id: getPageDocId(pageId),
      type: "orte-page",
      schemaVersion: 1,
      data: JSON.stringify(normalized),
      updatedAtClient: Date.now(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },
  subscribePage(pageId, onNext, onError) {
    return onSnapshot(getPageRef(pageId), (snap) => {
      onNext(snap.exists() ? normalizePayload(snap.data()) : null);
    }, (error) => {
      if (onError) onError(error);
    });
  },
};

window.dispatchEvent(new Event("orte-page-firebase-ready"));

function getPageRef(pageId) {
  return doc(db, collectionName, getPageDocId(pageId));
}

function getPageDocId(pageId) {
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
    texts: normalizeRecord(source.texts),
    images: normalizeImageRecord(source.images),
  };
}

function normalizeRecord(record) {
  return Object.fromEntries(Object.entries(record && typeof record === "object" ? record : {})
    .map(([key, value]) => [String(key), String(value ?? "")]));
}

function normalizeImageRecord(record) {
  return Object.fromEntries(Object.entries(record && typeof record === "object" ? record : {})
    .map(([key, value]) => {
      const item = value && typeof value === "object" ? value : {};
      return [String(key), {
        src: String(item.src || ""),
        alt: String(item.alt || ""),
        href: String(item.href || ""),
      }];
    }));
}
