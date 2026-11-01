import { pinPosition } from '../../assets/js/composition/board-composition-model.mjs';
import { DEFAULT_BOARD_SIZE } from '../../assets/js/composition/board-composition-config.mjs';
import { EUDDOGWY, patriarchChanceryIssuer } from '../issuers/patriarch-chancery.mjs';

export const FORMLING_NOTICE_ID = 'gwynthor-lleuwen-kirchliche-anhoerung';
const art = 'assets/images/notices/lleuwens-anhoerung';
// The user requested the smaller church paper beside the Feiertag poster.
export const FORMLING_POSTER = Object.freeze({ id: 'gwynthor-poster-kirche', assetId: 'kirche',
  x: .277751, y: .276236, width: .048, rotation: 0, layer: 2001,
  noticeId: FORMLING_NOTICE_ID,
  pin: { assetId: 'left', x: .08, y: .05, size: .16781083142639205, rotation: 0, enabled: true } });
export const FORMLING_BOARD_BINDING = Object.freeze({ posterId: FORMLING_POSTER.id,
  assetId: FORMLING_POSTER.assetId, noticeId: FORMLING_NOTICE_ID, poster: FORMLING_POSTER });
export const FORMLING_PLACEMENT_UPDATE = Object.freeze({
  id: 'gwynthor-church-next-to-holiday-placement-20261031', posterId: FORMLING_POSTER.id,
  assetId: FORMLING_POSTER.assetId, noticeId: FORMLING_NOTICE_ID, field: 'placement',
  from: { x: .277751, y: .276236, width: .06555 },
  to: { x: FORMLING_POSTER.x, y: FORMLING_POSTER.y, width: FORMLING_POSTER.width },
});
export const FORMLING_TERM = 'Noch nicht festgesetzt · nach Einschätzung der Kanzlei spätestens bis Ende der Woche';
const venue = 'Kapitelsaal der Großen Kathedrale der Neun zu Gwynthor';

