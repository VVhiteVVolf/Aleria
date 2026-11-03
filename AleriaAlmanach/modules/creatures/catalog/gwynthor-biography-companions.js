import { createGwynthorBiographyCompanions } from '../../gwynthor-seven/biography-companions.mjs';
import { createCaralynCompanion } from '../../gwynthor-seven/caralyn-companion.js';

// The same authored animals back the inventory exports and the creature picker.
// Ownership is fixed here; opening the catalog never grants inventory entries.
const OWNERS = [
  { id: 'person--haus-wyrm--rianna-wyrm', name: 'Rianna Wyrm', portrait: '/Stammbäume/assets/images/portraits/haus-wyrm/rianna-wyrm.jpg' },
  { id: 'person--haus-gafyr--lefraye-gafyr', name: 'Lefraye Gafyr', portrait: '/Stammbäume/assets/images/portraits/haus-gafyr/lefraye-gafyr.jpg' }
];
export const GWYNTHOR_BIOGRAPHY_COMPANIONS = Object.freeze([...OWNERS.flatMap(owner => createGwynthorBiographyCompanions(owner, '2026-11-02T00:00:00.000Z')), createCaralynCompanion()]);
