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
- `archive-hierarchy-controller.js`: besitzt den an die aktuelle Verzeichnisansicht
  gebundenen Datenstand in einer `WeakMap`. Aufklappen ersetzt nur den Baum;
  Ordnerauswahl ersetzt Baum und zugehörigen Inhaltsbereich. Dashboard, Suche,
  Charakter- und Kreaturenregister werden dabei nicht neu erzeugt. Eine
  `almanach:modules-changed`-Meldung verwirft den Datenstand; der nächste Wechsel
  erhält über den vollständigen Renderpfad frische Daten.
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

Seit 19. Oktober 2026 erhalten Theme-Helfer während eines Renderdurchgangs die
bereits gelesenen Abschnitte. Sie lesen nicht für jeden Reiter und jede Karte
erneut die komplette Modulablage. `renderArchiveSectionCards` ist die gemeinsame,
auf ein übergebenes Gitter begrenzte Kartendarstellung für Vollansicht und
Ordnerwechsel. Ohne Suchbegriff wird kein Volltext jeder Seite aufgebaut.

Die Desktopspalte des Inhaltsverzeichnisses hat mindestens 17,5 rem; Einzüge
sind kleiner und Ortsnamen brechen an Wortgrenzen. Auf Mobilgeräten bleibt das
Verzeichnis aufklappbar. Die geografische Einordnung und ihre Bestandsmigration
gehören `../gwynthor-geography/`, nicht zum Navigationscontroller.

Lokaler Vergleich mit demselben öffentlichen Bestands-Schnappschuss: sechs
Auf-/Zuklappvorgänge zuvor jeweils ungefähr 1.548–1.601 ms, anschließend rund
3–8 ms; Ordnerauswahl rund 9–18 ms. Dies sind synchrone Browser-Verarbeitungszeiten
auf demselben Rechner, keine allgemeine Ladezeitgarantie. Beim Aufklappen bleiben
die Kartenobjekte erhalten; der Modulspeicher wird dabei nicht neu aufgebaut.

## Prüfung

`tests/archive-preview-navigation.test.mjs` prüft Coverpriorität, Metadaten,
übergeordnete Inhalte, Pfadnavigation und das Einklappen ausgewählter Ordner.
Die vorhandenen Register-, Dashboard-, Zeitungsgilden- und Vorlagentests prüfen
die Integration. Lokale Browserprüfungen decken sieben Breiten von 320 bis 1920
Pixel, Bereichsauswahl, Scrollpfeile, Ordnerwechsel, Tastaturfokus, Suche sowie
Modulöffnung und Bearbeitung ab; Firebase-Schreibzugriffe bleiben dabei blockiert.

`tests/gwynthor-navigation.browser.mjs` prüft die neue Geografie, unveränderte
Modulkennungen, Icondateien, Inhaltswechsel, Suche, Öffnen eines Moduls sowie die
Invalidierung nach einem Datenwechsel bei 390, 1024, 1101 und 1460 Pixeln. Optional
liest `--store=<Datei>` einen vorhandenen lokalen öffentlichen Quellenstand;
ohne Parameter verwendet der Test die versionierten älteren Ortsquellen.
