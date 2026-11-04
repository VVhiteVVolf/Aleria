import { normalizeLandingData } from '../landing/landing-model.js';
import { groupNameKey } from '../landing/group-landing-roster.js';
import { OWETA_QUARTET_MEMBERS, OWETA_QUARTET_COMPANIONS } from './oweta-quartett-data.mjs';
import { OWETA_QUARTET_IMAGE } from './oweta-quartett-artwork.mjs';
export { OWETA_QUARTET_IMAGE } from './oweta-quartett-artwork.mjs';

export const OWETA_QUARTET_ID = 'oweta-quartett';
export const OWETA_QUARTET_SECTION = Object.freeze({
  key: 'Haus Draig', tab: 'Gruppen', desc: 'Gemeinschaften des Hauses Draig und seiner Gefährten.',
  path: Object.freeze(['Cenyr', 'Celtigerns Wacht', 'Haus Draig'])
});
export const OWETA_QUARTET_SCENE_THREAD = `${OWETA_QUARTET_ID}::session:mittagsrast`;

function buildHierarchy() {
  const node = person => ({ title: person.role, subtitle: person.name, portrait: person.portrait,
    text: person.role === 'Anführerin' ? 'Führt das Quartett.' : 'Steht mit den beiden anderen Gefährtinnen auf derselben Ebene unter Oweta.' });
  const levels = [
    { label: 'Anführerin', nodes: [node(OWETA_QUARTET_MEMBERS[0])] },
    { label: 'Gefährtinnen · gleichrangig', nodes: OWETA_QUARTET_MEMBERS.slice(1).map(node) }
  ];
  return { layoutMode: 'vertical', treeDisplayMode: 'tabs', cardFontScale: 92, portraitScale: 100, chartScale: 100,
    eyebrow: 'Ein Quartett auf gemeinsamen Wegen', subtitle: 'Oweta führt; Rianna, Lefraye und Caralyn stehen gleichrangig unter ihr.',
    centerLabel: 'Owetas Quartett', organizationTitle: 'Owetas Quartett',
    motto: 'Gemeinsam unterwegs.', detailsTitle: 'Das Quartett',
    details: [{ label: 'Führung', value: 'Oweta Draig' }, { label: 'Gefährtinnen', value: 'Rianna, Lefraye und Caralyn · gleichrangig' }],
    description: 'Eine Anführerin und drei Gefährtinnen. Weitere Rangstufen gibt es in dieser Gruppe nicht.',
    chartTitle: 'Die Gemeinschaft', chartIntro: 'Oweta Draig führt die Gruppe. Die drei Gefährtinnen bilden gemeinsam die zweite Ebene.',
    trees: [{ id: 'quartett', parentTreeId: '', label: 'Das Quartett', levels }], levels: structuredClone(levels),
    footerNote: 'Die Tiere begleiten ihre jeweiligen Besitzerinnen und stehen außerhalb der Rangfolge.' };
}

function buildOverview(image) {
  const members = OWETA_QUARTET_MEMBERS.map(person => ({ id: `hierarchy:${groupNameKey(person.name)}`,
    characterId: person.id, kind: 'character', linkMode: 'manual', assignment: 'active', status: 'auto' }));
  const guests = OWETA_QUARTET_COMPANIONS.map(animal => ({ id: `oweta-quartett:${animal.id}`, kind: 'creature',
    creatureId: animal.id, name: animal.name, portrait: animal.portrait, role: `${animal.species} · bei ${animal.ownerName}`,
    note: `Persönlicher Tierbegleiter von ${animal.ownerName}.`, assignment: 'active', status: 'auto', temporary: false }));
  return normalizeLandingData({ presentation: 'folio', coverImage: image, title: 'Owetas Quartett',
    subtitle: 'Oweta, Rianna, Lefraye und Caralyn · eine Rast auf dem Land',
    memberTitle: 'Das Quartett & seine Tiere', questTitle: 'Gemeinsame Vorhaben', notesTitle: 'Aus dem Reisebuch',
    eventsTitle: 'Was bisher geschah', infoTitle: 'Am Lagerfeuer', mapTitle: 'Unsere Wege',
    members: [], quests: [], notes: [], events: [], questJournal: { enabled: true, includeMembers: true },
    info: [{ title: 'Die Gemeinschaft', text: 'Vier Gefährtinnen; Oweta führt die Gruppe.' },
      { title: 'Die Rast', text: 'Mittags, am Lagerfeuer im Grünen.' },
      { title: 'Die Tiere', text: 'Heulwen, Goldlöckchen, Sir Fressbert, Thalena, Agravaine und Eure Hufigkeit.' }],
    group: { location: 'Auf dem Land bei Gwynthor', activity: 'Mittagsrast am Lagerfeuer', status: 'Gemeinsam unterwegs',
      threadId: OWETA_QUARTET_SCENE_THREAD, sceneThreads: [OWETA_QUARTET_SCENE_THREAD],
      includeCompanions: false, members, guests, inventory: [], treasury: { openingCopper: null, entries: [] } }
  });
}

