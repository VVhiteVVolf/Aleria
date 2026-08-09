import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';
import { httpsCallable } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-functions.js';
import {
  createFamilyChangeSet,
  FAMILY_ENTITY_COLLECTIONS,
  familyFromRepositoryRecords,
  summarizeFamilyChangeSet
} from './family-change-set.js';
import { FamilyRevisionConflictError } from './family-sync-errors.js';
import { PERSON_BIOGRAPHY_EXTENSION_ID, sanitizeBiographyStatsForFirestore } from '../person-biography/person-biography-model.js';

// Firestore lehnt Arrays ab, die direkt weitere Arrays enthalten. Personen-Datensaetze koennen in
// extensions.biographyModule.stats [label, wert]-Paare (Arrays) tragen - vor jedem Schreibvorgang
// muessen diese in {label, value}-Objekte gewandelt werden (siehe sanitizeBiographyStatsForFirestore).
function sanitizeEntityRecordForFirestore(collectionName, record) {
  if (collectionName !== 'persons') return record;
  const biographyModule = record?.extensions?.[PERSON_BIOGRAPHY_EXTENSION_ID];
  if (!biographyModule || !Array.isArray(biographyModule.stats) || !biographyModule.stats.length) return record;
  return {
    ...record,
    extensions: {
      ...record.extensions,
      [PERSON_BIOGRAPHY_EXTENSION_ID]: {
        ...biographyModule,
        stats: sanitizeBiographyStatsForFirestore(biographyModule.stats)
      }
    }
  };
}

export { FamilyRevisionConflictError } from './family-sync-errors.js';

function workspaceRef(db, familyId) {
  return doc(db, 'familyWorkspaces', familyId);
}

function assertFamilyId(familyId) {
  if (!/^[a-z0-9-]{2,120}$/.test(String(familyId || ''))) {
    throw new Error('Die Familien-ID ist nicht für Firebase geeignet.');
  }
}

function releaseRef(db, familyId, releaseId) {
  return doc(db, 'publishedFamilies', familyId, 'releases', releaseId);
}

async function readEntityCollections(rootReference) {
  const entries = await Promise.all(FAMILY_ENTITY_COLLECTIONS.map(async collectionName => {
    const snapshot = await getDocs(collection(rootReference, collectionName));
    return [collectionName, snapshot.docs.map(item => item.data())];
  }));
  return Object.fromEntries(entries);
}

function repositoryRecord(snapshot, family) {
  const data = snapshot.data();
  return Object.freeze({
    family,
    revision: Number(data.revision || 0),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || '',
    updatedBy: String(data.updatedBy || '')
  });
}

