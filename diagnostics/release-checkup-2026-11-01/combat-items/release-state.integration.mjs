// Fresh, isolated Firestore release probes. No reset/delete endpoint is used.
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { commitInventoryTransferOperation } from '../../../firebase/functions/src/mechanics/commit-inventory-transfer.js';
import { commitGroupInventoryOperation } from '../../../firebase/functions/src/groups/commit-group-inventory.js';
import { commitItemDefinitionOperation } from '../../../firebase/functions/src/items/commit-item-definition.js';
import { commitItemRegisterOperation } from '../../../firebase/functions/src/mechanics/commit-item-register.js';
import { commitSceneRestOperation } from '../../../firebase/functions/src/mechanics/commit-scene-rest.js';
import { undoMechanicalCommentOperation } from '../../../firebase/functions/src/mechanics/commit-undo-mechanical-comment.js';
import { commitCombatEncounter } from '../../../firebase/functions/src/mechanics/commit-combat-encounter.js';
import { getActiveCombatEncounter } from '../../../firebase/functions/src/generated/combat/combat-encounter-model.js';
import { sortSceneHistory } from '../../../firebase/functions/src/mechanics/trusted-scene-history.js';
import { STANDARD_ITEMS, STANDARD_VERSION } from '../../../firebase/functions/src/generated/item-register/item-register-standard.js';
import { placeSceneItem } from '../../../firebase/functions/src/mechanics/commit-scene-item.js';
import { commitCombatCommentOperation } from '../../../firebase/functions/src/mechanics/commit-combat-comment.js';
import { prepareTestAction } from '../../../firebase/functions/tests/integration/combat-test-actions.mjs';
import { itemSegment } from '../../../firebase/functions/tests/integration/combat-test-inventory-actions.mjs';
import { compactMechanicalMetadata } from '../../../AleriaAlmanach/modules/combat/combat-resolution-storage.js';

if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8187') throw Error('Only 127.0.0.1:8187 is allowed for release state probes.');
const projectId = 'demo-aleria-release-combat-items';
const require = createRequire(new URL('../../../firebase/functions/package.json', import.meta.url));
const { initializeApp } = require('firebase-admin/app'), { getFirestore } = require('firebase-admin/firestore');
initializeApp({ projectId });
const db = getFirestore();
after(() => db.terminate());
const auth = { uid: 'isolated-release-auditor', token: { aleriaRole: 'moderator' } };
const get = async path => (await db.doc(path).get()).data();
const history = async entryId => sortSceneHistory((await db.collection('comments').where('entryId', '==', entryId).get()).docs.map(row => ({ id: row.id, ...row.data() })));
const product = id => { const found = STANDARD_ITEMS.find(item => item.id === id); assert.ok(found, id); return found; };
const sword = product('standard:waffen-rustungen:stahlschwert'), food = product('standard:gemischtwarenhandler:rationen');
const actor = (id, hp = 4, maximum = 20) => ({ id, name: id, ownerUid: auth.uid,
  inventory: { revision: 1, moneyState: { totalCopper: 100000 }, items: [] },
  combatProfile: { revision: 7, hitPoints: { current: hp, maximumOverride: maximum },
    resources: [{ id: 'mana', current: 2, maximum: 10, recovery: 'long-rest' }] } });
function addSword(record, id, held = true) {
  record.inventory.items.push({ id, name: id, category: 'weapon', definitionRef: sword.definitionRef, quantity: '1', equipped: false });
  record.combatProfile.weapons ||= [];
  record.combatProfile.weapons.push({ id: `${id}-entry`, inventoryItemId: id, name: 'Saved personal sword', weaponType: 'sword',
    damageFormula: '1d8', equipped: held, notes: 'This unrelated stored entry must survive.' });
}
const normalTransfer = (giverId, receiverId, operationId, object) => ({ giverId, receiverId, entryId: `${giverId}-scene`,
  sceneEvent: { transfer: { transferId: operationId, object } } });
