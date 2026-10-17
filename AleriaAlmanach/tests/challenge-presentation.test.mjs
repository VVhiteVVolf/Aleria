import test from 'node:test';
import assert from 'node:assert/strict';
import { challengeSceneText, getChallengeNarration } from '../modules/herausforderung/herausforderung-narration.js';
import { narrateSkillResolution } from '../modules/skill-checks/skill-check-narration.js';
import { collectHerausforderungProgress } from '../modules/herausforderung/herausforderung-progress.js';
import { renderChallengeProgressResult } from '../modules/herausforderung/herausforderung-result-view.js';
import { withCombatActionWeaponAvailability } from '../modules/combat/combat-weapon-availability.js';
import { getActionGroups, renderActionOptions } from '../modules/combat/ui/combat-action-card.js';
import { renderWeaponLoadout } from '../modules/combat/ui/combat-weapon-loadout-view.js';
import { renderChallengeManeuverReceipts, formatChallengeStandaloneRewards } from '../modules/herausforderung/herausforderung-maneuver-receipts-view.js';

const result = patch => ({ type: 'weapon-maneuver', actorId: 'ylva', actorName: 'Ylva',
  resolution: { actorName: 'Ylva', targetName: 'Gais', attack: { hit: false } }, ...patch });
const resolution = patch => ({ targetChallengeId: 'herausforderung:scene:slide', actorName: 'Gais',
  herausforderungTier: 'gefaehrliche-naehe', outcome: 'failure',
  revealedText: 'Gais gerät zu nah an Ylva. Geschick-Rettung SG 15, sonst ein Waffenangriff gegen RK 15.', ...patch });

test('story selection removes rule instructions while retaining released puzzle numbers', () => {
  const text = 'Auf dem Siegel steht die Zahl 27. Gais erkennt das Zeichen. Er erhält +1 auf den Angriff. Die Waffe bleibt im Sand.';
  assert.equal(challengeSceneText(text), 'Auf dem Siegel steht die Zahl 27. Gais erkennt das Zeichen. Die Waffe bleibt im Sand.');
  assert.equal(challengeSceneText('Der Schatz ist gefunden. Du erhältst 15 Kupfertaler. Der Wächter erleidet 12 Schaden.'), 'Der Schatz ist gefunden.');
});

test('confirmed missed counter replaces hypothetical or contradictory authored combat prose', () => {
  const value = resolution({ revealedText: 'Ylva trifft Gais schwer. Sie verursacht 15 Schaden.', herausforderungCombatResults: [result()] });
  const before = structuredClone(value), narrative = getChallengeNarration(value);
  assert.match(narrative, /Gais entgeht dem Angriff/);assert.doesNotMatch(narrative, /trifft|15|SG|RK|Würfel|Bonusaktion/);
  assert.deepEqual(value, before);
});

test('a successful rescue does not narrate an attack which never happened', () => {
  const narrative = getChallengeNarration(resolution({ herausforderungCombatResults: [result({ resolution: null, save: { actorName: 'Gais', succeeded: true } })] }));
  assert.match(narrative, /Gais erkennt die Gefahr/);assert.doesNotMatch(narrative, /trifft|Waffe findet/);
});

test('confirmed pickup, hit protection and a subsequent drop are reflected without mechanical values', () => {
  const narrative = getChallengeNarration(resolution({ herausforderungCombatResults: [result({ actorId: 'gais', actorName: 'Gais', pickup: {},
    resolution: { targetName: 'Ylva', attack: { hit: true }, damage: { total: 0 }, sceneItemEvents: [{ operation: 'drop', sourceActorId: 'gais' }] } })] }));
  assert.match(narrative, /eigene Waffe wieder zu fassen/);assert.match(narrative, /Wucht verliert sich/);assert.match(narrative, /entgleitet/);
});

test('challenge narration works without AI and preserves only the selected insight', async () => {
  const value = resolution({ revealedText: 'Die Wache erwartet das Losungswort Silbermorgen. Danach gibt es +2 auf die Probe.' });
  assert.equal((await narrateSkillResolution(value)).text, 'Die Wache erwartet das Losungswort Silbermorgen.');
  const comments = [{ commentSegments: [{ skillResolution: value }] }], before = structuredClone(comments);
  const progress = collectHerausforderungProgress(comments).get(value.targetChallengeId);
  assert.equal(progress.narrativeText, 'Die Wache erwartet das Losungswort Silbermorgen.');assert.deepEqual(comments, before);
  assert.match(renderChallengeProgressResult(progress), /Silbermorgen/);assert.doesNotMatch(renderChallengeProgressResult(progress), /\+2/);
});

