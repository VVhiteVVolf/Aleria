import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { BESTIARY_PROFILES } from '../modules/creatures/catalog/bestiary-profile-index.js';
import { resolveCreatureBestiaryReference } from '../modules/creatures/creature-bestiary-reference.js';
import { createCreatureDraft, makeCreatureExportPayload, normalizeCreatureImportPayload, createCreatureDuplicate } from '../modules/creatures/creature-model.js';
import { renderCreatureDossier } from '../modules/creatures/creature-dossier.js';

test('references cover actual breed profiles, old spellings, mixed breeds and other creatures', async () => {
  for (const [species, id] of [['Rhyfel-Hengst', 'tiere/pferde/rhyfel'], ['Cenyric-Kater', 'tiere/vieh/haustiere/katzen/cenyric'],
    ['Pontar Wachhund', 'tiere/vieh/haustiere/hunde/ponter'], ['Hest-Mischling', 'tiere/pferde/hest'],
    ['Gramnir · Nordwolf', 'tiere/raubtiere/woelfe/gramnir'], ['Drake-Pferd', 'tiere/pferde/drake'], ['Landtroll', 'wesen/trolle/landtroll'],
    ['Ritterschimmer', 'tiere/pferde/zuchtbuch/ritterschimmer'], ['Eidwacht-Pferd', 'tiere/pferde/zuchtbuch/eidwacht'],
    ['Edel Rhyfel', 'tiere/pferde/zuchtbuch/edel-rhyfel'], ['Edel-Rhyfel-Pferd', 'tiere/pferde/zuchtbuch/edel-rhyfel'],
    ['Sonnenläufer-Stute', 'tiere/pferde/zuchtbuch/sonnenlaeufer']]) {
    assert.equal(resolveCreatureBestiaryReference({ species }).id, id);
  }
  for (const profile of BESTIARY_PROFILES) {
    if (profile.url) {
      const target = new URL(profile.url, 'https://local.test');
      const page = await readFile(new URL('../..' + target.pathname, import.meta.url), 'utf8');
      assert.ok(page.includes(`id="${target.hash.slice(1)}"`));
      assert.ok(page.includes(profile.name));
      continue;
    }
    const base = new URL(`../../Bestiarium/${profile.id}/`, import.meta.url);
    await access(new URL('index.html', base));
    const source = JSON.parse(await readFile(new URL('profil.json', base), 'utf8'));
    assert.equal(profile.name, source.name || source.title);
    assert.ok(!profile.id.startsWith('wesen/gruppen/'));
  }
});

test('a named breed takes precedence over an embedded base breed while independent crossings stay ambiguous', () => {
  for (const species of ['Edel Rhyfel', 'Edel-Rhyfel-Hengst', 'Edel Rhyfel Pferd']) {
    const reference = resolveCreatureBestiaryReference({ species });
    assert.equal(reference.id, 'tiere/pferde/zuchtbuch/edel-rhyfel');
    assert.equal(reference.url, '/Bestiarium/tiere/pferde/zuchtbuch/index.html#kreuzung-ceffyl-mit-rhyfel');
    assert.deepEqual(resolveCreatureBestiaryReference({ species, bestiaryReference: { id: 'tiere/pferde/rhyfel' } }), reference);
  }
  assert.equal(resolveCreatureBestiaryReference({ species: 'Edel Rhyfel und Ceffyl' }), null);
  assert.equal(resolveCreatureBestiaryReference({ species: 'Edel Rhyfel × Rhyfel' }), null);
  assert.equal(resolveCreatureBestiaryReference({ species: 'Rhyfel × Edel Rhyfel' }), null);
  assert.equal(resolveCreatureBestiaryReference({ species: 'Ceffyl–Rhyfel-Mischling' }), null);
  assert.equal(resolveCreatureBestiaryReference({ species: 'Rhyfel' }).id, 'tiere/pferde/rhyfel');
});

test('unknown species, humans, mismatching genera and ambiguous crosses receive no guessed reference', () => {
  for (const source of [{ species: 'Mensch aus Haus Arth' }, { species: 'Rhyfel', classification: { genus: 'Menschen' } },
    { species: 'Hund' }, { species: 'Wachhund' }, { species: 'Rabe' }, { species: 'Jungdrache' }, { species: 'Keinrhyfel' },
    { species: 'Ceffyl-Rhyfel-Mischling' }, { species: 'Edel Rhyfel × Ceffyl' }, { species: 'Rhyfel', classification: { genus: 'Katzen' } }]) {
    assert.equal(resolveCreatureBestiaryReference(source), null);
  }
  const ref = resolveCreatureBestiaryReference({ species: 'Rhyfel', bestiaryReference: { id: 'tiere/pferde/rhyfel', url: 'javascript:alert(1)', name: '<script>' } });
  assert.equal(ref.url, '/Bestiarium/tiere/pferde/rhyfel/index.html');
  assert.equal(ref.name, 'Rhyfel');
  assert.equal(resolveCreatureBestiaryReference({ species: 'Hund', bestiaryReference: ref }), null);
});

test('reference survives import and duplication without changing live combat values', () => {
  const source = createCreatureDraft({ id: 'kept', species: 'Rhyfel', combatProfile: {
    hitPoints: { current: 7, maximumOverride: 35, temporary: 2 }, resources: [{ id: 'kept', name: 'Kraft', current: 1, maximum: 4 }],
    conditions: [{ id: 'kept', name: 'Verletzt', active: true }]
  } });
  const [imported] = normalizeCreatureImportPayload(makeCreatureExportPayload(source));
  assert.deepEqual(imported.bestiaryReference, source.bestiaryReference);
  assert.deepEqual(imported.combatProfile.hitPoints, source.combatProfile.hitPoints);
  assert.deepEqual(imported.combatProfile.conditions, source.combatProfile.conditions);
  assert.deepEqual(imported.combatProfile.resources, source.combatProfile.resources);
  const copy = createCreatureDuplicate(source);
  assert.deepEqual(copy.bestiaryReference, source.bestiaryReference);
  assert.equal(copy.id, undefined);
});

test('dossier renders safe local portraits and a clickable species reference', () => {
  const creature = createCreatureDraft({ name: 'Struppi', species: 'Rhyfel-Hengst', portrait: '/AleriaAlmanach/assets/companions/haus-gwyvern/struppi.png' });
  const html = renderCreatureDossier(creature);
  assert.match(html, /src="\/AleriaAlmanach\/assets\/companions\/haus-gwyvern\/struppi.png"/);
  assert.match(html, /href="\/Bestiarium\/tiere\/pferde\/rhyfel\/index.html"/);
  assert.match(html, /Rhyfel im Bestiarium/);
  assert.doesNotMatch(renderCreatureDossier({ ...creature, portrait: 'javascript:alert(1)' }), /<figure>/);
  assert.doesNotMatch(renderCreatureDossier({ ...creature, species: 'Mensch' }), /class="creature-bestiary-reference"/);
});
