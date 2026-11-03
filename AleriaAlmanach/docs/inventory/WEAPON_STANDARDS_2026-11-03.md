# Waffenstandards: Erweiterung vom 3. November 2026

Das Zeughaus enthält 52 Waffen: die vorhandenen 17 und 35 ergänzte Basistypen. Die neuen Standards sind nichtmagisch und keiner erfundenen Nation zugeordnet. Sie bilden die Vergleichsgrundlage für spätere Unikate. Waffentyp, genaue Bauform, Würfelschaden, Reichweite, Handhabung, Ausbildung, Gewicht und fester Kupferpreis stehen gemeinsam im authored Katalog.

## Gemeinsame Datenquelle und Einbindung

- Quelle: `modules/weapon-standards/weapon-standard-catalog.js`.
- `scripts/build-weapon-standards.mjs` aktualisiert den markierten Zusatzblock in `Markt/WaffenRüstungen/data/shop-data.js`. Bestehende Waren und IDs bleiben erhalten.
- `scripts/build-item-register.mjs` übernimmt die Waffen einschließlich ausdrücklich gepflegter kg-Werte in die versionierten Standarddefinitionen. Gewichte werden nur aus den authored Waffenquellen übernommen, nicht aus allgemeiner Beschreibungssuche.
- `modules/character-archive/character-archive-standard-weapons.js` bietet die Standards als nicht ausgerüstete Waffenreferenzen an. `archiveStandardWeaponId` trennt sie von namensgleichen persönlichen oder klassengebundenen Angriffen.
- Unikatentwürfe und Inventarprojektionen erhalten die kg-Werte. Gepinnte ältere Definitionrevisionen und ausdrücklich vorhandene persönliche Werte behalten Vorrang. Es findet keine Besitzmigration statt.

## Schadens- und Ausrüstungsmaßstab

Jeder Standardangriff kostet eine Aktion, trägt keine zusätzlichen Treffer- oder Schadensboni und erzeugt keine automatischen Zusatzangriffe, Entwaffnungen, Rüstungsdurchdringungen oder Rückkehrwirkungen. Starke Bauformen bleiben im vorhandenen Maßstab: zweihändige Großklinge 1W12, Stangenwaffen 1W10, leichte Stichklingen 1W4 bis 1W6. Die Form allein ersetzt keine Klassen- oder Zweiwaffenausbildung.

Degen und Rapier teilen das Fechtprofil, sind aber als kompakte beziehungsweise längere Bauform beschrieben. Kampfklauen sind ein einzelner gefertigter Klauenhandschutz, keine natürliche Körperwaffe. Ein Paar benötigt zwei Exemplare. Eine Handarmbrust lässt im kampfbereiten Standard die zweite Hand zum Nachladen frei; ein aktiver Schild ist dabei ausgeschlossen.

| Standard | Normalisierter Typ / genaues Profil | Grundschaden | Führung | kg | Kupfer |
| --- | --- | --- | --- | ---: | ---: |
| Degen | sword / rapier | 1W8 Stich | Einhändig · Finesse | 0.9 | 650 |
| Rapier | sword / rapier | 1W8 Stich | Einhändig · Finesse | 1.1 | 850 |
| Säbel | sword / sabre | 1W8 Hieb | Einhändig | 1 | 500 |
| Dolch | dagger / dagger | 1W4 Stich | Einhändig · Finesse · Leicht · Wurfwaffe | 0.3 | 80 |
| Kurzschwert | sword / shortsword | 1W6 Stich | Einhändig · Finesse · Leicht | 0.8 | 250 |
| Parierdolch | dagger / dagger | 1W4 Stich | Einhändig · Finesse · Leicht | 0.4 | 140 |
| Kampfklauen | dagger / dagger | 1W4 Hieb | Einhändig · Finesse · Leicht | 0.5 | 250 |
| Handaxt | axe / axe | 1W6 Hieb | Einhändig · Leicht · Wurfwaffe | 0.8 | 160 |
| Enteraxt | axe / boarding-axe | 1W6 Hieb | Einhändig · Leicht | 1.1 | 220 |
| Einhand-Kriegshammer | mace / warhammer | 1W8 / 1W10 Wucht | Vielseitig | 1.4 | 400 |
| Rabenschnabel | mace / raven-beak | 1W8 Stich | Einhändig | 1.3 | 450 |
| Speer | spear / spear | 1W6 / 1W8 Stich | Vielseitig · Wurfwaffe | 1.2 | 100 |
| Partisane | polearm / partisan | 1W10 Stich | Zweihändig | 2.3 | 550 |
| Glefe | polearm / glaive | 1W10 Hieb | Zweihändig | 2.4 | 500 |
| Harpunenspeer | spear / harpoon | 1W6 Stich | Einhändig · Wurfwaffe | 1.5 | 180 |
| Kampfstab | staff / staff | 1W6 / 1W8 Wucht | Vielseitig | 1.8 | 30 |
| Schwere Armbrust | crossbow / heavy-crossbow | 1W10 Stich | Zweihändig · Munition · Nachladen | 3.5 | 800 |
| Handarmbrust | crossbow / hand-crossbow | 1W6 Stich | Einhändig · Leicht · Munition · Nachladen | 1 | 650 |
| Peitsche | other / whip | 1W4 Hieb | Einhändig · Finesse | 0.6 | 100 |
| Schleuder | other / sling | 1W4 Wucht | Einhändig · Munition | 0.1 | 20 |
| Khopesh | sword / sword | 1W8 Hieb | Einhändig | 1.3 | 600 |
| Shamshir | sword / sabre | 1W8 Hieb | Einhändig | 0.9 | 650 |
| Kukri | dagger / dagger | 1W6 Hieb | Einhändig · Leicht | 0.7 | 180 |
| Chakram | other / throwing-disc | 1W6 Hieb | Einhändig · Wurfwaffe | 0.4 | 200 |
| Katana | sword / sword | 1W8 / 1W10 Hieb | Vielseitig | 1.3 | 1000 |
| Wakizashi | sword / shortsword | 1W6 Hieb | Einhändig · Finesse · Leicht | 0.7 | 500 |
| Tantō | dagger / dagger | 1W4 Stich | Einhändig · Finesse · Leicht | 0.3 | 180 |
| Nodachi | sword / greatsword | 1W12 Hieb | Zweihändig | 2.5 | 1800 |
| Naginata | polearm / glaive | 1W10 Hieb | Zweihändig | 2.3 | 650 |
| Jian | sword / sword | 1W8 Stich | Einhändig · Finesse | 0.9 | 800 |
| Dao | sword / sabre | 1W8 Hieb | Einhändig | 1.1 | 550 |
| Yari | spear / spear | 1W8 / 1W10 Stich | Vielseitig | 2 | 450 |
| Tonfa | mace / club | 1W6 Wucht | Einhändig · Leicht | 0.6 | 100 |
| Nunchaku | mace / flail | 1W6 Wucht | Einhändig · Finesse · Leicht | 0.7 | 180 |
| Wurfstern | dagger / dagger | 1W4 Stich | Einhändig · Wurfwaffe | 0.1 | 25 |

