import { readFile } from 'node:fs/promises';
import { pinPosition } from '../../assets/js/composition/board-composition-model.mjs';
import { DEFAULT_BOARD_SIZE } from '../../assets/js/composition/board-composition-config.mjs';

export const FLEISCHSAMMLER_NOTICE_ID = 'gwynthor-fleischsammler';
export const FLEISCHSAMMLER_BOARD_BINDING = Object.freeze({
  posterId: 'gwynthor-poster-moerder', assetId: 'moerder', noticeId: FLEISCHSAMMLER_NOTICE_ID,
});
const art = 'assets/images/quests/fleischsammler';
const civicArt = 'assets/images/issuers/gwynthor-verwaltung';
const emblem = '../IconOrdner/L%C3%A4nder%20und%20H%C3%A4user%20Icons/Haus%20Draig/Gwynthor.png';

const authors = {
  commandant: { id: 'ferydnand-gafyr', familyId: 'haus-gafyr', name: 'Sir Ferydnand Gafyr',
    office: 'Kommandant der Stadtwache von Gwynthor', font: 'kalam' },
  adjutant: { id: 'neithon-1718-draig', signatureId: 'neithon-draig', familyId: 'haus-draig', name: 'Neithon Draig',
    office: 'Adjutant des Justiziars von Gwynthor', font: 'dancingscript' },
  investigator: { id: 'meredydd-gwyllach', familyId: 'haus-gwyllach', name: 'Meredydd Gwyllach',
    office: 'Netzmeister der Fahndung', font: 'patrickhand' },
};

function identity(author) {
  const portrait = `../Stammb%C3%A4ume/assets/images/portraits/${author.familyId}/${author.id}.jpg`;
  const signature = `${civicArt}/${author.signatureId || author.id}-unterschrift-v1.png`;
  const seal = `${civicArt}/wachssiegel-v1.png`;
  return { verfasser: portrait, verfasserName: `${author.name} · ${author.office}`, emblem,
    unterschrift: signature, siegel: seal,
    typography: { font: author.font, heading: 'template', script: 'common' },
    media: {
      verfasser: { kind: 'character', familyId: author.familyId, personId: author.id, name: author.name, src: portrait, fit: 'cover', position: 'top' },
      emblem: { kind: 'image', name: 'Stadtwappen Gwynthors', src: emblem, fit: 'contain', position: 'center' },
      unterschrift: { kind: 'image', name: `${author.name} · Unterschrift`, src: signature, fit: 'cover', position: 'center' },
      siegel: { kind: 'image', name: 'Wachssiegel der Gwynthorer Verwaltung', src: seal, fit: 'contain', position: 'center' },
    } };
}

