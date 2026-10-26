# Goldmund · temporäre Vorbereitungs- und Besprechungsseite

Einstieg: `index.html`. Die eigenständige Seite entwickelt die gelieferte
Goldmund-Karte als besprechbaren Entwurf: drei Grafschaften, acht einzelne
Regionen, elf eigene Banner, fünf beibehaltene Häuser, elf neue Hausvorschläge,
vier albische Clans und vier auswählbare Fürstentumswappen. Insgesamt sind
20 Häuser und Clans sowie 34 neue Bildmotive enthalten: 23 Kreiswappen
(elf neue Häuser, vier Clans, drei Überarbeitungen, vier Fürstentumsvorschläge,
ein antikes Wappen Órneachs)
sowie elf Banner. Neue Namen, Motive und Rollenansätze
sind ausdrücklich Vorschläge. Die Seite schreibt weder kanonische Register
noch Firebase-Daten.

Goldveld als Fürstenfamilie und Roden als Ritterfürstenfamilie sind gemäß
Nutzervorgabe fest in Thronholt gesetzt. Die übrigen 18 Häuser und Clans beginnen ohne
Sitz und erhalten durch Verschieben keinen zusätzlichen Rang. Hochreuth wird
nicht ergänzt; seine alte Burg ist auf dieser Karte nicht verortet.

Der grundlegende Kontext folgt der verbindlichen Nutzerfestlegung vom
26. Oktober 2026 und liegt wiederverwendbar unter
`Kontinente/modules/goldmund/goldmund-context.mjs`. `context-render.mjs` und
`context.css` besitzen ausschließlich seine Darstellung auf der Vorbereitungsseite.
Herkunft, kaiserliches Erbe, Bankwesen, Goldvorkommen, Handelsabhängigkeiten und
gesellschaftliche Benachteiligung der Alben sind damit vom Zuordnungsentwurf getrennt.
Órneachs goldener Schwan ist ein historisches Wappen unter `assets/history/`;
er wird nicht zur fünften Auswahl für das heutige Fürstentumswappen.

`realm-data.mjs` besitzt die Grafschaften, Regionen, Ortskoordinaten und
Wappenauswahl. `source-houses.mjs` beschreibt die gelieferten und vorgeschlagenen
Häuser. `albic-clans.mjs` besitzt die vier zusätzlichen Clanvorschläge.
Die Seite verwendet die gemeinsame Kartenansicht und die gemeinsame
Placement-Engine unter `../shared/`; sie dupliziert keine Zuordnungslogik.
`proposal-render.mjs` rendert die featurebezogenen Ansichten,
`proposal-page.mjs` verbindet delegierte Ereignisse mit State und Darstellung.

Die Hausfenster zeigen für alle 20 aktuellen Häuser und Clans einen vollständigen
Kriegerentwurf neben Wappen, Klassenbegründung, Palette, Ausrüstung und Sitz.
`house-details.mjs` und `house-details.css` besitzen diese Ansicht; die bestehende
Zuordnungslogik bleibt gemeinsam genutzt. Desktop: zwei Spalten; mobil: vollständige
Figur vor dem Hausprofil, ein scrollbares Dialogfenster mit erreichbarem Schließen.
Alle Klassen bleiben gestalterische Vorschläge, keine kanonischen Hausfestlegungen.

`warrior-art-direction.mjs` besitzt die 20 individuellen Produktionsentwürfe.
`node Vorschau/Goldmund/scripts/build-warrior-catalog.mjs` erzeugt daraus den kleinen
Laufzeitkatalog `warrior-data.mjs` und die vollständigen Prompts unter
`assets/warriors/prompts.json`. Stilreferenz ist der am 24. Oktober freigegebene
Hausritter; jedes aktuelle Hauswappen wurde als eigene Motivreferenz mitgegeben.
Werkzeug: eingebautes `image_gen`, ein Aufruf pro Haus, keine API-/CLI-Generierung.
Die Klassenquelle ist `Klassenordner/Klassenseite.html`; detaillierte Waffenangaben
folgen der Nutzeranweisung. Die Anzeige verwendet „Aldmer“, die bestehende Klassen-ID
bleibt `aldmar`; Güldner verwendet die vorhandene ID `guldner`.

Kriegerbilder liegen getrennt von der Heraldik unter `assets/warriors/`:
`generated/` enthält unveränderte Generatororiginale, `production/` die nur am
Alphakanal bereinigten PNGs (1024 × 1536), `previews/` die WebP-Anzeigen (768 × 1152).
Die ausdrücklich erlaubte Alphabereinigung erhält alle RGB-Bytes sowie transparente
Zwischenräume. Sie verwendet keine geschlossene Wappen-/Kreismaske.
`python -B Vorschau/Goldmund/scripts/prepare_warriors.py build` verarbeitet die Bilder;
`audit --expected-count 20` prüft Prüfsummen, Freistellung und unbeschnittene Ränder;
`contact` erstellt die visuelle QA-Übersicht. Der unabhängige Bildbeleg steht in
`assets/warriors/manifest.json`.

