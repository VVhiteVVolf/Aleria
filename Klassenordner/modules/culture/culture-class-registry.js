import { CENYR_CLASS_IDS } from '../../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-registry.js?v=20260909-dragon-parent-v2';
import { VENNYR_CLASS_IDS } from '../../../AleriaAlmanach/modules/classes/vennyr/vennyr-class-registry.js?v=20260909-dragon-parent-v2';
import { ALDRIMAR_CLASS_IDS } from '../../../AleriaAlmanach/modules/classes/aldrimar/aldrimar-class-registry.js';
import { MORGORN_CLASS_IDS } from '../../../AleriaAlmanach/modules/classes/morgorn/morgorn-class-registry.js';
import { VENALYS_CLASS_IDS } from '../../../AleriaAlmanach/modules/classes/venalys/venalys-class-registry.js';

export function getCultureClassPageHref(cultureId, classId) {
  if (cultureId === 'aldrimar' && ALDRIMAR_CLASS_IDS.includes(classId)) return `Aldrimar/${classId}/index.html`;
  if (cultureId === 'morgorn' && MORGORN_CLASS_IDS.includes(classId)) return `Morgorn/${classId}/index.html`;
  if (cultureId === 'venalys' && VENALYS_CLASS_IDS.includes(classId)) return `Venalys/${classId}/index.html`;
  if (cultureId === 'vennyr' && VENNYR_CLASS_IDS.includes(classId)) return `Vennyr/${classId}/index.html`;
  if (cultureId === 'cenyr' && classId === 'derwyn') return 'Vennyr/derwyn/index.html';
  return cultureId === 'cenyr' && CENYR_CLASS_IDS.includes(classId) ? `Cenyr/${classId}/index.html` : '';
}
