import { GWYNTHOR_CITY_PATH } from '../gwynthor-geography/gwynthor-section-layout.mjs';
import { MARKETPLACE_SCENES } from './marketplace-scenes.mjs';

export const MARKETPLACE_ID = 'gwynthor-marktplatz';
export const MARKETPLACE_ART = './public/assets/gwynthor-marktplatz';
export const MARKETPLACE_SECTION = Object.freeze({
  key: 'Gwynthor-Stadt', tab: 'Völker & Kulturen',
  path: GWYNTHOR_CITY_PATH,
  description: 'Bespielbare Orte in Gwynthor-Stadt.'
});

const illustration = id => ({
  image: `${MARKETPLACE_ART}/${id}-v1.webp`, imageWidth: 34,
  imageTall: true, imageFit: 'cover', imagePosition: 'center'
});

export function buildGwynthorMarketplace() {
  return {
    id: MARKETPLACE_ID, title: 'Gwynthor Marktplatz',
    subtitle: 'Marktstände, vier Parkwinkel und Begegnungen im Herzen der Stadt',
    type: 'Interaktive Szene', category: 'Gwynthor-Stadt · Schauplätze',
    icon: '❧', stamp: 'GWYNTHOR · MARKTPLATZ',
    image: `${MARKETPLACE_ART}/marktstaende-v1.webp`,
    previewImage: `${MARKETPLACE_ART}/marktstaende-v1.webp`,
    schemaVersion: 1, multipage: true,
    appendCommentsPage: false, enablePageComments: false, sessionCast: [],
    pages: [
      {
        schemaVersion: 1, pageTitle: 'Gwynthor Marktplatz',
        commentThreadKey: 'gwynthor-marktplatz-ueberblick',
        ...illustration('marktstaende'),
        description: '<p>Auf <strong>Gwynthors Marktplatz</strong> wechseln Gemüse, Fisch, Brot und Neuigkeiten die Hände. Zwischen den Ständen plätschert der Brunnen, vor der Anzeigetafel drängen sich die Lesenden, und am Parkweg erklingt Musik.</p><p>Ein Park mit vier unterschiedlichen Winkeln umgibt den Platz: <strong>Lindenhain im Norden, Rosengarten im Osten, Schattengarten im Süden und Spielwiese im Westen</strong>. Von jedem Bereich führt ein kurzer Weg zurück ins Marktleben.</p><p>Die folgenden acht Orte sind als eigene Szenen bespielbar.</p>'
      },
      ...MARKETPLACE_SCENES.map(scene => ({
        schemaVersion: 1, pageTitle: scene.title,
        commentThreadKey: `gwynthor-marktplatz-${scene.id}`,
        ...illustration(scene.id),
        sessionPage: true, sessionIntro: scene.intro,
        sessionLocation: `Gwynthor-Stadt · ${scene.title}`,
        sessionHint: scene.hint, sessionEmptyTitle: scene.emptyTitle,
        sessionEmptyText: scene.emptyText,
        sessionDateAleria: { year: null, month: null, day: null }
      }))
    ]
  };
}