async function groupFixture(prefix, { distinctActors = false } = {}) {
  const groupId = `${prefix}-group`, sameId = `${prefix}-same`, entryId = `${groupId}::session:journey`;
  const creatureId = distinctActors ? `${prefix}-creature` : sameId;
  const person = actor(sameId), creature = { ...actor(creatureId, 9, 40), entityType: 'creature', name: 'Typed test wolf' };
  await db.doc(`characters/${sameId}`).create(person); await db.doc(`creatures/${creatureId}`).create(creature);
  await db.doc(`module_store_entries/${groupId}`).create({ entryJson: JSON.stringify({ id: groupId, title: 'Isolated release crew', pages: [
    { landingPage: true, landing: { group: { threadId: entryId, guests: [
      { id: 'person', name: person.name, kind: 'character', characterId: sameId },
      { id: 'wolf', name: creature.name, kind: 'creature', creatureId }
    ] } } }, { sessionPage: true, commentThreadKey: 'journey' }
  ] }) });
  await db.doc(`group_quest_accounts/${groupId}`).create({ id: groupId, name: 'Isolated release crew', revision: 1,
    inventory: { revision: 1, items: [], moneyState: { totalCopper: 50 } } });
  return { groupId, sameId, creatureId, entryId, person, creature };
}
async function groupMoney(fixture, kind, operationId) {
  const recordId = kind === 'character' ? fixture.sameId : fixture.creatureId;
  const account = await get(`group_quest_accounts/${fixture.groupId}`), record = await get(`${kind === 'character' ? 'characters' : 'creatures'}/${recordId}`);
  return commitGroupInventoryOperation(db, auth, { groupId: fixture.groupId, operationId, action: 'withdraw',
    expectedGroupRevision: account.revision, member: { kind, recordId }, expectedMemberRevision: record.inventory.revision,
    object: { kind: 'money', currency: 'copper', quantity: 1 }, entryId: fixture.entryId });
}
async function emptyFocus(recordId, prefix) {
  const defined = await commitItemDefinitionOperation(db, auth, { action: 'save', operationId: `${prefix}-define`,
    definition: { id: `item:${prefix}`, title: 'Release test focus', category: 'arkanes',
      useDefinition: { mode: 'use', chargesMaximum: 2, chargesPerUse: 1, recovery: 'short-rest' } } });
  const before = await get(`characters/${recordId}`);
  await commitItemDefinitionOperation(db, auth, { action: 'grant', operationId: `${prefix}-grant`, recordId,
    expectedRevision: before.inventory.revision, definitionRef: defined.template.definitionRef });
  const current = await get(`characters/${recordId}`);
  current.inventory.items.find(item => item.definitionRef?.id === defined.definition.id).itemState = { chargesCurrent: 0 };
  await db.doc(`characters/${recordId}`).update({ inventory: current.inventory });
}
const rest = (entryId, participants, seconds = 3600) => ({ auth, data: { entryId, text: 'Isolated release rest.', metadata: {
  sceneRest: { type: 'short', durationSeconds: 3600, participants }, sceneTimeEvent: { anchorDay: 1, anchorSeconds: seconds }
} } });