## Qualitative Marktprofile

Die sechs Radarachsen sind Vergleichswerte auf der vorhandenen Skala von 1 bis 10. Für alle 35 Ergänzungen liegen individuelle Darstellungsprofile unter `modules/weapon-standards/weapon-standard-presentation.js`. Der gemeinsame Katalog liefert sie als `weaponDisplayProfile` an den Marktgenerator; Karten und Details verwenden dieselben Werte für Radar und Balken. Schlanke Stoßklingen, schwere Zweihänder, kurze Klauen, Stangenwaffen und Fernwaffen erhalten ihrer Form entsprechende Schwerpunkte. Diese Darstellungsdaten verändern keine Kampfeigenschaften, Würfel, Aktionskosten oder Definitionrevisionen.

## Profilfamilien

`modules/combat/combat-weapon-profile-family.js` entscheidet ausschließlich über den Zugang zu erlernten Techniken. Es ersetzt keine tatsächliche Profil-ID. Kurz- und Großschwert erfüllen eine allgemeine Schwertvoraussetzung; Armbrustvarianten erfüllen die Armbrustfamilie; ein schwerer Hammer erfüllt Kriegshammertraining. Rapierkrit, Hellebarden-Zielgrenze und Partisanenbonus prüfen weiterhin das tatsächliche Profil. Lang- und Kurzbogen sowie Speer und Harpune bleiben verschieden.

Hammer- und Flegelvarianten nutzen den vom Sanitizer unterstützten Waffentyp `mace`; die präzisen Profile `warhammer`, `raven-beak`, `flail` und `morningstar` bestimmen weiter Voraussetzungen und Icons. Gespeicherte persönliche Inventare werden nicht umgeschrieben.

## Originalbilder und reproduzierbare Exporte

`docs/art/weapon-standards/manifest.json` enthält die 35 Motive, Prompts und Dateiverweise. Die Originale bleiben unter `sources/<id>.png`. `scripts/prepare-weapon-standard-art.ps1` skaliert jedes vollständige Original proportional auf maximal 496 Pixel und zentriert es mit transparentem Außenabstand in einer 512×512-RGBA-PNG. Es gibt keinen Rasterausschnitt. Fehlende Quellen brechen die gesamte Vorbereitung vor dem Schreiben ab.

Die Vorbereitung erzeugt `preparation.json` mit Quell-, Ausgabe-, Skript- und Manifesthashes. Text-Hashes ignorieren ausschließlich BOM und CRLF/LF-Unterschiede; PNG-Hashes prüfen die unveränderten Bytes. `-Check` reproduziert alle 35 Exporte im Speicher und vergleicht sie bitgleich. Der portable Node-Check validiert dieselben Quellen und Exporte gegen den Beleg; er ist im Netlify-Task `character-reference-catalogs` enthalten. Originale und Generatorbelege bleiben Quellen und werden nicht statisch ausgeliefert.

```powershell
node AleriaAlmanach/scripts/build-weapon-standards.mjs --check
node AleriaAlmanach/scripts/build-item-register.mjs --check
& AleriaAlmanach/scripts/prepare-weapon-standard-art.ps1 -Check
node AleriaAlmanach/scripts/check-weapon-standard-art.mjs
node --test --experimental-test-isolation=none AleriaAlmanach/tests/weapon-standard-expansion.test.mjs AleriaAlmanach/tests/weapon-standard-art.test.mjs AleriaAlmanach/tests/combat-weapon-profile-family.test.mjs
```
