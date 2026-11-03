import { CADOGAN_CHARACTER_ID, RHIANNON_CHARACTER_ID, GWEN_CHARACTER_ID } from '../../patrick-biographies/biography-identities.mjs';
import { getPatrickBiographyPetSpecs, createPatrickBiographyCompanion } from '../../patrick-biographies/biography-companions.mjs';
import { PATRICK_BIOGRAPHY_ASSETS } from '../../patrick-biographies/biography-assets.mjs';

// Catalog availability does not create ownership or inventory records.
// The four live names had no existing online creature records on 3 November 2026.
const OWNERS = [
  { id: CADOGAN_CHARACTER_ID, name: 'Cadogan Sgrechiwr', portrait: '/Stammbäume/assets/images/portraits/haus-sgrechiwr/cadogan-sgrechiwr.jpg' },
  { id: RHIANNON_CHARACTER_ID, name: 'Rhiannon (geb. Draenmelyn) Swyll', portrait: '/Stammbäume/assets/images/portraits/haus-draenmelyn/rhiannon-draenmelyn.png' },
  { id: GWEN_CHARACTER_ID, name: 'Gwen Hamnett', portrait: PATRICK_BIOGRAPHY_ASSETS['portrait:gwen-hamnett'] },
];

export const PATRICK_BIOGRAPHY_COMPANIONS = Object.freeze(OWNERS.flatMap(owner =>
  getPatrickBiographyPetSpecs(owner.id).map(spec => createPatrickBiographyCompanion(spec, owner, '2026-11-03T00:00:00.000Z', PATRICK_BIOGRAPHY_ASSETS))));
