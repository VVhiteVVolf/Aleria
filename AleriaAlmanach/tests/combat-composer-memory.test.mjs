import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createCombatProfileCache } from '../modules/combat/combat-profile-cache.js';
import { getCombatPreviewActorIds, createCombatTargetSummary } from '../modules/combat/combat-composer-roster.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { renderTargetOptions } from '../modules/combat/ui/combat-target-picker.js';

test('viele Auswahlvarianten verdrängen alte Profile, aktuelle Varianten werden wiederverwendet', () => {
  const cache = createCombatProfileCache(8);
  const owner = {};
  let resolved = 0;
  const get = key => cache.get(owner, key, () => ({ sequence: ++resolved }));
  const first = get('first');
  for (let i = 0; i < 1000; i++) get(`action-${i}`);
  const last = get('action-999');
  assert.equal(resolved, 1001);
  assert.equal(get('action-999'), last);
  assert.notEqual(get('first'), first);
  cache.clear();
  assert.notEqual(get('action-999'), last);
});

test('ein neuer Charakterdatensatz erhält keine veralteten gecachten Werte', () => {
  const cache = createCombatProfileCache();
  const first = { id: 'same-id', hp: 10 }, second = { id: 'same-id', hp: 5 };
  assert.equal(cache.get(first, 'a', () => first.hp), 10);
  assert.equal(cache.get(second, 'a', () => second.hp), 5);
});

test('1000 Figuren bleiben auswählbar, nur Beteiligte, Ziele und Reaktionsquellen brauchen Vollprofile', () => {
  const characters = Array.from({ length: 1000 }, (_, index) => ({ id: `actor-${index}`, name: `Figur ${index}`, combatProfile: {} }));
  characters[9].combatProfile.abilities = [{ active: true, triggerRules: [{ enabled: true, activation: 'reaction' }] }];
  const ids = getCombatPreviewActorIds({ characters, selectedCharacterId: 'actor-0', participantIds: new Map([['actor-1', 'team']]),
    segments: [{ actorId: 'actor-0', combatTargetIds: ['actor-2'], combatRuleSelections: [{ sourceActorId: 'actor-3' }] }] });
  assert.deepEqual([...ids].sort(), ['actor-0', 'actor-1', 'actor-2', 'actor-3', 'actor-9']);
  const options = renderTargetOptions(characters.map(createCombatTargetSummary));
  assert.equal((options.match(/<option /g) || []).length, 1000);
  assert.doesNotMatch(options, /disabled|Verteidigung fehlt/);
});

test('temporäre Reaktionen und nachträglich gewählte Figuren werden vollständig vorgemerkt', () => {
  const characters = [{ id: 'a' }, { id: 'b' }, { id: 'support' }];
  const states = new Map([['support', { temporaryConditions: [{ active: true, triggerRules: [{ activation: 'reaction', enabled: true }] }] }]]);
  const ids = getCombatPreviewActorIds({ characters, states, segments: [{ actorId: 'a', combatTargetId: 'b' }] });
  assert.deepEqual([...ids].sort(), ['a', 'b', 'support']);
});

test('Vorschau ohne Erzählprofil behält identische Kampfmechanik; tatsächliche Auswertung erhält weiterhin den Kontext', async () => {
  const character = JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/gawain-draig.json', import.meta.url), 'utf8')).character;
  const full = resolveCombatProfile(character, { weaponGrip: 'two-handed' });
  const preview = resolveCombatProfile(character, { weaponGrip: 'two-handed', includeAiSnapshot: false });
  assert.ok(full.aiSnapshot);
  assert.equal(preview.aiSnapshot, null);
  assert.deepEqual({ ...full, aiSnapshot: null }, preview);
});
