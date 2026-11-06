import test from 'node:test';
import assert from 'node:assert/strict';
import { REALM_CONTEXT } from '../Leukonia/realm-context.mjs';
import { SOCIAL_CASTES } from '../Leukonia/culture-data.mjs';
import { HOUSES } from '../Leukonia/house-data.mjs';
import { ARTWORKS } from '../Leukonia/art-data.mjs';
import { CLASS_PROTOTYPES } from '../Leukonia/class-prototype-data.mjs';
import { ARCHONATES } from '../Leukonia/territory-data.mjs';

const text = value => Object.values(value).filter(item => typeof item === 'string').join(' ');

test('Argentum behält seine drei Großprovinzen und die sechs ausdrücklich benannten Kasten', () => {
  assert.deepEqual(REALM_CONTEXT.provinces.map(item => item.name), ['Leukonia', 'Vardentia', 'Calidaria']);
  assert.deepEqual(SOCIAL_CASTES.map(item => item.name), ['Illustris', 'Patrizier', 'Magnarier', 'Mercantrier', 'Plebejer', 'Servi']);
  assert.deepEqual(ARTWORKS.filter(item => item.kind === 'caste').map(item => item.id), SOCIAL_CASTES.map(item => item.id));
  assert.match(REALM_CONTEXT.history.find(item => item.id === 'tlapatlan').text, /Tlapanui.*Sundara.*Tlapatlan/s);
  assert.match(REALM_CONTEXT.religion.text, /Celestische Synode.*Religionsfreiheit.*Missionierung.*unerwünscht/s);
});

test('Vierzehn bestätigte Posten trennen den Archonrang von dreizehn Reichsämtern und dem abgeschafften Konsul', () => {
  assert.deepEqual(REALM_CONTEXT.nobility.map(item => item.title), ['Archon']);
  assert.deepEqual(REALM_CONTEXT.offices.map(item => item.title), [
    'Prokonsul', 'Legat', 'Quästor', 'Prätor', 'Magus', 'Pontifex', 'Herold',
    'Speculatores', 'Artifex', 'Aedil', 'Volkstribun', 'Nauticus', 'Honor Custus',
  ]);
  assert.match(REALM_CONTEXT.government.text, /Kaiserin.*Konsuls.*abgeschafft/s);
  assert.match(REALM_CONTEXT.government.senateNote, /drei Prokonsule.*automatisch.*Archone.*automatisch.*Gesamtzahl.*nicht festgelegt/is);
  assert.match(text(REALM_CONTEXT.offices.find(item => item.id === 'aedil')), /fünf Aedile je Quästor/i);
  assert.match(text(REALM_CONTEXT.offices.find(item => item.id === 'volkstribun')), /Einmaliges jährliches Vetorecht.*Reichweite und Wirkungsdauer.*nicht festgelegt/s);
  assert.match(text(REALM_CONTEXT.offices.find(item => item.id === 'honor-custus')), /Garde untersteht allein dem Kaiseramt.*Legat und Quästor.*keine Befehlsgewalt.*abgeschaffte Konsulamt/s);
});

test('Präfekt und Magistrat bleiben nicht erbliche Verwaltungsposten ohne erfundene Amtszeit oder Erbfolge', () => {
  assert.deepEqual(REALM_CONTEXT.administration.localPosts.map(item => item.title), ['Präfekt', 'Magistrat']);
  assert.match(REALM_CONTEXT.administration.appointments, /Präfekt und Magistrat sind nicht erblich.*Archon entscheidet.*Kaiser kann/s);
  assert.match(REALM_CONTEXT.administration.note, /keine weiteren Adelsränge.*Verwaltungsposten/s);
  assert.match(REALM_CONTEXT.nobility[0].note, /untersteht dem Prokonsul.*automatisch Senator/s);
  assert.match(REALM_CONTEXT.openQuestions.join(' '), /Amtszeiten sind offen/);
});

test('Zehn Institute verwenden Orbus qui Mariella und erhalten ihre ausdrücklich zugeordneten Leitungen', () => {
  assert.deepEqual(REALM_CONTEXT.institutions.map(item => item.name), [
    'Judikatur des Othorin', 'Hetären der Lytheris', 'Forum des Tharistos',
    'Kaiserliche Universität', 'Venaim Rogare Thedros', 'Sepulcretum Kharos',
    'Mardrans Contubernium', 'Avrum Divanas', 'Auspicium Ordeus', 'Orbus qui Mariella',
  ]);
  const institutions = new Map(REALM_CONTEXT.institutions.map(item => [item.id, item]));
  for (const [id, leader] of [
    ['judikatur-des-othorin', /Prätor/], ['forum-des-tharistos', /Quästor/],
    ['kaiserliche-universitaet', /Artifex/], ['mardrans-contubernium', /Legat/],
    ['avrum-divanas', /Aedilsposten/], ['orbus-qui-mariella', /Priester der Mariella/],
  ]) assert.match(institutions.get(id).leadership, leader);
});

test('Der neue Hoplit ersetzt den Stier als einzig aktives Provinzwappen; nur fünf Festlandbanner bleiben aktiv', () => {
  assert.deepEqual(ARTWORKS.filter(item => item.kind === 'province').map(item => item.id), ['province-leukonia-v2']);
  const province = ARTWORKS.find(item => item.id === 'province-leukonia-v2');
  assert.match(province.description, /korinthisch.*Hoplit.*Gorgon/i);
  assert.match(province.image, /leukonia-v2\.webp$/);
  const banners = ARTWORKS.filter(item => item.kind === 'archonate');
  assert.equal(banners.length, 5);
  assert.deepEqual(new Set(banners.map(item => item.id)), new Set(ARCHONATES.map(item => item.bannerId)));
  assert.ok(banners.every(item => item.houseId !== 'house-bolar' && item.archonateId !== 'archonat-insel'));
  const bolar = HOUSES.find(item => item.id === 'house-bolar');
  assert.equal(bolar.rank, 'Archon');
  assert.equal(bolar.archonateId, null);
  assert.equal(bolar.sourceSeat, null);
  assert.ok(HOUSES.filter(item => item.status === 'proposal').every(item => item.rank === null && item.sourceSeat === null));
  assert.ok(ARCHONATES.every(item => item.assignmentStatus === 'editable-proposal'));
});

test('Alle sieben bestätigten Rollen bleiben unbenannte Bildentwürfe; Rückenköcher begründen keine erfundene Fernwaffenart', () => {
  assert.deepEqual(CLASS_PROTOTYPES.map(item => item.id), Array.from({ length: 7 }, (_, index) => `prototype-0${index + 1}`));
  for (const item of CLASS_PROTOTYPES) {
    assert.equal(item.status, 'proposal');
    assert.equal(item.statusNote, 'Klassenname offen');
    assert.match(item.name, /^Prototyp \d$/);
  }
  assert.deepEqual(CLASS_PROTOTYPES.find(item => item.id === 'prototype-04').equipment, ['Speer', 'Rückenköcher']);
  assert.deepEqual(CLASS_PROTOTYPES.find(item => item.id === 'prototype-05').equipment, ['Säbel', 'Rückenköcher']);
  assert.match(CLASS_PROTOTYPES.find(item => item.id === 'prototype-05').role, /Mariner und Kleriker des Zephyr/);
});
