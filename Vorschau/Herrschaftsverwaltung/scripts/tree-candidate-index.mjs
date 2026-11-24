// Project just what is needed to identify, find and filter an individual in the workbench.
export function buildTreeCandidateIndex(registry, { isLiving, addFamilyPerson }) {
  const houseKey = id => String(id || '').replace(/^(?:house|haus)-/u, '');
  const entries = new Map();
  for (const record of registry) {
    for (const person of record.family.persons.filter(isLiving)) {
      const id = addFamilyPerson(record, person, undefined, undefined, `stammbaum/${record.id}/${person.id}`);
      let entry = entries.get(id);
      if (!entry) {
        entry = { id, family: record.title, families: new Set(), regions: new Set() };
        entries.set(id, entry);
      }
      if (houseKey(person.houseId) === houseKey(record.id)) entry.family = record.title;
      entry.families.add(record.title);
      for (const region of record.folderPath) entry.regions.add(region);
    }
  }
  return [...entries.values()].map(({ id, family, families, regions }) => ({
    id, family,
    ...(families.size > 1 ? { families: [...families] } : {}),
    ...(regions.size ? { regions: [...regions] } : {}),
  }));
}
