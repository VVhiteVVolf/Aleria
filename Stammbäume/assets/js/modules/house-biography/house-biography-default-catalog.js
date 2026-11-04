// Full house pages own their biography. Illustration-only source migrations also
// remain available to the shared registry and saved-family upgrade policy.
import { HOUSE_BIOGRAPHY_DEFAULTS } from '../../data/house-biographies.registry.js?v=20261104-content-lore-v1';
import { VENNYR_WARRIOR_BIOGRAPHY_DEFAULTS } from '../../data/vennyr-warrior-biography-defaults.js?v=20261104-lore-fixes-v1';
import { houseBiographyDefaultFingerprint } from './house-biography-fingerprint.js';

const defaults = { ...VENNYR_WARRIOR_BIOGRAPHY_DEFAULTS };
for (const [id, entry] of Object.entries(HOUSE_BIOGRAPHY_DEFAULTS)) {
  const illustrationDefault = defaults[id];
  defaults[id] = illustrationDefault ? Object.freeze({
    ...entry,
    replacedDefaultFingerprints: Object.freeze([...new Set([
      ...(entry.replacedDefaultFingerprints || []),
      ...(illustrationDefault.replacedDefaultFingerprints || []),
      houseBiographyDefaultFingerprint(illustrationDefault.biography)
    ])])
  }) : entry;
}
export const HOUSE_BIOGRAPHY_DEFAULT_CATALOG = Object.freeze(defaults);
