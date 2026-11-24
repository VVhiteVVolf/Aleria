import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import councils from '../../Kontinente/modules/administration/data/celtigerns-vassals.generated.mjs';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createAssemblyState } from '../Herrschaftsverwaltung/assembly-state.mjs';
import { filterCandidates } from '../Herrschaftsverwaltung/candidate-filters.mjs';
import { buildOfficePlans } from '../../shared/cenyr-administration/office-plans.mjs';
import { createTreeCandidateSearch } from '../Herrschaftsverwaltung/tree-candidate-picker.mjs';
import { countyAreas, countyLeadershipRole } from '../../shared/cenyr-administration/county-reference.mjs';
import { officialCouncil, officialCourt, officialRole } from '../../shared/cenyr-administration/official-office-model.mjs';
import { rulerSuffix, scopeForTerritory } from '../../shared/cenyr-administration/scopes.mjs';
import { CENYR_FORCES } from '../../shared/cenyr-administration/military-organization.mjs';

const roster = JSON.parse(await readFile(new URL('../Herrschaftsverwaltung/roster.generated.json', import.meta.url), 'utf8'));
const houses = roster.houses.map(house => ({ ...house, plans: buildOfficePlans(house) }));
const people = new Map(roster.people.map(person => [person.id, person]));
const treeCandidates = new Map(roster.tree.map(candidate => [candidate.id, candidate]));
const saethwyr = houses.find(house => house.id === 'saethwyr');
const draig = houses.find(house => house.id === 'draig');
const imogen = saethwyr.offices.finanzen.holder;
const shadow = saethwyr.offices.spionage.holder;
const idFor = name => roster.people.find(person => person.name === name)?.id;

test('all three territorial councils have eight appointable leaders and their own service branches', () => {
  assert.equal(houses.length, 7);
  for (const house of houses.filter(house => !house.county && !house.preparation)) {
    const source = councils.find(council => council.id === house.id);
    assert.deepEqual(Object.keys(house.offices), Object.keys(source.offices));
    for (const area of Object.keys(house.offices)) {
      const plan = house.plans[area];
      assert.equal(plan.head.title, source.offices[area].title);
      assert.equal(people.get(plan.head.holder)?.name || '', source.offices[area].name);
      assert(plan.slots.length >= 17);
      const core = plan.sections.filter(group => group.core).flatMap(group => group.slots);
      assert.equal(core.length, area === 'klerus' ? 0 : 5, area);
      assert.equal(new Set(plan.slots.map(slot => slot.key)).size, plan.slots.length, area);
      assert(plan.slots.every(slot => slot.description && (!slot.holder || house.candidates.some(candidate => candidate.id === slot.holder))));
    }
  }
  assert.equal(saethwyr.plans.militaer.sections.find(group => group.title === 'Die fünf Kriegswarte').slots.length, 5);
  assert(saethwyr.plans.militaer.sections.some(group => group.title === 'Flottillenadmiräle'));
  assert(saethwyr.plans.militaer.slots.some(slot => slot.title === 'Seemarschall und Admiral'));
  assert(!houses.find(house => house.id === 'wyrm').plans.militaer.sections.some(group => group.title === 'Flottillenadmiräle'));
  assert(!saethwyr.plans.klerus.slots.some(slot => /Patriarch|Prälat/.test(slot.title)));
});

