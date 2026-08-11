import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getActivationIconSource,
  getCombatEntryIconPresentation,
  getDamageTypeIconSource,
  getDurationIconSource,
  getResolutionIconSource,
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
  assert.match(decodedPath(getActivationIconSource('bonus-action')), /Zauberkarten Icons\/Aktionskosten\/Bonusaktion\.svg$/);
  assert.match(decodedPath(getRollIconSource('2W6', 'Feuer')), /Würfel Icons\/D6_Fire\.png$/);
});

test('leitet aus Auflösungsart und Rettungswurf-Attribut das passende Angriffs-/Rettungswurf-Icon ab (nicht mehr den Schadenstyp)', () => {
  assert.match(
    decodedPath(getResolutionIconSource({ resolutionType: 'saving-throw', saveAttribute: 'dexterity' })),
    /Rettungswurf und Angriff\/Rettungswurf Geschicklichkeit\.svg$/
  );
  assert.match(
    decodedPath(getResolutionIconSource({ resolutionType: 'saving-throw', saveAttribute: 'unbekannt' })),
    /Rettungswurf und Angriff\/Rettungswurf Allgemein\.svg$/
  );
  assert.match(
    decodedPath(getResolutionIconSource({ resolutionType: 'spell-attack' })),
    /Rettungswurf und Angriff\/Angriff Fernkampf\.svg$/
  );
  assert.match(
    decodedPath(getResolutionIconSource({ resolutionType: 'automatic' })),
    /Rettungswurf und Angriff\/Rettungswurf Allgemein\.svg$/
  );
});

test('leitet aus Dauer-Text und Konzentration das passende Dauer-Icon ab', () => {
  assert.match(decodedPath(getDurationIconSource({ concentration: true, duration: '1 Minute' })), /Ressourcen\/Konzentration\.svg$/);
  assert.match(decodedPath(getDurationIconSource({ duration: 'Sofort' })), /Dauer\/Sofort\.svg$/);
  assert.match(decodedPath(getDurationIconSource({ duration: '3 Runden' })), /Dauer\/Runden\.svg$/);
  assert.match(decodedPath(getDurationIconSource({ duration: 'bis zu 10 Minuten' })), /Dauer\/Minuten\.svg$/);
  assert.match(decodedPath(getDurationIconSource({ duration: '' })), /Dauer\/Sofort\.svg$/);
});

test('respektiert ein explizites Zaubericon und behält einen automatischen Fallback', () => {
  const presentation = getCombatEntryIconPresentation('spell', { name: 'Frostgriff', icon: '../eigene-icons/frost.png' });
  assert.equal(presentation.source, '../eigene-icons/frost.png');
  assert.equal(presentation.custom, true);
  assert.match(decodedPath(presentation.fallbackSource), /Oblivion Style\/OB-icon-Frost\.png$/);
});
