import { getCharacterArchiveEntrySignature, isExplicitCharacterArchiveVariant } from './character-archive-entry-equivalence.js';

export const getCharacterArchiveViewId = entry => entry.archiveViewId || entry.id;

function signatureId(signature) {
  let hash = 2166136261;
  for (let index = 0; index < signature.length; index++) hash = Math.imul(hash ^ signature.charCodeAt(index), 16777619);
  return (hash >>> 0).toString(36);
}

function variantLabel(entry) {
  const data = entry.data || {};
  const people = [...new Set((entry.sources || []).filter(source =>
    ['character', 'creature', 'character-library'].includes(source.kind)).map(source => source.name).filter(Boolean))];
  if (data.trainingForm || data.parentStyleName) return data.trainingForm || data.parentStyleName;
  if (data.ownerCharacterName || data.ownerCreatureName) return `Besitz · ${data.ownerCharacterName || data.ownerCreatureName}`;
  if (data.section === 'owned') return 'Einzelner Besitz';
  if (entry.registerPresentation) return [entry.registerPresentation.label, data.listName].filter(Boolean).join(' · ');
  if (isExplicitCharacterArchiveVariant(entry)) return 'Eigene Fassung';
  if (people.length) return `Figurenfassung · ${people.join(', ')}`;
  if (data.catalogReference) return `Katalogfassung ${data.catalogReference.revision}`;
  return entry.builtin ? 'Regelvorlage' : 'Abweichende Fassung';
}

// Card/action identities are separate from database IDs. Two valid variants can
// share an old catalog/storage ID and must still open the correct editor.
export function projectCharacterArchiveViewEntries(entries = []) {
  const idCounts = new Map(), nameCounts = new Map(), usedIds = new Set();
  for (const entry of entries) {
    idCounts.set(entry.id, (idCounts.get(entry.id) || 0) + 1);
    const key = `${entry.kind}::${entry.name.toLocaleLowerCase('de')}`;
    nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
  }
  return entries.map(entry => {
    const key = `${entry.kind}::${entry.name.toLocaleLowerCase('de')}`;
    const baseId = idCounts.get(entry.id) > 1 ? `${entry.id}::view::${signatureId(getCharacterArchiveEntrySignature(entry))}` : entry.id;
    let viewId = baseId, suffix = 1;
    while (usedIds.has(viewId)) viewId = `${baseId}-${suffix++}`;
    usedIds.add(viewId);
    return { ...entry, archiveViewId: viewId,
      archiveVariantLabel: nameCounts.get(key) > 1 ? variantLabel(entry) : '' };
  });
}

// Same-label rule variants share a visible family, while every original action
// remains accessible. Form grouping is applied by the caller before this step.
export function groupCharacterArchiveViewFamilies(entries = []) {
  const groups = new Map();
  for (const entry of entries) {
    const key = `${entry.kind}::${entry.name.toLocaleLowerCase('de')}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }
  const rank = entry => entry.data?.section === 'standard' || entry.data?.catalogReference ? 0
    : (entry.sources || []).some(source => source.kind === 'class') ? 1 : entry.builtin ? 2 : 3;
  return [...groups.values()].map(group => group.toSorted((a, b) => rank(a) - rank(b)));
}
