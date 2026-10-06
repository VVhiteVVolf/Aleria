import { withSourceFamilyFieldUpgrade } from '../source-family-field-upgrade.js';

// Keep the Prys relative's identity and kinship; the ship's chaplain is Deiniol Gwyllt.
export function withParzifalChaplainIdentityCorrection(family) {
  if (family.document.id !== 'haus-prys') return family;
  return withSourceFamilyFieldUpgrade(family, {
    revision: 7,
    collections: { persons: {
      'bethan-elder-prys': { name: 'Emrys Prys', title: '', portrait: '', notes: '' }
    } }
  }, {
    inventory: 'parzifal-deiniol-gwyllt-2026-10-06',
    marker: 'parzifalChaplainIdentityCorrection'
  });
}
