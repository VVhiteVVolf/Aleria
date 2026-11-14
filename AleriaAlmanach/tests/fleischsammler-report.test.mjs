import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FLEISCHSAMMLER_CASES as cases, FAMILY_REPORTS, REPORT_AREA, REPORT_DOCUMENT_ID } from '../modules/fleischsammler-report/case-records.mjs';
import { buildReportBook } from '../modules/fleischsammler-report/report-book.mjs';
import { GWYNTHOR_FLEISCHSAMMLER_FAMILIES as families } from '../../Stammbäume/assets/js/data/gwynthor-fleischsammler/family-records.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { auditFamilyChartLayoutPolicy } from '../../Stammbäume/assets/js/adapters/family-chart-layout-policy.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { createLandfamilienFamily } from '../../Stammbäume/assets/js/data/gwynthor-fleischsammler/landfamilien-family-builder.mjs';
import { HOUSE_CONTENT as marchwernHouse } from '../../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Marchwern/haus.content.mjs';

test('sixteen distinct cases contain eleven different organ findings and five honest unknowns', () => {
  const area = JSON.parse(readFileSync(new URL('../../Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/fleischsammler-area.source.json', import.meta.url), 'utf8'));
  assert.deepEqual(REPORT_AREA, { width: area.width, height: area.height, center: area.center, radius: area.radius });
  assert.equal(cases.length, 16);
  assert.deepEqual(cases.map(row => row.number), Array.from({ length: 16 }, (_, i) => i + 1));
  const recovered = cases.filter(row => row.kind === 'recovered'), missing = cases.filter(row => row.kind === 'unrecovered');
  assert.equal(recovered.length, 11); assert.equal(missing.length, 5);
  assert.equal(new Set(recovered.map(row => row.organ)).size, 11);
  assert.ok(missing.every(row => !row.name && row.age === null && row.organ === null && !row.familyId));
  assert.deepEqual(recovered.slice(0, 6).map(row => row.familyId), ['haus-marchwern', 'haus-dolweth', 'haus-bragwen', 'haus-tirfelyn', 'haus-brynial', 'haus-eiddfer']);
  assert.ok(recovered.slice(6).every(row => !row.familyId && !/\s/.test(row.name) && row.age >= 16 && row.age <= 34));
  assert.ok(recovered.slice(6).every(row => row.provisionalIdentity === true && /Arbeitsname/.test(row.connections) && /Möglichkeit|Vielleicht|könnte|Vermutung/i.test(row.background)));
  assert.ok(recovered.slice(0, 6).every(row => !row.provisionalIdentity));
  for (const row of cases) assert.ok(Math.hypot(row.point.x - REPORT_AREA.center.x, row.point.y - REPORT_AREA.center.y) < REPORT_AREA.radius);
});

