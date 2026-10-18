import { operatingMemberNodes } from './post-members.mjs';
import { COUNCIL_SEATS } from './post-factions.mjs';
import { hierarchy, level, office } from './post-hierarchy-model.mjs';

export function buildBankHierarchy() {
  return hierarchy('bank', 'Die Rote Bank · Gwynthor', 'Grafschaftsbank des Verbunds · Leitung Ergalla',
    '<p>Die Rote Bank begleitet jeden Handelsposten der Klingenden Münze. In Gwynthor führt ein <strong>Ergalla</strong> das Bankhaus und den Austausch mit den drei weiteren großen Kontoren Celtigerns Wacht. Der Achterrat setzt die gemeinsamen geschäftlichen Ziele; die Bank führt Konten, Einlagen, Kredite und Abrechnungen unter ihrer eigenen Leitung.</p><p>Jedes Mitglied der Kaufmannsgilde tritt zugleich der Roten Bank bei und erhält ein Konto. Kredit bleibt eine gesonderte Vereinbarung über Betrag, Sicherheiten und Rückzahlung. Auch die vermögenden Familien benötigen Zusagen, wenn ihre Waren und Schiffe mehr Kapital binden, als gerade verfügbar ist.</p>', [
      { id: 'bank-fuehrung', label: 'Führung', parentTreeId: '', levels: [
        level('Bankleitung · dem gemeinsamen Kaufmannsrat verantwortlich', [office('bank-direktor', 'Leitung der Roten Bank', 'Ergalla · örtlicher Familienvertreter', 'Führt das Gwynthorer Bankhaus und koordiniert die Bankstellen Celtigerns Wacht. Verantwortet Einlagen, Kreditentscheidungen und verfügbare Zahlungsmittel.')]),
        level('Leitende Ämter', [
          office('bank-kreditvorstand', 'Leitung Kredit & Sicherheiten', '1 Stelle', 'Bereitet Kreditvorlagen und Beleihungen vor; führt Rückzahlung und gesonderte Vereinbarungen.'),
          office('bank-kassenleitung', 'Hauptkassenleitung', '1 Stelle', 'Sichert Kassenbestände, Ausgabe und Wechsel zwischen Kassen und Verwahrung.'),
          office('bank-kontofuehrung', 'Leitung Konten & Abrechnung', '1 Stelle', 'Verantwortet Mitgliederkonten, Buchüberträge und den Abgleich der Kontore.'),
          office('bank-pruefleitung', 'Leitung Bücherprüfung', '1 Stelle · unmittelbarer Bericht an Bankleitung und Rat', 'Prüft abgeschlossene Bücher und Unstimmigkeiten unabhängig von der täglichen Kasse.')
        ])
      ] },
      { id: 'bank-konten', label: 'Konten & Zahlungsverkehr', parentTreeId: 'bank-fuehrung', levels: [
        level('Schalter und Kontobücher', [
          office('bank-kassierer', 'Kassierer', '8 Stellen', 'Nehmen Ein- und Auszahlungen gegen Beleg an; verwahren weder fremde Siegel noch fremde Vollmachten.'),
          office('bank-kontenschreiber', 'Kontenschreiber', '8 Stellen', 'Führen Kontobücher, Vollmachten und die Abrechnung der Mitglieder.'),
          office('bank-wechsel', 'Wechsel- & Zahlungsbriefschreiber', '4 Stellen', 'Stimmen Zahlungsbriefe und Gegenbuchungen mit anderen Bankkontoren ab.'),
          office('bank-regionalabgleich', 'Regionale Abrechnung', '3 Stellen', 'Halten den Buchabgleich mit Abergwint, Castellbryn und Rhosmere.')
        ])
      ] },
      { id: 'bank-kredit', label: 'Kredit, Pfand & Bewertung', parentTreeId: 'bank-fuehrung', levels: [
        level('Verträge und Sicherheiten', [
          office('bank-kreditpruefer', 'Kreditprüfer', '4 Stellen', 'Prüfen Handel, Ertrag, Verpflichtungen und Sicherheiten eines Antragstellers.'),
          office('bank-pfandmeister', 'Pfandmeister', '2 Stellen', 'Verzeichnen übergebene Sicherheiten und halten Auslösung und Zugriff schriftlich fest.'),
          office('bank-schaetzer', 'Edelmetall- & Warenbewerter', '4 Stellen', 'Wiegen und bewerten Münzen, Metall und Wertwaren. Das Münzprägen verbleibt im lizenzierten Loer-Betrieb.'),
          office('bank-vertrag', 'Kreditvertragsschreiber', '4 Stellen', 'Fertigen Kreditbriefe, Bürgschaften und bestätigte Rückzahlungsvereinbarungen.')
        ])
      ] },
      { id: 'bank-verwahrung', label: 'Verwahrung & Prüfung', parentTreeId: 'bank-fuehrung', levels: [
        level('Bestände und Nachweise', [
          office('bank-tresormeister', 'Verwahrmeister', '2 Stellen', 'Führen gemeinsam beaufsichtigte Übergaben zu den gesicherten Beständen.'),
          office('bank-revisoren', 'Bücherprüfer', '4 Stellen', 'Vergleichen Kassenbelege, Kontobücher und zugesagte Zahlungen.'),
          office('bank-archiv', 'Bankarchivare', '4 Stellen', 'Verwahren Kreditbriefe, Sicherheitenverzeichnisse und abgeschlossene Kontobände.')
        ])
      ] },
      { id: 'bank-mitglieder', label: 'Mitglieder & gewerbliche Konten', parentTreeId: '', levels: [
        level('Die führenden Familien · Familien- und Geschäftskonten', COUNCIL_SEATS.filter(seat => !['falveri-kapital', 'ergalla-bank'].includes(seat.id)).map(seat => ({ ...seat,
          id: `bank-familie-${seat.id}`, title: seat.title.replace(' · Handel', ''), subtitle: 'Mitglied des Verbunds · Rote Bank',
          text: '<p>Die örtliche Familienvertretung führt ihre Bankbeziehungen innerhalb des gemeinsamen Gildenverbunds. Kontostände und einzelne Kreditvereinbarungen bleiben vertraulich.</p>' }))),
        level('Bekannte Inhaber · verpflichtender Bankbeitritt mit der Kaufmannsgilde', operatingMemberNodes('bank-mitglied', 'bank')),
        level('Weiteres Kontenregister', [office('bank-weitere-konten', 'Familien, Inhaber & Zunftsmeister', 'Weitere Mitglieder und Konten', 'Die führenden Familien und weitere Gildenmitglieder führen hier ihre Bankverbindungen. Einzelne Guthaben, Schulden und Kreditlinien bleiben private Vertragsangelegenheiten.')])
      ] }
    ], [{ label: 'Leitung', value: 'Ergalla · Grafschaftsbank in Gwynthor' }, { label: 'Bankbeitritt', value: 'Verbindlich mit jeder Münze-Mitgliedschaft' }, { label: 'Finanzierung', value: 'Kredit und Beteiligung nach gesonderter Vereinbarung' }, { label: 'Prägerecht', value: 'Nur Loer · kein allgemeines Bankrecht' }],
    'Die Bankverwaltung besitzt keine eigene hier ausgeführte Soldatenformation. Gesicherte Transporte und Wachdienste werden mit der Roten Kompanie abgestimmt.');
}
