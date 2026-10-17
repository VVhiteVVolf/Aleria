import { FONTANI_PEOPLE, CASSIANO, LIVIA, TERENZIO, FONTANI_EMBLEM, BATHHOUSE_ART } from './bathhouse-people.mjs';
import { BATHHOUSE_ROOMS } from './bathhouse-rooms.mjs';
import { buildBathhouseHierarchy } from './bathhouse-hierarchy.mjs';
import { buildBathhouseServices } from './bathhouse-services.mjs';

export const BATHHOUSE_ID = 'gwynthor-badehaus-fontani';
export const BATHHOUSE_SECTION = Object.freeze({ key: 'Gwynthor', tab: 'Völker & Kulturen', desc: '',
  nodeId: 'node:volker-kulturen:cenyr/celtigerns-wacht/llamreis-ankunft/gwynthor',
  path: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'] });
const scene = id => ({ image: `${BATHHOUSE_ART}/scenes/${id}.png`, imageWidth: 34, imageTall: true, imageFit: 'cover', imagePosition: 'center' });

export function buildGwynthorBathhouse() {
  return {
    id: BATHHOUSE_ID, title: 'Badehaus der Fontani', subtitle: 'Argentische Badekunst in Gwynthor · Aqua et Quies',
    type: 'Badehaus', category: 'Gwynthor · Bad und Erholung',
    image: `${BATHHOUSE_ART}/scenes/aussenansicht.png`, previewImage: `${BATHHOUSE_ART}/scenes/aussenansicht.png`,
    symbol: FONTANI_EMBLEM, icon: '♨', stamp: 'HAUS FONTANI · WASSER UND RUHE',
    schemaVersion: 1, multipage: true, appendCommentsPage: true, enablePageComments: true,
    sessionCast: FONTANI_PEOPLE.map(p => p.worldPersonId),
    pages: [
      { schemaVersion: 1, commentThreadKey: 'fontani-einordnung', pageTitle: 'Das Badehaus der Fontani', ...scene('aussenansicht'),
        stats: [['Ort', 'Gwynthor'], ['Inhaber', CASSIANO.name], ['Herkunft des Hauses', 'Kaiserreich Argentum'], ['Wahlspruch', 'Aqua et Quies · Wasser und Ruhe'], ['Umfang', 'Kleine Badehalle · zwei private Wannenstuben']],
        description: '<p>Hinter hellen Rundbögen und einer schweren Holztür liegt das <strong>Badehaus der Fontani</strong>. Statt weitläufiger Säle bietet es eine kleine warme Badehalle, eine Schwitznische und zwei private Wannenstuben. Hier werden die Spuren des Arbeitstages abgewaschen, müde Glieder gewärmt und Neuigkeiten in gedämpften Stimmen ausgetauscht.</p>' +
          '<p>Die aus dem <strong>Kaiserreich Argentum</strong> stammende Familie lebt seit mehreren Generationen in Gwynthor. Ihre Vorfahren errichteten das Haus nach argentischer Baukunst und gaben das Wissen um Wasserführung und Heizung weiter. Ein eigener Brunnen speist den erhöhten Vorrat; von dort fließt Wasser durch Gefälle zu den Waschplätzen. Holzfeuer wärmen einen offenen Wasserkessel sowie die unter dem Boden verlaufenden Heizräume. Rauch zieht durch getrennte Feuerzüge zum Schornstein; gebrauchtes Wasser verlässt das Haus über einen eigenen Ablauf.</p>' +
          '<p>Heute führen <strong>Cassiano Lucius Fontani</strong>, seine Gemahlin <strong>Livia</strong> und ihr Sohn <strong>Terenzio</strong> den Betrieb. Frisches Leinen, gepflegte Räume und verlässliche Wärme sind ihr Stolz. Ihr lateinischer Wahlspruch verspricht, was das Haus geben will: <em>Aqua et Quies</em> – Wasser und Ruhe.</p>' },
      { schemaVersion: 1, commentThreadKey: 'fontani-cassiano', pageTitle: 'Cassiano Lucius Fontani',
        biographyPage: true, image: CASSIANO.portrait, imageWidth: 34, imageTall: true, imageFit: 'contain',
        stats: [['Geboren', '1691 · 49 Jahre'], ['Herkunft', 'Kaiserreich Argentum'], ['Beruf', CASSIANO.role], ['Gemahlin', 'Livia · 46 Jahre'], ['Sohn', 'Terenzio Fontani · 24 Jahre']],
        biography: {
          biographyTitle: 'Der Badermeister', biographyText: `<p>${CASSIANO.bio}</p><p>Er spricht bedacht, prüft mit einem Handgriff die Wärme eines Kruges und bemerkt, wenn ein Gast zum ersten Mal im Haus ist. Er mag feste Abläufe, lässt aber eine gute Unterhaltung nicht am Stundenschlag enden. Über seine argentische Herkunft spricht er mit Zuneigung; sein Alltag und seine Verantwortung gehören längst Gwynthor.</p>`,
          abilitiesTitle: 'Sein Handwerk', abilities: [{ title: 'Wasser und Wärme', icon: '♨', detail: 'Kennt die Feuerzüge, Wasserwege und kleinen Eigenheiten des ererbten Hauses.' }, { title: 'Ein aufmerksamer Gastgeber', icon: '❧', detail: 'Behält Sauberkeit und Ruhe im Blick und leitet die Bader im Umgang mit Gästen an.' }],
          historyTitle: 'Ein Haus über Generationen', historyText: '<p>Schon vor seiner Ankunft betrieben Verwandte der Fontani das Badehaus in Gwynthor. Cassiano kam als junger Mann aus Argentum zu ihnen, lernte den örtlichen Betrieb kennen und übernahm später die Verantwortung. Seit 1714 ist er mit Livia verheiratet; 1716 kam ihr Sohn Terenzio zur Welt. Frühere Generationen bleiben vorerst ohne einzelne Namen.</p>',
          worksTitle: 'Im täglichen Betrieb', works: ['Baderhandwerk und Anleitung des Badedienstes', 'Instandhaltung mit Terenzio und Abstimmung mit Livia'],
          triviaTitle: 'Im Haus', trivia: ['Nimmt sich für den ersten Rundgang am Morgen selbst Zeit.', 'Schätzt klare Absprachen und ein unaufgeregtes Bad.'],
          quotesTitle: 'Wahlspruch des Hauses', quotes: ['Aqua et Quies – Wasser und Ruhe.'],
          crestImage: FONTANI_EMBLEM, connectionsTitle: 'Seine Familie',
          connections: [LIVIA, TERENZIO].map(p => ({ name: p.name, detail: p.role, image: p.portrait })),
          documentsTitle: 'Das Haus',
          documents: [{ title: 'Haus Fontani', text: 'Der gegenwärtige Familienkreis im Stammbaum.', link: '../Stammbäume/Stammbaum.html?family=haus-fontani&mode=view', icon: FONTANI_EMBLEM }]
        } },
      { schemaVersion: 1, commentThreadKey: 'fontani-hausdienst', pageTitle: 'Familie und Hausdienst', hierarchyPage: true, hierarchy: buildBathhouseHierarchy() },
      buildBathhouseServices(),
      ...BATHHOUSE_ROOMS.map(room => ({ schemaVersion: 1, commentThreadKey: `fontani-${room.id}`, pageTitle: room.title, ...scene(room.id),
        sessionPage: true, sessionIntro: `<p>${room.intro}</p>`, sessionHint: 'Ein Besuch im Badehaus.',
        sessionEmptyTitle: 'Ein ruhiger Augenblick', sessionEmptyText: 'Hier beginnt die nächste Begegnung im Badehaus.',
        sessionDateAleria: { year: null, month: null, day: null } }))
    ]
  };
}
