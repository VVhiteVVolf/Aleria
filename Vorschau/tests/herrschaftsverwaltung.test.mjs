import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import councils from '../../Kontinente/modules/administration/data/celtigerns-vassals.generated.mjs';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { createAssemblyState } from '../Herrschaftsverwaltung/assembly-state.mjs';
import { filterCandidates } from '../Herrschaftsverwaltung/candidate-filters.mjs';
import { buildOfficePlans } from '../../shared/cenyr-administration/office-plans.mjs';
import { createTreeCandidateSearch } from '../Herrschaftsverwaltung/tree-candidate-picker.mjs';
import { countyAreas, countyLeadershipRole } from '../../shared/cenyr-administration/county-reference.mjs';
import { officialCouncil, officialCourt, officialRole } from '../../shared/cenyr-administration/official-office-model.mjs';
import { rulerSuffix, scopeForTerritory } from '../../shared/cenyr-administration/scopes.mjs';
import { CENYR_FORCES } from '../../shared/cenyr-administration/military-organization.mjs';
import { lehenswartKey } from '../../shared/cenyr-administration/lehenswarte-plan.mjs';
import { classifyLocalAuthority, localAuthorityChoices } from '../../shared/cenyr-administration/local-authority.mjs';
import { officeTitleKey, postTitleKey, titleKeyForTemplate } from '../Herrschaftsverwaltung/draft-office-titles.mjs';
import { vacancyEntries, filterVacancies } from '../Herrschaftsverwaltung/vacancy-search.mjs';
import { COURT_AREA, LEHENSWARTE_AREA } from '../../shared/cenyr-administration/office-icons.mjs';
import { OFFICE_CAST } from '../../shared/cenyr-administration/office-cast.generated.mjs';

const roster = JSON.parse(await readFile(new URL('../Herrschaftsverwaltung/roster.generated.json', import.meta.url), 'utf8'));
const houses = roster.houses.map(house => ({ ...house, plans: buildOfficePlans(house) }));
const people = new Map(roster.people.map(person => [person.id, person]));
const treeCandidates = new Map(roster.tree.map(candidate => [candidate.id, candidate]));
const saethwyr = houses.find(house => house.id === 'saethwyr');
const draig = houses.find(house => house.id === 'draig');
const imogen = saethwyr.offices.finanzen.holder;
const shadow = saethwyr.offices.spionage.holder;
const idFor = name => roster.people.find(person => person.name === name)?.id;

test('the workbench and public office plans use the same available portrait', async () => {
  const portraits = [
    ['person--haus-draig--odyar-draig', '/Stammbäume/assets/images/portraits/haus-draig/odyar-draig.jpg'],
    ['person--haus-gafyr--duncan-gafyr', '/Stammbäume/assets/images/portraits/haus-gafyr/duncan-gafyr.jpg'],
    ['person--haus-argall--perwyn-argall', '/AleriaAlmanach/assets/fleischsammler-argall/portraits/perwyn-argall.png'],
    ['person--haus-eisenherz--brona-eisenherz', '/Kontinente/modules/administration/assets/portraits/brona-eisenherz.webp'],
    ['almanach/micIJWlN8CkuedMo490X', '/Kontinente/modules/administration/assets/portraits/gwenllian-lyswen.webp'],
  ];
  for (const [id, image] of portraits) {
    assert.equal(people.get(id)?.portrait, image, id);
    assert.equal(OFFICE_CAST.people.find(person => person.id === id)?.portrait, image, id);
    await access(new URL('../..' + image, import.meta.url));
  }
});

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

