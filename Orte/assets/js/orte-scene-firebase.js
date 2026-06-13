import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { doc, getDoc, getFirestore, onSnapshot, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const scenesConfig = window.AleriaOrteScenes || {};
const fb = scenesConfig.firebase || {};

const firebaseConfig = fb.config || {
  apiKey: "AIzaSyCgSej0WkSlkfAlySKZAdCyu4JjTNZEnYg",
  authDomain: "aleriaprojekt.firebaseapp.com",
  projectId: "aleriaprojekt",
  storageBucket: "aleriaprojekt.firebasestorage.app",
  messagingSenderId: "377039244960",
  appId: "1:377039244960:web:27ab9971f25657224403c5",
};

const collectionName = fb.collection || "orte_scenes";
const appName = fb.appName || "orte-scenes";
const app = getApps().some((item) => item.name === appName)
  ? getApp(appName)
  : initializeApp(firebaseConfig, appName);
const db = getFirestore(app);

window.OrteSceneFirebase = {
  collectionName,
  async loadScene(ortId, sceneId) {
    const snap = await getDoc(getSceneRef(ortId, sceneId));
    return snap.exists() ? normalizeRemoteModule(snap.data()) : null;
  },
  async saveScene(ortId, sceneId, payload) {
    const modulePayload = normalizeModulePayload(payload);
    await setDoc(getSceneRef(ortId, sceneId), {
      id: getSceneDocId(ortId, sceneId),
      type: "orte-session-module",
      ortId: String(ortId || ""),
      sceneId: String(sceneId || ""),
      title: modulePayload.title,
      subtitle: modulePayload.subtitle,
      threadId: modulePayload.threadId,
      schemaVersion: 2,
      data: JSON.stringify(modulePayload),
      updatedAtClient: Date.now(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },
  subscribeScene(ortId, sceneId, onNext, onError) {
    return onSnapshot(getSceneRef(ortId, sceneId), (snap) => {
      onNext(snap.exists() ? normalizeRemoteModule(snap.data()) : null);
    }, (error) => {
      if (onError) onError(error);
    });
  },
};

window.dispatchEvent(new Event("orte-scenes-firebase-ready"));

function getSceneRef(ortId, sceneId) {
  return doc(db, collectionName, getSceneDocId(ortId, sceneId));
}

function getSceneDocId(ortId, sceneId) {
  return [ortId || "ort-vorlage", sceneId || "szene"]
    .map((part) => String(part).trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "leer")
    .join("__");
}

function normalizeRemoteModule(data) {
  if (!data || typeof data !== "object") return null;

  if (typeof data.data === "string") {
    try {
      return normalizeModulePayload(JSON.parse(data.data));
    } catch (error) {
      return null;
    }
  }

  return normalizeModulePayload(data);
}

function normalizeModulePayload(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  const page = source.page && typeof source.page === "object" ? source.page : {};

  return {
    id: String(source.id || ""),
    title: String(source.title || ""),
    subtitle: String(source.subtitle || ""),
    stamp: String(source.stamp || ""),
    image: String(source.image || ""),
    imageWidth: Number.isFinite(Number(source.imageWidth)) ? Number(source.imageWidth) : 36,
    threadId: String(source.threadId || ""),
    page: {
      pageTitle: String(page.pageTitle || ""),
      sessionPage: true,
      sessionIntro: String(page.sessionIntro || buildLegacySessionIntro(source.blocks)),
      sessionHint: String(page.sessionHint || ""),
      sessionEmptyTitle: String(page.sessionEmptyTitle || ""),
      sessionEmptyText: String(page.sessionEmptyText || "")
    }
  };
}

function buildLegacySessionIntro(blocks) {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      if (!block || typeof block !== "object") return "";
      const speaker = block.speaker || block.name;
      const text = String(block.text || "").trim();
      if (!text) return "";
      return speaker ? `${speaker}: ${text}` : text;
    })
    .filter(Boolean)
    .join("\n");
}
