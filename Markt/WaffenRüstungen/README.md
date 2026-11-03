# WaffenRuestungShop

Eigenstaendige statische Shopseite fuer herkoemmliche Waffen, Ruestungen, Schilde, Erze und regionale Ausruestungsstile.

## Dateien

- `index.html` enthaelt die Seitenstruktur.
- `styles/shop.css` enthaelt Layout und Gestaltung.
- `scripts/shop.js` enthaelt Filter, Detaildialoge und Vergleich.
- `data/shop-data.js` enthaelt Waren, Preise, Bilder, Erze und Stilbilder.

Die bestehenden Waren werden in `data/shop-data.js` in `window.ARMORY_DATA.items` gepflegt.
Die zusätzlichen Waffenstandards besitzen eine gemeinsame Datenquelle unter
`AleriaAlmanach/modules/weapon-standards/weapon-standard-catalog.js`.
`node AleriaAlmanach/scripts/build-weapon-standards.mjs` aktualisiert ausschließlich
den gekennzeichneten generierten Zusatzblock. `--check` prüft ihn ohne Schreibzugriff.
Danach wird das zentrale Güterregister mit `build-item-register.mjs` erzeugt.
Alte Definitionrevisionen und persönliche Inventarwerte bleiben erhalten.

Würfelschaden, Führung und Reichweite erscheinen auf Warenkarte, Detailansicht
und Vergleich. Die Waffenformen bilden neutrale, nichtmagische Maßstäbe für
künftige Einzelstücke; besondere Manöver und Boni benötigen eigene Regeln.

Die sechs Radarachsen sind qualitative Vergleichswerte auf der Skala 1–10.
Die 35 ergänzten Waffen besitzen individuelle Profile in
`modules/weapon-standards/weapon-standard-presentation.js`, die der gemeinsame
Katalog und Generator als `weaponDisplayProfile` liefern. Die Marktansicht
verwendet diese Werte für Radar und Balken in Karte und Detailansicht.
Diese Anzeige verändert weder Würfelschaden noch Kampfeigenschaften.
