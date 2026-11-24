import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { ALERIA_CURRENT_YEAR } from '../../../Stammbäume/assets/js/config/chronology.js';
import { calculateAge } from '../../../Stammbäume/assets/js/domain/person-presentation.js';
import { isPersonRecordedDead } from '../../../Stammbäume/assets/js/domain/person-life-state.js';
import { buildFamilyPersonDisplayName, getHouseSurname } from '../../../js/world-identity/family-person-names.js';
import { normalizePersonName } from '../../../js/world-identity/person-identity.js';
import { readWorldDirectorySources } from '../../../shared/world-directory/source-reader.mjs';
import councils from '../../../Kontinente/modules/administration/data/celtigerns-vassals.generated.mjs';
import { resolveAdministrationPortrait } from '../../../Kontinente/modules/administration/administration-portrait-sources.mjs';
import { HOUSE_CONTENT as saethwyrCourt } from '../../../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Saethwyr/haus.content.mjs';
import { HOUSE_CONTENT as gafyrCourt } from '../../../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gafyr/haus.content.mjs';
import { HOUSE_CONTENT as wyrmCourt } from '../../../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Wyrm/haus.content.mjs';
import { HOUSE_CONTENT as gwefryddCourt } from '../../../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Gwefrydd/haus.content.mjs';
import { HOUSE_CONTENT as gwyvernCourt } from '../../../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Gwyvern/haus.content.mjs';
import { HOUSE_CONTENT as arwyddCourt } from '../../../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Arwydd/haus.content.mjs';
import { houseOfficeFor } from '../../../Familien Häuser und Clans/modules/court/house-office-catalog.mjs';
import { geographicKey } from '../../../shared/world-directory/geographic-key.mjs';
import { CENYR_ADMINISTRATION_SCOPES } from '../../../shared/cenyr-administration/scopes.mjs';
import { PERSONAL_SERVICE, SERVICE_HOUSES, FREE_HOUSES, OTHER_SERVICE, STAFF, TERRITORIAL_NAME_NOTES, COURT_NAME_NOTES } from './roster-sources.mjs';
import { buildCountyRoster } from './county-roster.mjs';
import { buildTreeCandidateIndex } from './tree-candidate-index.mjs';
import { readAlmanacAppointments } from './almanac-appointments.mjs';
import { buildKingdomPlanning } from './kingdom-planning.mjs';

const root = new URL('../../../', import.meta.url);
const output = new URL('../roster.generated.json', import.meta.url);
const kingdomOutput = new URL('../kingdom.generated.json', import.meta.url);
const nativeOutput = new URL('../../../shared/cenyr-administration/office-cast.generated.mjs', import.meta.url);
const { territories, families, houses: houseEntries } = await readWorldDirectorySources();
const almanac = await readAlmanacAppointments();
const directory = new Map(families.map(family => [family.id, family]));
const registry = new Map(FAMILY_REGISTRY.map(family => [family.id, family]));
const courts = {
  saethwyr: saethwyrCourt, gafyr: gafyrCourt, wyrm: wyrmCourt,
  'arthus-streben': gwefryddCourt, 'gwendolyns-ufer': gwyvernCourt, 'rhonwens-traenen': arwyddCourt,
};
const byName = (a, b) => a.name.localeCompare(b.name, 'de');
const houseKey = id => String(id || '').replace(/^(?:house|haus)-/, '');
const isNamed = name => typeof name === 'string' && /\p{L}/u.test(name)
  && !/^(?:unbekannt|unbenannt|nicht benannt|offen|folgt)/i.test(name.trim());
const isLiving = person => person.status === 'alive' && !isPersonRecordedDead(person) && isNamed(person.name);
const personHref = (family, id) => `/Stammbäume/Stammbaum.html?family=${encodeURIComponent(family)}&mode=view&person=${encodeURIComponent(id)}`;

