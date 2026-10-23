# Albische Lande – Übernahme vom 22. Oktober 2026

Das Paket aus `Downloads/Aislaernech` umfasst Aislearneach mit fünf Detailkarten,
Blaithneach, das historische Ceitheach und den heutigen Dunkelhain. Die doppelt
genannte Ceitheach-URL wurde einmal erfasst. Alle Daten wurden über die verbundene
Chrome-Erweiterung aus der Markierungsliste, den einzelnen Bearbeitungsformularen
und den sichtbaren Grenzgeometrien gelesen. World Anvil wurde nicht verändert.

| Karte | Bildgröße | Ortsmarker | Grenzobjekte |
| --- | --- | ---: | ---: |
| Aislearneach | 3311 × 4097 | 16 | 10 |
| Tir na Geach | 3546 × 4097 | 54 | 9 |
| Tir na Tirth | 4096 × 2195 | 30 | 4 |
| Tir na Faela | 3193 × 4097 | 45 | 5 |
| Tir na Adharcach | 2827 × 4097 | 30 | 8 |
| Tir na Iomaire | 4096 × 2433 | 32 | 5 |
| Blaithneach | 4096 × 2838 | 141 | 20 |
| Ceitheach | 4096 × 1903 | 0 | 12 |
| Dunkelhain | 4096 × 1903 | 12 | 1 |
| **Summe** | | **360** | **74** |

## Nachvollziehbare Quellen

- `sources/world-anvil.capture.json`: alle 434 Quellkennungen und Formulare,
  Koordinaten, Zielverknüpfungen und vollständig sichtbaren SVG-Geometrien.
- `sources/articles.manifest.json`: 17 unveränderte HTML-Anhänge und die bereits
  archivierte Hauptquelle Aislearneachs, jeweils mit SHA-256.
- `sources/images.manifest.json`: die neun gelieferten Kartenbilder, ihre Größen
  und Prüfsummen. Die WebP-Arbeitsbilder behalten die ursprüngliche Auflösung.
- `sources/names.decisions.json`: 232 neue Siedlungsnamen, stabil nach Marker-ID.
- `sources/assignment-review.json` und die entsprechenden Dateien der drei
  weiteren Kartenordner: Zuordnung je Ort mit dem verwendeten Beleg.
- `sources/portraits.manifest.json`: 22 zusätzlich benötigte Ratsbilder, mit
  archivierten Originalbytes und geprüften lokalen PNGs.

## Positionen und Grenzen

Punktkoordinaten stammen aus den Formularen in Quellpixeln, Ursprung unten links:
`x / Bildbreite`, `1 - y / Bildhöhe`. Es wurden keine Orte verschoben.
Grenzen stammen aus dem sichtbaren SVG einschließlich Bildversatz und ViewBox.
Die getrennte Normalisierung beider Achsen berücksichtigt die Rundung der
gerenderten Bildhöhe. Der bisherige Standard des gemeinsamen Geometriehelfers
bleibt für ältere Übernahmen erhalten. Vor der Erfassung wurden alle benötigten
Ebenen eingeblendet und das vollständige Kartenbild in den SVG-Bereich gezoomt.

Alle Grenzen bleiben mit dem vorhandenen Regionseditor bearbeitbar. Die kräftige
gemeinsame Grenzdarstellung gilt auch hier. Die Voreinstellung ist Dot 80 und
Schrift 50. Fünf Verweise der Übersicht öffnen die passenden Detailkarten.

Elf weitere Übersichtspins bilden Orte ab, die auch auf Detailkarten vorkommen.
Beide World-Anvil-IDs bleiben erhalten; das Seitenregister verwendet jeweils
die Detaildarstellung. Zusammen mit fünf reinen Kartennavigationspins ergibt
das **344 eigenständige Einträge in den Ortsregistern**.

## Einordnung und offene Angaben

Benannte Flächen und belegte Clansitze haben Vorrang. Bei offenen, beschrifteten
Clan-Grenznetzen wurden nahe Marker bis 100 Quellpixel Abstand zugeordnet; diese
räumliche Ableitung ist im Zuordnungsbeleg ausdrücklich dokumentiert. Eine
Zuordnung zu einem bislang unbenannten Clan wurde daraus nicht abgeleitet.

Drei mögliche Herrschaften in Faela, drei in Blaithneach und sechs generische
historische Ceitheach-Flächen bleiben ohne Clan-Zuweisung. Ihre vorhandenen Orte
sind auf der zuständigen übergeordneten Seite erreichbar. Alte Nummerierungen
werden nicht als Clanbeleg behandelt.

Neue Namen wurden ausschließlich Siedlungen gegeben. 70 andere Marker besitzen
weiterhin ausdrücklich keinen Eigennamen, etwa Minen, Türme und Ahnenbäume.
Fehlende Beschreibungen sind als noch nicht ausgearbeitet gekennzeichnet.
Die Quelle enthält nur sechs ausgearbeitete Markertexte, sämtlich Stammeslager
in Adharcach; sie wurden vollständig übernommen. Deren Namen konnten aus den
vorhandenen Überschriften wiederhergestellt werden.

Das alte „Forest“-Symbol bezeichnet hier eine Waldsiedlung; „Mine“ bleibt eine
Mine. Bestehende Kategorien, Vorlagen und lokale Symbole werden wiederverwendet.
Gilden- und Ordensgebiete begründen keine zusätzlichen Clan-Herrschaften.
Pächter/Betreiber werden getrennt von der territorialen Zugehörigkeit geführt.

Adharcach steht unter dem Sagarth Derbforgaill; ein regierender Clan wurde nicht
erfunden. Gaisgh bleibt bei Broch an Traigh und Luchdon bei Broch an Creig.
Ui Faill Duibhne ist ausgestoßen, nicht als ausgestorben geführt. Ceitheach ist
historisch; vorhandene Nachkommen werden nicht zu heutigen Territorialherren
erklärt. Dunkelhain besitzt keinen regierenden Clan. Die beiden überlieferten
Gruppierungen sind genannt, ohne unbewiesene Anführer oder Ruinenzuweisungen.

## Seiten und Schutz bestehender Daten

45 Seiten verwenden die gemeinsamen Herrschaftsrenderer: Aislearneach 19,
Blaithneach 10, Ceitheach 15, Dunkelhain 1. Die drei Fürstentumsübersichten
enthalten jeweils alle 19, 11 und 14 dokumentierten Familien. Ortsregister und
Unterherrschaften bleiben verschachtelt. Alle 187 überlieferten Ratsplätze
werden dargestellt; bekannte Personen verweisen auf die bestehenden Akten.
Infobox und Ratskarte verwenden denselben belegten Namen des Oberhaupts.

`node Karten/tools/build-albische-lande.mjs` verwendet den gemeinsamen
Ausgabehelfer mit State-Hash-Schutz. Bereits manuell geänderte generierte Karten
werden nicht still überschrieben. Die 39 vor Beginn vorhandenen Kartendateien
sind laut SHA-256-Abgleich unverändert. Stammbaumdaten wurden nicht verändert.

Prüfbelege: [Abschlussprüfung](../../diagnostics/aislearneach-2026-10-22/README.md).
Kein Push und kein Deployment.
