import { withSourceFamilyFieldUpgrade } from './source-family-field-upgrade.js';
import { ALBEN_SOURCE_PORTRAITS, ALBEN_SOURCE_PORTRAIT_FAMILIES } from './alben-source-portraits.js';

/** Restore source portraits without changing genealogy or the child fallback. */
export function withAlbenSourcePortraitUpgrade(family) {
  const update = ALBEN_SOURCE_PORTRAIT_FAMILIES[family.document.id];
  if (!update) return family;
  const upgraded = withSourceFamilyFieldUpgrade(family, {
    revision: update.revision,
    collections: {
      persons: Object.fromEntries(update.personIds.map(id => [id, { portrait: ALBEN_SOURCE_PORTRAITS[id] }]))
    }
  }, {
    inventory: 'assets/data/source-inventories/alben-portraits-2026-10-08.json',
    marker: 'albenSourcePortraitInventory'
  });
  if (upgraded === family) return family;
  const ids = new Set(update.personIds);
  return {
    ...upgraded,
    persons: upgraded.persons.map(person => ids.has(person.id) ? {
      ...person,
      extensions: {
        ...person.extensions,
        registryManagedFieldFillOnlyRevisions: {
          ...person.extensions.registryManagedFieldFillOnlyRevisions,
          portrait: update.revision
        }
      }
    } : person)
  };
}
