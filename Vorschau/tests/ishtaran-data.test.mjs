import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { REALM_CONTEXT } from '../Ishtaran/realm-context.mjs';
import { CITY_NAME_PROPOSALS, HOUSE_NAME_PROPOSALS } from '../Ishtaran/name-proposals.mjs';
import { EMBLEMS } from '../Ishtaran/heraldry-data.mjs';
import { WARRIORS } from '../Ishtaran/warrior-data.mjs';
import { EMBLEM_WARRIORS } from '../Ishtaran/emblem-warrior-data.mjs';
import { CLASS_OVERVIEW_WARRIORS } from '../Ishtaran/class-overview-data.mjs';
import { MAP_VARIANTS } from '../Ishtaran/map-data.mjs';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';

const country = new URL('../Ishtaran/', import.meta.url);
const manifest = JSON.parse((await readFile(new URL('assets.source.json', country), 'utf8')).replace(/^\uFEFF/, ''));

test('Ishtaran bewahrt alle gelieferten Wappenoriginale und ihre Prüfsummen', async () => {
  assert.equal(manifest.country, 'Ishtaran');
  assert.equal(manifest.mapExcluded, false);
  assert.equal(manifest.mapsPrepared, true);
  assert.equal(manifest.assets.length, 11);
  assert.equal(EMBLEMS.filter(item => item.status === 'source').length, manifest.assets.length);
  for (const source of manifest.assets) {
    const bytes = await readFile(new URL(source.file, country));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, source.originalName);
    assert.equal(source.assignment, null);
    assert.equal(EMBLEMS.find(item => item.id === source.id)?.original, source.file);
  }
});

test('Städte- und Wappenkatalog bleiben vom eigenen Haus- und Sitzentwurf getrennt', () => {
  assert.deepEqual(REALM_CONTEXT.settlementPlan, { fixedCities: 21, largeCities: 9, capitalCities: 1, countTierCities: 8, baronKnightPrinceTierCities: 12, additionalEmblems: 26, destroyedCities: 1 });
  assert.equal(REALM_CONTEXT.settlementPlan.capitalCities + REALM_CONTEXT.settlementPlan.countTierCities, REALM_CONTEXT.settlementPlan.largeCities);
  assert.equal(REALM_CONTEXT.settlementPlan.largeCities + REALM_CONTEXT.settlementPlan.baronKnightPrinceTierCities, REALM_CONTEXT.settlementPlan.fixedCities);
  assert.equal(EMBLEMS.filter(item => item.group === 'pool' && item.status === 'source').length, 10);
  assert.equal(EMBLEMS.filter(item => item.group === 'pool' && item.status === 'proposal').length, 26);
  assert.deepEqual(EMBLEMS.filter(item => item.group === 'ancient').map(item => item.id), ['maghneach']);
  assert.equal(EMBLEMS.filter(item => item.group === 'realm').length, 1);
  for (const items of [CITY_NAME_PROPOSALS, HOUSE_NAME_PROPOSALS, EMBLEMS]) {
    assert.equal(new Set(items.map(item => item.id)).size, items.length);
    for (const item of items) {
      for (const field of ['seat', 'sourceSeat', 'houseId', 'cityId', 'assignedTo']) assert.equal(Object.hasOwn(item, field), false, `${item.id}: ${field}`);
    }
  }
  assert.ok(CITY_NAME_PROPOSALS.every(item => item.status === 'proposal'));
  assert.ok(HOUSE_NAME_PROPOSALS.every(item => item.status === 'proposal'));
});

test('acht Staatsämter und acht bestätigte Kriegerklassen besitzen getrennte Kataloge', () => {
  assert.deepEqual(REALM_CONTEXT.offices.map(item => item.title), ['Amir', 'Müder', 'Hakim', 'Sahir', 'Va’iz', 'Nedim', 'Sirban', 'Sefir']);
  assert.deepEqual(REALM_CONTEXT.ranks.map(item => [item.rank, item.title]), [
    ['König', 'Sultan'], ['Fürst / Herzog', 'Emir'], ['Graf', 'Pascha'], ['Baron', 'Bey'],
    ['Ritterfürst', 'Tarkan'], ['Ritterlicher Herr', 'Timar'], ['Ritter', 'Sayyid / Sayyida'],
    ['Knappe', 'Alp'], ['Page', 'Sabi'], ['Freier Bürger', 'Reaya'],
  ]);
  assert.ok(REALM_CONTEXT.ranks.every(item => item.status === 'Bestätigt'));
  assert.equal(REALM_CONTEXT.offices.find(item => item.role === 'Marschall')?.title, 'Amir');
  assert.equal(REALM_CONTEXT.ranks.some(item => item.title === 'Amir'), false);
  assert.deepEqual(WARRIORS.map(item => item.name), ['Nefer', 'Derwisch', 'Sipahi', 'Ghulam', 'Aschik', 'Nizet', 'Keman', 'Lewent']);
  assert.equal(new Set(WARRIORS.map(item => item.id)).size, 8);
});