export function buildOwetaQuartet({ image = OWETA_QUARTET_IMAGE } = {}) {
  return { id: OWETA_QUARTET_ID, title: 'Owetas Quartett', subtitle: 'Oweta · Rianna · Lefraye · Caralyn',
    type: 'Reisegruppe', category: 'Gefolge', schemaVersion: 1, multipage: true, moduleWidth: 100, moduleHeight: 100,
    image, previewImage: image, stamp: 'OWETAS QUARTETT · GEMEINSAM UNTERWEGS', icon: '', symbol: '', locked: false,
    appendCommentsPage: true, enablePageComments: true, sessionCast: OWETA_QUARTET_MEMBERS.map(person => person.id),
    pages: [
      { schemaVersion: 1, commentThreadKey: 'quartett', pageTitle: 'Owetas Quartett', image, imageWidth: 42,
        imageTall: true, imageFit: 'cover', imagePosition: 'center',
        description: '<p>Auf dem Land ist Mittagsruhe eingekehrt. Ein kleines Lagerfeuer brennt zwischen Gras und gepacktem Reisezeug. Oweta Draig, Rianna Wyrm, Lefraye Gafyr und Caralyn Chwedonol haben sich darum niedergelassen. Für einen Augenblick genügen Schatten, etwas zu essen und Zeit füreinander.</p>'
          + '<p>Oweta führt dieses Quartett. Rianna, Lefraye und Caralyn stehen gemeinsam auf der Ebene darunter; untereinander gibt es keinen Rangunterschied. Beim Rasten bleibt Raum für ein Gespräch, eine beiläufige Neckerei und die gewöhnlichen Handgriffe eines gemeinsamen Lagers.</p>'
          + '<p>Auch ihre Tiere sind dabei: Owetas Heulwen, Riannas Goldlöckchen und Sir Fressbert, Lefrayes Thalena und Agravaine – kurz Vain – sowie Caralyns Eure Hufigkeit. Während die Pferde in der Nähe grasen, gehören Kater und Drossel ebenso zum Bild dieser kleinen Gemeinschaft.</p>',
        stats: [['Gruppe', 'Owetas Quartett'], ['Anführerin', 'Oweta Draig'], ['Gefährtinnen', 'Rianna Wyrm · Lefraye Gafyr · Caralyn Chwedonol'],
          ['Rangfolge', 'Oweta; darunter drei gleichrangige Gefährtinnen'], ['Tierbegleiter', 'Vier Pferde, ein Kater und eine Drossel'], ['Lager', 'Mittagsrast auf dem Land']],
        commentDivider: false, commentSequence: [] },
      { schemaVersion: 1, commentThreadKey: 'rangfolge', pageTitle: 'Die Gemeinschaft', hierarchyPage: true, hierarchy: buildHierarchy() },
      { schemaVersion: 1, commentThreadKey: 'gruppenuebersicht', pageTitle: 'Gruppenübersicht', landingPage: true, landing: buildOverview(image) },
      { schemaVersion: 1, commentThreadKey: 'mittagsrast', pageTitle: 'Mittagsrast am Lagerfeuer', image, imageWidth: 40,
        imageTall: true, imageFit: 'cover', imagePosition: 'center', sessionPage: true,
        sessionIntro: '<p>Die Sonne steht hoch über dem Land. Im Gras liegen Bettrollen und Reisebeutel, über dem kleinen Feuer wärmt sich das Essen. Die Pferde grasen in Sichtweite. Oweta, Rianna, Lefraye und Caralyn haben es sich am Lagerfeuer bequem gemacht.</p>',
        sessionHint: 'Ein Gespräch am Feuer, eine kleine Pause oder der nächste gemeinsame Aufbruch.',
        sessionEmptyTitle: 'Zeit für eine Rast', sessionEmptyText: 'Das Feuer knistert leise. Die Mittagsruhe gehört den vier Gefährtinnen und ihren Tieren.',
        sessionDateAleria: { year: null, month: null, day: null } }
    ] };
}
