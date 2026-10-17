import { PATRIARCH, ARIANWEN, PEREDUR, ANGHARAD, CHURCH_SYMBOL, CATHEDRAL_ART } from './cathedral-people.mjs';
import { buildCathedralHierarchy } from './cathedral-hierarchy.mjs';
import { buildPatriarchBiography } from './patriarch-biography.mjs';
import { CATHEDRAL_ROOMS } from './cathedral-rooms.mjs';

export const CATHEDRAL_ID = 'gwynthor-kathedrale-der-neun';
export const CATHEDRAL_SECTION = Object.freeze({
  key: 'Gwynthor', tab: 'Völker & Kulturen', desc: '',
  nodeId: 'node:volker-kulturen:cenyr/celtigerns-wacht/llamreis-ankunft/gwynthor',
  path: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']
});
const scene = id => ({ image: `${CATHEDRAL_ART}/${id}.png`, imageWidth: 34, imageTall: true, imageFit: 'cover', imagePosition: 'center' });

export function buildGwynthorCathedral() {
  return {
    id: CATHEDRAL_ID, title: 'Große Kathedrale der Neun',
    subtitle: 'Geistliches Herz Gwynthors · Unter Patriarch Gwalchgwyn Saethwyr',
    type: 'Kirchliche Ordnung · Kathedrale', category: 'Gwynthor · Kirche und Glaube',
    image: `${CATHEDRAL_ART}/kathedrale.png`, previewImage: `${CATHEDRAL_ART}/kathedrale.png`,
    symbol: CHURCH_SYMBOL, icon: '✦', stamp: 'DIE NEUN · GWYNTHOR · CELTIGERNS WACHT',
    schemaVersion: 1, multipage: true, appendCommentsPage: true, enablePageComments: true,
    sessionCast: [PATRIARCH, ARIANWEN, PEREDUR, ANGHARAD].map(person => person.worldPersonId),
    pages: [
      { schemaVersion: 1, commentThreadKey: 'kathedrale-einordnung', pageTitle: 'Die Große Kathedrale der Neun', ...scene('kathedrale'),
        stats: [['Ort', 'Im Herzen Gwynthors'], ['Widmung', 'Den Neun Göttlichen'], ['Kirche', 'Alerische Kirche · Cenyr'], ['Oberste geistliche Leitung', 'Patriarch Gwalchgwyn Saethwyr'], ['Enger Kreis', 'Neun hohe Prälaten · persönlicher Stab']],
        description: '<p>Über den Dächern im Herzen Gwynthors erhebt sich die <strong>Große Kathedrale der Neun</strong>. Ihre Türme tragen das Geläut über die Stadt, ihre Portale öffnen sich zur Gemeinde. Unter hohen Gewölben kommen die Menschen zum Gebet, zum Gottesdienst und mit jenen Anliegen zusammen, die sich nicht allein durch Münze oder weltliches Recht beantworten lassen.</p>' +
          '<p>Die Kathedrale ist den <strong>Neun Göttlichen</strong> gewidmet und untersteht <strong>Patriarch Gwalchgwyn Saethwyr</strong>. Als oberster Geistlicher Celtigerns Wacht führt er hier die Gemeinde Gwynthors und seinen persönlichen kirchlichen Kreis. Neun hohe Prälaten stehen unmittelbar nach ihm an der Spitze der örtlichen geistlichen Ordnung; aus ihrem Kreis wird nach seinem Tod der nächste Patriarch hervorgehen.</p>' +
          '<p>Gebet und Seelsorge, Beratung und Fürsorge prägen das Haus. Neben den Dienern des Patriarchen stehen Paladine und Kirchritter für Schutz und Geleit bereit. Menschen in Buße finden geistliche Führung mit dem Ziel, eines Tages wieder frei in die Gesellschaft zurückzukehren.</p>' },
      { schemaVersion: 1, commentThreadKey: 'kathedrale-patriarch', pageTitle: 'Gwalchgwyn · Patriarch von Celtigerns Wacht',
        biographyPage: true, image: PATRIARCH.portrait, imageWidth: 34, imageFit: 'contain', imageTall: true,
        stats: [['Name', PATRIARCH.name], ['Geboren', '1680 · 60 Jahre'], ['Amt', PATRIARCH.role], ['Sitz', 'Große Kathedrale der Neun · Gwynthor'], ['Familie', 'Haus Saethwyr · Gemahlin Melyn, geb. Arth']],
        biography: buildPatriarchBiography() },
      { schemaVersion: 1, commentThreadKey: 'kathedrale-stab', pageTitle: 'Der enge Kreis des Patriarchen', hierarchyPage: true, hierarchy: buildCathedralHierarchy() },
      ...CATHEDRAL_ROOMS.map(room => ({
        schemaVersion: 1, commentThreadKey: `kathedrale-${room.id}`, pageTitle: room.title, ...scene(room.id),
        sessionPage: true, sessionIntro: `<p>${room.intro}</p>`, sessionHint: 'Eine Begegnung in der Kathedrale.',
        sessionEmptyTitle: 'Die Kathedrale wartet auf ihre Stimmen', sessionEmptyText: 'Hier kann die nächste Szene beginnen.',
        sessionDateAleria: { year: null, month: null, day: null }
      }))
    ]
  };
}