test('county leadership and the cathedral preserve their original offices and known holders', () => {
  const expected = Object.keys(countyAreas);
  assert.deepEqual(Object.keys(draig.offices), expected);
  for (const area of expected) {
    const source = countyLeadershipRole(countyAreas[area]);
    const plan = draig.plans[area];
    assert.equal(plan.head.title, source.title);
    assert.equal(people.get(plan.head.holder).name, source.name);
  }
  const plan = draig.plans.klerus;
  assert.equal(plan.sections.find(group => group.core).slots.length, 9);
  assert.equal(plan.references.length, 6);
  assert.equal(plan.references.find(entry => entry.scope === 'wyrm').id, houses.find(house => house.id === 'wyrm').offices.klerus.holder);
  assert(plan.slots.some(slot => slot.holder === 'person--gwynthor-formlingssache--euddogwy'));
  assert.equal(people.get('person--gwynthor-formlingssache--euddogwy').age, 38);
  assert(plan.sections.some(group => group.id === 'patriarch-kirchdiener' && group.slots.length === 16));
  assert(!draig.enrolled.some(family => family.id === 'haus-aelmor'));
  assert.equal(draig.plans.gerichtsbarkeit.slots.find(slot => slot.id === 'gerichte').holder, 'person--haus-draig--ceridwen-draig');
});

test('localities govern the exact number of deacons, judges, rent masters and cell leaders', () => {
  const deacons = { saethwyr: 4, gafyr: 5, wyrm: 4, draig: 3, 'arthus-streben': 11, 'gwendolyns-ufer': 11, 'rhonwens-traenen': 9 };
  for (const house of houses) {
    assert.equal(house.plans.klerus.localities.length, deacons[house.id]);
    for (const area of ['gerichtsbarkeit', 'finanzen', 'spionage']) {
      assert.deepEqual(house.plans[area].localities.map(place => place.name), house.places.map(place => place.name));
      assert.equal(house.plans[area].localities.length, new Set(house.places.map(place => place.name)).size);
    }
    const vikariat = house.plans.klerus;
    if (house.county) continue;
    assert(vikariat.slots.some(slot => slot.title === 'Dechant'));
    assert.equal(vikariat.sections.find(group => group.staff).slots.length, 18);
    const guard = vikariat.sections.find(group => group.id === 'vikariatsschutz');
    const penitents = vikariat.sections.find(group => group.id === 'vikariatsbusse');
    assert.equal(guard.slots.filter(slot => slot.title === 'Schwurritter').length, 2);
    assert.equal(guard.slots.filter(slot => slot.title === 'Schwurknecht').length, 3);
    assert.equal(penitents.slots.length, 2);
    assert(guard.slots.filter(slot => slot.kind).every(slot => slot.removable));
    assert(penitents.slots.every(slot => slot.removable && slot.reportsTo === 'der Leitung des Vikariats'));
    assert(vikariat.templates.some(template => template.title === 'Priester' && !template.placement));
    assert(!vikariat.sections.some(group => /Priesterordnung|Fachämter|Seelsorge/.test(group.title)));
  }
});

