(function () {
  const config = window.TAFEL_CONFIG || {};
  const storageConfig = config.storage || {};
  const legacyConfig = config.legacyFirebase || config.firebase || null;
  const boardId = config.boardId || 'template-tafel';
  const dataPath = storageConfig.dataPath || null;
  const draftKey = `aleria.tafeln.draft.${boardId}`;
  const endpoint = '/.netlify/functions/world-content-publisher';
  let publishedRevision = 0;
  let publishSessionKey = '';

  function setStatus(state) {
    const dot = document.getElementById('sdot');
    if (dot) dot.className = state;
    const label = document.getElementById('sync-label');
    if (label) {
      if (state === 'sv') label.textContent = 'wird lokal gesichert';
      else if (state === 'er') label.textContent = 'Speicherfehler';
      else label.textContent = readDraft() ? 'lokaler Entwurf' : 'veröffentlicht';
    }
  }

  function readDraft() {
    try {
      const value = localStorage.getItem(draftKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('[tafel-storage] Lokaler Entwurf konnte nicht gelesen werden:', error);
      return null;
    }
  }

  function writeDraft(state) {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ basedOnRevision: publishedRevision, savedAt: new Date().toISOString(), state }));
      window.dispatchEvent(new CustomEvent('aleria:tafel:draft-status', { detail: { hasDraft: true } }));
    } catch (error) {
      console.warn('[tafel-storage] Lokaler Entwurf konnte nicht gespeichert werden:', error);
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(draftKey);
      window.dispatchEvent(new CustomEvent('aleria:tafel:draft-status', { detail: { hasDraft: false } }));
    } catch {
      /* Der veröffentlichte Stand bleibt davon unberührt. */
    }
  }

  async function fetchPublished() {
    if (!dataPath) return null;
    try {
      const response = await fetch(dataPath, { cache: 'no-store' });
      return response.ok ? response.json() : null;
    } catch (error) {
      console.warn('[tafel-storage] GitHub-Fassung konnte nicht geladen werden:', error);
      return null;
    }
  }

  async function fetchLegacyFirebase() {
    if (!legacyConfig?.docId) return null;
    try {
      const [appModule, firestoreModule] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'),
      ]);
      const firebaseConfig = legacyConfig.config || {
        apiKey: 'AIzaSyCgSej0WkSlkfAlySKZAdCyu4JjTNZEnYg',
        authDomain: 'aleriaprojekt.firebaseapp.com',
        projectId: 'aleriaprojekt',
        storageBucket: 'aleriaprojekt.firebasestorage.app',
        messagingSenderId: '377039244960',
        appId: '1:377039244960:web:27ab9971f25657224403c5',
      };
      const appName = `tafel-readonly-migration-${boardId}`;
      const existing = appModule.getApps().find(app => app.name === appName);
      const app = existing || appModule.initializeApp(firebaseConfig, appName);
      const database = firestoreModule.getFirestore(app);
      const snapshot = await firestoreModule.getDoc(firestoreModule.doc(
        database,
        legacyConfig.collection || 'anzeigetafeln',
        legacyConfig.docId,
      ));
      if (!snapshot.exists()) return null;
      const value = snapshot.data()?.data;
      return typeof value === 'string' ? JSON.parse(value) : value || null;
    } catch (error) {
      console.warn('[tafel-storage] Alte Firebase-Fassung ist nicht lesbar:', error);
      return null;
    }
  }

  window._fb = {
    async saveAll(state) {
      setStatus('sv');
      writeDraft(state);
      setTimeout(() => setStatus(''), 250);
    },
    sub(callback) {
      (async () => {
        const published = await fetchPublished();
        publishedRevision = Math.max(0, Number(published?.revision || 0));
        const draft = readDraft();
        if (draft?.state) {
          if (published && Number(draft.basedOnRevision || 0) < publishedRevision) {
            window.setTimeout(() => window.TafelRuntime?.toast?.('Auf GitHub liegt eine neuere Fassung als dein lokaler Entwurf.'), 0);
          }
          callback(draft.state);
          setStatus('');
          return;
        }
        if (published?.state) {
          callback(published.state);
          setStatus('');
          return;
        }
        const legacyState = await fetchLegacyFirebase();
        if (legacyState) {
          writeDraft(legacyState);
          callback(legacyState);
          window.setTimeout(() => window.TafelRuntime?.toast?.('Firebase-Altstand lokal gesichert · bitte online veröffentlichen'), 0);
        }
      })();
    },
  };

  window.TafelPublish = Object.freeze({
    isConfigured: () => Boolean(dataPath),
    hasSession: () => Boolean(publishSessionKey),
    hasLocalDraft: () => Boolean(readDraft()),
    publishedRevision: () => publishedRevision,
    async authenticate(key) {
      const candidate = String(key || '').trim();
      if (!candidate) throw new Error('Bitte den Veröffentlichungsschlüssel eingeben.');
      const response = await fetch(endpoint, { method: 'GET', headers: { Authorization: `Bearer ${candidate}` } });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Anmeldung fehlgeschlagen.');
      publishSessionKey = candidate;
      return payload;
    },
    clearSession() {
      publishSessionKey = '';
    },
    async publish(state) {
      if (!publishSessionKey) throw new Error('Bitte zuerst den Veröffentlichungsschlüssel eingeben.');
      if (!dataPath) throw new Error('Diese Tafel besitzt noch keinen dataPath.');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${publishSessionKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'anzeigetafeln', dataPath, state, expectedRevision: publishedRevision }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(payload.message || 'Veröffentlichung fehlgeschlagen.');
        error.status = response.status;
        throw error;
      }
      publishedRevision = payload.revision;
      clearDraft();
      setStatus('');
      return payload;
    },
  });

  window.dispatchEvent(new Event('fb-ready'));
})();
