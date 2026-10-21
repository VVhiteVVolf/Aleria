import { createHouseholdCompanion } from './household-companion-profiles.js';
import { resolveCreatureBestiaryReference } from '../creature-bestiary-reference.js';
const source = createHouseholdCompanion({ slug: 'zunder', name: 'Zunder', ownerSlug: 'zitteraal', ownerName: 'Der Schwarze Zitteraal', ownerId: 'zitteraale-schwarzer-zitteraal',
  profile: 'horse', species: 'Rhyfel-Hengst', level: 3, scores: [18, 12, 16, 2, 12, 8], portrait: '/AleriaAlmanach/assets/schwarze-zitteraale/zunder.png',
  house: 'Schwarze Zitteraale', habitat: 'Celtigerns Wacht · verborgener Stützpunkt der Schwarzen Zitteraale',
  description: 'Breitschultriger dunkelbrauner Rhyfel-Hengst mit schwarzer Mähne, schwerem Fesselbehang und kräftigem Hals. Reittier des Schwarzen Zitteraals; an Waffenlärm gewöhnt, kommt auf seinen gerufenen Namen.' });
export const ZITTERAAL_ZUNDER = Object.freeze({ ...source, bestiaryReference: resolveCreatureBestiaryReference(source) });
