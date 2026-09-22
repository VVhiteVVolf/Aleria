import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { writeFile, readFile } from 'node:fs/promises';
import { characters, fighters, ids, database, reset, strike, history, current, record, ground, commit, itemSegment, useItem, place, undo, encounter, threadId, CheckupDice, prepareTestAction } from './item-duel-context.mjs';
import { getActiveCombatEncounter } from '../../../../AleriaAlmanach/modules/combat/combat-encounter-model.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../../../../AleriaAlmanach/modules/combat/combat-state-model.js';
import { resolveCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { renderCombatEvaluation } from '../../../../AleriaAlmanach/modules/combat/ui/combat-ui.js';
import { inventoryCardModel } from '../../../../AleriaAlmanach/modules/character-inventory/character-inventory-card-model.js';
import { synchronizeEquipmentFromInventory } from '../../../../AleriaAlmanach/modules/character-equipment/character-equipment-sync.js';
import { resetCommentScopedResources } from '../../../../AleriaAlmanach/modules/combat/combat-action-economy.js';
import { applySceneItemInteraction } from '../../../../AleriaAlmanach/modules/scene-items/scene-item-interaction.js';

const report = { characters: characters.map(character => ({ name: character.name, hasCombatSheet: Boolean(character.combatProfile) })), checks: [], duels: [], examples: [] };
const sword = id => `weapon:${id === ids[0] ? 'gildas-gafyr-duty-sword' : 'gawain-draig-knightly-sword'}`;
const firstHit = 'technique:combat-style-drachentanz-jungdrache-01-erster-hieb';
after(async () => {
  if (process.env.ITEM_DUEL_REPORT) await writeFile(process.env.ITEM_DUEL_REPORT, JSON.stringify(report, null, 2) + '\n');
  await database.terminate();
});

for (const character of characters) test(`${character.name}: actual combat sheet available`, t => {
  if (!character.combatProfile) return t.skip('Character entry only; no combat sheet. No invented substitute stats.');
  const profile = resolveCombatProfile(character);
  assert.ok(profile.currentHitPoints > 0 && profile.weapons.some(weapon => weapon.weaponType !== 'unarmed'));
});

test('Gawain archive, sheet, inventory and cards share one set of items and equipment effects', async () => {
  const exported = JSON.parse(await readFile(new URL('../../../../Charakter%20Archiv%20Exporte/gawain-draig.json', import.meta.url), 'utf8')).character;
  const gawain = fighters[1];
  assert.deepEqual(gawain.inventory.items, exported.inventory.items);
  assert.equal(new Set(gawain.inventory.items.map(item => item.id)).size, gawain.inventory.items.length);
  const synced = synchronizeEquipmentFromInventory({ inventory: gawain.inventory, combatProfile: gawain.combatProfile, characterId: gawain.id });
  for (const [kind, rule] of [['weapon', 'drachenzahn-drachenkerbe'], ['armor', 'silberschuppe-schuppenpolster']]) {
    const item = gawain.inventory.items.find(item => item.category === kind);
    const definition = synced.combatProfile[kind === 'weapon' ? 'weapons' : 'armorItems'].find(entry => entry.inventoryItemId === item.id);
    if (kind === 'weapon') assert.ok(definition.triggerRules.some(entry => entry.id === rule));
    else assert.equal(definition.damageProtection.amount, 2);
    assert.ok(inventoryCardModel(item).effects.length);
    assert.ok(item.image);
  }
  report.checks.push('Archive/inventory/equipment/card identity and traits');
});

test('Drachenzahn and Silberschuppe apply on the real server and are visible in stored combat bubbles', async () => {
  await reset();
  const normal = await strike({ attacker: ids[1], target: ids[0], actionId: sword(ids[1]), natural: 18 });
  assert.equal(normal.actual.ruleApplications.some(rule => rule.ruleId === 'drachenzahn-drachenkerbe'), false);
  const critical = await strike({ attacker: ids[1], target: ids[0], actionId: sword(ids[1]), natural: 20 });
  assert.ok(critical.actual.ruleApplications.some(rule => rule.ruleId === 'drachenzahn-drachenkerbe'));
  assert.match(renderCombatEvaluation({ combatResolution: critical.actual }), /Drachenkerbe/);
  report.examples.push({ label: 'Drachenzahn critical', resolution: critical.actual });
  await reset();
  const technique = await strike({ attacker: ids[1], target: ids[0], actionId: firstHit, natural: 20 });
  assert.ok(technique.actual.ruleApplications.some(rule => rule.ruleId === 'drachenzahn-drachenkerbe'));
  const first = await prepareTestAction({ entryId: threadId, actorRecord: await record(ids[0]), targetRecords: [await record(ids[1])], comments: await history(), actionId: sword(ids[0]), natural: 18 });
  const two = await strike({ actionId: firstHit, natural: 18, priorSegments: [first.segment] });
  const resolutions = two.saved.mechanics.commentSegments.map(segment => segment.combatResolution);
  assert.equal(resolutions[0].damage.damageReduction, 2);
  assert.equal(resolutions[1].damage.damageReduction, 2);
  assert.match(renderCombatEvaluation({ combatResolution: resolutions[0] }), /Silberschuppe/);
  report.examples.push({ label: 'Silberschuppe first hit', resolution: resolutions[0] });
  const next = await strike({ natural: 18 });
  assert.equal(next.actual.damage.damageReduction, 2);
  const stored = (await history()).find(comment => comment.id === next.saved.id).commentSegments[0].combatResolution;
  assert.match(renderCombatEvaluation({ combatResolution: stored }), /Silberschuppe/);
  report.checks.push('Weapon normal/critical/technique and armor every matching hit: client/server/stored bubble parity');
});

for (const failure of [false, true]) for (let roll = 1; roll <= 10; roll++) test(`${failure ? 'Fumble' : 'Critical hit'} W10=${roll}: stored effect, next own post and expiry`, async () => {
  await reset();
  const { actual } = await strike({ natural: failure ? 1 : 20, roll });
  const effect = actual.criticalConsequence;
  assert.equal(effect.roll, roll);assert.equal(effect.kind, failure ? 'failure' : 'hit');
  assert.match(renderCombatEvaluation({ combatResolution: actual }), new RegExp(effect.name));
  if (effect.condition) {
    let affected = await current(effect.actorId);
    assert.ok(affected.temporaryConditions.some(condition => condition.id === effect.condition.id));
    if (effect.condition.blockedResource) assert.equal(affected.resources.find(resource => resource.id === effect.condition.blockedResource).current, 0);
    const placed = await place({ name: 'Übungsglocke', description: 'Die Glocke markiert das Ende eines Manövers.' });
    await useItem(effect.actorId, itemSegment(effect.actorId, { ...placed.sceneItemEvent, available: true }, { operation: 'use' }));
    affected = await current(effect.actorId);
    assert.equal(affected.temporaryConditions.some(condition => condition.id === effect.condition.id), false);
  } else {
    assert.equal((await ground()).size, 1);
    assert.equal((await current(effect.actorId)).weaponUnavailable, true);
  }
  report.checks.push(`${failure ? 'failure' : 'hit'}:${roll}:${effect.name}`);
});

for (const paymentResource of ['bonus-action', 'action', 'reaction', 'special-action']) test(`Disarm/pickup: ${paymentResource}, attack afterwards, undo and duplicate rejection`, async () => {
  await reset();
  await strike({ attacker: ids[1], target: ids[0], natural: 1, roll: 10 });
  const entry = [...(await ground()).values()][0];
  await assert.rejects(strike({ attacker: ids[1], target: ids[0], natural: 15 }), /Entwaffnet/);
  const picked = await useItem(ids[1], itemSegment(ids[1], entry, { paymentResource }));
  const snapshot = picked.mechanics.commentSegments[0].inventoryUse.resourceSnapshot;
  assert.equal(snapshot.before.find(resource => resource.id === paymentResource).current - snapshot.after.find(resource => resource.id === paymentResource).current, 1);
  assert.equal((await current(ids[1])).weaponUnavailable, false);
  await assert.rejects(useItem(ids[1], itemSegment(ids[1], entry)), /nicht mehr verfügbar/);
  const attacked = await strike({ attacker: ids[1], target: ids[0], natural: 15 });
  await assert.rejects(undo(picked.id), /neuere Handlung/);
  await undo(attacked.saved.id);await undo(picked.id);
  assert.equal((await current(ids[1])).weaponUnavailable, true);
  report.checks.push(`pickup:${paymentResource}:undo`);
});

test('Foreign pickup preserves Drachenzahn once, blocks the former owner and restores both records on undo', async () => {
  await reset();await strike({ attacker: ids[1], target: ids[0], natural: 1, roll: 10 });
  const entry = [...(await ground()).values()][0];
  const picked = await useItem(ids[0], itemSegment(ids[0], entry));
  assert.equal((await record(ids[1])).inventory.items.some(item => item.id === entry.item.id), false);
  const recipient = await record(ids[0]);
  const weapon = recipient.combatProfile.weapons.find(weapon => weapon.triggerRules?.some(rule => rule.id === 'drachenzahn-drachenkerbe'));
  assert.ok(weapon, 'Transferred weapon retains its mechanical effect');
  assert.equal(weapon.equipped, false, 'Picking up foreign gear does not silently equip it');
  assert.equal(recipient.inventory.items.filter(item => item.name === entry.item.name).length, 1);
  const attack = await strike({ attacker: ids[0], target: ids[1], actionId: `weapon:${weapon.id}`, natural: 20,
    loadout: { rightWeaponId: weapon.id, leftWeaponId: '' } });
  assert.ok(attack.actual.ruleApplications.some(rule => rule.ruleId === 'drachenzahn-drachenkerbe'));
  await undo(attack.saved.id);
  await undo(picked.id);
  assert.equal((await record(ids[1])).inventory.items.filter(item => item.id === entry.item.id).length, 1);
  assert.equal((await record(ids[0])).inventory.items.some(item => item.name === entry.item.name), false);
  report.checks.push('Foreign pickup preserves unique item and weapon trait, undo both inventories');
});

test('Combined pickup and attack pay once; unaffordable payment is atomic; a different weapon remains usable', async () => {
  await reset();await strike({ attacker: ids[1], target: ids[0], natural: 1, roll: 10 });
  const entry = [...(await ground()).values()][0];
  const base = resolveCombatProfile(await record(ids[1]));
  const state = deriveCombatStateFromComments(await history()).get(ids[1]);
  const actor = overlayCombatHitPointState(base, { ...state, resources: resetCommentScopedResources(base.resources) });
  const pickup = itemSegment(ids[1], entry);
  pickup.inventoryUse = applySceneItemInteraction({ entry, actor, operation: 'pickup', usageId: 'local-preview' }).inventoryUse;
  const combined = await strike({ attacker: ids[1], target: ids[0], natural: 18, priorSegments: [pickup] });
  assert.equal(combined.actual.actorResourceSnapshot.after.find(resource => resource.id === 'bonus-action').current, 0);
  assert.equal((await ground()).get(entry.sceneItemId).available, false);
  await undo(combined.saved.id);
  const before = await history();
  await assert.rejects(useItem(ids[1], itemSegment(ids[1], entry, { paymentResource: 'aura-focus' })), /Aktionspunkt/);
  assert.equal((await history()).length, before.length);
  await assert.rejects(strike({ attacker: ids[1], target: ids[0], actionId: firstHit }), /Entwaffnet/);
  const changed = await strike({ attacker: ids[1], target: ids[0], actionId: 'weapon:gawain-draig-dagger', natural: 20,
    loadout: { rightWeaponId: 'gawain-draig-dagger', leftWeaponId: '' } });
  assert.equal(changed.actual.ruleApplications.some(rule => rule.ruleId === 'drachenzahn-drachenkerbe'), false);
  report.checks.push('Pickup+attack same post, unavailable Aura payment rejected, disarmed technique blocked, dagger remains usable');
});

test('Removing armor in inventory removes its mechanical protection; equipped armor restores it', async () => {
  const unarmored = structuredClone(fighters);
  const armor = unarmored[1].inventory.items.find(item => item.category === 'armor');
  armor.equipped = false;
  const synced = synchronizeEquipmentFromInventory({ inventory: unarmored[1].inventory, combatProfile: unarmored[1].combatProfile, characterId: ids[1] });
  Object.assign(unarmored[1], synced);
  await reset({ actors: unarmored });
  const removed = await strike({ natural: 20 });
  assert.equal(removed.actual.damage.damageReduction, 0);
  await reset();
  assert.equal((await strike({ natural: 20 })).actual.damage.damageReduction, 2);
  report.checks.push('Inventory unequip removes armor protection in server evaluation');
});

test('Neutral placement, use, pickup and consumption are atomic; inventory consumption cannot resurrect stock', async () => {
  await reset();
  const placed = await place({ name: 'Testverband', category: 'potions', description: 'Ein versiegelter Verband im Sand.' });
  const entry = { ...placed.sceneItemEvent, available: true };
  const results = await Promise.allSettled(ids.map(id => useItem(id, itemSegment(id, entry, { operation: 'consume' }))));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  await assert.rejects(undo(placed.id), /neuere Handlung/);
  await reset();
  const owner = fighters[1], item = owner.inventory.items.find(item => item.category === 'potions');
  const segment = { commentKind: 'consume', text: 'Benutzt einen Verband.', actorId: owner.id, inventoryUse: { actorId: owner.id, actorPersistence: { kind: 'character', recordId: owner.id }, item, mode: 'consume' } };
  const used = await useItem(owner.id, segment);
  const remaining = (await record(owner.id)).inventory.items.find(entry => entry.id === item.id)?.quantity || '0';
  assert.equal(Number(remaining), 0);
  await assert.rejects(useItem(owner.id, segment));
  await undo(used.id);
  assert.equal(Number((await record(owner.id)).inventory.items.find(entry => entry.id === item.id).quantity), 1);
  report.checks.push('Neutral concurrent consumption and dependencies, real inventory consume/undo');
});

test('Old active encounter remains without critical consequences', async () => {
  await reset({ legacy: true });
  const { actual } = await strike({ natural: 1, roll: 10 });
  assert.equal(actual.criticalConsequence, undefined);assert.equal((await ground()).size, 0);
  report.checks.push('Legacy encounter unchanged');
});

for (const seed of [11, 42, 77, 99]) test(`Full real-sheet duel with criticals and pickup, seed ${seed}`, async () => {
  await reset();
  const dice = new CheckupDice(null, seed), trace = [];
  for (let turn = 0; turn < 100; turn++) {
    const attacker = ids[turn % 2], target = ids[1 - turn % 2];
    if ((await current(attacker)).currentHitPoints <= 0 || (await current(target)).currentHitPoints <= 0) break;
    const priorSegments = [];
    if ((await current(attacker)).weaponUnavailable) {
      const entry = [...(await ground()).values()].find(entry => entry.available && entry.sourceActorId === attacker);
      const base = resolveCombatProfile(await record(attacker));
      const state = deriveCombatStateFromComments(await history()).get(attacker);
      const actor = overlayCombatHitPointState(base, { ...state, resources: resetCommentScopedResources(base.resources) });
      const pickup = itemSegment(attacker, entry);
      pickup.inventoryUse = applySceneItemInteraction({ entry, actor, operation: 'pickup', usageId: 'duel-pickup' }).inventoryUse;
      trace.push({ actor: (await record(attacker)).name, event: 'pickup' });
      if (pickup.inventoryUse.paymentResource === 'action') { await useItem(attacker, pickup);continue; }
      priorSegments.push(pickup);
    }
    const forcedDrop = seed === 99 && turn === 0;
    const { actual } = await strike({ attacker, target, dice: forcedDrop ? new CheckupDice(1) : dice,
      roll: forcedDrop ? 10 : dice.die(10), actionId: sword(attacker), priorSegments, weaponGrip: seed === 77 ? 'two-handed' : 'one-handed' });
    trace.push({ actor: actual.actorName, roll: actual.attack.naturalRoll, damage: actual.damage?.total || 0, remainingHP: actual.targetSnapshot.hitPointsAfter, effect: actual.criticalConsequence?.name || '', equipment: actual.ruleApplications.filter(rule => /drachenzahn|silberschuppe/.test(rule.ruleId)).map(rule => rule.ruleName) });
    assert.ok(actual.actorResourceSnapshot.after.every(resource => resource.current >= 0));
  }
  const profiles = await Promise.all(ids.map(current));
  if (seed === 99) assert.ok(trace.some(entry => entry.event === 'pickup'));
  assert.equal(profiles.filter(profile => profile.currentHitPoints > 0).length, 1, 'Duel finishes without an endless loop');
  const active = getActiveCombatEncounter(await history());
  const ended = await encounter({ encounterId: active.encounterId, operation: 'end', outcome: 'victory', winningPartyId: `side-${profiles.findIndex(profile => profile.currentHitPoints > 0)}`, awardExperience: false, endReason: 'incapacitation' });
  assert.equal(getActiveCombatEncounter(await history()), null);
  await undo(ended.id);assert.ok(getActiveCombatEncounter(await history()));
  report.duels.push({ seed, winner: profiles.find(profile => profile.currentHitPoints > 0).name, hitPoints: profiles.map(profile => profile.currentHitPoints), trace });
});