function portraitUrl(raw = '') {
  const path = resolveAdministrationPortrait(raw);
  const local = path.startsWith('assets/') ? `/Stammbäume/${path}` : path;
  if (/^\/(?!\/)/u.test(local)) {
    const file = new URL(`.${local}`, root);
    return file.href.startsWith(root.href) && existsSync(file) ? local : '';
  }
  return /^https:\/\//u.test(local) ? local : '';
}

function publicMarriages(family, person) {
  return family.partnerships.filter(link => link.type === 'marriage'
    && link.visibility === 'public' && link.certainty === 'confirmed' && link.status !== 'secret'
    && link.participantIds.includes(person.id));
}

function relationship(family, person) {
  const marriages = publicMarriages(family, person);
  const other = link => family.persons.find(p => p.id !== person.id && link.participantIds.includes(p.id));
  if (marriages.some(link => link.status === 'active' && !isPersonRecordedDead(other(link)))) return 'married';
  if (marriages.some(link => link.status === 'widowed' || (link.status === 'active' && isPersonRecordedDead(other(link))))) return 'widowed';
  if (marriages.some(link => link.status === 'divorced')) return 'divorced';
  if (marriages.length) return 'unknown';
  if (family.partnerships.some(link => link.type === 'engagement' && link.status === 'active' && link.visibility === 'public'
    && link.certainty === 'confirmed' && link.participantIds.includes(person.id))) return 'engaged';
  return person.familyRole === 'married' ? 'unknown' : 'single';
}

function ownFamilyMembers(record) {
  const { family } = record;
  const homeKey = houseKey(record.id);
  const primary = new Set(family.persons.filter(person => houseKey(person.houseId) === homeKey).map(person => person.id));
  return family.persons.filter(person => isLiving(person) && (primary.has(person.id)
    || (!person.houseId && person.familyRole === 'married' && publicMarriages(family, person)
      .some(link => link.status === 'active' && link.participantIds.some(id => primary.has(id))))));
}

const people = new Map();
function addFamilyPerson(record, person, currentName, portrait, localId) {
  if (!isLiving(person)) throw new Error(`Unbestätigte aktuelle Identität: ${record.id}/${person.id}`);
  const id = person.worldPersonId || localId;
  if (!id) throw new Error(`Fehlende Weltpersonen-ID: ${record.id}/${person.id}`);
  const previous = people.get(id);
  if (previous && (!currentName || previous.alias)) return id;
  const familyName = buildFamilyPersonDisplayName(record.family, person);
  const birth = String(person.birth || '');
  const approximate = /^\d{4}\s*\?$/.test(birth);
  const age = calculateAge(approximate ? { ...person, birth: birth.replace(/\?/, '').trim() } : person);
  const name = currentName || familyName;
  people.set(id, {
    id, name, ...(name !== familyName ? { alias: familyName } : {}),
    portrait: portraitUrl(portrait || person.portrait),
    sex: person.sex, age, ...(age !== null && approximate ? { approximate: true } : {}),
    relationship: relationship(record.family, person),
    href: personHref(record.id, person.id),
  });
  return id;
}

function addNamedMember(scope, member, key) {
  if (!isNamed(member.name)) return null;
  const record = registry.get(member.familyId);
  if (record) {
    const portrait = portraitUrl(member.imageSrc);
    const matches = record.family.persons.filter(person => isLiving(person)
      && (normalizePersonName(buildFamilyPersonDisplayName(record.family, person)) === normalizePersonName(member.name)
        || (portrait && portraitUrl(person.portrait) === portrait)));
    if (matches.length !== 1) throw new Error(`${scope}/${key} · ${member.name}: ${matches.length} passende Personen`);
    return addFamilyPerson(record, matches[0], member.name, member.imageSrc, `stammbaum/${record.id}/${matches[0].id}`);
  }
  // The territorial record itself identifies this officeholder. A similarly named
  // pedigree entry cannot supply their family, gender, age or relationship.
  const id = member.worldPersonId || `territory/${scope}/${key}`;
  people.set(id, {
    id, name: member.name, portrait: portraitUrl(member.imageSrc),
    sex: member.sex || 'unknown', age: member.age ?? null, relationship: 'unknown', href: member.href || '',
  });
  return id;
}

