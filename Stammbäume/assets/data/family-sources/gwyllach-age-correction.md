# Haus Gwyllach · Alterskorrektur vom 05.09.2026

Ausdrückliche Autorenkorrektur anhand des gezeigten Efael-Zweiges: Die Eltern sollen jünger werden, Meirawen und Morwella Zwillinge und höchstens 25 Jahre alt sein. Bezugsjahr ist 1740.

| Person | Vorher | Korrigiertes Geburtsjahr | Alter 1740 |
| --- | --- | --- | --- |
| Efael Gwyllach | 1679 | 1692 | 48 |
| Unbekannte Ehefrau Efaels | unbekannt | 1694 | wäre 46; Lebensstatus unbekannt |
| Meirawen Gwyllach | 1705 | 1716 | 24 |
| Morwella Gwyllach | 1707 | 1716 | 24 |

Die Eltern sind bei der Geburt der Zwillinge 24 und 22. Rhydderchs belegtes Geburtsjahr 1653 bleibt bestehen; bei Efaels Geburt ist er 39. Efaels Geschwister und die übrigen Familienlinien müssen dafür nicht verändert werden. Der Lebensstatus der namenlosen Mutter bleibt unbekannt; ihr ergänztes Geburtsjahr ist keine Todes- oder Überlebensangabe.

Beide Schwestern erhalten den sichtbaren Titel „Zwillingsschwester“, das bestehende Tagformat „Zwillinge“ und eine gegenseitige Erläuterung. Personen-, Weltpersonen- und Beziehungskennungen sowie Bilder bleiben erhalten. Die Akte umfasst weiterhin 33 Personen, zwölf Partnerschaften und 20 Abstammungen, vier Wegverheiratungen sowie die vorhandene Herkunftslücke unter dem Hauswappen.

`sourceRevision: 2` überträgt die Korrektur gezielt in ältere gespeicherte Familienakten. Verwaltet werden die vier Geburtsjahre und zugehörigen Notizen sowie die Zwillingskennzeichnung; unabhängige Ergänzungen bleiben bestehen.

Die beiden bereits aus dem Stammbaum importierten Almanach-Figuren enthalten ihre früheren Geburtsjahre auch im lokalen Archivexport. Dort sind ausschließlich die zwei über ihre eindeutigen IDs bestimmten Figuren in `genealogy.birth` und `genealogy.tags` korrigiert. Das Exportdatum bleibt das historische Exportdatum; diese Datei dokumentiert die spätere Autorenkorrektur. Die lokale Charakterdatenbank wird daraus mit dem vorhandenen Generator neu erstellt. So entstehen keine zusätzlichen Personenakten mit abweichenden Altersangaben.

## Prüfung

- Familienschema, Altersabstände und bestehende Familienstruktur geprüft. Zwei neue Regressionstests bestätigen die Zwillingsdaten und die gezielte Aktualisierung einer gespeicherten Revision 1 einschließlich erhaltener eigener Ergänzungen.
- Gesamttests: die zehn separaten Register-/Bradrhith-Tests bestehen; von 1.246 Stammbaumtests bestehen 1.239. Die sieben zuvor bekannten Fehler anderer Familienakten bleiben unverändert. Alle Gwyllach-Tests bestehen.
- Gwyllach im Browser: beide Schwestern zeigen „Zwillingsschwester“ und `1716 – lebend`, Efael `1692 – lebend`, die unbekannte Mutter das Jahr 1694. Keine Kartenüberlappung, Linie-durch-Karte-Kollision, versetzten Hausknoten, überbreiten Routen oder Browser-Ausnahmen.
- Vollständiger Browser-Kontrolllauf: 395 Familienakten, keine fehlgeschlagene Akte. Bestehende Routenhinweise betreffen weiterhin 58 Akten mit breiten Routen und elf mit langen Partnerleitungen; Gwyllach hat keine dieser Warnungen.
- Charakterdatenbank synchronisiert und `--check` erfolgreich: 226 Figuren, 147 Familienverknüpfungen, keine doppelten Weltpersonen. Der Vergleich mit dem bisherigen Commit bestätigt genau zwei geänderte Figuren: Meirawen und Morwella.
