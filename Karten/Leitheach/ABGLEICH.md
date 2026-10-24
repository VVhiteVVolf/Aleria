# Leitheach – Kartenkorrektur vom 24. Oktober 2026

Einstieg: `Karten/karte.html?map=leitheach`. Die sechs Hauptregionen verlinken ihre
Teilkarten. Alle sieben Karten verwenden die gelieferten Bilder aus
`Downloads/Leitheach`, verlustfrei als WebP übernommen. Jede Karte führt zurück
zur passenden Herrschaftsseite. Estryll und der Schild von Ailith verlinken das
Fürstentum.

| Karte | Bildgröße | Gebietsobjekte | Ortsmarker |
| --- | --- | ---: | ---: |
| Leitheach | 4096 × 3573 | 6 | 14 |
| Tir na Sleagh | 4096 × 3191 | 6 | 48 |
| Tir na Sinsear | 4096 × 2085 | 6 | 56 |
| Tir na Gortanna | 4096 × 3079 | 6 | 72 |
| Tir na Tonn | 4096 × 3939 | 4 | 38 |
| Tir an Comhchuibhis | 2662 × 4097 | 5 | 43 |
| Tir na Sruth | 4096 × 3168 | 3 | 47 |
| **Gesamt** | | **36** | **318** |

## Korrektur und Belege

Der frühere Stand vom 22. Oktober enthielt keine Ortsmarker und teilweise versetzte
SVG-Geometrie. Alle sieben Bearbeitungsansichten und alle 324 koordinatenhaltigen
Markereinträge wurden erneut über die verbundene Chrome-Erweiterung erfasst.
`sources/maps-20261024.capture.json` und `sources/markers-20261024.capture.json`
enthalten die neuen Belege. Das alte Archiv bleibt unverändert erhalten.

Jede SVG-Geometrie wird vor der Umrechnung gegen ihre tatsächlich dargestellte
Begrenzungsbox geprüft. Bild- und SVG-Position, ViewBox und beide Bildachsen werden
berücksichtigt. Die gerundeten sichtbaren SVG-Punkte sind keine behaupteten nativen
Polygonkoordinaten; die Auflösung beträgt etwa 4–8 Quellbildpixel.

Ortskoordinaten stammen aus den jeweiligen Markerformularen: Pixelwerte mit
Ursprung unten links. Aleria speichert `x / Bildbreite` und `1 - y / Bildhöhe`.
Ein unabhängiger Test vergleicht jeden Wert mit dem sichtbaren DOM-Anker der
World-Anvil-Markierung (Abweichung unter zwei CSS-Pixeln).

Die 324 Einträge bestehen aus 318 Ortsmarkern und sechs Navigationsmarkern zu den
Teilkarten. Letztere sind im Abgleich dokumentiert, erscheinen aber nicht als
künstliche Orte. Alle ursprünglichen Marker-IDs bleiben Quellenkennungen.
Alle 98 vorhandenen Ortsbeschreibungen bleiben vollständig erhalten. 220 Marker
haben keinen Quellentext und werden entsprechend gekennzeichnet. Ortsnamen werden
gegebenenfalls aus der vorhandenen Beschreibungsüberschrift gewonnen.

## Herrschaftszuordnung

Viele alte Clanlinien sind Verbindungsnetze zwischen Siedlungen und kreuzen sich.
Sie bleiben offene Linien und werden nicht künstlich zu Gebietsflächen geschlossen.
Die Anschlusspunkte belegen die Zugehörigkeit der angeschlossenen Orte. Der geprüfte
Abstand in Originalbildpixeln und ausdrückliche Korrekturen stehen in
`place-review.source.json`. Flächenzugehörigkeit wird nur aus tatsächlichen Flächen
ermittelt. Örtliche Gildenbereiche sind keine zusätzlichen Clan-Herrschaften.

Die bestätigte Fläche `397f74eb-6a69-4e7a-9ef3-0b435b2ede97` ist Tir na Fancha
unter Na’Mhuir; ihr veralteter Buarstrath-Text ist keine Regionsbeschreibung.
Cleir, Ghaiscioch und Ceardaiocht bleiben unter Coimhthioch verschachtelt.
Ua’Eirce, Uí Fiachrach und Ruin Ua Laoch haben eigene Sleagh-Herrschaftsseiten.
Die Ortsbeschreibungen belegen Cairn Fàire als Sitz der Ua’Cleir, Senanbail als Sitz
der Ua’Eirce und Mârbail als Sitz der Fiachrach. Diese Nachweise stehen im Gebietskatalog.

Die 26 Herrschaftsseiten verwenden den gemeinsamen Seitentyp und zeigen jeweils
nur ihre eigenen Orte nach Ortsart. Unterherrschaften werden verlinkt. Die 24
gelieferten HTML-Artikel bleiben unverändert archiviert; alte Gestaltung wird nicht
übernommen. Einzelheiten: `Kontinente/modules/leitheach/README.md`.

## Wiederholbarer Aufbau und Schutz

1. `node Karten/tools/import-leitheach-source.mjs --check`
2. `node Karten/tools/build-leitheach.mjs --check`
3. `node Kontinente/scripts/build-leitheach.mjs --check`

Ohne `--check` werden die jeweiligen abgeleiteten Dateien erzeugt. Der Kartenbuilder
verweigert das Überschreiben manuell geänderter Kartendaten anhand ihres generierten
State-Hashes. Browserentwürfe und globale Familienakten werden nicht überschrieben.
Andere Karten, Online-Daten und Live-Ressourcen bleiben erhalten. Am 24. Oktober
hat der Nutzer die Veröffentlichung sämtlicher lokalen Neuheiten freigegeben;
die Prüfung dieser Korrektur ist Teil dieser Gesamtveröffentlichung.

Während der Erfassung wurde Nossail vorübergehend versehentlich der Gruppe
„Herrschaften“ zugewiesen; die ursprüngliche Gruppe „Markierungen“ wurde sofort
wiederhergestellt und über die sichtbare Liste bestätigt. Danach wurden ausschließlich
exakt geprüfte Marker-Bearbeitungslinks gelesen. Inhalte und Koordinaten in
World Anvil wurden nicht gespeichert; die dort gesperrte Polygonbearbeitung wurde
nicht umgangen.
