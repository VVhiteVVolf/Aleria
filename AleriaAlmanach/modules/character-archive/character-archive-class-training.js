import { getAutofilledCenyrCombatProfile } from '../classes/cenyr/cenyr-combat-profile-autofill.js?v=20260909-dragon-parent-v2';
import { getCombatStyleRegistry } from '../combat-styles/combat-style-registry.js?v=20260909-dragon-parent-v2';
import { isDrachentanzCanonicalTechniqueId } from '../combat-styles/drachentanz/drachentanz-training-migration.js?v=20260909-dragon-parent-v2';
import { extractCharacterArchiveEntries, normalizeCharacterArchiveEntry } from './character-archive-model.js?v=20260909-class-forms-v1';

const styles = getCombatStyleRegistry().styles;
const canonicalTechniques = new Map(styles.flatMap(style => style.forms.flatMap(form => form.techniques)).map(technique => [technique.id, technique]));
const canonicalDefinitions = new Map(styles.flatMap(style => [style, ...style.forms.map(form => ({ ...form, parentStyleId: style.id, parentStyleName: style.name }))])
  .map(definition => [definition.id, definition]));
const retiredForms = new Set(['drachentanz-pfad-lanzendrache', 'drachentanz-pfad-satteldrache', 'drachentanz-pfad-bogendrache']);

// Live Firestore records and local imports use the same read-only training view
// as a scene. Projection never uploads or mutates the original character.
export function extractCurrentCharacterArchiveEntries(record = {}, sourceKind = '') {
  const kind = sourceKind || (record.entityType === 'creature' ? 'creature' : 'character');
  const current = kind === 'character'
    ? { ...record, combatProfile: getAutofilledCenyrCombatProfile(record.combatProfile || {}) }
    : record;
  return extractCharacterArchiveEntries(current, kind);
}

// Previously archived generated entries may outlive their source character.
// Refresh only reserved canonical IDs; preserve personal entries and archive
// metadata such as icon assignments, source links and creation timestamps.
export function reconcileCharacterArchiveClassTraining(entries = []) {
  return entries.flatMap(entry => {
    const id = String(entry.data?.id || '');
    if (entry.kind === 'combat-style' && retiredForms.has(id)) return [];
    const canonical = entry.kind === 'technique' ? canonicalTechniques.get(id)
      : entry.kind === 'combat-style' ? canonicalDefinitions.get(id) : null;
    if (!canonical) {
      const owned = entry.kind === 'technique' && (isDrachentanzCanonicalTechniqueId(id) || id.startsWith('combat-style-sirenentanz-derwyn-'));
      return owned ? [] : [entry];
    }
    return [normalizeCharacterArchiveEntry({ ...entry, name: canonical.name,
      description: canonical.description || canonical.effect || entry.description,
      data: { ...entry.data, ...canonical } })];
  });
}
