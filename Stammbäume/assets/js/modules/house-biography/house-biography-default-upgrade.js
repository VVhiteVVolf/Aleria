import { houseBiographyDefaultFingerprint } from './house-biography-fingerprint.js';
export { houseBiographyDefaultFingerprint } from './house-biography-fingerprint.js';
import { HOUSE_BIOGRAPHY_DEFAULTS } from '../../data/house-biographies.registry.js?v=20261024-housebio-v1';

const REPLACED_DEFAULTS = Object.freeze({
  // Draig revision 8: full biography, replaced by the requested short overview.
  'haus-draig': ['13197:966c96ad:860ab92b', '13211:8bc11338:f9fd47ae'],
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
