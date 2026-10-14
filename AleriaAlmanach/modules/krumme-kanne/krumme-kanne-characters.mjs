import { KANNE_PEOPLE } from './krumme-kanne-roster.mjs';
import { KANNE_HOUSE_FAMILIES } from '../../../Stammbäume/assets/js/data/krumme-kanne-families.js';
import { HOUSE_TONNARTH_FAMILY } from '../../../Stammbäume/assets/js/data/house-tonnarth-family.js';
import { createFamilyCandidates, buildImportedCharacter } from '../character-genealogy/genealogy-mapping.js';

export const KANNE_CHARACTER_GROUP = 'Die Krumme Kanne';
const families = [...KANNE_HOUSE_FAMILIES, HOUSE_TONNARTH_FAMILY];
const candidates = families.flatMap(family => createFamilyCandidates({
  id: family.document.id, title: family.document.title, family,
  folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwynthor', 'Bürgerliche'], source: 'github'
}));
const portrait = p => p.portrait || `./assets/krumme-kanne/${['merrik', 'hrolf', 'aedan'].includes(p.id) ? 'references' : 'portraits'}/${p.id}.png`;

function personCandidates(person) {
  const matches = candidates.filter(c => c.recordedName === person.name);
  if (new Set(matches.map(c => c.worldPersonId)).size > 1) throw new Error(`Mehrdeutige Kanne-Identität: ${person.name}`);
  return matches;
}

function blankCandidate(person) {
  return { worldPersonId: `person--krumme-kanne--${person.id}`, displayName: person.name,
    title: person.role, sex: person.sex, status: 'alive', birth: String(person.birth), death: '',
    houseId: '', houseName: '', tags: [], relationships: { parents: [], partners: [], children: [] }, folderPath: [] };
}

function mergeFamilySources(existing, links, now) {
  let sources = existing.genealogy?.sources || [];
  for (const candidate of links) {
    const source = sources.find(s => s.familyId === candidate.familyId && s.personId === candidate.personId);
    if (source?.fingerprint === candidate.fingerprint) continue;
    sources = buildImportedCharacter(candidate, { ...existing, genealogy: { ...existing.genealogy, sources } }, now).genealogy.sources;
  }
  return sources;
}

// Publication consumes this pure plan; rendering never creates or updates profiles.
// Existing characters receive source links only. Their own profile and live data win.
export function planKanneCharacters(existingCharacters, config, now = new Date().toISOString()) {
  const existing = Array.isArray(existingCharacters) ? existingCharacters : [];
  const entries = KANNE_PEOPLE.map(person => {
    const links = personCandidates(person);
    const candidate = links[0] || blankCandidate(person);
    const matches = existing.filter(c => c.id === candidate.worldPersonId || (c.identity?.worldPersonId || c.genealogy?.worldPersonId) === candidate.worldPersonId);
    if (matches.length > 1) throw new Error(`Doppelte Online-Identität: ${person.name}`);
    const prior = matches[0];
    const priorIdentity = prior?.identity?.worldPersonId || prior?.genealogy?.worldPersonId;
    if (priorIdentity && priorIdentity !== candidate.worldPersonId) throw new Error(`Widersprüchliche Online-Identität: ${person.name}`);
    const id = prior?.id || candidate.worldPersonId;
    const ownFamily = links.find(c => c.houseId && c.familyId === c.houseId.replace('house-', 'haus-'));
    const primary = person.id === 'mair' ? links.find(c => c.familyId === 'haus-dubhdarach') : ownFamily || links[0];
    const group = primary?.familyTitle.replace(/^Haus /, '') || 'Angestellte';
    if (prior) {
      const sources = mergeFamilySources(prior, links, now);
      const patch = JSON.stringify(sources) === JSON.stringify(prior.genealogy?.sources || []) ? null : { genealogy: { sources }, updatedAt: now };
      return { id, key: person.id, group, create: false, patch };
    }
    if (existing.some(c => c.id === id)) throw new Error(`Belegte Online-ID: ${id}`);
    let data = buildImportedCharacter(primary || candidate, null, now);
    data.genealogy.sources = [];
    data.genealogy.sources = mergeFamilySources(data, links, now);
    Object.assign(data, {
      name: person.name, title: person.role, role: person.role, bio: person.biography,
      fraktion: KANNE_CHARACTER_GROUP, currentLocation: 'Gwynthor · Die Krumme Kanne',
      origin: person.culture, relevance: 'minor', portrait: portrait(person)
    });
    return { id, key: person.id, group, create: true, data };
  });
  const tabs = [...(config.tabs || [])];
  if (!tabs.includes(KANNE_CHARACTER_GROUP)) tabs.push(KANNE_CHARACTER_GROUP);
  const add = (before, ids) => [...new Set([...(before || []), ...ids])];
  const grouped = Object.groupBy(entries, entry => entry.group);
  const groups = Object.keys(grouped);
  const subtabMap = { ...config.subtabMap, [KANNE_CHARACTER_GROUP]: { ...config.subtabMap?.[KANNE_CHARACTER_GROUP] } };
  for (const group of groups) subtabMap[KANNE_CHARACTER_GROUP][group] = add(subtabMap[KANNE_CHARACTER_GROUP][group], grouped[group].map(e => e.id));
  return { entries, config: {
    tabs, map: { ...config.map, [KANNE_CHARACTER_GROUP]: add(config.map?.[KANNE_CHARACTER_GROUP], entries.map(e => e.id)) },
    subtabs: { ...config.subtabs, [KANNE_CHARACTER_GROUP]: add(config.subtabs?.[KANNE_CHARACTER_GROUP], groups) }, subtabMap
  } };
}
