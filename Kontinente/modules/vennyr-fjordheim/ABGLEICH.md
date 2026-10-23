# Vennyr und Fjordheim · vorbereitete Herrschaftsseiten

Stand: 22. Oktober 2026. Lokal vorbereitet; kein Push und kein Deployment.

30 Seiten verwenden die gemeinsame Herrschaftsoberfläche, Ratskarten, Hausregister,
Ortsregister und Navigation. Das historische Vennyr und das heutige Fjordheim
besitzen getrennte Hierarchien. Auf Estryll sind beide Einstiegsseiten verlinkt.

## Vennyr: 13 Seiten

Unter dem Königreich stehen die sechs Grafschaften. Kleinere Herrschaften werden
erst innerhalb ihrer jeweiligen Grafschaft verlinkt. Ihre Ortsregister erscheinen
nicht zusätzlich auf der Reichsseite.

| Grafschaft | Herrschendes Haus | Unterherrschaft | Sitz |
| --- | --- | --- | --- |
| Tir Gogledd | Trachwyll | — | Talfronwyn |
| Tir Dwyrain | Blaidd | Baronie Tir Gwanwyn · Illygoden | Tirwedd |
| Tir Gorllewin | Dyfrgi | Ritterfürstliche Herrschaft Tir Brocair · Mochdaer | Gwyliau |
| Tir Arfordir | Arfordir | Ritterfürstliche Herrschaft Tir Gwawr · Gwaedlyd | Caer Gorwel |
| Tir Mynddoedd | Dianc | Ritterfürstliche Herrschaft Tir Traethwyn · Walwrs | Traeth |
| Tir Mynddoedd | Dianc | Ritterfürstliche Herrschaft Tir Derwlas · Lyfant | Derwyddion |
| Königliche Grafschaft Blütenland | Blodyn | Baronie Hoyers Krone · Blodyn | Lyndor |

Tir Gwanwyn, Tir Gwawr, Tir Traethwyn und Tir Derwlas sind auf Nutzerwunsch neu
ergänzte Gebietsnamen. Die Häuser, Sitze und Ränge stammen aus dem bestehenden
territorialen Stammbaumkatalog. Vier passende regionale Banner wurden mit der
integrierten Bildgenerierung erstellt. Vorhandene Hauswappen bleiben unverändert.
Prompts: `Stammbäume/assets/images/regions/Vennyr/generated-territory-banners-2026-10-22.json`.

Alle 25 Vennyr-Häuser werden auf ihrer passenden Ebene geführt. Die 13 Häuser
ohne belegten Rang behalten „Offen“. Lyndors örtliche Häuser stehen in Hoyers
Krone. Castell Asyn, Gwelladarn, Porwynfa, Maesgorn und Carnadwyth bleiben im
Blütenland-Verzeichnis ohne erfundenen örtlichen Lehnsherrn oder Kartenpunkt.

Die Schreibweisen Kyvwlch Blaidd und Mieftagoet Blodyn folgen den vorhandenen
Personenakten; die ursprünglichen HTML-Schreibweisen bleiben im Quellenarchiv.

## Fjordheim: 17 Seiten

| Jarltum | Jarlclan | Unterherrschaften |
| --- | --- | --- |
| Drachenzunge | Draca · zugleich Reikclan | Thanentum Styrkr · Vingar; Herrschaft Caer · Fjargardr |
| Langstrand | Hjort | Thanentümer Derwaskr · Helvandr, Eldrvik · Hronulf, Blomholr · Vötnar |
| Kragenküste | Ulfr | Herrschaft Askarholm · Valdruna; Thanentümer Blotfjall · Ulvar, Bjarnaströnd · Æxewindr, Llyndor · Clan offen |
| Tiefenfjord | Geit | Thanentum Strandr · Arngull |
| Windtal | Orn | Hesirentum Skerdgardr · Haming |

