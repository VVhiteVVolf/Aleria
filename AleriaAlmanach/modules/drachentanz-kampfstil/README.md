# Drachentanz Kampfstil

## Erweiterung: Klassen

`drachentanz-kampfstil-klassen-data.js` ergänzt **Drachentanz Kampfstil - Klassen** direkt neben dem ersten Teil in **Techniken → Cenyr**. Die Datei wird unmittelbar nach dem ersten Teil geladen und übernimmt dessen Kategorie und Stempel. Sie verändert den ersten Teil nicht und registriert sich anhand der stabilen ID `drachentanz-kampfstil-klassen` nur einmal.

Die sechs vom Nutzer zugewiesenen Illustrationen liegen unverändert unter `public/assets/drachentanz-kampfstil-klassen/`: `cantref.png`, `helwyr.png`, `uchelwyr.png`, `barddwyr.png`, `arthwyr.png` und `derwyn.png` gehören in dieser Reihenfolge zu den Seiten 1–6. Die erste Illustration dient zugleich als Modulcover. `sources.json` dokumentiert Seitenzuordnung, Original-URLs, Abmessungen und SHA-256-Prüfsummen. Die Bildspalten behalten ihre füllende Darstellung mit oberem Bildfokus; der Ausschnitt bleibt im Editor anpassbar.

Die sechs Seiten folgen der Nutzerreihenfolge: **Cantref, Helwyr, Uchelwyr, Barddwyr, Arthwyr, Derwyn**. Sie nutzen die vorhandene Standard-/Story-Vorlage mit Klassenüberschrift, gekürzter Geschichte, Bezug zum Drachentanz sowie Beschreibungen der verbindlich festgelegten Formen. Die Texte bleiben in beiden vorhandenen Editoren bearbeitbar. Seitenkommentare bleiben auf allen sechs Story-Seiten verfügbar; es gibt keine zusätzlichen Kommentarabschlussseiten oder vorgegebenen Zitatgeber.

Das Klassenmodul erzählt ausschließlich aus der Welt heraus: Lehrjahre, freie Erprobung, Unterweisung und Meisterschaft ersetzen Stufenangaben, Freischaltungen und Lernbudgets. Technische Ausbildungsdaten bleiben in den verlinkten Klassenseiten und den Kampfregistern; die redaktionellen Texte verändern diese Regeln nicht.

| Klasse | Eigene Formen |
| --- | --- |
| Cantref | Speerdrache, peitschender Drache, hütender Drache |
| Uchelwyr | Dieselben drei Speerformen in derselben Reihenfolge; zusätzlich stürmender und schweifender Drache |
| Helwyr | Lauernder und jagender Drache; dazu alle sieben Teulu-Pfade |
| Barddwyr | Trällernder und kreischender Drache; dazu der Schwertdrache |
| Arthwyr | Bärenklaue; dazu alle sieben Teulu-Pfade |
| Derwyn | Fließender, brandender, steigender und peitschender Wyrm |

Der Jungdrache bleibt die Grundausbildung; Derwyn können stattdessen die junge Welle wählen. Ihre freie kreative Phase liegt auf Stufe 7–8, die vier Wyrmformen beginnen ab Stufe 9. Die beiden Herkunftskulturen verwenden dieselbe Klasse. Gemeinsame Speerformen werden innerhalb des Moduls aus einem einzigen Beschreibungsblock erzeugt. Attacken, Kosten, Waffenbedingungen und Ausbildungsregeln kommen aus den kanonischen Kampfregistern; jede Modulseite verlinkt unmittelbar auf den zugehörigen Ausbildungsplan. Der Vertragstest `tests/drachentanz-klassen-module.test.mjs` prüft Namen, Reihenfolge und tatsächlich vorhandene Attacken gegen diese Register sowie die erzeugten Klassenseiten.

Quellen der redaktionellen Kurzfassungen sind jeweils `Geschichte` sowie ergänzend `Einführung` und `Fähigkeiten` in:

- `Klassenordner/Cenyr/cantref/klasse.json`
- `Klassenordner/Cenyr/helwyr/klasse.json`
- `Klassenordner/Cenyr/uchelwyr/klasse.json`
- `Klassenordner/Cenyr/barddwyr/klasse.json`
- `Klassenordner/Cenyr/arthwyr/klasse.json`
- `Klassenordner/Vennyr/derwyn/klasse.json`

