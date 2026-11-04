import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { getCombatActionAvailability } from '../modules/combat/ui/combat-action-availability.js';
import { renderCombatArsenalSummary } from '../modules/combat-status/combat-profile-actions-view.js';
import { renderCombatCondition } from '../modules/combat-status/combat-status-view.js';
import { formatStatusDuration, createManualCombatCondition } from '../modules/combat-status/combat-status-model.js';
import { getCombatStatusFormDraft } from '../modules/combat-status/combat-status-dialog-model.js';
import { STATUS_MODIFIERS, STATUS_ROLL_MODES } from '../modules/combat-status/combat-status-catalog.js';
import { getSkillActionPermissionBlock, renderSkillActionPermissionBlock } from '../modules/skill-checks/skill-action-permission-view.js';
import { renderActionDetails } from '../modules/combat/ui/combat-action-card.js';
import { renderCreatureDossier } from '../modules/creatures/creature-dossier.js';

function profile(additions = {}) {
  return resolveCombatProfile({ id: 'test', name: 'Testfigur', combatProfile: {
    hitPoints: { current: 20, maximumOverride: 30 },
    weapons: [{ id: 'blade', name: 'Klinge', damageFormula: '1d6', equipped: true }],
    ...additions
  } });
}

test('arsenal shows the actual blocking condition instead of a generic unavailable label', () => {
  const actor = profile({ conditions: [{ id: 'stun', name: 'Benommen', active: true, mechanics: { blocksActions: true } }] });
  const attack = actor.actions.find(action => action.kind === 'weapon');
  const availability = getCombatActionAvailability(actor, attack);
  assert.equal(availability.available, false);
  assert.match(availability.reason, /Benommen/);
  assert.ok(renderCombatArsenalSummary(actor).includes(availability.reason.replace(/„/g, '„')));
});

test('waiting remains selectable at zero HP or while disarmed, but an invalid requested loadout stays explicit', () => {
  const actor = { ...profile({ hitPoints: { current: 0, maximumOverride: 30 } }), weaponUnavailable: true };
  const wait = actor.actions.find(action => action.id === 'combat:wait');
  assert.ok(wait);
  assert.equal(getCombatActionAvailability(actor, wait).available, true);
  const requested = { ...actor, equipmentPreparation: { error: 'Der gewünschte Schild fehlt.' } };
  const blocked = getCombatActionAvailability(requested, wait);
  assert.equal(blocked.available, false);
  assert.equal(blocked.reason, 'Der gewünschte Schild fehlt.');
});

test('resource shortages name the actual resource and retain an affordable aura alternative', () => {
  const actor = profile({ resources: [{ id: 'action', name: 'Aktion', current: 0, maximum: 1 }],
    aura: { enabled: true }, });
  const attack = { ...actor.actions.find(action => action.kind === 'weapon'), costs: [{ resourceId: 'action', name: 'Aktion', amount: 1 }] };
  const exhausted = { ...actor, resources: actor.resources.map(resource => ({ ...resource, current: 0 })) };
  const blocked = getCombatActionAvailability(exhausted, attack);
  assert.equal(blocked.available, false);
  assert.match(blocked.reason, /Nicht genug Aktion \(0\/1\)/);
  const available = getCombatActionAvailability({ ...exhausted, resources: [...exhausted.resources.filter(resource => resource.id !== 'aura-focus'),
    { id: 'aura-focus', name: 'Aura-Fokuspunkt', current: 1, maximum: 1 }] }, attack);
  assert.equal(available.available, true);
  assert.equal(available.paymentMode, 'aura');
  assert.equal(available.reason, 'Verfügbar mit Aura-Fokus');
});

test('a named exhausted ability cannot be disguised as a resource shortage or bypassed with aura', () => {
  const actor = profile({ abilities: [{ id: 'rare', name: 'Seltene Gabe', active: true, usesMaximum: 1, usesCurrent: 0,
    activationType: 'action', combatUsable: true, delivery: 'spell', resolutionType: 'automatic', effects: [{ type: 'healing', amount: 3, target: 'self' }] }] });
  const action = actor.actions.find(entry => entry.id === 'ability:rare');
  assert.ok(action);
  const blocked = getCombatActionAvailability(actor, action);
  assert.equal(blocked.available, false);
  assert.equal(blocked.reason, 'Keine Nutzung von Seltene Gabe mehr übrig.');
});

test('the explicit GM cost bypass matches the composer without bypassing capability or limited uses', () => {
  const actor = profile();
  const attack = actor.actions.find(action => action.kind === 'weapon');
  const cheated = { ...actor, cheats: { enabled: true }, resources: [] };
  assert.equal(getCombatActionAvailability(cheated, attack).available, true);
  assert.match(getCombatActionAvailability(cheated, attack).reason, /Spielleiter-Cheat/);
  const blocked = { ...cheated, conditions: [{ name: 'Betäubt', active: true, mechanics: { blocksActions: true } }] };
  assert.equal(getCombatActionAvailability(blocked, attack).available, false);
});

