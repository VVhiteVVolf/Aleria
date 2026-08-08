import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getActivationIconSource,
  getCombatEntryIconPresentation,
  getDamageTypeIconSource,
  getRollIconSource
} from '../modules/combat/combat-entry-icons.js';

function decodedPath(url) {
  return decodeURIComponent(new URL(url).pathname).replace(/\\/g, '/');
}

test('ordnet Duncans Eigenschaften passenden Trait-Icons zu', () => {
  assert.match(decodedPath(getCombatEntryIconPresentation('quirk', { name: 'Waffenmeister' }).source), /Traits Icon\/Duelist\.png$/);
  assert.match(decodedPath(getCombatEntryIconPresentation('quirk', { name: 'Mentor vieler Ritter' }).source), /Traits Icon\/Inspiring_leader\.png$/);
  assert.match(decodedPath(getCombatEntryIconPresentation('quirk', { name: 'In die Jahre gekommen' }).source), /Traits Icon\/Infirm\.png$/);
});

test('ordnet Zauber, Zustände und Regelwerte ihren Bildbibliotheken zu', () => {
  assert.match(decodedPath(getCombatEntryIconPresentation('spell', { name: 'Flammenlanze' }).source), /Oblivion Style\/OB-icon-Fire\.png$/);
  assert.match(decodedPath(getCombatEntryIconPresentation('condition', { name: 'Brennend' }).source), /Condition Icons\/Burning_Condition_Icon\.webp$/);
  assert.match(decodedPath(getDamageTypeIconSource('Feuerschaden')), /Schadensarten\/Fire_Damage_Icon\.png$/);
  assert.match(decodedPath(getActivationIconSource('bonus-action')), /Ressourcen\/Bonus_Action_Icon\.png$/);
  assert.match(decodedPath(getRollIconSource('2W6', 'Feuer')), /Würfel Icons\/D6_Fire\.png$/);
});

test('respektiert ein explizites Zaubericon und behält einen automatischen Fallback', () => {
  const presentation = getCombatEntryIconPresentation('spell', { name: 'Frostgriff', icon: '../eigene-icons/frost.png' });
  assert.equal(presentation.source, '../eigene-icons/frost.png');
  assert.equal(presentation.custom, true);
  assert.match(decodedPath(presentation.fallbackSource), /Oblivion Style\/OB-icon-Frost\.png$/);
});