function familyAffiliations(profile, territory) {
  const ownId = profile.houseId;
  const surname = houseKey(ownId);
  const direct = territory.view.familySections.flatMap(section => section.cards)
    .filter(card => directory.has(card.id) && normalizePersonName(card.liege) === surname).map(card => card.id);
  return [ownId, ...new Set([...direct, ...families.filter(family => houseKey(family.profile.liegeHouseId) === surname
    || (!family.profile.liegeHouseId && normalizePersonName(getHouseSurname(family.profile.liegeHouseName)) === surname))
    .map(family => family.id), ...Object.keys(SERVICE_HOUSES).filter(id => SERVICE_HOUSES[id] === profile.id)])];
}

function localPlaces(domain, includeCenter) {
  const named = domain.sections[0].places.map(({ name, type }) => ({ name, type }));
  const ports = domain.sections.slice(1).flatMap(section => section.places).filter(place => place.type === 'Hafen');
  named.push(...ports.map(({ name, type }) => ({ name, type })));
  if (includeCenter && domain.center && !named.some(place => place.name === domain.center)) named.unshift({ name: domain.center, type: 'Hauptstadt' });
  return [...new Map(named.map(place => [geographicKey(place.name), place])).values()];
}

const regionalIdentities = {
  'gwendolyns-ufer/finanzen': ['haus-gwyvern', 'olwen-wyrm'],
  'gwendolyns-ufer/diplomatie': ['haus-gwyvern', 'jeannae-aderyn'],
};
const regionalWorldIds = {
  'gwendolyns-ufer/klerus': 'person--celtigerns-wacht--gwenydd-anghof',
};