// Public facts only. The private perpetrator history is deliberately not an input
// to this builder, its search metadata, or the delivered notice package.
export async function buildFleischsammlerNotices() {
  const read = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
  const preset = await read('../../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor/board-layout.json');
  const catalog = await read('../../assets/data/board-art-catalog.json');
  const poster = preset.layout.posters.find(item => item.id === FLEISCHSAMMLER_BOARD_BINDING.posterId);
  const asset = catalog.posters.find(item => item.id === poster?.assetId);
  if (!poster || !asset) throw new Error('Gwynthors Mörder-Plakat fehlt.');
  const point = pinPosition(poster, asset, DEFAULT_BOARD_SIZE);
  const shared = { stackId: FLEISCHSAMMLER_NOTICE_ID, noticeGroupId: FLEISCHSAMMLER_NOTICE_ID,
    ...point, bild: '', portrait: '', imageFit: 'contain', imagePosition: 'center',
    sideWidth: 260, artikel: [], personen: [], comments: [], secret: false };

  const warning = { ...shared, ...identity(authors.commandant), id: FLEISCHSAMMLER_NOTICE_ID,
    stackOrder: 0, typ: 'warnung', title: 'Achtung vor dem Fleischsammler!',
    untertitel: 'Warnung der Stadtwache · Östlicher Bannkreis von Gwynthor',
    table: [{ k: 'Gefahr', v: 'Mordserie an Frauen · Täter unbekannt' },
      { k: 'Gebiet', v: 'Bauernhöfe, Straßen und Felder im östlichen Bannkreis · außerhalb der Stadt' }],
    text: '<p><strong>An die Bürger Gwynthors und die Bewohner seines Bannkreises.</strong></p>'
      + '<p>Seit einem Monat werden im östlichen Umland Frauen ermordet aufgefunden. Was anfangs als einzelne, voneinander unabhängige Verbrechen behandelt wurde, hat sich nach dem Abgleich der Funde als <strong>zusammenhängende Mordserie</strong> erwiesen. Der Täter ist unter dem Beinamen <strong>Fleischsammler</strong> bekannt. Er ist noch nicht gefasst.</p>'
      + '<p><strong>Den Göttern sei Dank ist innerhalb Gwynthors bislang keinerlei Tätigkeit dieses Mörders festgestellt worden.</strong> Die bekannten Taten betreffen den östlichen Bannkreis: die Bauernhöfe, Straßen und Felder jenseits unserer Mauern. Gerade dort ist nach Einbruch der Dunkelheit äußerste Vorsicht geboten.</p>'
      + '<p>Die Fahndung arbeitet mit Nachdruck. Meine <strong>Cochllamwyr</strong> haben Gwynthor-Stadt zu sichern; dies ist ihr Auftrag, und diesen werden sie erfüllen. Für das Umland sind die dortigen <strong>Ortswachen</strong> zuständig. Ich habe dort <strong>doppelte Wachgänge und doppelte Schichten</strong> anordnen lassen. Kein Mann wird seinen Posten aus Bequemlichkeit räumen.</p>'
      + '<p>Doch auch eine verdoppelte Wache kann nicht gleichzeitig an jedem Feldweg stehen. <strong>Jeder Haushalt hat seinen Teil zu leisten.</strong> Lasst Eure Töchter, Mütter und Schwestern des Nachts nicht allein auf die Straße. Organisiert Begleitung. Wer spät heimkehren muss, soll den Heimweg in Gesellschaft antreten. Das gilt vorübergehend, bis dieser Mörder gefasst ist; bis dahin erwarte ich, dass diese Warnung ernst genommen wird.</p>'
      + '<p>Umsicht ist keine Feigheit. Für die Euren einzustehen ist Pflicht. Wir versehen unseren Dienst; verseht Ihr den Euren.</p>'
      + '<p><em>Gezeichnet: Sir Ferydnand Gafyr<br>Kommandant der Stadtwache von Gwynthor</em></p>' };

  const reward = { ...shared, ...identity(authors.adjutant), id: `${FLEISCHSAMMLER_NOTICE_ID}-belohnung`,
    stackOrder: 1, typ: 'erlass', title: 'Ausgesetzte Belohnung',
    untertitel: 'Verfügung des Adjutanten des Justiziars · Zum Gesuch gegen den Fleischsammler',
    rewards: [{ kind: 'money', currency: 'gold', amount: 3, condition: 'Für das Auffinden und Zurstreckebringen des Fleischsammlers, nach amtlicher Prüfung.' },
      { kind: 'money', currency: 'silver', amount: 1, condition: 'Für ernsthafte, nachweislich hilfreiche Informationen, nach amtlicher Prüfung.' }],
    table: [{ k: 'Belohnung', v: '3 Goldmünzen für den Täter · 1 Silbermünze für nachweislich hilfreiche Informationen' },
      { k: 'Prüfung und Auszahlung', v: 'Durch den Hof von Gwynthor' }],
    text: '<p>Hiermit wird für das <strong>Auffinden und Zurstreckebringen des unter dem Beinamen Fleischsammler gesuchten Serienmörders eine Belohnung von drei Goldmünzen</strong> ausgesetzt. Die Auszahlung setzt voraus, dass die Identität des Täters und die zur Belohnung berechtigende Leistung durch den Hof festgestellt worden sind. Die bloße Benennung oder Beschuldigung einer Person begründet keinen Anspruch.</p>'
      + '<p>Für <strong>ernsthafte und nachweislich hilfreiche Informationen</strong> wird eine Belohnung von <strong>einer Silbermünze</strong> gewährt. Maßgeblich ist der festgestellte Nutzen der Auskunft. Ein unbestätigtes Gerücht allein genügt nicht. Über das Vorliegen der Voraussetzungen entscheidet die zuständige Stelle nach Prüfung.</p>'
      + '<p>Wer Angaben vorbringt, hat eigenes Wissen, Vermutung und fremde Mitteilung deutlich voneinander zu unterscheiden. Ein redlicher Irrtum ist keine wissentlich falsche Aussage. <strong>Erfundene Beobachtungen, vorsätzliche Falschbeschuldigungen und zum Zwecke der Bereicherung vorgebrachte Täuschungen werden dagegen streng geahndet.</strong> Auf Nachsicht soll sich dabei niemand berufen.</p>'
      + '<p>Dieser Aushang betrifft ein schweres Unglück im Bannkreis Gwynthors. Wer erwägt, daraus durch falsche Hinweise einen Vorteil zu ziehen, möge sein Vorhaben sorgfältig ein zweites Mal prüfen, ehe er damit vor den Hof tritt. <strong>Eine erschlichene Belohnung steht ihm nicht zu; die Verantwortung für seine Aussage verbleibt bei ihm.</strong></p>'
      + '<p><em>Neithon Draig<br>Adjutant des Justiziars von Gwynthor</em></p>' };

  const appeal = { ...shared, ...identity(authors.investigator), id: `${FLEISCHSAMMLER_NOTICE_ID}-fahndung`,
    stackOrder: 2, typ: 'ankuendigung', title: 'Aufruf zur Mitteilung von Beobachtungen',
    untertitel: 'Meredydd Gwyllach · Netzmeister der Fahndung',
    table: [{ k: 'Hinweise', v: 'Unmittelbar an den Hof von Gwynthor' },
      { k: 'Söldner und Kopfgeldjäger', v: 'Zuerst beim Kommandanten der Stadtwache melden' }],
    text: '<p>Die im östlichen Bannkreis während des vergangenen Monats aufgefundenen Frauen wurden zunächst als Opfer voneinander unabhängiger Taten betrachtet. Der Vergleich der Befunde hat diese Einordnung widerlegt. Die Fahndung geht inzwischen von <strong>einem Serientäter</strong> aus.</p>'
      + '<p>An den Leichnamen fehlen Teile des Körpers. Dieser sichtbare Umstand hat dem Täter den Namen <strong>Fleischsammler</strong> eingetragen. Der Beiname bezeichnet den Befund. <strong>Er erklärt weder den Beweggrund noch den Zweck der Taten.</strong> Beides ist unbekannt. Weitergehende Deutungen sind derzeit ohne gesicherte Grundlage.</p>'
      + '<p>Gesucht werden Beobachtungen, die sich <strong>auf den östlichen Bannkreis, die späten Abend- und Nachtstunden und den vergangenen Monat</strong> beziehen. Wer etwas mitteilen kann, soll angeben, was er selbst wahrgenommen hat, wo dies geschah und wann. Eine ungenaue Zeitangabe ist als solche zu bezeichnen. Von anderen Gehörtes ist als fremde Mitteilung kenntlich zu machen.</p>'
      + '<p><strong>Hinweise sind unmittelbar an den Hof von Gwynthor zu richten.</strong> Es genügt, die Beobachtung vollständig und ohne Ausschmückung vorzubringen. Ob sie mit anderen Feststellungen zusammenhängt, wird dort geprüft. Weitere Einzelheiten der Ermittlung werden an dieser Stelle nicht bekanntgegeben.</p>'
      + '<p><strong>Söldner, Kopfgeldjäger und andere zur Übernahme der Suche bereite Personen melden sich zunächst beim Kommandanten der Stadtwache.</strong> Eine Weiterleitung an die Fahndung erfolgt gegebenenfalls durch ihn. Die Meldung beim Kommandanten ersetzt nicht die unmittelbare Abgabe vorhandener Hinweise an den Hof.</p>'
      + '<p><em>Meredydd Gwyllach<br>Netzmeister der Fahndung</em></p>' };

  const sketch = `${art}/sinnbild-v1.png`;
  const description = { ...shared, ...identity(authors.investigator), id: `${FLEISCHSAMMLER_NOTICE_ID}-taeterblatt`,
    stackOrder: 3, typ: 'ankuendigung', title: 'Der Fleischsammler · Täter unbekannt',
    untertitel: 'Sinnbild · Keine Zeichnung nach Zeugenaussage', table: [], portrait: sketch,
    media: { ...identity(authors.investigator).media,
      portrait: { kind: 'image', name: 'Abstraktes Sinnbild: gesichtslose Kapuzengestalt mit Hackebeil; keine gesicherte Täterdarstellung', src: sketch, fit: 'contain', position: 'center' } },
    text: '<p><strong>Eine brauchbare Personenbeschreibung liegt nicht vor.</strong> Gesicht, Alter, Größe, Statur und Kleidung des Täters sind unbekannt. Die Zeichnung ist ein Sinnbild. <strong>Weder Kapuze noch Hackebeil sind als Merkmal des Täters belegt.</strong></p>'
      + '<p>Nach den bisherigen Feststellungen erfolgen die Überfälle spätabends oder nachts. Die Opfer waren Frauen im Alter von <strong>sechzehn bis vierunddreißig Jahren</strong> und fast immer allein unterwegs. Daraus ergibt sich keine Beschreibung seines Aussehens.</p>'
      + '<p><em>Meredydd Gwyllach<br>Netzmeister der Fahndung</em></p>' };
  return [warning, reward, appeal, description];
}