export function createFirestoreFamilyRepository(firebaseClient) {
  async function services() {
    const initialized = await firebaseClient.initialize();
    if (!initialized) throw new Error('Firebase ist in dieser Umgebung deaktiviert.');
    return initialized;
  }

  async function loadDraft(familyId) {
    assertFamilyId(familyId);
    const { db } = await services();
    const reference = workspaceRef(db, familyId);
    const snapshot = await getDoc(reference);
    if (!snapshot.exists()) return null;
    const entities = await readEntityCollections(reference);
    return repositoryRecord(snapshot, familyFromRepositoryRecords(snapshot.data(), entities));
  }

  async function saveDraftBatch(records) {
    const { auth, db } = await services();
    const actor = auth.currentUser;
    if (!actor) throw new Error('Zum Speichern in Firebase ist eine Anmeldung erforderlich.');
    const prepared = records.map(record => {
      assertFamilyId(record.family?.document?.id);
      const changeSet = createFamilyChangeSet(record.baseFamily || null, record.family);
      return Object.freeze({
        changeSet,
        expectedRevision: Math.max(0, Number(record.expectedRevision || 0)),
        reference: workspaceRef(db, changeSet.family.document.id)
      });
    });
    if (!prepared.length) return Object.freeze([]);
    const familyIds = prepared.map(item => item.changeSet.family.document.id);
    if (new Set(familyIds).size !== familyIds.length) {
      throw new Error('Eine Familienakte wurde im Online-Speicherpaket doppelt angegeben.');
    }
    const estimatedWrites = prepared.reduce((sum, item) => sum + item.changeSet.operationCount + 3, 0);
    if (estimatedWrites > 480) {
      throw new Error('Diese Änderungen sind zusammen zu groß für einen atomaren Speichervorgang. Bitte in kleinere Schritte teilen.');
    }
    const revisions = await runTransaction(db, async transaction => {
      const snapshots = [];
      for (const item of prepared) snapshots.push(await transaction.get(item.reference));
      snapshots.forEach((current, index) => {
        const item = prepared[index];
        const actualRevision = current.exists() ? Number(current.data().revision || 0) : 0;
        if (actualRevision !== item.expectedRevision) {
          throw new FamilyRevisionConflictError(
            item.expectedRevision,
            actualRevision,
            item.changeSet.family.document.id
          );
        }
      });
      const now = serverTimestamp();
      const nextRevisions = [];
      prepared.forEach((item, index) => {
        const { changeSet, reference } = item;
        const current = snapshots[index];
        const actualRevision = current.exists() ? Number(current.data().revision || 0) : 0;
        const revision = actualRevision + 1;
        nextRevisions.push(revision);
        transaction.set(reference, {
          ...changeSet.root,
          familyId: changeSet.family.document.id,
          title: changeSet.family.document.title,
          lifecycle: 'draft',
          revision,
          createdAt: current.exists() ? current.data().createdAt : now,
          createdBy: current.exists() ? current.data().createdBy : actor.uid,
          updatedAt: now,
          updatedBy: actor.uid
        });
        if (!current.exists()) {
          transaction.set(doc(reference, 'members', actor.uid), {
            role: 'admin',
            uid: actor.uid,
            email: actor.email || '',
            createdAt: now,
            updatedAt: now
          });
        }
        FAMILY_ENTITY_COLLECTIONS.forEach(collectionName => {
          const changes = changeSet.collections[collectionName];
          changes.upsert.forEach(record => transaction.set(
            doc(reference, collectionName, record.id),
            sanitizeEntityRecordForFirestore(collectionName, record)
          ));
          changes.remove.forEach(recordId => transaction.delete(doc(reference, collectionName, recordId)));
        });
        transaction.set(doc(reference, 'changeSets', String(revision).padStart(10, '0')), {
          revision,
          actorId: actor.uid,
          createdAt: now,
          changes: summarizeFamilyChangeSet(changeSet)
        });
      });
      return nextRevisions;
    });
    return Object.freeze(prepared.map((item, index) => Object.freeze({
      revision: revisions[index],
      family: item.changeSet.family
    })));
  }

  async function saveDraft(record) {
    const [result] = await saveDraftBatch([record]);
    return result;
  }

  async function loadPublished(familyId) {
    assertFamilyId(familyId);
    const { db } = await services();
    const published = await getDoc(doc(db, 'publishedFamilies', familyId));
    if (!published.exists() || !published.data().activeReleaseId) return null;
    const reference = releaseRef(db, familyId, published.data().activeReleaseId);
    const release = await getDoc(reference);
    if (!release.exists()) return null;
    const entities = await readEntityCollections(reference);
    return Object.freeze({
      family: familyFromRepositoryRecords(release.data(), entities),
      releaseId: published.data().activeReleaseId,
      publishedAt: published.data().publishedAt?.toDate?.()?.toISOString?.() || ''
    });
  }

  async function listPublishedRegistry() {
    const { db } = await services();
    const snapshot = await getDocs(collection(db, 'publishedRegistryNodes'));
    return snapshot.docs.map(item => Object.freeze({ id: item.id, ...item.data(), source: 'firebase' }));
  }

  async function watchDraftMetadata(familyId, listener, onError = () => {}) {
    assertFamilyId(familyId);
    const { db } = await services();
    return onSnapshot(workspaceRef(db, familyId), snapshot => {
      listener(snapshot.exists() ? Object.freeze({
        revision: Number(snapshot.data().revision || 0),
        updatedBy: String(snapshot.data().updatedBy || '')
      }) : null);
    }, onError);
  }

  async function publishDraft({ familyId, expectedRevision }) {
    const { functions } = await services();
    const callable = httpsCallable(functions, 'publishFamily');
    const result = await callable({ familyId, expectedRevision });
    return Object.freeze(result.data);
  }

  async function saveRegistryDraft(record) {
    const { auth, db } = await services();
    if (!auth.currentUser) throw new Error('Zum Speichern der Registry ist eine Anmeldung erforderlich.');
    await setDoc(doc(db, 'registryDraftNodes', record.id), {
      ...record,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser.uid
    }, { merge: true });
  }

  return Object.freeze({
    kind: 'firestore',
    loadDraft,
    saveDraft,
    saveDraftBatch,
    loadPublished,
    listPublishedRegistry,
    watchDraftMetadata,
    publishDraft,
    saveRegistryDraft
  });
}