test('all household offices open their own hierarchy and reuse the prepared office artwork', async () => {
  const icons = new Set();
  for (const house of houses) {
    const hof = house.plans.hof;
    assert.deepEqual(hof.leadership.slots.map(slot => slot.key), ['hof/vogt', 'hof/schatzmeister', 'hof/hausmacht']);
    assert.deepEqual(hof.slots.slice(0, 4).map(slot => slot.key), ['hof/vogt', 'hof/schatzmeister', 'hof/hausmacht', 'hof/leitung']);
    assert.equal(hof.head, null);
    assert(hof.slots.length >= house.court.length);
    assert.equal(new Set(hof.slots.map(slot => slot.key)).size, hof.slots.length);
    for (const group of [hof.leadership, ...Object.values(house.plans).flatMap(plan => plan.sections)]) {
      icons.add(group.icon);
      for (const slot of group.slots) {
        assert(slot.image, slot.key);
        icons.add(slot.image);
      }
    }
    for (const office of hof.slots) {
      const department = house.plans[office.department];
      assert.equal(department.head.key, office.key);
      assert(department.slots.length >= 5);
      for (const template of department.templates) icons.add(template.image);
    }
    for (const area of Object.keys(house.offices)) {
      for (const template of house.plans[area].templates) icons.add(template.image);
    }
    const guard = house.plans['hof-hausmacht'].sections.find(group => group.id === 'leibgarde');
    assert.equal(guard.slots[0].key, 'hof/garde');
    assert.equal(guard.slots[0].title, 'Hauptmann der Leibgarde');
    const forces = house.plans['hof-hausmacht'];
    assert.deepEqual(forces.sections.map(group => group.id), ['hausmacht-adjutantur', 'leibgarde', 'hausaufgebot', 'hausaufgebot-offiziere', 'hausaufgebot-mannschaft']);
    assert.equal(forces.slots.find(slot => slot.id === 'adjutant').reportsTo, 'dem Kommandanten der Hausmacht');
    assert.deepEqual(forces.localities.map(site => site.name), house.places.map(place => place.name));
    assert(forces.localities.every(site => site.type === 'station'));
    assert(forces.sections[2].slots.length >= 2 && forces.sections[2].slots.every(slot =>
      slot.title === 'Hauptmann der Hausmacht' && !slot.place && slot.removable && slot.reportsTo === 'dem Kommandanten der Hausmacht'));
    assert(forces.sections[3].slots.some(slot => slot.title === 'Bannerführer der Hausmacht' && slot.removable));
    assert(forces.sections[3].slots.some(slot => slot.title === 'Leutnant der Hausmacht' && slot.removable));
    assert(forces.sections[4].slots.some(slot => slot.title === 'Hausritter'));
    const vogt = house.plans['hof-vogt'];
    assert(vogt.sections.find(group => group.id === 'zofen').slots.every(slot => slot.removable));
    assert(vogt.sections.find(group => group.id === 'kammerdiener').slots.every(slot => slot.removable));
    const hofmeister = house.plans['hof-hofmeister'];
    assert.match(hofmeister.head.description, /Lehrer und Mentor/);
    assert(!hofmeister.slots.some(slot => /Zofe|Kammerdiener/.test(slot.title)));
    assert(hofmeister.connections.some(entry => entry.department === 'hof-waffen'));
  }
  assert.equal(houses.find(house => house.id === 'gafyr').plans['hof-vogt'].sections.find(group => group.id === 'zofen').slots.length, 8);
  for (const icon of icons) await access(new URL('../..' + icon, import.meta.url));
  assert(icons.size >= 20);
  const wyrm = houses.find(house => house.id === 'wyrm');
  assert.equal(wyrm.plans.hof.slots.find(slot => slot.key === 'hof/vogt').holder, idFor('Emlyn Glynmor'));
  assert.equal(wyrm.plans.hof.slots.find(slot => slot.key === 'hof/kueche').holder, idFor('Eleri Glynmor'));
  assert.equal(saethwyr.plans.militaer.slots.find(slot => slot.key === 'militaer/wachkommandant').holder, idFor('Melyn Saethwyr'));
  assert.match(saethwyr.plans['hof-hausmacht'].slots.find(slot => slot.key === 'hof/garde').note, /Melyn Saethwyr/);
});

test('the five kinds of Cenyr forces keep the Ortswachen with the marshal and the household troops with their house', () => {
  assert.deepEqual(CENYR_FORCES.map(force => force.id), ['hausmacht', 'wache', 'vasallen', 'kirche', 'extern']);
  for (const house of houses) {
    const { plans } = house;
    const militia = plans.militaer;
    const official = officialCouncil(house.territoryId, 'militaer', house.county ? countyAreas.militaer : undefined);
    assert(!militia.slots.some(slot => /wachtmarschall/i.test(slot.title)));
    assert(!official.groups.flatMap(group => group.roles).some(role => /wachtmarschall/i.test(role.title)));
    assert.match(militia.head.description, /befehligt/i);
    const watch = militia.sections.find(group => group.id === 'militaer-ortswachen');
    for (const place of house.places) {
      assert.equal(militia.localities.filter(site => site.name === place.name).length, 1, place.name);
      if (place.name !== 'Gwynthor' || !house.county) assert(watch.slots.some(slot => slot.place === place.name));
    }
    assert(official.groups.some(group => group.id === 'militaer-ortswachen'));
    assert.equal(plans['hof-hausmacht'].head.reportsTo, 'dem zuständigen Marschall');
    assert(!plans['hof-hausmacht'].slots.some(slot => slot.place));
    assert(plans['hof-hausmacht'].sections.find(group => group.id === 'leibgarde').description.includes('persönliche'));
  }
  const draigWatch = draig.plans.militaer.slots.find(slot => slot.place === 'Gwynthor');
  assert.equal(people.get(draigWatch.holder).name, 'Ferydnand Gafyr');
  const kevan = draig.plans['hof-hausmacht'].slots.find(slot => slot.holder === idFor('Kevan Pert'));
  assert.equal(officialRole(kevan).station, 'Gwynthor');
  assert.equal(officialRole(kevan).reportsTo, 'dem zuständigen Hauptmann der Hausmacht');
});

