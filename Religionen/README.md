# Religionen von Aleria

Eigenständiger, statischer Codex unter `Religionen/index.html`, erreichbar über das Religionsregister des Almanachs. Keine Anmeldung, Firebase-Abhängigkeit oder Speicherung im Browser. HTML-Inhalte und Seitenlinks funktionieren auch ohne JavaScript; Suche, Filter und Sortierung erweitern das statische Register.

## Struktur und Verantwortung

- `data/register.json`: Kapitel, Reihenfolge und Pfade zu den redaktionellen Einträgen. Keine zweite Kopie der Texte.
- `data/goettlicher-kreis.json`: eigenes Verzeichnis der neun Göttlichen, fünf Souveräne und fünf Untergottheiten; über `collections` am Hauptregister angemeldet.
- `data/infernaler-kreis.json`: zehn hohe Mächte, fünf Untergötter, zwei Geweihte und fünf Gefallene. 17 vollständige Profile und fünf Registereinträge; Pflege in [docs/INFERNALER_KREIS.md](docs/INFERNALER_KREIS.md).
- `data/goettliche-lehre.json`: gemeinsame Lehre zu Sphäre, Eiden, Aspekten, Segen, Bünden und Übertretungen; über `sharedLoreSource` im Register eingebunden.
- `heilige/register.json`: acht namentlich überlieferte Heilige, vorerst ohne Bilder und Einzelbiografien.
- `klerus/`: neuer Alerischer Klerus mit sechs Kasten, Hierarchien, 19 Götterunterseiten und monastischen Zünften; Struktur und verbindliche Regeln in [klerus/README.md](klerus/README.md).
- `religionen/<id>/eintrag.json`: je Religion eine Inhaltsquelle; `index.html` daneben wird erzeugt.
- `religionen/<id>/glaube.json`: eigene Göttergruppen, Aspektzuordnungen und Hierarchien der acht ergänzten Religionen; Bildnisse und Herkunft unter `assets/` im selben Ordner. Einzelheiten in [docs/GLAUBENSRICHTUNGEN.md](docs/GLAUBENSRICHTUNGEN.md).
- `pantheons/<id>/eintrag.json`: Götterkreise und ihre Verbindungen zu Religionen und Gottheiten.
- `gottheiten/<ordnung>/<id>/eintrag.json`: einzelne Gottheiten und neutrale Entitäten, unabhängig von Religionszugehörigkeiten.
- `sphaerenkunde/<id>/eintrag.json`: Verweise auf bereits ausgearbeitete Themen im Bestiarium.
- `modules/catalog`: reine Such-/Filterlogik und auf das Verzeichnis begrenzte DOM-Verwaltung.
- `modules/traditions`: Validierung, Bildregister und Rangbeschreibungen der einzelnen Glaubensrichtungen. Nutzt die vorhandene Katalogsuche und deren ausgelagerte `catalog-controls.css`.
- `modules/profiles`: Artikel, Navigation, Kurzangaben, große Glasmalereibilder und eigene Artefaktdarstellung samt Validierung.
- `modules/pantheon`: Sammlungsseiten mit eigenen Gruppen und Suchregister. Gemeinsame Lehre, weiterführende Artikel, Heiligenliste und Farbgebung werden je Sammlung konfiguriert.
- `modules/clergy`: Klerusdaten und Validierung, Seitenvorlagen, Hierarchien, drei wissenschaftliche Bereiche, Kastenreiter und eigenes CSS. Verwendet die bestehende Katalogsuche.
- `modules/lore`: strukturierte Absätze, Zwischenüberschriften, Gabenlisten, Namensregister und gemeinsame Lehre.
- `modules/book-shell`: eigene, gekapselte Gestaltung des Codex; Pergament, Serifenschrift, Grün und Gold nehmen Klassen und Bestiarium auf.
- `modules/content`: Einlesen, Validierung und sichere HTML-Ausgabe zur Erzeugungszeit; keine Laufzeit-Fetch-Kaskaden.
- `scripts/build-religions.mjs`: erzeugt Hauptseite und lokale Profile aus demselben Register, das Vite verwendet.
- `assets/symbols`: lokale Symbole der gelieferten Vorlage, vollständig und ohne Beschnitt. Verlustfreies WebP erhält die originalen RGBA-Pixel; Quellen, Original-Hashes und Maße stehen in `assets/sources.json`.
- `assets/divine-art`: 19 unveränderte Glasmalerei-Porträts aus den gelieferten Einzelprofilen; Herkunft, Maße und Hashes in `sources.json`. Die farbigen Göttersymbole werden direkt aus `BilderRüstungen/<id>_icon.png` gelesen.
- `assets/infernal-icons`: 23 einzeln generierte, transparente Icons für Infernus und seine 22 Einträge, in mattem Gold-Ocker mit dunklen Konturen passend zu den celestialen Göttersymbolen. Prompts und Stilreferenzen stehen in `image-prompts.json`. Auch die infernalen Magie-Domänen verwenden diese Dateien über die Religionsdaten. Die früheren SVG-Entwürfe in `assets/infernal-symbols` sind nicht mehr eingebunden.
- `assets/infernal-art`: 22 unveränderte Bildnisse und sieben Artefaktbilder aus den Infernus-Vorlagen, mit lokalen Quellen, Bildmaßen und Hashes.
- `tests`: Inhaltsintegrität, Verweise, Suche und reproduzierbare Seitenerzeugung.

