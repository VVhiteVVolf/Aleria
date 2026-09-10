import { getCenyrClassDefinition } from './cenyr/cenyr-class-registry.js?v=20260909-dragon-parent-v2';
import { getVennyrClassDefinition } from './vennyr/vennyr-class-registry.js?v=20260909-dragon-parent-v2';
import { getAldrimarClassDefinition } from './aldrimar/aldrimar-class-registry.js';
import { getMorgornClassDefinition } from './morgorn/morgorn-class-registry.js';

export function getCultureClassDefinitions(classId, cultures = []) {
  const result = [];
  if (cultures.includes('Aldrimar')) {
    const aldrimar = getAldrimarClassDefinition(classId);
    if (aldrimar) result.push(aldrimar);
  }
  if (cultures.includes('Morgorn')) {
    const morgorn = getMorgornClassDefinition(classId);
    if (morgorn) result.push(morgorn);
  }
  if (cultures.includes('Cenyr')) {
    const cenyr = getCenyrClassDefinition(classId);
    if (cenyr) result.push(cenyr);
  }
  if (cultures.includes('Vennyr') || classId === 'derwyn' && cultures.includes('Cenyr')) {
    const vennyr = getVennyrClassDefinition(classId);
    if (vennyr) result.push(vennyr);
  }
  return result.filter((definition, index) => result.findIndex(candidate => candidate.id === definition.id) === index);
}
