import { pinPosition } from '../../assets/js/composition/board-composition-model.mjs';
import { DEFAULT_BOARD_SIZE } from '../../assets/js/composition/board-composition-config.mjs';
import { NOTICE_SEALS } from '../../assets/js/seals/notice-seals-model.mjs';

export const GUILD_TAX_NOTICE_ID = 'gwynthor-gildenjahresrechnung-a38';
export const GUILD_ANNUAL_ACCOUNT = 'Zunft- und Gildenjahresrechnung mit Abgabenschlussausgleich';
export const GUILD_TAX_POSTER = Object.freeze({ id: 'gwynthor-poster-wolken-daemmerung', assetId: 'wolken-daemmerung',
  x: .142823, y: .57193, width: .050239, rotation: 15, layer: 3037,
  noticeId: GUILD_TAX_NOTICE_ID,
  pin: { assetId: 'left', x: .08, y: .05, size: .21895340273492703, rotation: 0, enabled: true } });
export const GUILD_TAX_BOARD_BINDING = Object.freeze({ posterId: GUILD_TAX_POSTER.id,
  assetId: GUILD_TAX_POSTER.assetId, noticeId: GUILD_TAX_NOTICE_ID, poster: GUILD_TAX_POSTER });

const art = 'assets/images/notices/gildenjahresrechnung-a38';
const signature = `${art}/tewdwr-gairfan-unterschrift-v1.webp`;
const yellowForm = `${art}/gelbes-formular-a38-v1.webp`;
const emblem = '../IconOrdner/Gilden%20Orden%20Pins/WolkenderD%C3%A4mmerungPin-removebg-preview.png';
const seal = NOTICE_SEALS.find(entry => entry.id === 'wolken-der-daemmerung').src;