test('documented dual roles round-trip and transfers vacate the affected appointments', () => {
  const draft = createAssemblyState(houses, roster.free);
  const restored = createAssemblyState(houses, roster.free);
  restored.importDraft(draft.serialize());
  const current = restored.positions('draig');
  const odyar = current.get('finanzen/leitung').occupant;
  assert.equal(current.get('hof/schatzmeister').occupant, odyar);
  const change = restored.assign('draig', 'spionage/leitung', odyar);
  assert.deepEqual(new Set(change.formerPosts.map(slot => slot.key)), new Set(['finanzen/leitung', 'hof/schatzmeister']));
  assert.equal(restored.positions('draig').get('hof/schatzmeister').occupant, null);
  restored.undo();
  assert.equal(restored.positions('draig').get('hof/schatzmeister').occupant, odyar);
});

test('the Saethwyr pool contains their living house members and keeps other liege obligations separate', () => {
  const family = FAMILY_REGISTRY.find(entry => entry.id === 'haus-saethwyr').family;
  const candidateIds = new Set(saethwyr.candidates.map(candidate => candidate.id));
  for (const person of family.persons.filter(person => person.houseId === 'house-saethwyr' && person.status === 'alive')) {
    assert(candidateIds.has(person.worldPersonId), person.name);
  }
  for (const name of ['Imogen Saethwyr', 'Niniane Chwedonol', 'Peredur Eneiniog', 'Madoc Aelmor']) {
    assert(candidateIds.has(idFor(name)), name);
  }
  for (const name of ['Kelyddon Gafyr', 'Derwen Wyrm', 'Brinthan Argall', 'Emlyn Glynmor', 'Brannoc Ruddgraen']) {
    assert(!candidateIds.has(idFor(name)), name);
  }
  assert(houses.find(house => house.id === 'wyrm').candidates.some(candidate => candidate.id === idFor('Emlyn Glynmor')));
  assert(!houses.some(house => house.enrolled.some(family => family.id === 'haus-bwach')));
  assert.equal(roster.free.length, new Set(roster.free.map(person => person.id)).size);
  assert(roster.free.every(person => houses.every(house => house.candidates.every(candidate => candidate.id !== person.id))));
});

test('moving a known councillor vacates the old lead and supports undo and voluntary release', () => {
  const draft = createAssemblyState(houses, roster.free);
  const result = draft.assign('saethwyr', 'spionage/leitung', imogen);
  assert.equal(result.former.key, 'finanzen/leitung');
  assert.equal(result.post.occupant, shadow);
  assert.equal(draft.positions('saethwyr').get('spionage/leitung').occupant, imogen);
  assert.equal(draft.positions('saethwyr').get('finanzen/leitung').occupant, null);
  assert.throws(() => draft.assign('gafyr', 'spionage/leitung', imogen), /gehört nicht/);
  draft.assign('saethwyr', 'spionage/leitung', null);
  assert.equal(draft.positions('saethwyr').get('spionage/leitung').occupant, null);
  draft.undo();
  draft.undo();
  assert.equal(draft.positions('saethwyr').get('spionage/leitung').occupant, shadow);
  assert.equal(draft.positions('saethwyr').get('finanzen/leitung').occupant, imogen);
});

