import { getSpellManaCost } from '../../../AleriaAlmanach/modules/combat/combat-resource-progression.js';

const restitution = {
  volume: 'II', subtitle: 'Heilen und Wiederherstellen.',
  intro: 'Den Lebensfaden halten. Wunden schließen. Geschädigte Kraft erneuern.<br>Das Zauberverzeichnis der gelehrten Restitution.',
  countLabel: 'Bereiche', count: 6, sigil: 'VITA · CORPUS · LUMEN', navigation: 'Behandlungsbereiche',
  register: 'Jede Behandlung hat ihre Grenzen. Heilung, Körperreparatur und Zustandsbehandlung werden einzeln erlernt.',
  noticeTitle: 'Von der Heilenden Hand zur Großen Heilung',
  notice: `Heilende Hand beginnt auf Grad I mit 2W6 und wächst bis Grad VI auf 7W6. Große Heilung ist ein eigener Zauber ab Grad VII: feste 35 TP, ${getSpellManaCost(7)} Mana sowie Aktion + Besondere Aktion. Ein geheilter Körper erhält keine verbrauchten Aktionen oder Mana zurück.`,
  conventions: [
    '<b>Gezielt wiederherstellen.</b> Reguläre Heilung endet am TP-Maximum. Temporäre TP sind ein eigener Vorrat; es gilt der höhere Wert, keine Addition. Kein allgemeiner Attributsbonus und keine kritische Heilung. Heilwürfel beseitigen nur dann weitere Beeinträchtigungen, wenn die Karte sie ausdrücklich nennt.',
    '<b>Leben und Behandlung.</b> 0 TP allein bedeutet nicht Tod. Behandelbare Lebende können durch geeignete Heilzauber wieder TP erhalten; bestätigter Tod, Untote und Konstrukte sind keine gewöhnlichen Heilziele. Zustimmung, Sicht und Wirkungslinie gelten weiterhin. Arkanistenfieber, besondere Seuchen und aktive Flüche werden nicht durch eine allgemeine Krankheitsheilung aufgehoben.',
    '<b>Zeit und Konzentration.</b> Folgende Zielbeiträge und eigene Beiträge des Zaubernden sind verschiedene Zeitgeber. Der Entstehungsbeitrag zählt nicht; zusätzliche Abschnitte eines Posts erzeugen keine weiteren Pulse. Nachheilung hat feste Grenzen. Die Karte nennt, welche Pulse, Ladungen oder Befunde gemeinsam nachgehalten werden.',
    '<b>Rituale und Rast.</b> Ein Ritual wird erst nach der genannten Dauer als Abschluss verbucht. Genesungsschlaf bezahlt ausdrücklich beim Beginn des eigentlichen Heilschlafs. Eine kurze Rast stellt schon nach einer Stunde reguläre TP wieder her; ein Heilritual löst keine zusätzliche Rast oder Ressourcenregeneration aus.',
    '<b>Gemeinsam mit dem Charakterbogen.</b> Die Vorlagen stehen im Archiv unter Restitution. Gelernte eigene Zauber und frühere Fassungen werden nicht automatisch ersetzt. Die Hinweise „Am Spieltisch“ benennen Befunde, Reaktionen und Folgeeffekte, die gemeinsam aufgelöst werden; eine Karte entfernt niemals still sämtliche Zustände.'
  ],
  pending: [
    { id: 'rueckruf-des-letzten-funkens', name: 'Rückruf des letzten Funkens', source: 'R47', text: 'Die Grenze zwischen einem erlöschenden Leben und der Rückkehr eines Verstorbenen ist noch nicht festgelegt. Regeln zu Tod, Körper und Seele folgen.' },
    { id: 'vollstaendige-restitution', name: 'Vollständige Restitution', source: 'R48', text: 'Körperneubildung und die Rückkehr einer Seele bleiben offene Grenzkunst. Zeitfenster, Materialien und zulässige Wiederbelebung sind noch auszuarbeiten.' }
  ]
};

const elemente = {
  volume: 'I', subtitle: 'Die Kräfte der stofflichen Welt.',
  intro: 'Feuer bündeln. Wasser formen. Wind und Gewitter lenken.<br>Das Zauberverzeichnis der gelehrten Elementarschule.',
  countLabel: 'Elemente', count: 6, sigil: 'IGNIS · AQUA · AER · TERRA', navigation: 'Elementare Ausrichtungen',
  register: 'Die Elemente werden einzeln erlernt. Donner und Blitz sind eigene Ausrichtungen.',
  noticeTitle: 'Vom Funken zum Großen Feuerball',
  notice: `Feuerball beginnt auf Grad 2 mit 3W6 und wächst bis Grad 6 auf 7W6. Der Große Feuerball ist ein eigener Zauber ab Grad 7: 8W6, ${getSpellManaCost(7)} Mana sowie Aktion + Besondere Aktion + Reaktion. Größere Flächen, längere Wirkungen und zusätzliche Kontrolle zählen bei den Kosten mit.`,
  conventions: [
    '<b>Wirkung und Grenzen.</b> Ein höherer Grad verwendet nur seine aufgeführten Werte. Es gibt keine freie Steigerung einzelner Parameter und keine zusätzlichen Nässe-Schadenswürfel. Flächen können Verbündete treffen; Sicht, Wirkungslinie, vorhandenes Material und Größe gelten weiterhin.',
    '<b>Zeit am Spieltisch.</b> „Eigene Beiträge“ meint die Beiträge des Zaubernden. Konzentrationsabbruch wird im Kampf berücksichtigt; die angegebene Höchstdauer, Gelände und spätere Kontakte werden gemeinsam nachgehalten. Die hier aufgeführten Konzentrationszauber haben keine zusätzlichen Mana-Erhaltungskosten. Rituale werden erst nach der angegebenen Zeit als Abschluss verbucht; bei angekündigten Kampfzaubern ist der erste Beitrag Vorbereitung und der zweite die bezahlte Entladung.',
    '<b>Gemeinsam mit dem Charakterbogen.</b> Die aktuellen Vorlagen stehen im Archiv unter Elemente. Großformen werden separat erlernt; ein verstärkter kleiner Zauber wird nicht automatisch zur Großform. Gelernte Katalogzauber behalten ihre Wirkungsfassung. Die Manakosten aller Zauber richten sich nach der aktuellen gemeinsamen Gradstaffel. Eigene Bearbeitungen werden als eigene Fassung geführt. Die Hinweise „Am Spieltisch“ benennen Wirkungen, die gemeinsam aufgelöst werden.'
  ], pending: []
};

export function getSpellListCopy(catalog) { return catalog === 'restitution' ? restitution : elemente; }
