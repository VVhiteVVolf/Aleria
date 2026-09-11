import { getCenyrClassProgression } from '../../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-progression.js?v=20260909-dragon-parent-v2';
import { getVennyrClassProgression } from '../../../AleriaAlmanach/modules/classes/vennyr/vennyr-class-progression.js?v=20260909-dragon-parent-v2';
import { getAldrimarClassProgression } from '../../../AleriaAlmanach/modules/classes/aldrimar/aldrimar-class-progression.js?v=20260909-dragon-parent-v2';
import { getMorgornClassProgression } from '../../../AleriaAlmanach/modules/classes/morgorn/morgorn-class-progression.js?v=20260910-morgorn-structure-v1';
import { getVenalysClassProgression } from '../../../AleriaAlmanach/modules/classes/venalys/venalys-class-progression.js?v=20260911-venalys-v1';

export function getCultureClassProgression(id, level = 1, options = {}) {
  if (String(id).startsWith('venalys-')) return getVenalysClassProgression(id, level);
  if (String(id).startsWith('morgorn-')) return getMorgornClassProgression(id, level);
  if (String(id).startsWith('aldrimar-')) return getAldrimarClassProgression(id, level);
  return String(id).startsWith('vennyr-') ? getVennyrClassProgression(id, level, options) : getCenyrClassProgression(id, level);
}
