import { normalizeHouseBiographyModule } from './house-biography-model.js';
import { HOUSE_BIOGRAPHY_DEFAULTS } from '../../data/house-biographies.registry.js?v=gwendolyn-20260911h';

// Recognize shipped defaults only. These fingerprints are not security hashes.
export function houseBiographyDefaultFingerprint(value) {
  const text = JSON.stringify(normalizeHouseBiographyModule(value));
  let first = 2166136261;
  let second = 2246822507;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    first = Math.imul(first ^ code, 16777619);
    second = Math.imul(second ^ code, 2246822507);
  }
  return `${text.length}:${(first >>> 0).toString(16)}:${(second >>> 0).toString(16)}`;
}

const REPLACED_DEFAULTS = Object.freeze({
  // Draig revision 8: full biography, replaced by the requested short overview.
  'haus-draig': ['13197:966c96ad:860ab92b'],
});

export function houseBiographyDefaultUpgrade(registered, local) {
  if (registered.document.id !== local.document.id) return {};
  if (Number(registered.extensions.sourceRevision) <= Number(local.extensions.sourceRevision)) return {};
  const oldBiography = local.extensions.houseBiographyModule;
  const newBiography = registered.extensions.houseBiographyModule;
  if (!oldBiography || !newBiography) return {};
  const knownDefaults = [
    ...(REPLACED_DEFAULTS[registered.document.id] || []),
    ...(HOUSE_BIOGRAPHY_DEFAULTS[registered.document.id]?.replacedDefaultFingerprints || []),
  ];
  return knownDefaults.includes(houseBiographyDefaultFingerprint(oldBiography))
    ? { houseBiographyModule: newBiography }
    : {};
}
