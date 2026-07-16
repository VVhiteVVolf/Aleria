import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import {
  FAMILY_ENTITY_COLLECTIONS,
  familyRootRecord
} from '../../Stammbäume/assets/js/modules/family-sync/family-change-set.js';

const commit = process.argv.includes('--commit');
const force = process.argv.includes('--force');
const ownerArgument = process.argv.find(value => value.startsWith('--owner-uid='));
const ownerUid = ownerArgument?.split('=').slice(1).join('=') || '';

function workspaceFamily(record) {
  return {
    ...record.family,
    extensions: {
      ...record.family.extensions,
      registry: {
        ...(record.family.extensions?.registry || {}),
        folderPath: record.folderPath
      }
    }
  };
}

console.log(`${commit ? 'COMMIT' : 'DRY-RUN'}: ${FAMILY_REGISTRY.length} Familienakten für die Datenbank family-trees.`);
FAMILY_REGISTRY.forEach(record => {
  const family = workspaceFamily(record);
  const entityCount = FAMILY_ENTITY_COLLECTIONS.reduce((sum, name) => sum + family[name].length, 0);
  console.log(`- ${record.id}: ${family.persons.length} Personen, ${entityCount} Entitäten, ${record.folderPath.join(' > ')}`);
});

if (!commit) {
  console.log('Keine Daten geschrieben. Für die Migration --commit und optional --owner-uid=<uid> verwenden.');
  process.exit(0);
}

const application = initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'aleriaprojekt' });
const database = getFirestore(application, 'family-trees');

for (const record of FAMILY_REGISTRY) {
  const reference = database.doc(`familyWorkspaces/${record.id}`);
  const existing = await reference.get();
  if (existing.exists && !force) {
    if (ownerUid) {
      await reference.collection('members').doc(ownerUid).set({
        uid: ownerUid,
        role: 'admin',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
      console.log(`Admin-Mitgliedschaft ergänzt: ${record.id} → ${ownerUid}`);
      continue;
    }
    console.log(`Übersprungen: ${record.id} existiert bereits. --force würde die Registry-Fassung erneut schreiben.`);
    continue;
  }
  const family = workspaceFamily(record);
  const batch = database.batch();
  const now = FieldValue.serverTimestamp();
  batch.set(reference, {
    ...familyRootRecord(family),
    familyId: record.id,
    title: family.document.title,
    lifecycle: 'draft',
    revision: existing.exists ? Number(existing.data().revision || 0) + 1 : 1,
    createdAt: existing.exists ? existing.data().createdAt : now,
    createdBy: existing.exists ? existing.data().createdBy : ownerUid || 'migration',
    updatedAt: now,
    updatedBy: ownerUid || 'migration'
  });
  FAMILY_ENTITY_COLLECTIONS.forEach(name => family[name].forEach(entity => {
    batch.set(reference.collection(name).doc(entity.id), entity);
  }));
  if (ownerUid) {
    batch.set(reference.collection('members').doc(ownerUid), {
      uid: ownerUid,
      role: 'admin',
      createdAt: now,
      updatedAt: now
    }, { merge: true });
  }
  batch.set(database.doc(`registryDraftNodes/${record.id}`), {
    id: record.id,
    familyId: record.id,
    title: record.title,
    folderPath: record.folderPath,
    houseProfile: family.document.houseProfile,
    parentId: record.folderPath.at(-1)?.toLocaleLowerCase('de').replace(/[^a-z0-9]+/g, '-') || '',
    sortOrder: record.title,
    updatedAt: now,
    updatedBy: ownerUid || 'migration'
  });
  await batch.commit();
  console.log(`Migriert: ${record.id}`);
}
