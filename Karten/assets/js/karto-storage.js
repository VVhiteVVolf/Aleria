// Replaces karto-firebase.js. No database: the published state for a map
// is a plain JSON file committed to this repo (Karten/<...>/data.json);
// every edit autosaves instantly to localStorage as a local draft; an
// explicit "🌐 Online speichern" commits the draft to GitHub via the
// karten-publisher Netlify function (see netlify/functions/karten-publisher.mjs).
//
// Deliberately keeps the exact same window._fb.saveAll(data) / window._fb.sub(cb)
// shape the rest of karto-app.js already calls, and still dispatches
// 'fb-ready' once - so nothing else in this codebase needed to change to
// pick up the new storage backend. The "_fb" name is legacy (kept to avoid
// touching every call site); it is not Firebase.
(function () {
  const cfg = window.KARTO_CONFIG || {};
  const storageCfg = cfg.storage || {};
  // Relative to Karten/ (same convention as `folder`/`config`/`images` in
  // karten.registry.js), e.g. "Cenyr/celtigerns-wacht/data.json".
  const dataPath = storageCfg.dataPath || null;
  const mapId = cfg.mapId || 'template-map';
  const draftStorageKey = `karto.draft.${mapId}`;
  const PUBLISH_ENDPOINT = '/.netlify/functions/karten-publisher';

  let publishedRevision = 0;
  let publishSessionKey = '';
  let saveTimer = null;

  function sd(state) {
    const dot = document.getElementById('sdot');
    if (dot) dot.className = state;
  }

  function readDraft() {
    try {
      const raw = localStorage.getItem(draftStorageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('[karto-storage] Lokaler Entwurf konnte nicht gelesen werden:', error);
      return null;
    }
  }

  function writeDraft(state) {
    try {
      localStorage.setItem(
        draftStorageKey,
        JSON.stringify({ basedOnRevision: publishedRevision, savedAt: new Date().toISOString(), state }),
      );
    } catch (error) {
      console.warn('[karto-storage] Lokaler Entwurf konnte nicht gespeichert werden:', error);
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(draftStorageKey);
    } catch {
      /* ignore */
    }
  }

  async function fetchPublished() {
    if (!dataPath) return null;
    try {
      const response = await fetch(dataPath, { cache: 'no-store' });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.warn('[karto-storage] Veröffentlichte Kartendaten konnten nicht geladen werden:', error);
      return null;
    }
  }

  window._fb = {
    // Local-only: every edit lands in localStorage immediately (same
    // instant-feeling autosave the old Firestore debounce gave), but does
    // NOT leave the browser. Use "🌐 Online speichern" to commit it.
    async saveAll(state) {
      sd('sv');
      writeDraft(state);
      setTimeout(() => sd(''), 250);
    },
    sub(callback) {
      (async () => {
        const published = await fetchPublished();
        publishedRevision = Math.max(0, Number(published?.revision || 0));
        const draft = readDraft();
        if (draft) {
          if (published && draft.basedOnRevision < publishedRevision) {
            window.KartoRuntime?.toast?.(
              '⚠ Auf GitHub liegt eine neuere Fassung als dein lokaler Entwurf — beim Veröffentlichen ggf. Konflikt prüfen.',
            );
          }
          callback(draft.state || {});
          return;
        }
        if (published?.state) {
          callback(published.state);
        }
        // Neither draft nor published data exists yet (brand new map) -
        // leave karto-app.js's already-initialized defaults in place by
        // not calling back at all; applyState() only ever overwrites
        // fields that are actually present on what it's given.
      })();
    },
  };

  const STAGE_IMAGE_TYPES = { 'image/png': true, 'image/jpeg': true, 'image/webp': true };
  const STAGE_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

  window.KartoPublish = {
    isConfigured: () => !!dataPath,
    hasSession: () => !!publishSessionKey,
    publishedRevision: () => publishedRevision,

    // Turns a locally picked file into a data: URL that already works as
    // an <img src> right away (no network round-trip needed to preview or
    // even use it - the draft just holds the data URL, same as any other
    // local field). Only on "🌐 Online speichern" does karten-publisher.mjs
    // recognize the data: URL, write it as a real committed file under
    // Karten/assets/uploads/<mapId>/..., and rewrite the state to point at
    // that path instead. Until then it round-trips through localStorage
    // as-is, which is fine for icons/markers/small layer thumbnails but
    // not for full-resolution map backgrounds (keep using a hosted URL
    // for those - see the 4 MB cap below).
    stageImage(file) {
      return new Promise((resolve, reject) => {
        if (!file) { reject(new Error('Keine Datei ausgewählt.')); return; }
        if (!STAGE_IMAGE_TYPES[file.type]) {
          reject(new Error('Nur PNG, JPEG oder WebP werden unterstützt.'));
          return;
        }
        if (file.size > STAGE_IMAGE_MAX_BYTES) {
          reject(new Error('Das Bild ist größer als 4 MB. Für große Kartenbilder bitte weiterhin eine HTTPS-Adresse einbinden.'));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'));
        reader.readAsDataURL(file);
      });
    },

    async authenticate(key) {
      const candidate = String(key || '').trim();
      if (!candidate) throw new Error('Bitte den Veröffentlichungsschlüssel eingeben.');
      const response = await fetch(PUBLISH_ENDPOINT, {
        method: 'GET',
        headers: { Authorization: `Bearer ${candidate}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Anmeldung fehlgeschlagen.');
      publishSessionKey = candidate;
      return payload; // { repository, branch }
    },

    clearSession() {
      publishSessionKey = '';
    },

    async publish(state) {
      if (!publishSessionKey) throw new Error('Bitte zuerst den Veröffentlichungsschlüssel eingeben.');
      if (!dataPath) throw new Error('Diese Karte hat noch keinen dataPath in der Registry/Config hinterlegt.');
      const response = await fetch(PUBLISH_ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${publishSessionKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataPath, state, expectedRevision: publishedRevision }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(payload.message || 'Veröffentlichen fehlgeschlagen.');
        error.status = response.status;
        error.payload = payload;
        throw error;
      }
      publishedRevision = payload.revision;
      clearDraft();
      return payload; // { revision, updatedAt, commitSha, commitUrl }
    },
  };

  window.dispatchEvent(new Event('fb-ready'));
})();
