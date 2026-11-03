export const OWETA_QUARTET_ARTWORK = Object.freeze({
  path: '/AleriaAlmanach/assets/groups/oweta-quartett/proposals-2026-11-03/01-bachufer.png',
  assetId: 'oweta-quartett-bachufer-v1',
  sha256: '0e22f04c49175d47c2abe8f79685b8db0d8067e7cc25cf8d36b920e698bb9404',
  selection: 'Nutzerauswahl vom 3. November 2026: Bild 1 als Haupt- und Szenenbild.'
});

export const OWETA_QUARTET_IMAGE = OWETA_QUARTET_ARTWORK.path;

/** Replace only the quartet's existing shared artwork, retaining edited text,
 * hierarchy, membership, scene identifiers and all other page content. */
export function withOwetaQuartetArtwork(entry, image) {
  if (entry?.id !== 'oweta-quartett' || !Array.isArray(entry.pages) || !image) {
    throw Error('Ungültiges Quartett oder Gruppenbild.');
  }
  const next = structuredClone(entry);
  const introduction = next.pages.find(page => page.commentThreadKey === 'quartett');
  const overview = next.pages.find(page => page.commentThreadKey === 'gruppenuebersicht' && page.landingPage);
  const scene = next.pages.find(page => page.commentThreadKey === 'mittagsrast' && page.sessionPage);
  if (!introduction || !overview?.landing || !scene) throw Error('Eine der vorhandenen Gruppenbildansichten fehlt.');
  const images = [entry.previewImage, introduction.image, overview.landing.coverImage, scene.image];
  if (images.some(value => value !== entry.image && value !== image && value !== OWETA_QUARTET_IMAGE)) {
    throw Error('Abweichende Einzelbilder müssen vor dem Ersetzen geprüft werden.');
  }
  next.image = image;
  next.previewImage = image;
  introduction.image = image;
  overview.landing.coverImage = image;
  scene.image = image;
  return next;
}
