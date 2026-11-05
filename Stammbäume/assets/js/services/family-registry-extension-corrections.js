/** Bounded source corrections preserve other values inside an edited extension. */
export function correctRegisteredExtensionValue({ mode, registered, local, corrections = [] }) {
  if (mode === 'remove-known-values') {
    if (!Array.isArray(local)) return registered;
    return local.filter(value => !corrections.includes(value));
  }
  if (mode !== 'replace-known-paths') return registered;
  const result = structuredClone(local ?? registered);
  for (const correction of corrections) {
    const path = correction.path;
    if (!Array.isArray(path) || !path.length || path.some(key =>
      typeof key !== 'string' || ['__proto__', 'prototype', 'constructor'].includes(key))) continue;
    let parent = result;
    for (const key of path.slice(0, -1)) parent = parent?.[key];
    if (!parent || typeof parent !== 'object') continue;
    const field = path.at(-1);
    if (correction.previousValues.some(value => JSON.stringify(value) === JSON.stringify(parent[field]))) {
      parent[field] = structuredClone(correction.value);
    }
  }
  return result;
}