function addHouse(profile) {
  const scope = profile.id;
  const council = councils.find(entry => entry.id === scope);
  if (!council || council.scopeId !== profile.territoryId) throw new Error(`Unbekannte Ratsquelle für ${scope}`);
  const { content: territory } = territories.find(entry => entry.id === profile.territoryId);
  const { councilGroups, vassalGroups, geography } = territory.view;
  const members = councilGroups.flatMap(group => group.members);
  const ownId = profile.houseId;
  const own = directory.get(ownId);
  const ruler = members.find(member => member.featured);
  const candidates = new Map();
  const admit = (id, kind, family, detail = '') => {
    if (id && !candidates.has(id)) candidates.set(id, { id, kind, family, ...(detail ? { detail } : {}) });
  };
  const enrolled = familyAffiliations(profile, territory).map(id => {
    const family = directory.get(id);
    const kind = id === ownId ? 'house' : family?.profile.rankId === 'commoner' ? 'service' : 'knight';
    if (!family) throw new Error(`Fehlendes direkt zugeordnetes Haus: ${scope}/${id}`);
    for (const person of registry.has(id) ? ownFamilyMembers(registry.get(id)) : []) {
      if (!OTHER_SERVICE.has(`house-${houseKey(id)}/${person.id}`)) {
        admit(addFamilyPerson(registry.get(id), person, undefined, undefined, `stammbaum/${id}/${person.id}`), kind, family.name);
      }
    }
    return { id, name: family.name, kind, href: family.href };
  });
  function exactPerson(familyId, personId, name) {
    const record = registry.get(familyId);
    const person = record?.family.persons.find(entry => entry.id === personId);
    if (!person || !directory.has(familyId)) throw new Error(`Fehlender Beleg für ${scope}: ${familyId}/${personId}`);
    return addFamilyPerson(record, person, name, undefined, `stammbaum/${familyId}/${personId}`);
  }
  for (const [familyId, personId, name, detail] of PERSONAL_SERVICE[scope] || []) {
    admit(exactPerson(familyId, personId, name), familyId === ownId ? 'house' : 'service', directory.get(familyId).name, detail);
  }
  const rulerId = addNamedMember(scope, ruler, 'ritterfuerst');
  const offices = Object.fromEntries(Object.entries(council.offices).map(([area, official]) => {
    const member = members.find(item => item.office === official.title);
    if (!member || official.name !== (isNamed(member.name) ? member.name : '')) throw new Error(`Ratsregister abgleichen: ${scope}/${area}`);
    const identity = regionalIdentities[`${scope}/${area}`];
    const worldPersonId = regionalWorldIds[`${scope}/${area}`];
    const archive = worldPersonId && almanac.index.get(worldPersonId);
    const family = identity?.[0] || member.familyId;
    const id = identity ? exactPerson(...identity, member.name) : addNamedMember(scope, {
      ...member, imageSrc: official.portrait, worldPersonId, ...(archive ? { href: almanacHref(archive.id) } : {}),
    }, area);
    admit(id, family === ownId ? 'house' : 'service', directory.get(family)?.name || '', 'Belegtes Ratsamt');
    return [area, { title: official.title, holder: id, ...(member.note ? { note: member.note } : {}) }];
  }));
  const contacts = vassalGroups.flatMap(group => group.members).map(member => {
    const id = addNamedMember(scope, member, `ort/${normalizePersonName(member.seat).replace(/ /g, '-')}`);
    admit(id, 'service', directory.get(member.familyId)?.name || '', `${member.office} · ${member.seat}`);
    return { id, title: member.office, seat: member.seat, note: TERRITORIAL_NAME_NOTES[`${scope}/${member.seat}`] || member.note };
  });
  const staff = (STAFF[scope] || []).map(([area, slot, familyId, personId, name]) => {
    const holder = exactPerson(familyId, personId, name);
    if (!candidates.has(holder)) throw new Error(`Fehlende Dienstbindung: ${scope}/${slot}`);
    return { area, slot, holder };
  });
  const court = courts[scope].offices.map(({ role, name, id, familyId, image, detail }) => {
    const note = COURT_NAME_NOTES[`${scope}/${role}`];
    if (isNamed(name) && !note) {
      const type = houseOfficeFor(role)?.id || geographicKey(role);
      const slot = type === 'hofmeister' ? 'leitung' : type;
      const holder = id && familyId ? exactPerson(familyId, id, name) : addNamedMember(scope, { name, imageSrc: image }, `hof/${slot}`);
      admit(holder, familyId === ownId ? 'house' : 'service', directory.get(familyId)?.name || '', 'Belegtes Hofamt');
      staff.push({ area: 'hof', slot, holder });
    }
    return { role, ...((note || detail) ? { note: note || detail } : {}) };
  });
  return {
    ...profile, name: own.name, title: territory.name, crest: own.emblem, href: council.href, ruler: rulerId,
    offices, court, contacts, staff, enrolled: enrolled.filter(item => item.id !== ownId).sort(byName),
    places: localPlaces(geography.domain, profile.preparation),
    candidates: [...candidates.values()],
  };
}

function almanacHref(id) {
  return `/AleriaAlmanach/AleriaAlmanach.html?character=${encodeURIComponent(id)}`;
}

function addAlmanacPerson(scope, character) {
  const worldId = character.identity?.worldPersonId;
  const href = character.referenceHref || almanacHref(character.id);
  const known = worldId && FAMILY_REGISTRY.flatMap(record => record.family.persons
    .filter(person => person.worldPersonId === worldId && isLiving(person)).map(person => ({ record, person })));
  if (known?.length) {
    const { record, person } = known.find(entry => houseKey(entry.record.id) === houseKey(entry.person.houseId)) || known[0];
    const id = addFamilyPerson(record, person, character.name);
    const previous = people.get(id);
    people.set(id, { ...previous, almanacHref: href });
    return id;
  }
  return addNamedMember(scope, {
    name: character.name, worldPersonId: worldId || `almanach/${character.id}`,
    imageSrc: character.portrait, sex: character.genealogy?.sex || character.identity?.sex, href,
  }, character.id);
}

