import { listFamilyRecords } from '../../../../Stammbäume/assets/js/services/family-library.js';
import { createGitHubFamilyRepository } from '../../../../Stammbäume/assets/js/modules/github-publication/github-family-repository.js';
import { mergePublishedRegistryRecords } from '../../../../Stammbäume/assets/js/modules/family-registry/published-registry-merge.js';
import { buildFamilyPersonDisplayName } from '../../../../js/world-identity/family-person-names.js';

const treeRoot = new URL('../../../../Stammbäume/', import.meta.url);

export function charactersFromRecords(records) {
  const people = new Map();
  for (const record of records) {
    const family = record.family;
    for (const person of family?.persons || []) {
      const identity = person.worldPersonId || `${record.id}:${person.id}`;
      const previous = people.get(identity);
      if (previous && (previous.src || !person.portrait)) continue;
      let src = '';
      try { src = person.portrait ? new URL(person.portrait, treeRoot).href : ''; } catch { /* placeholder */ }
      people.set(identity, {
        kind: 'character', src, name: buildFamilyPersonDisplayName(family, person),
        group: record.title || family.document?.title || '',
        familyId: record.id, personId: person.id,
      });
    }
  }
  return [...people.values()].sort((a, b) => a.name.localeCompare(b.name, 'de') || a.group.localeCompare(b.group, 'de'));
}

export async function loadCharacters() {
  const project = listFamilyRecords();
  const repository = createGitHubFamilyRepository({
    fetchRef: (url, options) => fetch(new URL(url, treeRoot), options),
  });
  let records = project;
  let incomplete = false;
  try {
    records = mergePublishedRegistryRecords(project, await repository.listPublishedRegistry());
    const queue = records.filter(record => record.source === 'github');
    await Promise.all(Array.from({ length: 6 }, async () => {
      while (queue.length) {
        const record = queue.shift();
        try {
          const published = await repository.loadPublished(record.publishedFamilyId || record.id);
          if (published?.family) record.family = published.family;
          else incomplete = true;
        } catch { incomplete = true; }
      }
    }));
  } catch { incomplete = true; }
  return { items: charactersFromRecords(records), incomplete };
}
