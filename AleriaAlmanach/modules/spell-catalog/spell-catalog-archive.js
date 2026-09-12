import { createCatalogSpell, listSpellCatalogEntries } from './spell-catalog.js';
import { listSpellCatalogSchools } from './spell-catalog-schools.js';

export function buildSpellCatalogArchiveEntries() {
  return listSpellCatalogSchools().flatMap(school => listSpellCatalogEntries({ catalog: school.id })).map(entry => {
    const data = createCatalogSpell(entry.id, { revision: entry.revision });
    return {
      id: `catalog--${entry.id}--v${entry.revision}`, kind: 'spell', name: entry.name,
      description: data.description, data, icon: data.icon, iconAssignmentVersion: 1,
      tags: [entry.school, data.tags, `Grad ${entry.level}`, `Fassung ${entry.revision}`],
      sources: [{ kind: 'spell-catalog', id: entry.id, name: `${entry.school} · Zauberkatalog` }],
      builtin: true
    };
  });
}
