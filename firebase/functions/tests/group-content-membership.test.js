import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { database } from './fixtures/combat-transaction-database.js';
import { readQuestGroupAccount } from '../src/quests/quest-group-account.js';
import { commitGroupInventoryOperation } from '../src/groups/commit-group-inventory.js';
import { upgradeEntry as browserUpgradeEntry } from '../../../AleriaAlmanach/modules/group-adventures/group-adventures-classic-api.mjs';
import { resolveGroupRoster } from '../src/generated/landing/group-landing-roster.js';

const gm = { uid: 'gm', token: { aleriaRole: 'moderator' } };
const ids = { ylva: 'bSYZYAEOwiRgy44f6OmO', freki: 'companion-ylva-freki', arian: 'bFUmD1snc4TSIGLRPuSx' };
const person = (id, name) => ({ id, name, inventory: { revision: 1, items: [], moneyState: { totalCopper: 0 } },
  combatProfile: { revision: 1, hitPoints: { current: 7 }, resources: [{ id: 'mana', current: 2 }] } });
const source = async name => JSON.parse(await readFile(new URL(`../../../AleriaAlmanach/modules/${name}`, import.meta.url), 'utf8')).entry;
const gawainSource = () => source('gawain-duncan/source/gawain-duncan-online-2026-11-01.json');
const anarautSource = () => source('group-adventures/source/modul-1782120382311-2026-11-01.json');
const group = entry => entry.pages.find(page => page.landing?.group)?.landing.group;
const request = (groupId, kind, recordId, operationId = recordId) => ({ groupId, operationId, action: 'withdraw', member: { kind, recordId },
  object: { kind: 'money', currency: 'copper', quantity: 1 }, expectedGroupRevision: 1, expectedMemberRevision: 1 });
function seed(entry) {
  return database({ [`module_store_entries/${entry.id}`]: { entryJson: JSON.stringify(entry) },
    [`group_quest_accounts/${entry.id}`]: { id: entry.id, revision: 1, inventory: { revision: 1, items: [], moneyState: { totalCopper: 10 } } },
    [`characters/${ids.ylva}`]: person(ids.ylva, 'Ylva Wolfshorn'), [`creatures/${ids.freki}`]: person(ids.freki, 'Freki'),
    [`characters/${ids.arian}`]: person(ids.arian, 'Arian Saethwyr'), 'characters/outsider': person('outsider', 'Fremder'),
    'group_inventory_transactions/historical': { actorUid: 'gm', operationId: 'original', groupId: entry.id, member: { kind: 'character', recordId: 'old-id' }, at: '1740-03-09' } });
}

test('raw Gawain snapshot exposes the same new Ylva/Freki memberships on server and browser without writing content or old receipts', async () => {
  const raw = await gawainSource(), before = structuredClone(raw), expected = browserUpgradeEntry(raw);
  assert.ok(!(group(raw)?.guests || []).some(row => row.characterId === ids.ylva || row.creatureId === ids.freki));
  for (const [kind, id] of [['character', ids.ylva], ['creature', ids.freki]]) {
    const db = seed(raw), moduleBefore = structuredClone(db.data.get(`module_store_entries/${raw.id}`)), historical = structuredClone(db.data.get('group_inventory_transactions/historical'));
    const account = await db.runTransaction(tx => readQuestGroupAccount(db, tx, raw.id));
    assert.deepEqual(account.entry, expected);
    assert.deepEqual(account.group, group(expected));
    assert.deepEqual(account.entry.pages.map(page => page.commentThreadKey), raw.pages.map(page => page.commentThreadKey));
    assert.ok(resolveGroupRoster(account.entry, account.group).some(member => member.kind === kind && (member.characterId || member.creatureId) === id));
    const path = `${kind === 'creature' ? 'creatures' : 'characters'}/${id}`, profile = structuredClone(db.data.get(path).combatProfile);
    const result = await commitGroupInventoryOperation(db, gm, request(raw.id, kind, id));
    assert.equal(result.memberInventory.moneyState.totalCopper, 1);
    assert.deepEqual(db.data.get(path).combatProfile.hitPoints, profile.hitPoints);
    assert.deepEqual(db.data.get(path).combatProfile.resources, profile.resources);
    assert.deepEqual(db.data.get(`module_store_entries/${raw.id}`), moduleBefore);
    assert.deepEqual(db.data.get('group_inventory_transactions/historical'), historical);
    assert.equal((await commitGroupInventoryOperation(db, gm, request(raw.id, kind, id))).receiptId, result.receiptId);
    assert.equal(db.data.get(path).inventory.moneyState.totalCopper, 1);
  }
  assert.deepEqual(raw, before);
});

