import { KLAUE_ID, KLAUE_ART, KLAUE_LIVING, VALERUS_FAMILY_LINK } from './klaue-people.mjs';
import { POST_SECTION } from '../klingende-muenze-gwynthor/post-section.mjs';
import { buildValerusBiography } from './klaue-biography.mjs';
import { buildKlaueHierarchy } from './klaue-hierarchy.mjs';
import { buildKlaueServices } from './klaue-services.mjs';
import { KLAUE_ROOMS } from './klaue-rooms.mjs';
export const KLAUE_SECTION = POST_SECTION;
const image = key => ({ image: `${KLAUE_ART}/scenes/${key}.png`, imageWidth: 34, imageTall: true, imageFit: 'cover', imagePosition: 'center' });
export function buildRoteKlaue() {
  return { id: KLAUE_ID, title: 'Die rote Klaue', subtitle: 'Geld auf Zeit · Pfandhaus der Geschwister Valerus', type: 'Geldverleih, Wechsel und Pfandhaus',
    category: 'Gwynthor-Stadt · Klingende Münze', icon: '◈', symbol: `${KLAUE_ART}/ladenschild.png`,
    image: `${KLAUE_ART}/scenes/aussenansicht.png`, previewImage: `${KLAUE_ART}/scenes/aussenansicht.png`, stamp: 'DIE ROTE KLAUE · HAUS VALERUS',
    schemaVersion: 1, multipage: true, appendCommentsPage: false, enablePageComments: true, economyCalculationDeferred: true,
    sessionCast: KLAUE_LIVING.map(person => person.worldPersonId), pages: [
      { schemaVersion: 1, commentThreadKey: 'klaue-einordnung', pageTitle: 'Die rote Klaue', ...image('aussenansicht'),
        description: '<p>Eine rote Drachenklaue greift auf dem ovalen Holzschild über der Tür ins Leere. Wenn der Wind durch die Gasse zieht, knarren seine eisernen Scharniere. Dahinter ist es warm, sauber und still genug, dass man das Aufsetzen eines Gewichts auf der Waage bis zur Bank am Eingang hört.</p><p><strong>Die rote Klaue</strong> verleiht Geld, wechselt Münzen und nimmt Wertstücke als Pfand. <strong>Lucan und Camilla Valerus</strong> führen den Laden gemeinsam. Lucan findet für beinahe jede Notlage ein freundliches Wort; Camilla legt den dazugehörigen Zettel bereit. Seine Gemahlin <strong>Aerwen</strong> widmet ihre Aufmerksamkeit lieber den Kunden, deren Geld nicht erst beschafft werden muss.</p><p>Der Betrieb gehört als Kooperationspartner zur <strong>Klingenden Münze</strong>. Ein Konto und vereinbarte Finanzierungen bei der Roten Bank halten Kapital verfügbar; drei Legionäre der Roten Kompanie sichern Schalter und Magazin. Die ausgediente Rüstung des Gründers Decian steht im Laden auf einer Büste. Wer danach fragt, hört zum ersten Mal an diesem Tag ein Angebot, über das sich nicht verhandeln lässt.</p>',
        stats: [['Ort', 'Gwynthor-Stadt · Marktviertel, auf dem Weg zum Gildenkontor'], ['Inhaber', 'Lucan & Camilla Valerus · Zwillinge, 33 Jahre'], ['Gründung', '1712 durch Decian Valerus'], ['Verbund', 'Klingende Münze · Rote Bank · Rote Kompanie'], ['Leistungen', 'Pfandkredite, Schuldbriefe, Münzwechsel und Wertschätzung'], ['Erinnerungsstück', 'Decians Kompanieharnisch · unverkäuflich']] },
      { schemaVersion: 1, commentThreadKey: 'klaue-familienbio', pageTitle: 'Haus Valerus · Zwei Unterschriften', ...image('familie'), biographyPage: true, biography: buildValerusBiography() },
      { schemaVersion: 1, commentThreadKey: 'klaue-stammbaum', pageTitle: 'Familie Valerus · Der Stammbaum', familyTreePage: true,
        familyTree: { familyId: 'haus-valerus', source: VALERUS_FAMILY_LINK, title: 'Haus Valerus', height: 690,
          intro: 'Unbekannte Gründer → Hausknoten → Zeitsprung zu Decian und Severina → Lucan und Camilla. Lucan ist mit Aerwen verheiratet; Camilla ist unverheiratet.' } },
      { schemaVersion: 1, commentThreadKey: 'klaue-hierarchie', pageTitle: 'Die Hände der Klaue', hierarchyPage: true, hierarchy: buildKlaueHierarchy() },
      { schemaVersion: 1, commentThreadKey: 'klaue-pfandsortiment', pageTitle: 'Das Pfandsortiment', tradeCatalogPage: true,
        tradeCatalog: { title: 'Pfandsortiment', subtitle: 'Zur Verwertung freigegebene Einzelstücke', headerIcon: `${KLAUE_ART}/ladenschild.png`,
          categories: [{ id: 'schmuck', label: 'Schmuck & Wertstücke' }, { id: 'geraet', label: 'Werkzeug & Gerät' }, { id: 'sonstiges', label: 'Sonstige Pfänder' }],
          allLabel: 'Alle freigegebenen Stücke', searchPlaceholder: 'Pfandstück suchen …', items: [], footerCards: [],
          noteIcon: '◈', noteTitle: 'Noch keine Stücke angeschlagen', noteText: 'Hier werden einzelne rechtmäßig zur Verwertung freigegebene Pfänder angeboten. Derzeit sind keine Waren eingetragen. Hinterlegte Kundensachen und Decians Erinnerungsrüstung stehen nicht zum Verkauf.' } },
      buildKlaueServices(),
      ...KLAUE_ROOMS.map(room => ({ schemaVersion: 1, commentThreadKey: `klaue-${room.key}`, pageTitle: room.title, image: room.image,
        imageWidth: 34, imageTall: true, imageFit: 'cover', imagePosition: 'center', sessionPage: true, sessionIntro: `<p>${room.intro}</p>`,
        sessionHint: 'Ein Anliegen in der Roten Klaue.', sessionEmptyTitle: 'Der Platz am Schalter ist frei', sessionEmptyText: 'Ein Pfand, ein Darlehen oder eine Frage zu einem alten Zettel kann hier zur Sprache kommen.',
        sessionDateAleria: { year: null, month: null, day: null } }))
    ] };
}
