import { getCenyrClassProgression } from '../../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-progression.js?v=20260908-cenyr-paths-v1';
import { getVennyrClassProgression } from '../../../AleriaAlmanach/modules/classes/vennyr/vennyr-class-progression.js';
import { getAldrimarClassProgression } from '../../../AleriaAlmanach/modules/classes/aldrimar/aldrimar-class-progression.js';

export function getCultureClassProgression(id, level = 1) {
  if (String(id).startsWith('aldrimar-')) return getAldrimarClassProgression(id, level);
  return String(id).startsWith('vennyr-') ? getVennyrClassProgression(id, level) : getCenyrClassProgression(id, level);
}
