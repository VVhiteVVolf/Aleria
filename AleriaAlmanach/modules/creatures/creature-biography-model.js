// Narrative data belongs to the creature, independently of combat and loot.
export const CREATURE_BIOGRAPHY_FIELDS = Object.freeze([
  { key: 'summary', label: 'Kurzbeschreibung', hint: 'Was macht dieses Wesen aus?' },
  { key: 'appearance', label: 'Erscheinung & Merkmale', hint: 'Gestalt, Spuren, Stimme oder übernatürliche Erscheinung …' },
  { key: 'personality', label: 'Wesen & Verhalten', hint: 'Temperament, Instinkte, Wille, Gewohnheiten oder Antrieb …' },
  { key: 'history', label: 'Herkunft & Geschichte', hint: 'Geburt, Erschaffung, Erwachen und prägende Ereignisse …' },
  { key: 'bonds', label: 'Bindungen & Zugehörigkeit', hint: 'Vertraute, Rudel, Erschaffer, Orte oder gebundene Seelen …' },
  { key: 'habits', label: 'Lebensweise & Bedürfnisse', hint: 'Lebensraum, Nahrung, Ruhe, Rituale oder Existenzbedingungen …' }
]);

const text = (value, limit = 12000) => String(value ?? '').trim().slice(0, limit);

export function normalizeCreatureBiography(value, legacy = {}) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const revision = Number(source.revision);
  const result = { schemaVersion: 1, revision: Number.isFinite(revision) ? Math.max(0, Math.trunc(revision)) : 0 };
  for (const { key } of CREATURE_BIOGRAPHY_FIELDS) result[key] = text(source[key]);
  // Only migrate an absent biography. Explicitly clearing a field must stay cleared.
  if (value == null) {
    result.personality = text(legacy.personality);
    result.summary = text(legacy.description);
  }
  result.facts = (Array.isArray(source.facts) ? source.facts : []).slice(0, 30).map(row => ({
    label: text(row?.label, 100), value: text(row?.value, 1000)
  }));
  result.sections = (Array.isArray(source.sections) ? source.sections : []).slice(0, 20).map(row => ({
    title: text(row?.title, 140), text: text(row?.text)
  }));
  return result;
}

export function hasCreatureBiography(value) {
  const biography = normalizeCreatureBiography(value);
  return CREATURE_BIOGRAPHY_FIELDS.some(({ key }) => biography[key])
    || biography.facts.some(row => row.label || row.value)
    || biography.sections.some(row => row.title || row.text);
}
