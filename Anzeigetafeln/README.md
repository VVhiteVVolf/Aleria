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
assets/js/data/authored-notices.js
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

Die 16 Vorlagen liegen in `assets/js/notes/zettel-config.js`: Auftrag, Steckbrief,
Zeitung, Vermisst, Ankündigung, Notiz, Handel, Erlass, Einladung, Gefahrenwarnung,
Reise & Geleit, Gildenaufruf, Fundanzeige, kleines Hilfsgesuch, Turnier und Versteigerung. Neue Vorlagen nutzen dieselben
Medien-, Tabellen-, Kommentar- und Speicherfunktionen wie vorhandene Aushänge.
Hervorgehobene Angaben wie Preis oder Reiseziel werden ausschließlich bei der
Anzeige angeordnet; freie Tabellenzeilen bleiben erhalten.

CSS-Verantwortlichkeiten: `notice-documents.css` für die Dokumente,
`notice-templates.css` für die Vorlagenauswahl, `notice-register.css` für das
Verzeichnis und `notice-theme.css` für Tafelrahmen, Editor und Antworten.
Formatierung aus dem Texteditor ist auf die eigentlichen Textbereiche begrenzt.

Unter **Handschrift & Sprache** lassen sich sieben lokale Handschriften von
klarer Alltagsschrift bis zu schwer lesbaren Schnörkeln auswählen. Die
Überschrift darf eine andere Schrift als der Text tragen. Eine Schriftprobe
und die bestehende Live-Vorschau zeigen die Auswahl. Außerdem stehen alle zwölf
vorhandenen Sprachschriften zur Verfügung. **Übersetzen** beziehungsweise
**Lesbar anzeigen** wechselt zur hinterlegten lesbaren Fassung; **Originalschrift**
wechselt zurück. Der Wortlaut wird dabei nicht überschrieben. Jede Anzeige im
Stapel behält ihre eigene Schriftwahl.

Lange Texte erhalten einen eigenen scrollbar begrenzten Lesebereich passend zu
den Infodaten. Im Editor unter **Aushänge & Beiblätter an diesem Nagel** lassen
sich Beiblätter desselben Gesuchs oder eigenständige Gesuche hinzufügen.
**Als einen Aushang zusammenfassen** verbindet vorhandene Blätter inhaltlich;
**als eigenen Aushang erklären** löst diese Zuordnung, ohne den Nagel zu wechseln.
Ein kompletter Aushang lässt sich mit seinen Beiblättern an einen anderen Nagel
heften. Register und Nagelvorschau zeigen jedes Gesuch einmal. Im Leser werden
getrennte Gesuche über ihre Titel gewählt und deren Beiblätter separat
durchgeblättert. Kommentare und Schriften bleiben je Blatt erhalten. Die Nägel
tragen keine Zahlenkästchen.

Unter **Geld & Gegenstände als Belohnung** stehen Münzen und die Auswahl aus dem
Güterregister bereit. Ein Geldbetrag zeigt sein Münzicon; Gegenstände oder
mehrere Belohnungen öffnen eine kleine Übersicht mit Mengen und Beschreibungen.
Eine optionale Bedingung erläutert beispielsweise eine nur bei Bedarf angebotene
Geldzugabe. Die Zusage bleibt sichtbar, ohne eine Auszahlung auszulösen.
Den lesenden Güterkatalog aktualisiert
`node Anzeigetafeln/tools/build-notice-reward-catalog.mjs` (`--check` zum Prüfen).

## Speichern und Prüfen

Änderungen werden während der Bearbeitung automatisch als lokaler Entwurf im Browser gesichert. Erst `Auf GitHub veröffentlichen` schreibt den geprüften Stand über die Netlify-Funktion in die Datendatei der jeweiligen Tafel. Ein Revisionsabgleich schützt vor dem Überschreiben neuerer Online-Stände.

Optional kann `storage.authoredNoticesPath` zusätzliche, im Repository gepflegte
Aushänge angeben. Sie ergänzen vorhandene Daten und lokale Entwürfe, ohne
bestehende Aushänge zu überschreiben oder nach einer bewussten Löschung erneut
aufzutauchen. Details stehen in `ARCHITEKTUR.md`.

Gwynthors gepflegtes Paket erzeugt `node Anzeigetafeln/tools/build-gwynthor-quest-notices.mjs`
(`--check` prüft den Stand). Es enthält Herluins Such- und Rückholauftrag mit drei
Personenblättern, Fearnans Gesuch wegen der Kreditschatulle und Maonaids Auftrag
mit Haldors Personenblatt. Celynfor erhält vorerst keine Quest. Vier neue
Pergamentskizzen liegen unter `assets/images/missing-sketches/`, das eigene
Amulettbild unter `assets/images/quests/torvik-seit-lyristag-vermisst/`.

Inweltliche Aushänge verwenden bei förmlicher Anrede **Ihr/Euch** statt des
modernen **Sie/Ihnen**. Herluin schreibt hochakademisch und penibel, mit
unfreiwilligem Humor unter spürbarem Zeitdruck. Seine Personenblätter bleiben
äußere Beschreibungen mit knappen persönlichen Seitenhieben.

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

`tests/notice-stacks.browser.mjs` prüft mit denselben Umgebungsvariablen den
echten vierblättrigen Herluin-Aushang, getrennte Antworten, Stapelbearbeitung,
Güterauswahl und Belohnungsdialoge sowie lange Texte aller 16 Vorlagen auf
Desktop, Tablet und Handy. Auch dieser Test verwendet einen isolierten
Browserkontext und veröffentlicht keine Daten.

`tests/notice-typography.browser.mjs` prüft alle sieben Handschriften und zwölf
Sprachschriften, den reversiblen Lesebutton, separate Titel-/Textschriften,
Speichern/Neuladen, Mobilansicht und den lesbaren Rückfall bei fehlender Fontdatei.

`tests/notice-publications.browser.mjs` prüft die drei echten Gesuche, zwei
getrennte Veröffentlichungen am Vermisst-Nagel, zusammengefasste Registertreffer,
direkte Suchsprünge auf Beiblätter, die vier Pergamentskizzen, Maonaids Amulett,
bedingte Kupferzugabe sowie Gruppieren, Trennen, Umheften und Neuladen auf Desktop,
Tablet und Handy. Die Bilder wurden mit dem integrierten Bildgenerator erzeugt;
Prompts und Referenzen stehen in `assets/images/missing-sketches/generation.json`
und `assets/images/quests/torvik-seit-lyristag-vermisst/reward-generation.json`.
