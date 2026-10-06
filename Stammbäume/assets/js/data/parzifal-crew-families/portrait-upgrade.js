import { withSourceFamilyFieldUpgrade } from '../source-family-field-upgrade.js';

const PORTRAIT_ROOT = '../AleriaAlmanach/assets/ship-crews/parzifals-schiffsmannschaft/corrected-2026-10-06';

export const PARZIFAL_CORRECTED_PORTRAITS = Object.freeze({
  'iestyn-ddraenen': `${PORTRAIT_ROOT}/iestyn-ddraenen.png`,
  'tegid-cwningod': `${PORTRAIT_ROOT}/tegid-cwingod.png`
});

const PORTRAIT_PATCHES = Object.freeze({
  'haus-ddraenen': { revision: 7, personId: 'iestyn-ddraenen' },
  'haus-cwningod': { revision: 5, personId: 'tegid-cwningod' },
  'haus-pawen': { revision: 4, personId: 'tegid-cwningod' }
});

// Update the shared portraits without reopening genealogy or local notes.
export function withParzifalCrewPortraitUpgrade(family) {
  const patch = PORTRAIT_PATCHES[family.document.id];
  if (!patch) return family;
  return withSourceFamilyFieldUpgrade(family, {
    revision: patch.revision,
    collections: { persons: {
      [patch.personId]: { portrait: PARZIFAL_CORRECTED_PORTRAITS[patch.personId] }
    } }
  }, {
    inventory: 'parzifal-corrected-portraits-2026-10-06',
    marker: 'parzifalPortraitCorrection'
  });
}
