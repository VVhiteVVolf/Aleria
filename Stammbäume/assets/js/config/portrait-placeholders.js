export const PORTRAIT_PLACEHOLDERS = Object.freeze({
  male: 'assets/images/placeholders/male.png',
  female: 'assets/images/placeholders/female.png',
  child: 'assets/images/placeholders/child.png',
  unknown: 'assets/images/placeholders/unknown.png',
  crest: 'assets/images/placeholders/neutral-crest.png'
});

export function resolvePortraitSource(person) {
  if (person?.portrait) return person.portrait;
  const explicit = person?.portraitPlaceholder;
  if (explicit && explicit !== 'auto' && PORTRAIT_PLACEHOLDERS[explicit]) {
    return PORTRAIT_PLACEHOLDERS[explicit];
  }
  if (person?.sex === 'male') return PORTRAIT_PLACEHOLDERS.male;
  if (person?.sex === 'female') return PORTRAIT_PLACEHOLDERS.female;
  return PORTRAIT_PLACEHOLDERS.unknown;
}
