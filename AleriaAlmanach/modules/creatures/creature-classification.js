import { HORSE_PROFILE_IDS } from '../../../Bestiarium/modules/horse-profile/horse-profile-registry.mjs';
import { DOG_PROFILE_IDS } from '../../../Bestiarium/modules/dog-profile/dog-profile-registry.mjs';
import { CAT_PROFILE_IDS } from '../../../Bestiarium/modules/cat-profile/cat-profile-registry.mjs';
import { HORSE_BREEDING_LORE_CROSSINGS } from '../../../Bestiarium/modules/horse-breeding/horse-breeding-registry.mjs';

// Register placement is independent of a creature's descriptive habitat.
const text = value => String(value || '').trim().slice(0, 160);
const BREEDS = [
  ['Pferde', [...HORSE_PROFILE_IDS, ...HORSE_BREEDING_LORE_CROSSINGS.map(entry => entry.name)]], ['Hunde', DOG_PROFILE_IDS], ['Katzen', CAT_PROFILE_IDS]
];
const breedKey = value => ` ${text(value).toLocaleLowerCase('de').replaceAll('ä', 'ae').replaceAll('ö', 'oe').replaceAll('ü', 'ue').replaceAll('æ', 'ae')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()} `;

export function inferCreatureGenus(creature = {}) {
  const species = text(creature.species).toLocaleLowerCase('de');
  if (/\bmensch(?:en)?\b/.test(species)) return 'Menschen';
  if (/pferd|hengst|stute|pony/.test(species)) return 'Pferde';
  if (/hund|hünd/.test(species)) return 'Hunde';
  if (/katze/.test(species)) return 'Katzen';
  const normalized = breedKey(species);
  for (const [genus, ids] of BREEDS) if (ids.some(id => normalized.includes(breedKey(id)))) return genus;
  if (/milan|rabe|eule|pfau|vogel|falke|adler/.test(species)) return 'Vögel';
  if (/wolf|wölfe|gramnir/.test(species)) return 'Wölfe';
  if (/troll/.test(species)) return 'Trolle';
  return text(creature.type) || 'Weitere Kreaturen';
}

export function normalizeCreatureClassification(value = {}) {
  return { genus: text(value?.genus), location: text(value?.location), house: text(value?.house) };
}

export function getCreatureClassification(creature = {}) {
  const saved = normalizeCreatureClassification(creature.classification);
  const draig = /Draig/i.test(`${creature.id || ''} ${creature.itemOrigin?.ownerCharacterName || ''} ${creature.habitat || ''}`)
    || ['companion-tanor', 'companion-uath'].includes(creature.id);
  return {
    genus: saved.genus || inferCreatureGenus(creature),
    location: saved.location || (draig ? 'Celtigerns Wacht' : /Brandheide/i.test(creature.habitat || '') ? 'Brandheide'
      : /Hornhall/i.test(creature.habitat || '') ? 'Hornhall' : 'Ohne Ortszuordnung'),
    house: saved.house || (draig && inferCreatureGenus(creature) === 'Menschen' ? 'Haus Draig' : 'Ohne Hauszuordnung')
  };
}

const compare = (a, b) => a.label.localeCompare(b.label, 'de', { numeric: true });

export function buildCreatureGroupTree(creatures = []) {
  const roots = new Map();
  for (const creature of creatures) {
    const placement = getCreatureClassification(creature);
    const path = [placement.genus, placement.location];
    if (placement.genus === 'Menschen') path.push(placement.house);
    let siblings = roots;
    path.forEach((label, index) => {
      const key = label.toLocaleLowerCase('de');
      if (!siblings.has(key)) siblings.set(key, { label, path: JSON.stringify(path.slice(0, index + 1)), count: 0, children: new Map(), creatures: [] });
      const node = siblings.get(key);
      node.count++;
      if (index === path.length - 1) node.creatures.push(creature);
      siblings = node.children;
    });
  }
  const finish = nodes => [...nodes.values()].sort(compare).map(node => ({ ...node,
    children: finish(node.children), creatures: node.creatures.sort((a, b) => a.name.localeCompare(b.name, 'de', { numeric: true }))
  }));
  return finish(roots);
}
