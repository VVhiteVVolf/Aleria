# Küstenchroniken: Vennyr, Leitheach und Piraterie

Lokale, experimentelle Erweiterung vom 24.–25. Oktober 2026. Kein Push, Deploy oder Firebase-Import.

## Inhalt und Verantwortung

- `Archiv/Quellen/kuestenchroniken-2026-10-24`: alle 18 unveränderten Anhänge, Lesefassungen, Prüfsummen, heruntergeladene Bildvorlagen und die gelesene World-Anvil-Karte mit ihren 17 Markierungen.
- `sources.json`: vollständiger strukturierter Import. Quelle 15 ist eine erhaltene Dublette von 11.
- `edition.json` und `coastal-sources.mjs`: nachvollziehbare, gegen den exakten Ausgangstext geprüfte Korrekturen. Die nachfolgende Zeitrevision verwendet `leitheach-source-edition.mjs` und den vorherigen Textstand aus `leitheach-source-revision.json`. Originaldateien niemals redaktionell überschreiben.
- `pirates.mjs`: gemeinsame Quelle der 21 benannten Piraten-Gruppierungen, Modul-IDs und gegenseitigen Links. Vier gleichrangige Großpiraten; darunter 5 Klauen-, 9 Schwarzblut- und 3 Sirenenzahn-Banden. Keine benannte Blutsegel-Unterbande überliefert.
- `Ereignisse/modules/coastal-history`: zwei getrennte Hauptdossiers, sieben vorbereitete Einzelberichte, Karte und Fraktionsdialoge.
- `Piraterie/modules`: Banden- und Fraktionsseiten sowie Generator der vorbereiteten Almanach-Module. Keine eigene Kopie der Bandeninhalte.
- `record-render.mjs`, `record.css`, `record-dialogs.mjs`: gemeinsame Leseseite mit rechter kompakter Infotabelle, Quellenbuch und gekapselten Dialogen. Auf schmalen Bildschirmen steht die Tabelle über dem Lesetext.
- `leitheach-route.json`, `map-calibration.md`: Kartenabgleich und Entfernungsanker. Die Kalibrierung besitzt keine eigenen Zeitdaten. `leitheach-route.mjs` ergänzt die Chronologie; bestehende Karten-Pins werden nicht verändert.
- `leitheach-chronology.json` und `.mjs`: zentrale zeitliche Arbeitsfassung des siebentägigen Raubzugs, mit getrennten Angriffsfenstern, Fahrtabschnitten und Ruhepausen. [Rechenweg und Grenzen](leitheach-chronology.md).

## Grenzen der Ausarbeitung

Tag und Monat beider Kriege sind nicht bekannt. Die Vennyr-Porträts zeigen 1720, ohne eine Jahreszeit festzulegen. Jygallag ist etwa 50, Rhodri etwa 58, Rag etwa 63. Ketill Draca hat keine verbindliche Bildvorlage oder belegtes Geburtsjahr; sein Porträt ist als Rekonstruktion gekennzeichnet. Rhodri wird nach seiner Verwundung von 1719 zurückgezogen dargestellt.

Am 25.10.2026 wurde der Ablauf auf ausdrücklichen Nutzerwunsch zeitlich neu gefasst: fünf Raubzugstage bis Dun Laog, anschließend zwei Tage beladener Rückzug. Die Referenz Dun Athar–Dunbaile beträgt nach Nutzerangabe ungefähr 30 km oder mehr. Der Zeitplan rechnet mit 35 km, prüft 30–40 km und verwendet einen Wegzuschlag von 35 %. Dies sind Arbeitsannahmen, keine präzise Vermessung. Die beiden Siedlungspaare werden an unterschiedlichen Tagen angegriffen; die genaue Schiffsaufteilung bleibt offen. Tag und Monat bleiben unbekannt, und die relativen Raubzugstage verändern keine Play-Tageszählung. Bradans und Fionnáns Gespräch gehört nach 1740, sieben Jahre nach dem Raubzug.

Die nur namentlich bekannten Banden erhalten symbolische Bilder und vorbereitete Seiten. Es werden keine Anführer, Stützpunkte, Glaubensrichtungen oder zusätzlichen Taten erfunden. Die Schwarzblut-Marodeure haben keine zentrale Führung; leere „König der See“-Vorlagen erzeugen deshalb weder eine Figur noch eine zusätzliche Bande.

**Bildkorrektur: keine Elfen.** Die Alben in den neuen Piratenszenen sehen menschlich aus, mit normalen menschlichen Ohren. Die nicht verwendeten Erstfassungen von Schwarzbucht und Flutbeißern sind als verworfen gekennzeichnet. Es gibt 22 aktive neue Bilder und drei neue native Pergament-Schlachtmarker sowie zwei passende Gliederungsicons.

## Bearbeitung und Prüfung

Im Verzeichnis `AleriaAlmanach`:

```text
npm run build:coastal-history
npm run check:coastal-history
npm run test:coastal-history
```

Der gemeinsame Ereignis-Build regeneriert auch die Küstenchroniken. Der Almanach verwendet `modules/piracy/piracy-entries.js` vor `data/sections.js`; der Generator fügt nur neue vorbereitete Standardmodule hinzu. Keine vorhandenen gespeicherten Module und keine Live-Daten werden migriert oder überschrieben.

Neue Bilder liegen unter `Ereignisse/assets/coastal-history`. Vollständige tatsächlich verwendete Prompts und Referenzen stehen in `image-production.json`, Bilddateien und Prüfsummen in `image-assets.json`. Original-PNGs bleiben erhalten; Seiten verwenden optimierte WebP-Dateien. Die neuen SVG-Icons erweitern den bestehenden Pergamentrahmen, keine generierten Wappen.

Die lokale Vite-Konfiguration kennt sämtliche neuen Seiten und erhält die aus klassischen Modulstrings referenzierten Bildpfade sowie die Archiv-/Quellenlinks im Build. Die alten Prätendenten-Dossiers bleiben eigenständig.
