# Goldmund-Assets aufbereiten

Die Bildgestaltung erfolgt über die in `../art-direction.json` dokumentierten
Bildaufträge. Die anschließend ausdrücklich erlaubte technische Aufbereitung
bereinigt den Alphakanal, ergänzt transparenten Außenabstand und erzeugt
WebP-Vorschauen. RGB-Pixel und Motive bleiben unverändert. Benötigt werden
Python, Pillow und NumPy.

Gelieferte Bilder bytegenau archivieren und WebP-Vorschauen erzeugen:

```powershell
python Vorschau/Goldmund/scripts/prepare_assets.py source --source-dir 'C:\Users\fhg_r\Downloads\Goldmund'
```

Vorhandene Originale mit abweichenden Bytes werden nicht überschrieben.
Die alten Wappen von Goldveld, Lanette und Roden bleiben zusätzlich unter
`assets/source-crests/` als Vergleichsvorschauen erhalten. Die aktive Fassung
unter `assets/crests/` darf anschließend aus einem neuen Bildauftrag entstehen.

Neu erzeugte Originale zunächst als `assets/generated/{id}.png` ablegen und
anschließend nach Bildart aufbereiten; mehrere IDs pro Argument sind möglich.
Diese Generatororiginale bleiben unverändert. Die aktive PNG-Fassung entsteht
unter `assets/production/{id}.png`; erst daraus wird das WebP erzeugt:

```powershell
python Vorschau/Goldmund/scripts/prepare_assets.py generated --crest roden goldveld lanette --realm sonnenkrone --banner thronmark
python Vorschau/Goldmund/scripts/prepare_assets.py pending
python Vorschau/Goldmund/scripts/prepare_assets.py audit
```

`pending` gleicht alle Bildaufträge aus `art-direction.json` ab und verarbeitet
nur neue oder geänderte, bereits vorhandene Generator-PNGs. Fehlende Aufträge
werden aufgelistet; unveränderte Produktionsdateien bleiben unangetastet.

Geschlossene Wappen verwenden den vorhandenen gemeinsamen Normalisierer
`AleriaAlmanach/scripts/heraldic_emblem_alpha.py`. Ihre verbundenen Silhouetten
und eingeschlossenen Innenflächen werden deckend; transparente Außenpixel
bleiben transparent. Banner behalten alle Vordergrundteile und offene
Zwischenräume zwischen Stange, Schnüren und Stoff. Eine zugeschnittene Vorlage
oder große überstehende Ornamente benötigen eine Sichtprüfung. Die am 26.
Oktober anhand von Roden und Goldveld freigegebene technische Kreisfreistellung
vereinheitlicht den äußeren Rand zu einem exakt runden, vollständig innen
liegenden Kreis. Sie legt keine zuvor transparenten RGB-Pixel frei und ändert
keine RGB-Pixel. Der mögliche Verlust dünner äußerer Randpixel wird protokolliert.

`assets.source.json` dokumentiert die zwölf gelieferten PNGs mit Quellnamen,
SHA256 und Maßen von Original und Vorschau. `assets.generated.json` dokumentiert
Generatororiginale, aktive Produktions-PNGs und WebPs separat, einschließlich
SHA256, Padding und Alpha-Berichten. `audit` prüft zusätzlich jeden erhaltenen
RGB-Pixel gegen das Generatororiginal sowie vollständig deckende Innenflächen.
Die Sichtprüfung von Rundheit und Motivgestaltung bleibt erforderlich.

Eine exakte innere Kreiskontur lässt sich vor einer Entscheidung separat prüfen:

```powershell
python Vorschau/Goldmund/scripts/prepare_assets.py circle-probe --id roden goldveld
```

Diese Proben unter `diagnostics/goldmund/circle-probes/` ersetzen keine aktive Datei. Der
Bericht nennt den maximalen Randverlust; die JPEG-Ansicht auf neutralem Grau
zeigt die tatsächliche Alphakomposition zuverlässig. Ein Freigabeschnitt darf
keine wesentlichen Symbole oder Rahmenornamente entfernen.

Kontaktbögen für die abschließende Sichtprüfung auf neutralgrauem Grund:

```powershell
python Vorschau/Goldmund/scripts/preview_assets.py --category crests realm
python Vorschau/Goldmund/scripts/preview_assets.py --category banners --columns 6
```

Diese Vorschaubilder bleiben unter `diagnostics/goldmund/final-previews/` und
verändern keine aktiven Bilddateien.

Wiederholte Aufbereitung aktualisiert die Vorschauen und Manifeste. Die
Originaldateien in Downloads werden ausschließlich gelesen. Das Skript greift
weder auf Weltregister noch auf Online-Daten zu.
