import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getMaximumHitPoints, getArmorClass, getWeaponAttackModifier, sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile, resolveCombatTargetProfile, validateCombatActorProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { makeCreatureSceneActor, normalizeCreatureImportPayload } from '../modules/creatures/creature-model.js';
import { inventoryCompanionViews } from '../modules/character-inventory/character-inventory-identity.js';
import { synchronizeEquipmentFromInventory } from '../modules/character-equipment/character-equipment-sync.js';
import { getAldrimarClassDefinition } from '../modules/classes/aldrimar/aldrimar-class-registry.js';
import { resolveCombatProfile as resolveServerCombatProfile } from '../../firebase/functions/src/generated/combat/combat-profile-resolver.js';

const read = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const ylva = (await read('../../Charakter%20Archiv%20Exporte/ylva-wolfshorn.json')).character;
const asgeir = (await read('../../Charakter%20Archiv%20Exporte/asgeir-wolfshorn.json')).character;
const freki = getBuiltinCreatureTemplates().find(creature => creature.id === 'companion-ylva-freki');
const equip = (character, right, left = '', shield = false) => {
  const clone = structuredClone(character);
  clone.combatProfile.weapons.forEach(weapon => { weapon.equipped = weapon.id === right; });
  clone.combatProfile.combat.offHandWeaponId = left;
  clone.combatProfile.armorItems.filter(item => item.kind === 'shield').forEach(item => { item.equipped = shield; });
  return clone;
};
const action = (character, id) => resolveCombatProfile(character, {actionId:id,includeAiSnapshot:false});

for (const [character, classId, hp, ac, count] of [[ylva,'skytte',75,12,5],[asgeir,'skjaldr',94,14,7]]) {
  test(`${character.name}: level, curriculum budget, equipment and resource parity`, () => {
    const profile = sanitizeCharacterCombatProfile(character.combatProfile);
    assert.equal(profile.progression.level, 7);
    assert.equal(profile.templateSelections.classId, classId);
    assert.equal(getMaximumHitPoints(profile), hp);
    assert.equal(profile.hitPoints.current, hp);
    assert.equal(getArmorClass(profile), ac, 'GES erst mit bestehender Rüstungsroutine ab Stufe 12');
    assert.equal(profile.techniques.length, count);
    const slots = getAldrimarClassDefinition(classId).techniqueBudget.slots.filter(slot => slot.level <= 7);
    assert.deepEqual(profile.classTraining.techniqueSelections.map(selection => selection.slotId), slots.map(slot => slot.id));
    assert.ok(profile.techniques.every(technique => technique.active && technique.status === 'confirmed' && technique.minimumLevel <= 7));
    for (const id of ['action','bonus-action','reaction']) assert.equal(profile.resources.find(resource => resource.id === id).maximum, 1);
    assert.equal(profile.resources.find(resource => resource.id === 'special-action').maximum, 2);
    assert.equal(profile.magic.enabled, false);
    const roundTrip = synchronizeEquipmentFromInventory({inventory:character.inventory,combatProfile:profile}).combatProfile;
    for (const entry of [...profile.weapons,...profile.armorItems].filter(entry => entry.inventoryItemId)) {
      const item = character.inventory.items.find(item => item.id === entry.inventoryItemId);
      assert.equal(item.equipmentLink.combatEntryId, entry.id);
      assert.equal(item.image, entry.image);
      assert.ok(item.valuation?.minCopper > 0);
    }
    assert.deepEqual(roundTrip.weapons, profile.weapons);
    assert.equal(getArmorClass(roundTrip), ac);
  });
}

test('Ylva: bow class bonus works for shots and techniques, never for melee or another wielder', () => {
  assert.equal(action(ylva,'weapon:ylva-langbogen').attackModifier,7);
  assert.equal(action(ylva,'technique:combat-style-huskarl-skytte-grund-1').attackModifier,7);
  const spear = equip(ylva,'ylva-speer');
  assert.equal(action(spear,'weapon:ylva-speer').attackModifier,4);
  const other = structuredClone(asgeir.combatProfile);
  assert.equal(getWeaponAttackModifier(other, ylva.combatProfile.weapons.find(weapon => weapon.id === 'ylva-langbogen')),4);
  assert.equal(ylva.combatProfile.weapons.find(weapon => weapon.id === 'ylva-langbogen').attackBonus,0);
});

