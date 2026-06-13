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
      return { texts: {}, images: {}, ratings: {}, tables: {} };
    }
  }

  return {
    contentSchemaVersion: Number(source.contentSchemaVersion) || 0,
    texts: normalizeTextRecord(source.texts),
    images: normalizeImageRecord(source.images),
    ratings: normalizeRatingRecord(source.ratings),
    tables: normalizeTextRecord(source.tables),
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
        src: normalizePlaceholderSrc(item.src),
        href: String(item.href || ""),
        alt: String(item.alt || ""),
        width: clampNumber(item.width, 20, 100, 100),
        maxHeight: clampNumber(item.maxHeight, 80, 720, 260),
        format: ["auto", "square", "portrait", "landscape", "banner"].includes(item.format) ? item.format : "auto",
        fit: ["contain", "cover"].includes(item.fit) ? item.fit : "contain",
      }];
    }));
}

function normalizeRatingRecord(record) {
  return Object.fromEntries(Object.entries(record && typeof record === "object" ? record : {})
    .map(([key, value]) => {
      const number = Number(value);
      const rating = Number.isFinite(number) ? Math.max(1, Math.min(5, Math.round(number))) : 3;
      return [String(key), rating];
    }));
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function normalizePlaceholderSrc(src) {
  const value = String(src || "");
  const lower = value.toLowerCase();
  if (lower.includes("tumblr_otwjgn7mfu1wwqdobo1_1280")) return "";
  if (lower.includes("66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10")) return "";
  if (lower.endsWith("/w5rerk3.png")) return "";
  return value;
}