test('real normal retries, cash, consumables and gear retain exact unrelated profiles and cannot hand off a held weapon', async () => {
  const prefix = `normal-${randomUUID()}`, giverId = `${prefix}-giver`, receiverId = `${prefix}-receiver`, bareId = `${prefix}-bare`;
  const giver = actor(giverId), receiver = actor(receiverId, 9);
  addSword(giver, 'moved'); addSword(giver, 'giver-held'); addSword(receiver, 'receiver-held');
  giver.inventory.items.push({ id: 'food', name: 'Rations', category: 'food', definitionRef: food.definitionRef, quantity: '2' });
  await db.doc(`characters/${giverId}`).create(giver); await db.doc(`characters/${receiverId}`).create(receiver);
  await db.doc(`characters/${bareId}`).create({ id: bareId, name: 'No combat sheet', ownerUid: auth.uid, inventory: { revision: 1, items: [] } });
  const money = normalTransfer(giverId, receiverId, `${prefix}-money`, { kind: 'money', currency: 'pfennig', quantity: 29 });
  const [first, retry] = await Promise.all([commitInventoryTransferOperation(db, auth, money), commitInventoryTransferOperation(db, auth, money)]);
  assert.equal(first.id, retry.id);
  assert.equal((await get(`characters/${giverId}`)).inventory.moneyState.totalCopper, 99999.71);
  assert.deepEqual((await get(`characters/${giverId}`)).combatProfile, giver.combatProfile);
  assert.deepEqual((await get(`characters/${receiverId}`)).combatProfile, receiver.combatProfile);
  const receipt = await get(`comments/${first.id}`);
  await commitInventoryTransferOperation(db, auth, normalTransfer(giverId, bareId, `${prefix}-food`, { kind: 'item', itemId: 'food', quantity: 1 }));
  assert.deepEqual((await get(`characters/${giverId}`)).combatProfile, giver.combatProfile);
  assert.equal(Object.hasOwn(await get(`characters/${bareId}`), 'combatProfile'), false);
  const held = normalTransfer(giverId, receiverId, `${prefix}-held`, { kind: 'item', itemId: 'moved', quantity: 1 });
  const beforeRejected = await get(`characters/${giverId}`);
  await assert.rejects(commitInventoryTransferOperation(db, auth, held), /ablegen/);
  assert.deepEqual(await get(`characters/${giverId}`), beforeRejected);
  const unequipped = structuredClone(giver.combatProfile.weapons); unequipped[0].equipped = false;
  await db.doc(`characters/${giverId}`).update({ 'combatProfile.weapons': unequipped });
  await commitInventoryTransferOperation(db, auth, normalTransfer(giverId, receiverId, `${prefix}-gear`, { kind: 'item', itemId: 'moved', quantity: 1 }));
  const afterGiver = await get(`characters/${giverId}`), afterReceiver = await get(`characters/${receiverId}`);
  assert.deepEqual(afterGiver.combatProfile.weapons, [giver.combatProfile.weapons[1]]);
  assert.deepEqual(afterReceiver.combatProfile.weapons.find(entry => entry.inventoryItemId === 'receiver-held'), receiver.combatProfile.weapons[0]);
  assert.deepEqual(afterGiver.combatProfile.hitPoints, giver.combatProfile.hitPoints);
  assert.deepEqual(afterReceiver.combatProfile.resources, receiver.combatProfile.resources);
  assert.deepEqual(await get(`comments/${first.id}`), receipt);
  const legacyGiverId = `${prefix}-legacy-giver`, legacyReceiverId = `${prefix}-legacy-receiver`;
  for (const [id, held] of [[legacyGiverId, false], [legacyReceiverId, true]]) {
    const legacy = actor(id);
    legacy.inventory.items.push({ id: `${id}-sword`, name: 'Legacy sword', itemDbKey: 'legacy:sword', category: 'weapon', image: '', quantity: '1', equipped: false });
    legacy.combatProfile.weapons = [{ id: `${id}-entry`, inventoryItemId: `${id}-sword`, name: 'Personal sword', weaponType: 'sword', damageFormula: '1d8', equipped: held }];
    await db.doc(`characters/${id}`).create(legacy);
  }
  const legacyBefore = (await get(`characters/${legacyReceiverId}`)).combatProfile;
  await commitInventoryTransferOperation(db, auth, normalTransfer(legacyGiverId, legacyReceiverId, `${prefix}-merge`, { kind: 'item', itemId: `${legacyGiverId}-sword`, quantity: 1 }));
  const merged = await get(`characters/${legacyReceiverId}`);
  assert.equal(merged.inventory.items[0].quantity, '2');
  assert.deepEqual(merged.combatProfile, legacyBefore);
});