## Weitere Religion oder Gottheit ergänzen

1. Eine vorhandene `eintrag.json` als Strukturvorlage verwenden und einen eigenen Ordner unter `religionen/`, `pantheons/` oder `gottheiten/<ordnung>/` anlegen.
2. Stabile `id`, `title`, `kind`, `summary`, `symbol`, `tags`, `sections` und `relations` pflegen. Beziehungen referenzieren ausschließlich Eintrags-IDs und können Religionen mit mehreren Gottheiten sowie Gottheiten mit mehreren Religionen verbinden. Rückverbindungen entstehen automatisch.
3. Den Pfad genau einmal im passenden Kapitel von `data/register.json` oder in einer Gruppe der zuständigen Sammlung eintragen (`data/goettlicher-kreis.json` bzw. `data/infernaler-kreis.json`). Karten, Zähler, Suche, Profilseiten und Vite-Einstiege werden daraus abgeleitet. Die Hauptsuche findet Götternamen und Beinamen über die übergeordnete Sammlung.
4. Für einen eigenen Artikel `page: true` setzen. Besteht bereits ein kanonischer Artikel, stattdessen `canonicalHref` relativ zum Projektwurzelverzeichnis angeben. Die Karte verlinkt direkt dorthin; bestehende Lore wird nicht kopiert.
5. `node Religionen/scripts/build-religions.mjs` ausführen. Quelldaten und erzeugte HTML-Dateien gemeinsam übernehmen, da Netlify direkt die Repository-Dateien ausliefert.
6. `node Religionen/scripts/build-religions.mjs --check` und `node --test Religionen/tests/*.test.mjs` ausführen. Bei Browsermodul-/CSS-Änderungen zusätzlich `CONTENT_VERSION` in der Seitenvorlage und die betroffenen Importversionen aktualisieren.

`sections` enthält `id`, `title` und entweder `paragraphs` oder `blocks`. Blöcke sind `paragraph`/`heading` mit `text` oder `list` mit `items` und optional `ordered`. Alle Texte werden escaped. `sharedLore` referenziert einen Abschnitt der gemeinsamen Lehre; `facts` und `names` enthalten jeweils `label`/`value`. Optionales `portrait` enthält `src`, `alt`, `caption`, `width` und `height`; der Pfad liegt relativ zu `Religionen`. Das Kartensymbol bleibt davon unabhängig (`symbolRoot: "workspace"` für die vorhandenen Göttericons). Neue Einträge benötigen keine eigenen Listener oder kopierten Seitenvorlagen.

Reine Namens- und Bildregister einer Sammlung verwenden `recordOnly: true` ohne `page` oder `canonicalHref`. Sie erhalten eine suchbare Karte, bei vorhandenem `portrait` einen Bildlink und keine leere Profilseite. Beim späteren Ausbau wird derselbe Datensatz zu einem vollständigen Artikel erweitert. Gemeinsame Lehre wird nur über `doctrineIds` der jeweiligen Sammlung eingebunden; `readingEntryIds` verlinkt weiterführende Registerartikel.

