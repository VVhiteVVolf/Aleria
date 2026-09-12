import { NOTFALL_SPELLS } from './versorgung.js';
import { KOERPER_SPELLS } from './koerper.js';
import { REINIGUNG_SPELLS } from './reinigung.js';
import { LEBENSKRAFT_SPELLS } from './lebenskraft.js';
import { WAHRUNG_SPELLS } from './wahrung.js';
import { GEMEINSCHAFT_SPELLS } from './gemeinschaft.js';

export const RESTITUTION_V1 = [
  ...NOTFALL_SPELLS,
  ...KOERPER_SPELLS,
  ...REINIGUNG_SPELLS,
  ...LEBENSKRAFT_SPELLS,
  ...WAHRUNG_SPELLS,
  ...GEMEINSCHAFT_SPELLS,
];
