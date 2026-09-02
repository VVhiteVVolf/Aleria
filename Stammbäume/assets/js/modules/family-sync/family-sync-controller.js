import {
  describeFamilySyncError,
  FamilyRevisionConflictError
} from './family-sync-errors.js';
import { assertMirroredCrossFamilyBatch } from './cross-family-sync-invariant.js';
import { createFamilySyncStatusUi } from './family-sync-status-ui.js';
import { reconcileFamilyWithProjectOrigin } from './project-origin-reconciliation.js';
import { createWorldPersonPortraitSyncChanges } from './world-person-portrait-sync.js';

const REMOTE_SOURCES = new Set(['repository-sync', 'repository-priority']);
const NEW_FAMILY_SOURCES = new Set([
  'new-empty-family',
  'new-founding-family',
  'tree-generator-cta'
]);

export function sameFamily(first, second) {
  return JSON.stringify(first) === JSON.stringify(second);
}

export function createFamilySyncController({
  store,
  localRepository,
  cloudRepository,
  documentRef = document,
  runtime = globalThis,
  editing = false,
  resolveOriginFamily = () => null,
  relatedFamilySource = null,
  uiFactory = createFamilySyncStatusUi
}) {
  const ui = uiFactory(documentRef);
  let activeFamilyId = store.getState().family.document.id;
  let connectedFamilyId = '';
  let originFamily = resolveOriginFamily(activeFamilyId);
  let remoteBase = null;
  let remoteRevision = 0;
  let localBaseRevision = 0;
  let dirty = false;
  let saving = false;
  let connecting = false;
  let destroyed = false;
  let contextVersion = 0;
  let identityChangeBlock = null;
  const identityCollisionProvenances = new Map();
  let connectionPromise = null;
  let unsubscribeStore = null;
  let unsubscribeRemote = null;

  function renderStatus(phase, message) {
    ui.render({
      phase,
      message,
      dirty,
      saving,
      canReset: Boolean(originFamily)
    });
    const localStatus = documentRef.getElementById('save-status');
    if (localStatus) localStatus.textContent = message;
  }

  function persistLocally(family, options = {}) {
    const collisionProvenance = identityCollisionProvenances.get(family.document.id);
    const hasActiveCollision = identityChangeBlock?.sameIdCollision === true
      && identityChangeBlock.fromFamilyId === family.document.id;
    const saved = localRepository.persistCurrent(family, {
      baseRevision: options.baseRevision ?? localBaseRevision,
      dirty: options.dirty ?? dirty,
      cloudFamilyId: options.cloudFamilyId
        ?? identityChangeBlock?.fromFamilyId
        ?? undefined,
      identityCollision: hasActiveCollision,
      baseFamily: options.baseFamily
        ?? (hasActiveCollision ? collisionProvenance?.originalFamily : undefined)
    });
    if (options.render !== false) {
      renderStatus(
        saved ? (dirty ? 'pending' : 'local') : 'error',
        saved
          ? (dirty ? 'Lokaler Entwurf nur auf diesem Gerät · für andere noch nicht sichtbar' : 'Lokal auf diesem Gerät gespeichert')
          : 'Lokale Speicherung nicht verfügbar'
      );
    }
    return saved;
  }

  function resetRemoteContext() {
    unsubscribeRemote?.();
    unsubscribeRemote = null;
    connectedFamilyId = '';
    remoteBase = null;
    remoteRevision = 0;
    connecting = false;
    connectionPromise = null;
  }

  function identityBlockMessage() {
    if (!identityChangeBlock) return '';
    if (identityChangeBlock.sameIdCollision) {
      return `Die neue Familie verwendet bereits die online gebundene ID „${identityChangeBlock.fromFamilyId}“. Bitte eine andere Familien-ID wählen.`;
    }
    return `Familien-ID geändert · Cloud-Migration erforderlich (${identityChangeBlock.fromFamilyId} → ${identityChangeBlock.toFamilyId})`;
  }

  function rememberIdentityCollision({ familyId, baseRevision, originalFamily, active = true }) {
    if (!familyId || !originalFamily) return null;
    const provenance = Object.freeze({
      familyId,
      baseRevision: Math.max(0, Number(baseRevision || 0)),
      originalFamily,
      active: active === true
    });
    identityCollisionProvenances.set(familyId, provenance);
    return provenance;
  }

  function loadIdentityCollision(familyId) {
    const remembered = identityCollisionProvenances.get(familyId);
    if (remembered) return remembered;
    const draft = localRepository.loadDraft?.(familyId);
    if (!draft?.identityCollision || !draft.baseFamily) return null;
    return rememberIdentityCollision({
      familyId,
      baseRevision: draft.baseRevision,
      originalFamily: draft.baseFamily,
      active: true
    });
  }

  function updateIdentityCollision(provenance, active) {
    return rememberIdentityCollision({ ...provenance, active });
  }

  function createIdentityCollisionBlock(provenance) {
    if (!provenance?.active) return null;
    return Object.freeze({
      fromFamilyId: provenance.familyId,
      toFamilyId: provenance.familyId,
      baseRevision: provenance.baseRevision,
      sameIdCollision: true,
      originalFamily: provenance.originalFamily
    });
  }

  function activateFamilyContext(family, {
    changed = false,
    allowNewIdentity = false,
    source = ''
  } = {}) {
    const nextFamilyId = family.document.id;
    if (nextFamilyId === activeFamilyId) {
      let collisionProvenance = loadIdentityCollision(activeFamilyId);
      if (allowNewIdentity && Math.max(remoteRevision, localBaseRevision) > 0) {
        const previousLocalFamily = localRepository.loadDraft?.(activeFamilyId)?.family;
        collisionProvenance = rememberIdentityCollision({
          familyId: activeFamilyId,
          baseRevision: Math.max(remoteRevision, localBaseRevision),
          originalFamily: (collisionProvenance?.active ? collisionProvenance.originalFamily : previousLocalFamily)
            || collisionProvenance?.originalFamily
            || remoteBase,
          active: true
        });
      } else if (collisionProvenance && source === 'history-undo'
        && sameFamily(collisionProvenance.originalFamily, family)) {
        collisionProvenance = updateIdentityCollision(collisionProvenance, false);
      } else if (collisionProvenance && source === 'history-redo') {
        collisionProvenance = updateIdentityCollision(
          collisionProvenance,
          !sameFamily(collisionProvenance.originalFamily, family)
        );
      }
      if (collisionProvenance) {
        identityChangeBlock = createIdentityCollisionBlock(collisionProvenance);
      }
      return false;
    }
    const previousFamilyId = activeFamilyId;
    const previousBaseRevision = Math.max(remoteRevision, localBaseRevision);
    const originalCloudFamilyId = identityChangeBlock?.fromFamilyId || previousFamilyId;
    const originalCloudRevision = identityChangeBlock?.baseRevision || previousBaseRevision;
    let returnedToCloudIdentity = false;
    let nextCollisionProvenance = loadIdentityCollision(nextFamilyId);
    if (nextCollisionProvenance && source === 'history-undo'
      && sameFamily(nextCollisionProvenance.originalFamily, family)) {
      nextCollisionProvenance = updateIdentityCollision(nextCollisionProvenance, false);
    } else if (nextCollisionProvenance && source === 'history-redo') {
      nextCollisionProvenance = updateIdentityCollision(
        nextCollisionProvenance,
        !sameFamily(nextCollisionProvenance.originalFamily, family)
      );
    }
    if (nextCollisionProvenance) {
      identityChangeBlock = createIdentityCollisionBlock(nextCollisionProvenance);
      returnedToCloudIdentity = true;
    } else if (identityChangeBlock && nextFamilyId === originalCloudFamilyId) {
      identityChangeBlock = null;
      returnedToCloudIdentity = true;
    } else if (identityChangeBlock?.sameIdCollision) {
      // Eine ausdrückliche Neuanlage, die nur mit einer bereits cloudgebundenen
      // ID kollidierte, wird durch die verlangte neue ID zu einer eigenen Akte.
      // Die alte Provenienz bleibt im Speicher, damit Undo zur kollidierenden ID
      // die Sperre zuverlässig wiederherstellt.
      identityChangeBlock = null;
    } else if (changed && !allowNewIdentity && (identityChangeBlock || previousBaseRevision > 0)) {
      identityChangeBlock = Object.freeze({
        fromFamilyId: originalCloudFamilyId,
        toFamilyId: nextFamilyId,
        baseRevision: originalCloudRevision
      });
    } else if (allowNewIdentity) {
      identityChangeBlock = null;
    }
    contextVersion += 1;
    resetRemoteContext();
    activeFamilyId = nextFamilyId;
    originFamily = resolveOriginFamily(nextFamilyId);
    const existingDraft = localRepository.loadDraft?.(nextFamilyId) || null;
    if (changed && existingDraft?.dirty && !sameFamily(existingDraft.family, family)) {
      localRepository.archiveDraft?.(nextFamilyId, 'family-id-reused');
    }
    localBaseRevision = identityChangeBlock?.toFamilyId === nextFamilyId
      ? originalCloudRevision
      : returnedToCloudIdentity
        ? Number(existingDraft?.baseRevision || previousBaseRevision)
        : changed
          ? 0
          : Number(existingDraft?.baseRevision || 0);
    dirty = changed || existingDraft?.dirty === true;
    return true;
  }

  function applyRemote(record, { priority = false, message = '' } = {}) {
    if (!record || record.family.document.id !== activeFamilyId) return false;
    remoteBase = record.family;
    remoteRevision = record.revision;
    localBaseRevision = record.revision;
    connectedFamilyId = activeFamilyId;
    dirty = false;
    store.synchronizeFamily(record.family, { source: priority ? 'repository-priority' : 'repository-sync' });
    localRepository.markSynced?.(record.family, record.revision);
    renderStatus(
      'synced',
      message || `${priority ? 'Neuere GitHub-Fassung übernommen' : 'GitHub-Fassung geladen'} · Revision ${remoteRevision}`
    );
    return true;
  }

  async function watchRemote(familyId, version) {
    const unsubscribe = await cloudRepository.watchDraftMetadata(familyId, metadata => {
      if (!metadata || metadata.revision <= remoteRevision || destroyed || version !== contextVersion) return;
      if (saving && metadata.revision === remoteRevision + 1) return;
      void cloudRepository.loadDraft(familyId).then(record => {
        if (!record || record.revision <= remoteRevision || destroyed || version !== contextVersion) return;
        if (dirty) localRepository.archiveDraft?.(familyId, 'newer-repository-revision');
        applyRemote(record, {
          priority: true,
          message: `Neuere GitHub-Fassung hatte Vorrang · Revision ${record.revision}`
        });
      }).catch(() => renderStatus('offline', 'Cloud-Verbindung unterbrochen · lokaler Entwurf bleibt erhalten'));
    }, () => renderStatus('offline', 'Cloud-Verbindung unterbrochen · lokaler Entwurf bleibt erhalten'));
    if (destroyed || version !== contextVersion || familyId !== activeFamilyId) {
      unsubscribe?.();
      return;
    }
    unsubscribeRemote?.();
    unsubscribeRemote = unsubscribe;
  }

  async function performConnect({ forceRemote = false } = {}) {
    if (!editing || destroyed) return false;
    const familyAtStart = store.getState().family;
    const familyId = familyAtStart.document.id;
    if (familyId !== activeFamilyId) activateFamilyContext(familyAtStart);
    const version = ++contextVersion;
    renderStatus('loading', 'GitHub-Fassung wird geprüft …');
    try {
      const remote = await cloudRepository.loadDraft(familyId);
      if (destroyed || version !== contextVersion || familyId !== activeFamilyId) return false;
      connectedFamilyId = familyId;
      const localDraft = localRepository.loadDraft?.(familyId);
      if (!remote) {
        const knownRevision = Math.max(0, Number(localDraft?.baseRevision || 0));
        if (knownRevision > 0) {
          remoteBase = localDraft?.baseFamily || localDraft?.family || familyAtStart;
          remoteRevision = knownRevision;
          localBaseRevision = knownRevision;
          dirty = localDraft?.dirty === true;
          renderStatus(
            'offline',
            `GitHub-Fassung nicht gefunden · lokale ID-Bindung an Revision ${knownRevision} bleibt geschützt`
          );
        } else {
          remoteBase = null;
          remoteRevision = 0;
          localBaseRevision = 0;
          dirty = true;
          const locallySaved = persistLocally(store.getState().family, { baseRevision: 0, dirty: true, render: false });
          renderStatus(
            locallySaved ? 'pending' : 'error',
            locallySaved
              ? 'Lokaler Entwurf nur auf diesem Gerät · noch nicht in GitHub angelegt'
              : 'Lokaler Entwurf konnte nicht gesichert werden'
          );
        }
      } else {
        remoteBase = remote.family;
        remoteRevision = remote.revision;
        const projectReconciliation = reconcileFamilyWithProjectOrigin({
          family: remote.family,
          projectOriginFamily: originFamily
        });
        const hasLocalChanges = localDraft?.dirty === true
          && !sameFamily(localDraft.family, remote.family);
        const localIsBasedOnRemote = Number(localDraft?.baseRevision || 0) === remote.revision
          || (
            Number(localDraft?.baseRevision || 0) === 0
            && localDraft?.baseFamily
            && sameFamily(localDraft.baseFamily, remote.family)
          );
        if (hasLocalChanges && localIsBasedOnRemote && !forceRemote) {
          localBaseRevision = remote.revision;
          dirty = true;
          const locallySaved = persistLocally(store.getState().family, {
            baseRevision: remote.revision,
            dirty: true,
            render: false
          });
          renderStatus(
            locallySaved ? 'pending' : 'error',
            locallySaved
              ? `Lokaler Entwurf nur auf diesem Gerät · GitHub-Basis Revision ${remote.revision}`
              : 'Lokaler Entwurf konnte nicht gesichert werden'
          );
        } else if (projectReconciliation.upgraded) {
          if (hasLocalChanges) localRepository.archiveDraft?.(familyId, 'project-origin-reconciliation');
          localBaseRevision = remote.revision;
          dirty = true;
          store.synchronizeFamily(projectReconciliation.family, {
            source: 'project-origin-reconciliation'
          });
          renderStatus(
            'pending',
            `Projektkorrekturen mit GitHub-Revision ${remote.revision} zusammengeführt · online speichern steht aus`
          );
        } else if (sameFamily(remote.family, store.getState().family)) {
          localBaseRevision = remote.revision;
          dirty = false;
          localRepository.markSynced?.(remote.family, remote.revision);
          renderStatus('synced', `Online verbunden · Revision ${remote.revision}`);
        } else {
          if (hasLocalChanges) localRepository.archiveDraft?.(familyId, 'repository-priority');
          applyRemote(remote, {
            priority: hasLocalChanges,
            message: hasLocalChanges
              ? `GitHub-Fassung hatte Vorrang · Revision ${remote.revision}`
              : `GitHub-Fassung geladen · Revision ${remote.revision}`
          });
        }
      }
      await watchRemote(familyId, version);
      return true;
    } catch (error) {
      if (destroyed || version !== contextVersion) return false;
      connectedFamilyId = '';
      const message = describeFamilySyncError(error);
      renderStatus(String(error?.code || '').includes('permission-denied') ? 'error' : 'offline', message);
      return false;
    }
  }

  function connectCurrentFamily(options = {}) {
    if (connecting && connectionPromise) return connectionPromise;
    connecting = true;
    const currentPromise = performConnect(options).finally(() => {
      if (connectionPromise !== currentPromise) return;
      connecting = false;
      connectionPromise = null;
    });
    connectionPromise = currentPromise;
    return connectionPromise;
  }

  async function saveNow() {
    if (!editing || destroyed) return false;
    if (identityChangeBlock) {
      throw new Error(identityChangeBlock.sameIdCollision
        ? identityBlockMessage()
        : `Die bereits online gespeicherte Familien-ID „${identityChangeBlock.fromFamilyId}“ kann nicht direkt in „${identityChangeBlock.toFamilyId}“ umbenannt werden. Bitte die lokale Umbenennung rückgängig machen; eine Cloud-ID-Migration benötigt einen eigenen Migrationsschritt.`);
    }
    if (saving) return false;
    if (connecting && connectionPromise) await connectionPromise;
    const familyId = store.getState().family.document.id;
    if (familyId !== activeFamilyId) activateFamilyContext(store.getState().family, { changed: true });
    if (connectedFamilyId !== activeFamilyId) {
      const connected = await connectCurrentFamily();
      if (!connected) throw new Error('GitHub konnte vor dem Speichern nicht geprüft werden. Der Entwurf bleibt lokal erhalten.');
    }
    const familyToSave = store.getState().family;
    const relatedDrafts = localRepository.listRelatedDrafts?.(activeFamilyId) || [];
    if (!dirty && !relatedDrafts.length && remoteBase && sameFamily(remoteBase, familyToSave)) {
      renderStatus('synced', `Online unverändert · Revision ${remoteRevision}`);
      return true;
    }
    if (saving) return false;
    const saveOptions = ui.getSaveOptions?.() || { skipDeploy: true };
    const skipDeploy = saveOptions.skipDeploy !== false;
    saving = true;
    renderStatus(
      'saving',
      relatedDrafts.length
        ? `Speichert ${relatedDrafts.length + 1} verknüpfte Familien atomar …`
        : 'Wird online gespeichert …'
    );
    try {
      const primaryRecord = {
        family: familyToSave,
        baseFamily: remoteBase,
        expectedRevision: remoteRevision
      };
      let savedRecords;
      if (relatedDrafts.length) {
        if (typeof cloudRepository.saveDraftBatch !== 'function') {
          throw new Error('Der atomare Online-Speicher für verknüpfte Familien ist nicht verfügbar. Es wurde nichts hochgeladen.');
        }
        const relatedRecords = [];
        for (const draft of relatedDrafts) {
          const relatedFamilyId = draft.family.document.id;
          if (draft.cloudFamilyId && draft.cloudFamilyId !== relatedFamilyId) {
            throw new Error(`Die verknüpfte Familie „${relatedFamilyId}“ wartet auf eine Cloud-ID-Migration. Es wurde nichts hochgeladen.`);
          }
          const remote = await cloudRepository.loadDraft(relatedFamilyId);
          if (!remote) {
            if (draft.baseRevision > 0) {
              throw new FamilyRevisionConflictError(draft.baseRevision, 0, relatedFamilyId);
            }
            relatedRecords.push({ family: draft.family, baseFamily: null, expectedRevision: 0 });
            continue;
          }
          const revisionMatches = draft.baseRevision === remote.revision;
          const baselineMatches = draft.baseRevision === 0
            && draft.baseFamily
            && sameFamily(draft.baseFamily, remote.family);
          if (!revisionMatches && !baselineMatches) {
            throw new FamilyRevisionConflictError(draft.baseRevision, remote.revision, relatedFamilyId);
          }
          relatedRecords.push({
            family: draft.family,
            baseFamily: remote.family,
            expectedRevision: remote.revision
          });
        }
        const batchRecords = [primaryRecord, ...relatedRecords];
        assertMirroredCrossFamilyBatch(batchRecords);
        savedRecords = await cloudRepository.saveDraftBatch(batchRecords, { skipDeploy });
      } else {
        assertMirroredCrossFamilyBatch([primaryRecord]);
        savedRecords = [await cloudRepository.saveDraft(primaryRecord, { skipDeploy })];
      }
      const result = savedRecords[0];
      const deploySkipped = result.deploySkipped ?? skipDeploy;
      const deployMessage = deploySkipped
        ? 'Netlify-Deploy übersprungen'
        : 'Netlify-Deploy wird gestartet';
      if (familyToSave.document.id !== activeFamilyId) return false;
      remoteBase = result.family;
      remoteRevision = result.revision;
      localBaseRevision = result.revision;
      const appliedServerResult = !sameFamily(result.family, familyToSave)
        && sameFamily(store.getState().family, familyToSave);
      if (appliedServerResult) {
        store.synchronizeFamily(result.family, { source: 'repository-sync' });
      }
      dirty = appliedServerResult ? false : !sameFamily(store.getState().family, familyToSave);
      const finalizedRelatedBatch = savedRecords.length > 1 && !dirty
        ? localRepository.markDraftsSynced?.(savedRecords, activeFamilyId) === true
        : false;
      if (!finalizedRelatedBatch) {
        savedRecords.slice(1).forEach(saved => {
          localRepository.markDraftSynced?.(saved.family, saved.revision);
        });
      }
      if (dirty) {
        const locallySaved = persistLocally(store.getState().family, {
          baseRevision: result.revision,
          dirty: true,
          render: false
        });
        renderStatus(
          locallySaved ? 'pending' : 'error',
          locallySaved
            ? `Online gespeichert · ${deployMessage} · weitere lokale Änderungen ausstehend`
            : `Online gespeichert · ${deployMessage} · neuer lokaler Entwurf konnte nicht gesichert werden`
        );
      } else {
        if (!finalizedRelatedBatch) {
          localRepository.markSynced?.(result.family, result.revision);
        }
        renderStatus(
          'synced',
          savedRecords.length > 1
            ? `${savedRecords.length} verknüpfte Familien online gespeichert · ${deployMessage} · Revision ${remoteRevision}`
            : `Online gespeichert · ${deployMessage} · Revision ${remoteRevision}`
        );
      }
      return !dirty;
    } catch (error) {
      if (error instanceof FamilyRevisionConflictError) {
        if (error.familyId && error.familyId !== familyToSave.document.id) {
          const message = `Die GitHub-Fassung der verknüpften Familie „${error.familyId}“ ist neuer. Keine der Familien wurde online verändert; bitte diese Familie zuerst öffnen und abgleichen.`;
          renderStatus('pending', message);
          throw new Error(message, { cause: error });
        }
        let latest = null;
        try {
          latest = await cloudRepository.loadDraft(familyToSave.document.id);
        } catch (loadError) {
          const message = describeFamilySyncError(loadError);
          renderStatus('offline', message);
          throw new Error(message, { cause: loadError });
        }
        if (latest) {
          localRepository.archiveDraft?.(familyToSave.document.id, 'revision-conflict');
          applyRemote(latest, {
            priority: true,
            message: `GitHub war neuer und hatte Vorrang · Revision ${latest.revision}`
          });
          return false;
        }
      }
      const message = describeFamilySyncError(error);
      renderStatus(String(error?.code || '').includes('permission-denied') ? 'error' : 'offline', message);
      throw new Error(message, { cause: error });
    } finally {
      saving = false;
    }
  }

  function onStoreChange(state, event) {
    if (!event?.affectsFamily) return;
    const source = event.details?.source || event.type;
    const changedFamily = state.family;
    const counterpartFamily = event.details?.counterpartFamily;
    const previousFamily = localRepository.loadDraft?.(changedFamily.document.id)?.family || null;
    const portraitSyncChanges = !REMOTE_SOURCES.has(source)
      && !NEW_FAMILY_SOURCES.has(source)
      && typeof relatedFamilySource?.listRecords === 'function'
      ? createWorldPersonPortraitSyncChanges({
        previousFamily,
        currentFamily: changedFamily,
        familyRecords: () => relatedFamilySource.listRecords()
      })
      : [];
    const relatedChangesByFamilyId = new Map(
      portraitSyncChanges.map(change => [change.family.document.id, change])
    );
    if (counterpartFamily) {
      relatedChangesByFamilyId.set(counterpartFamily.document.id, {
        family: counterpartFamily,
        baseFamily: event.details?.counterpartBaseFamily || null
      });
    }
    const relatedChanges = [...relatedChangesByFamilyId.values()];
    const relatedSaved = relatedChanges.length
      ? localRepository.persistRelatedChanges?.([
        {
          family: changedFamily,
          baseFamily: event.details?.currentBaseFamily || previousFamily
        },
        ...relatedChanges
      ]) !== false
      : true;
    const familyChanged = activateFamilyContext(changedFamily, {
      changed: !REMOTE_SOURCES.has(source),
      allowNewIdentity: NEW_FAMILY_SOURCES.has(source),
      source
    });
    if (REMOTE_SOURCES.has(source)) {
      persistLocally(changedFamily, { dirty: false, baseRevision: remoteRevision, render: false });
      return;
    }
    dirty = true;
    const locallySaved = persistLocally(changedFamily, { dirty: true, render: false });
    if (!locallySaved || !relatedSaved) {
      renderStatus('error', 'Lokaler Entwurf konnte nicht gesichert werden');
      return;
    }
    renderStatus(
      identityChangeBlock ? 'error' : 'pending',
      identityChangeBlock
        ? identityBlockMessage()
        : relatedChanges.length
          ? `${relatedChanges.length + 1} verknüpfte Familien nur auf diesem Gerät gespeichert · für andere noch nicht sichtbar`
          : 'Lokaler Entwurf nur auf diesem Gerät · für andere noch nicht sichtbar'
    );
    if (familyChanged && !identityChangeBlock) void connectCurrentFamily();
  }

  async function resetToOrigin() {
    if (!originFamily) throw new Error('Für diese Familie gibt es keine Projekt-Ursprungsfassung.');
    const confirmed = runtime.confirm?.('Lokalen Arbeitsstand auf die unveränderte Projekt-Ursprungsfassung zurücksetzen? Die Cloud ändert sich erst beim nächsten Online-Speichern.');
    if (confirmed === false) return;
    localRepository.archiveDraft?.(activeFamilyId, 'project-origin-reset');
    store.replaceFamily(originFamily, { source: 'project-origin-reset' });
    renderStatus('pending', 'Projekt-Ursprung nur auf diesem Gerät wiederhergestellt · für andere noch nicht sichtbar');
  }

  async function handleAction(action) {
    switch (action) {
      case 'cloud-save':
        await saveNow();
        break;
      case 'cloud-reset-origin':
        await resetToOrigin();
        break;
      default:
        break;
    }
  }

  const handledActions = new Set([
    'cloud-save',
    'cloud-reset-origin'
  ]);

  function onClick(event) {
    const actionElement = event.target.closest?.('[data-action]');
    if (!handledActions.has(actionElement?.dataset.action)) return;
    event.preventDefault();
    void handleAction(actionElement.dataset.action).catch(error => ui.showError(error.message));
  }

  async function init() {
    if (!editing) {
      renderStatus('local', 'Ansichtsmodus · keine lokalen Änderungen');
      return;
    }
    const initialFamily = store.getState().family;
    const initialDraft = localRepository.loadDraft?.(activeFamilyId);
    localBaseRevision = Number(initialDraft?.baseRevision || 0);
    dirty = initialDraft?.dirty === true;
    if (initialDraft?.cloudFamilyId && initialDraft.cloudFamilyId !== activeFamilyId) {
      identityChangeBlock = Object.freeze({
        fromFamilyId: initialDraft.cloudFamilyId,
        toFamilyId: activeFamilyId,
        baseRevision: localBaseRevision
      });
    } else if (initialDraft?.identityCollision) {
      const collisionProvenance = rememberIdentityCollision({
        familyId: activeFamilyId,
        baseRevision: localBaseRevision,
        originalFamily: initialDraft.baseFamily,
        active: true
      });
      identityChangeBlock = createIdentityCollisionBlock(collisionProvenance);
    }
    const locallySaved = persistLocally(initialFamily, { baseRevision: localBaseRevision, dirty, render: false });
    renderStatus(
      locallySaved && !identityChangeBlock ? (dirty ? 'pending' : 'local') : 'error',
      !locallySaved
        ? 'Lokaler Entwurf konnte nicht gesichert werden'
        : identityChangeBlock
          ? identityBlockMessage()
          : (dirty ? 'Lokaler Entwurf nur auf diesem Gerät · für andere noch nicht sichtbar' : 'Lokal auf diesem Gerät gespeichert')
    );
    unsubscribeStore = store.subscribe(onStoreChange);
    documentRef.addEventListener('click', onClick);
    if (!identityChangeBlock) await connectCurrentFamily();
  }

  function destroy() {
    destroyed = true;
    contextVersion += 1;
    documentRef.removeEventListener('click', onClick);
    unsubscribeStore?.();
    unsubscribeRemote?.();
  }

  return Object.freeze({
    init,
    destroy,
    saveNow,
    resetToOrigin,
    getSyncState: () => Object.freeze({
      familyId: activeFamilyId,
      connectedFamilyId,
      remoteRevision,
      localBaseRevision,
      dirty,
      saving,
      identityChangeBlock,
      connected: connectedFamilyId === activeFamilyId
    })
  });
}
