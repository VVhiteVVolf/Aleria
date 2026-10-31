import { pinPosition } from '../../assets/js/composition/board-composition-model.mjs';
import { DEFAULT_BOARD_SIZE } from '../../assets/js/composition/board-composition-config.mjs';
import { LOTSENSUCHE_PEOPLE } from '../../../AleriaAlmanach/modules/gwynthor-lotsensuche/lotsensuche-characters.mjs';

export const LOTSENSUCHE_NOTICE_ID = 'gwynthor-lotsensuche';
export const LOTSENSUCHE_POSTER = Object.freeze({
  id: 'gwynthor-poster-lotsensuche', assetId: 'lotsensuche-vebrand',
  x: .646, y: .729, width: .05933, rotation: 2, layer: 4002,
  noticeId: LOTSENSUCHE_NOTICE_ID,
  pin: { assetId: 'straight', x: .5, y: .045, size: .16, rotation: -3, enabled: true },
});
export const LOTSENSUCHE_BOARD_BINDING = Object.freeze({ posterId: LOTSENSUCHE_POSTER.id,
  assetId: LOTSENSUCHE_POSTER.assetId, noticeId: LOTSENSUCHE_NOTICE_ID, poster: LOTSENSUCHE_POSTER });
export const LOTSENSUCHE_COMMENT_CORRECTION = Object.freeze({
  id: 'gwynthor-lotsensuche-six-days-20261031', noticeId: `${LOTSENSUCHE_NOTICE_ID}-erneuert`,
  fields: [{ field: `comments.${LOTSENSUCHE_NOTICE_ID}-vebrands-abweisung.text`,
    from: 'Verpiss dich Rob! Du wahrst ein misserabler Lotse. Sechs wochen und nichs gefunden!',
    to: 'Verpiss dich Rob! Du wahrst ein misserabler Lotse. Sechs tage und nichs gefunden!' }],
});
const art = 'assets/images/notices/lotsensuche';
const vebrand = LOTSENSUCHE_PEOPLE.vebrand;
const rob = LOTSENSUCHE_PEOPLE.rob;
const portrait = person => `..${person.portrait}`;

function identity() {
  return { verfasser: portrait(vebrand), verfasserName: vebrand.name,
    unterschrift: `${art}/${vebrand.signature}`, siegel: `${art}/blutbund-wachssiegel-v1.webp`,
    emblem: `${art}/wegweiser-icon-v1.webp`, typography: { font: vebrand.handwriting, heading: 'inherit', script: 'common' },
    media: { verfasser: { kind: 'character', characterId: vebrand.id, name: vebrand.name, src: portrait(vebrand), position: 'top' },
      unterschrift: { kind: 'image', name: 'Vebrands Namenszeichen', src: `${art}/${vebrand.signature}`, fit: 'contain' },
      siegel: { kind: 'image', name: 'Wachssiegel des Blutbundes', src: `${art}/blutbund-wachssiegel-v1.webp`, fit: 'contain' },
      emblem: { kind: 'image', name: 'Wegweiser und Stiefel', src: `${art}/wegweiser-icon-v1.webp`, fit: 'contain' } } };
}

function reply(id, person, text) {
  return { id: `${LOTSENSUCHE_NOTICE_ID}-${id}`, name: person.name, text, avatar: portrait(person),
    typography: { font: person.handwriting },
    media: { avatar: { kind: 'character', characterId: person.id, name: person.name, src: portrait(person), position: 'top' } } };
}

export function buildLotsensucheNotices(asset) {
  const shared = { ...pinPosition(LOTSENSUCHE_POSTER, asset, DEFAULT_BOARD_SIZE), ...identity(),
    stackId: LOTSENSUCHE_NOTICE_ID, noticeGroupId: LOTSENSUCHE_NOTICE_ID, typ: 'hilfsgesuch',
    bild: '', portrait: '', artikel: [], personen: [], secret: false };
  return [
    { ...shared, id: LOTSENSUCHE_NOTICE_ID, stackOrder: 0, publicationStatus: 'filled',
      title: 'Lotsse gesucht', untertitel: 'Erster Anschlag', table: [],
      text: '<p>Ich such ein Lotsse. Einer aus Gwynthor wo die stat kennt und mir bei meine arbeit hilft. Ich bin hir fremt und find mich in diese ganzen gassen nich zurecht.</p><p>Wer von hir is und zeit hatt soll sich bei mir melden. Bezahlt wirt auch. Vébrand Wolfsruf vom Blutbund.</p>',
      comments: [
        reply('erstes-angebot', rob, 'Rob mein Name. Ich bin Tagelöhner und kann Euch durch Gwynthor führen. Für Eure Arbeit findet sich bestimmt der richtige Weg. Wann soll ich mich bei Euch melden?'),
        reply('erste-zusage', vebrand, 'Das klingt guht Rob. Komm morgen frü am hafen zu mir. Ich bezahl dich und essen geht auf mich. Dan zeigst du mir wo ich hin mus.'),
      ] },
    { ...shared, id: `${LOTSENSUCHE_NOTICE_ID}-erneuert`, stackOrder: 1, publicationStatus: 'open',
      title: 'Nochmal ein Lotsse gesucht', untertitel: 'Neuer Anschlag', table: [],
      text: '<p>Ich such NOCHMAL ein Lotsse. Einer der mich in Gwynthor gut rumfürt. Und der sich hir auch WIRKLICH auskent. Nich einer der blos sagt er kent sich aus.</p><p>Diesmal gibs ERST DIE HELFTE. Die andre helfte wen meine arbeit fertig is. Essen und trinken für jeden tag is nich abgemacht. Das bereden wir forher.</p><p>Es is eine wichtige sache und ich mus was bestimtes finden. Was das is bered ich unter vier augen. Das schreib ich nich hir hin für jeden.</p><p>Wer die stat kennt und ernsthaft arbeiten wil soll sich bei mir melden. Vébrand Wolfsruf. Der mit die Faust aufn Harnisch. Rob braucht sich nich wider melden.</p>',
      comments: [
        reply('robs-warnung', rob, 'Wer sich hier anwerben lässt, sollte sein Geld lieber vorher verlangen. Dieser Herr haut seine Helfer übers Ohr und weiß die Dienste seines letzten Lotsen offenbar nicht zu schätzen.'),
        reply('vebrands-abweisung', vebrand, 'Verpiss dich Rob! Du wahrst ein misserabler Lotse. Sechs tage und nichs gefunden!'),
        reply('robs-erinnerung', rob, 'Das klang aber ganz anders, als wir uns in der Gestiefelten Muschi an den Damen erfreut haben. Da warst du mit meiner Führung noch ausgesprochen zufrieden.'),
        reply('vebrands-vorwurf', vebrand, 'Du hast mich blos ausgenuzt. Ich such mir jetz einen der was kan. Du bist ein misserabler lügner und ein dummkopf.'),
        reply('robs-korrektur', rob, 'Nur der letzte Satz: „miserabler“ mit einem s. „Lügner“ und „Dummkopf“ schreibt man groß. Drei Schreibfehler. Gern geschehen.'),
        reply('vebrands-berichtigung', vebrand, 'Du bist ein miserabler Lügner und ein Dummkopf.'),
      ] },
  ];
}
