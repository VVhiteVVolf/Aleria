import { pinPosition } from '../../assets/js/composition/board-composition-model.mjs';
import { DEFAULT_BOARD_SIZE } from '../../assets/js/composition/board-composition-config.mjs';
import { patriarchChanceryIssuer } from '../issuers/patriarch-chancery.mjs';

export const PADRAIG_NOTICE_ID = 'gwynthor-sankt-padraigs-tag';
export const PADRAIG_FEAST_DATE = Object.freeze({ month: 3, day: 17 });
const icon = 'assets/images/notices/sankt-padraigs-tag/padraig-kleeblatt-v1.webp';
export const PADRAIG_POSTER = Object.freeze({ id: 'gwynthor-poster-feiertag', assetId: 'feiertag',
  x: .199043, y: .275279, width: .05933, rotation: -4, layer: 2000,
  noticeId: PADRAIG_NOTICE_ID,
  pin: { assetId: 'straight', x: .08, y: .05, size: .1854036743637283, rotation: 0, enabled: true } });
export const PADRAIG_BOARD_BINDING = Object.freeze({ posterId: PADRAIG_POSTER.id,
  assetId: PADRAIG_POSTER.assetId, noticeId: PADRAIG_NOTICE_ID, poster: PADRAIG_POSTER });

export function buildPadraigNotice(asset) {
  return { ...pinPosition(PADRAIG_POSTER, asset, DEFAULT_BOARD_SIZE),
    id: PADRAIG_NOTICE_ID, noticeGroupId: PADRAIG_NOTICE_ID, typ: 'ankuendigung',
    ...patriarchChanceryIssuer(icon, 'Padraigs heiliges Sinnbild · drei Kleeblätter an einem Stiel'),
    title: 'Sankt Padraigs Tag', untertitel: 'Am 17. Lichtkehr · Bekanntmachung aus der Kanzlei des Patriarchen',
    bild: '', portrait: '', imageFit: 'contain', imagePosition: 'center', sideWidth: 210,
    table: [{ k: 'Festtag', v: '17. Lichtkehr 1740' },
      { k: 'Ort', v: 'Große Kathedrale der Neun und ihr Vorplatz · Gwynthor' },
      { k: 'Feier', v: 'Nach dem Morgengebet · Abschluss mit der Mittagsglocke' }],
    text: '<p><strong>Den Bürgern Gwynthors sei der nahende Sankt Padraigs Tag verkündet.</strong> Am 17. Lichtkehr gedenken wir des großen Erzdruiden Padraig, eines frühen Druiden der ersten Menschen, der unseren Vorfahren das Verständnis der menschlichen und göttlichen Natur näherbrachte.</p>'
      + '<p>Padraig lehrte am dreiblättrigen Kleeblatt: <strong>Wie Körper, Geist und Seele voneinander unterschieden sind und doch ein Ganzes bilden, so gehören die drei Blätter zu demselben Stiel.</strong> Darum ist das Kleeblatt sein heiliges Sinnbild. Wer es an diesem Tag trägt, möge sich auch seiner Lehre erinnern.</p>'
      + '<p>Grüne Gewänder, Bänder und Speisen sind dem Volk über die Jahre lieb geworden. Tragt gern etwas Grünes und schmückt Euch mit einem dreiblättrigen Klee. Ihm oder der grünen Farbe besondere Glückskräfte zuzuschreiben, ist jedoch volkstümlicher Aberglaube und gehört nicht zu Padraigs Lehre. Das heilige Zeichen soll uns an seinen Sinn erinnern.</p>'
      + '<p>Nach dem Morgengebet wird das Kleeblattgleichnis vorgetragen. Ein kurzer Festzug mit grünen Bändern, Flöten und Trommeln führt um den Kathedralplatz. Anschließend sind Jung und Alt zu gemeinsamen Liedern und einem fröhlichen Reigen eingeladen. Für die Kinder wird Padraigs Gleichnis noch einmal am lebenden Kleeblatt erklärt.</p>'
      + '<p>Auf dem Vorplatz werden grünes Kräuterbrot, Erbsensuppe und Gemüse gereicht. Teilt die Tafel auch mit jenen, die selbst wenig mitbringen können; ein freundliches Wort und ein geteilter Bissen ehren den Tag ebenso wie ein schönes Gewand.</p>'
      + '<p><strong>Mit Rücksicht auf die Hochzeit von Prinz Tudwal und Lady Revelyn Penderyn wird die Feier in diesem Jahr kürzer und weniger prunkvoll ausfallen.</strong> Die Vorbereitungen beanspruchen viele Hände und Mittel. Der Festzug bleibt klein; zusätzliche Festwagen und aufwendiger Schmuck entfallen. Mit der Mittagsglocke endet das gemeinsame Programm. Ich bitte Euch, diese Beschränkung zu achten und den Tag in Freude und gutem Maß zu begehen.</p>'
      + '<p>Im Auftrag des Patriarchen Gwalchgwyn Saethwyr.</p>',
    artikel: [], personen: [], comments: [], secret: false,
  };
}
