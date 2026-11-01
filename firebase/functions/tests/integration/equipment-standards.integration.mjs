import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { STANDARD_ITEMS, STANDARD_VERSION } from '../../src/generated/item-register/item-register-standard.js';
import { commitItemRegisterOperation } from '../../src/mechanics/commit-item-register.js';
import { commitCombatEncounter } from '../../src/mechanics/commit-combat-encounter.js';
import { commitCombatCommentOperation } from '../../src/mechanics/commit-combat-comment.js';
import { prepareTestAction } from './combat-test-actions.mjs';
import { compactMechanicalMetadata } from '../../../../AleriaAlmanach/modules/combat/combat-resolution-storage.js';
import { sortSceneHistory } from '../../src/mechanics/trusted-scene-history.js';
import { resolveCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { deriveCombatStateFromComments } from '../../../../AleriaAlmanach/modules/combat/combat-state-model.js';
import { withEquippedCombatWeapon } from '../../../../AleriaAlmanach/modules/combat/combat-equipment-state.js';

if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8187') throw Error('Only the local Firestore emulator at 127.0.0.1:8187 is allowed.');
initializeApp({ projectId: 'demo-aleria-equipment-standards' });
const database = getFirestore();
after(() => database.terminate());
const auth = { uid: 'isolated-equipment-tester', token: { aleriaRole: 'admin' } };

test('actual purchases, pinned junior sword, pavise setup and greatsword switch share authoritative rules without rewriting earlier posts', async () => {
  const suffix = randomUUID(), actorId = `equipment-${suffix}`, targetId = `dummy-${suffix}`, entryId = `battle-${suffix}`;
  const oldReference = { id: 'standard:waffen-rustungen:ritterschwert', revision: '5ae37b84286373b6d4569563' };
  const personalSword = { id: 'personal-sword', inventoryItemId: 'old-sword', name: 'Persönliches Jungritterschwert', damageFormula: '1d8',
    versatileDamageFormula: '1d10', weaponType: 'sword', properties: 'Vielseitig', equipped: true };
  const actorRef = database.doc(`characters/${actorId}`), targetRef = database.doc(`characters/${targetId}`);
  await actorRef.set({ id: actorId, name: 'Isolierte Prüffigur', ownerUid: auth.uid,
    inventory: { revision: 1, moneyState: { totalCopper: 1000000 }, items: [{ id: 'old-sword', definitionRef: oldReference, name: personalSword.name, quantity: '1', equipped: true }] },
    combatProfile: { weapons: [personalSword], armorItems: [], hitPoints: { current: 7, maximumOverride: 30 }, progression: { level: 1 } } });
  await targetRef.set({ id: targetId, name: 'Isoliertes Übungsziel', ownerUid: auth.uid, inventory: { items: [] },
    combatProfile: { weapons: [], armorClass: { override: 10 }, hitPoints: { current: 80, maximumOverride: 80 }, progression: { level: 1 } } });
  for (const sourceId of ['pavese', 'ritterschwert']) {
    const product = STANDARD_ITEMS.find(item => item.id === `standard:waffen-rustungen:${sourceId}`);
    assert.ok(product);
    const record = (await actorRef.get()).data();
    await commitItemRegisterOperation(database, auth, { action: 'buy', operationId: `${suffix}-buy-${sourceId}`, characterId: actorId,
      productId: product.id, standardVersion: STANDARD_VERSION, expectedRevision: record.inventory.revision,
      quantity: 1, unitCopper: product.priceRange.minCopper });
  }
  const bought = (await actorRef.get()).data();
  const pavise = bought.combatProfile.armorItems.find(item => item.kind === 'shield');
  const greatsword = bought.combatProfile.weapons.find(item => item.weaponProfileId === 'greatsword');
  assert.equal(pavise.armorClassBonus, 5);
  assert.equal(pavise.armorRuleVersion, 2);
  assert.equal(greatsword.damageFormula, '1d12');
  assert.equal(bought.combatProfile.weapons.find(item => item.id === personalSword.id).damageFormula, '1d8');
  assert.deepEqual(bought.inventory.items.find(item => item.id === 'old-sword').definitionRef, oldReference);
  await commitCombatEncounter.run({ auth, data: { entryId, text: 'Isolierte Ausrüstungsprobe.', metadata: { combatEncounter: {
    operation: 'start', encounterId: suffix, combatType: 'training', awardExperience: false,
    participants: [actorId, targetId].map((id, index) => ({ actorId: id, name: id, partyId: String(index), persistence: { kind: 'character', recordId: id } }))
  } } } });
  const history = async () => sortSceneHistory((await database.collection('comments').where('entryId', '==', entryId).get()).docs.map(doc => ({ id: doc.id, ...doc.data() })));
  let operation = 0;
  const act = async (actionId, loadout = null, attackTarget = actorId) => {
    const actorRecord = (await actorRef.get()).data(), targetRecord = attackTarget === actorId ? actorRecord : (await targetRef.get()).data();
    const prepared = await prepareTestAction({ entryId, actorRecord, targetRecords: [targetRecord], comments: await history(), actionId, loadout, kind: 'combataction' });
    prepared.payload.metadata.operationId = `${suffix}-act-${++operation}`;
    return commitCombatCommentOperation({ auth, data: { ...prepared.payload, metadata: compactMechanicalMetadata(prepared.payload.metadata) } }, { database });
  };
  const first = await act('combat:wait');
  const preserved = (await database.doc(`comments/${first.id}`).get()).data();
  const loadout = { rightWeaponId: personalSword.id, leftWeaponId: '', shieldId: pavise.id };
  const setup = await act('combat:wait', loadout);
  const result = setup.mechanics.commentSegments[0].combatResolution;
  assert.deepEqual(result.equipmentPreparation.costs.map(cost => [cost.resourceId, cost.amount]), [['action', 1], ['bonus-action', 1]]);
  assert.equal(result.actorResourceSnapshot.after.find(resource => resource.id === 'action').current, 0);
  assert.equal(result.actorResourceSnapshot.after.find(resource => resource.id === 'bonus-action').current, 0);
  const state = deriveCombatStateFromComments(await history()).get(actorId);
  const active = resolveCombatProfile(withEquippedCombatWeapon((await actorRef.get()).data(), state.equippedWeaponId, state.offHandWeaponId, state.supportEquipment));
  assert.deepEqual([active.totalDefense, active.movement, active.initiative], [15, 6, -2]);
  const retained = await act('combat:wait', loadout);
  assert.equal(retained.mechanics.commentSegments[0].combatResolution.equipmentPreparation, undefined);
  const strike = await act(`weapon:${greatsword.id}`, { rightWeaponId: greatsword.id, leftWeaponId: '', shieldId: '' }, targetId);
  const attack = strike.mechanics.commentSegments[0].combatResolution;
  assert.equal(attack.damage.notation, '1d12');
  assert.equal(attack.targetSnapshot.hitPointsAfter, 74);
  const afterState = deriveCombatStateFromComments(await history()).get(actorId);
  const after = resolveCombatProfile(withEquippedCombatWeapon((await actorRef.get()).data(), afterState.equippedWeaponId, afterState.offHandWeaponId, afterState.supportEquipment));
  assert.deepEqual([after.totalDefense, after.movement, after.initiative], [10, 9, 0]);
  assert.equal((await actorRef.get()).data().combatProfile.hitPoints.current, 7);
  assert.deepEqual((await database.doc(`comments/${first.id}`).get()).data(), preserved);
});

test('a purchased new Buckler changes actual melee hit outcomes but not thrown weapons or repeated throwing techniques', async () => {
  const suffix = randomUUID(), attackerId = `buckler-attacker-${suffix}`, defenderId = `buckler-owner-${suffix}`, entryId = `buckler-battle-${suffix}`;
  const attackerRef = database.doc(`characters/${attackerId}`), defenderRef = database.doc(`characters/${defenderId}`);
  const axe = { id: 'held-axe', name: 'Prüfaxt', weaponType: 'axe', damageFormula: '1d6', range: 'Nahkampf', proficient: false, equipped: true };
  await attackerRef.set({ id: attackerId, name: 'Isolierter Bucklerprüfer', ownerUid: auth.uid, inventory: { items: [] },
    combatProfile: { hitPoints: { current: 40, maximumOverride: 40 }, weapons: [axe,
      { ...axe, id: 'thrown-axe', name: 'Geworfene Prüfaxt', range: 'Wurf 6/18 m', equipped: false }],
    techniques: [{ id: 'repeated-throw', name: 'Geprüfte Wurffolge', active: true, weaponTypes: ['axe'],
      range: 'Waffenreichweite', attackRange: 'ranged', damageFormula: '1d6',
      effects: [{ type: 'damage', target: 'target', on: 'hit', formula: '1d6' }],
      followUpAttack: { enabled: true, inheritWeapon: true, afterMiss: true, repeatCount: 2 } }] } });
  await defenderRef.set({ id: defenderId, name: 'Isolierter Bucklerbesitzer', ownerUid: auth.uid,
    inventory: { revision: 1, moneyState: { totalCopper: 1000000 }, items: [] },
    combatProfile: { hitPoints: { current: 80, maximumOverride: 80 }, armorClass: { override: 10 },
      weapons: [{ ...axe, id: 'defender-axe' }], armorItems: [] } });
  const product = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:buckler');
  assert.equal(product.combatDefinition.armorClassBonus, 0, 'This probe requires the new generated Buckler head.');
  await commitItemRegisterOperation(database, auth, { action: 'buy', operationId: `${suffix}-buy`, characterId: defenderId,
    productId: product.id, standardVersion: STANDARD_VERSION, expectedRevision: 1, quantity: 1, unitCopper: product.priceRange.minCopper });
  const bought = (await defenderRef.get()).data();
  const buckler = bought.combatProfile.armorItems.find(item => item.kind === 'shield');
  assert.ok(buckler, 'A zero-static-RK shield must still register in combat equipment on purchase.');
  assert.equal(buckler.triggerRules[0].attackRange, 'melee');
  await commitCombatEncounter.run({ auth, data: { entryId, text: 'Isolierte Bucklerprobe.', metadata: { combatEncounter: {
    operation: 'start', encounterId: suffix, combatType: 'training', awardExperience: false,
    participants: [attackerId, defenderId].map((id, index) => ({ actorId: id, name: id, partyId: String(index), persistence: { kind: 'character', recordId: id } }))
  } } } });
  const history = async () => sortSceneHistory((await database.collection('comments').where('entryId', '==', entryId).get()).docs.map(doc => ({ id: doc.id, ...doc.data() })));
  let operation = 0;
  const act = async (actingRef, targetRef, actionId, loadout) => {
    const prepared = await prepareTestAction({ entryId, actorRecord: (await actingRef.get()).data(), targetRecords: [(await targetRef.get()).data()],
      comments: await history(), actionId, loadout, natural: 10, kind: 'combataction' });
    prepared.payload.metadata.operationId = `${suffix}-act-${++operation}`;
    return commitCombatCommentOperation({ auth, data: { ...prepared.payload, metadata: compactMechanicalMetadata(prepared.payload.metadata) } }, { database });
  };
  const opening = await act(defenderRef, defenderRef, 'combat:wait', { rightWeaponId: 'defender-axe', leftWeaponId: '', shieldId: buckler.id });
  const preserved = (await database.doc(`comments/${opening.id}`).get()).data();
  const melee = (await act(attackerRef, defenderRef, 'weapon:held-axe')).mechanics.commentSegments[0].combatResolution;
  assert.deepEqual([melee.attack.targetDefense, melee.attack.hit], [11, false]);
  const thrown = (await act(attackerRef, defenderRef, 'weapon:thrown-axe', { rightWeaponId: 'thrown-axe', leftWeaponId: '', shieldId: '' })).mechanics.commentSegments[0].combatResolution;
  assert.deepEqual([thrown.attack.targetDefense, thrown.attack.hit], [10, true]);
  const repeated = (await act(attackerRef, defenderRef, 'technique:repeated-throw', { rightWeaponId: 'held-axe', leftWeaponId: '', shieldId: '' })).mechanics.commentSegments[0].combatResolution;
  assert.deepEqual([repeated.attack, ...repeated.followUpAttacks.map(entry => entry.attack)].map(attack => [attack.targetDefense, attack.hit]),
    [[10, true], [10, true], [10, true]]);
  assert.deepEqual((await database.doc(`comments/${opening.id}`).get()).data(), preserved);
  assert.equal((await defenderRef.get()).data().inventory.items.length, 1);
  assert.equal((await defenderRef.get()).data().combatProfile.hitPoints.current, 68);
});