const lance = { id: 'lance', name: 'Lanze', weaponType: 'spear', inventoryItemId: 'owned-lance' };
const sword = { id: 'sword', name: 'Schwert', weaponType: 'sword' };
const attack = { id: 'weapon:lance', kind: 'weapon', name: 'Lanzenstoß', weapon: lance, compatible: true, costs: [], resolutionMode: 'weapon-attack' };
const profile = () => ({ weapons: [lance, sword], weapon: lance, actions: [attack, { id: 'switch', kind: 'equipment-switch', equipmentSwitchTargetId: 'lance' }],
  droppedWeapons: [{ weaponId: 'lance', item: { id: 'owned-lance' } }], resources: [] });

test('all action menus disable the dropped weapon while keeping the underlying character sheet unchanged', () => {
  const actor = profile(), before = structuredClone(actor);
  const choices = [...getActionGroups(actor).values()].flat();
  assert.equal(choices.find(c => c.action.id === attack.id).action.compatible, false);
  assert.match(renderActionOptions(actor, attack.id), /value="weapon:lance" selected disabled/);
  assert.deepEqual(actor, before);
});

test('weapon slots show ground state and become available only after a real pickup clears it', () => {
  const actor = profile(), html = renderWeaponLoadout(actor);
  assert.match(html, /data-state="dropped"[^>]*data-weapon-id="lance"[^>]*disabled/);
  assert.match(html, /am Boden/);
  const after = { ...actor, droppedWeapons: [] };
  assert.doesNotMatch(renderWeaponLoadout(after), /data-state="dropped"/);
  assert.equal(withCombatActionWeaponAvailability(after, attack), attack);
});

test('paired weapons and inventory identity share the disarm guard, unrelated abilities remain usable', () => {
  const actor = profile();
  assert.equal(withCombatActionWeaponAvailability(actor, { ...attack, weapon: { id: 'paired', pairedWeaponIds: ['sword', 'lance'] } }).compatible, false);
  assert.equal(withCombatActionWeaponAvailability(actor, { ...attack, weapon: { id: 'renamed', inventoryItemId: 'owned-lance' } }).compatible, false);
  const ability = { id: 'recover', kind: 'ability', name: 'Durchschnaufen', compatible: true };
  assert.equal(withCombatActionWeaponAvailability(actor, ability), ability);
  assert.equal(withCombatActionWeaponAvailability(actor, { ...attack, weapon: sword }).compatible, true);
});

test('compact receipts show one save and one attack step with the complete proof available on demand', () => {
  const maneuver = result({ effectId: 'counter', save: { actorName: 'Gais', attributeKey: 'dexterity', total: 4, dc: 15, succeeded: false, diceResults: [3], modifier: 1 },
    resolution: { actorName: 'Ylva', targetName: 'Gais', attack: { hit: false, total: 10, targetDefense: 15, diceResults: [2], modifier: 8 },
      targetSnapshot: { hitPointsBefore: 19, hitPointsAfter: 19 }, damage: { total: 0 } } });
  const before = structuredClone(maneuver), html = renderChallengeManeuverReceipts([maneuver]);
  assert.equal((html.match(/class="herausforderung-maneuver-step"/g) || []).length, 2);
  assert.match(html, /4 gegen SG 15/);assert.match(html, /10 gegen RK 15/);
  assert.match(html, /aria-label="Kampfauswertung" open/);assert.match(html, /Wurfdetails & Wirkungen/);
  assert.doesNotMatch(html, /<h4>Waffenmanöver/);assert.deepEqual(maneuver, before);
});

test('deduplication retains other benefits and leaves a fallback when no separate maneuver proof exists', () => {
  const maneuver = { effectId: 'counter', type: 'weapon-maneuver', actorName: 'Ylva', skipped: 'Dem Gegenangriff entgangen.' };
  const receipt = { copper: 12, items: [], effects: [], combatEffects: [maneuver, { type: 'spend-resource', actorName: 'Gais', applied: { resourceName: 'Bonusaktion', before: 1, after: 0 } }] };
  const before = structuredClone(receipt), formatted = formatChallengeStandaloneRewards(receipt, [maneuver]);
  assert.match(formatted, /12 KT/);assert.match(formatted, /Bonusaktion/);assert.doesNotMatch(formatted, /Gegenangriff/);
  assert.match(formatChallengeStandaloneRewards(receipt), /Gegenangriff/);assert.deepEqual(receipt, before);
});

test('a successful save has no empty attack step or duplicate counter summary', () => {
  const html = renderChallengeManeuverReceipts([result({ resolution: null, save: { actorName: 'Gais', attributeKey: 'dexterity', total: 18, dc: 15, succeeded: true }, skipped: 'Dem Gegenangriff entgangen.' })]);
  assert.equal((html.match(/class="herausforderung-maneuver-step"/g) || []).length, 1);
  assert.match(html, /Gelungen/);assert.doesNotMatch(html, /Kampfauswertung|Dem Gegenangriff entgangen/);
});