test('raw Anaraut snapshot includes Arian through the shared second hierarchy and saved double roles pay a single member once', async () => {
  const raw = await anarautSource(), expected = browserUpgradeEntry(raw), db = seed(raw);
  assert.equal(raw.pages.filter(page => page.hierarchyPage).length, 1);
  const account = await db.runTransaction(tx => readQuestGroupAccount(db, tx, raw.id));
  assert.deepEqual(account.entry, expected);
  assert.equal(account.entry.pages.filter(page => page.hierarchyPage).length, 2);
  for (const page of raw.pages) assert.ok(account.entry.pages.some(projected => projected.commentThreadKey === page.commentThreadKey));
  await commitGroupInventoryOperation(db, gm, request(raw.id, 'character', ids.arian));
  const saved = structuredClone(expected);
  saved.pages.find(page => page.hierarchyPage).hierarchy.trees[0].levels[0].nodes.push({ title: 'Leutnant', subtitle: 'Arian Saethwyr', portrait: '' });
  const doubleDb = seed(saved), second = await doubleDb.runTransaction(tx => readQuestGroupAccount(doubleDb, tx, saved.id));
  assert.deepEqual(second.entry, saved);
  const roster = resolveGroupRoster(second.entry, second.group, [person(ids.arian, 'Arian Saethwyr')]);
  const arians = roster.filter(row => row.characterId === ids.arian);
  assert.equal(arians.length, 1); assert.equal(arians[0].positions.length, 2);
  const input = request(saved.id, 'character', ids.arian), first = await commitGroupInventoryOperation(doubleDb, gm, input);
  const retry = await commitGroupInventoryOperation(doubleDb, gm, input);
  assert.equal(first.receiptId, retry.receiptId);
  assert.equal(doubleDb.data.get(`characters/${ids.arian}`).inventory.moneyState.totalCopper, 1);
  assert.deepEqual(doubleDb.data.get(`module_store_entries/${saved.id}`), { entryJson: JSON.stringify(saved) });
});

test('saved content versions and unavailable flags remain authoritative and do not admit outsiders', async () => {
  const saved = browserUpgradeEntry(await gawainSource());
  group(saved).guests = [];
  const db = seed(saved), before = structuredClone([...db.data]);
  for (const [kind, id] of [['character', ids.ylva], ['creature', ids.freki], ['character', 'outsider']]) {
    await assert.rejects(commitGroupInventoryOperation(db, gm, request(saved.id, kind, id)), /Gruppenhierarchie/);
    assert.deepEqual([...db.data], before);
  }
  for (const flag of ['hidden', 'archived', 'isTemplate']) {
    const raw = await gawainSource(); raw[flag] = true;
    const unavailable = seed(raw), original = structuredClone([...unavailable.data]);
    await assert.rejects(unavailable.runTransaction(tx => readQuestGroupAccount(unavailable, tx, raw.id)), /nicht mehr verfügbar/);
    assert.deepEqual([...unavailable.data], original);
  }
});

test('unknown modules retain their exact saved entry and membership scope', async () => {
  const entry = { id: 'unrelated', title: 'Eigene Gruppe', pages: [{ landingPage: true, landing: { group: { members: [], guests: [] } } }], custom: { keep: 42 } };
  const db = seed(entry), before = structuredClone([...db.data]);
  const account = await db.runTransaction(tx => readQuestGroupAccount(db, tx, entry.id));
  assert.deepEqual(account.entry, entry);
  await assert.rejects(commitGroupInventoryOperation(db, gm, request(entry.id, 'character', ids.ylva)), /Gruppenhierarchie/);
  assert.deepEqual([...db.data], before);
});
