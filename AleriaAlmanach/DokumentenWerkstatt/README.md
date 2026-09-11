# Dokumentenwerkstatt

Einstieg: `AleriaAlmanach/DokumentenWerkstatt.html`. Beispiel mit öffentlichem Leser:
`Dokumente aus der Werkstatt/dokument.html?id=brief-aus-dem-archiv`.

## Bedienung

- Papier: zwei erzeugte Texturgrundlagen, sechs Farben, Alterung, reproduzierbare Varianten,
  glatte, gerissene, Bütten- und Brandkanten. Hintergrunddownload als PNG mit 2048 × 3072 Pixeln.
- Schrift: acht lokale Aleria-Schriften sowie Import von WOFF2, WOFF, TTF und OTF bis 1,4 MB.
  Eigene Schriftdateien werden mit dem Dokument gesichert und in HTML-Exporte eingebettet.
- Übersetzen: zeigt den unveränderten Ausgangstext in lesbarer Schrift. Für Texte mit privaten
  Unicode-Zeichen oder tatsächlicher Fremdsprache gibt es eine optionale manuelle Lesefassung.
  Es findet keine automatische Sprachübersetzung statt.
- Steckbrief / Plakat: eigener Titel, optionale Skizze oben rechts, Text, Unterschrift und
  Wachssiegel beziehungsweise freier Siegelplatz. Keine feste Überschrift und kein dunkler Banner.
- Sammlung: IndexedDB speichert mehrere Dokumente einschließlich lokaler Bild- und Schriftdateien.
  Speichern, duplizieren, vormerken und zurückstellen sind lokale Aktionen. Ein Upload umfasst
  bis zu 24 vorgemerkte Dokumente und höchstens 4 MB. JSON bleibt als zusätzliche Sicherung verfügbar.
- PNG: 1× bis 4×, transparente Ränder, vollständige Dokumenthöhe; Bücher als einzelne gesetzte
  Seiten oder als ZIP mit allen Seiten einschließlich Einband. 40 Megapixel / 16.384 Pixel Kantenlänge
  begrenzen den Arbeitsspeicherbedarf. Externe Bilder benötigen CORS für den Export; alternativ
  eine lokale PNG-, JPEG- oder WebP-Datei einfügen.

## Verantwortung der Module

- `js/werkstatt.js`: bestehender Editor, Seitenbearbeitung und Formularzustand, jetzt als ES-Modul.
- `js/document-schema.js`: gemeinsame, DOM-unabhängige Normalisierung und Publikationsgrenzen.
- `js/document-content.js`: HTML-Bereinigung und Lesefassung; alle Ausgaben bereinigen importierten Text.
- `js/document-renderer.js`: gemeinsame Darstellung einzelner Dokumente und Plakate.
- `js/paper/`: reproduzierbare Papierrezepte und Alpha-Komposition. Gespeichert wird das Rezept,
  nicht eine große Kopie des generierten Hintergrunds.
- `js/fonts/`: lokaler Schriftkatalog, Schriftdateien und Schrift-Lebenszyklus.
- `js/library/`: getrennte IndexedDB-, Registry-, Publikations- und UI-Verantwortlichkeiten.
- `js/export/`: Bildvorbereitung, PNG, selbstständiges HTML und ZIP ohne zusätzliche Laufzeitbibliothek.
- `js/book/`: Adapter an den Bestiarium-Buchleser, keine eigene Blätter-Engine.
- `css/document.css`: gemeinsame Dokumentgestaltung. `css/workshop-studio.css`: ausschließlich Editoroberfläche.

## Gemeinsamer Bestiarium-Buchcode

Die Werkstatt importiert `renderBookReader`, `mountBookReader` und `paginateBook` direkt aus
`Bestiarium/modules/book-reader/`. Damit werden dieselbe DOM-Vorlage, Seitenmessung,
StPageFlip-Animation, Eckengesten, Tastatursteuerung, Artikelansicht, mobile Darstellung,
Reduced-Motion-Regeln und Aufräumlogik verwendet. Der bisherige Werkstatt-Buchrenderer entfällt.

Die Bestiarium-Vorlage wurde dafür ohne Änderung ihrer Standardausgabe in eine wiederverwendbare
Funktion extrahiert. `mountBookReader` nimmt optional einen anfänglichen Textanker entgegen,
damit die gerade bearbeitete Aufzeichnung aufgeschlagen wird. Bestehende Bestiarium-Seiten
behalten ihr bisheriges Verhalten.

