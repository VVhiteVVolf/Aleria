# Gwen Hamnett: Export der drei Avatarsets

Der Adapter wurde vorbereitet, aber noch nicht ausgeführt. Er verwendet die
unveränderte zentrale `AvatarSplitterPro_V3.py` und deren `base_boxes`,
`crop_box` und `get_crops`. Es gibt keine zweite Zuschneidelogik und keine
Neuskalierung oder Retusche.

Erwartete Original-Sheets unter `../Sheets`:

- `gwen-hamnett-20261103-set-01.png`
- `gwen-hamnett-20261103-set-02.png`
- `gwen-hamnett-20261103-set-03.png`

Vom Projektverzeichnis aus zuerst rein lesend prüfen:

```powershell
python "AleriaAlmanach/AvatarWerkstatt/Charaktere/Einzelcharaktere/Gwen Hamnett/Verarbeitung/export-gwen-20261103.py" --plan
```

Erst nach abgeschlossener Bildprüfung ausdrücklich exportieren:

```powershell
python "AleriaAlmanach/AvatarWerkstatt/Charaktere/Einzelcharaktere/Gwen Hamnett/Verarbeitung/export-gwen-20261103.py" --export
```

Alle drei Sheets werden vor dem ersten Schreibzugriff geprüft. Bestehende
Zieldateien führen zum Abbruch; der Adapter überschreibt und löscht nichts.
Die 27 einzelnen PNGs erscheinen gemeinsam im internen Personen-`Output` und
in `AvatarWerkstatt/Output/Gwen Hamnett`, jeweils direkt ohne Set-Unterordner.
Dateinamen enthalten Figur, Datum, Set und zeilenweise Panelnummer.

Die V3 arbeitet mit 3×3, Lücken 0/0 und ausgeschaltetem Autocrop. Bei durch drei
teilbaren Sheetmaßen gibt es keine Kantenkorrektur. Andernfalls gleichen die
vorhandenen V3-`adjustments` ausschließlich die Rasterrundung aus: maximal ein
Pixel am rechten beziehungsweise unteren Rand, bis alle neun Ausschnitte die
gleiche kleinste quadratische Zellgröße haben. Ein 1024er-Sheet ergibt so
341×341, ein 1536er-Sheet 512×512. Die originalen Sheets bleiben unverändert.

Jedes Set erhält eine bytegleiche Arbeitskopie in `set-0n/Benutzt` und einen
`export-receipt.json`. Der Adapter führt keinen verschiebenden GUI-Ordnerlauf
aus. Der Gesamtbeleg `export-gwen-20261103-manifest.json` enthält Quell- und
Ausgabehashes, ursprüngliche Maße, Basisraster, endgültige Koordinaten sowie
alle Kantenkorrekturen. Farben und Pixel werden durch die V3 übernommen;
die Einzelbilder werden als RGBA-PNG gespeichert.
