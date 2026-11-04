import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeCombatMechanics } from '../modules/combat/ui/combat-mechanics-presentation.js';
import { describeNaturalRollReceipt } from '../modules/combat/ui/combat-natural-roll-presentation.js';
import { evaluationRollText, renderEvaluationSaveRecords } from '../modules/combat/ui/combat-evaluation-rolls.js';
import { renderEvaluationStats } from '../modules/combat/ui/combat-evaluation-stats.js';
import { renderSkillRecordedRoll } from '../modules/skill-checks/skill-attempt-view.js';
import { renderSkillSaveContext, describeSkillSaveContext } from '../modules/skill-checks/skill-save-context-view.js';
import { renderMiniCombatProfile } from '../modules/combat-status/combat-profile-summary-view.js';
import { getCharacterArchiveEntryMeta } from '../modules/character-archive/character-archive-entry-meta.js';
import { getDevelopmentAttributePreview, renderDevelopmentAttributePreview } from '../modules/character-development/development-attribute-preview.js';
import { sanitizeCharacterCombatProfile, resolveCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { renderCreatureDossier } from '../modules/creatures/creature-dossier.js';
import { renderCombatEncounterComment } from '../modules/combat-encounter/combat-encounter-ui.js';
import { renderCombatArsenalSummary } from '../modules/combat-status/combat-profile-actions-view.js';
import { describeCombatTriggerRule } from '../modules/combat/ui/combat-rule-presentation.js';

const mechanics = {
  attributeModifiers: [{ attributeKey: 'intelligence', bonus: 2 }], attributeCaps: [{ attributeKey: 'wisdom', maximum: 3 }],
  skillModifiers: [{ name: 'Nachforschungen', bonus: 1 }], skillProficiencies: [{ name: 'Naturkunde', proficiency: 'expertise' }],
  weaponModifiers: [{ weaponTypes: ['bow'], attack: 1, damage: -1 }], dexterityWeaponTypes: ['sword'],
  saveAttributeModifiers: [{ attributeKey: 'constitution', bonus: -1 }], saveModifiers: [{ kind: 'fear', bonus: 1 }],
  savingThrowAdvantageAttributes: ['constitution'], savingThrowDisadvantageAttributes: ['charisma'],
  damageAffinities: [{ damageType: 'Feuer', response: 'resistant', magicScope: 'magical' }, { damageType: 'fire', response: 'resistant', magicScope: 'magical' }],
  savingThrow: 1, naturalOneReroll: true, criticalFailureMaximum: 3, combatStartTemporaryHitPoints: 2,
  bonusDamageFormula: '1d4', weaponBonusDamageFormula: '1d6', blocksActions: true
};

test('structured trait mechanics communicate attributes, training, scoped weapons, saves, affinities and luck without alias duplication', () => {
  const summary = summarizeCombatMechanics(mechanics);
  for (const text of ['INT-Wert +2', 'WEI-Wert höchstens 3', 'Nachforschungen +1', 'Naturkunde: Expertise', 'Bogen: Angriff +1', 'Bogen: Schaden −1', 'GES für Schwert',
    'KON-Rettung −1', 'Rettung gegen Furcht +1', 'Vorteil auf KON-Rettung', 'Nachteil auf CHA-Rettung', 'Resistenz: Feuer · nur magisch',
    'Alle Attributsrettungswürfe +1', 'Natürliche 1: einmal', 'Natürliche 1–3', 'Temporäre TP zu Kampfbeginn +2', 'Zusatzschaden 1W4', 'Waffen-Zusatzschaden 1W6', 'Handlungen gesperrt']) assert.ok(summary.includes(text), text);
  assert.equal(summary.split('Resistenz: Feuer').length, 2);
  assert.equal(summarizeCombatMechanics({ attack: 0, skillRollMode: 'normal' }), '');
});

test('effective attribute preview keeps base scores, applies modifiers and caps, and matches the scene profile', () => {
  const profile = sanitizeCharacterCombatProfile({ attributes: [{ key: 'intelligence', score: 14 }, { key: 'wisdom', score: 14 }],
    quirks: [{ id: 'test', name: 'Testmerkmal', active: true, mechanics }] });
  const before = structuredClone(profile);
  const preview = getDevelopmentAttributePreview(profile);
  assert.equal(preview.find(entry => entry.key === 'intelligence').score, 16);
  assert.equal(preview.find(entry => entry.key === 'wisdom').score, 3);
  assert.equal(preview.find(entry => entry.key === 'wisdom').modifier, -4);
  const scene = renderMiniCombatProfile(resolveCharacterCombatProfile({ combatProfile: profile }), 'Testfigur');
  for (const text of ['Intelligenz 16 (+3)', 'Weisheit 3 (-4)', 'Obergrenze 3', 'Nachforschungen +4', 'Naturkunde +7', 'Testmerkmal · aktiv', 'Eigenschaften &amp; Marotten']) assert.ok(scene.includes(text), text);
  assert.match(renderDevelopmentAttributePreview(profile), /Grundwert 14 · Obergrenze 3/);
  assert.deepEqual(profile, before);
});

test('scene traits preserve inactive and suppressed stages and escape all names and descriptions', () => {
  const profile = { quirks: [
    { id: 'development-trait-geistig-beschraenkt', name: 'Schwächer', active: true, mechanics: {} },
    { id: 'development-trait-vollidiot', name: 'Stärker', active: true, mechanics: {} },
    { id: 'custom', name: '<script>Test</script>', active: false, description: '<img src=x onerror=alert(1)>', mechanics: {} }
  ] };
  const html = renderMiniCombatProfile(profile);
  assert.match(html, /Schwächer · derzeit ohne Rechenwirkung/);
  assert.match(html, /Stärker · aktiv/);
  assert.match(html, /&lt;script&gt;Test&lt;\/script&gt; · inaktiv/);
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img src=x'));
});

test('archive trait, ability and condition metadata share the complete mechanics presentation', () => {
  const expected = summarizeCombatMechanics(mechanics);
  for (const kind of ['trait', 'ability', 'condition']) assert.ok(getCharacterArchiveEntryMeta({ kind, data: { mechanics } }).includes(expected));
});

test('all recorded W20 surfaces explain luck rerolls, bad-luck thresholds and concentration without reading live profiles', () => {
  const roll = { total: 16, natural: 12, naturalRoll: 12, diceResults: [12], modifier: 4, hit: true,
    naturalRollPolicy: { naturalOneReroll: true, criticalFailureMaximum: 3 }, rerolls: [{ original: 1, replacement: 12, rollId: 'r' }] };
  const save = { ...roll, type: 'concentration', attributeKey: 'constitution', dc: 15, succeeded: true };
  const text = describeNaturalRollReceipt(roll);
  for (const rendered of [evaluationRollText(roll), renderEvaluationStats({ attack: roll }), renderEvaluationSaveRecords({ secondarySaves: [save] }), renderSkillRecordedRoll(roll)]) {
    assert.ok(rendered.includes('1 → 12'));
    assert.ok(rendered.includes('natürliche 1–3'));
  }
  assert.ok(text.includes('Ersatzwurf gilt'));
  assert.match(renderEvaluationSaveRecords({ secondarySaves: [save] }), /Konzentration/);
  assert.equal(describeNaturalRollReceipt({}), '');
  assert.equal(renderSkillRecordedRoll({}), '');
});

test('free-save composer and receipt communicate explicit causes independently of damage', () => {
  const context = { actionKind: 'spell', damageType: 'feuer', saveTags: ['fear'] };
  const html = renderSkillSaveContext({ saveContext: context });
  assert.match(html, /value="spell" selected/);
  assert.match(html, /value="feuer" selected/);
  assert.match(html, /data-skill-save-tag="fear" checked/);
  assert.match(html, /Unbekannt \/ ohne Schaden/);
  assert.equal(describeSkillSaveContext({ checkType: 'saving-throw', saveContext: context }), 'Auslöser: Zauber · Schadensart: Feuer · Gefahr: Furcht');
  assert.equal(describeSkillSaveContext({ checkType: 'skill', saveContext: context }), '');
});

test('creature dossiers display effective scores and movement with complete trait mechanics for every variant', () => {
  for (const enabled of [true, false]) {
    const creature = { id: 'local-creature', entityType: 'creature', name: '<Testtier>', combatProfile: {
      attributes: [{ key: 'intelligence', score: 14 }], combat: { movement: 9 },
      quirks: [{ id: 'custom', name: 'Prüfmerkmal', description: 'Ein lokaler Test.', active: enabled,
        mechanics: { ...mechanics, movement: 2 } }]
    } };
    const before = structuredClone(creature);
    const html = renderCreatureDossier(creature);
    assert.match(html, enabled ? /INT <b>16<\/b> \(\+3\)/ : /INT <b>14<\/b> \(\+2\)/);
    assert.match(html, enabled ? /<b>11 m<\/b>/ : /<b>9 m<\/b>/);
    for (const text of ['Naturkunde: Expertise', 'WEI-Wert höchstens 3', 'Natürliche 1: einmal', 'Prüfmerkmal']) assert.ok(html.includes(text));
    assert.ok(!html.includes('<Testtier>'));
    assert.deepEqual(creature, before);
  }
});

test('combat announcements communicate recorded personal start protection without upgrading old events', () => {
  const event = { operation: 'start', encounterId: 'local-fight', participants: [{ actorId: 'test', name: '<Testfigur>' }],
    startApplications: [{ schemaVersion: 1, actorId: 'test', temporaryHitPoints: 3 }] };
  const html = renderCombatEncounterComment({ combatEncounter: event });
  assert.match(html, /&lt;Testfigur&gt;<\/strong>: Temporäre TP zu Kampfbeginn: 3 \(höchster Vorrat, wird nicht addiert\)/);
  assert.doesNotMatch(renderCombatEncounterComment({ combatEncounter: { ...event, startApplications: [] } }), /Temporäre TP zu Kampfbeginn/);
});

test('conditional trait rules retain range, damage and saving-throw scope in their visible text', () => {
  const description = describeCombatTriggerRule({ phase: 'pre-roll', recipient: 'target', actionKinds: ['spell'], damageTypes: ['fire', 'feuer'],
    saveAttributes: ['dexterity'], effects: { rollMode: 'disadvantage', skillModifier: -1 } });
  for (const text of ['Eingehend', 'Zauber', 'GES-Rettung', 'Feuer', 'Nachteil', 'Probe -1']) assert.ok(description.includes(text), text);
  assert.equal(description.split('Feuer').length, 2);
});

test('the scene arsenal distinguishes source collections and shows exhausted ability uses', () => {
  const profile = { characterId: 'test', currentHitPoints: 8, weapon: { name: 'Testwaffe', damageFormula: '1d6' }, resources: [{ id: 'action', name: 'Aktion', current: 1, maximum: 1 }], abilities: [{ id: 'same', name: 'Testfähigkeit', description: 'Fähigkeitsquelle', usesMaximum: 1, usesCurrent: 0 }],
    weapons: [{ id: 'same', notes: 'Waffenquelle' }], actions: [
      { id: 'ability:same', sourceId: 'same', kind: 'spell', name: 'Testfähigkeit', costs: [] },
      { id: 'weapon:same', sourceId: 'same', kind: 'weapon', name: 'Testwaffe', costs: [] }
    ] };
  const html = renderCombatArsenalSummary(profile);
  assert.match(html, /Testfähigkeit<\/strong><small>Aktion · Keine Nutzung von Testfähigkeit mehr übrig\. · Nutzungen 0\/1<\/small><small>Fähigkeitsquelle/);
  assert.match(html, /Testwaffe<\/strong><small>Aktion · Verfügbar<\/small><small>Waffenquelle/);
});
