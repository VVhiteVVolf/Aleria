import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import '../../AleriaAlmanach/modules/core/aleria-calendar.js';
import { readAstrologyDeities } from '../modules/zodiac/zodiac-repository.mjs';
import { ALL_SIGNS } from '../modules/zodiac/zodiac-data.mjs';
import { createEphemeris } from '../modules/ephemeris/ephemeris-model.mjs';
import { renderAstrologyPage } from '../modules/page/astrology-template.mjs';

const deities = readAstrologyDeities(), calendar = globalThis.AleriaCalendar;
const html = renderAstrologyPage({ deities, calendar, sky: createEphemeris(calendar).at(calendar.current()) });

test('Göttliche und infernale Namen kommen aus dem Religionscodex', () => {
  for (const sign of ALL_SIGNS) {
    assert.ok(deities[sign.id].epithet);
    if (sign.shadowId) assert.ok(deities[sign.shadowId].epithet);
    for (const id of [sign.id, sign.shadowId].filter(Boolean)) assert.ok(existsSync(new URL(deities[id].href, new URL('../index.html', import.meta.url))));
  }
});

test('Alle 19 Karten zeigen beide zugeordneten Gottheiten mit Themenbildern', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal((html.match(/data-role="zodiac-card"/g) || []).length, 19);
  assert.equal((html.match(/data-role="zodiac-art"/g) || []).length, 20);
  assert.equal((html.match(/data-role="zodiac-theme-image"/g) || []).length, 40);
  assert.equal((html.match(/data-role="zodiac-placeholder"/g) || []).length, 0);
  assert.doesNotMatch(html, /assets\/cards\/|data-astrology-image-link/);
  assert.doesNotMatch(html, /undefined|null/);
  assert.doesNotMatch(html, /\son(?:click|input|change|error)=/i);
});

test('Jeder benannte infernale Schatten gehört nur einem Zeichen', () => {
  const shadows = ALL_SIGNS.map(sign => sign.shadowId).filter(Boolean);
  assert.equal(new Set(shadows).size, shadows.length);
  assert.equal(ALL_SIGNS.find(sign => sign.id === 'ordan').shadowId, 'adar');
  assert.equal(ALL_SIGNS.find(sign => sign.shadowId === 'dagon').id, 'thyrael');
  assert.equal(ALL_SIGNS.find(sign => sign.shadowId === 'thraal').id, 'nimue');
  for (const [id, shadow] of Object.entries({tethyra:'nhaera',rhea:'syressa',aelthar:'nymhra',zephyr:'maelach'})) {
    assert.equal(ALL_SIGNS.find(sign => sign.id === id).shadowId, shadow);
  }
  assert.equal(shadows.length,19);
});

test('Tethyras Monatsanzeige nennt Nhaera und bewahrt die Bedeutung der Heimkehr', () => {
  const sky = createEphemeris(calendar).at({ year: 1740, month: 11, day: 1 });
  const page = renderAstrologyPage({ deities, calendar, sky });
  assert.ok(page.includes('Nhaera'));
  assert.ok(page.includes('Heimkehrverzicht'));
  assert.doesNotMatch(page, /Widersacher noch offen/);
  assert.doesNotMatch(page, /undefined|null/);
});

test('Seite bleibt ohne JavaScript lesbar und lokale Ressourcen existieren', () => {
  assert.ok(html.includes('<noscript>'));
  assert.ok(html.includes('Die Rechenregeln der Sternwarte'));
  for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (href.startsWith('#')) assert.ok(html.includes(`id="${href.slice(1)}"`), href);
    else assert.ok(existsSync(new URL(href, new URL('../index.html', import.meta.url))), href);
  }
});
