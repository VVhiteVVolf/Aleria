# Fremde Stimme: zehn Rollen vom 12. November 2026

Die bestehende Auswahl enthält jetzt 23 Silhouetten: die bisherigen 13 und zehn
zusätzliche Rollen. Das Beitragsicon bleibt unverändert. Neu sind:

| ID | Beschriftung |
| --- | --- |
| `elderly-woman` | Alte Frau |
| `elderly-citizen` | Alter Bürger |
| `courtesan` | Dirne |
| `servant` | Diener |
| `city-guard` | Stadtwache |
| `knight` | Ritter |
| `mercenary` | Söldner |
| `robber` | Räuber |
| `knight-2` | Ritter Variante |
| `mercenary-2` | Söldner Variante |

Die tatsächliche Registrierung bleibt im vorhandenen Modell
`AleriaAlmanach/modules/comments/comments-foreign-voice.js`. Das bisherige
`../2026-11-08/manifest.json` samt `asset-map.json` und `generation-prompts.json`
ist um diese zehn Einträge ergänzt; alle früheren Einträge bleiben erhalten.
Es gibt keine zweite Auswahlregistrierung.

Jedes Bild entstand mit einem eigenen Aufruf des eingebauten `image_gen` und
tatsächlich angesehenen Referenzen aus derselben Serie. Keine API-/CLI-Erzeugung.
Völlig gesichtslose, dunkle menschliche Silhouetten mit Gesprächsgesten vor einem
schlichten mittelalterlichen Dorf; matte Anime-Lineart und Cel-Shading. Alter,
Rolle und Varianten unterscheiden sich durch Haar-/Helmkontur, Kleidung,
Ausrüstung und Gesten. Die Dirne ist eine vollständig bekleidete erwachsene Frau.
Beide Ritter und beide Söldner besitzen unterschiedliche Ausrüstung und Gesten.

Alle zehn fertigen Motive wurden vom Hauptagenten tatsächlich angesehen, nicht
nur anhand von Dateimetadaten geprüft. Alle aktiven Bilder sind 1254 × 1254 Pixel,
deckendes RGB und bytegleich zu Generator und `originals/<id>-v1.png`.
Keine Bildnachbearbeitung, Skalierung oder Transparenzänderung. Aktive Dateien:
`AleriaAlmanach/public/assets/comment-foreign-voice/<id>.png`.

`receipts/<id>.json` enthält den exakten Prompt, Werkzeugparameter, tatsächliche
Referenzen, Generatorpfad, Original-/Aktivzuordnung, SHA256, Maße und Sichtprüfung.
`generation-prompts.json` bündelt die tatsächlichen Prompts dieses Auftrags.
Die zunächst vorgeschlagenen Händler-/Reisende-/Handwerker-Motive wurden nach
der Nutzerwahl nicht aufgenommen. Ihre Originale, Prompts und als `unselected`
markierten Belege bleiben hier erhalten; die geprüften identischen Aktivkopien
wurden entfernt. Diese drei IDs stehen nicht zur Auswahl.

Bestehende Namen, Avatar-IDs, Figuren und Erzählerfunktionen bleiben erhalten.
Diese Erweiterung erzeugt keine Figurenakten oder Spielgegenstände und bleibt
lokal. Prüfnachweise stehen unter
`diagnostics/foreign-voice-expansion-20261112/`.