test('documented dual roles link to their exact posts and survive new appointments and round-trips', () => {
  const draft = createAssemblyState(houses, roster.free);
  const odyar = idFor('Odyar Draig');
  const finance = officialCouncil(draig.territoryId, 'finanzen', countyAreas.finanzen).groups[0].roles[0];
  const treasury = officialCourt('haus-draig', []).plans['hof-schatzmeister'].head;
  assert.deepEqual(finance.appointmentLinks, [{ label: 'Schatzmeister · Haus Draig',
    href: '/Vorschau/Herrschaftsverwaltung/index.html?haus=draig&amt=hof&abteilung=hof-schatzmeister&posten=hof%2Fschatzmeister' }]);
  assert.deepEqual(officialRole(treasury, {}, true, 'draig').appointmentLinks, [{ label: 'Kämmerer des Grafen',
    href: '/Vorschau/Herrschaftsverwaltung/index.html?haus=draig&amt=finanzen&posten=finanzen%2Fleitung' }]);
  const slotIds = state => state.appointments(odyar).map(entry => entry.post.key).sort();
  assert.deepEqual(slotIds(draft), ['finanzen/leitung', 'hof/schatzmeister']);
  draft.assign('draig', 'spionage/leitung', odyar);
  const restored = createAssemblyState(houses, roster.free);
  restored.importDraft(draft.serialize());
  assert.deepEqual(slotIds(restored), ['finanzen/leitung', 'hof/schatzmeister', 'spionage/leitung']);
  restored.assign('draig', 'hof/schatzmeister', null);
  assert.deepEqual(slotIds(restored), ['finanzen/leitung', 'spionage/leitung']);
  restored.undo();
  assert.deepEqual(slotIds(restored), ['finanzen/leitung', 'hof/schatzmeister', 'spionage/leitung']);

  const v7 = JSON.parse(draft.serialize());
  v7.version = 7;
  v7.houses.draig.assignments['finanzen/leitung'] = null;
  v7.houses.draig.assignments['hof/schatzmeister'] = null;
  restored.importDraft(JSON.stringify(v7));
  assert.deepEqual(slotIds(restored), ['spionage/leitung']);
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

test('appointing a councillor changes only the chosen post and supports undo and voluntary release', () => {
  const draft = createAssemblyState(houses, roster.free);
  const previous = draft.assign('saethwyr', 'spionage/leitung', imogen);
  assert.equal(previous.occupant, shadow);
  assert.equal(draft.positions('saethwyr').get('spionage/leitung').occupant, imogen);
  assert.equal(draft.positions('saethwyr').get('finanzen/leitung').occupant, imogen);
  const newTreasurer = idFor('Anwyll Saethwyr');
  draft.assign('saethwyr', 'finanzen/leitung', newTreasurer);
  assert.equal(draft.positions('saethwyr').get('finanzen/leitung').occupant, newTreasurer);
  assert.equal(draft.positions('saethwyr').get('spionage/leitung').occupant, imogen);
  draft.undo();
  assert.throws(() => draft.assign('gafyr', 'spionage/leitung', imogen), /gehört nicht/);
  draft.assign('saethwyr', 'spionage/leitung', null);
  assert.equal(draft.positions('saethwyr').get('spionage/leitung').occupant, null);
  assert.equal(draft.positions('saethwyr').get('finanzen/leitung').occupant, imogen);
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
  draft.assign('saethwyr', ordinary, free);
  assert(!draft.freeFor('wyrm').some(person => person.id === free));
  assert.throws(() => draft.assign('wyrm', 'magie/leitung', free), /anderen Herrschaft/);
  draft.assign('gafyr', 'spionage/leitung', idFor('Kelyddon Gafyr'));
  const exported = draft.serialize();
  const restored = createAssemblyState(houses, roster.free, { storage });
  assert.equal(restored.serialize(), exported);
  assert.equal(restored.positions('saethwyr').get(extra).occupant, free);
  assert.equal(restored.positions('saethwyr').get(ordinary).kind, 'service');
  assert.equal(restored.positions('saethwyr').get(ordinary).occupant, free);
  assert.equal(restored.appointments(free).find(entry => entry.post.key === ordinary).area, 'hof');
  assert.equal(restored.positions('gafyr').get('finanzen/leitung').occupant, idFor('Kelyddon Gafyr'));
  const loaded = createAssemblyState(houses, roster.free);
  loaded.importDraft(exported);
  assert.equal(loaded.serialize(), exported);
  const broken = JSON.parse(exported);
  broken.houses.wyrm.assignments['magie/leitung'] = free;
  assert.throws(() => loaded.importDraft(JSON.stringify(broken)), /mehreren Herrschaften/);
  assert.equal(loaded.serialize(), exported);
  assert(loaded.removePost('saethwyr', extra));
  assert(!loaded.freeFor('wyrm').some(person => person.id === free));
  assert(loaded.removePost('saethwyr', ordinary));
  assert(loaded.freeFor('wyrm').some(person => person.id === free));
  loaded.undo();
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
  assert.equal(JSON.parse(currentExport).version, 11);
  draft.importDraft(currentExport);
  assert.equal(draft.serialize(), currentExport);
});

test('local offices include settlements and documented seats, with previous assignments retained', () => {
  assert.deepEqual(houses.map(house => house.plans.lehenswarte.slots.length), [5, 5, 5, 7, 13, 13, 15]);
  const aberllan = draig.plans.lehenswarte.slots.find(slot => slot.place === 'Aberllan');
  assert.equal(people.get(aberllan.holder).name, 'Lyonnel Garrael');
  const gafyr = houses.find(house => house.id === 'gafyr');
  const eifion = gafyr.plans.lehenswarte.slots.find(slot => slot.place === 'Bronfelen');
  assert.equal(people.get(eifion.holder).name, 'Eifion Gostyn');
  assert(gafyr.candidates.some(candidate => candidate.id === eifion.holder));
  const draft = createAssemblyState(houses, roster.free, { treeCandidates });
  const old = JSON.parse(draft.serialize());
  old.version = 5;
  old.houses.gafyr.assignments['spionage/ermittler'] = eifion.holder;
  draft.importDraft(JSON.stringify(old));
  assert.equal(draft.positions('gafyr').get(eifion.key).occupant, null);
  assert.equal(draft.positions('gafyr').get('spionage/ermittler').occupant, eifion.holder);
  const morfaen = lehenswartKey('Morfaen');
  draft.assign('saethwyr', morfaen, imogen);
  assert.equal(draft.positions('saethwyr').get(morfaen).occupant, imogen);
  assert.equal(draft.positions('saethwyr').get('finanzen/leitung').occupant, imogen);
});

test('settlement types present the applicable offices while documented titles keep their source holder', () => {
  const choices = type => localAuthorityChoices({ kind: classifyLocalAuthority(type) });
  for (const type of ['Klostersiedlung', 'Kirchensiedlung', 'Abtei']) {
    assert.deepEqual(choices(type), ['diakon', 'oberer', 'prior', 'abt', 'gildenpacht']);
  }
  for (const type of ['Burg', 'Inselburg · neu an Merek vergeben', 'Grenzfestung', 'Turm']) {
    assert.deepEqual(choices(type), ['kommandant', 'hauptmann', 'burgverwalter', 'gildenpacht']);
  }
  for (const type of ['Waldsiedlung', 'Landsiedlung', 'Handelssiedlung', 'Bergbausiedlung']) {
    assert.deepEqual(choices(type), ['buergermeister', 'lehenswart', 'gildenpacht']);
  }
  for (const type of ['Siedlung', 'Befestigte Siedlung']) {
    assert.deepEqual(choices(type), ['buergermeister', 'lehenswart', 'kommandant', 'hauptmann', 'burgverwalter', 'gildenpacht']);
  }
  assert.deepEqual(choices('Pachtsiedlung'), ['gildenpacht']);
  const plans = houses.find(house => house.id === 'gwendolyns-ufer').plans.lehenswarte;
  const check = (name, title, holder) => {
    const slot = plans.slots.find(post => post.place === name);
    assert.equal(slot.title, title);
    assert.equal(people.get(slot.holder).name, holder);
  };
  check('Côr Mynyddfaen', 'Oberin von Côr Mynyddfaen', 'Gwenydd Anghof');
  check('Tŵr Morlan', 'Hauptmann und Verwalter von Tŵr Morlan', 'Cadfan Trydar');
  check('Castell Rhewglyn', 'Lehenswart von Castell Rhewglyn', 'Brendan Taranvyr');
  assert(!plans.slots.some(slot => slot.place === 'Morddyn'));
});

test('Tŵr Morlan shares one watch and locality appointment while old keys and both draft choices are preserved', () => {
  const house = houses.find(house => house.id === 'gwendolyns-ufer');
  const key = lehenswartKey('Tŵr Morlan');
  const previousKey = 'militaer/wacht-morlan';
  const cadfan = idFor('Cadfan Trydar');
  const second = idFor('Rhunlas Llon');
  assert.equal(house.plans.militaer.slots.find(post => post.id === 'wacht-morlan').key, key);
  assert.equal(house.plans.lehenswarte.slots.find(post => post.place === 'Tŵr Morlan').key, key);
  const official = officialCouncil(house.territoryId, 'militaer').groups.flatMap(group => group.roles).find(role => role.name === 'Cadfan Trydar');
  assert.equal(official.title, 'Hauptmann und Verwalter von Tŵr Morlan');
  assert.deepEqual(official.appointmentLinks, []);
  const state = createAssemblyState(houses, roster.free, { treeCandidates, people });
  assert.equal(state.appointments(cadfan).filter(entry => entry.scopeId === house.id).length, 1);
  const old = JSON.parse(state.serialize());
  old.version = 8;
  const source = old.houses[house.id];
  source.assignments[previousKey] = second;
  source.titles[postTitleKey(previousKey)] = 'Hauptmann der Turmsiedlung';
  source.posts.push({ id: 'dienst', area: 'militaer', kind: 'service', templateId: 'r-wachmann', site: previousKey,
    title: 'Wachmann der Ortswache', description: '' });
  state.importDraft(JSON.stringify(old));
  assert.equal(state.positions(house.id).get(key).occupant, second);
  assert.equal(state.positions(house.id).get(key).title, 'Hauptmann der Turmsiedlung');
  assert.equal(state.positions(house.id).get('militaer/extra-dienst').locality.key, key);
  source.assignments[key] = cadfan;
  state.importDraft(JSON.stringify(old));
  assert.equal(state.positions(house.id).get(key).previousOccupantName, 'Rhunlas Llon');
  assert(state.positions(house.id).get(key).needsReplacement);
  state.importDraft(state.serialize());
  assert.equal(state.positions(house.id).get(key).previousOccupantName, 'Rhunlas Llon');
  state.assign(house.id, key, cadfan);
  assert(!state.positions(house.id).get(key).needsReplacement);
  assert.equal(state.positions(house.id).get(key).occupant, cadfan);
  state.assign(house.id, state.postKey(house.id, previousKey), null);
  assert.equal(state.positions(house.id).get(key).occupant, null);
});

test('missing and no longer eligible holders survive old drafts and stay out of the candidate pool', () => {
  const state = createAssemblyState(houses, roster.free, { treeCandidates, people });
  const old = JSON.parse(state.serialize());
  old.version = 8;
  const former = 'person--haus-nachbesetzung--varn-alde';
  const offices = old.houses.saethwyr;
  offices.applicants.push(former);
  offices.assignments['spionage/leitung'] = former;
  offices.assignments['magie/leitung'] = idFor('Kelyddon Gafyr');
  state.importDraft(JSON.stringify(old));
  const posts = () => state.positions('saethwyr');
  assert.equal(posts().get('spionage/leitung').occupantName, 'Varn Alde');
  assert.equal(posts().get('magie/leitung').occupantName, 'Kelyddon Gafyr');
  assert(posts().get('spionage/leitung').needsReplacement);
  assert(posts().get('magie/leitung').needsReplacement);
  assert.equal(posts().get('finanzen/leitung').occupant, imogen);
  assert.deepEqual(state.applicants('saethwyr'), []);
  assert.throws(() => state.assign('saethwyr', 'gerichtsbarkeit/leitung', former), /gehört nicht/);
  const snapshot = JSON.parse(state.serialize());
  snapshot.houses.saethwyr.assignmentNames[former] = 'Vârn Alde';
  state.importDraft(JSON.stringify(snapshot));
  state.importDraft(state.serialize());
  assert.equal(posts().get('spionage/leitung').occupantName, 'Vârn Alde');
  state.assign('saethwyr', 'spionage/leitung', imogen);
  assert(!posts().get('spionage/leitung').needsReplacement);
  state.assign('saethwyr', 'magie/leitung', null);
  assert.equal(posts().get('magie/leitung').occupant, null);
  state.undo();
  assert(posts().get('magie/leitung').needsReplacement);
});

test('the Trydar source upgrade changes Cadfan’s old official title while retaining local edits', () => {
  const family = FAMILY_REGISTRY.find(entry => entry.id === 'haus-trydar').family;
  const cadfan = record => record.persons.find(person => person.id === 'cadfan-trydar');
  const saved = structuredClone(family);
  saved.extensions.sourceRevision = 6;
  cadfan(saved).title = 'Sir · Festungskommandant von Twr Morlan';
  cadfan(saved).notes = 'Eigene Familiennotiz';
  const upgraded = resolveRegisteredFamilyUpgrade(family, saved);
  assert.equal(cadfan(upgraded).title, 'Sir · Hauptmann und Verwalter von Tŵr Morlan');
  assert.equal(cadfan(upgraded).notes, 'Eigene Familiennotiz');
  assert.equal(cadfan(upgraded).worldPersonId, cadfan(saved).worldPersonId);
  assert.deepEqual(upgraded.parentages, saved.parentages);
  cadfan(saved).title = 'Eigener Chroniktitel';
  assert.equal(cadfan(resolveRegisteredFamilyUpgrade(family, saved)).title, 'Eigener Chroniktitel');
});

test('vacancy search works across houses, with draft titles, localities and one entry per shared post', () => {
  const state = createAssemblyState(houses, roster.free, { treeCandidates, people });
  const areas = [COURT_AREA, LEHENSWARTE_AREA, { id: 'militaer', name: 'Militär' }];
  const all = () => vacancyEntries(houses, areas, state, people);
  assert.equal(filterVacancies(all(), 'twr morlan hauptmann und verwalter').length, 0);
  const matches = filterVacancies(all(), 'hauptmann arwydd', 'rhonwens-traenen');
  assert(matches.some(row => row.area === 'hof' && row.href.includes('abteilung=hof-hausmacht')));
  assert(matches.some(row => row.area === 'militaer' && row.href.includes('posten=militaer%2F')));
  const scope = 'gwendolyns-ufer';
  const key = lehenswartKey('Tŵr Morlan');
  state.assign(scope, key, null);
  state.renameTitle(scope, postTitleKey(key), 'Hauptmann am Leuchtfeuer');
  const vacancy = filterVacancies(all(), 'twr morlan leuchtfeuer', scope, 'militaer');
  assert.equal(vacancy.length, 1);
  assert.equal(new URL(vacancy[0].href, 'https://aleria.invalid').searchParams.get('posten'), key);
  assert.match(filterVacancies(all(), 'twr morlan leuchtfeuer', scope, 'lehenswarte')[0].href, /amt=lehenswarte/);
});

test('a guild lease stores its own title, keeps its seat and supports restoration and export', () => {
  const draft = createAssemblyState(houses, roster.free, { treeCandidates, makeId: () => 'test-staff' });
  const scope = 'gwendolyns-ufer';
  const key = lehenswartKey('Glasdraeth');
  const former = draft.positions(scope).get(key);
  const clerk = draft.addPost(scope, { area: 'lehenswarte', kind: 'service', title: 'Ortsschreiber', description: '', site: key });
  draft.setAuthority(scope, key, { role: 'gildenpacht', guild: '  Klingende Münze  ', title: 'Gildenvogt' });
  const after = draft.positions(scope).get(key);
  assert.equal(after.occupant, former.occupant);
  assert.equal(after.title, 'Gildenvogt');
  assert.equal(after.authority.type, 'Hafensiedlung');
  assert.equal(after.reportsTo, 'der Gilde Klingende Münze');
  assert.equal(draft.positions(scope).get(clerk).locality.title, 'Gildenvogt');
  const exportText = draft.serialize();
  const restored = createAssemblyState(houses, roster.free, { treeCandidates });
  restored.importDraft(exportText);
  assert.equal(restored.serialize(), exportText);
  restored.setAuthority(scope, key, { role: 'buergermeister' });
  assert.equal(restored.positions(scope).get(key).title, 'Bürgermeister von Glasdraeth');
  assert.deepEqual(JSON.parse(restored.serialize()).houses[scope].authorities[key], { role: 'buergermeister' });
  restored.undo();
  assert.equal(restored.serialize(), exportText);
  restored.setAuthority(scope, key, null);
  assert.equal(restored.positions(scope).get(key).title, former.title);
  assert.throws(() => restored.setAuthority(scope, lehenswartKey('Tŵr Morlan'), { role: 'buergermeister' }), /Amtsform/);
  assert.throws(() => restored.setAuthority(scope, key, { role: 'gildenpacht', guild: 'a\nb' }), /Gildenname/);
  const invalid = JSON.parse(exportText);
  invalid.houses[scope].authorities['finanzen/leitung'] = { role: 'gildenpacht' };
  assert.throws(() => restored.importDraft(JSON.stringify(invalid)), /Amtsform/);
});

test('v6 drafts can transfer a figure whose documented locality is now editable', () => {
  const draft = createAssemblyState(houses, roster.free, { treeCandidates });
  const v6 = JSON.parse(draft.serialize());
  v6.version = 6;
  for (const house of Object.values(v6.houses)) delete house.authorities;
  const hywel = idFor('Hywel Tynged');
  v6.houses.wyrm.assignments['spionage/ermittler'] = hywel;
  draft.importDraft(JSON.stringify(v6));
  assert.equal(draft.positions('wyrm').get('spionage/ermittler').occupant, hywel);
  assert.equal(draft.positions('wyrm').get(lehenswartKey('Craithglyn')).occupant, null);
});

test('draft titles follow the office, repeated role and individual post across export and undo', () => {
  let nextId = 0;
  const draft = createAssemblyState(houses, roster.free, { treeCandidates, makeId: () => `title-${++nextId}` });
  const role = saethwyr.plans.spionage.templates.find(template => template.title === 'Ermittler');
  const roleKey = titleKeyForTemplate('spionage', role);
  const head = 'spionage/leitung';
  const originalPost = 'spionage/ermittler';
  draft.renameTitle('saethwyr', postTitleKey(head), '  Schild der Nacht  ');
  draft.renameTitle('saethwyr', officeTitleKey('hof'), 'Haushof');
  draft.renameTitle('saethwyr', roleKey, 'Kundige der Nacht');
  draft.renameTitle('saethwyr', postTitleKey(originalPost), 'Erste Kundige');
  const [next] = draft.addPosts('saethwyr', { area: 'spionage', kind: role.kind, title: role.title, description: '', templateId: role.id }, 1);
  draft.assign('saethwyr', head, imogen);
  const posts = draft.positions('saethwyr');
  assert.equal(posts.get(head).title, 'Schild der Nacht');
  assert.equal(posts.get(head).titleVariants, undefined);
  assert.equal(posts.get(head).occupant, imogen);
  assert.equal(posts.get(originalPost).title, 'Erste Kundige');
  assert.equal(posts.get(originalPost).roleTitle, posts.get(next).title);
  assert.equal(posts.get(originalPost).roleKey, posts.get(next).roleKey);
  assert.equal(draft.title('saethwyr', officeTitleKey('hof')), 'Haushof');
  assert.equal(draft.title('gafyr', officeTitleKey('hof')), undefined);
  const maids = [...draft.positions('gafyr').values()].filter(post => post.placement === 'zofen');
  assert.equal(maids.length, 8);
  assert.equal(new Set(maids.map(post => post.roleKey)).size, 1);
  const exported = draft.serialize();
  const restored = createAssemblyState(houses, roster.free, { treeCandidates });
  restored.importDraft(exported);
  assert.equal(restored.serialize(), exported);
  restored.renameTitle('saethwyr', postTitleKey(originalPost), null);
  assert.equal(restored.positions('saethwyr').get(originalPost).title, 'Kundige der Nacht');
  restored.undo();
  assert.equal(restored.serialize(), exported);
  const invalid = JSON.parse(exported);
  invalid.houses.saethwyr.titles['amt/unbekannt'] = 'Fremd';
  assert.throws(() => restored.importDraft(JSON.stringify(invalid)), /kein verfügbares Amt/);
  assert.throws(() => restored.renameTitle('saethwyr', postTitleKey(head), '   '), /Titel muss/);
  assert.equal(restored.serialize(), exported);
});

test('the shared court plans provide the requested teaching, smithy and chapel posts', () => {
  for (const house of houses) {
    const { hof, 'hof-waffen': weapons, 'hof-handwerk': crafts, 'hof-kaplan': chapel, 'hof-hofdame': lady } = house.plans;
    assert(hof.sections[0].slots.some(slot => slot.key === 'hof/waffen'));
    assert.deepEqual(weapons.sections.flatMap(section => section.slots.map(slot => slot.title)), [
      'Stellvertreter und Nachfolger', 'Lehrmeister', 'Lehrmeister', 'Lehrmeister', 'Lehrmeister', 'Rüst- und Waffenwart',
    ]);
    const smithy = crafts.sections[0].slots;
    assert.equal(smithy[0].title, 'Schmiedemeister');
    assert.equal(smithy.filter(slot => slot.title === 'Schmiedegeselle' && slot.kind).length, 4);
    assert.equal(smithy.filter(slot => slot.title === 'Schmiedelehrling' && slot.kind).length, 2);
    assert(crafts.sections[1].slots.some(slot => slot.title === 'Hofhandwerker'));
    assert.deepEqual(chapel.sections[0].slots.map(slot => slot.title), ['Stellvertretung', 'Schreiber des Hofkaplans']);
    assert.equal(chapel.slots.filter(slot => slot.title === 'Heiler').length, { prince: 1, barony: 2, county: 4 }[house.rank]);
    assert.equal(chapel.slots.filter(slot => slot.title === 'Akolyth').length, { prince: 2, barony: 3, county: 4 }[house.rank]);
    assert(chapel.slots.some(slot => slot.title === 'Sakristan'));
    assert(![...lady.slots, ...lady.templates].some(slot => slot.title === 'Page der Hofdame'));
  }
});

test('v5 imports preserve former armory assignments and release the removed lady-in-waiting pages', () => {
  const draft = createAssemblyState(houses, roster.free, { treeCandidates });
  const old = JSON.parse(draft.serialize());
  old.version = 5;
  const saved = old.houses.saethwyr;
  saved.posts.push({ area: 'hof-hofdame', id: 'old-page', kind: 'service', title: 'Page der Hofdame', description: '', templateId: 'r-gehilfe' });
  Object.assign(saved.assignments, { 'hof-waffen/gehilfe': imogen,
    'hof-hofdame/gehilfe-2': shadow, 'hof-hofdame/extra-old-page': idFor('Arian Saethwyr') });
  draft.importDraft(JSON.stringify(old));
  const positions = draft.positions('saethwyr');
  assert.equal(positions.get('hof-waffen/extra-alt-gehilfe').occupant, imogen);
  assert.equal(positions.get('spionage/leitung').occupant, shadow);
  assert(!positions.has('hof-hofdame/extra-old-page'));
  assert(!positions.has('hof-hofdame/gehilfe-2'));
});

test('sea commands follow rank and Arwydd retains the previous coastal posts', () => {
  const forScope = id => houses.find(house => house.id === id).plans.militaer;
  const flotillas = id => forScope(id).sections.find(section => /Flottillenadmiräle/u.test(section.title)).slots;
  assert.deepEqual(['draig', 'gwendolyns-ufer', 'saethwyr', 'rhonwens-traenen'].map(id => flotillas(id).length), [5, 3, 2, 2]);
  assert.deepEqual(flotillas('rhonwens-traenen').map(slot => slot.title), ['Flottillenadmiral von Tân Gwaelon', 'Flottillenadmiral von Talheli']);
  const arwydd = forScope('rhonwens-traenen');
  assert.equal(arwydd.slots.find(slot => slot.key === 'militaer/admiral').title, 'Seemarschall und Admiral');
  assert.equal(arwydd.slots.find(slot => slot.key === 'militaer/seefuehrung').title, 'See- und Küstenkommandant');
  assert.equal(arwydd.slots.find(slot => slot.key === 'militaer/seeadjutant').title, 'Adjutant des Küstenkommandanten');
  const official = officialCouncil('herrschaft-rhonwens-traenen', 'militaer');
  assert(official.groups.some(group => group.title === 'Admiralität' && group.roles[0].title === 'Vizeadmiral'));
  assert(!arwydd.slots.some(slot => slot.id === 'seekommandant'));
  assert(!forScope('gafyr').sections.some(section => section.title === 'Admiralität'));
  const draft = createAssemblyState(houses, roster.free, { treeCandidates });
  const old = JSON.parse(draft.serialize());
  old.version = 5;
  const coastalCommander = idFor('Ianto Arwydd');
  const flotillaCommander = idFor('Gwynnan Gwyvern');
  old.houses['rhonwens-traenen'].assignments['militaer/seefuehrung'] = coastalCommander;
  old.houses['gwendolyns-ufer'].assignments['militaer/flottille-traethgorn'] = flotillaCommander;
  draft.importDraft(JSON.stringify(old));
  assert.equal(draft.positions('rhonwens-traenen').get('militaer/seefuehrung').occupant, coastalCommander);
  assert.equal(draft.positions('rhonwens-traenen').get('militaer/admiral').occupant, null);
  assert.equal(draft.positions('gwendolyns-ufer').get('militaer/extra-alt-flottille-traethgorn').occupant, flotillaCommander);
});

test('flotilla and ship roles can be reduced or added in batches with an optional station', () => {
  let nextId = 0;
  const draft = createAssemblyState(houses, roster.free, { treeCandidates, makeId: () => `see-${++nextId}` });
  for (const scope of ['draig', 'gwendolyns-ufer', 'saethwyr', 'rhonwens-traenen']) {
    const plan = houses.find(house => house.id === scope).plans.militaer;
    const captain = plan.templates.find(role => role.id === 'r-kapitaen');
    const flotilla = plan.templates.find(role => role.id === 'r-flottillenadmiral');
    assert.equal(captain.title, 'Kapitän zur See');
    assert.equal(flotilla.title, 'Flottillenadmiral');
    assert.equal(plan.templates.filter(role => role.id === flotilla.id).length, 1);
    assert(plan.slots.filter(slot => slot.templateId === flotilla.id).every(slot => slot.removable));
  }
  const scope = 'rhonwens-traenen';
  const plan = houses.find(house => house.id === scope).plans.militaer;
  const add = (id, count, site) => {
    const { kind, title, description } = plan.templates.find(role => role.id === id);
    return draft.addPosts(scope, { area: 'militaer', kind, title, description, templateId: id, site }, count);
  };
  const original = plan.slots.filter(slot => slot.templateId === 'r-flottillenadmiral');
  for (const slot of original) assert(draft.removePost(scope, slot.key));
  const site = plan.localities.find(place => place.name === 'Tân Gwaelon');
  const fleet = add('r-flottillenadmiral', 3, site.key);
  const captains = add('r-kapitaen', 12, site.key);
  const deck = add('r-seedienst-bootsmann', 8, site.key);
  const posts = draft.positions(scope);
  assert.equal(posts.get(fleet[0]).reportsTo, 'dem Vizeadmiral');
  assert.deepEqual(posts.get(fleet[0]).locality, { key:site.key, name: 'Tân Gwaelon', type:'station' });
  assert.equal(posts.get(captains.at(-1)).placement, 'kapitaene-zur-see');
  assert.equal(posts.get(deck.at(-1)).locality.type, 'station');
  draft.importDraft(draft.serialize());
  assert(!draft.positions(scope).has(original[0].key));
  assert(draft.positions(scope).has(fleet[2]));
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
  assert.equal(findTree('Aegir Frostauge Aldrimar').total, 0);
  const countyMatches = findTree('Cadfan Trydar').matches;
  assert(countyMatches.some(entry => entry.person.id === idFor('Cadfan Trydar') && entry.regions[0] === 'Celtigerns Wacht'));
  const matches = findTree('Aegir Frostauge Aldrimar', { includeOtherRegions: true }).matches;
  const id = matches[0].person.id;
  assert.equal(id, 'person--haus-frostauge--aegir-frostauge');
  const draft = createAssemblyState(houses, roster.free, { treeCandidates });
  assert.throws(() => draft.assign('saethwyr', 'spionage/leitung', id), /gehört nicht/);
  assert(draft.addApplicant('saethwyr', id));
  assert(!draft.addApplicant('saethwyr', id));
  assert.equal(draft.applicants('saethwyr')[0].id, id);
  assert.equal(draft.applicants('gafyr').length, 0);
  draft.assign('saethwyr', 'spionage/leitung', id);
  draft.assign('saethwyr', 'magie/leitung', id);
  assert(draft.addApplicant('gafyr', id));
  draft.assign('gafyr', 'spionage/leitung', id);
  assert.throws(() => draft.removeApplicant('saethwyr', id), /Posten/);
  const restored = createAssemblyState(houses, roster.free, { treeCandidates });
  restored.importDraft(draft.serialize());
  assert.equal(restored.positions('saethwyr').get('spionage/leitung').occupant, id);
  assert.deepEqual(restored.appointments(id).map(entry => [entry.scopeId, entry.post.key]), [
    ['saethwyr', 'spionage/leitung'], ['saethwyr', 'magie/leitung'], ['gafyr', 'spionage/leitung'],
  ]);
  assert.equal(restored.applicants('saethwyr')[0].id, id);
  restored.assign('saethwyr', 'spionage/leitung', null);
  assert.throws(() => restored.removeApplicant('saethwyr', id), /Posten/);
  restored.assign('saethwyr', 'magie/leitung', null);
  assert(restored.removeApplicant('saethwyr', id));
  assert.equal(restored.positions('gafyr').get('spionage/leitung').occupant, id);
  const older = JSON.parse(draft.serialize());
  older.version = 2;
  for (const source of Object.values(older.houses)) delete source.applicants;
  older.houses.saethwyr.assignments = {};
  older.houses.gafyr.assignments = {};
  restored.importDraft(JSON.stringify(older));
  assert.deepEqual(restored.applicants('saethwyr'), []);
});

test('candidate filters compose and treat unknown dates as unknown', () => {
  const all = saethwyr.candidates.map(info => ({ ...people.get(info.id), ...info,
    appointments: info.id === imogen ? [saethwyr.plans.finanzen.head, saethwyr.plans.spionage.head] : [] }));
  const filtered = conditions => filterCandidates(all, { minAge: null, maxAge: null, ...conditions });
  assert.deepEqual(filtered({ query: 'imogen arwydd', sex: 'female', relationship: 'widowed', minAge: 60, maxAge: 70, availability: 'assigned' }).map(person => person.id), [imogen]);
  assert.deepEqual(filtered({ query: 'imogen schatten', availability: 'assigned' }).map(person => person.id), [imogen]);
  assert.equal(filtered({ query: 'anwyll', sex: 'male', relationship: 'married', minAge: 40, maxAge: 50 }).length, 1);
  assert.deepEqual(filtered({ query: 'imogen', relationship: 'single' }), []);
  assert(filtered({ query: 'nia saethwyr' }).some(person => person.name === 'Nia Saethwyr'));
  assert(!filtered({ query: 'nia saethwyr', hideMinors: true }).some(person => person.name === 'Nia Saethwyr'));
  assert.equal(filtered({ query: 'arawn', minAge: 1 }).length, 0);
  assert.equal(filtered({ query: 'arawn', hideMinors: true }).length, 1);
});
