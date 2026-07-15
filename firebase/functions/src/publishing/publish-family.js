import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { requireFamilyRole } from '../access/family-access.js';
import { FAMILY_COLLECTIONS, loadFamilyWorkspace } from '../families/family-collections.js';
import { countPublicFamilyWrites, createPublicFamily } from '../families/family-publication.js';
import { validateWorkspaceForPublishing } from '../families/family-validation.js';

const DATABASE_ID = 'family-trees';

export const publishFamily = onCall({
  region: 'europe-west1',
  timeoutSeconds: 120,
  memory: '512MiB',
  maxInstances: 10,
  enforceAppCheck: false
}, async request => {
  const familyId = String(request.data?.familyId || '').trim();
  const expectedRevision = Number(request.data?.expectedRevision || 0);
  if (!/^[a-z0-9-]{2,120}$/.test(familyId)) throw new HttpsError('invalid-argument', 'Ungültige Familien-ID.');
  const database = getFirestore(DATABASE_ID);
  await requireFamilyRole({ request, database, familyId, roles: ['reviewer', 'admin'] });
  const workspaceReference = database.doc(`familyWorkspaces/${familyId}`);
  const workspace = await loadFamilyWorkspace(workspaceReference);
  if (!workspace) throw new HttpsError('not-found', 'Die private Arbeitsfassung wurde nicht gefunden.');
  if (expectedRevision && workspace.root.revision !== expectedRevision) {
    throw new HttpsError('aborted', 'Die Arbeitsfassung hat inzwischen eine neuere Revision.');
  }
  const validation = validateWorkspaceForPublishing(workspace);
  if (!validation.valid) {
    throw new HttpsError('failed-precondition', 'Die Familienakte ist nicht veröffentlichungsfähig.', {
      diagnostics: validation.diagnostics
    });
  }
  const publicFamily = createPublicFamily(workspace);
  if (countPublicFamilyWrites(publicFamily) > 480) {
    throw new HttpsError('resource-exhausted', 'Die Familie ist für eine atomare Veröffentlichung zu groß.');
  }

  const releaseId = `r${String(workspace.root.revision).padStart(8, '0')}-${Date.now()}`;
  const releaseReference = database.doc(`publishedFamilies/${familyId}/releases/${releaseId}`);
  const publishedReference = database.doc(`publishedFamilies/${familyId}`);
  const registryReference = database.doc(`publishedRegistryNodes/${familyId}`);
  const auditReference = database.collection('auditEvents').doc();
  const now = FieldValue.serverTimestamp();
  const batch = database.batch();
  batch.set(releaseReference, {
    ...publicFamily.root,
    familyId,
    sourceRevision: workspace.root.revision,
    publishedAt: now,
    publishedBy: request.auth.uid
  });
  FAMILY_COLLECTIONS.forEach(name => publicFamily.collections[name].forEach(record => {
    batch.set(releaseReference.collection(name).doc(record.id), record);
  }));
  batch.set(publishedReference, {
    familyId,
    title: publicFamily.root.document.title,
    activeReleaseId: releaseId,
    sourceRevision: workspace.root.revision,
    publishedAt: now,
    publishedBy: request.auth.uid
  });
  const folderPath = Array.isArray(workspace.root.extensions?.registry?.folderPath)
    ? workspace.root.extensions.registry.folderPath.map(String).filter(Boolean)
    : [];
  batch.set(registryReference, {
    familyId,
    title: publicFamily.root.document.title,
    motto: publicFamily.root.document.motto || '',
    emblem: publicFamily.root.document.emblem || publicFamily.collections.houses[0]?.emblem || '',
    folderPath,
    personCount: publicFamily.collections.persons.length,
    activeReleaseId: releaseId,
    link: `Stammbaum.html?family=${encodeURIComponent(familyId)}&mode=view`,
    parentId: folderPath.at(-1)?.toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-') || '',
    sortOrder: publicFamily.root.document.title,
    publishedAt: now
  });
  batch.set(auditReference, {
    type: 'family-published',
    familyId,
    releaseId,
    sourceRevision: workspace.root.revision,
    actorId: request.auth.uid,
    createdAt: now
  });
  await batch.commit();
  return { familyId, releaseId, revision: workspace.root.revision };
});
