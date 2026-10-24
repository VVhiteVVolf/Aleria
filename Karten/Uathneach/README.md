# Uathneach

Die Übersicht zeigt ausschließlich Städte. Die Einordnung folgt der
Nutzerkorrektur vom 24. Oktober 2026: Ard Tiarna → Hauptstadt, Mor Tiarna → große
Regionshauptstadt, Dún Tiarna → normal große Stadt, Laird → kleine Stadt oder
Burgstadt. Ansässige Lairds stufen den Sitz eines höherrangigen Clans nicht
herab. Die drei eigenständigen Broch-Sitze sind Burgstädte. Féthlinn ist keine
Leuchtturmsiedlung, Rioghain kein Dorf. Die genaue Größenklasse der drei
neuen Clans ohne belegten Rang bleibt offen; ihre Orte sind ausdrücklich Städte.
Diese Regel liegt in `city-classification.mjs`; Architekturdetails einzelner
Kartenzeichnungen begründen keine Wirtschafts- oder Siedlungskategorie.
Die lokalen Stadtfilter verwenden mit `placeholderCategoryId` die vorhandenen
Stadt- und Burgstadt-Standardbilder; sie fallen nicht auf das allgemeine
Dorfmotiv zurück. Ihre eigenen Filterkennungen und Bezeichnungen bleiben erhalten.

Patrick hat Variante 1 am 24. Oktober 2026 bestätigt: sieben Gebiete, sechs
Mor-Tiarna-Clans unter den Mac Ard’Lága, fünf Dún-Tiarna-Lehen und die örtlichen
Clans. `Stammbäume/assets/js/data/uathneach-territories.source.json` enthält den freigegebenen Bestand unabhängig von
der experimentellen Vorschau. Alternativen bleiben dort archiviert.

Die Quelle unterscheidet die geografische Kartenfläche (`mapRegionId`) von der
Lehenszugehörigkeit (`territoryId`). Broch an Reithe liegt in Tir na Seolta,
gehört aber als Sonderlehen der Ua Muirin unmittelbar unter die Lága und wird
auf Tir na Dála geführt. Rioghain gehört zu den Clannmhar, Treabhair zu den
Nic Luachra. Die drei zuletzt hinzugefügten Clans behalten einen offenen Rang.

Die 18 Ortsanker wurden an den Siedlungszeichnungen der freigegebenen Karte
festgelegt, in Prozent mit Ursprung oben links. Der Import rechnet sie mit der
tatsächlich geprüften Bildgröße 4096 × 3365 um; die zusätzliche Umrechnung über
den gemeinsamen Bottom-left-Importer ist verlustfrei. Dies sind keine
World-Anvil-Koordinaten. `sourceRef` erhält die lokale Quellenkennung.
`residentFamilyIds` legt alle 26 Clanresidenzen ausdrücklich fest; Herrschaft
über ein Gebiet allein erzeugt keine zusätzlichen Residenzen.

Am 24. Oktober 2026 hat der Nutzer die fertigen Dateien
`Uathneach Normale Karte.png` und `Uathneach Regionen.png` geliefert.
`map-images.source.json` dokumentiert Bildgröße und SHA-256 der Originale sowie
der pixelgleichen, verlustfreien WebP-Kopien. Die Normalkarte ist unbeschriftet;
die Regionskarte enthält die Farben und die gewählten Namen: Tir na Dála,
Tir na nGleannta, Tir na Gairme, Tir na Seolta, Tir na Machairí, Tir na Faire
und Tir na gClog. Stabile Gebiets-IDs, Wappenpfade und bisher veröffentlichte
Seiten-URLs bleiben erhalten. `routeName` dient ausschließlich diesem stabilen
URL-Pfad; alle sichtbaren Namen stammen aus `name`.

Die Kartenansicht nutzt die vorhandenen Ebenen **Normal**, **Mit Markierungen**
und **Regionen**. Für Markierungen gibt es kein zusätzliches Rasterbild:
`markerPresentation: "symbols"`, `showMarkers: true` und `showPinLabels: true`
zeigen die 18 vorhandenen Ortsanker als sichtbare Symbole mit Namen. Die
gemeinsame Sichtbarkeitsmigration berücksichtigt zuvor ausgeblendete Defaults.
Der Wappen-Schalter bleibt unabhängig nutzbar. Die farbigen Grenzen stammen
aus dem gelieferten Regionsbild; Untergebietsgrenzen werden nicht erfunden.

Die Familienakten enthalten Namen, Wappen, Ränge und Lehensbindungen; mangels
genealogischer Quelle bleiben Personen und Verwandtschaften leer. Bereits
vorhandene Verweise anderer Stammbäume auf etwa Midgna und Luachra verwenden
die gleichen stabilen Familienkennungen.

Aktualisierung:

```powershell
node Karten/tools/build-uathneach.mjs
node Kontinente/scripts/build-uathneach.mjs
node Kontinente/scripts/build-alben.mjs
node Karten/tools/build-households.mjs
```

Die jeweiligen `--check`-Aufrufe sind Teil der Releaseprüfung. Der Kartenbuild
verwendet die gemeinsame Hash-Sicherung gegen das Überschreiben nachträglich
bearbeiteter Kartenstände. Die Vorschau, Alternativkarten und ihre Bearbeitung
bleiben von der regulären Karte unabhängig.
