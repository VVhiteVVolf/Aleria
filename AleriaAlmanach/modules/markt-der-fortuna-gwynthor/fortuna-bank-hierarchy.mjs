import { FORTUNA_FACTIONS } from './fortuna-factions.mjs';
import { fortunaBusinessNodes } from './fortuna-network.mjs';
import { fortunaHierarchy, level, office } from './fortuna-hierarchy-model.mjs';
export function buildFortunaBankHierarchy() {
  return fortunaHierarchy('bank', 'Die Blaue Bank · Gwynthor', 'Bankleitung Falto · Kapital und Zahlungswege des Handelshofes',
    '<p>Die örtliche <strong>Blaue Bank</strong> liegt unter einer Leitung aus dem Haus <strong>Falto</strong>. Sie führt Einlagen, Zahlungsbriefe und Finanzierung für den Handelshof und seine Kunden. Dem Neunerrat verantwortet sie die gemeinsamen Bankangelegenheiten; ihre laufenden Bücher und Kreditverträge bleiben gesondert geführt.</p><p>Die Häuser stellen Schiffe, Waren und Handwerk, doch eine Fahrt bindet Kapital, bevor ihr Erlös eintrifft. Die Bank vermittelt zwischen verfügbaren Mitteln, laufenden Verpflichtungen und vereinbarten Sicherheiten. Eine Handelskooperation allein ist weder ein Nachweis über ein Konto noch eine Kreditzusage.</p>', [
      { id: 'fortuna-bank-fuehrung', label: 'Führung', parentTreeId: '', levels: [
        level('Bankleitung · dem gemeinsamen Rat verantwortlich', [office('fortuna-bankleitung', 'Leitung der Blauen Bank', 'Falto · örtliche Familienvertretung', 'Führt das Gwynthorer Bankhaus, verantwortet Bestände und Kreditentscheidungen und hält Verbindung zum kaufmännischen Rat.')]),
        level('Leitende Ämter', [
          office('fortuna-bank-kredit', 'Leitung Kredit & Sicherheiten', '1 Stelle', 'Prüft Finanzierungsanträge und leitet Vertragsführung und Rückzahlung.'),
          office('fortuna-bank-kasse', 'Hauptkassenleitung', '1 Stelle', 'Verantwortet verfügbare Zahlungsmittel, Kassenwechsel und beaufsichtigte Übergaben.'),
          office('fortuna-bank-konten', 'Leitung Konten & Zahlungsbriefe', '1 Stelle', 'Verantwortet Einlagen, Belege und den Austausch mit anderen Bankkontoren.'),
          office('fortuna-bank-revision', 'Leitung Bücherprüfung', '1 Stelle', 'Prüft die täglichen Geschäfte und berichtet Unstimmigkeiten an Bankleitung und Rat.')
        ])
      ] },
      { id: 'fortuna-bank-zahlung', label: 'Konten & Zahlungsverkehr', parentTreeId: 'fortuna-bank-fuehrung', levels: [level('Schalter und Buchführung', [
        office('fortuna-bank-kassierer', 'Kassierer', '6 Stellen', 'Nehmen Ein- und Auszahlungen gegen Beleg entgegen.'),
        office('fortuna-bank-schreiber', 'Kontenschreiber', '6 Stellen', 'Führen Kontobücher, bestätigte Vollmachten und laufende Abrechnungen.'),
        office('fortuna-bank-wechsel', 'Zahlungsbriefschreiber', '4 Stellen', 'Stimmen Zahlungsbriefe und bestätigte Gegenbuchungen mit den beteiligten Kontoren ab.')
      ])] },
      { id: 'fortuna-bank-pfand', label: 'Kredit & Verwahrung', parentTreeId: 'fortuna-bank-fuehrung', levels: [level('Bewertung, Sicherheiten und Nachweise', [
        office('fortuna-bank-pruefer', 'Kredit- & Warenprüfer', '4 Stellen', 'Prüfen Ertrag, Verpflichtungen, Wert und Verfügbarkeit angebotener Sicherheiten.'),
        office('fortuna-bank-pfandmeister', 'Pfand- & Verwahrmeister', '2 Stellen', 'Führen gesicherte Bestände und verzeichnete Pfänder unter beaufsichtigter Übergabe.'),
        office('fortuna-bank-buchpruefer', 'Bücherprüfer', '3 Stellen', 'Vergleichen Konten, Kassenbelege und zugesagte Zahlungen.'),
        office('fortuna-bank-archiv', 'Vertrags- & Bankarchivare', '3 Stellen', 'Verwahren Kreditbriefe und abgeschlossene Bücher.')
      ])] },
      { id: 'fortuna-bank-partner', label: 'Familien & bekannte Bankkunden', parentTreeId: '', levels: [
        level('Führende Häuser im geschäftlichen Umfeld der Bank', FORTUNA_FACTIONS.map(f => office(`fortuna-bank-haus-${f.id}`, f.name, f.business, 'Verbindung des führenden Hauses zur örtlichen Bank- und Handelsabstimmung. Guthaben und einzelne Kreditvereinbarungen werden gesondert geführt.', f.emblem))),
        level('Bereits ausdrücklich belegte örtliche Bankkunden', fortunaBusinessNodes('fortuna-bank-kunde', true))
      ] }
    ], [{ label: 'Leitung', value: 'Falto · Blaue Bank Gwynthor' }, { label: 'Bekannter Kunde', value: 'Brenn Vann · Letzte Rast' }, { label: 'Verträge', value: 'Konto, Kredit und Sicherheiten jeweils gesondert belegt' }]);
}
