import { BESTIARY_PROFILES } from './catalog/bestiary-profile-index.js?v=20261013-draig-breeds-v2';

const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('de').replace(/[^a-z0-9]+/g, ' ').trim();
const aliases = { ponter: ['pontar'] }; // Historical spelling in existing companion records.
const profiles = BESTIARY_PROFILES.map(profile => {
  const slug = profile.id.split('/').at(-1);
  return { ...profile, names: [...new Set([profile.name, slug, ...(aliases[slug] || [])].map(normalize))] };
});

function findProfileNameMatches(species, profile) {
  return profile.names.flatMap(name => {
    if (!name) return [];
    const matches = [];
    let offset = species.indexOf(` ${name} `);
    while (offset !== -1) {
      matches.push({ start: offset + 1, end: offset + 1 + name.length });
      offset = species.indexOf(` ${name} `, offset + 1);
    }
    return matches;
  });
}

export function isHumanCreature(creature = {}) {
  return /(?:^| )(?:mensch|menschen|human)(?: |$)/.test(normalize(creature.species))
    || normalize(creature.classification?.genus) === 'menschen';
}

export function resolveCreatureBestiaryReference(creature = {}) {
  if (isHumanCreature(creature)) return null;
  const species = ` ${normalize(creature.species)} `;
  if (!species.trim()) return null;
  const genus = normalize(creature.classification?.genus);
  const candidates = profiles.filter(profile => !genus || !profile.genus || genus === normalize(profile.genus))
    .map(profile => ({ profile, spans: findProfileNameMatches(species, profile) }))
    .filter(candidate => candidate.spans.length);
  // A full named breed such as Edel Rhyfel supersedes its embedded base name.
  // Separate names in a mixed lineage remain ambiguous and are never guessed.
  const matches = candidates.filter(candidate => candidate.spans.some(span => !candidates.some(other => other !== candidate
    && other.spans.some(longer => longer.start <= span.start && longer.end >= span.end
      && (longer.start < span.start || longer.end > span.end))))).map(candidate => candidate.profile);
  // Never guess between different species in a crossbreed or an ambiguous name.
  const explicit = matches.find(profile => profile.id === creature.bestiaryReference?.id);
  const selected = explicit || (matches.length === 1 ? matches[0] : null);
  return selected ? { id: selected.id, name: selected.name, url: selected.url || `/Bestiarium/${selected.id}/index.html` } : null;
}

// An uncertain mixed lineage refers to its reported ancestors, never to a new breed.
// Only explicitly supplied, matching real profiles are accepted; URLs are canonical.
export function resolveCreatureBestiaryAncestry(creature = {}) {
  if (isHumanCreature(creature)) return null;
  const source = creature.bestiaryAncestry;
  if (!source || !Array.isArray(source.references)) return null;
  const species = ` ${normalize(creature.species)} `;
  const genus = normalize(creature.classification?.genus);
  const ids = new Set(source.references.slice(0, 8).map(reference => reference?.id));
  const references = profiles.filter(profile => ids.has(profile.id)
    && (!genus || !profile.genus || genus === normalize(profile.genus))
    && profile.names.some(name => name && species.includes(` ${name} `)))
    .map(profile => ({ id: profile.id, name: profile.name, url: profile.url || `/Bestiarium/${profile.id}/index.html` }));
  return references.length ? { references, notes: String(source.notes || '').trim().slice(0, 1200) } : null;
}
