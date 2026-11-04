# Prüfstand · 3. November 2026

## Prüfen und bauen

Im Ordner `Ideenwerk` ausführen:

```sh
npm test
npm run check
npm run build
```

`npm test` führt die Regressionstests ohne externe Schreibzugriffe aus.
`npm run check` prüft JavaScript-Syntax und lokale Modulimporte.
`npm run build` bündelt die Quellen zur direkt öffnenden Datei `Ideenwerk.html`;
dafür wird die vorhandene Entwicklungsabhängigkeit esbuild benötigt.

## Abgedeckte Bereiche

- Leerer Erststart und genaue Erkennung unveränderter Altbeispiele. Bearbeitete
  Texte, Bilder, verschobene Karten und eigene Pinnwände bleiben erhalten; die
  Migration verändert die Eingabe nicht und ist wiederholbar.
- Projektformat und Vorlagen mit Bildern und Mindmap-Verbindungen; ungültige
  Importe; HTML-Escaping; Suche; Undo/Redo; Reihenfolge asynchroner Speicherungen;
  Speicherfehler; Import ohne Überschreiben vorhandener Pinnwände.
- Modul- und Avatarwünsche, Pflichtangaben und Referenzbilder; die Trennung
  zwischen lokalem Entwurf und ausdrücklich ausgewählter GitHub-Übergabe.
- Wunschpakete mit Markdown, strukturierten Angaben und separaten Bilddateien.
  Bilddaten und Dateipfade werden geprüft; fremde Projektinhalte gehören nicht
  zum Wunschpaket.
- Getrennte GitHub-Branches `ideenwerk-wuensche` und `ideenwerk-backup`, private
  Wunschrepositories, Konflikterkennung, Bestätigung des gespeicherten Commits
  sowie Schutz des Standardbranchs. Der Transport verwendet keinen Force-Push.
- Eigenständige HTML-Ausgabe mit eingebetteten Stylesheets, Skript und Symbolen.

Die GitHub-Prüfungen verwenden einen simulierten API-Transport. Sie benötigen
keinen echten Token und übertragen keine Daten an GitHub. Die abschließenden
Testergebnisse und die Browserprüfung werden mit der fertigen Ausgabe festgehalten.

## Bedienprüfung

Für die fertige Fassung im Browser insbesondere diese Abläufe durchgehen:

1. Ohne Beispiele starten; eine normale Idee anlegen, bearbeiten und nach dem
   Neuladen wiederfinden. Datei sichern und als weitere Pinnwand öffnen.
2. Einen Modulwunsch erstellen und beschreiben. Einen Avatarwunsch erstellen,
   ein lokales Referenzbild einfügen und die benötigten Angaben ergänzen.
3. Die Wunschübersicht öffnen. Lokale Speicherung und GitHub-Übergabe müssen
   verständlich unterscheidbar sein. Ein unvollständiger Wunsch darf nicht
   versehentlich ausgewählt werden.
4. Nach einer bestätigten Übergabe den aktuellen Stand anzeigen; nach einer
   inhaltlichen Änderung erneut auf die nötige Übergabe hinweisen.
5. Dialoge schließen und prüfen, dass der Token aus den Eingabefeldern entfernt
   wurde. Speichern im Browser darf keinen GitHub-Push auslösen.
6. Beschreibungen, Listen und Bilder in schmaler sowie breiter Darstellung
   kontrollieren; Bearbeitung, Hilfe und Speichern sollen erreichbar bleiben.

Ein eigener privater GitHub-Zugang ist für die vollständige reale Übergabe nötig:
Repository mit README anlegen, die andere Person einladen, einen Fine-grained
Token nur für dieses Repository mit **Contents: Read and write** erstellen und
beides im GitHub-Dialog eintragen. Der Token wird nicht dauerhaft gespeichert.

Nach dem ersten GitHub-Speichern den Branch `ideenwerk-wuensche` in VS Code
auschecken. Die Wunsch-README in der Markdown-Vorschau öffnen, Referenzbilder
prüfen und eine weitere Übergabe über **Pull** abrufen. Die vollständige Anleitung
steht in `README.md`.

## Stand der Verbindung

Abschlussprüfung am 3. November 2026: 41 automatisierte Tests bestanden;
43 JavaScript-Module auf Syntax und lokale Imports geprüft. Die eigenständige
HTML-Datei wurde aus den aktuellen Quellen neu gebaut und auf vollständige
eingebettete Laufzeitressourcen geprüft. Die GitHub-Tests verwenden simulierte
Antworten und prüfen auch Konflikte, Referenzbilder und getrennte Wünsche.

Die visuelle Browserprüfung blieb offen: Die Browseranbindung scheiterte schon
vor der Navigation zur lokalen Prüfansicht. Daraus wird kein erfolgreicher
Bildimport im echten Browser oder durchgeführter Live-Push abgeleitet.

Es wurde kein echtes GitHub-Repository verbunden und kein externer Push
ausgeführt. Die Verbindung wird im fertigen Editor konfiguriert. Die lokale
Implementierung und die simulierten Transporttests ersetzen diese Anmeldung
nicht. Es fand kein Deployment statt.
