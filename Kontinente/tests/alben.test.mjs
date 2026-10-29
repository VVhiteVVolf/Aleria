import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';
import { principalityHref } from '../modules/alben/principality-links.mjs';
import { escapeHtml } from '../modules/kingdom-court/page-template.mjs';

const root = new URL('../../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), 'utf8');
const json = name => JSON.parse(read(`Kontinente/modules/alben/${name}.source.json`));
const { principalities } = json('principalities');
const offices = json('offices');
const fianna = json('fianna');
const culture = json('culture');
const main = read('Kontinente/Alben/Der Schild von Ailith.html');
const entries = read('Kontinente/Alben/fuerstentum.html');
const officePage = read('Kontinente/Alben/aemter.html');
const registryContext = { window: {} };
vm.runInNewContext(read('Kontinente/kontinente.registry.js'), registryContext);
const registry = registryContext.window.KONTINENTE_REGISTRY;

test('the two original documents remain archived with their exact source hashes', () => {
  const sources = JSON.parse(read('Kontinente/docs/alben/sources/manifest.json'));
  assert.equal(sources.length, 2);
  for (const source of sources) {
    const bytes = fs.readFileSync(new URL(`Kontinente/docs/alben/sources/${source.file}`, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, source.file);
  }
});

test('all 46 offices and 21 clan prefixes retain their complete texts in the generated pages', () => {
  const records = offices.groups.flatMap(group => group.offices);
  assert.doesNotMatch(officePage, /Adelstitel Aldrimars|Sonderamter/);
  assert.equal(records.length, 46);
  assert.equal(new Set(records.map(record => record.id)).size, 46);
  for (const record of records) {
    assert.ok(record.description.length, record.title);
    for (const paragraph of record.description) assert.ok(officePage.includes(escapeHtml(paragraph)), record.title);
  }
  const prefixes = culture.prefixGroups.flatMap(group => group.entries);
  assert.equal(prefixes.length, 21);
  for (const paragraph of [...culture.language, ...culture.clan, ...culture.sept, ...prefixes.flatMap(prefix => prefix.paragraphs)]) {
    assert.ok(main.includes(escapeHtml(paragraph)), paragraph.slice(0, 70));
  }
});

test('five active branches are distinct from the dissolved sixth, and admission has its own veto rule', () => {
  assert.equal(fianna.branches.length, 5);
  assert.deepEqual(fianna.branches.map(branch => branch.id), ['kammer', 'schatten', 'speer', 'recht', 'wort']);
  assert.equal(fianna.duskWatch.active, false);
  assert.equal(fianna.duskWatch.status, 'Aufgelöst');
  assert.equal(fianna.admission.scope, 'Aufnahme neuer Mitglieder');
  assert.equal(fianna.admission.unanimous, true);
  assert.equal(fianna.admission.veto, true);
  assert.equal(fianna.admission.attendantsAreMembers, false);
  assert.match(main, /Bewahrer dürfen ihn hüten; allein der auserwählte Prinz/);
  assert.match(main, /Seele des letzten Albenkönigs/);
  assert.match(main, /fingierten Abstammung[\s\S]*Tuathanach/);
  assert.doesNotMatch(main, /Hagar[^<]*Vorsitz|Königreich Alben/);
});

test('the chair links to the canonical living person, without inventing other Fianna members', () => {
  const presentation = JSON.parse(read('Kontinente/modules/alben/presentation.generated.json'));
  const members = presentation.councilGroups.flatMap(group => group.members);
  assert.equal(members.length, 1);
  const person = getRegisteredFamily(fianna.chair.familyId).family.persons.find(person => person.id === fianna.chair.personId);
  assert.equal(members[0].name, person.name);
  assert.equal(members[0].imageSrc, '/Stammbäume/' + person.portrait);
  assert.ok(fs.existsSync(new URL('.' + members[0].imageSrc, root)));
  const link = new URL(members[0].href, 'https://aleria.local');
  assert.equal(link.searchParams.get('family'), fianna.chair.familyId);
  assert.equal(link.searchParams.get('person'), person.id);
  assert.equal(link.searchParams.get('mode'), 'view');
});

test('the twelve entries preserve unknown facts, historical Ceitheach and Deitheach, and partially occupied Faelaorn', () => {
  assert.equal(principalities.length, 12);
  assert.equal(new Set(principalities.map(p => p.id)).size, 12);
  assert.deepEqual(principalities.filter(p => p.historical).map(p => p.id), ['deitheach', 'ceitheach']);
  assert.match(principalities.find(p => p.id === 'faelaorn').summary, /etwa zur Hälfte besetzt/);
  for (const p of principalities) {
    assert.ok(entries.includes(`data-principality="${p.id}"`));
    assert.ok(main.includes(`data-alben-principality="${p.id}"`));
    if (p.familyId) assert.ok(getRegisteredFamily(p.familyId), p.name);
    else assert.equal(p.familyName + p.seat + p.imageSrc, '', p.name);
    if (p.imageSrc) assert.ok(fs.existsSync(new URL('.' + p.imageSrc, root)), p.name);
  }
});

test('future country pages can replace prepared targets without changing their continental hierarchy', () => {
  const p = principalities[0];
  assert.equal(principalityHref(p), '/Kontinente/Alben/fuerstentum.html?id=leitheach');
  const future = { id: p.pageId, page: 'Estryll/Fürstentum Leitheach/Leitheach.html', hierarchy: [{ slug: 'estryll' }] };
  assert.equal(principalityHref(p, [future]), '/Kontinente/' + future.page);
  assert.deepEqual(future.hierarchy, [{ slug: 'estryll' }]);
  const alben = registry.find(entry => entry.id === 'schild-von-ailith');
  assert.equal(alben.type, 'Konföderation');
  assert.equal(alben.hierarchy.some(entry => entry.slug === 'estryll'), false);
  assert.equal(registry.filter(entry => entry.hierarchy.some(parent => parent.slug === 'schild-von-ailith')).length, 1);
});

test('all generated local links, images and anchors resolve, with no old HTML styling or inline handlers', () => {
  for (const html of [main, officePage, entries]) {
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length);
    assert.doesNotMatch(html, /\bon(?:click|input|change)=|\uFFFD|i\.imgur\.com|background-color:rgb|Königreich Alben/);
    for (const [, raw] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
      const url = new URL(raw.replaceAll('&amp;', '&'), 'https://aleria.local/Kontinente/Alben/');
      if (raw.startsWith('#')) assert.ok(ids.includes(url.hash.slice(1)), raw);
      else assert.ok(fs.existsSync(new URL('.' + decodeURIComponent(url.pathname), root)), raw);
    }
  }
  const headings = [...main.matchAll(/<h2[^>]*>(\d+)\.\)/g)].map(match => Number(match[1]));
  assert.deepEqual(headings, [1, 2, 3, 4, 5, 6, 7, 8]);
});

test('Estryll keeps individual principality entries as well as the overarching confederation entry', () => {
  const continent = read('Kontinente/Estryll/Estryll.html');
  for (const id of ['leitheach', 'aislearneach', 'dunfal', 'blaithneach', 'faelaorn', 'ceitheach']) {
    assert.ok(continent.includes(`data-alben-principality="${id}"`), id);
  }
  assert.ok(continent.includes('/Kontinente/Alben/Der Schild von Ailith.html'));
  assert.ok(continent.includes('K%C3%B6nigreich%20Cenyr/'));
  assert.ok(continent.includes('K%C3%B6nigreich%20Aldrimar/'));
});
