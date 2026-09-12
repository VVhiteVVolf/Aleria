import { entryPagePath, entrySymbolPath } from '../../../Religionen/modules/content/content-repository.mjs';
import { MAGIC_DOMAIN_ASSIGNMENTS, MAGIC_DOMAIN_CIRCLES } from './magic-domain-assignments.mjs';

export function getMagicDomainCircles(catalog, assignments = MAGIC_DOMAIN_ASSIGNMENTS) {
  const used = new Set();
  const circles = MAGIC_DOMAIN_CIRCLES.map(circle => {
    const collection = catalog.collections.find(item => item.id === circle.collectionId);
    if (!collection) throw new Error(`Götterkreis fehlt: ${circle.collectionId}`);
    const groups = circle.groups.map(groupId => {
      const sourceGroup = collection.groups.find(group => group.id === groupId);
      if (!sourceGroup) throw new Error(`Göttergruppe fehlt: ${groupId}`);
      const entries = sourceGroup.memberIds.map(id => {
        const deity = catalog.entries.find(entry => entry.id === id);
        const assignment = assignments[id];
        if (!deity?.page || !assignment?.domain?.trim() || !assignment?.aspect?.trim()) {
          throw new Error(`Gottheit ohne vollständige Domänenzuordnung: ${id}`);
        }
        if (used.has(id)) throw new Error(`Doppelte Domänenzuordnung: ${id}`);
        used.add(id);
        return { id, name: deity.title, epithet: deity.epithet || '', kind: deity.kind,
          href: `../${entryPagePath(deity)}`,
          symbol: circle.useDeitySymbols && deity.symbol ? `../${entrySymbolPath(deity)}` : null,
          ...assignment };
      });
      return { id: `${circle.id}-${groupId}`, title: sourceGroup.title, entries };
    });
    return { ...circle, groups, count: groups.reduce((sum, group) => sum + group.entries.length, 0) };
  });
  for (const id of Object.keys(assignments)) {
    if (!used.has(id)) throw new Error(`Domäne ohne Gottheit im gewählten Götterkreis: ${id}`);
  }
  return circles;
}
