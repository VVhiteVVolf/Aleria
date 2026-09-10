import { renderProfile } from '../profiles/profile-template.mjs';
import { renderPantheon } from '../pantheon/pantheon-template.mjs';

export function renderReligionEntry(catalog, entry) {
  const collection = catalog.collections.find(item => item.parentId === entry.id);
  return collection ? renderPantheon(catalog, entry, collection) : renderProfile(catalog, entry);
}
