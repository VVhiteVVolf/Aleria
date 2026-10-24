import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import source from '../modules/leitheach/pages.source.json' with { type: 'json' };
import catalog from '../../Karten/Leitheach/territories.import.json' with { type: 'json' };
import { createTerritory } from '../modules/leitheach/territory-page.mjs';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';

const root = new URL('../../', import.meta.url);
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL('Kontinente/assets/js/herrschaft-data.js', root), 'utf8'), context);
vm.runInNewContext(fs.readFileSync(new URL('Kontinente/kontinente.registry.js', root), 'utf8'), context);
vm.runInNewContext(fs.readFileSync(new URL('Karten/karten.registry.js', root), 'utf8'), context);
const pages = new Map(source.pages.map(page => [page.id, page]));
const exists = href => fs.existsSync(new URL('.' + new URL(href, 'https://aleria.local').pathname, root));

test('Leitheach articles, heraldry and portrait links load through the shared territory catalog', () => {
  assert.equal(pages.size, 26);
  for (const page of source.pages) {
    const rendered = createTerritory(page.id, context.window.ALERIA_HERRSCHAFT_DATA);
    assert.equal(rendered.meta.id, page.id);
    const entry = context.window.KONTINENTE_REGISTRY.find(entry => entry.id === page.id);
    assert.ok(entry?.page, page.id);
    assert.ok(exists('/Kontinente/' + entry.page));
    assert.ok(exists(page.parentHref));
    assert.ok(exists(page.crestSrc));
    assert.ok(exists(page.map.imageSrc));
    for (const house of page.families.flatMap(section => section.houses)) {
      assert.ok(getRegisteredFamily(house.familyId), house.familyId);
      assert.ok(exists(house.imageSrc), house.imageSrc);
    }
    for (const member of page.councilGroups.flatMap(group => group.members)) {
      if (!member.familyId) continue;
      const family = getRegisteredFamily(member.familyId).family;
      const person = new URL(member.href, 'https://aleria.local').searchParams.get('person');
      assert.ok(family.persons.some(entry => entry.id === person), member.href);
      if (member.imageSrc) assert.ok(exists(member.imageSrc), member.imageSrc);
    }
  }
});

test('only immediate territories and clans appear at each level of Leitheach', () => {
  const main = pages.get('fuerstentum-leitheach');
  assert.equal(main.territoryLinks.length, 6);
  assert.equal(main.families.flatMap(section => section.houses).length, 6);
  const coimh = pages.get('leitheach-tir-na-coimhthioch');
  assert.deepEqual(new Set(coimh.territoryLinks), new Set([
    'leitheach-herrschaft-cleir', 'leitheach-herrschaft-ghaiscioch', 'leitheach-herrschaft-ceardaiocht',
  ]));
  assert.ok(!pages.get('leitheach-tir-na-sinsear').territoryLinks.includes('leitheach-herrschaft-cleir'));
  for (const page of source.pages) {
    const expected = catalog.territories.filter(territory => territory.parentId === page.id).map(t => t.id);
    assert.deepEqual(page.territoryLinks, expected);
    for (const childId of expected) {
      const child = pages.get(childId);
      const parent = catalog.territories.find(t => t.id === page.id);
      assert.equal(child.parentHref, parent.href);
      assert.deepEqual(child.hierarchy.slice(0, -1), page.hierarchy);
    }
  }
});

test('legacy copy errors do not replace current rulers or user-confirmed Fancha', () => {
  assert.equal(pages.get('leitheach-herrschaft-ard-trodach').councilGroups[0].members[0].name, 'Caireall Trodach');
  assert.equal(pages.get('leitheach-herrschaft-nic-caoimhe').councilGroups[0].members[0].name, 'Ciannait Caoimhe');
  assert.equal(pages.get('leitheach-tir-na-sleagh').councilGroups[0].members[0].name, 'Tairdelbach Cumhail');
  assert.equal(pages.get('fuerstentum-leitheach').councilGroups[0].members[0].name, 'Fionn Cumhail');
  assert.equal(pages.get('leitheach-herrschaft-somhairle').type, 'Herrschaft');
  assert.equal(pages.get('leitheach-tir-na-fancha').families[0].houses[0].familyId, 'haus-na-mhuir');
  assert.doesNotMatch(JSON.stringify(pages.get('leitheach-tir-na-fancha')), /Buarstrath/);
  assert.match(pages.get('fuerstentum-leitheach').copy.overview.join(' '), /Kronalben/);
  assert.match(pages.get('leitheach-tir-na-sruth').copy.economy.join(' '), /Flusshandel/);
});

test('all seven maps and territory pages link to one another with source-identified settlement pins', () => {
  const maps = context.window.KartoMapRegistry.all().filter(map => map.id === 'leitheach' || map.id.startsWith('leitheach-'));
  assert.equal(maps.length, 7);
  for (const map of maps) {
    assert.ok(exists(map.territoryHref), map.id);
    const territory = catalog.territories.find(t => t.href === map.territoryHref);
    assert.equal(pages.get(territory.id).map.href, '/Karten/karte.html?map=' + map.id);
    const stored = JSON.parse(fs.readFileSync(new URL('Karten/' + map.dataPath, root), 'utf8'));
    assert.ok(stored.state.pins.length > 0);
    assert.ok(stored.state.pins.every(pin => pin.sourceRef.markerId === pin.id));
    assert.equal(createHash('sha256').update(JSON.stringify(stored.state)).digest('hex'), stored.generatedStateHash);
  }
  const ailith = fs.readFileSync(new URL('Kontinente/Alben/Der Schild von Ailith.html', root), 'utf8');
  const main = catalog.territories.find(t => t.id === 'fuerstentum-leitheach');
  assert.ok(ailith.includes(`href="${main.href}"`));
});

test('settlement registers expand their own places and leave lower authorities nested', () => {
  let count = 0;
  for (const page of source.pages) {
    const rendered = createTerritory(page.id, context.window.ALERIA_HERRSCHAFT_DATA);
    const domains = rendered.view.geography.domains;
    for (const domain of domains) {
      assert.equal(domain.territoryId, page.id);
      count += domain.sections.reduce((n,s) => n + s.places.length, 0);
    }
  }
  assert.equal(count, 304);
  assert.equal(createTerritory('fuerstentum-leitheach', context.window.ALERIA_HERRSCHAFT_DATA).view.geography.domains.length, 0);
});

test('archived Leitheach source articles remain byte-for-byte intact', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('Karten/Leitheach/sources/articles.manifest.json', root), 'utf8'));
  for (const article of manifest) {
    const bytes = fs.readFileSync(new URL('Karten/Leitheach/sources/' + article.file, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), article.sha256, article.file);
  }
});
