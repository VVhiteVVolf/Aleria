import { CENYR_CLASS_IDS } from '../../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-registry.js?v=20260905-cenyr-attacks-v1';

export function getCultureClassPageHref(cultureId, classId) {
  return cultureId === 'cenyr' && CENYR_CLASS_IDS.includes(classId) ? `Cenyr/${classId}/index.html` : '';
}