Für alleinstehende HTML-Downloads wird derselbe Quellcode lokal gebündelt. Die Bundle-Datei
enthält auch die bestehende MIT-Lizenz von StPageFlip; das Original bleibt unter Bestiarium gepflegt.
Nach Änderungen am Buchleser:

```powershell
node AleriaAlmanach/DokumentenWerkstatt/scripts/build-book-runtime.mjs
node AleriaAlmanach/DokumentenWerkstatt/scripts/build-book-runtime.mjs --check
```

## GitHub und Deployment

`netlify/functions/document-publisher.mjs` verwendet wie der Karten-Publisher:

- `ALERIA_GITHUB_TOKEN`: serverseitiger GitHub-Token mit Schreibrecht für Repository-Inhalte.
- `ALERIA_GITHUB_PUBLISH_KEY`: Veröffentlichungsschlüssel, den die Oberfläche pro Upload abfragt.
- `ALERIA_GITHUB_REPOSITORY`: standardmäßig `VVhiteVVolf/Aleria`.
- `ALERIA_GITHUB_BRANCH`: standardmäßig `master`.

Transport und Konfiguration liegen gemeinsam mit den Karten in
`netlify/functions/shared/github-publishing.mjs`. Der Browser erhält keinen GitHub-Token;
der Veröffentlichungsschlüssel wird nicht in LocalStorage oder IndexedDB abgelegt.

Ein Upload liest einen festen Branch-Stand, prüft sämtliche erwarteten Revisionen und erstellt
Dokument-JSON, Bilddateien und Registry gemeinsam in einem Git-Commit. Das Branch-Update verwendet
`force: false`. Ein Konflikt lässt den gesamten lokalen Upload vorgemerkt. Ein neuer Leserlink
funktioniert, sobald Netlify den Commit ausgeliefert hat. „Laden“ kann schon vorher die jüngste
GitHub-Fassung über die Function abrufen; auf rein statischen Hosts verwendet es die ausgelieferte JSON-Datei.

Veröffentlichte Dateien:

```text
Dokumente aus der Werkstatt/
  registry.json
  dokument.html
  data/<id>.json
  assets/<id>/<bild>-r<revision>.png
```

Eigene Schriftdateien verbleiben im Dokument-JSON, damit Import und Einzeldatei-Export sie
mitnehmen. Sie werden mit dem Dokument öffentlich. GitHub-Dateien über dem Inline-Limit
der Contents API werden über ihre unveränderliche Blob-SHA gelesen. Vorhandene ältere,
einzeln exportierte HTML-Dokumente behalten ihre bisherigen Adressen.

## Prüfung

```powershell
node --test --experimental-test-isolation=none AleriaAlmanach/DokumentenWerkstatt/tests/document-publisher.test.mjs Bestiarium/tests/book-reader.test.mjs
```

Die Browserabnahme benötigt einen lokalen Server im Repository-Stamm (Standard: Port 4187)
und ein **eigenes Testprofil** eines Chromium-Browsers mit Debugging-Port 9337. Die Tests
setzen Formularwerte und schreiben ausschließlich Testdaten in dessen lokalen Browserspeicher.
`WORKSHOP_BASE_URL` und `WORKSHOP_BROWSER_PORT` überschreiben die Standardwerte.
Ausgaben liegen unter `.codex-temp/document-workshop/`.

```powershell
node AleriaAlmanach/DokumentenWerkstatt/tests/document-workshop.browser.mjs
node AleriaAlmanach/DokumentenWerkstatt/tests/publication.browser.mjs
node AleriaAlmanach/DokumentenWerkstatt/tests/books-and-posters.browser.mjs
```

Der Publikationstest simuliert die Netlify-Antworten im Browser; er veröffentlicht nichts.

Zusätzlich geprüft: Browseransicht bei 1580 und 390 Pixeln, alle acht Projektfonts,
Import und Wiederladen einer eigenen Schrift, lesbare Fassung, dauerhafte Sammlung,
simulierter Konflikt/Upload ohne externe Schreibzugriffe, transparentes PNG mit 2460 × 2340 Pixeln,
Buchsteuerung und mobile Ansicht, Reduced Motion, eigenständiges HTML-Buch, ZIP-Prüfsummen,
Plakat mit Skizze und Siegelplatz sowie das bestehende Bestiarium-Buch.

Technische Referenzen: [GitHub-Branch-Update](https://docs.github.com/en/rest/git/refs#update-a-reference),
[html2canvas-Konfiguration](https://html2canvas.hertzen.com/configuration).

Bildherkunft und vollständige Erzeugungsprompts: `assets/parchments/README.md`.