test('all learned techniques have usable loadouts; missing hands, shields and wrong classes are blocked', () => {
  const configurations = [
    [ylva, {1:'ylva-langbogen',3:'ylva-speer',4:'ylva-handaxt',6:'ylva-langbogen',7:'ylva-speer'}],
    [asgeir, {1:'asgeir-axt-rechts',2:'asgeir-axt-rechts',3:'asgeir-grossaxt',4:'asgeir-axt-rechts',5:'asgeir-axt-rechts',6:'asgeir-grossaxt',7:'asgeir-axt-rechts'}]
  ];
  for (const [character, weapons] of configurations) for (const technique of character.combatProfile.techniques) {
    const level = technique.minimumLevel;
    const isAsgeir = character.id === asgeir.id;
    const left = isAsgeir && [4,7].includes(level) ? 'asgeir-axt-links' : '';
    const configured = equip(character,weapons[level],left,isAsgeir && level === 5);
    const result = action(configured,`technique:${technique.id}`);
    assert.equal(result.selectedAction.compatible,true,`${character.name}: ${technique.name} — ${result.selectedAction.disabledReason}`);
    assert.equal(validateCombatActorProfile(result).ready,true);
  }
  const crossed = 'technique:combat-style-huskarl-skjaldr-grund-7';
  assert.equal(action(equip(asgeir,'asgeir-axt-rechts'),crossed).selectedAction.compatible,false);
  assert.equal(action(equip(asgeir,'asgeir-axt-rechts','asgeir-axt-links',true),crossed).selectedAction.compatible,false);
  assert.equal(action(asgeir,'technique:combat-style-huskarl-skjaldr-grund-5').selectedAction.compatible,false);
  assert.equal(action(equip(asgeir,'asgeir-axt-rechts'),'technique:combat-style-huskarl-skjaldr-grund-3').selectedAction.compatible,false);
  const foreign = structuredClone(ylva);
  foreign.combatProfile.techniques.push(asgeir.combatProfile.techniques[0]);
  assert.equal(action(equip(foreign,'ylva-handaxt'),'technique:combat-style-huskarl-skjaldr-grund-1').selectedAction.compatible,false);
});

test('Asgeir has the canonical level-seven berserk, not Fenrir-specific abilities', () => {
  const ability = asgeir.combatProfile.abilities.find(ability => /Berserkergang/.test(ability.name));
  assert.ok(ability);
  assert.equal(ability.usesMaximum,1);
  assert.deepEqual(ability.costs.map(cost => cost.resourceId),['bonus-action','reaction']);
  assert.ok(action(asgeir,`ability:${ability.id}`).selectedAction.effects.length);
  assert.equal(asgeir.combatProfile.abilities.some(ability => /fenrir/i.test(ability.id)),false);
});

test('Freki is one linked level-four creature in inventory, catalog and portable export', async () => {
  const exported = normalizeCreatureImportPayload(await read('../../Charakter%20Archiv%20Exporte/gefaehrten/freki-gramnir.json'))[0];
  assert.deepEqual(exported,freki);
  assert.equal(freki.level,4);
  assert.equal(freki.portrait,'https://i.imgur.com/jO6WUgH.png');
  assert.equal(getMaximumHitPoints(freki.combatProfile),38);
  assert.equal(getArmorClass(freki.combatProfile),13);
  assert.equal(freki.itemOrigin.ownerCharacterId,ylva.id);
  const views = inventoryCompanionViews(ylva.inventory,[freki]);
  assert.equal(views.length,1);
  assert.equal(views[0].creatureId,freki.id);
  assert.ok(views[0].infoRows.some(row => row.value === '38 / 38'));
  const actor = action(makeCreatureSceneActor(freki),'weapon:freki-biss');
  assert.equal(actor.attackModifier,4);
  assert.equal(actor.damageModifier,2);
  assert.equal(validateCombatActorProfile(actor).ready,true);
});

test('real resolution consumes arrows for both bow attacks and bow techniques', async () => {
  const service = new CombatResolutionService({
    async rollAttack(request) { return {natural:18,total:18+request.modifier,keptDice:[18]}; },
    async rollDamage(request) { return {total:4+request.bonus,notation:'test',keptDice:[4],modifier:request.bonus}; }
  });
  for (const id of ['weapon:ylva-langbogen','technique:combat-style-huskarl-skytte-grund-1']) {
    const result = await service.resolveAttack({actor:action(ylva,id),target:resolveCombatTargetProfile(asgeir)});
    assert.equal(result.attack.hit,true);
    assert.equal(result.actorInventorySnapshot.ammunitionUse.inventoryItemId,'ylva-pfeile');
    assert.equal(result.actorInventorySnapshot.ammunitionUse.after,29);
  }
});

test('archive contains both original IDs and Asgeir Bleiddorn as an alias without a duplicate', async () => {
  const registry = await read('../../CharakterDatenbank/registry.json');
  for (const character of [ylva,asgeir]) {
    const rows = registry.records.filter(record => record.firestoreDocumentId === character.id);
    assert.equal(rows.length,1);
    const record = await read(`../../CharakterDatenbank/${rows[0].path}`);
    assert.deepEqual(record.character.combatProfile,character.combatProfile);
    assert.deepEqual(record.character.inventory,character.inventory);
  }
  assert.ok(asgeir.aliases.includes('Asgeir Bleiddorn'));
});

test('generated server rules resolve the same class bonuses, damage and hand requirements', () => {
  for (const character of [ylva,asgeir,equip(asgeir,'asgeir-axt-rechts'),makeCreatureSceneActor(freki)]) {
    const client = resolveCombatProfile(character,{includeAiSnapshot:false});
    const server = resolveServerCombatProfile(character,{includeAiSnapshot:false});
    const projection = result => result.actions.map(action => ({id:action.id,attack:action.attackModifier,
      damage:action.damageModifier,formula:action.formula,compatible:action.compatible,costs:action.costs,reason:action.disabledReason}));
    assert.deepEqual(projection(server),projection(client));
  }
});