test('same collection-local ID remains typed for group wallets, unique holder races and permanent group receipts', async () => {
  const prefix = `typed-${randomUUID()}`, fixture = await groupFixture(prefix);
  const receipt = await groupMoney(fixture, 'character', `${prefix}-person`);
  await groupMoney(fixture, 'creature', `${prefix}-wolf`);
  assert.equal((await get(`characters/${fixture.sameId}`)).inventory.moneyState.totalCopper, 100001);
  assert.equal((await get(`creatures/${fixture.sameId}`)).inventory.moneyState.totalCopper, 100001);
  assert.deepEqual((await get(`characters/${fixture.sameId}`)).combatProfile, fixture.person.combatProfile);
  assert.deepEqual((await get(`creatures/${fixture.sameId}`)).combatProfile, fixture.creature.combatProfile);
  const beforeAccount = await get(`group_quest_accounts/${fixture.groupId}`), beforeReceipt = await get(`comments/${receipt.commentId}`);
  for (const force of [false, true]) await assert.rejects(undoMechanicalCommentOperation({ auth, data: {
    entryId: fixture.entryId, commentId: receipt.commentId, force } }, { database: db }), /Gruppenbestands|Gruppenkasse/);
  assert.deepEqual(await get(`group_quest_accounts/${fixture.groupId}`), beforeAccount);
  assert.deepEqual(await get(`comments/${receipt.commentId}`), beforeReceipt);
  const defined = await commitItemDefinitionOperation(db, auth, { action: 'save', operationId: `${prefix}-define`,
    definition: { id: `unique:${prefix}`, kind: 'unique', title: 'One release test seal', category: 'sonstiges' } });
  const given = await commitGroupInventoryOperation(db, auth, { groupId: fixture.groupId, operationId: `${prefix}-grant`, action: 'grant',
    expectedGroupRevision: beforeAccount.revision, product: { definitionRef: defined.definition }, quantity: 1 });
  const requests = await Promise.all(['character', 'creature'].map(async kind => ({ groupId: fixture.groupId, action: 'withdraw', operationId: `${prefix}-${kind}-unique`,
    expectedGroupRevision: given.groupRevision, member: { kind, recordId: fixture.sameId },
    expectedMemberRevision: (await get(`${kind === 'character' ? 'characters' : 'creatures'}/${fixture.sameId}`)).inventory.revision,
    object: { kind: 'item', itemId: given.groupInventory.items[0].id, quantity: 1 } })));
  const raced = await Promise.allSettled(requests.map(request => commitGroupInventoryOperation(db, auth, request)));
  assert.equal(raced.filter(result => result.status === 'fulfilled').length, 1);
  const winner = raced.findIndex(result => result.status === 'fulfilled');
  const claim = await get(`item_unique_claims/${defined.definition.id}`);
  assert.equal(claim.holder.kind, winner === 0 ? 'characters' : 'creatures');
  assert.equal(claim.holder.recordId, fixture.sameId);
  assert.equal((await get(`group_quest_accounts/${fixture.groupId}`)).inventory.items.length, 0);
  assert.deepEqual((await get(`characters/${fixture.sameId}`)).combatProfile, fixture.person.combatProfile);
  assert.deepEqual((await get(`creatures/${fixture.sameId}`)).combatProfile, fixture.creature.combatProfile);
});

