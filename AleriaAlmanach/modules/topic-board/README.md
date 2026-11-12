# Themenwand

Die Themenwand ist der gemeinsame Spielplan für kommende Plays. Die rot-goldene
Übersicht trennt offene Plays und das Archiv. Offene Plays starten nach
Spielwelttermin geordnet: „Jetzt relevant“ umfasst heutige, laufende und noch
offene frühere Termine; danach folgen zukünftige Plays und Ideen ohne Termin.
Die Fokusauswahl, Suche nach Play/Ort/Figur, Themenart und alternative Sortierungen
lassen sich kombinieren. Zurücksetzen entfernt alle Filter. Das Archiv startet
mit dem zuletzt als gespielt markierten Play; seine Termine und Stimmen sind
historische Angaben. Wiederöffnen führt den Play zurück in die Planung.

Die Seitenleiste öffnet zunächst die Übersicht. Ein neuer Vorschlag oder „Bearbeiten“
öffnet den Editor; Inhalt, Personen, Termin, Reise, Gestaltung und Vorschau sind
getrennte Reiter. Der sichtbare Abschlussbutton heißt „Eintragen“ bzw. „Speichern“.
Während der Bearbeitung ist die Übersicht inert; Escape schließt zuerst den
Editor. Abbrechen kehrt zur bearbeiteten Karte beziehungsweise zum Neuanlagebutton
zurück. Porträts zeigen bei fehlenden oder nicht ladbaren Bildern eine Initiale;
aufgeklappte Plays nennen die gesamte Besetzung.

## Ideen ohne Termin

Im Terminreiter lässt „Termin später festlegen“ das Datum ausdrücklich offen.
Solche Plays bleiben auch beim erneuten Bearbeiten undatiert, bis ein Termin
gewählt wird. Die Schnellwahl „Heute“, „Morgen“ usw. aktiviert das Datum wieder.
Eine neue Planung schlägt zunächst den aktuellen Aleria-Tag vor. Bestehende
Reisedaten und die Reisedauer bleiben auch ohne Abfahrtsdatum erhalten.
Es gibt dafür keine neue persistierte Kennzeichnung: das vorhandene leere
`schedule.startDate` genügt. Bestehende Datensätze benötigen keine Migration.

## Personenauswahl

- Mehrere Namen lassen sich mit Komma, Semikolon oder Zeilenumbruch suchen.
  Einzelne Wörter innerhalb eines Namens müssen gemeinsam passen. Akzente und
  Großschreibung werden bei der Suche ignoriert; Titel werden mit durchsucht.
- Ausgewählte Personen bleiben über wechselnde Suchen hinweg in der Auswahlleiste.
- „Treffer hinzufügen“ ergänzt die gesamte Trefferliste, ohne Duplikate anzulegen.
- „Nur Auswahl“, einzelne Entfernen-Buttons, „Auswahl leeren“ und „Rückgängig“
  erleichtern die Korrektur. Maximal 18 Personen; ausgelassene Treffer werden gemeldet.
- Die Besetzung eines bestehenden Themas kann ergänzend übernommen werden.
- Gespeicherte Personen bleiben erhalten, wenn ihr Archiveintrag nicht mehr verfügbar ist.
- Enter in der Personensuche wählt einen einzelnen Treffer oder fokussiert die
  Sammelaktion; die Eingabe veröffentlicht niemals versehentlich das Formular.

Die Reiter sind mit Pfeiltasten, Pos1 und Ende bedienbar. Strg/⌘ + Enter speichert
außerhalb der Personenauswahl; Escape schließt zunächst den Editor, dann die Wand.
Abbrechen verwirft ungespeicherte Eingaben wie bisher.

## Verantwortung

`topic-board-planning.js` besitzt ausschließlich Ableitungen aus Vorschlägen und
einem übergebenen Weltdatum: Zahlen, Planungsfokus und chronologische Reihenfolge.
`topic-board-list-state.js` kapselt die flüchtigen Filter und die offene Karte.
`topic-board-overview.js` besitzt die Übersicht, ihre Navigationszustände und
die gruppierte Darstellung; ohne gültiges Weltdatum bleiben alle Karten sichtbar.
`topic-board-ui.js` verbindet Karten und Editor mit den bestehenden Termin-,
Reise- und Speicheradaptern. Der Store und die Firebase-Anbindung bleiben die
einzigen Schreibwege; die Übersicht schreibt keine Spieldaten.

`topic-board-participant-selection.mjs` enthält ausschließlich Auswahl und Suche.
`topic-board-participants.mjs` besitzt DOM, Listener und Lebensdauer des Pickers;
der Editor lädt ihn bei Bedarf und übernimmt nur die fertige Auswahl. Bis zur
erfolgreichen Initialisierung ist Speichern gesperrt. Die Styles liegen in
`styles/topic-board-participants.css`. Firebase und Archiv werden dort nicht direkt
angesprochen. Die bestehende Termin-, Reise- und Speicherschicht bleibt zuständig.

Die lokale Farbpalette `--board-*` und das Übersichtslayout liegen in
`styles/topic-board.css`. Karten und ihre lesenden Termin-/Reiseansichten gehören
zu `styles/topic-board-cards.css`, der Editor zu `styles/topic-board-editor.css`.
Die Personenauswahl bleibt in `styles/topic-board-participants.css` und verwendet
dieselbe Palette. Die Styles verändern keine fremden Dialoge.

## Prüfung

Im Almanach-Verzeichnis:
`node --test --experimental-test-isolation=none tests/topic-board-*.test.mjs`.

Für den Browsertest die Projektwurzel lokal bereitstellen (Standardport 4187)
und `node tests/topic-board.browser.mjs` ausführen. Der Test benötigt Playwright;
`PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXECUTABLE`, `TOPIC_BOARD_TEST_ORIGIN` und
`TOPIC_BOARD_SCREENSHOTS` sind optional konfigurierbar. Er verwendet die echte
Almanach-Seite mit lokalen Testdaten und gesperrten externen Netzwerkanfragen.
Es werden keine produktiven Vorschläge geschrieben.

Der Browserlauf prüft außerdem Suche/Fokuserhalt, alle Terminfilter, Sortierungen,
Details, Abstimmung, Archiv/Wiederöffnen, undatierte Neuanlagen und vier Breiten.
`TOPIC_BOARD_REPORT` speichert den Ergebnisbericht. Die isolierten Nachweise zur
Überarbeitung vom 8. November liegen in
`diagnostics/topic-board-redesign-20261108/`; dort startet `run-browser.mjs` einen
eigenen Loopbackserver und beendet ihn nach dem Lauf.
