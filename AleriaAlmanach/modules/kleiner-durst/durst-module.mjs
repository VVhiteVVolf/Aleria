import { DURST_ART, RHWYD_EMBLEM, DURST_LIVING, durstPerson } from './durst-people.mjs';
import { DURST_ROOMS } from './durst-rooms.mjs';
import { buildDurstHierarchy } from './durst-hierarchy.mjs';
import { buildDurstMenu } from './durst-menu.mjs';
export const DURST_ID = 'gwynthor-zum-kleinen-durst';
export const DURST_SECTION = Object.freeze({ key: 'Gwynthor', tab: 'Völker & Kulturen', desc: '',
  nodeId: 'node:volker-kulturen:cenyr/celtigerns-wacht/llamreis-ankunft/gwynthor', path: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'] });
const scene = id => ({ image: `${DURST_ART}/scenes/${id}.png`, imageWidth: 34, imageTall: true, imageFit: 'cover', imagePosition: 'center' });
export function buildKleinerDurst() {
  const owner = durstPerson('iorwerth');
  return { id: DURST_ID, title: 'Zum Kleinen Durst', subtitle: 'Ein billiger Becher direkt am Kai · Haus Rhwyd',
    type: 'Hafenkneipe', category: 'Gwynthor · Fischer und Matrosen', icon: '♧', symbol: RHWYD_EMBLEM,
    image: `${DURST_ART}/scenes/aussenansicht.png`, previewImage: `${DURST_ART}/scenes/aussenansicht.png`, stamp: 'ZUM KLEINEN DURST · DIREKT AM KAI',
    schemaVersion: 1, multipage: true, appendCommentsPage: true, enablePageComments: true,
    sessionCast: DURST_LIVING.map(p => p.worldPersonId),
    pages: [
      { schemaVersion: 1, commentThreadKey: 'durst-haus', pageTitle: 'Zum Kleinen Durst', ...scene('aussenansicht'),
        description: '<p>Von den Fischerkähnen führt der kürzeste Weg zum <strong>Kleinen Durst</strong>. Die niedrige Tür liegt unmittelbar an den Docks. Über ihr hängt ein winziger gemalter Becher; dahinter stehen fünf ungleiche Tische, ein schmaler Tresen und ein Kamin, vor dem der alte Hund schläft. Fischer und Matrosen kommen, weil sie hier billig trinken können und unter sich bleiben, ohne sich in einer volleren Veteranenkneipe mit Rittern oder Söldnern um einen Platz zu drängen.</p>' +
          '<p>Das Haus ist abgenutzt und die Auswahl klein. Nia kocht aus günstigem Fisch, Gerste, Kohl und Wurzeln. Es gibt keine Gästezimmer und keine feine Tafel. Ein trockener Sitz, eine warme Schüssel und ein bezahlbarer Becher müssen genügen.</p>' +
          '<p><strong>Efa und ihr Sohn Iorwerth Rhwyd</strong> führen die überschuldete Kneipe mit Mühe weiter. Die vielen kleinen Zechen bezahlen Fass, Fang, Brennholz und den nächsten dringenden Handgriff. Reich wird hier niemand. Dass die Hafenleute lieber wiederkommen, als anderswo mehr auszugeben, hält die Tür offen.</p>',
        stats: [['Ort', 'Direkt an Gwynthors Docks'], ['Inhaber', 'Efa und Iorwerth Rhwyd'], ['Gäste', 'Fischer, Matrosen und kleine Hafenleute'], ['Plätze', 'Etwa zwanzig · fünf kleine Tische'], ['Küche', 'Vier einfache Gerichte · ein seltener Monatsfang'], ['Übernachtung', 'Keine Zimmervermietung']] },
      { schemaVersion: 1, commentThreadKey: 'durst-erbe', pageTitle: 'Efa und Iorwerth · Das schwere Erbe',
        biographyPage: true, image: owner.portrait, imageWidth: 34, imageTall: true, imageFit: 'contain',
        stats: [['Iorwerth', '1705 geboren · 35 Jahre'], ['Efa', '1670 geboren · 70 Jahre'], ['Vier Brüder', 'Alle 1720 gefallen'], ['Gethin', '1666–1728 · früherer Inhaber'], ['Heute', 'Überschuldet · der Betrieb trägt den Alltag']],
        biography: { crestImage: RHWYD_EMBLEM, biographyTitle: 'Derjenige, der geblieben ist',
          biographyText: '<p>1720 wurden vier der fünf Söhne Gethins und Efas in den Krieg geschickt. Aled, Carwyn, Hywel und Dafydd kehrten nicht lebend zurück. Iorwerth war damals erst fünfzehn und blieb zu Hause. Heute säubert er hinter dem Tresen einen Krug nach dem anderen und sieht zum nächsten Gast auf, als hätte der Abend schon vor Stunden enden sollen.</p>',
          historyTitle: 'Was der Krieg im Haus zurückließ',
          historyText: '<p>Gethin fand nach dem Verlust seiner Söhne keinen Halt mehr. Er trank sich über die folgenden Jahre zugrunde und starb 1728. Efa und Iorwerth übernahmen eine verschuldete Kneipe und gerieten selbst immer tiefer in die Verpflichtungen. Die Stammgäste halten das Haus über Wasser; für einen wirklichen Abbau der Schulden bleibt zu wenig übrig.</p><p>Efa ist alt geworden. Ihr Haar ist längst grau, ihre Bewegungen bedächtig, ihr Lächeln schwach. Sie zählt noch immer die Münzen und kennt die Stellen, an denen sich ein wenig sparen lässt. Iorwerth führt Tresen und Einkauf. Beide können auf Nia, Meleri und Dewi zählen; Carys ist die einzige bezahlte Hilfe.</p>',
          abilitiesTitle: 'Was den Laden offen hält', abilities: [{ title: 'Kleine Rechnungen', icon: '◈', detail: 'Efa kennt Vorräte und offene Verpflichtungen; Iorwerth kauft, was die Tageskasse erlaubt.' }, { title: 'Vertraute Gesichter', icon: '♧', detail: 'Fischer und Matrosen kommen wegen der niedrigen Preise und des unaufgeregten Umgangs wieder.' }],
          worksTitle: 'Der tägliche Betrieb', works: ['Schank, Einkauf und Spüle unter Iorwerth; Efa hält Kasse und Haus zusammen.', 'Nia kocht, Meleri bedient, Dewi hilft überall; Carys übernimmt die übrige Hausarbeit.'],
          triviaTitle: 'Familie', trivia: ['Iorwerth und Nia sind seit 1725 verheiratet. Ihr Sohn Dewi wurde 1726 geboren.', 'Meleri ist unverheiratet und arbeitet weiterhin im Haus. Die Herkunftshäuser Efas und Nias bleiben offen.'],
          quotesTitle: 'Wahlspruch der Rhwyd', quotes: ['Wir bleiben.'], connectionsTitle: 'Die Lebenden im Haus',
          connections: ['efa', 'meleri', 'nia', 'dewi'].map(key => { const p = durstPerson(key); return { name: p.name, detail: p.role, image: p.portrait }; }),
          documentsTitle: 'Die Familie', documents: [{ title: 'Haus Rhwyd', icon: RHWYD_EMBLEM, text: 'Unbekannte Gründer, Überlieferungssprung und die heutige Familie mit den vier gefallenen Brüdern.', link: '../Stammbäume/Stammbaum.html?family=haus-rhwyd&mode=view' }] } },
      { schemaVersion: 1, commentThreadKey: 'durst-haende', pageTitle: 'Die Hände des Hauses', hierarchyPage: true, hierarchy: buildDurstHierarchy() },
      { schemaVersion: 1, commentThreadKey: 'durst-karte', pageTitle: 'Die kleine Karte', tradeCatalogPage: true, tradeCatalog: buildDurstMenu() },
      ...DURST_ROOMS.map(room => ({ schemaVersion: 1, commentThreadKey: `durst-${room.id}`, pageTitle: room.title, ...scene(room.id),
        sessionPage: true, sessionIntro: `<p>${room.intro}</p>`, sessionHint: 'Eine Begegnung im Kleinen Durst.',
        sessionEmptyTitle: 'Ein Platz ist noch frei', sessionEmptyText: 'Hier beginnt die nächste Begegnung am Hafen.', sessionDateAleria: { year: null, month: null, day: null } }))
    ] };
}
