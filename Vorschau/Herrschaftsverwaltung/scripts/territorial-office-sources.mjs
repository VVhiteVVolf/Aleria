import { existsSync } from 'node:fs';
import { buildFamilyPersonDisplayName } from '../../../js/world-identity/family-person-names.js';
import { normalizePersonName } from '../../../js/world-identity/person-identity.js';
import { isPersonRecordedDead } from '../../../Stammbäume/assets/js/domain/person-life-state.js';
import { completeHouseOffices, namedOfficeHolder, partitionHouseCourtEntries } from '../../../Familien Häuser und Clans/modules/court/house-court-model.mjs';
import { indexCourtEntries } from '../../../shared/cenyr-administration/court-plan.mjs';
import { rulerSuffix } from '../../../shared/cenyr-administration/scopes.mjs';

const offices = [
  ['militaer', /^marschall/u, 'Marschall'],
  ['finanzen', /^kammerer/u, 'Kämmerer'],
  ['gerichtsbarkeit', /^justiziar/u, 'Justiziar'],
  ['spionage', /^schatten/u, 'Schatten'],
  ['diplomatie', /^herold/u, 'Herold'],
  ['magie', /^(ratsmagier|hochmagier|erzmagier|ratszauberer)/u, 'Ratsmagier'],
  ['klerus', /^(vikar|diakon|(?:erz)?patriarch|matriarch|pralat)/u, 'Vikar'],
  ['unterhaltung', /^bard[ei]/u, 'Barde'],
];
const additionalOffices = [
  ['ratskanzlei', /^ratskanzler/u],
  ['ratsberatung', /^berater/u],
  ['regentschaft', /^regent/u],
];
const titleEndings = / des (Baron|Ritterfürst)$/u;
const titleForms = { Baron: 'Barons', 'Ritterfürst': 'Ritterfürsten' };

export function readCouncilOffices(rank, members, admit) {
  const sources = new Map();
  for (const member of members) {
    const title = normalizePersonName(member.office);
    const area = [...offices, ...additionalOffices].find(([, pattern]) => pattern.test(title))?.[0];
    if (!area) throw new Error(`Unbekanntes Ratsamt: ${member.office}`);
    if (sources.has(area)) throw new Error(`Mehrdeutiges Ratsamt: ${member.office}`);
    sources.set(area, member);
  }
  return Object.fromEntries([...offices, ...additionalOffices.filter(([area]) => sources.has(area))]
    .map(([area, , title]) => {
      const member = sources.get(area);
      const properTitle = member?.office.replace(titleEndings, (_match, ending) => ` des ${titleForms[ending]}`);
      const sourceTitle = area === 'klerus' && !namedOfficeHolder(member?.name) && /^Diakon\b/u.test(properTitle || '') ? '' : properTitle;
      return [area, { title: sourceTitle || `${title} ${rulerSuffix({ rank })}`, holder: member ? admit(member, area) : null }];
    }));
}

const familyRoot = '/Familien Häuser und Clans/';
const familyBase = new URL(`../../..${familyRoot}`, import.meta.url);

export async function readHouseContent(house) {
  if (!house?.data) return null;
  const url = new URL(house.data, familyBase);
  const content = new URL('haus.content.mjs', url);
  return existsSync(content) ? (await import(content.href)).HOUSE_CONTENT : null;
}

export function readCourtOffices(content, admit) {
  const { offices: authored } = partitionHouseCourtEntries(content?.offices);
  const indexed = indexCourtEntries(completeHouseOffices(authored, true));
  const staff = indexed.flatMap(({ entry, id, type }) => {
    const slot = type === 'hofmeister' ? 'leitung' : id;
    const image = entry.imageSrc || entry.portrait || entry.image;
    const imageSrc = image?.startsWith('Estryll/') ? familyRoot + image : image;
    const holder = admit({ ...entry, imageSrc }, `hof/${slot}`, content?.id);
    return holder ? [{ area: 'hof', slot, holder }] : [];
  });
  return { court: authored.map(({ role, detail }) => ({ role, ...(detail ? { note: detail } : {}) })), staff };
}

function personNames(record, person) {
  return [person.name, buildFamilyPersonDisplayName(record.family, person)].map(normalizePersonName);
}

// A source without a family or person ID also needs a matching source portrait.
export function createTerritorialPersonReader({ registry, isLiving, addFamilyPerson, addNamedMember, portraitUrl, familyId }) {
  const byName = new Map();
  for (const record of registry.values()) {
    for (const person of record.family.persons) {
      for (const name of new Set(personNames(record, person))) {
        const matches = byName.get(name) || [];
        matches.push({ record, person });
        byName.set(name, matches);
      }
    }
  }
  function sourceLink(member) {
    if (!member.href) return new URLSearchParams();
    return new URL(member.href, 'https://aleria.invalid/').searchParams;
  }
  const stableId = ({ record, person }) => person.worldPersonId || `stammbaum/${record.id}/${person.id}`;

  return (scope, member, key, homeHouse) => {
    if (!namedOfficeHolder(member.name)) return null;
    const link = sourceLink(member);
    const explicitFamily = familyId(member.familyId || link.get('family'));
    const authorFamily = explicitFamily || familyId(homeHouse);
    const local = registry.get(authorFamily);
    const personId = link.get('person') || member.id;
    const explicit = personId && local?.family.persons.find(person => person.id === personId);
    const matches = byName.get(normalizePersonName(member.name)) || [];
    const rawPortrait = member.imageSrc || member.portrait || member.image;
    const imageSrc = portraitUrl(rawPortrait?.replace(/^(?:\.\.\/)+(Stammbäume\/)/u, '/$1'));
    const relevant = matches.filter(({ record, person }) => authorFamily
      ? record.id === authorFamily : imageSrc && portraitUrl(person.portrait) === imageSrc);
    const unique = new Map(relevant.map(match => [stableId(match), match]));
    const resolved = explicit ? { record: local, person: explicit } : unique.size === 1 ? unique.values().next().value : null;
    if (resolved && isLiving(resolved.person)) {
      const { record, person } = resolved;
      return { id: addFamilyPerson(record, person, undefined, undefined, stableId(resolved)), familyId: record.id, eligible: true };
    }
    const id = addNamedMember(scope, { name: member.name, imageSrc: imageSrc || rawPortrait, href: member.href }, key);
    return id ? { id, familyId: explicitFamily || authorFamily, eligible: !resolved || !isPersonRecordedDead(resolved.person) } : null;
  };
}
