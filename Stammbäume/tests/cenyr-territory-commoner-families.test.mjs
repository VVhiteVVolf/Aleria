import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';
import { CENYR_TERRITORY_COMMONER_DEFINITIONS } from '../assets/js/data/cenyr-territory-commoner-definitions.js';
import { CENYR_TERRITORY_COMMONER_FAMILIES } from '../assets/js/data/cenyr-territory-commoner-families.js';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';

test('the ten territorial identities register once without creating people or genealogical claims', () => {
  assert.equal(CENYR_TERRITORY_COMMONER_FAMILIES.length, 10);
  assert.equal(new Set(CENYR_TERRITORY_COMMONER_FAMILIES.map(family => family.document.id)).size, 10);
  for (const family of CENYR_TERRITORY_COMMONER_FAMILIES) {
    assert.equal(FAMILY_REGISTRY.filter(record => record.id === family.document.id).length, 1, family.document.id);
    for (const key of ['persons', 'partnerships', 'parentages', 'cadetBranches', 'timeJumps']) assert.deepEqual(family[key], [], `${family.document.id}: ${key}`);
    assert.equal(family.lineage.founderPartnershipId, '');
    assert.equal(family.view.focusPersonId, '');
    assert.equal(family.lineage.crestFrame, 'iron');
  }
});

test('place hierarchy follows Llysfaen, Craithglyn and Bragwhislyn while service stays in the house profile', () => {
  for (const family of CENYR_TERRITORY_COMMONER_FAMILIES) {
    const profile = family.document.houseProfile, record = FAMILY_REGISTRY.find(record => record.id === family.document.id);
    assert.equal(profile.rankId, 'commoner'); assert.equal(profile.kingdom, 'Cenyr');
    assert.ok(['Llysfaen', 'Craithglyn', 'Bragwhislyn'].includes(profile.seat));
    assert.ok(!record.folderPath.some(part => /Herrschaft (?:der )?(?:Wyrm|Penderyn)/i.test(part)));
    if (profile.seat === 'Bragwhislyn') {
      assert.equal(profile.county, 'Vortigerns Ruh'); assert.equal(profile.barony, 'Tanwens Flamme');
      assert.equal(profile.liegeHouseId, 'haus-penderyn');
    } else {
      assert.equal(profile.county, 'Celtigerns Wacht'); assert.equal(profile.barony, 'Llamreis Ankunft');
      assert.equal(profile.liegeHouseId, 'haus-wyrm');
    }
    assert.ok(FAMILY_REGISTRY.some(record => record.id === profile.liegeHouseId));
    assert.equal(record.folderPath.at(-1), profile.seat);
  }
});

test('unknown heraldry remains an existing neutral system symbol rather than an invented coat of arms', () => {
  const root = new URL('../', import.meta.url);
  for (const family of CENYR_TERRITORY_COMMONER_FAMILIES) {
    assert.equal(family.document.emblem, 'assets/images/placeholders/neutral-crest.png');
    assert.ok(existsSync(new URL(family.document.emblem, root)));
    assert.deepEqual(family.extensions.heraldry, { status: 'unknown', systemPlaceholder: true });
  }
});

test('public territorial evidence remains traceable and the external Salach card creates no Cenyr record', () => {
  const root = new URL('../../', import.meta.url);
  for (const definition of CENYR_TERRITORY_COMMONER_DEFINITIONS) {
    assert.ok(existsSync(new URL(definition.evidence.source, root)), definition.id);
    assert.match(definition.evidence.section, /Bürgerliche Häuser/);
    assert.equal(definition.emblemStatus, 'unknown-system-placeholder');
  }
  assert.ok(!CENYR_TERRITORY_COMMONER_FAMILIES.some(family => /salach/i.test(family.document.id)));
});

test('the actual residential territory cards open all ten matching small house pages', async () => {
  const root = new URL('../../', import.meta.url), context = { window: {} };
  for (const path of ['Kontinente/assets/js/herrschaft-data.js', 'Familien Häuser und Clans/haeuser.registry.js', 'Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Herrschaft der Wyrm/herrschaft.data.js']) {
    vm.runInNewContext(readFileSync(new URL(path, root), 'utf8'), context);
  }
  const previousData = globalThis.ALERIA_HERRSCHAFT_DATA;
  let penderyn;
  try {
    globalThis.ALERIA_HERRSCHAFT_DATA = context.window.ALERIA_HERRSCHAFT_DATA;
    penderyn = (await import('../../Kontinente/Estryll/Königreich Cenyr/Grafschaft Vortigerns Ruh/Herrschaft der Penderyn/herrschaft.data.mjs')).default;
  } finally {
    if (previousData === undefined) delete globalThis.ALERIA_HERRSCHAFT_DATA;
    else globalThis.ALERIA_HERRSCHAFT_DATA = previousData;
  }
  const expected = new Set(CENYR_TERRITORY_COMMONER_DEFINITIONS.map(row => row.id));
  const cards = [context.window.KONTINENTE_DATA, penderyn].flatMap(page => page.view.familySections.flatMap(section => section.cards)).filter(card => expected.has(card.id));
  assert.deepEqual(new Set(cards.map(card => card.id)), expected);
  for (const card of cards) {
    const registered = context.window.HaeuserRegistry.byId(card.id), link = new URL(card.href, 'https://aleria.example/');
    assert.equal(registered.page, 'kleinehaeuser.html', card.id);
    assert.equal(decodeURIComponent(link.pathname), `/Familien Häuser und Clans/${registered.page}`, card.id);
    assert.equal(link.searchParams.get('haus'), card.id);
    assert.equal(card.seat, CENYR_TERRITORY_COMMONER_DEFINITIONS.find(row => row.id === card.id).houseProfile.seat);
  }
});