test('additional posts and cross-house drafts survive storage, export and validated import', () => {
  const backing = new Map();
  const storage = { getItem: key => backing.get(key), setItem: (key, value) => backing.set(key, value) };
  const makeId = () => 'new-post';
  const draft = createAssemblyState(houses, roster.free, { storage, makeId });
  const extra = draft.addPost('saethwyr', { area: 'spionage', title: 'Sonderbote', kind: 'special', description: 'Berichtet an den Schatten.' });
  const ordinary = draft.addPost('saethwyr', { area: 'hof', title: 'Rechnungsgehilfe', kind: 'service', description: '' });
  const free = roster.free[0].id;
  draft.assign('saethwyr', extra, free);
  assert(!draft.freeFor('wyrm').some(person => person.id === free));
  assert.throws(() => draft.assign('wyrm', 'magie/leitung', free), /anderen Herrschaft/);
  draft.assign('gafyr', 'spionage/leitung', idFor('Kelyddon Gafyr'));
  const exported = draft.serialize();
  const restored = createAssemblyState(houses, roster.free, { storage });
  assert.equal(restored.serialize(), exported);
  assert.equal(restored.positions('saethwyr').get(extra).occupant, free);
  assert.equal(restored.positions('saethwyr').get(ordinary).kind, 'service');
  assert.equal(restored.positions('gafyr').get('finanzen/leitung').occupant, null);
  const loaded = createAssemblyState(houses, roster.free);
  loaded.importDraft(exported);
  assert.equal(loaded.serialize(), exported);
  const broken = JSON.parse(exported);
  broken.houses.wyrm.assignments['magie/leitung'] = free;
  assert.throws(() => loaded.importDraft(JSON.stringify(broken)), /mehrfach/);
  assert.equal(loaded.serialize(), exported);
  assert(loaded.removePost('saethwyr', extra));
  assert(loaded.freeFor('wyrm').some(person => person.id === free));
  loaded.undo();
  assert.equal(loaded.serialize(), exported);
  loaded.reset('saethwyr');
  assert(!loaded.positions('saethwyr').has(extra));
  assert.equal(loaded.positions('gafyr').get('spionage/leitung').occupant, idFor('Kelyddon Gafyr'));
});

test('batches, detached default posts, local reporting and v1 role migrations preserve draft state', () => {
  let serial = 0;
  const draft = createAssemblyState(houses, roster.free, { makeId: () => `setup-${++serial}` });
  const plan = saethwyr.plans.spionage;
  const template = plan.templates.find(role => role.title === 'Agent');
  const locality = plan.localities[0];
  const keys = draft.addPosts('saethwyr', { ...template, area: 'spionage', templateId: template.id, site: locality.key }, 200);
  assert.equal(new Set(keys).size, 200);
  assert.deepEqual(draft.positions('saethwyr').get(keys[0]).locality, locality);
  assert.throws(() => draft.addPosts('saethwyr', { ...template, area: 'spionage' }, 1001), /1000/);
  const repeatable = 'spionage/ermittler';
  assert(draft.removePost('saethwyr', repeatable));
  const restored = createAssemblyState(houses, roster.free);
  restored.importDraft(draft.serialize());
  assert(!restored.positions('saethwyr').has(repeatable));
  assert.equal(restored.positions('saethwyr').get(keys.at(-1)).templateId, template.id);
  const old = { schema: 'aleria.herrschaftsplanung', version: 1, houses: Object.fromEntries(houses.filter(house => !house.county && !house.preparation)
    .map(house => [house.id, { posts: [], assignments: house.id === 'saethwyr' ? {
      'klerus/priester': imogen, 'finanzen/leitung': null, 'hof/garde': null,
    } : {} }])) };
  restored.importDraft(JSON.stringify(old));
  assert.equal(restored.positions('saethwyr').get('klerus/extra-alt-priester').occupant, imogen);
  assert.equal(restored.positions('saethwyr').get('hof/garde').occupant, null);
  assert.equal(restored.positions('draig').get('finanzen/leitung').occupant, draig.offices.finanzen.holder);
});