Die allgemeinen Einleitungen zum Rittertum sind gekürzt; beim Derwyn wird die spezifische avallornische Überlieferung herausgestellt. Seine Quelldatei liegt unter Vennyr, führt die Klasse aber ausdrücklich gemeinsam für **Cenyr und Vennyr**. Die Unterscheidung zwischen Kleriker und zusätzlich ausgebildetem Ritter bleibt erhalten. Die bereits in der Arthwyr-Quelle benannte Bärenklaue ist als einzige eigene Form übernommen. Die Klassenseiten sind von jeder neuen Modulseite aus verlinkt; die Quellen werden nicht zur Laufzeit nachgeladen.

Geprüft wurden die unveränderte Registrierung des ersten Teils, die sechs Seiten samt Ausbildungslinks und Formen sowie alle Seiten bei 1440 und 390 Pixeln Breite. Navigation, Bildfüllung und Seitenkommentare funktionieren; Inline-Bearbeitung mit Abbrechen und die Übernahme aller sechs Seiten im vollständigen Editor erhalten die Inhalte. Der gemeinsame Infozeilen-Editor ergänzt bei leeren Daten keine Musterwerte mehr; bewusstes Hinzufügen und Entfernen bleibt möglich.

## Erster Teil

Redaktionelles Almanach-Modul unter **Techniken → Cenyr → Drachentanz Kampfstil**.
Die Registrierung erfolgt nach `data/sections.js` und vor der Initialisierung des Archivs.
Erneutes Laden registriert den Eintrag nicht doppelt.

Die 13 Seiten verwenden die bestehende Standard-/Story-Vorlage und deren Bild- und
Textfelder. `chapters` enthält die direkt bearbeitbaren Absätze; bei der Registrierung
werden sie in die reguläre Seitenbeschreibung überführt. Es gibt keine eigene
Darstellungslogik, keine Zitatgeber und keine vorgegebenen Kommentare. Die reguläre
Kommentierfunktion ist unter jeder Seite aktiviert (`enablePageComments: true`);
eine zusätzliche Kommentarseite wird nicht angehängt.
Die Illustrationen füllen ihre Bildspalte standardmäßig mit `imageFit: 'cover'`
und oberem Bildfokus. Bildausschnitt und Einpassung bleiben im Editor anpassbar.
Das Modul verändert keine Kampfregeln, Techniken oder Klassendaten.

Grundlage ist der am 8. September 2026 bereitgestellte HTML-Text. Seine 314 Sachtextabsätze
sind erhalten; Zitatblöcke, Sprecherangaben und die Einleitung zum entfernten Sprichwort
sind ausgelassen. Die direkte Antwort in der Trivia ist als Sachtext formuliert.
Zwischenüberschriften sowie zusätzliche Fett- und Kursivsetzungen gliedern die Texte.

## Seiten und Bilder

| Seite | Inhalt | Bilddatei |
| --- | --- | --- |
| 1 | Übersicht und Allgemein | `uebersicht.png` |
| 2 | Grundtechniken, ruhender und bewegter Drache | `grundtechniken.png` |
| 3 | Finten, Täuschungen, Beweglichkeit und Geschicklichkeit | `finten-beweglichkeit.png` |
| 4 | Die Tänze | `taenze.png` |
| 5 | Jungdrache | `jungdrache.png` |
| 6 | Schwertdrache | `schwertdrache.png` |
| 7 | Abwartender Drache | `abwartender-drache.png` |
| 8 | Fliegender Drache | `fliegender-aufsteigender-drache.png` |
| 9 | Aufsteigender Drache | `fliegender-aufsteigender-drache.png` |
| 10 | Brüllender Drache | `bruellender-drache.png` |
| 11 | Ausgeglichener Drache | `ausgeglichener-drache.png` |
| 12 | Zwillingsdrache | `zwillingsdrache.png` |
| 13 | Trivia / Wissenswertes | `trivia.png` |

Die vom Nutzer vorgegebenen PNG-Dateien liegen unverändert in
`public/assets/drachentanz-kampfstil/`. `sources.json` dokumentiert ihre Original-URLs
und SHA-256-Prüfsummen. Das gemeinsame Bild der beiden beweglichen Formen wird nur
einmal gespeichert. Die Trivia verwendet die angebotene Alternative `6T0Erkr`, da
`OTCX0TF` bereits den Jungdrachen illustriert. Die Tänze-Übersicht verwendet das ebenfalls
angebotene, bisher ungenutzte Bild `WwJrMiq` mit Ritter und Knappe beim Schwertunterricht.
