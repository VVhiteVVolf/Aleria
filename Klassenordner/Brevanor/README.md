# Brevanor · Klassenabteilung

Sieben vom Nutzer benannte Klassen vom 30. Oktober 2026:
Kerant (Miliz), Breval (vielseitiger Ritter), Hastrel (Stangenwaffe), Cantrel
(Kampfbarde), Havren (Seeritter), Silvain (Fernkämpfer), Cabrant (Reiter).
Belgrant wurde während der Arbeit ausdrücklich gestrichen.

Die einzelnen `klasse.json` sind mit `contentStatus: "not-authored"` vollständig
unausgefüllt. Zehn Kapitel pro Klasse bleiben `pending` mit leerem HTML. Es gibt
keine erfundenen Fähigkeiten, Werte oder Stufenvergaben. Die gemeinsame
Kulturseiten-Vorlage stellt den offenen Stand dar und besitzt die Navigation.

`kultur.js` ist die einzige Quelle der elf Adelstitel und ihrer Entsprechungen.
Sowohl der Hintergrund im Klassenregister als auch die Klassenseiten verwenden
diese Daten. Cavalier ist ein Adelsrang, Cabrant eine Klasse.

## Eigener Icon-Stil

Die flachen Comicicons verwenden **`fantasy-class-icon`** und die tatsächlich
angesehenen Morgorn-Icons. Dieser Stil ist ausdrücklich vom normalen
`fantasy-rpg-character` für große Krieger- und Hausfiguren getrennt. Türkis,
Silbergrau und Schwarz bestimmen die Ausrüstung; die kulturelle Gestaltung
orientiert sich an der Ritterelite des 12. Jahrhunderts.

Die früheren ernsten und plastischen Versuche bleiben Generatorquellen. Nur die
mit `-comic.png` bezeichneten finalen Motive führen in die aktuellen
Produktions-PNGs und WebP-Icons. Belgrant erhält keine aktive Bilddatei oder Seite.
`icon-prompts.json` enthält den aktuellen Katalog für sieben Motive. Frühere
Promptkataloge dokumentieren die verworfenen Stilversuche; die tatsächlichen
Aufrufe stehen in `generation-receipts.json`.

```text
node Klassenordner/scripts/prepare-brevanor-icons.mjs
python -B Klassenordner/scripts/prepare-brevanor-icons.py
python -B Klassenordner/scripts/prepare-brevanor-icons.py --audit
node Klassenordner/scripts/build-culture-classes.mjs
node AleriaAlmanach/scripts/sync-character-archive-pages.mjs
```

Die Bildgenerierung verwendet das eingebaute `image_gen`. Die fortgeltend
genehmigte Alpha-Bereinigung verändert ausschließlich Transparenz; alle
Original-RGB-Werte bleiben nachweisbar erhalten. Der Kontaktbogen und die
Browserprüfung liegen unter `diagnostics/brevanor-classes/`. Generatorarchive
bleiben im Repository und werden nicht statisch veröffentlicht.
