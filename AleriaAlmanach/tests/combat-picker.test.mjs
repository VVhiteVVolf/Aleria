import test from 'node:test';
import assert from 'node:assert/strict';
import { getActionCostPresentation, renderActionPicker } from '../modules/combat/ui/combat-action-picker.js';
import { prioritizeCombatTargets, renderTargetOptions, renderSelectedTargetPortraits } from '../modules/combat/ui/combat-target-picker.js';
import { resolveCombatTargetProfile } from '../modules/combat/combat-profile-resolver.js';

test('Zielporträts berücksichtigen das aktive Bilderset auch bei importierten Figuren', () => {
  const character = { id: 'a', name: 'Anna', activeImageSetId: 'battle', imageSets: [
    { id: 'standard', portrait: 'https://example.test/standard.png' },
    { id: 'battle', portrait: 'https://example.test/battle.png' }
  ] };
  assert.equal(resolveCombatTargetProfile(character).portrait, 'https://example.test/battle.png');
  assert.equal(resolveCombatTargetProfile({ ...character, activeImageSetId: '' }).portrait, 'https://example.test/standard.png');
});

test('Angriffsliste zeigt vollständige kombinierte Kosten mit Mini-Icons und sicheren Namen', () => {
  const action = { id: 'hit', kind: 'technique', name: '<Test>', costs: [{ resourceId: 'action', amount: 1 }, { resourceId: 'reaction', amount: 1 }, { resourceId: 'special-action', amount: 2 }] };
  const actor = { actions: [action], selectedAction: action };
  const costs = getActionCostPresentation(actor, action);
  assert.deepEqual(costs.map(cost => [cost.resource.id, cost.amount]), [['action', 1], ['reaction', 1], ['special-action', 2]]);
  const html = renderActionPicker(actor, 'hit');
  assert.match(html, /action\.png/);
  assert.match(html, /reaction\.png/);
  assert.match(html, /special-action\.png/);
  assert.match(html, /&lt;Test&gt;/);
  assert.match(html, /aria-selected="true"/);
  assert.doesNotMatch(html, /onclick=/);
});

test('die Kosten der ausgewählten Zauberstufe haben Vorrang vor dem Basiseintrag', () => {
  const base = { id: 'spell', costs: [{ resourceId: 'mana-focus', amount: 2 }] };
  const actor = { selectedAction: { ...base, costs: [{ resourceId: 'mana-focus', amount: 5 }] } };
  assert.equal(getActionCostPresentation(actor, base)[0].amount, 5);
});

test('Kampfliste steht vor anderen Figuren, ohne Ziele oder fehlende Verteidigungen zu verschlucken', () => {
  const targets = [
    { characterId: 'a', name: 'Anna', totalDefense: 12 },
    { characterId: 'g', name: 'Gawain', totalDefense: 16 },
    { characterId: 'z', name: 'Ziel', totalDefense: null }
  ];
  const ranked = prioritizeCombatTargets(targets, new Set(['g']));
  assert.deepEqual(ranked.map(target => target.characterId), ['g', 'a', 'z']);
  assert.equal(targets[0].inCombat, undefined, 'Quelldaten bleiben unverändert');
  const options = renderTargetOptions(ranked, new Set(['g', 'a']));
  assert.ok(options.indexOf('Aktuelle Kampfliste') < options.indexOf('Weitere Figuren'));
  assert.match(options, /value="z" disabled/);
  assert.match(options, /value="g" selected/);
  assert.match(options, /value="a" selected/);
});

test('jedes ausgewählte Ziel erhält ein Porträt oder Initial und sichere Namen', () => {
  const html = renderSelectedTargetPortraits([
    { characterId: 'a', name: '<Anna>', portrait: 'https://example.test/a.png' },
    { characterId: 'b', name: 'Berta', portrait: 'javascript:alert(1)' },
    { characterId: 'c', name: 'Clara', portrait: 'https://example.test/c.png' }
  ], new Set(['a', 'b']));
  assert.match(html, /a\.png/);
  assert.match(html, /&lt;Anna&gt;/);
  assert.match(html, /Berta/);
  assert.doesNotMatch(html, /javascript:|Clara|c\.png/);
  assert.equal((html.match(/class="combat-target-chip"/g) || []).length, 2);
});
