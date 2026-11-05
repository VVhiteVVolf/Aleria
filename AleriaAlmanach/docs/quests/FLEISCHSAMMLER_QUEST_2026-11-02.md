# Fleischsammler · öffentliche Questvorbereitung

Nutzerauftrag vom 2. November 2026. Die vorhandene Veröffentlichung
`gwynthor-fleischsammler` bleibt eine gemeinsame Quest aus vier Fallblättern.
Die Questseite verwendet ausschließlich die dort bekanntgegebenen Fallangaben.

## Öffentliche Darstellung

- Titel: Der Fleischsammler aus Gwynthors Bannkreis.
- Kontaktpersonen: Neithon Draig, Meredydd Gwyllach, Sir Ferydnand Gafyr und
  auf ergänzenden Nutzerauftrag Rhydric Argall, Hauptmann von Caer Ysgellfor;
  bestehende Weltpersonenkennungen und Originalporträts bleiben erhalten.
- Avatar und Titelillustration stammen ausschließlich vom öffentlichen Sinnbild.
  Die Bildunterschrift macht deutlich, dass keine Zeugendarstellung vorliegt.
- Bekannte Umstände, Warnung, Meldeweg und Belohnungsbedingungen folgen dem
  vierseitigen Aushang. Es gibt keine vorbereiteten Begegnungen oder Enthüllungen.
- Acht neue Familien stehen neutral als örtliche Informationsquellen mit
  Familienwappen und Verweisen auf ihre Akten und Wohnorte zur Verfügung.
  Familiäre Verluste und die zusätzlichen Ortsgeschichten sind kein Questtext.
- Rhydrics Questkarte verwendet nur sein Amt und den örtlichen Wachdienst.
  Seine Familiengeschichte, Gwenellas Affäre und Perwyns Abstammung stehen in
  den Personenakten und werden nicht in den Questtext übernommen.

## Kartenbezug

Die sieben vom Nutzer beschriebenen Standorte sind die bestehenden Markierungen
074, 086, 091, 092, 107, 115 und 118. Die Questreferenz verwendet den normalen
Kartenhintergrund und einen kreisförmigen SVG-Ausschnitt der nativen Karte:
8192 × 6300, Mittelpunkt (6028, 2784), Radius 1024. Die Originalbilder und
Markerkoordinaten bleiben erhalten. Der Ausschnitt bezeichnet die benannten
Orte im östlichen Umland und behauptet keinen bekannten Täterstandort.

Die geometrische Quelle liegt bei der Karte in
`fleischsammler-area.source.json`. Die ausführlicheren, ausdrücklich beauftragten
Ortsprofile liegen separat in `fleischsammler-localities.source.json` und werden
von der Questvorbereitung nicht eingelesen.

## Verantwortlichkeiten

- `scripts/build-fleischsammler-quest.mjs` projiziert öffentliche Aushänge und
  den neutralen Orts-/Familienindex in die optionale Questvorbereitung.
- `modules/quests/quest-preparations/` enthält getrennte generierte Ausgaben
  pro Abenteuer. `quest-authored-dossiers.js` setzt sie ohne fremde Fachlogik zusammen.
- `quest-area-model.js`, `quest-area-view.js` und `quest-area.css` besitzen
  Gebietsausschnitt und örtliche Quellenkarten. Reiseplanung bleibt unabhängig.
- `Stammbäume/assets/js/data/gwynthor-fleischsammler/` besitzt die Familien.
  Alle stehen nach ihrem tatsächlichen Wohnort unter Gwynthor. Marchwerns
  Dienstbindung an Haus Wyrm ist davon getrennt.
- `Karten/tools/build-fleischsammler-localities.mjs` aktualisiert ausschließlich
  die sieben beschriebenen Kartenakten und prüft ihre stabilen Positionen.
- `modules/fleischsammler-argall/` besitzt die neuen Personenangaben und den
  neutralen Questkontakt. Die Argall-Familienquelle besitzt die Beziehungen:
  Rhydric ist Dyrwyns elf Jahre jüngerer Bruder und Vetter Uthyrs und Brinthans.
  Perwyn bleibt das siebzehnjährige biologische Kind der geschiedenen Ehe mit
  Gwenella. Ihre aktive Affäre mit Maelor trägt exakt den Vermerk
  „Durchgebrannt nach Aberon“. Vater und Sohn wohnen in Caer Ysgellfor,
  Gwenella und Maelor in Aberon; der Hausstammsitz bleibt Llysfaen.
- `scripts/build-fleischsammler-argall.mjs` importiert ausschließlich die vier
  neuen Personen. Andere Akten, Inventare und Live-Ressourcen bleiben erhalten.
  Madog Ysgellfor bleibt ziviler Leiter der Vorratsannahme. Die örtliche Familie
  wird durch Rhydrics Hauptmannsamt nicht ersetzt.

## Aktualisierung und Prüfung

Im Almanach `npm run build:quests` und `npm run check:quests` verwenden.
Daneben die Ortsakten und das bestehende Kartenwappenregister prüfen:

```text
node Karten/tools/build-fleischsammler-localities.mjs --check
node Karten/tools/build-households.mjs --check
node AleriaAlmanach/scripts/build-fleischsammler-argall.mjs --check
node --test --experimental-test-isolation=none AleriaAlmanach/tests/fleischsammler-quest.test.mjs
node --test --experimental-test-isolation=none Stammbäume/tests/gwynthor-fleischsammler.test.js Karten/tests/fleischsammler-map.test.mjs
```

Die Veröffentlichung erfolgt über den bestehenden Aleria-Releaseweg nach der
jeweils geltenden Freigabe. Private Fallakten sind keine Buildquelle.

Die acht Wappen wurden mit dem integrierten Bildgenerator nach ausdrücklicher
Entwurfsauswahl erstellt. Prompts, unveränderte Generatororiginale und
Produktionsprüfung liegen unter `diagnostics/fleischsammler-quest-20261102/`.
`scripts/prepare-fleischsammler-emblems.py` verwendet die bestehende gemeinsame
Wappenaufbereitung für deckende Innenflächen, exakte Kreisform und Randabstand;
die RGB-Pixel bleiben erhalten. Quellen und Prüfmaterial werden nicht statisch
ausgeliefert.