test('v4 military drafts keep house appointments and stationing while freeing the abolished office', () => {
  const draft = createAssemblyState(houses, roster.free, { treeCandidates });
  const old = JSON.parse(draft.serialize());
  old.version = 4;
  const legacy = old.houses.saethwyr;
  const oldCaptain = 'hof-hausmacht/hauptmann-morfaen';
  const formerMarshal = idFor('Arian Saethwyr');
  const captain = saethwyr.offices.militaer.holder;
  legacy.posts.push({ area: 'militaer', id: 'plan-uno', kind: 'service', title: 'Waffenknecht im Hausaufgebot',
    description: 'Hausdienst', templateId: 'r-waffenknecht', site: 'militaer/wacht-morfaen' });
  Object.assign(legacy.assignments, {
    'militaer/wachtmarschall': formerMarshal, [oldCaptain]: captain, 'militaer/leitung': null,
    'militaer/extra-plan-uno': imogen, 'finanzen/leitung': null,
  });
  legacy.removed.push('militaer/waffenknecht');
  draft.importDraft(JSON.stringify(old));
  const current = draft.positions('saethwyr');
  assert(!current.has('militaer/wachtmarschall'));
  assert(![...current.values()].some(slot => slot.occupant === formerMarshal));
  const houseCaptain = current.get('hof-hausmacht/extra-alt-hauptmann-morfaen');
  assert.equal(houseCaptain.occupant, captain);
  assert.equal(houseCaptain.title, 'Hauptmann der Hausmacht');
  assert.equal(houseCaptain.locality.type, 'station');
  assert.equal(houseCaptain.locality.name, 'Morfaen');
  assert.equal(houseCaptain.reportsTo, 'dem Kommandanten der Hausmacht');
  const guard = current.get('hof-hausmacht/extra-plan-uno');
  assert.equal(guard.occupant, imogen);
  assert.equal(guard.title, 'Waffenknecht der Hausmacht');
  assert.equal(guard.locality.name, 'Morfaen');
  const currentExport = draft.serialize();
  assert.equal(JSON.parse(currentExport).version, 5);
  draft.importDraft(currentExport);
  assert.equal(draft.serialize(), currentExport);
});

test('the two Baronies and Rhonwens Tränen have their own ranks, identified officers and territorial posts', () => {
  const entries = [
    ['arthus-streben', 'barony', 'Stennis Gwefrydd', 'Thomos Gwefrydd', 'Rhosmere', 13, 2],
    ['gwendolyns-ufer', 'barony', 'Mervyn Gwyvern', 'Gwynnan Gwyvern', 'Abergwint', 14, 8],
    ['rhonwens-traenen', 'prince', 'Idris Arwydd', 'Ianto Arwydd', 'Castellbryn', 15, 3],
  ];
  for (const [id, rank, name, marshal, capital, localities, occupied] of entries) {
    const house = houses.find(entry => entry.id === id);
    assert.equal(house.rank, rank);
    assert.equal(people.get(house.ruler).name, name);
    assert.equal(people.get(house.offices.militaer.holder).name, marshal);
    assert.equal(Object.values(house.offices).filter(office => office.holder).length, occupied);
    assert(house.places.some(place => place.name === capital));
    assert.equal(house.plans['hof-hausmacht'].localities.length, localities);
    assert.equal(house.plans.militaer.head.titleVariants[0], `Marschall ${rulerSuffix(house)}`);
    assert.equal(scopeForTerritory(house.territoryId).rank, rank);
    assert(house.plans.hof.slots.every(slot => slot.department in house.plans));
  }
  const gwyvern = houses.find(house => house.id === 'gwendolyns-ufer');
  assert(!gwyvern.enrolled.some(family => family.id === 'haus-penwyn'));
  assert.equal(people.get(gwyvern.plans.militaer.slots.find(slot => slot.id === 'wacht-morlan').holder).name, 'Cadfan Trydar');
  assert.equal(people.get(gwyvern.plans.hof.slots.find(slot => slot.id === 'hofmeister').holder).name, 'Tudor Caerlaen');
});

