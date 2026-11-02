# Avatar-Sets: Design, Reihenfolge und Performance

Geprüft am 2. November 2026. Lokale Implementierung, keine Veröffentlichung und keine Änderungen an Live-Daten.

## Umsetzung

- Eigenes Stylesheet für die Bildbibliothek; getrennte Karten für Hauptportrait und Avatare, kompakter aufklappbarer Mehrfachimport und größere Bedienelemente.
- Reihenfolge des bestehenden `imageSets`-Arrays bleibt beim Normalisieren, Speichern und Laden erhalten. Standard ist ebenfalls verschiebbar; Legacy-Felder und Rückfallauswahl richten sich ausdrücklich nach seiner ID.
- Ziehen mit Einfügemarkierung, Pfeilbuttons, Tastaturnavigation und Sortieren mit Alt + Pfeiltaste. Änderungen nutzen das bestehende Medien-Autosave, ohne die geöffneten Vorschauen neu zu laden.
- Avatar-Raster enthält belegte Slots plus eine Ergänzungskachel. Leeres Set: eine statt 80 Kacheln, entsprechend 98,75 % weniger Kacheln. Vorhandene Bilder und Beschriftungsfelder werden weiterverwendet; keine Aussage über eine entsprechend hohe gesamte Laufzeitverbesserung.
- Gemeinsames Browsermodell und generierte Serverkopie stimmen überein. Keine zusätzlichen Speicherfelder, Rules-Anpassungen oder Datenmigrationen erforderlich.

## Automatisierte Prüfungen

115 Tests bestanden, keine Fehler oder übersprungenen Tests. Vollständiger Beleg: `tests.tap`.

Geprüfte Dateien: character-image-sets, character-image-set-sorting, character-media-editor, comment-segment-image-sets, character-avatar-import, character-image-library-autosave, creature-images, character-save-guard, character-section-integration, character-export-sources, character-performance, comment-form-performance, creature-system und character-database-overlays.

Abgedeckt sind unter anderem Set-Reihenfolge, Grenzen und Standard-Fallback, Drag-Einfügepositionen, Tastaturbedienung, fehlende und unveränderte Verschiebeziele, Schutz ungespeicherter Medien, Wiederverwendung bestehender Vorschauen, sparse Slotindizes, leere und volle Galerien, Kreaturen-Import/Export, getrennte Avatar-/Inventar-/Kampffelder sowie geordnete Autosave-Anfragen.

## Browserprüfung

`build-preview.mjs` extrahiert die tatsächliche Bilder-Registerkarte aus dem Almanach und lädt dessen Styles und Funktionsmodule. Nur die Online-Speichergrenze wird durch einen lokalen Testspeicher ersetzt. Die Beitragsvorschau verwendet den tatsächlichen Set-Picker aus `comments-segment-base.js`.

- Desktoplayout bei 1536 CSS-Pixeln geprüft, Screenshot `desktop.png`.
- Schmale Ansicht mit 312 CSS-Pixeln geprüft: keine horizontal überlaufenden Elemente, zwei Galerie-Spalten. Screenshot `mobile.png`.
- Anlegen eines leeren Sets per Enter: eine Ergänzungskachel, keine Bildanfragen für leere Slots.
- Linkimport eines lokalen Bildes, Verschieben per Pfeilbutton und Alt + Pfeiltaste sowie erneutes Laden des gespeicherten Teststands erfolgreich.
- Die Beitragsvorschau übernimmt dieselbe neue Reihenfolge; die gewählte Standard-ID bleibt dabei erhalten.
- Keine Fehler aus den Anwendungsmodulen beobachtet. Die Browserkonsole enthielt davon unabhängige Ladefehler einer Chrome-Erweiterung.

Die Browserprüfung verwendet Testdaten und bestätigt keine schreibende Verbindung zu Firestore. Eine vollständige Produktionsveröffentlichung wurde nicht ausgeführt.
