# Albische Lehensgliederung

Die Prüfung vom 24. Oktober 2026 umfasst Leitheach, Aislearneach, Dunfal,
Blaithneach, Uathneach, Faelaorn und das historische Ceitheach. Moinneach,
Iathneach, Deitheach, Lichthain und der Hain der Druiden bleiben auf ausdrückliche
Nutzeranweisung ausgelassen.

## Verbindliche Einordnung

- Jeder bestehende herrschende Clan oberhalb eines Lairds hat eine eigene Seite.
- Eigene Gebiete und Bannkreise heißen unabhängig vom Rang `Tir na …`.
  Ein gemeinsamer Stadtsitz schließt ein belegtes Außengebiet nicht aus.
- Rein städtische Lairds am Sitz ihres Lehnsherrn heißen `Herrschaft der …`.
  Sie übernehmen weder den gesamten Stadtmarker noch ein erfundenes Flächengebiet.
- Übergeordnete Seiten verlinken ihre unmittelbaren Unterherrschaften. Deren
  Ortsregister werden dort nicht gemeinsam ausgeklappt.
- Bekannte Familien-, Personen-, Karten- und Markerkennungen sowie veröffentlichte
  URLs bleiben bestehen. Ein neuer Gebietsname benennt keinen Ort um.

Die sieben Fürstentümer besitzen zusammen 148 Seiten. 104 untergeordnete
Herrschaften wurden nach diesem Schema geprüft. Uathneach hat nun 27 statt
13 Seiten; in Leitheach wurde die städtische Herrschaft der Dál T’Saor ergänzt.

## Datenverantwortung

Die geprüften Namensentscheidungen, Bedeutungen und Bannerzuordnungen stehen in
`Stammbäume/assets/js/modules/albic-territories/fiefs.source.json`.
Die jeweiligen Gebietskataloge unter `Karten/<Fürstentum>/territories.import.json`
führen weiterhin Hierarchie, stabile Kennungen und öffentliche Ziele.

`review-albic-territories.mjs` gleicht die Seitendaten und den daraus erzeugten
Stammbaumindex ab. Das gemeinsame Modul `family-placements.js` wendet ausschließlich
Orts- und Gebietsmetadaten an der bestehenden Registergrenze an. Rang, unmittelbare
Lehnsherren und Genealogien werden dabei nicht geändert. Zusätzliche Ansichten
vertriebener Clans behalten ihre eigenen Ränge und Zugehörigkeiten.

Uathneach verwendet weiterhin seine gemeinsame, freigegebene Strukturquelle und
seinen eigenen Seitengenerator. Eigene Laird-Lehen sind dort nun ausdrücklich
getrennt. Broch an Reithe bleibt ein unmittelbares Sonderlehen der Mac Ard’Lága
innerhalb der geographischen Kartenregion Tir na Seolta.

## Banner

Vorhandene passende Regionalbanner bleiben erhalten. 72 fehlende Gebietszeichen
sind eigenständige quadratische SVG-Banner mit dem jeweils vorhandenen Clanwappen.
Die Wappen werden dabei nicht neu gezeichnet. Der Erzeuger
`Stammbäume/scripts/albic-territories/banner-assets.py` bettet eine verkleinerte
Kopie des originalen Emblems in eine schlichte Tuchform ein. Die Banner benötigen
keine externen Bildanfragen; Quellen und Prüfsummen stehen in
`banner-assets.source.json` neben dem Namenskatalog.

## Historische und ungeklärte Fälle

- Mac Suileach bleiben die früheren Herren von Tir na Gortanna. Das Gebiet wird
  nicht ein zweites Mal als gegenwärtiges Mor-Tiarna-Lehen angelegt.
- An’Iomrach werden als frühere Herren von Broch an Clais weitergeführt. Die
  gegenwärtige Verwaltung der Sidhe Somhairle und Conan Iomrachs bestehende
  Familiengeschichte bleiben erhalten.
- Ceitheach bleibt historisch; besetzte und vertriebene Faelaorn-Clans erhalten
  durch neue Gebietsbezeichnungen keine Gebiete zurück.
- Die drei noch nicht zugeordneten Dunfal-Flächen I–III bleiben offen. Die
  städtischen Seiten von Anbhair, Casur und Aonghusa weisen ihnen keine Fläche zu.
- Die drei neuen Uathneach-Clans mit noch offenem Rang erhalten Seiten für ihre
  belegten eigenen Stadtsitze. Ihr Rang bleibt ausdrücklich offen.
- Kirchliche Gebiete, Fianna und bürgerliche Septen werden nicht zu Adelsclans
  umgedeutet. Bereits vorhandene Organisationsseiten bleiben bestehen.

## Aktualisieren und prüfen

Nach einer Änderung an Namen oder Bannerzuordnungen:

1. Falls Banner betroffen sind: `python Stammbäume/scripts/albic-territories/banner-assets.py`.
2. `node Kontinente/scripts/review-albic-territories.mjs`.
3. `node Karten/tools/sync-albic-territory-labels.mjs`.
4. Bei Leitheach zusätzlich `node Karten/tools/import-leitheach-source.mjs`.
5. Die zuständigen Kartengeneratoren und anschließend die sieben Seitengeneratoren ausführen.
6. `node Karten/tools/build-households.mjs` und `node Kontinente/scripts/build-alben.mjs`.

Die Generatoren unterstützen `--check`. Die neuen Regressionstests in
`Kontinente/tests/albic-fief-schema.test.mjs` prüfen Schema, Verschachtelung,
Darstellung und die unveränderten geschützten Daten aller 23 Karten. Die frühere
vollständige Familiensicherung bleibt erhalten; eine separate, zunächst gegen
diesen Originalstand geprüfte Metadatenfreigabe schützt weiterhin Genealogien,
Ränge, Lehnsherren und Personenportraits aller 538 zuvor erfassten Familienakten.
Reine Hausbiografie-Darstellungen und deren Migrationsversionen werden von den
Prüfungen ihres eigenen Features geschützt; sie verändern diese genealogische
Sicherung nicht.