Die 15 Clans haben ihre belegten Wappen und Zuordnungen, aber noch keine
fingierten Familienakten. Es wurden keine Personen, Stammbäume oder Familien-IDs
für sie erzeugt. Haming bleibt Hesirenclan. Die Ränge von Valdruna und Fjargardr
bleiben offen. Der Widerspruch Fjargardr/Caer gegenüber Fjandr/Fjargardr ist auf
Caers Seite dokumentiert. Askarholm und Llyndor werden getrennt geführt.

Unterherrschaften ohne eigenes überliefertes Banner verwenden das Banner ihres
Jarltums; daneben steht jeweils das eigene Clanwappen. Llyndor erhält dadurch
keinen erfundenen nordischen Clan. „Langland“ aus dem alten Geographietext wird
nicht ohne entsprechende Herrschaftsquelle zum sechsten Jarltum erhoben.

## Stammbaum und Karten

Alle vorhandenen Kategoriepfade beider Länder besitzen ein lokales Zeichen.
Die vier neuen Banner kennzeichnen die zugehörigen Sitzkategorien. Wo kein
gesondertes Ortsbanner belegt ist, dient das lokale Haus-/Clanwappen als
Kategoriezeichen. Die vorhandenen Familienpfade, Personen, Besitzverknüpfungen
und Beziehungen bleiben unverändert; der Gesamtbestand wird durch eine
Prüfsumme in `sources/family-baseline.json` abgesichert.

Die gelieferten Dateien `Downloads/Vennyr.png` und `Downloads/Fjordheim.png`
wurden verlustfrei als WebP übernommen, jeweils 4096 × 1918 Pixel. Beide Karten
sind im Karteneditor verfügbar, mit Punktgröße 80 und Schriftgröße 50. Die
verschachtelten Herrschaften sind hinterlegt. Pins und gezeichnete Grenzflächen
bleiben leer, weil die gelieferten Bilder keine eindeutigen Namen, Koordinaten
oder Grenzen enthalten. Die Editor-Schutzprüfung erhält spätere manuelle Arbeit.

## Quellen und Wartung

- Sieben aktuelle HTML-Anhänge: `sources/article-00.html` bis `article-06.html`,
  Prüfsummen in `sources/articles.manifest.json`.
- Sechs ältere Vennyr-Grafschaftsartikel: `../vennyr/sources/`; Abgleich gegen
  `Stammbäume/assets/data/source-inventories/vennyr-territories-2026-10-05.json`.
- Belegte Einordnung: `vennyr-territorial-catalog.js` und
  `fjordheim-territorial-plan.js` im Stammbaum-Datenmodul.
- Die alten HTML-Dateien sind reine Quellen. Ihr Tabellenlayout, Farben und
  Platzhalterbilder werden nicht in die neuen Seiten übernommen.
- Inhalte und Auswahl gehören in die jeweiligen `pages.source.json` und
  `places.source.json` unter `modules/vennyr/` beziehungsweise `modules/fjordheim/`.
- Grenzen, Banner, Sitze und Oberherrschaften: jeweilige
  `Karten/<Land>/territories.import.json`.

Reproduzierbare Seiten- und Registerprüfung:

```sh
node Kontinente/scripts/build-vennyr.mjs --check
node Kontinente/scripts/build-fjordheim.mjs --check
node Karten/tools/build-prepared-realms.mjs --check
node --experimental-test-isolation=none --test Kontinente/tests/vennyr-fjordheim.test.mjs
```

Ohne `--check` erzeugen diese Befehle die eigenen Seiten und Registerblöcke neu.
Die Datenquellen werden dabei nicht aus den Altartikeln neu importiert.
Der gemeinsame Seitenbuilder erlaubt explizite Seiten-Aliasse: „fjordheim“ führt
zum Reiktum und nicht versehentlich zu einem seiner fünf Jarltümer.

Browserbelege: `diagnostics/vennyr-fjordheim-2026-10-22/`. Alle 30 Seiten wurden
über ihre Navigation geöffnet; keine fehlenden sichtbaren Bilder oder seitlichen
Überläufe. Zusätzliche Prüfung bei 390 und 768 Pixeln ohne Überlauf.
