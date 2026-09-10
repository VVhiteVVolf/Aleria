import { CLERGY_INDEX, clergyPagePath } from './clergy-repository.mjs';
import { renderClergyDirectory } from './clergy-directory-template.mjs';
import { renderClergyProfile } from './clergy-profile-template.mjs';

export function renderClergyPages(clergy,catalog) {
  return [[CLERGY_INDEX,renderClergyDirectory(clergy,catalog)],...clergy.profiles.map(profile => [clergyPagePath(profile.godId),renderClergyProfile(clergy,catalog,profile)])];
}
