import { CENYR_CLASS_IDS } from '../../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-registry.js?v=20260905-cenyr-attacks-v1';
import { VENNYR_CLASS_IDS } from '../../../AleriaAlmanach/modules/classes/vennyr/vennyr-class-registry.js';
import { ALDRIMAR_CLASS_IDS } from '../../../AleriaAlmanach/modules/classes/aldrimar/aldrimar-class-registry.js';

export function getCultureClassPageHref(cultureId, classId) {
  if (cultureId === 'aldrimar' && ALDRIMAR_CLASS_IDS.includes(classId)) return `Aldrimar/${classId}/index.html`;
  if (cultureId === 'vennyr' && VENNYR_CLASS_IDS.includes(classId)) return `Vennyr/${classId}/index.html`;
  if (cultureId === 'cenyr' && classId === 'derwyn') return 'Vennyr/derwyn/index.html';
  return cultureId === 'cenyr' && CENYR_CLASS_IDS.includes(classId) ? `Cenyr/${classId}/index.html` : '';
}
