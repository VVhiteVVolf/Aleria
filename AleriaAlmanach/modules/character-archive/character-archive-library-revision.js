import { normalizeCharacterArchiveEntry } from './character-archive-model.js';

const librarySources = entry => (entry.sources || []).filter(source => source.kind === 'character-library');

function isAutomaticLibraryEntry(entry) {
  return entry.builtin === true && librarySources(entry).length > 0
    && !entry.iconOverride && !entry.iconAssignmentVersion
    && !String(entry.id || '').startsWith('custom--');
}

// A successfully loaded, versioned source owns its generated rows. Historical
// automatic copies must not outlive a removed ability or keep superseded rules.
// Ambiguous/custom rows and explicit manual artwork remain user-owned; an
// offline/failed source load never authorizes retirement of cached entries.
export function reconcileCharacterArchiveLibraryEntries(entries = [], snapshot = {}) {
  if (!snapshot.libraryRevision) return entries;
  const current = new Map((snapshot.entries || []).filter(entry => librarySources(entry).length)
    .map(entry => [normalizeCharacterArchiveEntry(entry).key, entry]));
  return entries.flatMap(raw => {
    const entry = normalizeCharacterArchiveEntry(raw);
    if (!isAutomaticLibraryEntry(entry)) return [raw];
    const canonical = current.get(entry.key);
    if (!canonical) return [];
    return [normalizeCharacterArchiveEntry({ ...entry, name: canonical.name,
      description: canonical.description, icon: canonical.icon, data: canonical.data,
      sources: [...(canonical.sources || []), ...(entry.sources || []).filter(source => source.kind !== 'character-library')] })];
  });
}
