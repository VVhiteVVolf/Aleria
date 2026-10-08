import { withSourceFamilyFieldUpgrade } from './source-family-field-upgrade.js';

/** Source portraits fill missing images while retaining edited local pictures. */
export function withSourcePortraitFieldUpgrade(family, patch, options) {
  if (!patch) return family;
  const upgraded = withSourceFamilyFieldUpgrade(family, patch, options);
  if (upgraded === family) return family;
  const prior = new Map(family.persons.map(person => [person.id, person]));
  return {
    ...upgraded,
    persons: upgraded.persons.map(person => {
      if (!patch.collections.persons?.[person.id]?.portrait || prior.get(person.id)?.portrait) return person;
      return { ...person, extensions: {
        ...person.extensions,
        registryManagedFieldFillOnlyRevisions: {
          ...person.extensions.registryManagedFieldFillOnlyRevisions, portrait: patch.revision
        }
      } };
    })
  };
}
