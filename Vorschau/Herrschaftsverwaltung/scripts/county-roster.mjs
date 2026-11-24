import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { buildFamilyPersonDisplayName } from '../../../js/world-identity/family-person-names.js';
import { normalizePersonName } from '../../../js/world-identity/person-identity.js';
import { houseOfficeFor } from '../../../Familien Häuser und Clans/modules/court/house-office-catalog.mjs';
import { HOUSE_CONTENT } from '../../../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Haus_Draig/haus.content.mjs';
import { EUDDOGWY } from '../../../AleriaAlmanach/modules/gwynthor-cathedral/patriarch-adjutant.mjs';
import { countyAreas, countyLeadershipRole, countyVikars } from '../../../shared/cenyr-administration/county-reference.mjs';
import { territorialContacts } from '../../../Kontinente/modules/administration/data/celtigerns-vassals.generated.mjs';

const countyId = 'grafschaft-celtigerns-wacht';
const familyId = 'haus-draig';
const inactivePlaces = new Set(['Ruine', 'Taverne', 'Höhle', 'Schiffswrack']);
const placeSource = new URL('../../../js/world-content/celtigerns-wacht-places.js', import.meta.url);
// Reviewed office names and aliases in the county identity audit dated 2026-11-07.
const namedFamilyLinks = {
  'gerichtsbarkeit/adjutant': ['haus-draig', 'neithon-1718-draig'],
  'gerichtsbarkeit/gerichte': ['haus-draig', 'ceridwen-draig'],
  'finanzen/kasse': ['haus-draig', 'wynonna-fiachrach'],
  'finanzen/abgaben': ['haus-draig', 'beibhinn-eirce'],
  'diplomatie/adjutant': ['haus-draig', 'branwen-gwefrydd'],
  'diplomatie/gesandtschaft': ['haus-wyrm', 'neala-wylan'],
  'diplomatie/verbindung': ['haus-swyll', 'iestyn-swyll'],
  'diplomatie/zeichen': ['haus-draenmelyn', 'rhiannon-draenmelyn'],
  'magie/haushaelt': ['haus-awenydd', 'rhoswyn-penwyn'],
  'unterhaltung/leitung': ['haus-draig', 'rihanna-ceirwynn'],
  'unterhaltung/adjutant': ['haus-draig', 'isobel-1719-draig'],
  'hof/handwerk': ['haus-awenydd', 'ruarc-balguen'],
};
const contextualIdentities = {
  'klerus/klerus-sekretaer': {
    worldPersonId: EUDDOGWY.worldPersonId, sex: EUDDOGWY.sex, age: EUDDOGWY.age,
    href: '/AleriaAlmanach/AleriaAlmanach.html?entry=gwynthor-kathedrale-der-neun',
  },
  'klerus/klerus-gwendolyn': { worldPersonId: 'person--celtigerns-wacht--gwenydd-anghof' },
};
const officeDisplayNames = { 'militaer/niniane-chwedlonol': 'Niniane Chwedonol' };
const vicarScopes = {
  'klerus-arthus': 'arthus-streben', 'klerus-gwendolyn': 'gwendolyns-ufer', 'klerus-rhonwen': 'rhonwens-traenen',
};

async function countyPlaces() {
  const context = { window: {} };
  runInNewContext(await readFile(placeSource, 'utf8'), context, { filename: placeSource.pathname, timeout: 1000 });
  return context.window.ALERIA_CELTIGERNS_PLACES.definitions
    .filter(place => place.domain.name === 'Celtigerns Wacht' && !inactivePlaces.has(place.placeType))
    .map(({ name, placeType: type }) => ({ name, type }));
}

function familyLink(role) {
  if (role.familyId && role.id) return { family: role.familyId, person: role.id };
  for (const link of role.links || []) {
    if (!link.href) continue;
    const { searchParams } = new URL(link.href, 'https://aleria.invalid');
    if (searchParams.has('family') && searchParams.has('person')) {
      return { family: searchParams.get('family'), person: searchParams.get('person') };
    }
  }
  return null;
}

