import { FEARNAN_NOTICE_ID } from '../build-household-quests.mjs';
import { NOTICE_SEALS } from '../../assets/js/seals/notice-seals-model.mjs';

const signature = 'assets/images/issuers/signatures/iorath-melyn/unterschrift-v1.webp';
const seal = NOTICE_SEALS.find(entry => entry.id === 'buergerlich').src;
const portraits = { 'Iorath Melyn': '../AleriaAlmanach/assets/gwynthor-reisegeleit/portraits/iorath-melyn.png',
  Raban: '../AleriaAlmanach/assets/gwynthor-reisegeleit/portraits/raban.png' };

export const TRAVEL_ARCHIVE_NOTICE_ID = 'gwynthor-reisegeleit-nach-llysfaen';
export const TRAVEL_ARCHIVE_SEED = Object.freeze({ id: 'archive-gwynthor-reisegeleit-17400310',
  noticeIds: [TRAVEL_ARCHIVE_NOTICE_ID], archivedOn: { year: 1740, month: 3, day: 10 }, x: .22, y: .944 });

// Minor signatories of this public notice, without invented genealogy records.
export function buildCompletedTravelNotice() {
  return {
    id: TRAVEL_ARCHIVE_NOTICE_ID, typ: 'reise', publicationStatus: 'open',
    stackId: FEARNAN_NOTICE_ID, noticeGroupId: TRAVEL_ARCHIVE_NOTICE_ID, stackOrder: 2,
    x: 2888 / 4096, y: 532 / 3072,
    title: 'Geleit nach Llysfaen gesucht', untertitel: 'Ein Weggefährte für eine private Reise',
    verfasserName: 'Iorath Melyn', typography: { font: 'kalam', heading: 'dancingscript', script: 'common' },
    sealPreset: 'buergerlich', unterschrift: signature, siegel: seal, verfasser: portraits['Iorath Melyn'],
    media: { verfasser: { kind: 'image', name: 'Iorath Melyn · Bürger Gwynthors', src: portraits['Iorath Melyn'], position: 'top' },
      unterschrift: { kind: 'image', name: 'Iorath Melyn · Unterschrift', src: signature, fit: 'contain' },
      siegel: { kind: 'image', name: 'Bürgerliches Wachssiegel', src: seal, fit: 'contain' } },
    text: '<p>Ich muss in <strong>Llysfaen</strong> einige Schriftstücke persönlich abgeben und würde den Weg gern in Begleitung zurücklegen. Ich bin Gwynthorer Bürger und weder ein geübter Reiter noch ein besonders beherzter Reisender. Seit mein üblicher Weggefährte mit einem verstauchten Fuß zu Hause sitzt, fehlt mir jemand für diese Fahrt.</p>'
      + '<p>Gesucht ist ein verlässlicher Söldner oder eine andere wegekundige Person, die mich hin und wieder zurück begleitet. Ein ruhiges Pferd und meine Reisekosten habe ich selbst. Für das Geleit biete ich <strong>zwanzig Kupferstücke</strong> und übernehme unterwegs das einfache Essen.</p>'
      + '<p>Es liegt keine Bedrohung vor, die eine Untersuchung oder einen Einsatz der Stadtwache rechtfertigen würde. Ich wünsche mir schlicht Gesellschaft und jemanden, der ruhig bleibt, wenn ich es nicht tue.</p>'
      + '<p>Wer Zeit hat, möge mir hier eine Antwort hinterlassen. Ich warte vor dem Aufbruch bei der <strong>Krummen Kanne</strong>.</p>',
    table: [{ k: 'Auftraggeber', v: 'Iorath Melyn · Bürger Gwynthors' },
      { k: 'Ziel', v: 'Llysfaen und zurück nach Gwynthor' }, { k: 'Aufbruch', v: '9. Lichtkehr 1740 · nach Vereinbarung' },
      { k: 'Treffpunkt', v: 'Vor der Krummen Kanne' }, { k: 'Entlohnung', v: '20 Kupferstücke und einfaches Essen unterwegs' }],
    comments: [
      { id: 'reisegeleit-raban-angebot', name: 'Raban', postedOn: { year: 1740, month: 3, day: 9 },
        text: 'Ich bin Söldner und habe den Weg in dieser Woche ohnehin vor. Zwanzig Kupfer und eine warme Mahlzeit passen. Wenn Euer Pferd gesattelt ist, können wir nach der Morgenandacht aufbrechen.', typography: { font: 'kalam' } },
      { id: 'reisegeleit-iorath-zusage', name: 'Iorath Melyn', postedOn: { year: 1740, month: 3, day: 9 },
        text: 'Abgemacht, Raban. Ich warte mit dem Pferd vor der Kanne. Vielen Dank für die schnelle Antwort!', typography: { font: 'kalam' } },
      { id: 'reisegeleit-iorath-abschluss', name: 'Iorath Melyn', postedOn: { year: 1740, month: 3, day: 10 },
        text: 'Erledigt — wir sind wohlbehalten wieder in Gwynthor. Herzlichen Dank an den Söldner Raban für das sichere Geleit und seine Geduld mit mir und dem Pferd. Die Schriftstücke sind abgegeben, die zwanzig Kupfer bezahlt und das versprochene Essen ebenfalls. Es wird keine weitere Begleitung gesucht. Dieses Blatt kann herunter.', typography: { font: 'kalam' } },
      { id: 'reisegeleit-raban-abschluss', name: 'Raban', postedOn: { year: 1740, month: 3, day: 10 },
        text: 'Kann ich bestätigen. Lohn erhalten, Auftrag abgeschlossen. Das Pferd war vernünftiger, als Ihr ihm zugetraut habt. Bis zum nächsten Mal, Iorath.', typography: { font: 'kalam' } },
    ].map(comment => ({ ...comment, avatar: portraits[comment.name], imagePosition: 'top' })),
    artikel: [], personen: [], rewards: [], secret: false,
  };
}

export function completedTravelPortraitUpdate() {
  const notice = buildCompletedTravelNotice();
  return { id: 'gwynthor-reisegeleit-portraits-20261031-v2', noticeId: notice.id,
    fields: [{ field: 'verfasser', fillEmpty: true, to: notice.verfasser },
      { field: 'media.verfasser', fillEmpty: true, to: notice.media.verfasser },
      { field: 'unterschrift', fillEmpty: true, to: notice.unterschrift },
      { field: 'media.unterschrift', fillEmpty: true, to: notice.media.unterschrift },
      { field: 'siegel', fillEmpty: true, to: notice.siegel },
      { field: 'media.siegel', fillEmpty: true, to: notice.media.siegel },
      ...notice.comments.flatMap(comment => [{ field: `comments.${comment.id}.avatar`, fillEmpty: true, to: comment.avatar },
        { field: `comments.${comment.id}.imagePosition`, fillEmpty: true, to: comment.imagePosition }])] };
}
