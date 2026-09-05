# Klassenregister und Universalklassen

Der Almanach verlinkt über **Klassen** auf `Klassenseite.html`. Dort führen die fünfzehn Universalklassen auf eigene Seiten unter `Basisklassen/<id>/index.html`.

Die sieben **Cenyr-Klassen** besitzen inzwischen eigene Kulturklassenbögen unter `Cenyr/<id>/index.html`: Hintergrund, Kulturzugehörigkeit und eine interaktive Ausbildungsvorschau für Stufe 1–20. Andere Kulturgruppen behalten ihre Kurzprofile. Der gemeinsame Build erzeugt beide Seitentypen und aktualisiert das Archiv. Aufbau, Freigaben und offene Regeln stehen in [docs/CENYR_CLASS_PROGRESSION.md](docs/CENYR_CLASS_PROGRESSION.md).

## Aufbau

- `Basisklassen/<id>/klasse.json` besitzt die Texte, Steckbriefangaben, Bildquellen und den Bearbeitungsstand einer Universalklasse. Diese Dateien sind die redaktionelle Datenquelle.
- `Basisklassen/<id>/index.html` ist die daraus erzeugte, eingecheckte Seite. Vollständig lesbar ohne JavaScript; Layout und Navigation kommen aus einer gemeinsamen Vorlage.
- `modules/pages/universal-class-registry.js` besitzt die Reihenfolge und alte Navigationskennungen.
- `modules/pages/class-page-template.js` erzeugt Seitenrahmen, Kapitel, Steckbrief, Nachbarklassen und Registerkarten.
- `modules/pages/class-page-content.js` validiert das Inhaltsformat und das erlaubte Rich-Text-Markup beim Erzeugen.
- `modules/pages/class-page.js` ergänzt ausschließlich Druckfunktion, Bildersatz und die Hervorhebung des aktuellen Kapitels. Es gibt keine Firebase-Verbindung.
- `modules/pages/class-page.css` gestaltet die Klassen als Fantasy-Codex mit Pergament, Initialen, Zitatblöcken, Porträtrahmen und unterschiedlichen Klassenfarben.
- `modules/catalog/`, `modules/lore/` und `modules/sheets/` besitzen weiterhin Suche, Kulturhintergründe und Kurzprofile des Registers.

Die vorhandene Ordnerbezeichnung `Basisklassen` bleibt für die Universalklassen erhalten. Neue Klassen werden als eigene Inhaltsdatei ergänzt und in der Registry eingetragen; das Layout wird gemeinsam gepflegt.

## Seiten bearbeiten und erzeugen

Vom Almanach-Verzeichnis aus:

```text
npm run build:classes
npm run check:classes
npm run test:classes
```

`build:classes` erzeugt alle Seiten, die Universalklassenkarten und Cenyr-Verweise im Register und aktualisiert danach den Charakterarchiv-Snapshot. `check:classes` vergleicht die eingecheckten Ausgaben mit den Quelldaten. Der reguläre `npm run build` führt die Seitenerzeugung ebenfalls aus und nimmt alle 22 Klassenseiten in den Vite-Build auf.

Direkt vom Repository-Verzeichnis:

```text
node Klassenordner/scripts/build-universal-classes.mjs
node Klassenordner/scripts/build-culture-classes.mjs
node AleriaAlmanach/scripts/sync-character-archive-pages.mjs
node AleriaAlmanach/scripts/check-character-archive.mjs
```

Für eine lokale Vorschau `python -m http.server 8765 --bind 127.0.0.1` im Repository starten und `/Klassenordner/Klassenseite.html` öffnen. Das statische Hosting liefert die eingecheckten HTML-Seiten aus; nach Inhaltsänderungen deshalb die erzeugten Dateien mit übernehmen.

## Inhalt und Herkunft

Alle fünfzehn Klassen basieren auf den gelieferten HTML-Vorlagen. Die doppelt gelieferte Krieger-Vorlage wurde nur einmal übernommen; der Druide verwendet die separat nachgereichte Vorlage. Der ursprüngliche Dateihash steht zur Nachvollziehbarkeit in `source.sha256`.

Einführung, Geschichte, Klassenbeschreibung, Fähigkeiten, Unterarten, Stärken/Schwächen bzw. Artefakte und Verschiedenes bleiben pro Klasse getrennte Kapitel. Ausgefüllte Steckbriefzeilen und die echten Zitate bleiben erhalten. Reine Punkt-Platzhalter und das leere Kopfzitat werden nicht als Inhalt ausgegeben. Fehlende Kapitel tragen `status: "pending"` mit leerem Inhalt und erscheinen gesammelt unter **Offene Kapitel**. Es werden keine fehlenden Informationen erfunden.

Das nachgereichte Bardenicon ist getrennt vom ursprünglichen Porträt eingebunden. Ein leeres `icon` verwendet in Seitenkopf und Register das allgemeine Klassensymbol. Die Originalillustrationen und vorhandenen Klassenicons bleiben über ihre Imgur-Quellen eingebunden. Bei Abrufproblemen zeigt die Seite einen passenden Ersatzrahmen; der Quellverweis in der Inhaltsdatei bleibt erhalten.

Das Rich-Text-Format erlaubt nur Absätze, Hervorhebungen, Listen, Zitate, Unterüberschriften und Zeilenumbrüche. Die alten Layouttabellen, festen Breiten, Inline-Styles und leeren Abstandselemente wurden entfernt. Layout- oder Skript-Markup wird beim Erzeugen abgewiesen.

## Namen, Verweise und Charakterarchiv

- Hexenmeister / Hexer → **Paktträger** (`pakttrager`)
- Mönch → **Asket** (`asket`)
- Paladin → **Eidgeschworener** (`eidgeschworener`)

Kämpfer bleibt der Registername; die gelieferte Seite heißt **Der Krieger**. Krieger ist zusätzlich als Such- und Navigationsalias hinterlegt. Die religiöse Bezeichnung *Klostermönch* in der Asketen-Geschichte bleibt als inhaltliche Unterscheidung erhalten.

Alte Registerfragmente wie `#klasse-basis-monch` werden auf die passende neue Seite weitergeleitet. Die Suche findet die umbenannten Klassen auch unter ihren alten Namen. Kulturprofile verwenden weiterhin `#klasse-<herkunft>-<klassen-id>`.

Das Charakterarchiv übernimmt seine 85 Klassen aus dem Register. Milwr erscheint weiterhin bei Cenyr und Vennyr, sodass es insgesamt 86 Herkunftseinträge gibt. Die generierten Universalklassenkarten erhalten deshalb den bisherigen HTML-Vertrag: Kommentare `BASISKLASSEN` / `LÄNDERPFADE`, `.class-card`, `.class-name`, `data-tooltip` und Iconquelle. Die kulturellen `section.land-section` mit ihren Überschriften bleiben redaktionell in der Registerseite.

Die neuen Namen werden auch im Archiv zusammengeführt. Die vorhandene Kampfvorlage `hexer` zeigt den Namen Paktträger; die gespeicherte Kennung und ihre Mechanik bleiben erhalten.

## Spätere Klassenbögen

Es ist kein Levelsystem ausgearbeitet. Die geplante Entwicklung von Level 1 bis 20 und ihre Zuständigkeiten stehen ausschließlich in [docs/CLASS_PROGRESSION_PLAN.md](docs/CLASS_PROGRESSION_PLAN.md). Die frühere leere Levelauswahl wurde aus den Kurzprofilen entfernt.
