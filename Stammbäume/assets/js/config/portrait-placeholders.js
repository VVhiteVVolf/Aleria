export const PORTRAIT_PLACEHOLDERS = Object.freeze({
  male: '../IconOrdner/Siluetten/Männliche Siluette.png',
  female: '../IconOrdner/Siluetten/Weibliche Siluette.png',
  child: '../IconOrdner/Siluetten/Kind.png',
  unknown: '../IconOrdner/Siluetten/Unbekannt.png',
  crest: '../IconOrdner/Siluetten/Neutrales Adelswappen.png'
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