test('Marchwerns revision-two default gains the victim and updated house history while personal chronicles survive', () => {
  const biography = JSON.parse(readFileSync(new URL('../../Stammbäume/tests/fixtures/house-biography/marchwern-household-v2.json', import.meta.url), 'utf8'));
  const previous = createLandfamilienFamily('marchwern', biography);
  const current = families.find(family => family.document.id === 'haus-marchwern');
  const upgraded = resolveRegisteredFamilyUpgrade(current, previous);
  assert.deepEqual(upgraded.extensions.houseBiographyModule, current.extensions.houseBiographyModule);
  assert.equal(upgraded.persons.find(person => person.id === 'ffraid-marchwern').status, 'dead');
  assert.equal(marchwernHouse.figures.length, 15);
  assert.equal(marchwernHouse.figures.find(person => person.id === 'ffraid-marchwern').image, '');
  const personal = structuredClone(previous);
  personal.extensions.houseBiographyModule.house.biographyText = 'Unsere eigene Familienchronik.';
  assert.equal(resolveRegisteredFamilyUpgrade(current, personal).extensions.houseBiographyModule.house.biographyText, 'Unsere eigene Familienchronik.');
});
test('every affected family has exactly one distinct matching victim; exceptions stay alive', () => {
  for (const row of cases.slice(0, 6)) {
    const family = families.find(f => f.document.id === row.familyId), victim = family.persons.find(p => p.id === row.personId);
    assert.equal(victim.status, 'dead'); assert.equal(victim.sex, 'female'); assert.equal(1740 - Number(victim.birth), row.age);
    assert.equal(family.timeJumps.length, 1);
    assert.ok(family.persons.some(p => p.name === 'Unbekannter Gründer'));
    assert.deepEqual(assertValidFamily(family).diagnostics, []);
    assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
  }
  assert.equal(FAMILY_REPORTS.length, 8);
  assert.ok(FAMILY_REPORTS.filter(row => !row.victim).every(row => ['haus-helfaen', 'haus-ysgellfor'].includes(row.familyId)));
  assert.equal(families.find(f => f.document.id === 'haus-helfaen').persons.filter(p => p.status === 'dead' && p.death === '1740').length, 1); // external Ceridwen card
});
test('household expansions upgrade existing IDs and retain personal notes without adding portraits', () => {
  const previous = JSON.parse(readFileSync(new URL('../../Stammbäume/tests/fixtures/gwynthor-landfamilien-revision1.json', import.meta.url), 'utf8'));
  for (const slug of ['dolweth', 'bragwen', 'brynial', 'eiddfer']) {
    const family = families.find(f => f.document.id === `haus-${slug}`), old = previous.find(f => f.document.id === family.document.id);
    const draft = structuredClone(old); draft.persons[0].notes += ' Persönliche Prüfnotiz.';
    const upgraded = resolveRegisteredFamilyUpgrade(family, draft);
    assert.equal(upgraded.timeJumps.length, 1);
    assert.equal(upgraded.lineage.founderPartnershipId, family.lineage.founderPartnershipId);
    assert.match(upgraded.persons.find(p => p.id === draft.persons[0].id).notes, /Persönliche Prüfnotiz/);
    for (const person of old.persons) assert.equal(upgraded.persons.find(p => p.id === person.id).worldPersonId, person.worldPersonId);
    const additions = family.persons.filter(p => !old.persons.some(o => o.id === p.id));
    assert.ok(additions.length >= 6 && additions.every(p => !p.portrait));
    assert.equal(resolveRegisteredFamilyUpgrade(family, upgraded).persons.length, upgraded.persons.length);
  }
});
test('the real workshop book has reader-compatible sections, investigator art, authentication and final notes', () => {
  const book = buildReportBook();
  assert.equal(book.template, 'book'); assert.equal(book.recipient, 'Sir Brenric Coeddu'); assert.equal(book.author, 'Meredydd Gwyllach');
  assert.equal(book.date, '10. Ordanstag 1740'); assert.match(book.pages[0], /10\. Ordanstag 1740, Gwynthor/);
  assert.ok(!/Weltjahr|Weltperson|externe Karte|Bragwen-Linie|umzudeuten|Familienakte einsehen|Organtyp/.test(book.pages.join('')));
  assert.match(book.media.main.image, /vorderdeckel-r1\.png$/); assert.match(book.bookBackCover, /rueckdeckel-r1\.png$/);
  assert.match(book.pages.at(-1), /^<h2>Notizen/);
  assert.equal(book.pages.filter(page => /^<h2>Fall \d/.test(page)).length, 16);
  assert.ok(book.pages.some(page => page.includes('taeterstudie-r1.png')));
  assert.ok(book.pages.some(page => page.includes('staturvergleich-r1.png')));
  assert.ok(book.pages.some(page => page.includes('meredydd-gwyllach-unterschrift-v1.png') && page.includes('wachssiegel-v1.png')));
  assert.ok(book.pages.every(page => !page.includes('/portraits/')));
  assert.equal(book.pages.filter(page => /^<h2>Fall \d+ · Arbeitsname/.test(page)).length, 5);
  assert.match(book.pages[1], /wirklichen Namen sind unbekannt/);
  const output = JSON.parse(readFileSync(new URL(`../../Dokumente aus der Werkstatt/data/${REPORT_DOCUMENT_ID}.json`, import.meta.url), 'utf8'));
  assert.deepEqual(output.document, book);
});
