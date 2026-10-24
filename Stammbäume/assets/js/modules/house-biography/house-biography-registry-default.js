// Attach source defaults at the registry boundary without mutating a family graph.
// Saved biographies still use the existing upgrade policy, including explicit null.
import { houseBiographyDefaultFingerprint } from './house-biography-fingerprint.js';

export function withHouseBiographyDefault(family, defaults) {
  const entry = defaults[family.document.id];
  if (!entry) return family;
  if (Object.hasOwn(family.extensions || {}, 'houseBiographyModule')) {
    const current = family.extensions.houseBiographyModule;
    if (!current || (family.extensions.sourceRevision || 0) >= entry.sourceRevision) return family;
    const fingerprint = houseBiographyDefaultFingerprint(current);
    if (!entry.replacedDefaultFingerprints?.includes(fingerprint)
      && fingerprint !== houseBiographyDefaultFingerprint(entry.biography)) return family;
  }
  return Object.freeze({
    ...family,
    extensions: {
      ...family.extensions,
      // A biography-only revision must not reapply older managed person fields.
      registryManagedEntitySourceRevision: family.extensions?.registryManagedEntitySourceRevision
        ?? family.extensions?.sourceRevision ?? 0,
      sourceRevision: Math.max(family.extensions?.sourceRevision || 0, entry.sourceRevision),
      houseBiographyModule: entry.biography,
    },
  });
}
