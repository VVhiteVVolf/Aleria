import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { normalizeFamily } from '../assets/js/domain/family-schema.js';
import { MATHGHAM_SOURCE_COUNTER_PATCHES } from '../assets/js/data/mathgham-source-counter-patches.js';
import { fingerprintBeforeBraigh } from './braigh-invariants.js';

const mathghamFamilies = new Set(['haus-diuid','haus-lockart','haus-fiorghra','haus-ness','haus-haig','haus-banlaoch']);
const beforeMathgham = JSON.parse(fs.readFileSync(new URL('../scripts/mathgham-source-import/baseline-fingerprints.json',import.meta.url),'utf8')).families;

export const familyFingerprint = family => createHash('sha256').update(JSON.stringify(normalizeFamily(family))).digest('hex');

// Historical import tests compare their own release; the dedicated Mathgham
// tests separately prove that only this later release's reviewed fields changed.
export const fingerprintBeforeMathgham = family => mathghamFamilies.has(family.document.id) || MATHGHAM_SOURCE_COUNTER_PATCHES[family.document.id]
  ? beforeMathgham[family.document.id] : fingerprintBeforeBraigh(family);

/** Exclude only the reviewed corrections and their migration bookkeeping. */
export function unmodifiedCounterpartFingerprint(family, patch) {
  const copy = structuredClone(normalizeFamily(family));
  const cleanExtensions = entity => {
    for (const key of Object.keys(entity.extensions || {})) {
      if (key.startsWith('registryManaged') || key === 'sourceRevision' || key === 'mathghamSourceCounterInventory') delete entity.extensions[key];
    }
    if (entity.extensions && !Object.keys(entity.extensions).length) delete entity.extensions;
  };
  cleanExtensions(copy);
  for (const collection of ['persons', 'partnerships', 'parentages', 'houses', 'cadetBranches', 'timeJumps']) {
    for (const entity of copy[collection]) {
      cleanExtensions(entity);
      for (const field of Object.keys(patch.collections[collection]?.[entity.id] || {})) delete entity[field];
    }
  }
  const addedHouses = new Set((patch.additionalHouses || []).map(h => h.id));
  copy.houses = copy.houses.filter(h => !addedHouses.has(h.id));
  return createHash('sha256').update(JSON.stringify(copy)).digest('hex');
}
