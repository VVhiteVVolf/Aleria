# Gemeinsames Modullayout

Stand: 2026-09-09

Alle 30 registrierten Vorlagen verwenden die gemeinsame Papier- und Schriftpalette. Ihre charakteristischen Karten, Dossiers, Tabellen und Diagramme bleiben erhalten. Kapitelreiter stehen weiterhin sichtbar unter der Hauptnavigation; zusätzliche Aktionen liegen im Menü `…`.

## Zuständigkeiten

- `modules/modal/modal-navigation.{js,css}`: Navigation und Aktionsmenü für Leseransicht und Inline-Bearbeitung. Bereits behandelte Tastaturereignisse eines Templates werden vom Modal nicht erneut verarbeitet.
- `modules/modal/modal-surface.css`: gemeinsame Farben, Linien, Schatten, Schrift- und Formularoberflächen. Statusfarben und fachliche Diagrammfarben bleiben beim jeweiligen Feature.
- `modules/module-editor/module-preview.css`: Rahmen und Container für Inline-, Voll- und eingebettete Vorschauen. Diese Regeln gehören nicht mehr zum Artefakt-/Rezept-Stylesheet.
- `styles/module-page-*.css`, `styles/session*.css` und `styles/scene-blocks.css`: Darstellung und responsive Regeln des jeweiligen Templates.
- `styles/archive.css`: ausschließlich Archivoberfläche. Der Archivkopf verwendet `.almanach-header`, der Hauptbereich `#main-content`; keine globalen `header`-/`main`-Selektoren für diese Gestaltung.

`module-shell` misst die äußere Modulbreite für die Navigation. `module-content` misst den verfügbaren Platz einer Seite, Vorschau oder Bearbeitungsspalte. Inhaltslayouts verwenden benannte Container-Abfragen, damit eine schmale Vorschau auf einem großen Bildschirm ebenso umbricht wie eine schmale Leseransicht. Regeln für bildschirmfüllende Overlays bleiben an die Fensterbreite gebunden.

Die Vorschau rendert in der verfügbaren Breite und Höhe, unter Berücksichtigung der gewählten Modulgröße. Lange Inhalte scrollen innerhalb der Seite und verkleinern nicht mehr den gesamten Text. Schmale Dossiers verwenden natürlichen vertikalen Inhaltsfluss; Turnierbäume und andere breite Diagramme behalten ihre eigenen Scroll- bzw. Verschiebebereiche.

## Behobene Funktionsfehler

- Sprachzitate und ihre Urheber bleiben beim Einsammeln und Speichern der großen Editorform erhalten; beide Felder sind auch inline bearbeitbar und löschbar.
- Pfeiltasten zum Wechsel der Alphabetebene wechseln nicht gleichzeitig die Modulseite.
- Überlappungen und abgeschnittene Inhalte in schmalen Biografie-, Bestiarium-, Quest-, Artefakt-, Rezept-, Kasten- und Kopfgeldansichten sind korrigiert.
- Turnierfußzeilen und Session-Bedienelemente brechen bei wenig Platz um.

## Überprüfung

`npm run check:templates` prüft die aktiven Almanach-Assets, 30 Registry-Verträge, 87 Laufzeitabhängigkeiten sowie JSON-Roundtrips, Typmarker und Referenzintegrität für 33 Defaultseiten. Die Skripte laufen im ESM-Projekt; die Prüfung eines inzwischen entfernten Orte-Loaders wurde durch Prüfungen des aktiven Almanach-Einstiegs ersetzt.

Gezielte Regressionstests:

```sh
node tests/modal-navigation.test.mjs
node tests/standard-page-comments.test.mjs
node tests/language-module-editor.test.mjs
node tests/module-preview.test.mjs
```

Lokaler Edge-Durchlauf: 186 Ansichten bei 1440 und 390 Pixeln Fensterbreite. Alle Defaultseiten wurden lesend geprüft; für jede Vorlage zusätzlich die erste Seite in Inline- und Vollvorschau sowie der Datenrücklauf der vollständigen Editorform. Keine JavaScript-Fehler, fehlenden lokalen Ressourcen, erkannten unbeabsichtigten horizontalen Überläufe oder verlorenen bestehenden Defaultwerte. Bildvergleiche ergänzten die Geometrieprüfung.

Geprüfte Registry-IDs: `story`, `profiles`, `wanted`, `character-inventory`, `guest-register`, `bounty-file`, `goods`, `trade-catalog`, `map-template`, `language`, `name-list`, `script-table`, `landing`, `artifact`, `recipe`, `scene`, `session`, `hierarchy`, `family-tree`, `family`, `object-profile`, `bestiary`, `quest-file`, `tournament`, `tournament-league`, `caste`, `court`, `house-warriors`, `houses`, `guild`.

Zusätzlicher Bedienungstest mit dem bestehenden Drachentanz-Modul bei 1440, 900, 640, 390 und 320 Pixeln: sichtbare Kapitel, Zurück/Weiter, Aktionsmenü, Fokusmodus, flächiges Titelbild, Textbreite, Kommentarformular, Export, Live-Vorschau, Spaltenteiler, Seiten hinzufügen/verschieben/löschen, Abbrechen und lokales Speichern. Session-Fokus, kompakte Modulabmessungen und Alphabetwechsel per Tastatur wurden ebenfalls geprüft.

Die Browserprüfungen liefen in isolierten lokalen Sitzungen. Firebase-Synchronisation und externe Bild-/Kartenanbieter waren nicht Teil dieses Durchlaufs; Online-Daten wurden nicht verändert. Die Ergebnisse beziehen sich auf die genannten Vorlagen und Testdaten, nicht auf sämtliche möglichen benutzerdefinierten Inhalte.
