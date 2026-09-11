import assert from 'node:assert/strict';
import test from 'node:test';
import { access, readFile } from 'node:fs/promises';
import { OFFICE_GROUPS } from '../modules/cenyr-court/offices-data.mjs';
import { CENYR_MONARCHS } from '../modules/cenyr-court/succession-data.mjs';
import { HOUSE_PENDRAG_FAMILY } from '../../Stammbäume/assets/js/data/house-pendrag-family.js';
import { monarchLink } from '../modules/cenyr-court/succession-template.mjs';

const directory = new URL('../Estryll/Königreich Cenyr/', import.meta.url);

test('Alle 15 Königslinks öffnen vorhandene Pendrag-Personen im Lesemodus', () => {
  assert.equal(CENYR_MONARCHS.length, 15);
  const ids = new Set();
  for (const monarch of CENYR_MONARCHS) {
    const link = new URL(monarchLink(monarch.personId), directory);
    assert.equal(link.searchParams.get('family'), HOUSE_PENDRAG_FAMILY.document.id);
    assert.equal(link.searchParams.get('mode'), 'view');
    assert.equal(link.searchParams.get('person'), monarch.personId);
    const person = HOUSE_PENDRAG_FAMILY.persons.find(candidate => candidate.id === monarch.personId);
    assert.ok(person, monarch.name);
    assert.equal(person.lineageRole, 'head', monarch.name);
    ids.add(person.id);
  }
  assert.equal(ids.size, 15);
  assert.equal(CENYR_MONARCHS.find(monarch => monarch.name === 'Uther IX.').personId, 'uther-1643-pendrag');
});

test('Die historische Liste bewahrt Lücken und bekannte Regierungszeiten', () => {
  assert.equal(CENYR_MONARCHS.filter(monarch => monarch.gapBefore).length, 5);
  assert.equal(CENYR_MONARCHS.find(monarch => monarch.name === 'Galahad III.').reign, 'Beginn unbekannt – 1149');
  assert.deepEqual(CENYR_MONARCHS.slice(7).map(monarch => monarch.reign), [
    '1568 – 1600', '1600 – 1623', '1623 – 1634', '1634 – 1653',
    '1653 – 1673', '1673 – 1678', '1678 – 1720', 'Seit 1720'
  ]);
});

test('Alle Rollen der Vorlage besitzen eindeutige, dauerhaft verlinkbare Einträge', () => {
  const offices = OFFICE_GROUPS.flatMap(group => group.offices);
  assert.deepEqual(OFFICE_GROUPS.map(group => group.offices.length), [10, 23, 7, 10]);
  const ids = offices.map(office => office.id);
  assert.equal(new Set(ids).size, 50);
  for (const office of offices) assert.ok(office.description.length && office.description.every(Boolean), office.title);
});

test('Neue Seiten haben gültige lokale Links, Anker und Bilddateien', async () => {
  for (const filename of ['aemter.html', 'kronfolge.html']) {
    const document = await readFile(new URL(filename, directory), 'utf8');
    const ids = [...document.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, `Doppelte IDs in ${filename}`);
    assert.doesNotMatch(document, /\bon(?:click|input|change)=|animexx\.de|\?\?\?\?|\uFFFD/);
    for (const [, raw] of document.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
      if (/^https?:/.test(raw)) continue;
      const href = raw.replaceAll('&amp;', '&');
      if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), `${filename}: ${href}`);
      else await access(new URL(new URL(href, directory).pathname, 'file:///'));
    }
  }
});

test('Die zwei Icon-Einstiege sind in Rat und Ahnengalerie erreichbar', async () => {
  const html = await readFile(new URL('Königreich von Cenyr.html', directory), 'utf8');
  assert.match(html, /href="aemter\.html"[^>]*>[\s\S]*?assets\/aemter\.png/);
  assert.match(html, /href="kronfolge\.html"[^>]*>[\s\S]*?assets\/kronfolge\.png/);
});
