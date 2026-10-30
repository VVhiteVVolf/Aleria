# Brevanor · Historische Vorbereitungsseite

Lokaler Entwurf vom 30. Oktober 2026. Geschichte und Landesbeschreibung blicken
auf das Königreich vor seiner Unterwerfung durch die Triarchie zurück.

## Umfang und Quellen

- 17 Ortsnamen für die vorhandenen Kartenzeichen, ohne neue Orte oder Grenzen.
- Drei Comteyrate und die königliche Grafschaft, dazu 17 Einzelherrschaften.
- Drei eigens erzeugte Schildformvorlagen nach der geschweiften Nutzerkontur.
- Ein eigenes antikes Lilienwappen des Fürstentums Brethneach im Geschichtsteil.
- 26 Adelshäuser: elf unbenannt gelieferte Wappen mit vorgeschlagenen Namen,
  das registrierte Haus Bielle und 14 zusätzliche Wappenentwürfe.
- 17 Sitzhäuser, drei zusätzliche Familien in Caerennes, sechs freie Häuser.
- 26 normale Hauskrieger; keine Vermischung mit den Comic-Klassenicons.

Die elf gelieferten Imgur-Dateinamen besaßen keine textuelle Hauszuordnung im
Projekt. Ihre neuen Namen, das vorgeschlagene Königshaus Aubert sowie die
Grafschaftshäuser Caudren, Guivren und Valdran sind ausdrücklich Vorschläge.
Keine Personen, Ehen oder Stammbäume werden erfunden. Bielle ist gemäß
Nutzerkorrektur vom 30. Oktober als Brenorhaus (Baronenrang) mit Rittertradition
und Weinbau eingeordnet. Desele und Lothaire bleiben bürgerlich und werden im
geschichtlichen Kontext erwähnt, ohne sie zu adeln.

`assets.source.json` sichert Prüfsummen, Abmessungen und Originalziele für alle
gelieferten Dateien sowie Bielle. Die sehr große Originalkarte liegt unter
`diagnostics/brevanor/source-originals/`; optimierte WebP-Karten bewahren die
Originalpixelgeometrie. Neue Ortsnamen werden ausschließlich als Overlays gezeigt.
Quellen wurden nicht überschrieben.

Die berichtigte Karte vom 30. Oktober wurde mit 6144 × 5429 Pixeln übernommen;
alle 17 Orts- und Beschriftungsanker wurden neu vermessen. Die erste Karte und
ihr Quellenmanifest bleiben separat unter `diagnostics/brevanor/` erhalten.
Gerain sitzt nach ausdrücklicher Nutzerkorrektur in Hervant, Kervaut in Caerennes.

Die Kulturquelle `Klassenordner/Brevanor/kultur.js` besitzt die gemeinsame
Adelshierarchie. Die neuesten Nutzerkorrekturen gelten durchgehend:
**Chastor → Ritterfürst**, **Bannor**, **Pajet**. Die Klassenprofile bleiben unausgefüllt.

## Getrennte Verantwortlichkeiten

Landesdaten und Bildentwürfe liegen hier. Kartensteuerung, Import, Export,
Rückgängig, lokale Entwürfe und Hausfenster verwenden `Vorschau/shared`.
`cultural-references.mjs` ergänzt ausschließlich die gemeinsam gespeicherten
Adelsränge und drei Formvorlagen. Entwürfe verwenden den eigenen Schlüssel
`aleria:proposal:brevanor:placements:v1` und ändern keine kanonischen Register.

Die alten Hauszuordnungen behaupten keine heutige Herrschaft unter der Triarchie.
Kein Adelshaus wird ohne Quelle als freiwilliger Verbündeter der Besatzer geführt.

## Bildproduktion und Prüfung

Alle Bilder entstanden mit dem eingebauten `image_gen`. `art-prompts.json` und
`warrior-prompts.json` enthalten vollständige Einzelprompts und Referenzpfade;
`generation-receipts-resumed.json` dokumentiert die fortgesetzten Aufrufe und
die Korrekturen an Aubert und Trevain. Frühere Rohbilder bleiben zusammen mit
ihren Promptkatalogen und SHA-256-Manifesteinträgen erhalten.
`historical-emblem-receipt.json` dokumentiert das ergänzte antike Lilienwappen.
Neue Hauswappen bleiben kreisrund, Gebietswappen verwenden die drei Schildformen.
Die Benutzerfreigabe **„Ja, Alpha bereinigen“** gilt fort; technische Aufbereitung
verändert nur Alpha, Originale und RGB bleiben erhalten.

Die Krieger verwenden das normale matte Figurenpreset und den tatsächlich
angesehenen freigegebenen Hausritter. Hausfarben und Ausrüstung folgen dem
aktuellen Auftrag: hoch-/spätmittelalterliche Pracht, einzelne Helmkonzepte,
Hornzier nur bei Hirsch/Stier und Federzier bei Vogelwappen. Cantrel sind
höfische Fechter mit Degen ohne Feuerwaffe; Cabrant stehen neben einem Cheval
mit echtem Bestiarium-Verweis.

```text
node Vorschau/Brevanor/scripts/prepare-art.mjs
python -B Vorschau/shared/prepare-country-sources.py Vorschau/Brevanor/source-import.json
python -B Vorschau/shared/prepare-country-art.py Brevanor --qa-dir diagnostics/brevanor
python -B Vorschau/Brevanor/prepare-warriors.py build
python -B Vorschau/shared/prepare-country-art.py Brevanor --audit --qa-dir diagnostics/brevanor
python -B Vorschau/Brevanor/prepare-warriors.py audit
node --test --experimental-test-isolation=none Vorschau/tests/brevanor.test.mjs
```

Die jeweils unterstützten Krieger-Pipeline-Argumente stehen unter `--help`.
Browser- und Bildprüfbelege liegen in `diagnostics/brevanor/`.
Keine Veröffentlichung ohne neue gültige Freigabe.
