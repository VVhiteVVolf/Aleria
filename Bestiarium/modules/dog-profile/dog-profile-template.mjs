import { renderPetProfile } from '../pet-profile/pet-profile-template.mjs';

const DOG_CONTEXT = {
  generatedBy: 'Bestiarium/scripts/build-dog-profiles.mjs',
  kindId: 'hunde',
  kindTitle: 'Hunde',
  pageTitleContext: 'Hunde Alerias',
  archiveTitle: 'Kynologisches Archiv',
  registerBackLabel: 'Alle Hunderassen',
  allLabel: 'Alle Hunde',
  footerBackLabel: 'zum Hundearchiv'
};

export function renderDogProfile(record, navigation = {}) {
  return renderPetProfile(record, { ...DOG_CONTEXT, ...navigation });
}
