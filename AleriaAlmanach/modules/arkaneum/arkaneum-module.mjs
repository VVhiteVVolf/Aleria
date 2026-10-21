import { GWYNTHOR_CITY_PATH } from '../gwynthor-geography/gwynthor-section-layout.mjs';
import { ARKANEUM_ART, ARKANEUM_STAFF, arkaneumPerson } from './arkaneum-people.mjs';
import { buildHerluinBiography, buildLothaireBiography } from './arkaneum-biography.mjs';
import { buildArkaneumHierarchy } from './arkaneum-hierarchy.mjs';
import { buildArkaneumCatalog } from './arkaneum-goods.mjs';
import { buildArkaneumServices } from './arkaneum-services.mjs';
import { ARKANEUM_ROOMS, arkaneumSceneImage } from './arkaneum-rooms.mjs';

export const ARKANEUM_ID = 'lothaires-arkaneum';
export const ARKANEUM_SECTION = Object.freeze({ key: 'Gwynthor-Stadt', tab: 'Völker & Kulturen', desc: 'Orte und Geschäfte innerhalb Gwynthors.', path: [...GWYNTHOR_CITY_PATH] });
const image = id => ({ image: arkaneumSceneImage(id), imageWidth: 34, imageTall: true, imageFit: 'cover', imagePosition: 'center' });
const goodsPage = (department, own) => ({ schemaVersion: 1, commentThreadKey: `arkaneum-${own ? 'eigenes' : 'standard'}-${department}`,
  pageTitle: `${own ? 'Eigenes Sortiment' : 'Standardsortiment'} · ${department === 'alchemie' ? 'Alchemie' : 'Arkanes'}`, tradeCatalogPage: true, tradeCatalog: buildArkaneumCatalog(department, own) });