test('real typed encounter locks block rest and both group transfers; end unlocks recovery and later purchases block destructive undo', async () => {
  const prefix = `locks-${randomUUID()}`, fixture = await groupFixture(prefix, { distinctActors: true }), battleId = `${prefix}-battle`, restId = `${prefix}-rest`;
  await emptyFocus(fixture.sameId, prefix);
  const encounter = combatEncounter => commitCombatEncounter.run({ auth, data: { entryId: battleId, text: 'Isolated typed release fight.', metadata: { combatEncounter } } });
  const participants = ['character', 'creature'].map(kind => {
    const recordId = kind === 'character' ? fixture.sameId : fixture.creatureId;
    return { actorId: recordId, name: kind, partyId: kind, persistence: { kind, recordId } };
  });
  await encounter({ operation: 'start', encounterId: prefix, combatType: 'training', awardExperience: false, participants });
  const beforePerson = await get(`characters/${fixture.sameId}`), beforeCreature = await get(`creatures/${fixture.creatureId}`);
  await assert.rejects(commitSceneRestOperation(rest(restId, participants), { database: db }), /aktiven Kampf/);
  for (const kind of ['character', 'creature']) await assert.rejects(groupMoney(fixture, kind, `${prefix}-blocked-${kind}`), /Kampf/);
  assert.deepEqual(await get(`characters/${fixture.sameId}`), beforePerson);
  assert.deepEqual(await get(`creatures/${fixture.creatureId}`), beforeCreature);
  const active = getActiveCombatEncounter(await history(battleId));
  const firstEvent = (await history(battleId))[0], preserved = await get(`comments/${firstEvent.id}`);
  await encounter({ operation: 'end', encounterId: prefix, outcome: 'draw', expectedRevision: active.revision, awardExperience: false });
  const rested = await commitSceneRestOperation(rest(restId, participants), { database: db });
  const person = await get(`characters/${fixture.sameId}`), creature = await get(`creatures/${fixture.creatureId}`);
  assert.equal(person.combatProfile.hitPoints.current, 20); assert.equal(creature.combatProfile.hitPoints.current, 40);
  assert.equal(person.inventory.items[0].itemState.chargesCurrent, 2);
  await commitItemRegisterOperation(db, auth, { action: 'buy', operationId: `${prefix}-buy`, characterId: fixture.sameId,
    expectedRevision: person.inventory.revision, productId: food.id, standardVersion: STANDARD_VERSION, quantity: 1, unitCopper: food.priceRange.minCopper });
  const bought = await get(`characters/${fixture.sameId}`);
  await assert.rejects(undoMechanicalCommentOperation({ auth, data: { entryId: restId, commentId: rested.id } }, { database: db }), /Inventar|Besitz|Geld/);
  await assert.rejects(undoMechanicalCommentOperation({ auth: { uid: 'ordinary-player', token: { aleriaRole: 'player' } },
    data: { entryId: restId, commentId: rested.id, force: true } }, { database: db }), /Spielleitung/);
  assert.deepEqual(await get(`characters/${fixture.sameId}`), bought);
  assert.deepEqual(await get(`comments/${firstEvent.id}`), preserved);
});

test('two ordinary rest undos work in reverse order despite increasing protected revisions and restore original charges and HP', async () => {
  const prefix = `undo-${randomUUID()}`, recordId = `${prefix}-person`, entryId = `${prefix}-scene`;
  await db.doc(`characters/${recordId}`).create(actor(recordId)); await emptyFocus(recordId, prefix);
  const participants = [{ actorId: recordId, persistence: { kind: 'character', recordId } }];
  const first = await commitSceneRestOperation(rest(entryId, participants), { database: db });
  const second = await commitSceneRestOperation(rest(entryId, participants, 7200), { database: db });
  await undoMechanicalCommentOperation({ auth, data: { entryId, commentId: second.id } }, { database: db });
  await undoMechanicalCommentOperation({ auth, data: { entryId, commentId: first.id } }, { database: db });
  const restored = await get(`characters/${recordId}`);
  assert.equal(restored.combatProfile.hitPoints.current, 4);
  assert.equal(restored.inventory.items[0].itemState.chargesCurrent, 0);
  assert.equal((await history(entryId)).length, 0);
});

