import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { REALM_CONTEXT } from '../../Vorschau/Ishtaran/realm-context.mjs';
import { HOUSES } from '../../Vorschau/Ishtaran/house-data.mjs';
import { SETTLEMENTS } from '../../Vorschau/Ishtaran/territory-data.mjs';
import { HOUSE_NAME_PROPOSALS, CITY_NAME_PROPOSALS } from '../../Vorschau/Ishtaran/name-proposals.mjs';
import { WARRIORS } from '../../Vorschau/Ishtaran/warrior-data.mjs';

const root = new URL('../../', import.meta.url);
const files = ['realm-context.mjs', 'house-data.mjs', 'territory-data.mjs', 'name-proposals.mjs', 'warrior-data.mjs'].map(name => `Vorschau/Ishtaran/${name}`);
const hashSources = () => Promise.all(files.map(async file => ({ file, sha256: createHash('sha256').update(await readFile(new URL(file, root))).digest('hex') })));
const sourceFiles = await hashSources();
const cityById = new Map(SETTLEMENTS.map(city => [city.id, city]));
assert.deepEqual([HOUSES.length, SETTLEMENTS.length, HOUSE_NAME_PROPOSALS.length, CITY_NAME_PROPOSALS.length, REALM_CONTEXT.offices.length, REALM_CONTEXT.ranks.length, WARRIORS.length], [37, 21, 100, 40, 8, 10, 8]);
assert.ok(HOUSES.every(house => cityById.has(house.initialSeatId)));
assert.equal(HOUSES.find(house => house.id === 'source-05').initialSeatId, 'large-05');
assert.equal(cityById.get('large-05').name, 'Belduran');
assert.equal(HOUSES.find(house => house.id === 'pool-18').name, 'Göktemir');
assert.equal(HOUSE_NAME_PROPOSALS.find(row => row.name === 'Göktemir').id, 'house-koektemir');
assert.equal(SETTLEMENTS.find(city => city.name === 'Kutlakar').destroyed, true);
const office = role => REALM_CONTEXT.offices.find(row => row.role === role).title;
const rank = label => REALM_CONTEXT.ranks.find(row => row.rank === label).title;
assert.equal(office('Marschall'), 'Amir');
assert.equal(rank('Fürst / Herzog'), 'Emir');
assert.equal(office('Kämmerer'), 'Müder');
assert.equal(office('Ratsmagier'), 'Va’iz');
assert.equal(rank('Ritter'), 'Sayyid / Sayyida');
const titleCandidates = HOUSE_NAME_PROPOSALS.filter(candidate => REALM_CONTEXT.ranks.some(row => row.title === candidate.name));
assert.deepEqual(titleCandidates.map(row => row.name), ['Tarkan']);
const compactCity = city => ({ id: city.id, name: city.name, tier: city.tier, destroyed: city.destroyed });
const houses = HOUSES.map(house => ({
  id: house.id, emblemId: house.emblemId, name: house.name, rank: house.rank,
  seat: compactCity(cityById.get(house.initialSeatId)),
  nameStatus: house.id === 'source-03' ? 'user-confirmed-house-name' : 'proposal',
  assignmentStatus: house.status, nameProposalId: house.nameProposalId, liege: house.liege,
  ...(house.displaced ? { displaced: true, originSeat: compactCity(cityById.get(house.originSeatId)), refugeSeat: compactCity(cityById.get(house.refugeSeatId)), displacementNote: house.displacementNote } : {}),
}));
const settlements = SETTLEMENTS.map(city => ({
  ...compactCity(city), designation: ({ capital: 'Sultanshauptstadt', pascha: 'Paschastadt', tarkan: 'Tarkan-Herrschaft' })[city.tier],
  description: city.description, capacity: city.capacity, status: city.status, nameProposalId: city.nameProposalId,
  houses: houses.filter(house => house.seat.id === city.id).map(house => ({ id: house.id, name: house.name, rank: house.rank })),
}));
const horses = await Promise.all(REALM_CONTEXT.horses.map(async horse => {
  const html = await readFile(new URL(horse.href, new URL('Vorschau/Ishtaran/', root)), 'utf8');
  return { id: horse.id, usageName: horse.name, bestiaryName: html.match(/<h1 id="horse-title">([^<]+)<\/h1>/)?.[1], href: horse.href, text: horse.text };
}));
assert.deepEqual(horses.map(horse => horse.bestiaryName), ['Sarkal', 'Shahzad']);
const spellingChecks = [
  { term: 'Amir', category: 'Staatsamt', meaning: 'Marschall', distinctFrom: 'Emir', verified: true },
  { term: 'Emir', category: 'Rang', meaning: 'Fürst / Herzog', distinctFrom: 'Amir', verified: true },
  { term: 'Müder', category: 'Staatsamt', meaning: 'Kämmerer', unicodeNote: 'ü ist U+00FC; keine Umschreibung Muder oder Mueder.', verified: true },
  { term: 'Va’iz', category: 'Staatsamt', meaning: 'Ratsmagier', unicodeNote: 'Rechtes typografisches Apostroph ’ ist U+2019.', verified: true },
  { term: 'Sayyid / Sayyida', category: 'Rang', meaning: 'Ritter; Edelmann beziehungsweise Edelfrau ohne Landbesitz.', forms: ['Sayyid', 'Sayyida'], verified: true },
  { term: 'Göktemir', category: 'Hausname im Entwurf', houseId: 'pool-18', stableProposalId: 'house-koektemir', supersededSpelling: 'Köktemir', verified: true },
];
const corpus = {
  schemaVersion: 1, generatedAt: new Date().toISOString(),
  purpose: 'Read-only-Abzug des Laufzeitkorpus für einen Dokumentanhang und den Sprachmodul-Kontext.',
  scope: 'Aktuelle Repository-Ausgangsverteilung. Keine Browserentwürfe gelesen und keine Laufzeitdateien verändert.',
  editorialStatus: 'Namen, Hausränge und Sitze bleiben Besprechungsentwurf; Dahakid ist als Hausname ausdrücklich vorgegeben. Die zehn Rangübersetzungen, acht Staatsämter und acht Klassen sind bestätigt. Kandidatenlisten sind getrennte Klangvorschläge ohne daraus abgeleitete zusätzliche Häuser oder Orte.',
  counts: {
    houses: houses.length, seatedHouses: houses.length, unassignedHouses: HOUSES.filter(house => house.initialSeatId === null).length,
    settlements: settlements.length, inhabitedSettlements: settlements.filter(city => city.houses.length > 0).length,
    destroyedSettlements: settlements.filter(city => city.destroyed).length,
    capitalCities: settlements.filter(city => city.tier === 'capital').length, paschaCities: settlements.filter(city => city.tier === 'pascha').length,
    smallTarkanPlaces: settlements.filter(city => city.tier === 'tarkan').length,
    houseNameCandidates: HOUSE_NAME_PROPOSALS.length, cityNameCandidates: CITY_NAME_PROPOSALS.length,
    offices: REALM_CONTEXT.offices.length, ranks: REALM_CONTEXT.ranks.length, classes: WARRIORS.length,
  },
  context: { title: REALM_CONTEXT.title, subtitle: REALM_CONTEXT.subtitle, summary: REALM_CONTEXT.summary, history: REALM_CONTEXT.history, culture: REALM_CONTEXT.culture },
  houses, settlements, offices: REALM_CONTEXT.offices, ranks: REALM_CONTEXT.ranks,
  classes: WARRIORS.map(({ id, name, role, description, equipment, href, mount }) => ({ id, name, role, description, equipment, baseClassHref: href, mount, terminologyStatus: 'confirmed-class', illustrationStatus: 'proposal' })),
  horses,
  candidateLists: {
    status: 'candidate-catalog; separate from named draft houses and settlements',
    note: 'Die 100 Haus- und 40 Ortskandidaten enthalten auch inzwischen für den Sitzentwurf ausgewählte Namen. Ein Kandidat ist kein zusätzliches Haus oder zusätzlicher Ort; seine Klangnotiz ist keine verifizierte historische Etymologie.',
    houseNames: HOUSE_NAME_PROPOSALS, cityNames: CITY_NAME_PROPOSALS,
  },
  spellingChecks,
  collisionAndUsageNotes: [
    { term: 'Tarkan', issue: 'Gleichlautender bestätigter Rangtitel und Familiennamenskandidat.', titleMeaning: 'Ritterfürst', candidateId: titleCandidates[0].id, assignedAsHouseName: HOUSES.some(house => house.name === 'Tarkan'), guidance: 'Im Sprachkontext Rangtitel und bloßen Familiennamensvorschlag ausdrücklich trennen.' },
    { term: 'Shahzade / Shahzad', issue: 'Nutzer-/Landesseitenbezeichnung und tatsächlicher Bestiariums-Profilname unterscheiden sich.', usageName: 'Shahzade', bestiaryName: 'Shahzad', profileId: 'shahzad', guidance: 'Kein weiteres Pferdeprofil oder weitere Rasse daraus ableiten; dieselbe vorhandene Rasse ist verlinkt.' },
    { term: 'Sarkal', issue: 'Pferderasse, kein Titel oder Hausname.', usage: 'Überwiegendes Reitpferd Ishtarans.', profileId: 'sarkal' },
    { term: 'Madrasa / Derwisch / Sahir / Va’iz', issue: 'Kultureller oder klanglicher Religionsbezug begründet keine religiöse Staatsmacht.', guidance: 'Madrasa ist Bildungsstätte, Sahir oberster Gelehrter, Va’iz Ratsmagier, Derwisch bestätigte Kriegerklasse. Religion ist vom Staat getrennt.' },
    { term: 'Maghath / Maghneach / Ishtaran', issue: 'Volk, antikes Fürstentum und späteres Land sind verschiedene Begriffe.', guidance: 'Maghath ist die urtümliche Volksgruppe; Maghneach ihre antike fürstliche Heimat. Historisches Maghneach ist kein weiteres modernes Haus und kein zusätzlicher Ort der 21er-Karte.' },
    { term: 'Göktemir', issue: 'Aktuelle sichtbare Schreibweise weicht absichtlich von der stabilen Vorschlags-ID ab.', guidance: 'Göktemir schreiben; house-koektemir ist technische Identität und keine alternative aktuelle Schreibweise.' },
    { term: 'Namensorthografie', issue: 'Leicht germanisierter Klang ist Orientierung, keine rückwirkende ASCII-Normalisierung.', guidance: 'Die vorhandenen Umlaute in Müder, Göktemir, Börtugan, Kürtegin usw. exakt erhalten; keine hypothetischen historischen Formen als gesicherte Etymologien ausgeben.' },
    { term: 'Wohnsitz / Lehnsherrschaft', issue: 'Gemeinsamer Ort begründet keine Dienst- oder Lehensbindung.', guidance: 'Alle Runtime-liege-Felder sind null; aus den Sitzgruppen keine Unterordnung ableiten.' },
  ],
  sourceFiles,
};
assert.deepEqual(await hashSources(), sourceFiles);
assert.deepEqual(['Sultan', 'Pascha', 'Tarkan'].map(title => houses.filter(house => house.rank === title).length), [1, 8, 28]);
assert.equal(settlements.find(city => city.id === 'capital').houses.length, 4);
assert.ok(houses.every(house => house.liege === null));
corpus.validation = { runtimeSourcesUnchanged: true, countsAndSpellingsPassed: true, titleCandidateCollisions: titleCandidates.map(row => row.name), all37HousesSeated: true, destroyedKutlakarEmpty: settlements.find(city => city.name === 'Kutlakar').houses.length === 0 };
const output = new URL('language-document-runtime-corpus.json', import.meta.url);
await writeFile(output, JSON.stringify(corpus, null, 2) + '\n', 'utf8');
assert.deepEqual(JSON.parse(await readFile(output, 'utf8')).counts, corpus.counts);
console.log(JSON.stringify({ output: output.pathname, counts: corpus.counts, spellingChecks: spellingChecks.map(row => row.term), validation: corpus.validation }, null, 2));