test('one-use conditional values, damage over time and counter restrictions are visible and escaped', () => {
  const condition = { id: 'one', name: '<script>danger</script>', active: true,
    durationModel: { kind: 'actor-comments', remainingActorComments: 1 },
    conditionalMechanics: { attack: 2 }, usage: { scope: 'attack', remaining: 1 },
    blockPreparedCounter: true, criticalPeriodicLoss: 3, source: '<img src=x>' };
  const html = renderCombatCondition(condition, { temporary: true });
  for (const text of ['Nur beim passenden Auslöser: Angriff +2', '1 verbleibende Anwendung', 'Vorbereitete Konter gesperrt', '−3 TP zu Beginn jedes eigenen Beitrags']) assert.ok(html.includes(text), text);
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img src=x>'));
});

test('old typed sleep presets display their real action-block scope even without a copied mechanical flag', () => {
  const html = renderCombatCondition({ id: 'old-sleep', presetId: 'sleeping', name: 'Schläft', active: true, mechanics: {} }, { temporary: true });
  assert.match(html, /Freiwillige Handlungen und Reaktionen gesperrt/);
  assert.match(html, /Abwarten und Rettungen bleiben möglich/);
});

test('ward cards show their critical-break rule alongside remaining charges', () => {
  const condition = { id: 'ward', name: 'Schutz', active: true, ward: { enabled: true, charges: 2, breaksOnCriticalHit: true } };
  const html = renderCombatCondition(condition, { temporary: true });
  assert.match(html, /2 Abwehrladungen/);
  assert.match(html, /Magische Abwehr zerbricht bei einem kritischen Treffer/);
  assert.ok(!renderCombatCondition({ ...condition, ward: { ...condition.ward, breaksOnCriticalHit: false } }).includes('zerbricht'));
});

test('start-of-contribution expiry is distinguished from an effect lasting through that contribution', () => {
  const start = { durationModel: { kind: 'actor-comments', remainingActorComments: 1, expiresAt: 'actor-start' } };
  assert.equal(formatStatusDuration(start), 'Bis zum Beginn des nächsten eigenen Beitrags');
  assert.equal(formatStatusDuration({ durationModel: { kind: 'actor-comments', remainingActorComments: 1 } }), '1 eigener Beitrag');
});

test('the manual preview and submission share duration, source and mechanic form values', () => {
  const values = { presetId: 'stunned', name: 'Betäubt', kind: 'condition', source: 'Prüfzauber', description: 'Wirkung', durationKind: 'scene-comments', durationAmount: '4' };
  const elements = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { value }]));
  for (const [key] of STATUS_MODIFIERS) elements[`modifier-${key}`] = { value: key === 'attack' ? '-2' : '0' };
  for (const [key] of STATUS_ROLL_MODES) elements[key] = { value: 'normal' };
  const form = { elements }, before = structuredClone(form);
  const draft = getCombatStatusFormDraft(form);
  const preview = createManualCombatCondition(draft, { id: 'preview', actorId: 'preview', sceneClockSeconds: 0 });
  const submitted = createManualCombatCondition(draft, { id: 'actual', actorId: 'test', sceneClockSeconds: 0 });
  assert.equal(formatStatusDuration(preview), '4 Szenenbeiträge');
  assert.equal(preview.source, values.source);
  assert.equal(preview.mechanics.attack, -2);
  assert.equal(preview.mechanics.blocksActions, true);
  assert.deepEqual(preview.durationModel, submitted.durationModel);
  assert.deepEqual(preview.mechanics, submitted.mechanics);
  assert.deepEqual(form, before);
});

test('blocked voluntary checks explain the cause and keep a narrative escape route while saves stay allowed', () => {
  const actor = profile({ conditions: [{ name: '<Betäubt>', active: true, mechanics: { blocksActions: true } }] });
  const block = getSkillActionPermissionBlock(actor, { checkType: 'attribute' });
  assert.ok(block);
  const html = renderSkillActionPermissionBlock(block);
  assert.match(html, /&lt;Betäubt&gt;/);
  assert.match(html, /Ohne Probe schildern/);
  assert.match(html, /data-value="normal"/);
  assert.equal(getSkillActionPermissionBlock(actor, { checkType: 'saving-throw' }), null);
  assert.equal(renderSkillActionPermissionBlock(null), '');
});

test('an explicit voice requirement stays visible in action details, arsenal and creature dossier', () => {
  const combatProfile = { abilities: [{ id: 'voice', name: 'Ruf', active: true, combatUsable: true, requiresVoice: true,
    activationType: 'action', delivery: 'ability', resolutionType: 'automatic', effects: [{ type: 'healing', amount: 2, target: 'self' }] }] };
  const actor = profile(combatProfile);
  const action = actor.actions.find(entry => entry.id === 'ability:voice');
  assert.ok(action);
  assert.match(renderActionDetails({ ...actor, selectedAction: action }), /Eigene Stimme erforderlich/);
  assert.match(renderCombatArsenalSummary(actor), /Eigene Stimme erforderlich/);
  assert.match(renderCreatureDossier({ id: 'creature', name: 'Prüftier', entityType: 'creature', combatProfile }), /Eigene Stimme erforderlich/);
});
