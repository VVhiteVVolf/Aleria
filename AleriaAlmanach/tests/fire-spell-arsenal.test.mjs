import test from 'node:test';
import assert from 'node:assert/strict';

import { FIRE_SPELL_ARSENAL } from '../modules/character-archive/fire-spell-arsenal.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';

test('das Feuerarsenal deckt genau die Grade 1-5 mit je zwei Zaubern ab', () => {
  assert.equal(FIRE_SPELL_ARSENAL.length, 10);
  const byLevel = new Map();
  FIRE_SPELL_ARSENAL.forEach(spell => byLevel.set(spell.level, (byLevel.get(spell.level) || 0) + 1));
  assert.deepEqual([...byLevel.keys()].sort(), [1, 2, 3, 4, 5]);
  for (const level of [1, 2, 3, 4, 5]) assert.equal(byLevel.get(level), 2, `Grad ${level} sollte genau zwei Zauber haben`);
});

test('jeder Feuerzauber hat einen eindeutigen Namen und eine gueltige Wuerfelformel oder ist bewusst formellos (Beschwoerung)', () => {
  const names = new Set();
  FIRE_SPELL_ARSENAL.forEach(spell => {
    assert.equal(names.has(spell.name), false, `Doppelter Name: ${spell.name}`);
    names.add(spell.name);
    assert.equal(spell.damageType, 'Feuer');
    if (spell.rollFormula) assert.match(spell.rollFormula, /^\d+d\d+$/i);
  });
});

test('jeder Feuerzauber uebersteht sanitizeCharacterCombatProfile unveraendert in seinen Kernwerten', () => {
  FIRE_SPELL_ARSENAL.forEach(spell => {
    const profile = sanitizeCharacterCombatProfile({ magic: { spells: [spell] } });
    const sanitized = profile.magic.spells[0];
    assert.equal(sanitized.name, spell.name);
    assert.equal(sanitized.level, spell.level);
    assert.equal(sanitized.damageType, 'Feuer');
    assert.equal(sanitized.activationType, spell.activationType);
    assert.equal(sanitized.resolutionType, spell.resolutionType);
    assert.ok(sanitized.manaCost > 0, `${spell.name} sollte einen aus dem Grad berechneten Manapreis erhalten`);
    if (spell.rollFormula) assert.equal(sanitized.rollFormula.toLowerCase(), spell.rollFormula.toLowerCase());
  });
});