test('alle aktiven Wappen, Krieger sowie Klassen- und Pferdeverweise existieren lokal', async () => {
  const paths = [...EMBLEMS.flatMap(item => [item.image, item.original]),
    ...[...CLASS_OVERVIEW_WARRIORS, ...EMBLEM_WARRIORS].flatMap(item => [item.image, item.original, item.href, item.mount?.href]),
    ...REALM_CONTEXT.horses.flatMap(item => [item.image, item.href])].filter(Boolean);
  for (const file of new Set(paths)) await access(new URL(file, country));
});

test('jedes der 38 Wappen erhält einen eigenen Bildkrieger ohne Haus-, Rang- oder Ortsvergabe', () => {
  assert.equal(EMBLEM_WARRIORS.length, 38);
  assert.deepEqual(new Set(EMBLEM_WARRIORS.map(item => item.emblemId)), new Set(EMBLEMS.map(item => item.id)));
  assert.equal(new Set(EMBLEM_WARRIORS.map(item => item.image)).size, 38);
  for (const artwork of EMBLEM_WARRIORS) {
    assert.equal(artwork.id, artwork.emblemId);
    assert.equal(artwork.status, 'proposal');
    for (const field of ['seat', 'sourceSeat', 'houseId', 'cityId', 'rank', 'assignedTo']) assert.equal(Object.hasOwn(artwork, field), false, `${artwork.id}: ${field}`);
    if (artwork.emblemId === 'maghneach') {
      assert.equal(artwork.historical, true);
      assert.equal(artwork.classId, null);
      assert.equal(artwork.href, null);
      assert.equal(artwork.mount, null);
      continue;
    }
    const base = WARRIORS.find(item => item.id === artwork.classId);
    assert.ok(base, artwork.id);
    assert.equal(artwork.className, base.name);
    assert.equal(artwork.href, base.href);
    assert.equal(Boolean(artwork.mount), Boolean(base.mount));
    if (artwork.id === 'pool-24') {
      assert.equal(artwork.mount.name, 'Shahzad');
      assert.equal(artwork.mount.href, '../../Bestiarium/tiere/pferde/shahzad/index.html');
    } else assert.deepEqual(artwork.mount, base.mount);
    assert.ok(Array.isArray(artwork.equipment) && artwork.equipment.length > 0);
    assert.ok(artwork.equipment.every(item => typeof item === 'string' && item.length > 0));
  }
  const dahakid = EMBLEM_WARRIORS.find(item => item.emblemId === 'source-03');
  assert.equal(dahakid.classId, 'derwisch');
  assert.ok(dahakid.equipment.some(item => /(?:zweihand|zweihändig).*krummsäbel/i.test(item)));
  assert.ok(dahakid.equipment.some(item => /plattenarme/i.test(item)));
  assert.ok(dahakid.equipment.some(item => /plattenbrust/i.test(item)));
  assert.ok(dahakid.equipment.some(item => /geschlossen.*helm/i.test(item)));
});

test('Bildbeschreibungen führen individuelle Helme und Ausrüstung sowie Altersrahmen nur als Illustration', () => {
  assert.equal(EMBLEM_WARRIORS.filter(item => item.designRevision === 3).length, 35);
  assert.deepEqual(new Set(EMBLEM_WARRIORS.filter(item => item.designRevision !== 3).map(item => item.id)), new Set(['source-03', 'pool-18', 'pool-20']));
  for (const artwork of EMBLEM_WARRIORS) {
    assert.equal(typeof artwork.helmet, 'string');
    assert.ok(artwork.helmet.length > 10);
    assert.ok(artwork.equipment.length > 0);
    if (artwork.designRevision === 3) {
      assert.deepEqual(artwork.ageSpec, { minimum: 20, maximum: 30, scope: 'illustration-only' });
    }
    assert.equal(Object.hasOwn(artwork, 'age'), false);
    assert.equal(Object.hasOwn(artwork, 'personId'), false);
  }
});

test('die vier ausdrücklich behaltenen Figuren bleiben in ihren exakten Originalen erhalten', async () => {
  const retained = JSON.parse(await readFile(new URL('sources/approved-warrior-images.json', country), 'utf8'));
  const approvedHashes = {
    'source-03': '12e0381e96ee468425188d3122b78cc572a02fd34ec947eb0b1af0075e332485',
    'pool-18': '4d0ca7bae64e34f175e6eb07da8a7ab6f8f0008b72b1979aa289b191704376c3',
    'pool-20': 'b4a2bfd930b937e09fa681bee973958485ed9e07d27ae58585f949d99824f9ae',
    ghulam: '43c6d0cb10c8a573494498ec9fd3b95a9fa056a5e48e3fc6a5aa3aacd8f0fff9',
  };
  assert.deepEqual(new Set(retained.records.map(item => item.id)), new Set(Object.keys(approvedHashes)));
  for (const item of retained.records) {
    assert.equal(item.sha256, approvedHashes[item.id]);
    const raw = await readFile(new URL(`assets/warriors/generated/${item.id}.png`, country));
    assert.equal(createHash('sha256').update(raw).digest('hex'), item.sha256, item.id);
    for (const [kind, extension] of [['production', 'png'], ['preview', 'webp']]) {
      if (!item[`${kind}Sha256`]) continue;
      const folder = kind === 'preview' ? 'previews' : 'production';
      const bytes = await readFile(new URL(`assets/warriors/${folder}/${item.id}.${extension}`, country));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), item[`${kind}Sha256`], `${item.id}: ${kind}`);
    }
  }
  assert.equal(EMBLEM_WARRIORS.find(item => item.id === 'pool-18').ageSpec, null);
  assert.equal(EMBLEM_WARRIORS.find(item => item.id === 'pool-20').ageSpec, null);
  assert.ok(EMBLEM_WARRIORS.find(item => item.id === 'pool-20').equipment.some(item => /streitkolben/i.test(item)));
});

