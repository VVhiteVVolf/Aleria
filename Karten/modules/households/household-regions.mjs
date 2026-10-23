import { householdSeatName, normalizePlace, matchesHouseholdMap } from './household-model.mjs';

const regionName = value => normalizePlace(value).replace(/^(?:herrschaft|oberherrschaft|thanentum|hesirentum)\s+(?:(?:von|der)\s+)?/, '');

// A regional directory is attached only to its proven administrative seat.
// It never turns unresolved regional membership into a residence in that city.
export function attachHouseholdRegions(groups, map, index, dominions = []) {
  return groups.map(group => {
    const dominion = dominions.find(item => item.id === group.pin.dominionId);
    if (!dominion?.seat || normalizePlace(householdSeatName(group.pin, dominions)) !== normalizePlace(dominion.seat)) return group;
    const name = regionName(dominion.name);
    const local = new Set(group.families.map(family => family.id));
    const allMembers = index.families.filter(family => family.territories?.some(territory => regionName(territory.name) === name && matchesHouseholdMap(territory, map)));
    const members = allMembers.filter(family => !local.has(family.id));
    if (!members.length) return group;
    const located = [], unresolved = [], former = [];
    for (const family of members) {
      if (family.status !== 'active') {
        former.push({ ...family, role: (family.status === 'extinct' ? 'Ausgestorben' : 'Entmachtet · kein anerkanntes Lehen') + (family.formerSeat ? ' · früher ' + family.formerSeat : '') });
        continue;
      }
      const residence = family.residences.find(residence => regionName(residence.territory) === name && matchesHouseholdMap(residence, map));
      const place = residence && groups.find(other => other.families.some(member => member.id === family.id));
      if (place) located.push({ ...family, role: `${residence.role}: ${residence.seat}` });
      else unresolved.push({ ...family, role: residence ? `${residence.seat} · noch keinem Kartenmarker zugeordnet` : 'Sitz noch nicht festgelegt' });
    }
    const sections = [
      { title: 'Weitere örtliche Zuordnungen', families: located },
      { title: 'Ortszuordnung noch offen', families: unresolved },
      { title: 'Ehemalige und entmachtete Häuser', families: former },
    ].filter(section => section.families.length);
    return { ...group, region: { name: dominion.name, count: members.length, total: allMembers.length, sections } };
  });
}
