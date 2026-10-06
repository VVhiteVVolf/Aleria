import { readFileSync } from 'node:fs';

/** Add reviewed local illustrations while preserving existing project provenance. */
export function appendLocalIllustrations(root, entries, add) {
  const sourcePath = 'Gallerien/krieger/data/local-source-review.json';
  const imported = JSON.parse(readFileSync(new URL('Gallerien/krieger/data/local-images.json', root), 'utf8'));
  for (const group of imported.groups) {
    let entry = group.existingId ? [...entries.values()].find(image => image.id === group.existingId) : null;
    if (group.existingId && !entry) throw new Error(`Belegtes Motiv fehlt: ${group.existingId}`);
    if (!entry) {
      const primary = group.variants[0];
      entry = add({ file: primary.image, name: group.name, category: group.category, affiliation: group.affiliation, note: group.note });
      for (const houseId of group.houseIds) add({ file: primary.image, houseId });
      entry.thumbnail = primary.thumbnail;
    }
    entry.collection = group.collection;
    entry.variants = [{ image: entry.image, label: group.existingId ? 'Im Projekt verwendete Fassung' : group.variants[0].label }, ...group.variants.filter(variant => variant.image !== entry.image)];
    for (const variant of group.variants) {
      for (const file of variant.sourceFiles) entry.sources.push({ path: sourcePath, label: file, sourceSha256: variant.sourceSha256 });
    }
    entry.localGroup = group.key;
  }
}
