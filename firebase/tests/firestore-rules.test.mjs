import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test, { after, before } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  writeBatch
} from 'firebase/firestore';

const PROJECT_ID = 'aleria-family-rules-test';
const DATABASE_ID = 'family-trees';
let environment;

function baseWorkspace(revision = 1, owner = 'owner') {
  return {
    familyId: 'haus-test',
    schema: 'aleria.family-tree',
    schemaVersion: 1,
    title: 'Haus Test',
    document: { id: 'haus-test', title: 'Haus Test' },
    lineage: {},
    presentation: {},
    view: {},
    extensions: {},
    lifecycle: 'draft',
    revision,
    createdAt: 'test',
    createdBy: owner,
    updatedAt: 'test',
    updatedBy: owner
  };
}

before(async () => {
  environment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      databaseId: DATABASE_ID,
      rules: await readFile(new URL('../firestore.family-trees.rules', import.meta.url), 'utf8'),
      host: '127.0.0.1',
      port: 8080
    }
  });
});

after(async () => environment?.cleanup());

test.beforeEach(async () => environment.clearFirestore());

test('verweigert unangemeldeten Zugriff auf Arbeitsfassungen', async () => {
  await environment.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(DATABASE_ID), 'familyWorkspaces/haus-test'), baseWorkspace());
  });
  const database = environment.unauthenticatedContext().firestore(DATABASE_ID);
  await assertFails(getDoc(doc(database, 'familyWorkspaces/haus-test')));
});

test('erlaubt öffentliche Releases ohne Anmeldung', async () => {
  await environment.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(DATABASE_ID), 'publishedFamilies/haus-test'), { activeReleaseId: 'r1' });
  });
  const database = environment.unauthenticatedContext().firestore(DATABASE_ID);
  await assertSucceeds(getDoc(doc(database, 'publishedFamilies/haus-test')));
});

test('erlaubt dem Gründer eine atomare Arbeitsfassung mit Admin-Mitgliedschaft', async () => {
  const database = environment.authenticatedContext('owner', { email: 'owner@example.test' }).firestore(DATABASE_ID);
  const batch = writeBatch(database);
  batch.set(doc(database, 'familyWorkspaces/haus-test'), baseWorkspace());
  batch.set(doc(database, 'familyWorkspaces/haus-test/members/owner'), {
    uid: 'owner', role: 'admin', email: 'owner@example.test', createdAt: 'test', updatedAt: 'test'
  });
  batch.set(doc(database, 'familyWorkspaces/haus-test/persons/a'), { id: 'a', name: 'A' });
  batch.set(doc(database, 'familyWorkspaces/haus-test/changeSets/0000000001'), {
    revision: 1, actorId: 'owner', createdAt: 'test', changes: {}
  });
  await assertSucceeds(batch.commit());
});

test('erlaubt Editoren nur revisionsgebundene Änderungen', async () => {
  await environment.withSecurityRulesDisabled(async context => {
    const database = context.firestore(DATABASE_ID);
    await setDoc(doc(database, 'familyWorkspaces/haus-test'), baseWorkspace(1));
    await setDoc(doc(database, 'familyWorkspaces/haus-test/members/editor'), { uid: 'editor', role: 'editor' });
    await setDoc(doc(database, 'familyWorkspaces/haus-test/persons/a'), { id: 'a', name: 'A' });
  });
  const database = environment.authenticatedContext('editor').firestore(DATABASE_ID);
  await assertFails(setDoc(doc(database, 'familyWorkspaces/haus-test/persons/a'), { id: 'a', name: 'Ungesichert' }));
  const batch = writeBatch(database);
  batch.set(doc(database, 'familyWorkspaces/haus-test'), {
    ...baseWorkspace(2),
    updatedBy: 'editor'
  });
  batch.set(doc(database, 'familyWorkspaces/haus-test/persons/a'), { id: 'a', name: 'Revisionssicher' });
  batch.set(doc(database, 'familyWorkspaces/haus-test/changeSets/0000000002'), {
    revision: 2, actorId: 'editor', createdAt: 'test', changes: {}
  });
  await assertSucceeds(batch.commit());
});

test('verweigert Viewern Schreibzugriffe', async () => {
  await environment.withSecurityRulesDisabled(async context => {
    const database = context.firestore(DATABASE_ID);
    await setDoc(doc(database, 'familyWorkspaces/haus-test'), baseWorkspace(1));
    await setDoc(doc(database, 'familyWorkspaces/haus-test/members/viewer'), { uid: 'viewer', role: 'viewer' });
  });
  const database = environment.authenticatedContext('viewer').firestore(DATABASE_ID);
  await assertSucceeds(getDoc(doc(database, 'familyWorkspaces/haus-test')));
  await assertFails(setDoc(doc(database, 'familyWorkspaces/haus-test'), { ...baseWorkspace(2), updatedBy: 'viewer' }));
});

test('öffentliche Collections bleiben für Browser schreibgeschützt', async () => {
  const database = environment.authenticatedContext('owner', { aleriaRole: 'admin' }).firestore(DATABASE_ID);
  await assertFails(setDoc(doc(database, 'publishedFamilies/haus-test'), { activeReleaseId: 'fake' }));
  assert.ok(true);
});
