# Anzeigetafeln

`Anzeigetafeln` ist ein eigenes Aushangsystem. Es verwendet weder das Kartenmodul noch dessen Orts-Pins, Regionen, Markierungen, Kategorien oder Reiseverwaltung.

Jede Tafel besitzt genau:

- ein Tafelbild
- eine Ebene mit frei platzierbaren Aushängen
- einen lokalen Browserentwurf
- eine ausdrücklich ausgelöste Veröffentlichung in die GitHub-Registry

Stabile Links laufen über die gemeinsame Shell:

```txt
tafel.html?tafel=<tafel-id>
```

Unter einer in Ortsseiten eingebetteten Tafel steht dieselbe kompakte Suche
wie unter den Regionskarten (`Orte/modules/poi-search`). Die Liste ist zunächst
geschlossen und bleibt beim Aufklappen scrollbar. Öffentliche Aushänge lassen
sich nach Titel, Typ, Text, Tabellenangaben, Artikeln und Steckbriefpersonen
finden und in der Tafel öffnen. `assets/js/integrations/orte-notice-bridge.js`
überträgt dafür nur öffentliche Einträge an die eigene übergeordnete Seite;
Änderungen werden über die bestehenden Tafelereignisse übernommen.

## Gemeinsame Module

```txt
tafel.html
tafeln.registry.js
assets/css/tafel.css
assets/css/notice-board.css
assets/js/tafel-app.js
assets/js/tafel-storage.js
assets/js/core/tafel-state.js
assets/js/core/tafel-actions.js
assets/js/core/tafel-publish-ui.js
assets/js/core/tafel-bootstrap.js
assets/js/board/notice-board.js
assets/js/data/notice-data-manager.js
assets/js/editor/notice-editor.js
assets/js/notes/
```

Neue Tafeln erhalten keine kopierte HTML-Datei. Sie werden über einen Registry-Eintrag, eine kleine Konfiguration und eine eigene versionierte Datendatei angelegt. Der genaue Ablauf steht in `NEUE-TAFEL.md`.

## Gestaltung und Vorlagen

Die Tafel hat ein aufklappbares Aushangverzeichnis mit Volltextsuche und Typfilter.
Es verändert weder die Positionen auf dem Brett noch gespeicherte Aushänge.
`assets/js/board/notice-register.js` verwaltet nur den lokalen Ansichtsstand;
`assets/js/notes/notice-search.js` liefert auch der Ortseinbettung die gemeinsamen
Suchfelder. Geheime Einträge erscheinen ausschließlich im Editormodus.

Die 13 Vorlagen liegen in `assets/js/notes/zettel-config.js`: Auftrag, Steckbrief,
Zeitung, Vermisst, Ankündigung, Notiz, Handel, Erlass, Einladung, Gefahrenwarnung,
Reise & Geleit, Gildenaufruf und Fundanzeige. Neue Vorlagen nutzen dieselben
Medien-, Tabellen-, Kommentar- und Speicherfunktionen wie vorhandene Aushänge.
Hervorgehobene Angaben wie Preis oder Reiseziel werden ausschließlich bei der
Anzeige angeordnet; freie Tabellenzeilen bleiben erhalten.

CSS-Verantwortlichkeiten: `notice-documents.css` für die Dokumente,
`notice-templates.css` für die Vorlagenauswahl, `notice-register.css` für das
Verzeichnis und `notice-theme.css` für Tafelrahmen, Editor und Antworten.
Formatierung aus dem Texteditor ist auf die eigentlichen Textbereiche begrenzt.

## Speichern und Prüfen

Änderungen werden während der Bearbeitung automatisch als lokaler Entwurf im Browser gesichert. Erst `Auf GitHub veröffentlichen` schreibt den geprüften Stand über die Netlify-Funktion in die Datendatei der jeweiligen Tafel. Ein Revisionsabgleich schützt vor dem Überschreiben neuerer Online-Stände.

## Struktur prüfen

```bash
node Anzeigetafeln/tools/validate-tafeln-structure.mjs
node --test Anzeigetafeln/tests/*.test.mjs Orte/tests/poi-bridges.test.mjs
```

`tests/notice-board.browser.mjs` prüft alle Vorlagen auf Desktop und Mobilgerät,
Suche, Filter, Kommentare, Mehrfachsteckbriefe, Editor und Entwurfswiederherstellung
mit isolierten Beispieldaten. Dafür die Projektwurzel lokal ausliefern und
`NOTICE_TEST_ORIGIN` setzen (Standard: `http://127.0.0.1:4197`). Playwright kann
über `PLAYWRIGHT_MODULE` und `PLAYWRIGHT_EXECUTABLE` vorgegeben werden;
`NOTICE_SCREENSHOTS` aktiviert Bildschirmaufnahmen. Der Test veröffentlicht nichts.
