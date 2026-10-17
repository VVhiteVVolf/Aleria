import { ARENA_SCENES } from './arena-scenes.mjs';

export const ARENA_ID = 'gwynthor-kampfarena';
export const ARENA_ART = './assets/gwynthor-arena/scenes';
export const ARENA_SECTION = Object.freeze({
  key: 'Gwynthor', tab: 'Völker & Kulturen', desc: '',
  nodeId: 'node:volker-kulturen:cenyr/celtigerns-wacht/llamreis-ankunft/gwynthor',
  path: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']
});

const illustration = id => ({
  image: `${ARENA_ART}/${id}.png`, imageWidth: 34,
  imageTall: true, imageFit: 'cover', imagePosition: 'center'
});

export function buildGwynthorArena() {
  const overview = {
    schemaVersion: 1, pageTitle: 'Die Kampfarena von Gwynthor',
    commentThreadKey: 'gwynthor-arena-einordnung', ...illustration('aussenansicht'),
    stats: [
      ['Ort', 'Gwynthor · Celtigerns Wacht'],
      ['Eigentum', 'Stadt Gwynthor · Haus Draig'],
      ['Überlassen an', 'Die örtliche Kämpfergilde'],
      ['Nutzung', 'Übungen und Gildenwettkämpfe · Turniere · große Schauspiele']
    ],
    description: '<p>Die Kampfarena gehört der <strong>Stadt Gwynthor und dem Haus Draig</strong>. Sie ist der örtlichen Kämpfergilde zur Nutzung überlassen: Hier wird geübt, hier treten Heimkämpfer gegen Gäste an, und hier verfolgt die Stadt den sportlichen Wettstreit.</p>' +
      '<p>Die Draigs nutzen das Rund zuweilen für eigene Turniere. Auch besonders große Theateraufführungen finden hier Raum, wenn eine gewöhnliche Bühne nicht ausreicht. Sandfläche, Tribünen und die Räume unter den Rängen bilden zusammen einen Schauplatz, dessen Leben mit dem jeweiligen Anlass wechselt.</p>' +
      '<p>Die Kämpfergilde steht unter der Aufsicht des <a href="../Fraktionen/index.html#fraktion-hochbund-des-herion">Hochbundes des Herion</a>. Ihre Wettkämpfe folgen einer verbindlichen Ordnung für fairen Kampf, Aufgabe und Versorgung der Verletzten.</p>'
  };
  return {
    id: ARENA_ID, title: 'Kampfarena von Gwynthor',
    subtitle: 'Sand, Ränge und große Auftritte · Ein Schauplatz der Stadt',
    type: 'Arena · Schauplatz', category: 'Gwynthor · Schauplätze',
    image: `${ARENA_ART}/aussenansicht.png`, previewImage: `${ARENA_ART}/aussenansicht.png`,
    icon: '⚔', stamp: 'GWYNTHOR · ARENA · HAUS DRAIG',
    schemaVersion: 1, multipage: true, appendCommentsPage: true, enablePageComments: true,
    pages: [overview, ...ARENA_SCENES.map(scene => ({
      schemaVersion: 1, pageTitle: scene.title,
      commentThreadKey: `gwynthor-arena-${scene.id}`, ...illustration(scene.id),
      sessionPage: true, sessionIntro: scene.intro, sessionHint: scene.hint,
      sessionEmptyTitle: scene.emptyTitle, sessionEmptyText: scene.emptyText,
      sessionDateAleria: { year: null, month: null, day: null }
    }))]
  };
}
