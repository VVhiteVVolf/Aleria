import { TENEBRIUM_PAGES } from './tenebrium-content.mjs';

export const NATURAL_RESOURCES_TAB = 'Natürliche Rohstoffe';
export const NATURAL_RESOURCES_ICON = '../IconOrdner/ReiterIcons/Weltpfade/natuerliche-rohstoffe.png';
export const TENEBRIUM_ART = './public/assets/natural-resources/tenebrium';
const romanPages = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

function buildMaterialPage(page) {
  return {
    artifactPage: true,
    imageWidth: 100,
    description: page.description,
    stats: [['Zusammensetzung', page.composition], ['Erscheinung', page.appearance]],
    artifact: {
      archiveLabel: 'Natürliche Rohstoffe · Werkstoffakte',
      classification: page.title.split(' — ')[0], origin: '', condition: '', keeper: '', discovery: '',
      propertiesTitle: 'Eigenschaften', properties: page.properties,
      risksTitle: page.usesTitle || 'Einsatz & Weiterverarbeitung', risks: page.uses,
      historyTitle: page.comparisonTitle || 'Einordnung & Vergleich', historyText: page.comparison,
      footer: page.footer
    }
  };
}

function buildStoryPage(page) {
  return {
    description: `<p><em>${page.lead}</em></p>\n` + page.sections.map(section =>
      `<p><strong>${section.title}</strong></p>\n${section.paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('\n')}`
    ).join('\n')
  };
}

export function buildTenebrium() {
  return {
    id: 'tenebrium-erz', title: 'Tenebrium-Erz',
    subtitle: 'Violette Adern · gefürchtete Magieunterdrückung · kostbare Legierungen',
    type: 'Erz & Metall', category: `${NATURAL_RESOURCES_TAB} · Erz`,
    symbol: NATURAL_RESOURCES_ICON, image: `${TENEBRIUM_ART}/tenebrium.png`,
    icon: '✦', stamp: 'ERZ · WERKSTOFFE · ÜBERLIEFERUNG',
    multipage: true, appendCommentsPage: false, enablePageComments: true,
    pages: TENEBRIUM_PAGES.map((page, index) => ({
      pageTitle: `${romanPages[index]}. — ${page.title}`,
      image: `${TENEBRIUM_ART}/${page.key}.png`,
      imageFit: 'contain', imagePosition: 'center', imageWidth: 38, imageTall: true,
      ...(page.template === 'material' ? buildMaterialPage(page) : buildStoryPage(page)),
      commentSequence: []
    }))
  };
}

export function buildNaturalResourcesSections() {
  return [
    { tab: NATURAL_RESOURCES_TAB, path: [], icon: NATURAL_RESOURCES_ICON, description: 'Erze, Hölzer, Mineralien und Edelsteine der Welt.', sectionOnly: true },
    { tab: NATURAL_RESOURCES_TAB, path: ['Erz'], description: 'Erze, Metalle und ihre Legierungen.', entry: buildTenebrium() },
    { tab: NATURAL_RESOURCES_TAB, path: ['Holz'], description: 'Hölzer und ihre Eigenschaften.', sectionOnly: true },
    { tab: NATURAL_RESOURCES_TAB, path: ['Mineralien'], description: 'Mineralien und besondere natürliche Stoffe.', sectionOnly: true },
    { tab: NATURAL_RESOURCES_TAB, path: ['Edelsteine'], description: 'Edelsteine und kostbare Kristalle.', sectionOnly: true }
  ];
}
