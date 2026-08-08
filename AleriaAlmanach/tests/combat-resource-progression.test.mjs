import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAuraFocusMaximum,
  getCasterManaMaximum,
  getCombatActionEconomy,
  getDivineOrInfernalPointsMaximum,
  getHighestUnlockedSpellGrade,
  getPactPointsMaximum,
  getSpellManaCost,
  SPELL_GRADE_MANA_COST
} from '../modules/combat/combat-resource-progression.js';

test('Aktionsökonomie wächst über die festgelegten Stufen bis Rang 30', () => {
  assert.deepEqual(getCombatActionEconomy(1), {
    action: 1, 'bonus-action': 1, reaction: 1, 'special-action': 2
  });
  assert.deepEqual(getCombatActionEconomy(6), {
    action: 1, 'bonus-action': 1, reaction: 2, 'special-action': 2
  });
  assert.deepEqual(getCombatActionEconomy(11), {
    action: 1, 'bonus-action': 2, reaction: 2, 'special-action': 3
  });
  assert.deepEqual(getCombatActionEconomy(16), {
    action: 2, 'bonus-action': 2, reaction: 3, 'special-action': 3
  });
  assert.deepEqual(getCombatActionEconomy(20), {
    action: 3, 'bonus-action': 2, reaction: 3, 'special-action': 4
  });
  assert.deepEqual(getCombatActionEconomy(20, 10), {
    action: 4, 'bonus-action': 3, reaction: 4, 'special-action': 5
  });
});

test('Zaubergrade werden teurer: Zaubertrick kostet 1 Mana, Grad X kostet 15 (D&Ds DMG-Umrechnung, fortgesetzt)', () => {
  assert.equal(SPELL_GRADE_MANA_COST.length, 11);
  assert.equal(getSpellManaCost(0), 1);
  assert.equal(getSpellManaCost(1), 2);
  assert.equal(getSpellManaCost(5), 7);
  assert.equal(getSpellManaCost(10), 15);
  assert.equal(getSpellManaCost(99), 15, 'wird auf Grad X begrenzt');
});

test('Vollcaster schaltet Zaubergrade im Zweijahresrhythmus bis Grad X bei Stufe 19 frei', () => {
  assert.equal(getHighestUnlockedSpellGrade('full', 1), 1);
  assert.equal(getHighestUnlockedSpellGrade('full', 2), 1);
  assert.equal(getHighestUnlockedSpellGrade('full', 3), 2);
  assert.equal(getHighestUnlockedSpellGrade('full', 9), 5);
  assert.equal(getHighestUnlockedSpellGrade('full', 18), 9);
  assert.equal(getHighestUnlockedSpellGrade('full', 19), 10);
  assert.equal(getHighestUnlockedSpellGrade('full', 20), 10);
});

test('Halbcaster startet später, schaltet langsamer frei und erreicht nie mehr als Grad V', () => {
  assert.equal(getHighestUnlockedSpellGrade('half', 1), 0);
  assert.equal(getHighestUnlockedSpellGrade('half', 2), 1);
  assert.equal(getHighestUnlockedSpellGrade('half', 4), 1);
  assert.equal(getHighestUnlockedSpellGrade('half', 8), 2);
  assert.equal(getHighestUnlockedSpellGrade('half', 9), 3);
  assert.equal(getHighestUnlockedSpellGrade('half', 17), 5);
  assert.equal(getHighestUnlockedSpellGrade('half', 20), 5);
});

test('Mana-Pool wächst je Stufe (D&Ds Spielpunkte-Tabelle plus Zaubertrick-Polster) und zusätzlich je Sonderrang', () => {
  assert.equal(getCasterManaMaximum('full', 1), 14);
  assert.equal(getCasterManaMaximum('full', 20), 153);
  assert.equal(getCasterManaMaximum('full', 20, 5), 153 + 5 * 18);
  assert.equal(getCasterManaMaximum('half', 1), 10, 'Halbcaster ohne Zaubergrad-Zugriff haben trotzdem genug für ein paar Zaubertricks');
  assert.equal(getCasterManaMaximum('half', 20), 84);
  assert.equal(getCasterManaMaximum('half', 20, 3), 84 + 3 * 10);
  assert.equal(getCasterManaMaximum('unknown-tier', 1), getCasterManaMaximum('full', 1), 'unbekannte Caster-Stufe fällt auf Vollcaster zurück');
});

test('Aura-Fokuspunkte: erster Punkt bei Stufe 6, danach alle vier Stufen einer bis vier bei Stufe 18, Sonderränge geben je einen extra', () => {
  assert.equal(getAuraFocusMaximum(1), 0);
  assert.equal(getAuraFocusMaximum(5), 0);
  assert.equal(getAuraFocusMaximum(6), 1);
  assert.equal(getAuraFocusMaximum(9), 1);
  assert.equal(getAuraFocusMaximum(10), 2);
  assert.equal(getAuraFocusMaximum(14), 3);
  assert.equal(getAuraFocusMaximum(18), 4);
  assert.equal(getAuraFocusMaximum(20), 4);
  assert.equal(getAuraFocusMaximum(20, 10), 14, 'Rang 30 gewährt zehn Bonuspunkte obendrauf');
});

test('Celestiale/Infernale Punkte wachsen gleichmäßig mit der effektiven Stufe bis 15 bei Rang 30', () => {
  assert.equal(getDivineOrInfernalPointsMaximum(1), 0);
  assert.equal(getDivineOrInfernalPointsMaximum(20), 10);
  assert.equal(getDivineOrInfernalPointsMaximum(20, 10), 15);
});

test('Paktpunkte haben (anders als Celestial/Infernal) einen Sockel von 2, damit ein Stufe-1-Hexer sich wenigstens Zaubertricks leisten kann', () => {
  assert.equal(getPactPointsMaximum(1), 2);
  assert.equal(getPactPointsMaximum(20), 12);
  assert.equal(getPactPointsMaximum(20, 10), 17);
});
