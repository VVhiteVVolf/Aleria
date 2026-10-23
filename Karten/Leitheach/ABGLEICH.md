# Leitheach – Regionsübertragung vom 22. Oktober 2026

Einstieg: `Karten/karte.html?map=leitheach`. Die sechs beschrifteten Hauptregionen
verlinken ihre Teilkarten. Jede Teilkarte führt über **Gebiete → Übergeordnete
Karte** zur Übersicht zurück. Alle sieben Karten verwenden die vom Nutzer
gelieferten Bilder aus `Downloads/Leitheach`, verlustfrei als WebP übernommen.

| Karte | Bildgröße | Grenzobjekte |
| --- | --- | ---: |
| Leitheach | 4096 × 3573 | 6 |
| Tir na Sleagh | 4096 × 3191 | 6 |
| Tir na Sinsear | 4096 × 2085 | 6 |
| Tir na Gortanna | 4096 × 3079 | 6 |
| Tir na Tonn | 4096 × 3939 | 4 |
| Tir an Comhchuibhis | 2662 × 4097 | 5 |
| Tir na Sruth | 4096 × 3168 | 3 |
| **Gesamt** | | **36** |

## Erfassung

Die Bearbeitungsansichten aller sieben World-Anvil-Karten wurden über die
verbundene Chrome-Erweiterung geprüft. Erfasst wurden die sichtbaren SVG-Grenzen,
ihre Bild-/Ansichtsmaße, Markierungslisten und Quellenmarker-IDs. Es wurde keine
World-Anvil-Karte verändert. Die dort gesperrte Polygonbearbeitung wurde nicht
umgangen.

`sources/world-anvil.capture.json` hält diesen Rohbeleg. Die Umrechnung erfolgt
über die sichtbare SVG-ViewBox und die tatsächliche Bildposition und Bildgröße,
ohne Y-Spiegelung. Die dargestellten SVG-Punkte sind vom Quellrenderer gerundet:
Die Grenzen entsprechen der sichtbaren Vorlage, nicht behaupteten originalen
nativen Polygonkoordinaten. Die sichtbare Auflösung liegt bei ungefähr 4–8
Quellbildpixeln. Alle Punkte lassen sich im neuen Regionswerkzeug korrigieren.

Offene Grenzlinien und getrennte Abschnitte bleiben offen/getrennt; daraus wurden
keine künstlich geschlossenen Herrschaftsflächen konstruiert. Die zwei örtlichen
Kreisbereiche (Rhosmeres Rösser und Schwanenorden) bleiben eigene Bereiche ohne
erfundene Clan-Zuordnung. Das Grenzgebiet und unbelegte Zugehörigkeiten bleiben offen.

## Zuordnung und Nutzerkorrektur

Häuser werden nur über vorhandene kanonische Familienakten zugeordnet. Die
Familienquellen sind unter `sources/families.snapshot.json` festgehalten; deren
Originaldaten wurden nicht geändert. Cleir, Ghaiscioch und Dal Ceardaiocht bleiben
in Sinsear unter Coimhthioch verschachtelt.

Die ursprünglich unbenannte Fläche mit Quellenmarker
`397f74eb-6a69-4e7a-9ef3-0b435b2ede97` ist laut ausdrücklicher Nutzerbestätigung
**Herrschaft Tir na Fancha**, Haus **Na Mhuir**. Ihr veralteter Buarstrath-Text
wurde nicht als Regionsbeschreibung übernommen. Der unveränderte Rohbeleg bleibt
im Quellenarchiv erhalten.

## Datenstand und Schutz

Die 24 gelieferten HTML-Artikel sind unverändert als `sources/article-00.html`
bis `article-23.html` archiviert. Das Artikel- und Bildermanifest enthält
SHA-256-Prüfsummen und ursprüngliche Dateipfade. Alte HTML-Gestaltung wird nicht
in die Kartenoberfläche übernommen.

Dieser Arbeitsschritt umfasst Karten und Regionsgrenzen. Eine vollständige
Siedlungsmarker-/Artikelmigration ist noch kein Bestandteil dieser Datensätze;
`pins` bleibt dafür leer. Die Quelllisten sind für die spätere Übertragung gesichert.
Bestehende Karten anderer Regionen wurden nicht geändert.

`node Karten/tools/build-leitheach.mjs --check` prüft Daten und Register gegen die
Quellen. Der Builder verweigert das Überschreiben von bereits manuell veränderten
Kartendaten anhand ihres generierten State-Hashes. Browserentwürfe bleiben im
bisherigen separaten Speichersystem. Es wurde nichts gepusht oder veröffentlicht.
