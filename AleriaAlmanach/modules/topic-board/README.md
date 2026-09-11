# Themenwand

Die Seitenleiste öffnet zunächst die Übersicht. Ein neuer Vorschlag oder „Bearbeiten“
öffnet den Editor; Inhalt, Personen, Termin, Reise, Gestaltung und Vorschau sind
getrennte Reiter. Der sichtbare Abschlussbutton heißt „Eintragen“ bzw. „Speichern“.

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

`topic-board-participant-selection.mjs` enthält ausschließlich Auswahl und Suche.
`topic-board-participants.mjs` besitzt DOM, Listener und Lebensdauer des Pickers;
der Editor lädt ihn bei Bedarf und übernimmt nur die fertige Auswahl. Bis zur
erfolgreichen Initialisierung ist Speichern gesperrt. Die Styles liegen in
`styles/topic-board-participants.css`. Firebase und Archiv werden dort nicht direkt
angesprochen. Die bestehende Termin-, Reise- und Speicherschicht bleibt zuständig.

## Prüfung

Im Almanach-Verzeichnis: `node --test tests/topic-board-*.test.mjs`.

Für den Browsertest die Projektwurzel lokal bereitstellen (Standardport 4187)
und `node tests/topic-board.browser.mjs` ausführen. Der Test benötigt Playwright;
`PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXECUTABLE`, `TOPIC_BOARD_TEST_ORIGIN` und
`TOPIC_BOARD_SCREENSHOTS` sind optional konfigurierbar. Er verwendet die echte
Almanach-Seite mit lokalen Testdaten und gesperrten externen Netzwerkanfragen.
Es werden keine produktiven Vorschläge geschrieben.
