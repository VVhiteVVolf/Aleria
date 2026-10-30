# Brevanor · Prüfbelege vom 30. Oktober 2026

Die historische Vorbereitungsseite liegt unter `Vorschau/Brevanor/`.
Sie umfasst 17 Orte, drei Comteyrate und die königliche Domäne, 21 Gebietswappen,
26 Häuser mit 26 vollständigen Figuren und drei separate Schildformvorlagen.
Brethneachs antikes Lilienwappen wurde im Geschichtsteil ergänzt und am Desktop
sowie mobil geprüft (`brethneach-history.png`, `mobile-brethneach.png`). Die
abschließend gemeinsamen Rangquellen lauten Chastor → Ritterfürst, Bannor und
Pajet. Alle zehn landes- und klassenspezifischen Abschlussprüfungen bestehen
nach diesen letzten Änderungen (`final-brevanor-tests.log`).
20 Häuser sind zugeordnet, sechs frei; die Hauptstadt besitzt vier Häuser.

Die Nutzernachträge sind eingearbeitet: Auberts Stoffwappen zeigen jeweils einen
einköpfigen Pegasus. Trevains Pferd wurde neu ausgerichtet und sein offener Helm
ergänzt. Gerain sitzt in Hervant, Kervaut als zusätzliche Familie in Caerennes;
Klassen, Hauswappen und Identitäten wurden dabei nicht getauscht.

Die berichtigte Karte besitzt 6144 × 5429 Pixel. `map-update.json` und
`map-anchor-update.json` dokumentieren Originalhash und 17 neu vermessene Anker.
Die erste Karte bleibt als `source-originals/map-initial.png` zusammen mit ihrem
ersten Quellenmanifest erhalten. Die Webbilder bewahren Grenzen und Geometrie;
neue Namen sind ausschließlich Browseroverlays.

## Automatische Prüfung

- Alle 70 Tests unter `Vorschau/tests` bestehen (`preview-tests.log`).
- Alle sechs Brevanor-Klassentests bestehen; sieben leere Klassen bleiben erhalten.
- Heraldik-Audit: 36 Bilder einschließlich Brethneachs antikem Lilienwappen,
  unveränderte RGB-Daten, geschlossene Wappeninnenflächen.
- Figuren-Audit: 26 Bilder, unveränderte RGB-Daten, gültige Alpha- und WebP-Dateien.
  Einige Rohbilder besitzen knappe transparente Ränder; kein Motiv berührt die
  Canvasgrenze. Der Originalbestand und die verworfenen ersten beiden Cabrant-
  Fassungen bleiben erhalten.
- `git diff --check` ohne Beanstandung.

## Browserprüfung

`browser-checks.json` enthält die tatsächlichen Dialogbeobachtungen: 26 Hausfenster
am Desktop, dieselben 26 bei 312 × 675 CSS-Pixeln, alle 21 Gebietswappenfenster.
Keine Dialogüberbreite, Figuren durchgehend mit `object-fit:contain`, neue Fenster
beginnen oben. Einige unmittelbar nach dem Öffnen beobachtete `loaded:false`
Werte gehören zu noch ladenden oder unterhalb des sichtbaren Bereichs liegenden
Bildern. Die abschließende Seite enthält keine fehlgeschlagenen Bildladevorgänge.
Erfasste Konsolenfehler stammen ausschließlich von einem `chrome-extension://`
Modul, nicht von der Brevanor-Seite.

Auswahl und Zielwahl, tatsächliches Ziehen eines Kartenwappens, Rückgängig,
Speicherung über Neuladen, JSON-Export, Dateiimport und Ausgangsstand wurden über
die sichtbare Oberfläche geprüft. Die Testbewegungen wurden zurückgenommen.
Gerain/Hervant und Kervaut/Caerennes sind im abschließenden Entwurf bestätigt.
Der Browser-Viewport wurde zurückgesetzt.

Dies ist ein lokaler Entwurf. Es wurden weder Firebase-Daten noch kanonische
Hausregister geändert und kein Commit, Push oder Deploy durchgeführt.