const houses = CENYR_ADMINISTRATION_SCOPES.filter(scope => scope.rank !== 'county').map(addHouse);
const countyProfile = CENYR_ADMINISTRATION_SCOPES.find(scope => scope.rank === 'county');
const county = {
  ...countyProfile,
  ...await buildCountyRoster({
    territories, families, registry, houseScopes: houses, isLiving, ownFamilyMembers, addFamilyPerson, addNamedMember, portraitUrl,
  }),
};
houses.splice(CENYR_ADMINISTRATION_SCOPES.indexOf(countyProfile), 0, county);
for (const house of houses) {
  for (const { area, slot, character, note, site, title } of almanac.appointments[house.id] || []) {
    const holder = addAlmanacPerson(house.id, character);
    house.staff.push({ area, slot, holder, ...(note ? { note } : {}), ...(site ? { site } : {}), ...(title ? { title } : {}) });
    if (!house.candidates.some(candidate => candidate.id === holder)) {
      house.candidates.push({ id: holder, kind: 'service', family: character.genealogy?.houseName || '', detail: 'Belegter Dienst laut Almanach' });
    }
  }
}
const assigned = new Set(houses.flatMap(house => house.candidates.map(person => person.id)));
const free = [...FREE_HOUSES].flatMap(id => {
  const record = registry.get(id);
  if (!directory.has(id) || record.houseProfile.liegeHouseId || record.houseProfile.liegeHouseName) {
    throw new Error(`Freien Bürgerpool erneut prüfen: ${id}`);
  }
  return ownFamilyMembers(record).filter(person => !assigned.has(person.worldPersonId) && !OTHER_SERVICE.has(`house-${houseKey(id)}/${person.id}`))
    .map(person => ({ id: addFamilyPerson(record, person), kind: 'free', family: directory.get(id).name }));
});
const tree = buildTreeCandidateIndex(FAMILY_REGISTRY, { isLiving, addFamilyPerson });
const projection = { year: ALERIA_CURRENT_YEAR, houses, free, tree, people: [...people.values()].sort(byName) };
const serialized = JSON.stringify(projection, null, 2) + '\n';
const nativeHouses = houses.map(({ candidates, enrolled, fiefContacts, ...house }) => house);
const nativeIds = new Set(houses.flatMap(house => [house.ruler, ...house.staff.map(slot => slot.holder),
  ...Object.values(house.offices).map(office => office.holder), ...house.contacts.map(contact => contact.id)]).filter(Boolean));
const nativePeople = [...nativeIds].sort().map(id => {
  const { name, portrait, href, almanacHref } = people.get(id);
  return { id, name, portrait, href, ...(almanacHref ? { almanacHref } : {}) };
});
const native = '// Generated by Vorschau/Herrschaftsverwaltung/scripts/build-roster.mjs\n'
  + `export const OFFICE_CAST = ${JSON.stringify({ houses: nativeHouses, people: nativePeople }, null, 2)};\n`;
const knownPeople = new Set(people.keys());
const kingdom = await buildKingdomPlanning({
  territories, families, houseEntries, legacyHouses: houses, legacyFree: free, people,
  registry, isLiving, ownFamilyMembers, portraitUrl, addFamilyPerson, addNamedMember, otherService: OTHER_SERVICE,
});
const additionalPeople = [...people.values()].filter(person => !knownPeople.has(person.id)).sort(byName);
const outputs = new Map([[output, serialized], [nativeOutput, native],
  [kingdomOutput, JSON.stringify({ ...kingdom, people: additionalPeople }, null, 2) + '\n']]);
if (process.argv.includes('--check')) {
  for (const [file, contents] of outputs) {
    if (!existsSync(file) || await readFile(file, 'utf8') !== contents) throw new Error(`Veraltete Verwaltungsdaten: ${file.pathname}`);
  }
} else {
  await Promise.all([...outputs].map(([file, contents]) => writeFile(file, contents, 'utf8')));
}
console.log(houses.map(house => `${house.name}: ${house.candidates.length}`).join(' · '), `· Bürgerpool: ${free.length} · Stammbäume: ${tree.length}`);
console.log(`${kingdom.counties.length} Grafschaften · ${kingdom.houses.length} zusätzliche Verwaltungen · ${additionalPeople.length} weitere Amtsfiguren`);
