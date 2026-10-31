import { createFamilyPerson, createMarriage } from './family-record-builders.js';
import { TROETZLI_PEOPLE, LLYTHFOR_MARRIAGE_ID, LLYTHFOR_MARRIAGE_YEAR } from '../../../../AleriaAlmanach/modules/gwynthor-troetzli/troetzli-household.mjs';
import { buildTroetzliBiography } from '../../../../AleriaAlmanach/modules/gwynthor-troetzli/troetzli-biographies.mjs';

export function createLlythforPerson(key, options = {}) {
  const person = TROETZLI_PEOPLE[key];
  return createFamilyPerson({
    id: person.id, worldPersonId: person.worldPersonId, name: person.name,
    birth: person.birth, sex: person.sex, houseId: key === 'esyllt' ? 'house-penrudd' : 'house-llythfor',
    title: person.role, notes: `${person.bio} Erscheinung: ${person.appearance}`,
    portrait: person.portrait ? `..${person.portrait}` : '',
    portraitPlaceholder: key === 'eirlys' ? 'child' : 'auto',
    extensions: { household: 'city', culture: person.culture, appearance: person.appearance,
      biographyModule: buildTroetzliBiography(key),
      portraitAge: person.age, registryManagedFields: ['name', 'title', 'notes', 'portrait', ...(key === 'eirlys' ? ['portraitPlaceholder', 'birth'] : [])],
      ...(key === 'eirlys' ? { registryManagedFieldRevisions: { birth: 4 } } : {}),
      registryManagedExtensionFields: ['household', 'culture', 'appearance', 'portraitAge', 'biographyModule'] },
    ...options,
  });
}

export function createLlythforPenruddMarriage(counterpartFamilyId) {
  return createMarriage(LLYTHFOR_MARRIAGE_ID, TROETZLI_PEOPLE.cynddelw.id, TROETZLI_PEOPLE.esyllt.id, {
    start: LLYTHFOR_MARRIAGE_YEAR,
    extensions: { chartAlignParentPairOverChildPersonId: TROETZLI_PEOPLE.eirlys.id,
      crossFamilyRelationship: { linkId: LLYTHFOR_MARRIAGE_ID, counterpartFamilyId } },
  });
}
