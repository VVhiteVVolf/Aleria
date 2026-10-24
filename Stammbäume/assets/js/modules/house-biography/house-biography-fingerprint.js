import { normalizeHouseBiographyModule } from './house-biography-model.js';

// Recognize shipped editorial defaults without coupling the registry to its upgrades.
// This is a stable content fingerprint, not a security hash.
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