test('real food and gear pickups preserve unrelated held gear and a subsequent explicit weapon change still pays its preparation cost', async () => {
  const prefix = `pickup-${randomUUID()}`, actorId = `${prefix}-actor`, targetId = `${prefix}-target`, entryId = `${prefix}-battle`;
  const source = actor(actorId, 7), target = actor(targetId, 100, 100), flail = product('standard:waffen-rustungen:flegel');
  addSword(source, 'held');
  source.inventory.items.unshift({ id: 'flail-item', name: 'Flail', category: 'weapon', quantity: '1', equipped: false, definitionRef: flail.definitionRef });
  source.combatProfile.weapons.unshift({ id: 'flail', inventoryItemId: 'flail-item', name: 'Stowed flail', weaponType: 'mace', damageFormula: '3d4', equipped: false });
  target.combatProfile.armorClass = { override: 10 };
  await db.doc(`characters/${actorId}`).create(source); await db.doc(`characters/${targetId}`).create(target);
  await commitCombatEncounter.run({ auth, data: { entryId, text: 'Isolated pickup combat.', metadata: { combatEncounter: {
    operation: 'start', encounterId: prefix, combatType: 'training', awardExperience: false,
    participants: [actorId, targetId].map((id, index) => ({ actorId: id, name: id, partyId: String(index), persistence: { kind: 'character', recordId: id } }))
  } } } });
  const opening = await prepareTestAction({ entryId, actorRecord: source, targetRecords: [source], comments: await history(entryId), actionId: 'combat:wait' });
  opening.payload.metadata.operationId = `${prefix}-opening`;
  await commitCombatCommentOperation({ auth, data: { ...opening.payload, metadata: compactMechanicalMetadata(opening.payload.metadata) } }, { database: db });
  const place = (template, suffix) => placeSceneItem({ database: db, auth, input: { entryId, operationId: `${prefix}-${suffix}`,
    commentSegments: [{ kind: 'sceneitem', sceneItemDraft: { definitionChoice: 'existing', definitionRef: template.definitionRef, template: template.id, name: template.title } }] } });
  const pick = async (placed, suffix) => commitCombatCommentOperation({ auth, data: { entryId, text: 'Pick up isolated item.', metadata: {
    characterId: actorId, operationId: `${prefix}-${suffix}`, commentSegments: [itemSegment(actorId, placed.sceneItemEvent)]
  } } }, { database: db });
  const before = await get(`characters/${actorId}`), placedFood = await place(food, 'food');
  const foodPickup = await pick(placedFood, 'food-pickup');
  const preserved = await get(`comments/${foodPickup.id}`), afterFood = await get(`characters/${actorId}`);
  assert.deepEqual(afterFood.combatProfile.weapons, before.combatProfile.weapons);
  assert.equal(Object.hasOwn(afterFood.combatProfile, 'armorItems'), Object.hasOwn(before.combatProfile, 'armorItems'));
  const placedGear = await place(sword, 'sword'); await pick(placedGear, 'sword-pickup');
  const afterGear = await get(`characters/${actorId}`);
  for (const original of before.combatProfile.weapons) assert.deepEqual(afterGear.combatProfile.weapons.find(entry => entry.id === original.id), original);
  const added = afterGear.combatProfile.weapons.find(entry => entry.inventoryItemId === `scene:${placedGear.sceneItemEvent.sceneItemId}`);
  assert.ok(added); assert.equal(added.equipped, false); assert.equal(added.damageFormula, '1d8');
  const prepared = await prepareTestAction({ entryId, actorRecord: { ...afterGear, id: actorId }, targetRecords: [{ ...(await get(`characters/${targetId}`)), id: targetId }],
    comments: await history(entryId), actionId: 'weapon:flail', kind: 'combataction', loadout: { rightWeaponId: 'flail', leftWeaponId: '', shieldId: '' } });
  prepared.payload.metadata.operationId = `${prefix}-attack`;
  const committed = await commitCombatCommentOperation({ auth, data: { ...prepared.payload, metadata: compactMechanicalMetadata(prepared.payload.metadata) } }, { database: db });
  const result = committed.mechanics.commentSegments.at(-1).combatResolution;
  assert.equal(result.damage.notation, '3d4');
  assert.deepEqual(result.equipmentPreparation.costs.map(cost => [cost.resourceId, cost.amount]), [['bonus-action', 1]]);
  assert.equal(result.targetSnapshot.hitPointsAfter, 94);
  assert.equal((await get(`characters/${actorId}`)).combatProfile.hitPoints.current, 7);
  assert.deepEqual(await get(`comments/${foodPickup.id}`), preserved);
});