test('Draig and the local administrations share their documented casts and preserve old crew data', () => {
  const { plans } = officialCourt('haus-draig', []);
  for (const [area, id, name] of [
    ['hof-vogt', 'hof/zofe', 'Myfanwy Draenmelyn'],
    ['hof-vogt', 'hof-vogt/zofenstelle-2', 'Nia Maerllys'],
    ['hof-vogt', 'hof/kammerdiener', 'Taliesin Draenmelyn'],
    ['hof-hausmacht', 'hof/garde', 'Marared Curiad'],
    ['hof-hausmacht', 'hof-hausmacht/leutnant-2', 'Ysabel Bronnor'],
    ['hof-hausmacht', 'hof-hausmacht/waffenknecht', 'Kevan Pert'],
    ['hof-kueche', 'hof/kueche', 'Gwerfyl'],
    ['hof-brot', 'hof/brot', 'Rhiain Pert'],
  ]) {
    const source = plans[area].slots.find(slot => slot.key === id);
    const preview = draig.plans[area].slots.find(slot => slot.key === id);
    assert.equal(officialRole(source).name, name);
    assert.equal(source.holder, preview.holder);
    assert(officialRole(source).links.some(link => /AleriaAlmanach\.html\?(character=|entry=draig-leibgarde)/.test(link.href)));
  }
  assert(!plans['hof-vogt'].slots.some(slot => people.get(slot.holder)?.name === 'Llewarch Tonnarth'));
  const result = officialCouncil(draig.territoryId, 'militaer', countyAreas.militaer);
  const positions = result.groups.flatMap(group => group.roles);
  const idwal = positions.find(role => role.id === 'idwal-draig');
  const original = countyAreas.militaer.groups.flatMap(group => group.roles).find(role => role.id === 'idwal-draig');
  assert.deepEqual(idwal.crew, original.crew);
  assert.deepEqual(idwal.connections, original.connections);
  assert(positions.some(role => role.name === 'Cai Taflu' && /Gefolge des Marschalls/.test(role.title)));
  assert(positions.some(role => role.name === 'Rhydric Argall' && role.title === 'Hauptmann von Caer Ysgellfor'));
  assert(positions.some(role => role.name === 'Perwyn Argall' && role.reportsTo === 'dem Hauptmann von Caer Ysgellfor'));
  assert(officialCouncil(draig.territoryId, 'klerus', countyAreas.klerus).groups
    .flatMap(group => group.roles).some(role => role.name === "Glendower O'Cenyr"));
  for (const [scope, name, place] of [
    ['wyrm', 'Gwenllian Lyswen', 'Llysfaen'], ['arthus-streben', 'Bryn Rhydderch', 'Gwaulhir'],
    ['gwendolyns-ufer', 'Emrys Porthan', 'Morcarryn'], ['rhonwens-traenen', 'Cadog Môrwyn', 'Traethgwen'],
  ]) {
    const house = houses.find(item => item.id === scope);
    const role = officialCouncil(house.territoryId, 'klerus').groups.flatMap(group => group.roles).find(role => role.name === name);
    assert(role?.title.endsWith(`von ${place}`));
    assert(house.candidates.some(candidate => candidate.id === idFor(name)));
  }
});

