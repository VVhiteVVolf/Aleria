import { getCenyrClassDefinition } from './cenyr/cenyr-class-registry.js';
import { getVennyrClassDefinition } from './vennyr/vennyr-class-registry.js';
import { getAldrimarClassDefinition } from './aldrimar/aldrimar-class-registry.js';

export function getCultureClassDefinitions(classId, cultures = []) {
  const result = [];
  if (cultures.includes('Aldrimar')) {
    const aldrimar = getAldrimarClassDefinition(classId);
    if (aldrimar) result.push(aldrimar);
  }
  if (cultures.includes('Cenyr')) {
    const cenyr = getCenyrClassDefinition(classId);
    if (cenyr) result.push(cenyr);
  }
  if (cultures.includes('Vennyr') || classId === 'derwyn' && cultures.includes('Cenyr')) {
    const vennyr = getVennyrClassDefinition(classId);
    if (vennyr) result.push(vennyr);
  }
  return result;
}
