(function () {
  const config = window.AleriaOrteScenes || {};
  const entry = window.ORTE_CONFIG?.registryEntry || {};
  const ortId = config.ortId || window.ORTE_CONFIG?.docId || 'grossstadt-vorlage';
  const loaderUrl = document.querySelector('script[src*="orte-loader.js"]')?.src || document.baseURI;
  const documentStore = window.AleriaInlineGitHubStore.create({
    scope: 'orte', pageId: `${ortId}-scenes`, contentPath: entry.sceneData || '', draftNamespace: 'orte-scenes',
    resolvePath: path => new URL(`../../${path}`, loaderUrl).toString(),
  });
  let aggregate = null;
  let loading = null;
  const listeners = new Set();

  function emptyState() { return { schemaVersion: 1, savedAtClient: 0, index: { order: [] }, scenes: {} }; }
  async function ensureLoaded() {
    if (aggregate) return aggregate;
    if (!loading) loading = documentStore.load().then(value => value || readLegacy()).then(value => {
      aggregate = value && typeof value === 'object' ? value : emptyState();
      aggregate.index ||= { order: [] }; aggregate.scenes ||= {};
      return aggregate;
    });
    return loading;
  }
  async function persist() {
    aggregate.savedAtClient = Date.now();
    await documentStore.save(ortId, aggregate);
    listeners.forEach(listener => listener());
  }
  async function readLegacy() {
    try {
      const [apps, firestore] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js')
      ]);
      const defaults = { apiKey: 'AIzaSyCgSej0WkSlkfAlySKZAdCyu4JjTNZEnYg', authDomain: 'aleriaprojekt.firebaseapp.com', projectId: 'aleriaprojekt', storageBucket: 'aleriaprojekt.firebasestorage.app', messagingSenderId: '377039244960', appId: '1:377039244960:web:27ab9971f25657224403c5' };
      const name = `orte-scenes-readonly-${ortId}`;
      const app = apps.getApps().find(item => item.name === name) || apps.initializeApp(config.firebase?.config || defaults, name);
      const db = firestore.getFirestore(app);
      const collection = config.firebase?.collection || 'orte_scenes';
      const indexSnap = await firestore.getDoc(firestore.doc(db, collection, `${normalizeId(ortId)}__scene-index`));
      if (!indexSnap.exists()) return null;
      const index = parseLegacy(indexSnap.data()) || { order: [] };
      const scenes = {};
      await Promise.all((index.order || []).map(async sceneId => {
        const snap = await firestore.getDoc(firestore.doc(db, collection, `${normalizeId(ortId)}__${normalizeId(sceneId)}`));
        if (snap.exists()) scenes[sceneId] = parseLegacy(snap.data());
      }));
      return { schemaVersion: 1, savedAtClient: Date.now(), index, scenes };
    } catch (error) { console.warn('[orte-scenes-storage] Firebase-Altstand nicht lesbar:', error); return null; }
  }
  function parseLegacy(value) { try { return typeof value?.data === 'string' ? JSON.parse(value.data) : value?.data || value || null; } catch { return null; } }
  function normalizeId(value) { return String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'leer'; }
  function emitScene(sceneId, callback) { callback(aggregate.scenes[sceneId] ? { ...aggregate.scenes[sceneId], _remoteUpdatedAtClient: aggregate.savedAtClient || 0 } : null); }

  window.OrteSceneFirebase = Object.freeze({
    persistenceMode: 'draft-publish',
    async loadScene(unusedOrtId, sceneId) { await ensureLoaded(); return aggregate.scenes[sceneId] || null; },
    async saveScene(unusedOrtId, sceneId, payload) { await ensureLoaded(); aggregate.scenes[sceneId] = payload; await persist(); },
    async deleteScene(unusedOrtId, sceneId) { await ensureLoaded(); delete aggregate.scenes[sceneId]; await persist(); },
    subscribeScene(unusedOrtId, sceneId, onNext, onError) { let active = true; ensureLoaded().then(() => { if (active) emitScene(sceneId, onNext); }).catch(onError); const listener = () => active && emitScene(sceneId, onNext); listeners.add(listener); return () => { active = false; listeners.delete(listener); }; },
    async loadSceneIndex() { await ensureLoaded(); return aggregate.index; },
    async saveSceneIndex(unusedOrtId, payload) { await ensureLoaded(); aggregate.index = payload; await persist(); },
    async deleteSceneIndex() { await ensureLoaded(); aggregate.index = { order: [] }; await persist(); },
    subscribeSceneIndex(unusedOrtId, onNext, onError) { let active = true; ensureLoaded().then(() => { if (active) onNext({ ...aggregate.index, _remoteUpdatedAtClient: aggregate.savedAtClient || 0 }); }).catch(onError); const listener = () => active && onNext({ ...aggregate.index, _remoteUpdatedAtClient: aggregate.savedAtClient || 0 }); listeners.add(listener); return () => { active = false; listeners.delete(listener); }; },
    async publish() { await ensureLoaded(); return documentStore.publish(ortId, aggregate); }
  });
  window.dispatchEvent(new Event('orte-scenes-firebase-ready'));
})();