test('a version 3 assignment beats a new source appointment and the new scopes open empty', () => {
  const state = createAssemblyState(houses, roster.free, { treeCandidates });
  const old = { schema: 'aleria.herrschaftsplanung', version: 3,
    houses: Object.fromEntries(houses.filter(house => !house.preparation).map(house => [
      house.id, { posts: [], removed: [], applicants: [], assignments: {} },
    ])),
  };
  old.houses.draig.assignments['hof-vogt/hausdiener'] = idFor('Nia Maerllys');
  const rhydric = idFor('Rhydric Argall');
  assert(!houses.find(entry => entry.id === 'wyrm').candidates.some(person => person.id === rhydric));
  old.houses.wyrm.assignments['hof/vogt'] = rhydric;
  state.importDraft(JSON.stringify(old));
  assert.equal(state.positions('draig').get('hof-vogt/hausdiener').occupant, idFor('Nia Maerllys'));
  assert.equal(state.positions('draig').get('hof-vogt/zofenstelle-2').occupant, null);
  assert.equal(state.positions('wyrm').get('hof/vogt').occupant, rhydric);
  assert(JSON.parse(state.serialize()).houses.wyrm.applicants.includes(rhydric));
  assert(!state.hasDraft('arthus-streben'));
  assert(!state.hasDraft('gwendolyns-ufer'));
  assert(!state.hasDraft('rhonwens-traenen'));
});

test('a figure from a remote family enters only the explicitly chosen applicant list and can be exported', () => {
  const findTree = createTreeCandidateSearch(treeCandidates, people);
  assert(treeCandidates.size >= 5000);
  const matches = findTree('Aegir Frostauge Aldrimar').matches;
  const id = matches[0].person.id;
  assert.equal(id, 'person--haus-frostauge--aegir-frostauge');
  const draft = createAssemblyState(houses, roster.free, { treeCandidates });
  assert.throws(() => draft.assign('saethwyr', 'spionage/leitung', id), /gehört nicht/);
  assert(draft.addApplicant('saethwyr', id));
  assert(!draft.addApplicant('saethwyr', id));
  assert.equal(draft.applicants('saethwyr')[0].id, id);
  assert.equal(draft.applicants('gafyr').length, 0);
  draft.assign('saethwyr', 'spionage/leitung', id);
  assert.throws(() => draft.removeApplicant('saethwyr', id), /Posten/);
  const restored = createAssemblyState(houses, roster.free, { treeCandidates });
  restored.importDraft(draft.serialize());
  assert.equal(restored.positions('saethwyr').get('spionage/leitung').occupant, id);
  assert.equal(restored.applicants('saethwyr')[0].id, id);
  restored.assign('saethwyr', 'spionage/leitung', null);
  assert(restored.removeApplicant('saethwyr', id));
  const older = JSON.parse(draft.serialize());
  older.version = 2;
  for (const source of Object.values(older.houses)) delete source.applicants;
  delete older.houses.saethwyr.assignments['spionage/leitung'];
  restored.importDraft(JSON.stringify(older));
  assert.deepEqual(restored.applicants('saethwyr'), []);
});

test('candidate filters compose and treat unknown dates as unknown', () => {
  const all = saethwyr.candidates.map(info => ({ ...people.get(info.id), ...info,
    position: info.id === imogen ? saethwyr.plans.finanzen.head : null }));
  const filtered = conditions => filterCandidates(all, { minAge: null, maxAge: null, ...conditions });
  assert.deepEqual(filtered({ query: 'imogen arwydd', sex: 'female', relationship: 'widowed', minAge: 60, maxAge: 70, availability: 'assigned' }).map(person => person.id), [imogen]);
  assert.equal(filtered({ query: 'anwyll', sex: 'male', relationship: 'married', minAge: 40, maxAge: 50 }).length, 1);
  assert.deepEqual(filtered({ query: 'imogen', relationship: 'single' }), []);
  assert(filtered({ query: 'nia saethwyr' }).some(person => person.name === 'Nia Saethwyr'));
  assert(!filtered({ query: 'nia saethwyr', hideMinors: true }).some(person => person.name === 'Nia Saethwyr'));
  assert.equal(filtered({ query: 'arawn', minAge: 1 }).length, 0);
  assert.equal(filtered({ query: 'arawn', hideMinors: true }).length, 1);
});