Ein Religionsartikel kann über `traditionSource` ein eigenes `glaube.json` einbinden. Dessen lokale Götternamen, Aspekte und Ränge fließen automatisch in die Hauptsuche ein. Die bebilderten Gruppen im Artikel besitzen zusätzlich eigene Such- und Filterfunktionen. Kulturelle Aspektzuordnungen verweisen über `relatedIds` auf bestehende Profile oder benannte Registergestalten.

Der Almanach-Vite-Build nimmt derzeit 70 HTML-Dateien über dieselben Register auf: Hauptseite, 48 Artikel, 20 Klerusseiten und eine Weiterleitung vom alten Infernalen-Pfad. Verwendete Bilder einschließlich der Links zur vollständigen Abbildung werden als lokale Assets verarbeitet. Die alte Klerusseite ist unter [Archiv/AlerischerKlerus](../Archiv/AlerischerKlerus/README.md) gesichert und aus dem aktiven Bestand entfernt.

## Quellen und inhaltliche Grenzen

Die gelieferten Religionsnamen, Gliederung, Symbolquellen und die Einleitung zu Titanen/Ahnen/Urgöttern bilden die Grundlage. Der göttliche Kreis enthält die gelieferten 19 Einzelprofile, einschließlich des nachgereichten vollständigen Ordan-Textes. Die fehlende Lore der fünf Untergottheiten wurde auf ausdrücklichen Nutzerwunsch ergänzt; Herkunft und redaktionelle Entscheidungen stehen in `docs/GOETTLICHER_KREIS.md`. Offene Eide und Artefakte der primären Gottheiten und Souveräne bleiben als solche benannt. Die Kirchenhierarchie wird im eigenständigen neuen Klerusbereich anhand der späteren Nutzervorgaben behandelt.

Infernus übernimmt die 17 gelieferten Einzelprofile vollständig, einschließlich ausgearbeiteter Artefakttexte aus verschachtelten Tabellen. Die neue Übersicht nennt zehn hohe Mächte; der frühere Pfad `pantheons/neun-infernalen/index.html` leitet auf `pantheons/infernus/index.html` weiter. Sonderstellungen und offene Vorlagenbereiche sind in [docs/INFERNALER_KREIS.md](docs/INFERNALER_KREIS.md) dokumentiert.

Die acht weiteren Religionsvorlagen sind vollständig mit 105 Bildnissen und 79 Rängen übernommen. 90 Originalbilder werden unverändert verwendet; zehn fehlende Bilder und die fünf schwarzen Waldzirkel-Feindbildsymbole wurden anhand der jeweiligen Geschwisterbilder ergänzt beziehungsweise ersetzt. Alle fünf neuen Feindbilder sind freigestellt und eingebunden. Jede Religion behält ihre eigene Bildsprache. Quellen, Ergänzungen und offene Vorlagenstellen sind in [docs/GLAUBENSRICHTUNGEN.md](docs/GLAUBENSRICHTUNGEN.md) dokumentiert. Für die Triarchie der Eroberung liegt noch keine eigene Vorlage vor.

Morgath, Manât, Geweihte, Gefallene sowie Licht- und Finsteralben führen auf die bestehenden Bestiarium-Artikel. Religionsübersicht, Neun Göttliche und Alerische Kirche verlinken den neuen Klerusbereich; jedes Götterprofil führt zu seiner eigenen Klerusunterseite. Animexx-Verknüpfungen und das alte Tabellenlayout wurden nicht übernommen.

## Vorgemerktes Bildarchiv

**Vom Nutzer am 10.09.2026 ausdrücklich vorgemerkt: `E:\Aleria\BilderRüstungen`.** Seine farbigen Göttericons werden im Verzeichnis verwendet. Priester-, Paladin- und Mönchsabbildungen sowie das Bild der Bußgänger werden im neuen Klerusbereich genutzt. Nachgereichte Magister- und Asketenbilder liegen unter `klerus/assets/`.
