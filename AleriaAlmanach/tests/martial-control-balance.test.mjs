import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { withEquippedCombatWeapon } from '../modules/combat/combat-equipment-state.js';
import { overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { getCombatDamagePreview, getPreparedCounterPreview } from '../modules/combat/combat-action-estimates.js';
import { renderCombatValueStrip } from '../modules/combat/ui/combat-action-card.js';
import { renderPersonalTechniquesSummary } from '../modules/combat-status/combat-personal-techniques-view.js';
import { addGaisDuelTechniques } from '../modules/characters/personal-techniques/gais-duel-techniques.js';
import { planMartialControlRelease } from '../../firebase/functions/scripts/martial-control-release-model.mjs';
import { markCharacterTechniqueOverlay, applyCharacterTechniqueOverlays } from '../../CharakterDatenbank/lib/character-technique-overlays.mjs';
import { fighter, receipts } from './fixtures/jungdrache-fixtures.mjs';

const { characters } = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
const gais = characters.find(c => c.name === 'Gais Wyrm');
const ylva = characters.find(c => c.name === 'Ylva Wolfshorn');
function actor(character, name, weaponId, mounted = false) {
  const equipped = withEquippedCombatWeapon(character, weaponId, '', { shieldId: '', mountId: mounted ? 'companion-gais-rabenstolz' : '' });
  const actions = resolveCombatProfile(equipped, { includeAiSnapshot: false }).actions;
  const actionId = actions.find(a => a.name === name)?.id;
  assert.ok(actionId, name);
  const profile = resolveCombatProfile(equipped, { actionId, includeAiSnapshot: false });
  return { ...profile, resources: profile.resources.map(r => ({ ...r, current: r.maximum })) };
}
const lance = name => actor(gais, name, 'starter-uchelwyr-lance');
const spear = name => actor(ylva, name, 'ylva-speer');

for (const [name, formula, dc, costs] of [
  ['Wyrmsbrecher', '3d12+1', undefined, ['action', 'bonus-action', 'reaction', 'special-action']],
  ['Haken des Jungdrachens', '1d12+1d6+1', 14, ['action', 'reaction']],
  ['Erstickte Antwort', '1d12+1d4+1', 14, ['action', 'reaction']],
  ['Fallende Schwinge', '2d12+1', 15, ['action', 'bonus-action', 'special-action']],
  ['Zügelhand', '1d12+1d4+1', undefined, ['action', 'reaction']]
]) test(`${name}: authored damage, costs, difficulty and card agree`, async () => {
  const profile = lance(name);
  assert.equal(profile.selectedAction.compatible, true);
  assert.equal(getCombatDamagePreview(profile).notation, formula);
  assert.equal(profile.selectedAction.secondarySave?.dc, dc);
  assert.deepEqual(profile.resourceCosts.map(c => c.resourceId), costs);
  assert.match(renderCombatValueStrip(profile), new RegExp(formula.replace(/d/g, 'W').replace(/\+/g, '\\+')));
  const target = { ...fighter('Asgeir Wolfshorn'), totalDefense: 10 };
  const result = await new CombatResolutionService(receipts([15], 20)).resolveAttack({ actor: profile, target });
  assert.ok(result.damage.total > 0);
  assert.equal(result.counterAttacks, undefined);
  if (dc) { assert.equal(result.secondarySaves[0].succeeded, true); assert.equal(result.targetConditionSnapshot, null); }
});

test('Wyrmsbrecher is personal, uses the actual sword and cannot refill pools', () => {
  const sword = gais.combatProfile.weapons.find(w => w.weaponType === 'sword');
  const profile = actor(gais, 'Wyrmsbrecher', sword.id);
  assert.equal(getCombatDamagePreview(profile).notation, '3d8+1');
  assert.equal(profile.attackModifier, 6);
  assert.match(renderPersonalTechniquesSummary(profile), /Wyrmsbrecher/);
  assert.equal(addGaisDuelTechniques(ylva), ylva);
  const source = { ...gais, combatProfile: { ...gais.combatProfile, resources: [{ id: 'special-action', current: 0 }] } };
  const added = addGaisDuelTechniques(source);
  assert.deepEqual(added.combatProfile.resources, source.combatProfile.resources);
  assert.deepEqual(addGaisDuelTechniques(added), added);
  assert.equal(added.combatProfile.techniques.find(t => t.id === 'gais-wyrmsbrecher').combatStyleId, undefined);
});

test('Entwaffnende Klaue rolls enhanced damage only after a miss, with prepaid costs and current weapon', async () => {
  const setupActor = lance('Entwaffnende Klaue');
  const preview = getPreparedCounterPreview(setupActor);
  assert.equal(preview.damage.notation, '2d12+1'); assert.equal(preview.secondarySave.dc, 15);
  assert.match(renderCombatValueStrip(setupActor), /Konter-Schaden/);
  const setup = await new CombatResolutionService(receipts()).resolveAttack({ actor: setupActor, target: setupActor });
  assert.equal(setup.damage, null); assert.deepEqual(setup.resourceCosts.map(c => c.resourceId), ['bonus-action','reaction','special-action']);
  const sword = gais.combatProfile.weapons.find(w => w.weaponType === 'sword');
  const switched = overlayCombatHitPointState(actor(gais, 'Hoher Grußhieb', sword.id), {
    temporaryConditions: setup.targetConditionSnapshot.after, resources: setup.actorResourceSnapshot.after });
  const result = await new CombatResolutionService(receipts([2, 19], 1)).resolveAttack({ actor: fighter('Asgeir Wolfshorn'), target: switched });
  const counter = result.counterAttacks[0].resolution;
  assert.equal(counter.damage.diceResults.length, 2);
  assert.equal(counter.damage.notation, '2d8'); assert.equal(counter.damage.modifier, 1);
  assert.equal(counter.attack.rollMode, 'advantage');
  assert.deepEqual(counter.resourceCosts, []);
  assert.equal(counter.secondarySaves[0].dc, 15);
  assert.ok(result.sceneItemEvents.length);
});

test('old prepared counter snapshot retains its ordinary damage and fixed SG 13', async () => {
  const defender = lance('Entwaffnende Klaue');
  const old = structuredClone(defender.selectedAction.effects.find(e => e.condition?.counterAttack).condition);
  delete old.counterAttack.damageModel; old.counterAttack.secondarySave = { ...old.counterAttack.secondarySave, fixedDc: 13 };
  const target = overlayCombatHitPointState(defender, { temporaryConditions: [old] });
  const result = await new CombatResolutionService(receipts([2,19], 1)).resolveAttack({ actor: fighter('Asgeir Wolfshorn'), target });
  assert.equal(result.counterAttacks[0].resolution.damage.notation, '1d12');
  assert.equal(result.counterAttacks[0].resolution.secondarySaves[0].dc, 13);
});

test('Wacht needs its own hit; Zügelhand still protects after a miss', async () => {
  const target = { ...fighter('Asgeir Wolfshorn'), totalDefense: 10 };
  for (const [name, roll, bonus] of [['Wacht der langen Schuppe',2,0], ['Wacht der langen Schuppe',15,1], ['Zügelhand',2,2]]) {
    const profile = lance(name);
    const result = await new CombatResolutionService(receipts([roll])).resolveAttack({ actor: profile, target });
    const after = overlayCombatHitPointState(profile, { temporaryConditions: result.actorConditionSnapshot?.after || [] });
    assert.equal(after.totalDefense - profile.totalDefense, bonus);
  }
});

test('Ylva control uses spear dexterity, sidearm strength, proficiency and preserved fixed sequence DC', () => {
  assert.equal(spear('Schafthebel').selectedAction.secondarySave.dc, 16);
  assert.equal(spear('Brechender Dorn').selectedAction.secondarySave.dc, 17);
  assert.equal(actor(ylva, 'Wolfsgriff', 'ylva-saex').selectedAction.secondarySave.dc, 15);
  assert.equal(spear('Drei Dornen, ein Sturz').selectedAction.secondarySave.dc, 18);
  assert.deepEqual(spear('Aus der Angriffslinie').resourceCosts.map(c => c.resourceId), ['reaction']);
  const advanced = { ...gais, combatProfile: { ...gais.combatProfile, progression: { ...gais.combatProfile.progression, level: 20 } } };
  assert.equal(actor(advanced, 'Haken des Jungdrachens', 'starter-uchelwyr-lance').selectedAction.secondarySave.dc, 17);
});

test('release is idempotent and limited to arsenal; existing prepared states and all resources survive', () => {
  const before = { ...gais, combatProfile: { ...gais.combatProfile, hitPoints: { current: 9 }, resources: [{ id:'special-action', current:0 }], conditions:[{name:'alter Konter',counterAttack:{enabled:true,secondarySave:{fixedDc:13}}}] } };
  const patch = planMartialControlRelease(before);
  if (patch) assert.deepEqual(Object.keys(patch), ['combatProfile.techniques']);
  const after = { ...before, combatProfile: { ...before.combatProfile, techniques: patch?.['combatProfile.techniques'] || before.combatProfile.techniques } };
  assert.equal(planMartialControlRelease(after), null);
  for (const key of ['hitPoints','resources','conditions']) assert.deepEqual(after.combatProfile[key], before.combatProfile[key]);
});

test('technique-only archive overlay preserves all other profile fields and respects newer full snapshots', () => {
  const original = { combatProfile: { hitPoints:{current:7}, resources:[{current:0}], weapons:[{id:'spear'}], techniques:[{id:'old',name:'Alt'},{id:'keep'}] } };
  const overlay = markCharacterTechniqueOverlay({ updatedAt:'2026-10-15T00:00:00Z', combatProfile:{techniques:[{id:'old',name:'Neu'},{id:'personal'}]} });
  const next = applyCharacterTechniqueOverlays(original,[overlay]);
  assert.deepEqual(next.combatProfile.techniques.map(t=>t.id),['old','keep','personal']);
  assert.equal(next.combatProfile.techniques[0].name,'Neu');
  for (const key of ['hitPoints','resources','weapons']) assert.deepEqual(next.combatProfile[key],original.combatProfile[key]);
  assert.equal(applyCharacterTechniqueOverlays(original,[overlay],Date.parse('2026-10-16T00:00:00Z')),original);
});
