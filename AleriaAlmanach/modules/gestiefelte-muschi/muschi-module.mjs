import { MUSCHI_ART, MUSCHI_SIGN, MUSCHI_PEOPLE, muschiPerson } from './muschi-people.mjs';
import { MUSCHI_ROOMS } from './muschi-rooms.mjs';
import { buildHelvianeBiography } from './muschi-biography.mjs';
import { buildMuschiHierarchy } from './muschi-hierarchy.mjs';
import { buildMuschiCatalog } from './muschi-catalog.mjs';
import { buildMuschiServices } from './muschi-services.mjs';
import { expandGuestVacancies } from '../guest-register/guest-register-vacancies.mjs';
export const MUSCHI_ID = 'gwynthor-gestiefelte-muschi';
export const MUSCHI_SECTION = Object.freeze({ key: 'Gwynthor', tab: 'Völker & Kulturen', desc: '', nodeId: 'node:volker-kulturen:cenyr/celtigerns-wacht/llamreis-ankunft/gwynthor', path: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'] });
const scene = id => ({ image: `${MUSCHI_ART}/scenes/${id}.png`, imageWidth: 34, imageTall: true, imageFit: 'cover', imagePosition: 'center' });
export function buildGestiefelteMuschi(drinkCatalogs) {
  const owner = muschiPerson('helviane');
  const guests = { title: 'Gästeverzeichnis', subtitle: 'Colettes Hausbuch · Zimmer, Besuche und Aufenthalte', location: 'Die Gestiefelte Muschi · Gwynthor', portraitSize: 96,
    note: 'Colette vermerkt Zimmergäste und Abendbesucher getrennt. Die sechs Kammern werden bei der Buchung zugeteilt; Ankunft, Abreise und besondere Wünsche bitte am Empfang abstimmen.', sections: [] };
  expandGuestVacancies(guests, { prefix: 'muschi', sectionCount: 8 });
  return { id: MUSCHI_ID, title: 'Die Gestiefelte Muschi', subtitle: 'Tanz, Trunk und eine Tür hinter dem Vorhang · Helviane Desele', type: 'Unterhaltungshaus', category: 'Gwynthor · Salon und Ausschank', icon: '♧',
    symbol: MUSCHI_SIGN, image: `${MUSCHI_ART}/scenes/aussenansicht.png`, previewImage: `${MUSCHI_ART}/scenes/aussenansicht.png`, stamp: 'DIE GESTIEFELTE MUSCHI · HELVIANE DESELE',
    schemaVersion: 1, multipage: true, appendCommentsPage: true, enablePageComments: true, sessionCast: MUSCHI_PEOPLE.map(p => p.worldPersonId), pages: [
      { schemaVersion: 1, commentThreadKey: 'muschi-einordnung', pageTitle: 'Die Gestiefelte Muschi', ...scene('aussenansicht'),
        description: '<p>Über der Tür tanzt eine weibliche Katze in übergroßen Stiefeln an einer Stange. Das geschnitzte Holzschild verspricht keine Vornehmheit, aber einen unterhaltsamen Abend. Hinter ihm liegt die <strong>Gestiefelte Muschi</strong>: Musik, tanzende Damen, kleine Spielrunden, viel Alkohol und Gesellschaft bis weit nach Mitternacht.</p><p>Söldner und Reisende kommen hier ebenso gern wegen der Bühne und der lockeren Tische wie wegen der hinteren Türen. Wer einen privaten Abend wünscht, spricht mit Mariette; wer nur trinken und lachen möchte, bleibt bei Rheunwaith. Zimmer werden im Obergeschoss vermietet. <strong>Speisen gibt es keine</strong> — für eine Mahlzeit empfiehlt selbst Helviane die pompösere Lachende Nixe.</p><p><strong>Helviane Desele, geborene Bielle</strong>, kaufte das Haus mit dem Vermögen, das sie aus Brevanor retten konnte. Die Heimat verlor sie an die Triarchie; ihren Geschäftssinn behielt sie. Zwischen gewöhnlichem Klosterbier und teuren Importen liegen in ihrem Keller noch wenige Flaschen Bielle-Wein und Desele-Champagnia, deren Preis inzwischen mehr mit Verlust und Seltenheit als mit Durst zu tun hat.</p>',
        stats: [['Ort', 'Gwynthor · Gassen nahe dem Hafen'], ['Inhaberin', 'Helviane Desele · geb. Bielle · 72 Jahre'], ['Abend', 'Tanz · Musik · Spiel · Gesellschaft'], ['Ausschank', 'Einfache Getränke und gute Importe'], ['Zimmer', 'Sechs Kammern · keine Verpflegung'], ['Herkunft', 'Brevanor · über Lothir nach Estryll']] },
      { schemaVersion: 1, commentThreadKey: 'muschi-helviane', pageTitle: 'Helviane Desele · Hinter dem Fächer', biographyPage: true,
        image: owner.portrait, imageWidth: 34, imageTall: true, imageFit: 'contain', stats: [['Geboren', '1668 · als Bielle in Brevanor'], ['Alter', '72 Jahre'], ['Angeheiratet', 'Haus Desele'], ['Fluchtweg', 'Brevanor → Lothir → Estryll'], ['Besitz', 'Die Gestiefelte Muschi in Gwynthor']], biography: buildHelvianeBiography() },
      { schemaVersion: 1, commentThreadKey: 'muschi-personal', pageTitle: 'Die Hände hinter dem Abend', hierarchyPage: true, hierarchy: buildMuschiHierarchy() },
      { schemaVersion: 1, commentThreadKey: 'muschi-gueter', pageTitle: 'Gläser, Rauch und alte Düfte', tradeCatalogPage: true, tradeCatalog: buildMuschiCatalog(drinkCatalogs) },
      buildMuschiServices(),
      { schemaVersion: 1, commentThreadKey: 'muschi-gaeste', pageTitle: 'Colettes Gästeverzeichnis', guestRegisterPage: true, guestRegister: guests },
      ...MUSCHI_ROOMS.map(room => ({ schemaVersion: 1, commentThreadKey: `muschi-${room.id}`, pageTitle: room.title, ...scene(room.id), sessionPage: true,
        sessionIntro: `<p>${room.intro}</p>`, sessionHint: 'Ein Abend in der Gestiefelten Muschi.', sessionEmptyTitle: 'Der nächste Gast ist noch unterwegs', sessionEmptyText: 'Eine Runde am Tisch, ein Auftritt oder eine Begegnung hinter den Vorhängen kann hier beginnen.', sessionDateAleria: { year: null, month: null, day: null } }))
    ] };
}
