import { BESTIARY_PROFILES } from './catalog/bestiary-profile-index.js?v=20261012-carreg-v1';

const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('de').replace(/[^a-z0-9]+/g, ' ').trim();
const aliases = { ponter: ['pontar'] }; // Historical spelling in existing companion records.
const profiles = BESTIARY_PROFILES.map(profile => {
  const slug = profile.id.split('/').at(-1);
  return { ...profile, names: [...new Set([profile.name, slug, ...(aliases[slug] || [])].map(normalize))] };
});

export function isHumanCreature(creature = {}) {
  return /(?:^| )(?:mensch|menschen|human)(?: |$)/.test(normalize(creature.species))
    || normalize(creature.classification?.genus) === 'menschen';
}

export function resolveCreatureBestiaryReference(creature = {}) {
  if (isHumanCreature(creature)) return null;
  const species = ` ${normalize(creature.species)} `;
  if (!species.trim()) return null;
  const genus = normalize(creature.classification?.genus);
  const matches = profiles.filter(profile => (!genus || !profile.genus || genus === normalize(profile.genus))
    && profile.names.some(name => name && species.includes(` ${name} `)));
  // Never guess between different species in a crossbreed or an ambiguous name.
  const explicit = matches.find(profile => profile.id === creature.bestiaryReference?.id);
  const selected = explicit || (matches.length === 1 ? matches[0] : null);
  return selected ? { id: selected.id, name: selected.name, url: selected.url || `/Bestiarium/${selected.id}/index.html` } : null;
}
