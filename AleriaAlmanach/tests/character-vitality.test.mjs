import test from 'node:test';
import assert from 'node:assert/strict';
import { getStandardHitPointProgression, preserveHitPointDeficit } from '../modules/combat/combat-hit-point-progression.js';
import { getMaximumHitPoints, getHitPointProgression, sanitizeCharacterCombatProfile, upgradeCharacterHitPoints, resolveCharacterCombatProfile, restoreCharacterHitPointSnapshot } from '../modules/combat/combat-profile-model.js';
import { applyManualCharacterLevel, previewCharacterLevelUp } from '../modules/combat/combat-level-up-model.js';
import { overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';

function profile(level = 5, hitPoints = {}) {
  return upgradeCharacterHitPoints({ progression: { level }, attributes: [{ key: 'constitution', score: 12 }], hitPoints: { hitDie: 10, current: 39, ...hitPoints } });
}

test('Vitalität beträgt für alle Trefferwürfel und Stufen 1–30 ein gerundetes Viertel', () => {
  for (const hitDie of [6, 8, 10, 12]) for (let constitutionModifier = -5; constitutionModifier <= 15; constitutionModifier++) {
    let accumulated = 0;
    for (let level = 1; level <= 30; level++) {
      const hp = getStandardHitPointProgression({ hitDie, level, constitutionModifier });
      accumulated += hp.vitalityGain;
      assert.equal(accumulated, Math.ceil(hp.base / 4));
      assert.equal(hp.total, hp.base + accumulated);
      assert.ok(hp.total >= 1);
    }
  }
});

test('Migration ist idempotent, erhält Wunden und verändert temporäre LP nicht', () => {
  const healthy = profile();
  assert.equal(getMaximumHitPoints(healthy), 49);
  assert.equal(healthy.hitPoints.current, 49);
  const hurt = profile(5, { current: 20, temporary: 7 });
  assert.equal(hurt.hitPoints.current, 30);
  assert.equal(hurt.hitPoints.temporary, 7);
  assert.deepEqual(upgradeCharacterHitPoints(hurt), hurt);
  assert.equal(profile(5, { current: 0 }).hitPoints.current, 0);
  assert.equal(profile(5, { current: null }).hitPoints.current, null);
});

test('Eigene Maxima erhalten genau einen Zuschlag und wachsen danach mit der Stufe', () => {
  const initial = profile(5, { maximumOverride: 41, current: 41 });
  assert.equal(getMaximumHitPoints(initial), 52);
  const raised = applyManualCharacterLevel(initial, 6).profile;
  assert.equal(getMaximumHitPoints(raised), 61);
  assert.equal(raised.hitPoints.current, 61);
  assert.equal(getMaximumHitPoints(applyManualCharacterLevel(raised, 5).profile), 52);
  assert.equal(getMaximumHitPoints(upgradeCharacterHitPoints(raised)), 61);
});

test('Manuelle Stufenänderung erhält fehlende LP und heilt keine Figur bei 0 LP', () => {
  const hurt = profile(5, { current: 20 });
  const next = applyManualCharacterLevel(hurt, 8).profile;
  assert.equal(getMaximumHitPoints(next) - next.hitPoints.current, 19);
  const zero = applyManualCharacterLevel(profile(5, { current: 0 }), 8).profile;
  assert.equal(zero.hitPoints.current, 0);
});

test('Gewürfelter Zuwachs und rückwirkende KON-Steigerung erhalten den Vitalitätsanteil', () => {
  const before = profile(3, { current: null });
  const next = previewCharacterLevelUp(before, { hitPointMode: 'manual', manualHitPointGain: 8, attributeIncreases: { constitution: 2 } });
  const beforeHp = getHitPointProgression(before);
  const nextHp = getHitPointProgression(next.profile);
  assert.equal(nextHp.maximum - beforeHp.maximum, 8 + 3 + nextHp.standard.bonus - beforeHp.standard.bonus);
  const following = applyManualCharacterLevel(next.profile, 5).profile;
  assert.equal(getMaximumHitPoints(following) - nextHp.maximum, 10);
});

test('Stufe 21 erhält einen normalen Folgewürfel und keinen zweiten Startbonus', () => {
  const before = upgradeCharacterHitPoints({ progression: { level: 20 }, attributes: [{ key: 'constitution', score: 14 }], hitPoints: { hitDie: 10 } });
  const next = previewCharacterLevelUp(before, { attributeIncreases: { strength: 4 } }).profile;
  assert.equal(getMaximumHitPoints(before), 205);
  assert.equal(getMaximumHitPoints(next), 215);
});

test('Alte Szenenmaxima werden ohne Heilung oder Verdopplung auf neue LP bezogen', () => {
  const resolved = resolveCharacterCombatProfile({ id: 'gawain', combatProfile: profile() });
  const overlaid = overlayCombatHitPointState(resolved, { current: 20, maximum: 39, temporary: 6 });
  assert.equal(overlaid.maximumHitPoints, 49);
  assert.equal(overlaid.currentHitPoints, 30);
  assert.equal(overlaid.temporaryHitPoints, 6);
  assert.equal(overlayCombatHitPointState(resolved, { current: 0, maximum: 39 }).currentHitPoints, 0);
  assert.equal(overlayCombatHitPointState(resolved, { current: 30, maximum: 49 }).currentHitPoints, 30);
});

test('Legacy-Kreaturen und Ausrüstungsboni werden nicht pauschal skaliert', () => {
  const creature = sanitizeCharacterCombatProfile({ hitPoints: { maximumOverride: 40 } });
  assert.equal(getMaximumHitPoints(creature), 40);
  const character = profile();
  character.conditions.push({ id: 'item', active: true, mechanics: { maximumHitPoints: 8 } });
  assert.equal(getMaximumHitPoints(character), 57);
});

test('Defizit bleibt auch beim Absenken des Maximums konsistent', () => {
  assert.equal(preserveHitPointDeficit(45, 60, 40), 25);
  assert.equal(preserveHitPointDeficit(0, 60, 40), 0);
});

test('Rücknahme alter Beiträge erhält die neue LP-Regel und die damaligen Wunden', () => {
  const restored = restoreCharacterHitPointSnapshot(profile(), { current: 30, temporary: 3, hitDie: 10 });
  assert.equal(restored.current, 40);
  assert.equal(restored.temporary, 3);
  assert.equal(restored.vitality.version, 1);
});
