import { readFileSync } from 'node:fs';

/** Add reviewed local illustrations while preserving existing project provenance. */
export function appendLocalIllustrations(root, entries, add, selection = {}) {
  const sourcePath = 'Gallerien/krieger/data/local-source-review.json';
  const imported = JSON.parse(readFileSync(new URL('Gallerien/krieger/data/local-images.json', root), 'utf8'));
  const reviewedPrimaries = new Map((selection.localGroupPrimaries || []).map(primary => [primary.group, primary]));
  for (const group of imported.groups) {
    const reviewed = reviewedPrimaries.get(group.key);
    let entry = reviewed ? [...entries.values()].find(image => image.copies.includes(reviewed.file))
      : group.existingId ? [...entries.values()].find(image => image.id === group.existingId) : null;
    if (reviewed && !entry) throw new Error(`Geprüfte Originaldarstellung fehlt: ${reviewed.file}`);
    // Preserve existing gallery links and saved assignments when an archived WebP
    // is reunited with its now directly used original. Clan identity comes from
    // the canonical house content, not the older filename-based archive guesses.
    if (reviewed?.legacyId) entry.id = reviewed.legacyId;
    if (group.existingId && !entry) throw new Error(`Belegtes Motiv fehlt: ${group.existingId}`);
    if (!entry) {
      const primary = group.variants[0];
      entry = add({ file: primary.image, name: group.name, category: group.category, affiliation: group.affiliation, note: group.note });
      for (const houseId of group.houseIds) add({ file: primary.image, houseId });
      entry.thumbnail = primary.thumbnail;
    }
    entry.collection = group.collection;
    if (!entry.thumbnail) entry.thumbnail = group.variants[0].thumbnail;
    entry.variants = [{ image: entry.image, label: reviewed ? 'Geliefertes Original' : group.existingId ? 'Im Projekt verwendete Fassung' : group.variants[0].label }, ...group.variants.filter(variant => variant.image !== entry.image)];
    for (const variant of group.variants) {
      for (const file of variant.sourceFiles) entry.sources.push({ path: sourcePath, label: file, sourceSha256: variant.sourceSha256 });
    }
    entry.localGroup = group.key;
  }
}
