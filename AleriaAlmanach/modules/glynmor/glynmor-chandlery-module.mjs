import {
  GLYNMOR_EMBLEM, GLYNMOR_FAMILY_NAME, GLYNMOR_HOUSE_URL, GLYNMOR_MODULE_ID, GLYNMOR_TREE_URL
} from '../../../shared/glynmor/glynmor-identity.mjs';
import { GWYNTHOR_CITY_PATH } from '../gwynthor-geography/gwynthor-section-layout.mjs';
import { buildGlynmorChandleryHierarchy } from './glynmor-chandlery-hierarchy.mjs';
import {
  GLYNMOR_CHANDLERY_SCENES, GLYNMOR_SIGN, chandleryIllustration, glynmorSceneImage, glynmorServiceIcon
} from './glynmor-chandlery-scenes.mjs';

export const GLYNMOR_CHANDLERY_SECTION = Object.freeze({
  key: 'Kerzenmacherei Glynmor',
  tab: 'Völker & Kulturen',
  path: Object.freeze([...GWYNTHOR_CITY_PATH, 'Kerzenmacherei Glynmor']),
  iconUrl: GLYNMOR_SIGN,
  desc: 'Kerzenladen und Ziehwerkstatt der Familie Glynmor in Gwynthor-Stadt.'
});

const services = [
  ['alltagskerzen', 'Alltagskerzen', 'Einzelne Lichter und handgezogene Bündel für Tisch, Stube und Arbeitsplatz.'],
  ['festkerzen', 'Fest- und Andachtskerzen', 'Stärkere Lichter für Feiern, Andachten und Gedenktage. Größe und Ausführung werden am Tresen besprochen.'],
  ['arrangements', 'Kerzengestecke', 'Abgestimmte Ensembles aus Kerzen, Bändern und Trockenschmuck für Tafeln und Festräume.'],
  ['wappenkerzen', 'Kerzen mit Wappenrelief', 'Sonderanfertigungen nach einer mitgebrachten Vorlage. Vor der Serie wird ein Muster zur Ansicht gefertigt.'],
  ['lieferauftraege', 'Serien und Lieferaufträge', 'Gebündelte Bestellungen für Haushalte und Häuser. Größere Mengen können abgeholt oder nach Absprache ausgeliefert werden.']
];

function overviewPage() {
  return {
    schemaVersion: 1, pageTitle: 'Die Kerzenmacherei Glynmor', commentThreadKey: 'glynmor-ueberblick',
    ...chandleryIllustration('gasse'),
    description: '<p>Eine goldene Flamme auf grünem Grund weist in Gwynthor-Stadt den Weg zu den Glynmors. Im Laden gibt es einfache Tischlichter ebenso wie verzierte Kerzen für eine Festtafel. Hinter dem Tresen führt eine Tür zur Ziehwerkstatt. Größere Aufträge werden über den Hof abgeholt.</p>'
      + '<p>Die Glynmors ziehen seit Generationen Kerzen. Schon zur Zeit des Ritterfürsten Rhydderch Wyrm belieferten sie dessen Haus. Aus wiederkehrenden Bestellungen wuchs ein Vertrauensverhältnis. Heute führt Tudur Glynmor die Werkstatt, sein Sohn Emlyn ist Vogt des Hauses Wyrm. Meera dient Lady Rianna als Zofe und hilft in ihrer Freizeit bei den Kerzenarrangements.</p>'
      + `<p><a href="${GLYNMOR_HOUSE_URL}">${GLYNMOR_FAMILY_NAME}</a> · <a href="${GLYNMOR_TREE_URL.replace('&', '&amp;')}">Zum Stammbaum</a></p>`,
    stats: [['Ort', 'Gwynthor-Stadt'], ['Inhaber', 'Tudur Glynmor'], ['Handwerk', 'Kerzenziehen und Kerzenverzierung']]
  };
}

function servicesPage() {
  return {
    schemaVersion: 1, pageTitle: 'Kerzen und Aufträge', commentThreadKey: 'glynmor-dienstleistungen',
    ...chandleryIllustration('laden'),
    guildServicesPage: true,
    guildServices: {
      title: 'Kerzen für Stube, Fest und Andacht',
      introduction: '<p>Gängige Kerzen liegen im Laden bereit. Für ein Gesteck, ein eigenes Wappenmotiv oder eine größere Menge vereinbart die Werkstatt einen Termin.</p>',
      services: services.map(([key, title, description]) => ({ title, description, icon: glynmorServiceIcon(key) })),
      process: '<ol><li>An der Ladentheke Anlass, Menge und Termin besprechen.</li><li>Für Sonderformen ein Muster oder eine Wappenvorlage vorlegen.</li><li>Die Werkstatt bestätigt den Auftrag und hält ihn zur vereinbarten Übergabe bereit.</li></ol>',
      conditions: '<p>Bei Anfertigungen richten sich Aufwand und Preis nach Wachsmenge, Größe und Verzierung. Größere Abholungen erfolgen am Hof.</p>'
    }
  };
}

function scenePage(scene) {
  return {
    schemaVersion: 1, pageTitle: scene.title, commentThreadKey: `glynmor-${scene.key}`,
    ...chandleryIllustration(scene.key),
    sessionPage: true, sessionCast: scene.cast,
    sessionIntro: `<p>${scene.intro}</p>`, sessionHint: scene.hint,
    sessionEmptyTitle: 'Die Szene ist offen', sessionEmptyText: 'Der erste Beitrag eröffnet die Szene.',
    sessionDateAleria: { year: null, month: null, day: null }
  };
}

export function glynmorChandleryRegistration(family) {
  const image = glynmorSceneImage('gasse');
  const entry = {
    id: GLYNMOR_MODULE_ID, title: GLYNMOR_CHANDLERY_SECTION.key,
    subtitle: 'Kerzenladen und Familienwerkstatt in Gwynthor-Stadt', type: 'Bürgerliches Handwerk',
    category: GLYNMOR_CHANDLERY_SECTION.key, symbol: GLYNMOR_SIGN, crest: `../Stammbäume/${GLYNMOR_EMBLEM}`,
    image, previewImage: image, stamp: 'GLYNMOR · GWYNTHOR', schemaVersion: 1,
    multipage: true, appendCommentsPage: false, enablePageComments: true, sessionCast: [],
    pages: [
      overviewPage(),
      servicesPage(),
      {
        schemaVersion: 1, pageTitle: 'Betriebsordnung', commentThreadKey: 'glynmor-betriebsordnung',
        ...chandleryIllustration('ziehwerkstatt'), hierarchyPage: true,
        hierarchy: buildGlynmorChandleryHierarchy(family)
      },
      ...GLYNMOR_CHANDLERY_SCENES.map(scenePage)
    ]
  };
  return {
    ...GLYNMOR_CHANDLERY_SECTION, icon: GLYNMOR_CHANDLERY_SECTION.iconUrl,
    description: GLYNMOR_CHANDLERY_SECTION.desc, entry
  };
}