test('Klassenansichten verwenden neue Wappenfiguren und den ausdrücklich behaltenen generischen Ghulam', () => {
  assert.deepEqual(CLASS_OVERVIEW_WARRIORS.map(item => item.id), WARRIORS.map(item => item.id));
  assert.equal(new Set([...CLASS_OVERVIEW_WARRIORS, ...EMBLEM_WARRIORS].map(item => item.image)).size, 39);
  for (const overview of CLASS_OVERVIEW_WARRIORS) {
    const base = WARRIORS.find(item => item.id === overview.id);
    if (overview.id === 'ghulam') {
      assert.equal(overview.image, base.image);
      assert.equal(overview.original, base.original);
      assert.equal(shouldPublish(`Vorschau/Ishtaran/${base.image}`), true);
      assert.equal(shouldPublish(`Vorschau/Ishtaran/${base.original}`), true);
      continue;
    }
    const representative = EMBLEM_WARRIORS.find(item => item.emblemId === overview.representativeEmblemId);
    assert.equal(representative.classId, overview.id);
    assert.equal(overview.description, base.description);
    assert.equal(overview.image, representative.image);
    assert.equal(overview.original, representative.original);
    assert.notEqual(overview.image, base.image);
    assert.deepEqual(overview.mount, representative.mount);
    assert.equal(shouldPublish(`Vorschau/Ishtaran/${overview.image}`), true);
    assert.equal(shouldPublish(`Vorschau/Ishtaran/${base.image}`), false);
    assert.equal(shouldPublish(`Vorschau/Ishtaran/${base.original}`), false);
  }
  assert.notEqual(CLASS_OVERVIEW_WARRIORS.find(item => item.id === 'derwisch').representativeEmblemId, 'source-03');
});

test('alle 46 Kriegerbilder besitzen erhaltene Generatororiginale und aktuelle Aufbereitungsbelege', async () => {
  const artifacts = JSON.parse(await readFile(new URL('assets/warriors/manifest.json', country), 'utf8'));
  assert.deepEqual(new Set(artifacts.entries.map(item => item.id)), new Set([...WARRIORS, ...EMBLEM_WARRIORS].map(item => item.id)));
  assert.equal(artifacts.entries.length, 46);
  for (const artifact of artifacts.entries) {
    assert.equal(artifact.proof.rgbUnchanged, true, artifact.id);
    assert.equal(artifact.proof.originalUnchanged, true, artifact.id);
    assert.equal(artifact.proof.originalTransparentGapsFilled, false, artifact.id);
    for (const kind of ['source', 'production', 'preview']) {
      const bytes = await readFile(new URL(artifact[kind], country));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), artifact[`${kind}Sha256`], `${artifact.id}: ${kind}`);
    }
  }
});

test('beide Kartenvarianten verwenden unveränderte Quellbilder für separate Orts- und Hausoverlays', async () => {
  const provenance = JSON.parse(await readFile(new URL('sources/map-sources.json', country), 'utf8'));
  assert.deepEqual(MAP_VARIANTS.map(item => item.id), ['normal', 'regions']);
  assert.equal(provenance.sourceOriginalsRetainedOutsideRepository, true);
  assert.equal(provenance.entries.length, MAP_VARIANTS.length);
  for (const variant of MAP_VARIANTS) {
    const source = provenance.entries.find(item => item.id === variant.id);
    assert.ok(source);
    assert.equal(variant.map, source.image);
    assert.equal(variant.file, source.originalName);
    assert.deepEqual(variant.imageSize, source.dimensions);
    assert.equal(variant.bakedNames, false);
    assert.equal(source.originalUnchanged, true);
    assert.equal(source.originalCopiedIntoRepository, false);
    assert.equal(source.processing.crop, false);
    assert.equal(source.processing.labelsEdited, false);
    assert.equal(source.processing.boundariesEdited, false);
    assert.deepEqual(source.processing.newAssignments, []);
    const bytes = await readFile(new URL(variant.map, country));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256);
    assert.equal(shouldPublish(`Vorschau/Ishtaran/${variant.map}`), true);
  }
  assert.equal(shouldPublish('Vorschau/Ishtaran/sources/map-sources.json'), false);
});
