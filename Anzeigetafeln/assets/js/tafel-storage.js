(function () {
  const config = window.TAFEL_CONFIG || {};
  const storageConfig = config.storage || {};
  const legacyConfig = config.legacyFirebase || config.firebase || null;
  const boardId = config.boardId || 'template-tafel';
  const dataPath = storageConfig.dataPath || null;
  const draftKey = `aleria.tafeln.draft.${boardId}`;
  const endpoint = '/.netlify/functions/world-content-publisher';
  let publishedRevision = 0;
  let workingRevision = 0;
  let publishSessionKey = '';
  let loaded = false;
  let publishing = false;
  let knownDraft = null;
  let sourceIncomplete = false;
  let writeProblem = '';

  function setStatus(state) {
    const dot = document.getElementById('sdot');
    if (dot) dot.className = state;
    const label = document.getElementById('sync-label');
    if (label) {
      if (state === 'sv') label.textContent = 'wird lokal gesichert';
      else if (state === 'er') label.textContent = 'Speicherfehler';
      else label.textContent = sourceIncomplete
        ? readDraft() ? 'Altimport fehlt · Entwurf' : 'Altimport nicht verfügbar'
        : readDraft() ? 'lokaler Entwurf' : 'veröffentlicht';
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
    writeProblem = '';
    try {
      if (localStorage.getItem(draftKey) !== knownDraft) {
        writeProblem = 'Ein anderer Tab hat diesen Entwurf geändert. Bitte deinen Stand als JSON sichern und die Tafel neu öffnen.';
        return false;
      }
      const value = JSON.stringify({ basedOnRevision: workingRevision, savedAt: new Date().toISOString(), ...(sourceIncomplete ? { sourceIncomplete: true } : {}), state });
      localStorage.setItem(draftKey, value);
      knownDraft = value;
      window.dispatchEvent(new CustomEvent('aleria:tafel:draft-status', { detail: { hasDraft: true } }));
      return true;
    } catch (error) {
      console.warn('[tafel-storage] Lokaler Entwurf konnte nicht gespeichert werden:', error);
      writeProblem = 'Speichern fehlgeschlagen. Der lokale Speicher ist voll oder nicht verfügbar. Den Stand bitte als JSON sichern.';
      return false;
    }
  }

  function clearDraft() {
    try {
      if (localStorage.getItem(draftKey) !== knownDraft) return false;
      localStorage.removeItem(draftKey);
      knownDraft = null;
      window.dispatchEvent(new CustomEvent('aleria:tafel:draft-status', { detail: { hasDraft: false } }));
      return true;
    } catch {
      /* Der veröffentlichte Stand bleibt davon unberührt. */
    }
  }

  async function fetchPublished() {
    if (!dataPath) return null;
    try {
      const response = await fetch(dataPath, { cache: 'no-store' });
      return response.ok ? await response.json() : null;
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
      sourceIncomplete = true;
      return null;
    }
  }

  window._fb = {
    async saveAll(state) {
      if (!loaded) return false;
      setStatus('sv');
      if (!writeDraft(state)) {
        setStatus('er');
        window.TafelRuntime?.toast(writeProblem);
        return false;
      }
      setTimeout(() => setStatus(''), 250);
      return true;
    },
    sub(callback) {
      return (async () => {
        const [published, authored] = await Promise.all([
          fetchPublished(), window.TafelAuthoredNotices.load(storageConfig.authoredNoticesPath),
        ]);
        const withAuthored = state => window.TafelAuthoredNotices.merge(state, authored);
        publishedRevision = Math.max(0, Number(published?.revision || 0));
        workingRevision = publishedRevision;
        knownDraft = localStorage.getItem(draftKey);
        const draft = readDraft();
        if (draft?.state) {
          sourceIncomplete = Boolean(draft.sourceIncomplete);
          workingRevision = Math.max(0, Number(draft.basedOnRevision) || 0);
          if (published && Number(draft.basedOnRevision || 0) < publishedRevision) {
            window.setTimeout(() => window.TafelRuntime?.toast?.('Auf GitHub liegt eine neuere Fassung als dein lokaler Entwurf.'), 0);
          }
          loaded = true;
          callback(withAuthored(draft.state));
          setStatus('');
          return;
        }
        if (published?.state) {
          loaded = true;
          callback(withAuthored(published.state));
          setStatus('');
          return;
        }
        const legacyState = await fetchLegacyFirebase();
        // Migration may take time. A draft created by another tab takes priority.
        knownDraft = localStorage.getItem(draftKey);
        const lateDraft = readDraft();
        loaded = true;
        if (lateDraft?.state) {
          sourceIncomplete = Boolean(lateDraft.sourceIncomplete);
          workingRevision = Math.max(0, Number(lateDraft.basedOnRevision) || 0);
          callback(withAuthored(lateDraft.state));
          setStatus('');
          return;
        }
        if (legacyState) {
          const merged = withAuthored(legacyState);
          writeDraft(merged);
          callback(merged);
          window.setTimeout(() => window.TafelRuntime?.toast?.('Firebase-Altstand lokal gesichert · bitte online veröffentlichen'), 0);
        } else {
          callback(withAuthored({ zettel: [] }));
        }
        setStatus('');
      })();
    },
  };

  window.TafelPublish = Object.freeze({
    isConfigured: () => Boolean(dataPath),
    hasSession: () => Boolean(publishSessionKey),
    hasLocalDraft: () => Boolean(readDraft()),
    publishedRevision: () => publishedRevision,
    isReady: () => loaded,
    useImportedState: () => { sourceIncomplete = false; },
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
      if (!loaded) throw new Error('Die Tafel wird noch geladen.');
      if (sourceIncomplete) throw new Error('Der bisherige Firebase-Stand konnte nicht geladen werden. Veröffentlichung gesperrt: Bitte einen vollständigen JSON-Stand importieren. Dein lokaler Entwurf bleibt erhalten.');
      if (publishing) throw new Error('Eine Veröffentlichung läuft bereits.');
      if (!publishSessionKey) throw new Error('Bitte zuerst den Veröffentlichungsschlüssel eingeben.');
      if (!dataPath) throw new Error('Diese Tafel besitzt noch keinen dataPath.');
      if (localStorage.getItem(draftKey) !== knownDraft) throw new Error('Ein anderer Tab hat den Entwurf geändert. Bitte zuerst deinen Stand als JSON sichern.');
      const sent = JSON.parse(JSON.stringify(state));
      publishing = true;
      try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${publishSessionKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'anzeigetafeln', dataPath, state: sent, expectedRevision: workingRevision }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(payload.message || 'Veröffentlichung fehlgeschlagen.');
        error.status = response.status;
        throw error;
      }
      publishedRevision = payload.revision;
      workingRevision = payload.revision;
      const current = window.TafelState?.snapshot() || state;
      const stored = readDraft()?.state;
      if (JSON.stringify(current) === JSON.stringify(sent) && (!stored || JSON.stringify(stored) === JSON.stringify(sent))) clearDraft();
      else if (!writeDraft(current)) window.TafelRuntime?.toast('Online gespeichert; den neueren lokalen Stand bitte zusätzlich als JSON sichern.');
      setStatus('');
      return payload;
      } finally {
        publishing = false;
      }
    },
  });

  window.dispatchEvent(new Event('fb-ready'));
})();
