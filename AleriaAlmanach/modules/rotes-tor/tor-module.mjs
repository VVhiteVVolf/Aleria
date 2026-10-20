import { TOR_ART, buildTorMenu } from './tor-menu.mjs';
import { TOR_EMBLEM, TOR_WORKING_PEOPLE, penruddPerson } from './tor-people.mjs';
import { TOR_ROOMS, torSceneImage } from './tor-rooms.mjs';
import { buildCarwynBiography, buildPenruddHouseBiography } from './tor-biography.mjs';
import { buildTorHierarchy } from './tor-hierarchy.mjs';
import { buildTorServices } from './tor-services.mjs';
import { buildTorEconomyPage } from './tor-economy.mjs';
import { expandGuestVacancies } from '../guest-register/guest-register-vacancies.mjs';
import { GWYNTHOR_BANNKREIS_PATH } from '../gwynthor-geography/gwynthor-section-layout.mjs';

export const TOR_ID = 'zum-roten-tor';
export const TOR_SECTION = Object.freeze({ key: 'Zum Roten Tor', tab: 'Völker & Kulturen', desc: 'Gasthof unmittelbar vor Gwynthors Nordtor.',
  path: Object.freeze([...GWYNTHOR_BANNKREIS_PATH, 'Zum Roten Tor']) });
const scene = id => ({ image: torSceneImage(id), imageWidth: 34, imageTall: true, imageFit: 'cover', imagePosition: 'center' });

function torGuestRegister() {
  const register = { title: 'Gäste am Roten Tor', subtitle: 'Mareds Hausbuch', location: 'Vor Gwynthors Nordtor · Bannkreis Gwynthor', portraitSize: 96,
    note: 'Ankunft, Kammer und Abreise werden hier vermerkt. Weitere Einträge können ergänzt werden; die Zahl der Eintragsfelder schafft keine zusätzlichen Betten.', sections: [] };
  expandGuestVacancies(register, { prefix: 'tor', sectionCount: 3 });
  return { schemaVersion: 1, commentThreadKey: 'tor-gaeste', pageTitle: 'Mareds Gästeverzeichnis', guestRegisterPage: true, guestRegister: register };
}

export function buildRotesTor(calendar) {
  const entry = { id: TOR_ID, title: 'Zum Roten Tor', subtitle: 'Ein Platz am Feuer · Gasthof und Herberge des Hauses Penrudd',
    type: 'Gasthof und Herberge', category: 'Bannkreis Gwynthor · unmittelbar vor dem Nordtor', symbol: TOR_EMBLEM, icon: '♧',
    image: torSceneImage('aussenansicht'), previewImage: torSceneImage('aussenansicht'), stamp: 'ZUM ROTEN TOR · HAUS PENRUDD',
    schemaVersion: 1, multipage: true, appendCommentsPage: false, enablePageComments: true,
    sessionCast: TOR_WORKING_PEOPLE.map(person => person.worldPersonId),
    pages: [
      { schemaVersion: 1, commentThreadKey: 'tor-einordnung', pageTitle: 'Zum Roten Tor', ...scene('aussenansicht'),
        description: '<p>Unmittelbar vor <strong>Gwynthors Nordtor</strong> steht ein helles Fachwerkhaus unter einem hohen Strohdach. Eine Bank schaut auf den Landweg, ein seitlicher Torbogen führt in den Wagenhof. An der roten Eingangstür schwingt die Laterne im Wind. Wer früh nach Gwynthor hineinwill oder nach der Ausfahrt noch eine Nacht bleiben muss, kennt <strong>Zum Roten Tor</strong>.</p><p>Fuhrleute, Händler, Reisende und Besucher der Stadt teilen die langen Bänke. Olwen kocht Suppe, Haustopf und Hofgerichte; Carwyn schenkt gewöhnliches Bier, Apfelwein und einfachen Tischwein aus. Das Haus bietet verlässliche, einfache bis mittlere Kost, saubere Kammern und einen trockenen Platz für Zugtiere.</p><p>Die <strong>Familie Penrudd</strong> betreibt die Herberge seit mehreren Generationen. Heute führen Carwyn und Olwen den Alltag. Ein Teil der Lebensmittel sowie Heu und Hafer kommen vom nahen Penrudd-Hof. Die Verwandten dort bleiben selbstständige Lieferanten mit eigener Hauskasse.</p>',
        stats: [['Lage', 'Bannkreis Gwynthor · direkt vor dem Nordtor'], ['Betreiber', 'Carwyn Penrudd und Olwen'], ['Haus', 'Penrudd · im Dienst des Hauses Draig'], ['Gäste', 'Fuhrleute, Händler und Reisende'], ['Umfang', '36 Schankplätze · sechs Kammern · zehn Betten'], ['Hof', 'Zehn Gastpferde · vier Wagenplätze'], ['Öffnung', 'Täglich · einfache bis mittlere Preislage']] },
      { schemaVersion: 1, commentThreadKey: 'tor-carwyn', pageTitle: 'Carwyn Penrudd · Der Wirt am Tor', biographyPage: true,
        image: penruddPerson('carwyn').portrait, imageWidth: 34, imageTall: true, imageFit: 'contain', biography: buildCarwynBiography(),
        stats: [['Geboren', '1694 · 46 Jahre'], ['Gemahlin', 'Olwen · 43 Jahre'], ['Aufgabe', 'Betreiber · Ausschank und Einkauf'], ['Kinder', 'Aled, Mared und Dewi']] },
      { schemaVersion: 1, commentThreadKey: 'tor-haus-penrudd', pageTitle: 'Haus Penrudd · Tor und Hof', biographyPage: true,
        image: `${TOR_ART}/portraits/gwilym.png`, imageWidth: 34, imageTall: true, imageFit: 'contain', biography: buildPenruddHouseBiography(),
        stats: [['Wappen', 'Rotes offenes Tor · helle Laterne'], ['Ältere Generation', 'Gwilym und Enid · Altenteil im Gasthof'], ['Hofzweig', 'Tudur und Bethan · Penrudd-Hof'], ['Lieferung', 'Bezahlte Waren · getrennte Kassen']] },
      { schemaVersion: 1, commentThreadKey: 'tor-personal', pageTitle: 'Die Hände am Roten Tor', hierarchyPage: true, hierarchy: buildTorHierarchy() },
      { schemaVersion: 1, commentThreadKey: 'tor-speis-trank', pageTitle: 'Olwens Hauskarte · Speis und Trank', tradeCatalogPage: true, tradeCatalog: buildTorMenu() },
      buildTorServices(), torGuestRegister(),
      ...TOR_ROOMS.map(room => ({ schemaVersion: 1, commentThreadKey: `tor-${room.id}`, pageTitle: room.title, ...scene(room.id), sessionPage: true,
        sessionIntro: `<p>${room.intro}</p>`, sessionHint: 'Eine Begegnung vor Gwynthors Toren.', sessionEmptyTitle: 'Ein Platz am Feuer',
        sessionEmptyText: 'Eine Ankunft, ein Gespräch oder die nächste Abreise kann hier beginnen.', sessionDateAleria: { year: null, month: null, day: null } }))
    ] };
  entry.pages.push(buildTorEconomyPage(entry, calendar));
  return entry;
}