export function buildArkaneum() {
  return { id: ARKANEUM_ID, title: 'Lothaires Arkaneum', subtitle: 'Wurzel, Glas und Widerspruch · Am Park von Gwynthor',
    type: 'Alchemist und Arkanist', category: 'Gwynthor-Stadt · Parkviertel', icon: '⚗', symbol: `${ARKANEUM_ART}/ladenschild.png`,
    image: arkaneumSceneImage('aussenansicht'), previewImage: arkaneumSceneImage('aussenansicht'), stamp: 'LOTHAIRES ARKANEUM',
    schemaVersion: 1, multipage: true, appendCommentsPage: false, enablePageComments: true,
    economyCalculationDeferred: true,
    sessionCast: ARKANEUM_STAFF.map(person => person.worldPersonId), pages: [
      { schemaVersion: 1, commentThreadKey: 'arkaneum-einordnung', pageTitle: 'Lothaires Arkaneum', ...image('aussenansicht'),
        description: '<p>Am Rand des <strong>Parks von Gwynthor</strong>, nahe dem Badehaus, hängt ein silbergerahmtes Holzschild über einer schmalen Tür. Ein grinsender Mann mit wildem Haar hält darauf eine purpurne Kugel. Die Gestalt hinter dem Tresen sieht der Malerei erstaunlich ähnlich.</p><p><strong>Lothaires Arkaneum</strong> führt gewöhnliche Kräuter, Laborgerät und arkanen Grundbedarf. Hinter dem Verkauf liegen Herluins Werkstatt, die Vorratskammer und ein kleiner Kräutergarten. Wer eine leere Phiole braucht, ist ebenso willkommen wie jemand, der ein ungewöhnliches Fundstück erklären lassen möchte.</p><p>Herluin Lothaire hat die Magiergilde längst hinter sich gelassen. Sein Sohn Rhydian, Enkel Maelwyn und acht weitere Hände halten den Alltag zusammen. Drei von ihnen ziehen regelmäßig hinaus, um das zu finden, was zwischen den Gartenmauern nicht wächst.</p>',
        stats: [['Ort', 'Gwynthor-Stadt · am Park, nahe dem Badehaus'], ['Inhaber', 'Herluin Lothaire · aus Brevanor'], ['Handwerk', 'Kräuterkunde, Alchemie und arkane Arbeiten'], ['Beschaffung', 'Hinterhofgarten · drei Beschaffer · gewöhnlicher Zukauf'], ['Gilde', 'Aus der Magiergilde ausgeschlossen']] },
      { schemaVersion: 1, commentThreadKey: 'arkaneum-herluin', pageTitle: 'Herluin Lothaire · Der Amethystblick', biographyPage: true,
        image: arkaneumPerson('herluin-lothaire').portrait, imageWidth: 34, imageTall: true, imageFit: 'contain', biography: buildHerluinBiography(), stats: [['Alter', '163 Jahre · wirkt etwa 33'], ['Herkunft', 'Brevanor'], ['Studium', 'Vor rund 120 Jahren in der Blutstadt']] },
      { schemaVersion: 1, commentThreadKey: 'arkaneum-familie', pageTitle: 'Lothaire und O’Cenyr · Drei Generationen', biographyPage: true,
        ...image('drei-generationen'), biography: buildLothaireBiography() },
      { schemaVersion: 1, commentThreadKey: 'arkaneum-betrieb', pageTitle: 'Das Arkaneum · Zwischen Garten und Werkbank', ...image('labor'),
        description: '<p>Der Verkauf beginnt bei den gewöhnlichen Dingen. Kräuter werden getrocknet, Gefäße gereinigt, Mengen abgewogen und Vorräte geprüft. <strong>Rhydian</strong> hält die alltäglichen Zubereitungen im Blick. <strong>Nauthagerd</strong> nimmt Lieferungen an, trennt leere Gefäße von Ansätzen und schreibt die nächste Besorgungsliste.</p><p><strong>Cyrwyn, Torvald und Rioneth</strong> ziehen nach Bedarf ins Umland. Jagdfunde, Wurzeln, Pilze und Harze ergänzen den Garten. Nicht jeder Weg bringt einen brauchbaren Fund zurück. Seltene Materialien kommen unregelmäßig und werden gesondert verwahrt.</p><p><strong>Herluin und Maelwyn</strong> arbeiten an arkanen Fragen und einzelnen Werkstücken. Der Lehrling hält die Mitschriften ordentlicher als sein Meister. <strong>Perban</strong> sorgt dafür, dass Material, Lohn und Auftrag in den Büchern ihren Platz behalten. Die Brüder <strong>Neddric und Saithen</strong> erledigen Stadtwege; <strong>Jeradis</strong> kümmert sich um die Hausarbeit.</p>',
        stats: [['Gewöhnliche Kräuter', 'Garten und Zukauf'], ['Fundstücke', 'Drei tägliche Beschaffer nach Bedarf'], ['Lager', 'Trockene Vorräte und verschlossener besonderer Schrank'], ['Aufträge', 'Sichtung, Absprache und Eintrag ins Buch']] },
      { schemaVersion: 1, commentThreadKey: 'arkaneum-hierarchie', pageTitle: 'Die Hände des Arkaneums', hierarchyPage: true, hierarchy: buildArkaneumHierarchy() },
      goodsPage('alchemie', false), goodsPage('arkanes', false), goodsPage('alchemie', true), goodsPage('arkanes', true),
      buildArkaneumServices(),
      ...ARKANEUM_ROOMS.map(room => ({ schemaVersion: 1, commentThreadKey: `arkaneum-${room.id}`, pageTitle: room.title, ...image(room.id), sessionPage: true,
        sessionIntro: `<p>${room.intro}</p>`, sessionHint: 'Ein Besuch in Lothaires Arkaneum.', sessionEmptyTitle: 'Die Türglocke hat noch nicht geklungen',
        sessionEmptyText: 'Ein Anliegen, ein Fund oder ein neuer Versuch kann hier beginnen.', sessionDateAleria: { year: null, month: null, day: null } }))
    ] };
}
