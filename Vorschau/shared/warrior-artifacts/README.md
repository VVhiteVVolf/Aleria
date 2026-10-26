# Gemeinsame Krieger-Artefakte

`pipeline.py` besitzt die Bildaufbereitung und ihre Prüfbelege. Die dünnen
Realm-Wrapper setzen ausschließlich `root`, Manifest-`schema` und `qa_dir`;
mehrere `WarriorArtifacts`-Instanzen beeinflussen sich nicht gegenseitig.

Die Eingaben liegen unter `assets/warriors/generated/<id>.png`. Die Pipeline
erwartet 1024 × 1536 Pixel und verändert für die Produktions-PNG ausschließlich
Alpha. RGB und Generatororiginal bleiben erhalten; transparente Lücken werden
nicht gefüllt. Die vorhandene dokumentierte Transferfunktion bleibt unverändert.
Produktionsdateien, 768 × 1152 große WebP-Vorschauen und Hash-/Alpha-Belege landen
unter `assets/warriors/{production,previews}` und `assets/warriors/manifest.json`.

```text
python -B Vorschau/Goldmund/scripts/prepare_warriors.py audit --expected-count 20
python -B Vorschau/Weisenfluh/scripts/prepare_warriors.py build --ids goldkranz
python -B Vorschau/Weisenfluh/scripts/prepare_warriors.py audit --expected-count 31
python -B Vorschau/Weisenfluh/scripts/prepare_warriors.py contact
python -B Vorschau/Weisenfluh/scripts/prepare_warriors.py review goldkranz
```

`build` ohne `--ids` verarbeitet alle vorhandenen Generator-PNGs. Die bisherigen
Alpha-Optionen `--outside-threshold`, `--core-threshold` und `--edge-radius` gelten
weiter. Die Aufbereitung wird ausschließlich explizit aufgerufen.

`contact` bewahrt für bis zu 20 Figuren das bisherige 4 × 5-Layout. Größere
Bestände erhalten automatisch zusätzliche Zeilen; 31 oder 32 Figuren ergeben
4 × 8 Felder. `--columns` und `--rows` können das Raster ausdrücklich festlegen.
Ein zu kleines Raster wird abgewiesen. Prüfberichte, Kontaktbogen und
Original-/Produktionsvergleiche liegen im jeweils konfigurierten QA-Verzeichnis.

Voraussetzungen: Python, Pillow und NumPy. Gezielte Tests:

```text
python -B -m unittest discover -s Vorschau/shared/warrior-artifacts/tests
```
