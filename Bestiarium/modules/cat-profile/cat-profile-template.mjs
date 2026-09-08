import { renderPetProfile } from '../pet-profile/pet-profile-template.mjs';

const CAT_CONTEXT = {
  generatedBy: 'Bestiarium/scripts/build-cat-profiles.mjs',
  kindId: 'katzen',
  kindTitle: 'Katzen',
  pageTitleContext: 'Katzen Alerias',
  archiveTitle: 'Katzenkundliches Archiv',
  registerBackLabel: 'Alle Katzenrassen',
  allLabel: 'Alle Katzen',
  footerBackLabel: 'zum Katzenarchiv'
};

export function renderCatProfile(record, navigation = {}) {
  return renderPetProfile(record, { ...CAT_CONTEXT, ...navigation });
}
