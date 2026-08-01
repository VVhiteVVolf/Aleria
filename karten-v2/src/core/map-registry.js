// In-memory registry over the loaded MapDefinition[] - hierarchy lookups,
// breadcrumbs, child/parent navigation. Pure data structure, no fetching
// (see data/map-loader.js for that) and no Leaflet dependency.
import { validateMapDefinition } from './validation.js';
import { validateAll } from './validation.js';

export function createMapRegistry(rawMaps) {
  const { valid, invalid } = validateAll(rawMaps, validateMapDefinition);
  if (invalid.length && typeof console !== 'undefined') {
    for (const { entry, errors } of invalid) {
      console.warn(`[map-registry] Karte "${entry?.id || '?'}" uebersprungen: ${errors.join('; ')}`);
    }
  }

  const byId = new Map(valid.map((map) => [map.id, map]));

  function get(id) {
    return byId.get(id) || null;
  }

  function all() {
    return valid;
  }

  function activeMaps() {
    return valid.filter((map) => map.status === 'active');
  }

  function children(id) {
    const map = get(id);
    if (!map) return [];
    return (map.childMapIds || []).map((childId) => get(childId)).filter(Boolean);
  }

  function parent(id) {
    const map = get(id);
    if (!map || !map.parentMapId) return null;
    return get(map.parentMapId);
  }

  /** Root-to-self chain of MapDefinitions for breadcrumb rendering. */
  function breadcrumb(id) {
    const chain = [];
    let current = get(id);
    const seen = new Set();
    while (current && !seen.has(current.id)) {
      chain.unshift(current);
      seen.add(current.id);
      current = current.parentMapId ? get(current.parentMapId) : null;
    }
    return chain;
  }

  return { get, all, activeMaps, children, parent, breadcrumb, invalidEntries: invalid };
}
