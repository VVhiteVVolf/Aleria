import { FamilyRevisionConflictError } from './firestore-family-repository.js';
import { createFamilySyncStatusUi } from './family-sync-status-ui.js';

const SAVE_DELAY_MS = 900;

function sameFamily(first, second) {
  return JSON.stringify(first) === JSON.stringify(second);
}

export function createFamilySyncController({
  store,
  localRepository,
  cloudRepository,
  authService,
  documentRef = document,
  runtime = globalThis,
  editing = false
}) {
  const ui = createFamilySyncStatusUi(documentRef);
  let user = null;
  let remoteBase = null;
  let remoteRevision = 0;
  let pendingRemote = null;
  let dirty = false;
  let saving = false;
  let destroyed = false;
  let saveTimer = null;
  let retryDelay = 2000;
  let unsubscribeStore = null;
  let unsubscribeAuth = null;
  let unsubscribeRemote = null;

  function renderStatus(phase, message) {
    ui.render({ phase, user, message });
    const localStatus = documentRef.getElementById('save-status');
    if (localStatus) localStatus.textContent = message;
  }

  function persistLocally(family) {
    const saved = localRepository.persistCurrent(family);
    if (!user) {
      renderStatus(saved ? 'local' : 'error', saved ? 'Lokal gespeichert' : 'Lokale Speicherung nicht verfügbar');
    }
    return saved;
  }

  function cancelScheduledSave() {
    if (saveTimer !== null) runtime.clearTimeout(saveTimer);
    saveTimer = null;
  }

  function scheduleSave(delay = SAVE_DELAY_MS) {
    cancelScheduledSave();
    if (!editing || !user || pendingRemote || saving || destroyed) return;
    saveTimer = runtime.setTimeout(() => {
      saveTimer = null;
      void saveNow();
    }, delay);
  }

  async function saveNow() {
    if (!editing || !user || pendingRemote || saving || !dirty || destroyed) return;
    saving = true;
    const familyToSave = store.getState().family;
    if (remoteBase && sameFamily(remoteBase, familyToSave)) {
      dirty = false;
      saving = false;
      renderStatus('synced', `Cloud unverändert · Revision ${remoteRevision}`);
      return;
    }
    renderStatus('saving', 'Speichert in Firebase …');
    try {
      const result = await cloudRepository.saveDraft({
        family: familyToSave,
        baseFamily: remoteBase,
        expectedRevision: remoteRevision
      });
      remoteBase = result.family;
      remoteRevision = result.revision;
      retryDelay = 2000;
      dirty = !sameFamily(store.getState().family, familyToSave);
      renderStatus(dirty ? 'pending' : 'synced', dirty ? 'Weitere Änderungen ausstehend' : `Cloud gespeichert · Revision ${remoteRevision}`);
    } catch (error) {
      if (error instanceof FamilyRevisionConflictError) {
        pendingRemote = await cloudRepository.loadDraft(familyToSave.document.id);
        renderStatus('conflict', 'Speicherkonflikt · Entscheidung erforderlich');
        ui.open();
      } else {
        renderStatus('offline', 'Nur lokal · Firebase derzeit nicht erreichbar');
        retryDelay = Math.min(retryDelay * 2, 30000);
      }
    } finally {
      saving = false;
      if (dirty && !pendingRemote) scheduleSave(retryDelay);
    }
  }

  async function watchRemote(familyId) {
    unsubscribeRemote?.();
    unsubscribeRemote = await cloudRepository.watchDraftMetadata(familyId, metadata => {
      if (!metadata || metadata.revision <= remoteRevision || destroyed) return;
      if (saving && metadata.updatedBy === user?.uid && metadata.revision === remoteRevision + 1) return;
      void cloudRepository.loadDraft(familyId).then(record => {
        if (!record || record.revision <= remoteRevision || destroyed) return;
        if (dirty || saving) {
          pendingRemote = record;
          renderStatus('conflict', 'Neue Cloud-Fassung vorhanden · Entscheidung erforderlich');
          return;
        }
        applyRemote(record);
      }).catch(() => renderStatus('offline', 'Cloud-Verbindung unterbrochen · lokal verfügbar'));
    }, () => renderStatus('offline', 'Cloud-Verbindung unterbrochen · lokal verfügbar'));
  }

  function applyRemote(record) {
    if (!record) return;
    remoteBase = record.family;
    remoteRevision = record.revision;
    pendingRemote = null;
    dirty = false;
    store.replaceFamily(record.family, { source: 'firebase-sync' });
    persistLocally(record.family);
    renderStatus('synced', `Cloud geladen · Revision ${remoteRevision}`);
  }

  async function connectCurrentFamily() {
    if (!editing || !user) return;
    const localFamily = store.getState().family;
    renderStatus('loading', 'Firebase-Fassung wird geprüft …');
    try {
      const remote = await cloudRepository.loadDraft(localFamily.document.id);
      if (!remote) {
        remoteBase = null;
        remoteRevision = 0;
        dirty = true;
        scheduleSave();
      } else if (sameFamily(remote.family, localFamily)) {
        remoteBase = remote.family;
        remoteRevision = remote.revision;
        dirty = false;
        renderStatus('synced', `Cloud verbunden · Revision ${remoteRevision}`);
      } else {
        pendingRemote = remote;
        renderStatus('conflict', 'Lokale und Cloud-Fassung unterscheiden sich');
      }
      await watchRemote(localFamily.document.id);
    } catch (error) {
      renderStatus('offline', 'Nur lokal · Firebase derzeit nicht erreichbar');
    }
  }

  async function onAuthChanged(nextUser) {
    user = nextUser;
    pendingRemote = null;
    remoteBase = null;
    remoteRevision = 0;
    unsubscribeRemote?.();
    unsubscribeRemote = null;
    if (!user) {
      dirty = false;
      renderStatus('local', 'Lokal gespeichert · nicht mit Firebase verbunden');
      return;
    }
    renderStatus('loading', `Angemeldet als ${user.email || 'Firebase-Konto'}`);
    await connectCurrentFamily();
  }

  function onStoreChange(state, event) {
    if (!event?.affectsFamily) return;
    persistLocally(state.family);
    if (!editing || !user || event.details?.source === 'firebase-sync') return;
    dirty = true;
    renderStatus('pending', 'Lokal gespeichert · Cloud ausstehend');
    scheduleSave();
  }

  async function handleAction(action) {
    switch (action) {
      case 'open-cloud-login':
      case 'open-cloud-account':
        ui.open();
        break;
      case 'close-cloud-account':
        ui.close();
        break;
      case 'cloud-logout':
        await authService.logout();
        ui.close();
        break;
      case 'use-cloud-version':
        if (pendingRemote) applyRemote(pendingRemote);
        ui.close();
        break;
      case 'overwrite-cloud-version':
        if (!pendingRemote) return;
        remoteBase = pendingRemote.family;
        remoteRevision = pendingRemote.revision;
        pendingRemote = null;
        dirty = true;
        ui.close();
        scheduleSave();
        break;
      case 'retry-cloud-sync':
        await connectCurrentFamily();
        break;
      case 'cloud-publish': {
        await saveNow();
        if (dirty || pendingRemote || saving) throw new Error('Vor der Veröffentlichung muss die Cloud-Fassung konfliktfrei gespeichert sein.');
        renderStatus('publishing', 'Öffentliche Fassung wird erstellt …');
        const published = await cloudRepository.publishDraft({
          familyId: store.getState().family.document.id,
          expectedRevision: remoteRevision
        });
        renderStatus('synced', `Veröffentlicht · Revision ${published.revision}`);
        ui.close();
        break;
      }
      default:
        break;
    }
  }

  function onClick(event) {
    const actionElement = event.target.closest('[data-action]');
    if (!actionElement?.dataset.action.startsWith('cloud-')
      && !['open-cloud-login', 'open-cloud-account', 'close-cloud-account', 'use-cloud-version', 'overwrite-cloud-version', 'retry-cloud-sync'].includes(actionElement?.dataset.action)) return;
    event.preventDefault();
    void handleAction(actionElement.dataset.action).catch(error => ui.showError(error.message));
  }

  function onSubmit(event) {
    if (event.target !== ui.form) return;
    event.preventDefault();
    const credentials = ui.readCredentials();
    void authService.login(credentials.email, credentials.password)
      .then(() => {
        ui.clearPassword();
        ui.close();
      })
      .catch(error => ui.showError(error.message));
  }

  async function init() {
    persistLocally(store.getState().family);
    unsubscribeStore = store.subscribe(onStoreChange);
    documentRef.addEventListener('click', onClick);
    documentRef.addEventListener('submit', onSubmit);
    try {
      unsubscribeAuth = await authService.observe(nextUser => void onAuthChanged(nextUser));
    } catch (error) {
      renderStatus('offline', 'Nur lokal · Firebase konnte nicht gestartet werden');
    }
  }

  function destroy() {
    destroyed = true;
    cancelScheduledSave();
    documentRef.removeEventListener('click', onClick);
    documentRef.removeEventListener('submit', onSubmit);
    unsubscribeStore?.();
    unsubscribeAuth?.();
    unsubscribeRemote?.();
  }

  return Object.freeze({ init, destroy, saveNow });
}
