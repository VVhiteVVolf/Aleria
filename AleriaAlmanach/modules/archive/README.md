# Archivkarten und Bereichsnavigation

Die Archivansicht verwendet weiterhin die Modulablage, Suchlogik, Pfade und
delegierten Aktionen des bestehenden Almanachs. Es gibt keine zweite Kopie der
Inhalte und keine zusätzlichen Backend-Schreibzugriffe.

## Zuständigkeiten

- `archive-entry-card.js` und `.css`: gemeinsame Vorschau für Bereichsseiten und
  Suchergebnisse. Titel stehen unter dem Bild; Seitenzahl und tatsächlich verfügbare
  Kommentarmöglichkeiten bilden eine kompakte Fußzeile. Gildenwappen werden über
  `archive-card-meta.js` priorisiert und vollständig dargestellt.
- `archive-hierarchy-browser.js` und `archive-hierarchy.css`: Baummodell,
  Verzeichnis, Pfadnavigation und kompakter Bereichskopf. Ordnernamen wählen Inhalte,
  Pfeile klappen den Baum auf oder zu. Übergeordnete Bereiche enthalten ihre
  untergeordneten Module; die bestehende Begrenzung auf zunächst 24 Karten bleibt.
- `archive-navigation.js` und `.css`: Reiter, Scrollpfeile, Bereichsauswahl und
  Werkzeugleiste. Die Bereichsauswahl verwendet dieselben Pergamenticons wie die
  Weltpfade. Beim erneuten Einhängen werden vorherige Listener und der
  `ResizeObserver` aufgeräumt; Escape und Bereichswechsel erhalten den Tastaturfokus.
- `archive-view.js`: verbindet diese Ansichten mit bestehender Suche, Auswahl,
  Modulöffnung und Verwaltung. Die Zuordnung einer Karte zu ihrem Quellbereich
  verwendet das Eintragsobjekt, damit gleich benannte Platzhalter in verschiedenen
  Bereichen ihre richtige Kategorie behalten.
- `archive-shell.css`: gemeinsame Seitenhülle und Suche. `../dashboard/dashboard.css`
  bleibt für die Startseite zuständig. Alte Karten- und Navigationsüberschreibungen
  aus `../../styles/mobile.css` sind entfernt; mobile Regeln gehören zum jeweiligen
  Archivbestandteil.

Bis 1100 Pixel wird das Verzeichnis zu „Bereich wechseln“. Die Pfadnavigation und
die Karten bleiben sichtbar. Das Kartengitter richtet seine Spalten nach der
verfügbaren Breite aus und benötigt keine separate starre Zweispaltenregel für
Telefone.

## Prüfung

`tests/archive-preview-navigation.test.mjs` prüft Coverpriorität, Metadaten,
übergeordnete Inhalte, Pfadnavigation und das Einklappen ausgewählter Ordner.
Die vorhandenen Register-, Dashboard-, Zeitungsgilden- und Vorlagentests prüfen
die Integration. Lokale Browserprüfungen decken sieben Breiten von 320 bis 1920
Pixel, Bereichsauswahl, Scrollpfeile, Ordnerwechsel, Tastaturfokus, Suche sowie
Modulöffnung und Bearbeitung ab; Firebase-Schreibzugriffe bleiben dabei blockiert.