export async function buildCountyRoster({ territories, families, registry, houseScopes, isLiving, ownFamilyMembers, addFamilyPerson, addNamedMember, portraitUrl }) {
  const territory = territories.find(entry => entry.id === countyId);
  const directory = new Map(families.map(family => [family.id, family]));
  const own = directory.get(familyId);
  const indexed = [...registry.values()].filter(record => directory.has(record.id)).flatMap(record =>
    record.family.persons.filter(isLiving).map(person => ({
      record, person, name: normalizePersonName(buildFamilyPersonDisplayName(record.family, person)),
    })));
  const candidates = new Map();
  const admit = (id, kind, family, detail) => {
    if (id && !candidates.has(id)) candidates.set(id, { id, kind, family, ...(detail ? { detail } : {}) });
  };

  const enrolled = families.filter(family => family.id === familyId || family.profile.liegeHouseId === familyId)
    .map(family => {
      const { id, name, href } = family;
      const kind = id === familyId ? 'house' : family.profile.rankId === 'commoner' ? 'service' : 'knight';
      const record = registry.get(id);
      for (const person of record ? ownFamilyMembers(record) : []) admit(addFamilyPerson(record, person), kind, name);
      return { id, name, kind, href };
    }).filter(family => family.id !== familyId).sort((a, b) => a.name.localeCompare(b.name, 'de'));

  function addRole(role, key, direct = true) {
    if (!role.name) return null;
    const explicit = namedFamilyLinks[key];
    const link = explicit ? { family: explicit[0], person: explicit[1] } : familyLink(role);
    const portrait = role.portrait || role.image;
    const name = normalizePersonName(role.name);
    const exact = link && indexed.find(entry => entry.record.id === link.family && entry.person.id === link.person);
    if (link && !exact) throw new Error(`Fehlender lebender Amtsinhaber in Celtigerns Wacht: ${key} · ${link.family}/${link.person}`);
    const named = indexed.filter(entry => entry.name === name);
    const photo = portraitUrl(portrait);
    const corroborated = new Map(named.filter(entry => photo && portraitUrl(entry.person.portrait) === photo)
      .map(entry => [entry.person.worldPersonId, entry]));
    const resolved = exact || (corroborated.size === 1 ? corroborated.values().next().value : null);
    const displayName = officeDisplayNames[key] || role.name;
    const id = resolved ? addFamilyPerson(resolved.record, resolved.person, displayName, portrait)
      : addNamedMember('draig', { name: displayName, imageSrc: portrait, ...contextualIdentities[key] }, key);
    if (direct) admit(id, 'service', directory.get(resolved?.record.id)?.name || '', 'Belegtes Amt der Grafschaft');
    return id;
  }

  const ruler = addRole(HOUSE_CONTENT.heads.at(-1), 'graf');
  const staff = [];
  const offices = Object.fromEntries(Object.entries(countyAreas).map(([id, area]) => {
    const leadership = countyLeadershipRole(area);
    const holder = addRole(leadership, `${id}/leitung`);
    for (const role of area.groups.slice(1).filter(group => group.kind !== 'vassals').flatMap(group => group.roles)) {
      const person = addRole(role, `${id}/${role.id}`);
      if (person) staff.push({ area: id, slot: role.id, holder: person });
    }
    return [id, { title: leadership.title, holder }];
  }));
  const court = HOUSE_CONTENT.offices.map(entry => {
    const office = houseOfficeFor(entry.role);
    const id = addRole(entry, `hof/${office?.id || entry.role}`);
    if (office && id) staff.push({ area: 'hof', slot: office.id === 'hofmeister' ? 'leitung' : office.id, holder: id });
    return { role: entry.role };
  });
  const contacts = countyVikars.map(role => {
    const [title, seat] = role.title.split(' · ');
    const scope = houseScopes.find(house => house.id === (vicarScopes[role.id] || role.id.slice('klerus-'.length)));
    return {
      id: scope ? scope.offices.klerus.holder : addRole(role, `klerus/${role.id}`, false),
      title, seat, note: role.description, href: role.links?.[0]?.href, scope: scope?.id,
    };
  });
  const fiefContacts = territorialContacts.map(contact => ({
    id: addRole(contact, `lehenswarte/${contact.id}`),
    title: contact.title, seat: contact.jurisdiction.split(' · ', 1)[0], note: contact.description, href: contact.href,
  }));
  return {
    id: 'draig', county: true, name: own.name, title: territory.content.name, crest: own.emblem,
    href: encodeURI(`/Kontinente/${territory.page}`), ruler, offices, staff, court, contacts, fiefContacts, enrolled,
    places: await countyPlaces(), candidates: [...candidates.values()],
  };
}