`design-state.mjs` komponiert die gemeinsame Zuordnungs-Engine mit
Grafschafts-/Regionsnamen, gemeinsamem Landschaftsnamen und Wappenauswahl.
Rücknahme, Ausgangsstand und JSON-Import/-Export umfassen den gesamten Entwurf.
Ein Import wird vollständig validiert, bevor er den aktuellen Entwurf ersetzt.
Fest gesetzte Thronholt-Zuordnungen lassen sich auch durch Import nicht lösen.
Persönliche Änderungen liegen unter dem eigenen Browser-Schlüssel
`aleria:proposal:goldmund:draft:v1`.

Roosenvelt und Broeck behalten auf ausdrücklichen Nutzerwunsch Namen und Wappen.
Roden, Goldveld und Lanette behalten ihre Namen und verwenden die neuen Wappen.
Adrard, Rielle, Vandergard, Waalen und Witten entfallen nur aus dieser Vorbereitung;
die gelieferten Dateien bleiben unverändert im Archiv. Eine eng begrenzte Migration
akzeptiert die vollständigen früheren Hauslisten mit 16 oder 21 Einträgen:
Zuordnungen der verbleibenden Häuser, Gebietsnamen und Wappenauswahl bleiben erhalten,
fehlende neue Häuser beginnen ohne Sitz. Unvollständige oder fremde Hauslisten und
unbekannte Orte werden weiterhin abgelehnt; alle festen Sitzregeln bleiben verbindlich.

Ruan, Callan, Brenn und Fenn tragen auf Wunsch vorerst überhaupt keine Präfixe.
Diese werden später gemeinsam festgelegt. Die alten internen IDs bleiben für
gespeicherte Zuordnungen erhalten; ihre Rollen sind ausdrücklich Laird-Clans.
Ihre Zeichen bleiben materiell bescheiden, unterscheiden sich aber ausdrücklich
auch im Aufbau: grünes Bretterfeld mit dunklem Holzring; geteiltes ocker-graues
Feld mit schrägen Brettern und vernietetem Eisenring; rostrotes Feld mit schwarzem
Querbalken, heller Birke und Clanrunen; Wasserbänder mit einem Hanfseilring.
Die gemeinsame malerische Heraldik bleibt erhalten. Ihre Orte sind frei zuweisbar.
Der vollständige Stand vor dieser Ergänzung wird ebenfalls migriert; alle vier
Clans beginnen dabei ohne Sitz. Die ersten, zu gleichförmigen drei Varianten
liegen getrennt unter `assets/generated-archive/albic-first-drafts/`.

Freie Wappen lassen sich mit Maus oder Stift ziehen. Auswahlbuttons und die
Haus-/Ortslisten bieten denselben Weg für Tastatur und Touch. Die Kartenpins
liegen neben den gelieferten Beschriftungen; Linien führen zum jeweiligen Ort.
Die Karte behält ihre eingebrannten Ortsnamen. Grafschafts- und Regionsnamen
sind über eigene Namenseditoren veränderbar.

`assets/originals/` enthält die unveränderten Lieferdateien; `assets.source.json`
dokumentiert Quellen, Abmessungen und Prüfsummen. Aktive Hauswappen liegen unter
`assets/crests/`, Regions- und Grafschaftsbanner unter `assets/banners/`, die vier
Fürstentumsentwürfe unter `assets/realm/`. Das gelieferte Fürstentumswappen und
die ursprünglichen Wappen von Roden, Goldveld und Lanette bleiben als Archiv
erhalten. Auf Nutzerwunsch vom 26. Oktober zeigt die Seite nur die neuen Fassungen.

Die Farbkorrektur des Nutzers verteilt die Hauptfarben auf Gold, Silber,
Bronze, Schwarz und satte Farbfelder. Insbesondere Severin und Marholt
verwenden schwarze Wappentiere, Belcourt einen silbernen Kelch und Lanvier
einen saphir-/petrolblauen Pfau. Goldvelds Löwe und Lanettes Reiter bleiben
gemäß Motivvorgabe golden. Der Doppeladler ist schwarz; der Fürstentumskelch
ist silbern. Die Namens-IDs bleiben zur Stabilität vorhandener Entwürfe erhalten.

Großansichtslinks neuer und überarbeiteter Bilder zeigen auf die technischen
Produktionsfassungen unter `assets/production/{id}.png`. Die aktive Seite nutzt
deren WebP-Anzeigen; die rohen Generatorfassungen unter `assets/generated/`
bleiben als Archiv getrennt erhalten. Gelieferte Hausoriginale bleiben unter
`assets/originals/houses/` erreichbar.

Die elf neuen Namen folgen der aktualisierten Nutzervorgabe: kurze, gut lesbare
Familiennamen näher an Roden, Goldveld und Lanette, mit höfischen sowie deutschen
und französisch-belgischen Anklängen. Die erste stark niederländische Fassung wurde
verworfen. Alle bleiben Namensvorschläge. Anzeigenamen und interne IDs sind bewusst
getrennt; die früheren Motiv-IDs und sämtliche Assetpfade bleiben stabil, damit
gespeicherte Entwürfe und exportierte Hauszuordnungen weiterhin funktionieren.

| Anzeigename | Stabile Haus-ID |
| --- | --- |
| Arenberg | `aurelshain` |
| Velten | `gueldenfels` |
| Severin | `falkengold` |
| Belcourt | `rebenkron` |
| Lanvier | `seidenwarth` |
| Marholt | `greifenau` |
| Belmont | `eitelborn` |
| Arden | `herzau` |
| Berden | `silberhorst` |
| Sorel | `samtborn` |
| Wolter | `weisshorn` |