export function buildFormlingNotices(asset) {
  const shared = { ...pinPosition(FORMLING_POSTER, asset, DEFAULT_BOARD_SIZE),
    stackId: FORMLING_NOTICE_ID, noticeGroupId: FORMLING_NOTICE_ID, typ: 'ankuendigung',
    bild: '', portrait: '', imageFit: 'contain', imagePosition: 'center', sideWidth: 210,
    ...patriarchChanceryIssuer(`${art}/anhoerung-icon-v1.webp`, 'Buch, Waage und Flamme · kirchliche Anhörung'),
    artikel: [], personen: [], comments: [], secret: false };
  return [
    { ...shared, id: FORMLING_NOTICE_ID, stackOrder: 0, typ: 'erlass',
      title: 'In der Sache Lleuwen, Schniedel und Schattentänzer',
      untertitel: 'Kirchliche Verlautbarung · aus der persönlichen Kanzlei des Patriarchen · erstes Blatt',
      table: [{ k: 'Vorsitz', v: 'Patriarch Gwalchgwyn Saethwyr' }, { k: 'Ort', v: venue },
        { k: 'Termin', v: FORMLING_TERM }, { k: 'Weltlicher Beistand', v: 'Neithon Draig · Adjutant des Justiziars · wegen des tätlichen Angriffs' }],
      text: '<p><strong>Im Auftrag des Patriarchen gebe ich der Gemeinde Gwynthors bekannt:</strong> Nach der Entlarvung eines Formlings am Theater und einer damit verbundenen tätlichen Auseinandersetzung hat die Stadtwache eingegriffen. Die Betroffene befindet sich in kirchlichem Gewahrsam; die Sache wird untersucht.</p>'
        + '<p>Das kirchliche Gericht wird sich unter dem Vorsitz <strong>Patriarch Gwalchgwyn Saethwyrs</strong> im Kapitelsaal der Großen Kathedrale der Neun zusammenfinden. <strong>Neithon Draig, Adjutant des Justiziars,</strong> wird wegen des tätlichen Angriffs für die weltliche Seite unterstützend anwesend sein. Welche weiteren Würdenträger teilnehmen können, steht noch nicht fest.</p>'
        + '<p>Ein Termin ist noch nicht festgesetzt. <strong>Nach gegenwärtiger Einschätzung dieser Kanzlei ist die Anhörung spätestens bis Ende der Woche zu erwarten.</strong> Tag und Stunde werden gesondert verkündet.</p>'
        + '<p>Die Beteiligten und die benötigten Zeugen werden gehört, die Umstände geprüft und die vorgebrachten Ansprüche behandelt. Die geistliche Entscheidung obliegt dem Patriarchen; die weltliche Gerichtsbarkeit bleibt gewahrt. Über die weitere Ordnung und einen Zutritt zur Anhörung wird mit dem Termin Auskunft gegeben.</p>' },
    { ...shared, id: `${FORMLING_NOTICE_ID}-vortraege`, stackOrder: 1,
      title: 'Die drei Streitparteien', untertitel: 'Zur bevorstehenden Anhörung · zweites Blatt',
      table: [{ k: 'Lleuwen', v: 'Statistin am Gwynthorer Theater · als Formling entlarvt' },
        { k: 'Ulrich Schniedel', v: 'Hexenjäger · Richter des Reinen Blutes' },
        { k: 'Orvar Schattentänzer', v: 'Schauspieler am Gwynthorer Theater · Lleuwens Gefährte' }],
      text: '<p><strong>Lleuwen</strong> steht wegen ihrer verborgenen infernalen Natur und ihres Aufenthalts unter den Bürgern Gwynthors vor dem kirchlichen Gericht. Sie verbleibt während der Untersuchung in Gewahrsam.</p>'
        + '<p><strong>Ulrich Schniedel</strong> hat den Formling entlarvt. Er erhebt gegen Orvar Beschwerde wegen eines tätlichen Angriffs und fordert Lohn für seine Arbeit sowie Entschädigung.</p>'
        + '<p><strong>Orvar Schattentänzer</strong> hat den Hexenjäger bei dem Vorfall mit einem Übungsschwert geschlagen. Er beruft sich auf den Schutz seiner Gefährtin und bittet um ihre Freilassung.</p>' },
    { ...shared, id: `${FORMLING_NOTICE_ID}-ordnung`, stackOrder: 2, typ: 'erlass',
      title: 'An die Bürger Gwynthors', untertitel: 'Ein Appell aus der Kanzlei des Patriarchen · drittes Blatt',
      table: [{ k: 'Ansprechperson', v: `${EUDDOGWY.name} · persönlicher Adjutant des Patriarchen` },
        { k: 'Vorsprache', v: 'Persönliche Kanzlei des Patriarchen · Große Kathedrale der Neun' }],
      text: '<p><strong>Ich bitte die Bürger Gwynthors, Ruhe zu bewahren.</strong> Die Anwesenheit eines infernalen Wesens ist eine ernste Angelegenheit und verlangt Vorsicht. Die Kirche untersucht den Fall und die möglichen Gefahren mit der gebotenen Sorgfalt.</p>'
        + '<p>Lasst die beauftragten Geistlichen und die Wache ihre Arbeit tun. Seht von Aufläufen, Drohungen und eigenmächtigen Nachforschungen gegen die Beteiligten ab. Tragt unbestätigte Gerüchte nicht als Gewissheiten weiter; gesicherte Kunde wird durch die Kanzlei verkündet.</p>'
        + '<p><strong>Wer als Zeuge vorsprechen möchte, sachdienliche Angaben machen kann oder ein Anliegen zu dieser Sache vorzutragen hat, wende sich an mich, Euddogwy O’Cenyr, in der persönlichen Kanzlei des Patriarchen an der Großen Kathedrale der Neun.</strong> Ich nehme Eure Meldung entgegen und veranlasse das Weitere.</p>'
        + '<p>Ausgefertigt im Auftrag des Patriarchen Gwalchgwyn Saethwyr.<br><em>Euddogwy O’Cenyr<br>Kurator und persönlicher Adjutant des Patriarchen</em></p>' },
  ];
}
