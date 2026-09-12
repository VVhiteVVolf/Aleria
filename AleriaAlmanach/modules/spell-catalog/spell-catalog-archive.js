import { createCatalogSpell, listSpellCatalogEntries } from './spell-catalog.js';

export function buildSpellCatalogArchiveEntries() {
  return listSpellCatalogEntries().map(entry => {
    const data = createCatalogSpell(entry.id, { revision: entry.revision });
    return {
      id: `catalog--${entry.id}--v${entry.revision}`, kind: 'spell', name: entry.name,
      description: data.description, data, icon: data.icon, iconAssignmentVersion: 1,
      tags: ['Elementarismus', data.tags, `Grad ${entry.level}`, `Fassung ${entry.revision}`],
      sources: [{ kind: 'spell-catalog', id: entry.id, name: 'Elementarismus · Zauberkatalog' }],
      builtin: true
    };
  });
}
