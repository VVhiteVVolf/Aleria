import { validateClassDocument, validateClassRichText } from '../pages/class-page-content.js';

export function resolveCultureClassDocument(document, culture) {
  if (document.cultureId !== culture.id) throw new Error(`${document.id}: Kultur stimmt nicht überein`);
  const sections = document.sections.map(section => {
    const shared = section.sharedIntro ? culture.sharedSections[section.sharedIntro] : '';
    if (section.sharedIntro && !shared) throw new Error(`${document.id}: Kulturtext fehlt: ${section.sharedIntro}`);
    return { ...section, html: [shared, section.html].filter(Boolean).join(' ') };
  });
  for (const art of [document.artwork, document.companionArtwork].filter(Boolean)) {
    if (!/^https:\/\/i\.imgur\.com\/[a-zA-Z0-9]+\.(png|jpg|jpeg|webp)$/i.test(art.source)
      || !Number.isInteger(art.width) || !Number.isInteger(art.height) || art.width < 1 || art.height < 1) {
      throw new Error(`${document.id}: ungültige Illustration`);
    }
  }
  Object.values(culture.sharedSections).forEach(validateClassRichText);
  return validateClassDocument({ ...document, sections }, document.id);
}
