export const ARCHIVE_PLACEMENT_FIELDS = Object.freeze([
  { key: 'className', label: 'Klasse', kind: 'class' },
  { key: 'styleId', label: 'Kampftechnik', kind: 'combat-style', style: true },
  { key: 'formId', label: 'Form (für Attacken)', kind: 'combat-style', form: true },
  { key: 'personName', label: 'Person (für eigene Attacken)' },
  { key: 'weaponName', label: 'Waffe (für waffeneigene Attacken)', kind: 'attack' }
]);

export function getArchivePlacementChoices(field, entries = []) {
  return entries.filter(entry => {
    if (entry.kind !== field.kind) return false;
    const parent = entry.data?.parentStyleId || entry.data?.archivePlacement?.styleId;
    return (!field.style || !parent) && (!field.form || Boolean(parent));
  });
}

export function readArchivePlacement(formData, entries = [], current = {}) {
  const placement = Object.fromEntries(ARCHIVE_PLACEMENT_FIELDS
    .map(({ key }) => [key, String(formData.get(`placement-${key}`) || '').trim()]).filter(([, value]) => value));
  const branches = [placement.personName, placement.weaponName, placement.className || placement.styleId || placement.formId].filter(Boolean);
  if (branches.length > 1) throw new Error('Bitte entweder Klasse/Kampftechnik/Form, eine Person oder eine Waffe zuordnen.');
  if (current.kind === 'combat-style') {
    if (placement.formId) throw new Error('Eine neue Form wird ihrer Kampftechnik zugeordnet. Das Feld Form ist für Attacken bestimmt.');
    if (placement.styleId && [current.id, current.data?.id].includes(placement.styleId)) throw new Error('Eine Kampftechnik kann nicht ihre eigene übergeordnete Kampftechnik sein.');
  }
  const form = entries.find(entry => entry.kind === 'combat-style' && entry.data?.id === placement.formId);
  if (form && placement.styleId && (form.data.parentStyleId || form.data.archivePlacement?.styleId) !== placement.styleId) throw new Error('Die gewählte Form gehört zu einer anderen Kampftechnik.');
  return placement;
}
