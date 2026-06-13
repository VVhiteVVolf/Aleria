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
    return snap.exists() ? normalizeRemoteScene(snap.data()) : null;
  },
  async saveScene(ortId, sceneId, payload) {
    const scenePayload = normalizeScenePayload(payload);
    await setDoc(getSceneRef(ortId, sceneId), {
      id: getSceneDocId(ortId, sceneId),
      type: "orte-scene",
      ortId: String(ortId || ""),
      sceneId: String(sceneId || ""),
      title: scenePayload.title,
      threadId: scenePayload.threadId,
      schemaVersion: 1,
      data: JSON.stringify(scenePayload),
      updatedAtClient: Date.now(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },
  subscribeScene(ortId, sceneId, onNext, onError) {
    return onSnapshot(getSceneRef(ortId, sceneId), (snap) => {
      onNext(snap.exists() ? normalizeRemoteScene(snap.data()) : null);
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

function normalizeRemoteScene(data) {
  if (!data || typeof data !== "object") return null;

  if (typeof data.data === "string") {
    try {
      return normalizeScenePayload(JSON.parse(data.data));
    } catch (error) {
      return null;
    }
  }

  return normalizeScenePayload(data);
}

function normalizeScenePayload(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  return {
    title: String(source.title || ""),
    threadId: String(source.threadId || ""),
    blocks: normalizeBlocks(source.blocks),
  };
}

function normalizeBlocks(blocks) {
  return (Array.isArray(blocks) ? blocks : [])
    .map((block) => ({
      type: normalizeBlockType(block.type),
      speaker: String(block.speaker || ""),
      text: String(block.text || ""),
    }))
    .filter((block) => block.type === "divider" || block.text || block.speaker);
}

function normalizeBlockType(type) {
  const value = String(type || "intro");
  return ["intro", "speech", "action", "thought", "divider"].includes(value) ? value : "intro";
}
