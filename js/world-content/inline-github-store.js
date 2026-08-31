(function () {
  const endpoint = '/.netlify/functions/world-content-publisher';
  const firebaseDefaults = Object.freeze({ apiKey: 'AIzaSyCgSej0WkSlkfAlySKZAdCyu4JjTNZEnYg', authDomain: 'aleriaprojekt.firebaseapp.com', projectId: 'aleriaprojekt', storageBucket: 'aleriaprojekt.firebasestorage.app', messagingSenderId: '377039244960', appId: '1:377039244960:web:27ab9971f25657224403c5' });
  function create(options) {
    const { scope, pageId, contentPath, resolvePath, legacyFirebase, legacyPageId = pageId, contentExportPath = '', draftNamespace = scope, resetPayload = null } = options;
    const draftKey = `aleria.${draftNamespace}.github-draft.${pageId}`;
    let revision = 0;
    let publishKey = '';
    function readDraft() { try { return JSON.parse(localStorage.getItem(draftKey) || 'null'); } catch { return null; } }
    function writeDraft(payload) { localStorage.setItem(draftKey, JSON.stringify({ basedOnRevision: revision, savedAt: new Date().toISOString(), payload })); }
    async function readPublished() {
      if (!contentPath) return null;
      const response = await fetch(resolvePath(contentPath), { cache: 'no-store' });
      if (!response.ok) return null;
      const envelope = await response.json();
      revision = Math.max(0, Number(envelope?.revision || 0));
      return envelope?.state || null;
    }
    async function readExport() {
      if (!contentExportPath) return null;
      try { const response = await fetch(resolvePath(contentExportPath), { cache: 'no-store' }); if (!response.ok) return null; const value = await response.json(); return value?.data && typeof value.data === 'object' ? value.data : value; }
      catch (error) { console.warn(`[${scope}-storage] Inhaltsexport nicht lesbar:`, error); return null; }
    }
    async function readLegacy() {
      if (!legacyFirebase?.collection) return null;
      try {
        const [appModule, firestoreModule] = await Promise.all([import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'), import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js')]);
        const appName = `${scope}-readonly-${pageId}`;
        const app = appModule.getApps().find(item => item.name === appName) || appModule.initializeApp(legacyFirebase.config || firebaseDefaults, appName);
        const snapshot = await firestoreModule.getDoc(firestoreModule.doc(firestoreModule.getFirestore(app), legacyFirebase.collection, legacyPageId));
        if (!snapshot.exists()) return null;
        const data = snapshot.data()?.data;
        return typeof data === 'string' ? JSON.parse(data) : data || null;
      } catch (error) { console.warn(`[${scope}-storage] Firebase-Altstand nicht lesbar:`, error); return null; }
    }
    async function sourcePayload() { return readDraft()?.payload || await readPublished() || await readExport() || await readLegacy(); }
    async function authenticate() {
      if (publishKey) return;
      const candidate = window.prompt('Veröffentlichungsschlüssel eingeben:');
      if (!candidate) throw new Error('Online speichern abgebrochen.');
      const response = await fetch(endpoint, { method: 'GET', headers: { Authorization: `Bearer ${candidate.trim()}` } });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Anmeldung fehlgeschlagen.');
      publishKey = candidate.trim();
    }
    return Object.freeze({
      persistenceMode: 'draft-publish',
      async load() { return sourcePayload(); }, async save(unusedPageId, payload) { writeDraft(payload); },
      async reset() { writeDraft(resetPayload || { contentSchemaVersion: 0, texts: {}, images: {}, ratings: {}, tables: {}, hiddenSections: {} }); },
      subscribe(unusedPageId, onNext, onError) { let active = true; sourcePayload().then(payload => { if (active) onNext(payload); }).catch(error => { if (active && onError) onError(error); }); return () => { active = false; }; },
      async publish(unusedPageId, payload) {
        if (!contentPath) throw new Error('Für diese Seite fehlt der contentData-Pfad.');
        await authenticate();
        const response = await fetch(endpoint, { method: 'POST', headers: { Authorization: `Bearer ${publishKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ scope, dataPath: contentPath, state: payload, expectedRevision: revision }) });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) { const error = new Error(body.message || 'Veröffentlichung fehlgeschlagen.'); error.status = response.status; throw error; }
        revision = body.revision; localStorage.removeItem(draftKey); return body;
      },
    });
  }
  window.AleriaInlineGitHubStore = Object.freeze({ create });
})();