export function buildGuildTaxNotice(asset) {
  return { ...pinPosition(GUILD_TAX_POSTER, asset, DEFAULT_BOARD_SIZE),
    id: GUILD_TAX_NOTICE_ID, noticeGroupId: GUILD_TAX_NOTICE_ID, typ: 'erlass',
    title: 'Das Gelbe Formular A38',
    untertitel: 'Letztmalig wiederholte Klarstellung zur Zunft- und Gildenjahresrechnung',
    verfasserName: 'Tewdwr Gairfân · Beigeordneter Rechnungssekretär zweiter Ordnung',
    typography: { font: 'template', heading: 'template', script: 'common' },
    emblem: yellowForm, verfasser: emblem, portrait: '', unterschrift: signature, siegel: seal, sealPreset: 'wolken-der-daemmerung',
    imageFit: 'contain', imagePosition: 'center', sideWidth: 190,
    media: { emblem: { kind: 'image', name: 'Gelbes Formular A38 · Vorprüfung der Jahresrechnung', src: yellowForm, fit: 'contain' },
      verfasser: { kind: 'image', name: 'Gwynthorer Amtsstelle der Wolken der Dämmerung', src: emblem, fit: 'contain' },
      unterschrift: { kind: 'image', name: 'Tewdwr Gairfân · Unterschrift', src: signature, fit: 'contain' },
      siegel: { kind: 'image', name: 'Amtssiegel der Wolken der Dämmerung', src: seal, fit: 'contain' } },
    table: [{ k: 'Ausgebende Stelle', v: 'Wolken der Dämmerung · Gwynthorer Amtsstelle' },
      { k: 'Geltungsbereich', v: 'Sämtliche in Gwynthor geführten Zünfte und Gilden' },
      { k: 'Erste Anlaufstelle', v: 'Amtsbüro für Abgaben und Leistungen · Raum A21' }],
    text: '<p>Da einzelne Zünfte und Gilden die ordnungsgemäße Erfüllung ihrer längst hinreichend erläuterten Abgabenpflichten weiterhin zum Gegenstand vermeidbarer Rückfragen, unvollständiger Einreichungen und sonstiger eigener Auslegungen machen, sieht sich die Gwynthorer Amtsstelle der <strong>Wolken der Dämmerung</strong> zu nachstehender <strong>vereinfachter Verfahrensbelehrung</strong> veranlasst.</p>'
      + `<p>Nach Ablauf eines jeden Rechnungsjahres ist die <strong>${GUILD_ANNUAL_ACCOUNT}</strong> vorzulegen. Sie weist Einnahmen, Ausgaben, bereits geleistete Abgaben sowie geltend gemachte Nachlässe und Befreiungen aus. Ihr Zweck ist die abschließende Feststellung, ob eine <strong>Nachzahlung</strong> zu leisten, ein <strong>Abgabennachlass</strong> anzurechnen oder ein bereits überzahlter Betrag <strong>gutzuschreiben</strong> ist. Eine beiläufige Mitteilung, es sei „ungefähr wie im Vorjahr“, genügt dieser Feststellung nicht.</p>`
      + '<p><strong>1. Vorlegung der Vorlegungsunterlagen.</strong> Bücher, Belege und Jahresrechnung sind dem <strong>Amtsbüro für Abgaben und Leistungen, Raum A21</strong>, in zweifacher Abschrift zu überlassen; die Originale sind zur Einsicht mitzuführen und werden zurückgegeben. Belege sind fortlaufend zu zählen. Auch ausbleibende Einnahmen sind ausdrücklich als solche zu erklären. Ein leeres Feld ist keine Null, sondern ein leeres Feld.</p>'
      + '<p><strong>Zur Raumfrage:</strong> Der bisherige Raum <strong>B239</strong> bleibt wegen eines diesen Monat aufgetretenen <strong>Rattenproblems</strong> geschlossen. Die Zuständigkeit ist vollständig nach A21 verlegt. Die im bisherigen Raum verbliebenen Ratten sind zur Entgegennahme von Schriftstücken nicht ermächtigt.</p>'
      + '<p><strong>2. Erlangung des Gelben Formulars.</strong> Nach Abgabe der Abschriften erhalten Sie in A21 das <strong>Gelbe Formular A38 — Antrag auf Feststellung der Vorprüfungsfähigkeit einer Jahresrechnung</strong>. Es ist vollständig auszufüllen. Seine Aushändigung bestätigt weder die Vollständigkeit der Rechnung noch deren Richtigkeit, sondern ausschließlich die erfolgte Aushändigung des Gelben Formulars.</p>'
      + '<p><strong>3. Bescheinigung der Bescheinigungsfähigkeit.</strong> Das ausgefüllte A38 ist der <strong>Abteilung für Gildenrechnung und Abgabenausgleich, Raum C14</strong>, vorzulegen. Dort wird die <strong>Grüne Vorprüfungsbescheinigung U4</strong> ausgestellt. Deren grüne Färbung stellt keine abgabenrechtliche Entlastung dar. Sie bescheinigt lediglich, dass die Vorprüfung als grundsätzlich prüfbar vorgemerkt werden kann.</p>'
      + '<p><strong>4. Gegenzeichnung und geordneter Rücklauf.</strong> Mit A38 und U4 begeben Sie sich zur <strong>Gegenzeichnungsstelle, Raum A7</strong>, und erlangen die <strong>Rücklaufbestätigung R11</strong>. Anschließend legen Sie sämtliche drei Blätter erneut in <strong>A21</strong> vor. Dort erhalten Sie nach Abgleich der Gegenzeichnung die <strong>Ausgabefreigabe für eine Vorsprachenummer, N2</strong>. Die Gegenzeichnungsstelle vergibt keine Termine.</p>'
      + '<p><strong>5. Ordnungsgemäßer Empfang.</strong> Mit N2 wenden Sie sich an unsere geschätzte <strong>Empfangsdame Frau Briallen in der Vorhalle</strong>. Sie wird Ihnen mit der ihr eigenen Freundlichkeit eine <strong>Wartenummer</strong> aushändigen. Frau Briallen nimmt keine Jahresrechnungen entgegen und ersetzt weder Gegenzeichnung noch Rücklaufbestätigung. Auch wiederholtes freundliches Fragen ersetzt diese nicht.</p>'
      + '<p><strong>6. Zugang zur Terminvergabe.</strong> Nach Aufruf Ihrer Wartenummer dürfen Sie an <strong>Schalter 4</strong> einen <strong>Termin zur eigentlichen Sachprüfung</strong> vereinbaren. Die Wartenummer ist kein Termin. Die Vereinbarung eines Termins ist keine Sachprüfung. Eine Sachprüfung findet zum vereinbarten Termin statt.</p>'
      + '<p><strong>7. Abschließende Behandlung.</strong> Zum Termin finden Sie sich wieder in <strong>C14</strong> ein und führen Originale, A38, U4, R11, N2 und die Terminbestätigung mit. Nach Prüfung Ihrer Jahresrechnung ergeht der <strong>Abgabenschlussbescheid A38-E</strong> mit dem festgestellten Ausgleich. Erst diesem entnehmen Sie eine Nachforderung, einen anerkannten Nachlass oder eine Gutschrift. Bereits fällige Vorausabgaben werden durch das Warten auf einen Termin nicht aufgeschoben.</p>'
      + '<p><strong>Abschließend:</strong> Eine Abschrift auf ungefärbtem Papier gilt auch dann nicht als Gelbes Formular, wenn das Wort „gelb“ darauf vermerkt wurde. Die derzeitige Rattenlage ist kein anerkannter Grund für einen Abgabennachlass.</p>'
      + '<p>Es besteht somit kein Anlass zu weiteren Unklarheiten.</p>'
      + '<p><em>Im Auftrag der Gwynthorer Amtsstelle der Wolken der Dämmerung.</em></p>',
    artikel: [], personen: [], comments: [], secret: false,
  };
}
