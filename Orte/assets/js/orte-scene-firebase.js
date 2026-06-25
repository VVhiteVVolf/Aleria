import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { deleteDoc, doc, getDoc, getFirestore, onSnapshot, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
  async deleteScene(ortId, sceneId) {
    await deleteDoc(getSceneRef(ortId, sceneId));
  },
  subscribeScene(ortId, sceneId, onNext, onError) {
    return onSnapshot(getSceneRef(ortId, sceneId), (snap) => {
      onNext(snap.exists() ? normalizeRemoteModule(snap.data()) : null);
    }, (error) => {
      if (onError) onError(error);
    });
  },
  async loadSceneIndex(ortId) {
    const snap = await getDoc(getSceneIndexRef(ortId));
    return snap.exists() ? normalizeSceneIndex(snap.data()) : null;
  },
  async saveSceneIndex(ortId, payload) {
    const indexPayload = normalizeSceneIndex(payload);
    await setDoc(getSceneIndexRef(ortId), {
      id: getSceneIndexDocId(ortId),
      type: "orte-session-index",
      ortId: String(ortId || ""),
      schemaVersion: 1,
      data: JSON.stringify(indexPayload),
      updatedAtClient: Date.now(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },
  async deleteSceneIndex(ortId) {
    await deleteDoc(getSceneIndexRef(ortId));
  },
  subscribeSceneIndex(ortId, onNext, onError) {
    return onSnapshot(getSceneIndexRef(ortId), (snap) => {
      onNext(snap.exists() ? normalizeSceneIndex(snap.data()) : null);
    }, (error) => {
      if (onError) onError(error);
    });
  },
};

window.dispatchEvent(new Event("orte-scenes-firebase-ready"));

function getSceneRef(ortId, sceneId) {
  return doc(db, collectionName, getSceneDocId(ortId, sceneId));
}

function getSceneIndexRef(ortId) {
  return doc(db, collectionName, getSceneIndexDocId(ortId));
}

function getSceneIndexDocId(ortId) {
  return `${normalizeIdPart(ortId || "ort-vorlage")}__scene-index`;
}

function getSceneDocId(ortId, sceneId) {
  return [ortId || "ort-vorlage", sceneId || "szene"]
    .map((part) => normalizeIdPart(part))
    .join("__");
}

function normalizeIdPart(part) {
  return String(part).trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "leer";
}

function normalizeRemoteModule(data) {
  if (!data || typeof data !== "object") return null;
  const remoteUpdatedAtClient = Number(data.updatedAtClient) || 0;
  let modulePayload = null;

  if (typeof data.data === "string") {
    try {
      modulePayload = normalizeModulePayload(JSON.parse(data.data));
    } catch (error) {
      return null;
    }
  } else {
    modulePayload = normalizeModulePayload(data);
  }

  return {
    ...modulePayload,
    _remoteUpdatedAtClient: remoteUpdatedAtClient
  };
}

function normalizeModulePayload(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  const pageSources = Array.isArray(source.pages) && source.pages.length
    ? source.pages
    : [source.page && typeof source.page === "object" ? source.page : {}];
  const pages = pageSources.map((page, index) => normalizeModulePage(page, source, index));
  const firstPage = pages[0] || normalizeModulePage({}, source, 0);

  return {
    id: String(source.id || ""),
    title: String(source.title || ""),
    subtitle: String(source.subtitle || ""),
    stamp: String(source.stamp || ""),
    image: String(source.image || firstPage.image || ""),
    imageWidth: Number.isFinite(Number(source.imageWidth ?? firstPage.imageWidth)) ? Number(source.imageWidth ?? firstPage.imageWidth) : 36,
    threadId: String(source.threadId || ""),
    sessionCast: Array.isArray(source.sessionCast) ? source.sessionCast : [],
    sessionCastDetails: Array.isArray(source.sessionCastDetails) ? source.sessionCastDetails : [],
    page: firstPage,
    pages
  };
}

function normalizeModulePage(pageSource, source, index) {
  const page = pageSource && typeof pageSource === "object" ? pageSource : {};
  const isFirst = index === 0;
  const fallbackIntro = isFirst ? buildLegacySessionIntro(source.blocks) : "";
  const imageWidthSource = page.imageWidth ?? source.imageWidth;

  return {
    ...page,
    pageTitle: String(page.pageTitle || (isFirst ? source.pageTitle : "") || ""),
    sessionPage: true,
    image: String(page.image || (isFirst ? source.image : "") || ""),
    imageWidth: Number.isFinite(Number(imageWidthSource)) ? Number(imageWidthSource) : 36,
    imageFit: normalizeImageFit(page.imageFit || source.imageFit),
    imagePosition: normalizeImagePosition(page.imagePosition || source.imagePosition),
    imageSquare: !!(page.imageSquare || source.imageSquare),
    imageLandscape: !!(page.imageLandscape || source.imageLandscape),
    imageSemiLandscape: !!(page.imageSemiLandscape || source.imageSemiLandscape),
    imageTall: !!(page.imageTall || source.imageTall),
    sessionIntro: String(page.sessionIntro || (isFirst ? source.sessionIntro : "") || fallbackIntro),
    sessionHint: String(page.sessionHint || (isFirst ? source.sessionHint : "")),
    sessionEmptyTitle: String(page.sessionEmptyTitle || (isFirst ? source.sessionEmptyTitle : "")),
    sessionEmptyText: String(page.sessionEmptyText || (isFirst ? source.sessionEmptyText : "")),
    commentThreadKey: String(page.commentThreadKey || (isFirst ? source.commentThreadKey : "") || source.sceneId || source.id || "")
  };
}

function normalizeImageFit(value) {
  const safe = String(value || "").trim();
  return ["cover", "contain"].includes(safe) ? safe : "";
}

function normalizeImagePosition(value) {
  const safe = String(value || "").trim();
  return ["top", "center", "bottom", "left", "right"].includes(safe) ? safe : "";
}

function normalizeSceneIndex(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  if (typeof source.data === "string") {
    try {
      const parsed = normalizeSceneIndex(JSON.parse(source.data));
      parsed._remoteUpdatedAtClient = Number(source.updatedAtClient) || 0;
      return parsed;
    } catch (error) {
      return { schemaVersion: 1, order: [] };
    }
  }

  const order = Array.isArray(source.order)
    ? source.order.map((id) => String(id || "").trim()).filter(Boolean)
    : [];
  return {
    schemaVersion: 1,
    order: Array.from(new Set(order)),
    _remoteUpdatedAtClient: Number(source.updatedAtClient) || 0,
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
