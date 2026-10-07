import { ALBIC_HOSPITALITY_PAGES } from './albic-hospitality-content.mjs';

export const ALBIC_HOSPITALITY_TAB = 'Sitte & Etiquette';
export const ALBIC_HOSPITALITY_ICON = '../IconOrdner/ReiterIcons/Weltpfade/sitte-etiquette.png';
export const ALBIC_HOSPITALITY_ART = './public/assets/albische-gastfreundschaft';
const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export function buildAlbicHospitality() {
  return {
    id: 'albische-gastfreundschaft',
    title: 'Albische Gastfreundschaft & das Gesetz der Götter',
    subtitle: 'Vom freien Platz am Herd bis zum Nachhall eines erloschenen Clans',
    type: 'Sitte & Brauch', category: `${ALBIC_HOSPITALITY_TAB} · Alben`,
    symbol: ALBIC_HOSPITALITY_ICON, image: `${ALBIC_HOSPITALITY_ART}/gastfreundschaft.png`,
    icon: '✦', stamp: 'GASTRECHT · GABEN · GEMEINSCHAFT',
    multipage: true, appendCommentsPage: false, enablePageComments: true,
    pages: ALBIC_HOSPITALITY_PAGES.map((page, index) => ({
      pageTitle: `${romans[index]}. — ${page.title}`,
      image: `${ALBIC_HOSPITALITY_ART}/${page.key}.png`,
      imageFit: 'contain', imagePosition: 'center', imageWidth: 38, imageTall: true,
      description: `<p><em>${page.lead}</em></p>\n` + page.sections.map(section =>
        `<p><strong>${section.title}</strong></p>\n${section.paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('\n')}`
      ).join('\n'),
      commentSequence: []
    }))
  };
}
