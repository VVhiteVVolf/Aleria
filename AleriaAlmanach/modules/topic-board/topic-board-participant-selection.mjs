/** Selection and search stay independent of the character archive and the DOM. */
export function normalizeParticipantSearch(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('de-DE').replace(/ß/g, 'ss').replace(/\s+/g, ' ').trim();
}

export function matchesParticipant(character, query) {
  const groups = String(query ?? '').split(/[,;\n]+/).map(normalizeParticipantSearch).filter(Boolean);
  const text = normalizeParticipantSearch(`${character.name || ''} ${character.title || ''} ${character.id || ''}`);
  return !groups.length || groups.some(group => group.split(' ').every(word => text.includes(word)));
}

export function createParticipantSelection({ characters = [], selected = [], limit = 18 } = {}) {
  const records = new Map();
  // Saved participants remain editable even if they no longer occur in the archive.
  for (const record of [...selected, ...characters]) {
    const id = String(record?.id || '').trim();
    if (id) records.set(id, { ...record, id });
  }
  const ids = new Set(selected.map(record => String(record.id || '').trim()).filter(id => records.has(id)).slice(0, limit));
  let previous = null;
  const list = () => Array.from(records.values()).sort((a, b) => String(a.name).localeCompare(String(b.name), 'de'));
  return {
    list,
    selected: () => Array.from(ids, id => ({ ...records.get(id) })),
    has: id => ids.has(id),
    filter: (query, selectedOnly = false) => list().filter(record => (!selectedOnly || ids.has(record.id)) && matchesParticipant(record, query)),
    add(candidates) {
      let added = 0; let skipped = 0;
      previous = new Set(ids);
      for (const value of candidates) {
        const id = String(value?.id || value || '').trim();
        if (!records.has(id) && value?.id) records.set(id, { ...value, id });
        if (!records.has(id) || ids.has(id)) continue;
        if (ids.size >= limit) { skipped++; continue; }
        ids.add(id); added++;
      }
      return { added, skipped };
    },
    remove(id) { previous = new Set(ids); ids.delete(id); },
    clear() { previous = new Set(ids); ids.clear(); },
    undo() { if (!previous) return; const current = new Set(ids); ids.clear(); previous.forEach(id => ids.add(id)); previous = current; },
    canUndo: () => previous !== null
  };
}
