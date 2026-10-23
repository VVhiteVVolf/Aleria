# Krähenmoor – Übernahme und Quellenabgleich

Stand: 22. Oktober 2026. Lokal erstellt; kein Push und kein Deployment.

## Ergebnis

- 126 Einträge der [World-Anvil-Karte](https://www.worldanvil.com/world/map/2209b401-8956-4ddf-88c6-99d4c9416391/edit) über Chrome vollständig gelesen: Markierungsliste sowie jedes einzelne Bearbeitungsformular.
- 113 Ortsmarker mit dauerhafter World-Anvil-Marker-ID übernommen. Die übrigen 13 Einträge sind Gebietsflächen oder Verwaltungsmarkierungen; sie bleiben im Quellenarchiv und erzeugen keine zusätzlichen Ortspins.
- 102 vollständige vorhandene Beschreibungen übernommen. Elf Marker besitzen im Original keinen Beschreibungstext; dafür wurden keine Texte erfunden.
- Neun HTML-Dateien archiviert. Rabenweide wurde zweimal bytegleich geliefert, daher liegen acht verschiedene Herrschaftsartikel vor.
- Elf Seiten verwenden die gemeinsame Herrschaftsoberfläche. Nebelmoor und die beiden Verwaltungsbereiche der Schimmerküste sind aus den übergeordneten Artikeln und der Regionskarte abgeleitet; zusätzliche Räte wurden nicht erfunden.

## Verschachtelung

| Ebene | Darstellung |
| --- | --- |
| Jarltum Krähenmoor | Nebelmoor, Kaltherz, Feuerherz, Rabenweide, Schimmerküste, Silberblut-Verwaltung, Blutstahl-Verwaltung und Schwarzfjord mit ihren eigenen Ortsregistern: zusammen 96 Orte. |
| Nebelmoor | Varangr-Eigenverwaltung und die eigenen Ortsverbände von Kaltherz und Feuerherz. |
| Rabenweide | 25 eigene Orte; Link zum untergeordneten Rabenforst. Dessen neun Orte werden hier nicht ausgeklappt. |
| Rabenforst | Neun Orte, einschließlich des örtlichen Goldglanz-Tavernenbetriebs. |
| Schimmerküste | Gemeinsamer Hauptort Silberquell; getrennte Register der Silberblut mit acht und der Blutstahl mit zehn Orten; Link zum Goldglanz-Hesirentum. |
| Goldglanz | Acht eigene Orte einschließlich der beiden Exklaven Edelstatt und Honigberg in Rabenweide. |

Rabenforst und das Goldglanz-Hesirentum werden auf der Jarltumsseite nicht als zusätzliche Ortslisten ausgegeben. Die Karte enthält weiterhin sämtliche 113 Ortsmarker.

Die zuletzt am 22. Oktober um 13:42 Uhr nachgereichte Regionskarte benennt das südliche Waldgebiet korrekt **Hesirentum Rabenforst** und korrigiert die pinke Feuerherz-Beschriftung. Gebietsgrenzen und Ortsverbindungen bleiben erhalten. Rabenforst bleibt unter Rabenweide verschachtelt; der Clan Vragi wird nicht aufgewertet. Die zwischenzeitliche Bezeichnung „Thanentum Rabenforst“ wurde vom Nutzer als Versehen bestätigt und im gelieferten Bild korrigiert.

Schimmerküste behält einen gemeinsamen Thanenrat. Die Silberblut- und Blutstahl-Verwaltung zeigen denselben Rat mit einem ausdrücklichen Hinweis auf dessen gemeinsame Zuständigkeit. Die aktuelle Namensform **Thongvar Silberblut** stammt aus der vorhandenen Familienakte; der Altartikel schreibt „Thangvar“.

## Koordinaten und Kartenbilder

Alle drei gelieferten PNGs haben **4096 × 2418 Pixel**. Übernommen wurden ausschließlich diese drei aktuellen Karten aus `C:\Users\fhg_r\Downloads\Jarltum Krähenmoor`:

- `Das Jarltum von Moortal - Normal.png`
- `Das Jarltum von Moortal - Regionen.png`
- `Das Jarltum von Moortal - Markierungen.png`

Die World-Anvil-Originalkoordinaten bleiben unverändert in `sourceRef.coordinates` mit Ursprung unten links erhalten. Die geprüften Zielpositionen liegen in `sourceRef.targetPosition` mit Ursprung oben links. Für die Laufzeit gilt `x = ZielX / 4096`, `y = ZielY / 2418`.

Die interaktiven Pins erscheinen auf der Normalkarte ohne doppelte eingebrannte Symbole. Die gelieferte Markerkarte ist als eigene Vergleichsebene verfügbar. Standardgröße: Dot **80**, Schrift **50**.

Besonders geprüft:

- Tempel des stillen Hügels und Zum Glänzenden Kelch sind zwei getrennte, benachbarte Zeichen.
- Helgrind liegt am eingezeichneten Grab westlich von Klingenhort. Die neue Markerkarte enthält dort kein eigenes Pinsymbol; der ursprüngliche World-Anvil-Punkt trifft die Grabarchitektur und bleibt erhalten. Helgrind wird weder mit Klingenhort noch mit Hrafngardr verschmolzen.
- Dvalgrind ist nach seinem grünen Grabzeichen als Hügelgrab eingeordnet. Ein Kreaturenhort wurde daraus nicht abgeleitet.

## Zugehörigkeit und Heraldik

- Tyrsokov und Stjarvund gehören gemäß pinkem Ortsverband zu Feuerherz; Krokskov liegt in der unmittelbaren Verwaltung Rabenweides. Die gemeinsamen alten Sumpfsiedlungstexte wurden auf die einzelnen Orte bezogen und hinsichtlich dieser Zugehörigkeiten korrigiert.
- Trollmoor bleibt eine Ruine, liegt aber im Feuerherz-Bereich. Seine Kriegsgeschichte bleibt erhalten.
- Ehrenberg gehört laut gelber Verbindung zur Varangr-Eigenverwaltung. Der Silberblut-Verweis wurde sowohl im Ortstext als auch in der Schimmerküsten-Wirtschaft korrigiert.
- Edelstatt und Honigberg sind ausdrücklich bezeichnete Goldglanz-Exklaven in Rabenweide. Goldglanz ist beiden Thanenclans, Blutstahl und Silberblut, lehnspflichtig.
- Silberquell zeigt beide Clanwappen und beide Verknüpfungen. Die getrennten Verwaltungsbereiche verwenden ihre jeweiligen Clanwappen und das gemeinsame vorhandene Schimmerküstenbanner.
- Ísbjarnbolg und Glýmborg führen Balthors Söhne; Klingenhort die Windreiter; Nebelfanglager die Jagdklingen; Liedhafen die Skalden Akademie. Ihre Symbole werden nicht durch das Wappen des geographischen Gastclans ersetzt.
- Zum Glänzenden Kelch bleibt ein Goldglanz-Betrieb innerhalb Rabenforsts.
- Das Landgut des Jarls bleibt Varangr-Besitz innerhalb Rabenweides.

Die vorhandenen lokalen Familienakten liefern Clanwappen, Ränge und kanonische Personenporträts. Lebensdaten, Online-IDs und bestehende Familienakten wurden nicht verändert. Rislaug Goldzunge und Snorbrand Goldhand sind im Altartikel benannt, besitzen in den vorhandenen Familienakten jedoch noch keinen zuordenbaren Personeneintrag; ihre Namen bleiben erhalten, mit lokaler Silhouette.

## Offene Angaben

**Schwarzstolz geklärt:** Der Nutzer hat den Clan aus Eldvik am 22. Oktober ausdrücklich als **Huskarlclan** bestätigt. Die alte Einordnung unter „Hesirenclans“ ist überholt. Familienprofil und Schwarzfjord-Register sind korrigiert; eine zusätzliche Herrschaftsseite ist nicht erforderlich. Weitere Familienangehörige und der persönliche Lehnsherr bleiben unausgearbeitet.

Diese elf Originalmarker enthalten nur ihren Namen und keine Beschreibung:

| Ort | Heutige Einordnung |
| --- | --- |
| Grytvund | Siedlungsruine · Kaltherz |
| Jarnskov | Siedlungsruine · Kaltherz |
| Dvalgrind | Hügelgrab · Nebelmoor |
| Silberquell | Gemeinsame Hauptstadt · Schimmerküste |
| Dunkelblickwark | Hafensiedlung · Silberblut |
| Fenrirs Zahn | Schiffswrack · Schwarzfjord |
| Wodins Blick | Schiffswrack · Schwarzfjord |
| Nebelsegler | Schiffswrack · Schwarzfjord |
| Schlangenzahn | Schiffswrack · Blutstahl |
| Seelenfresser | Schiffswrack · Blutstahl |
| Vargsnid | Schiffswrack · Blutstahl |

Die betreffenden Kartenkarteien enthalten einen Quellenhinweis. Es gibt keine zusätzlichen unbenannten Ortsmarker.

## Prüfung und Wiederholbarkeit

- 58 Integrationstests für Krähenmoor, Schwarzfenn, Ivarsheim, Roriksheim und Aldrimar sowie drei gezielte Prüfungen des Altcode-Importers bestanden.
- Alle elf Seiten im Chrome-Browser geladen: erwartete Ortszahlen, keine fehlenden Bilddateien und kein horizontaler Seitenüberlauf in den geprüften Desktopansichten.
- Karte: 113 sichtbare interaktive Pins; alle drei Kartenbilder in Originalgröße geladen; Suche und gemeinsame Silberquell-Karteikarte mit beiden Clans geprüft.
- Kartenregister: 32 Karten, keine Strukturfehler. 174 bereits bestehende Hinweise zu mehrfach verwendeten Bildern bleiben unverändert.
- Die 29 vor Beginn vorhandenen Kartensnapshots wurden per SHA-256 verglichen und blieben bytegleich. Quellen und Nachweise liegen unter `sources/` beziehungsweise `diagnostics/kraehenmoor-2026-10-22/`.
- Der gemeinsame HTML-Importer liest verschachtelte Listen nun blockweise, damit Kindtexte nicht zugleich im Elternabsatz und nochmals einzeln erscheinen. Die Original-HTML-Dateien bleiben unverändert archiviert.

Prüfbefehle:

```text
node Kontinente/scripts/build-kraehenmoor.mjs --check
node Karten/tools/import-kraehenmoor.mjs
node --test --experimental-test-isolation=none Kontinente/tests/kraehenmoor.test.mjs
python Kontinente/tests/legacy-territory-article.test.py
```

Der Import mit `--write` lehnt bereits bearbeitete Karten ab. Spätere Änderungen müssen bestehende Pins und Revisionen erhalten.
