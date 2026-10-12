# Nudd Saethwyr – Kampfavatare

2 9er-Sets, insgesamt **18 Einzelavatare**, fertiggestellt am 13. Oktober 2026. Verbindliche Grundlage ist das [unveränderte Nutzerporträt](Referenzen/nudd-saethwyr-nutzerreferenz.png). Gesicht und künstlerischer Stil richten sich nach diesem Originalbild.

In jedem Set stehen **oben drei angreifende**, **in der Mitte drei verteidigende** und **unten drei neutrale** Haltungen. Die Dateinummern `Bild01` bis `Bild09` folgen dieser Reihenfolge zeilenweise. Die neutralen Bilder zeigen Bereitschaft, Beobachtung oder eine kurze Pause. Mimik steht im Vordergrund; Waffen dürfen den Bildrand verlassen. Alle Avatare sind 1:1; jedes vollständige Sheet misst 1254×1254 Pixel.

| Set | Bewaffnung / Thema | Sheet | Einzelavatare | PNG-Pixel |
| --- | --- | --- | --- | --- |
| set-01 | Dreizack – Kontrolle und Präzision | [9er-Sheet](Sheets/nudd-saethwyr-kampf-set-01-dreizack-kontrolle-v3.png) | [9 PNGs](Output/set-01/) | 418×418 |
| set-02 | Dreizack – Dynamik und Reaktion | [9er-Sheet](Sheets/nudd-saethwyr-kampf-set-02-dreizack-dynamik.png) | [9 PNGs](Output/set-02/) | 418×418 |

## Vorlage, Ausrüstung und Darstellung

Nudds Originalanhang bestimmt Gesicht, rote Haare mit fallendem Scheitelpony, kleinen roten Kinnbart und die silber-goldene Rüstung. Das vorhandene Saethwyr-Rüstungsitem wurde berücksichtigt; die sichtbare Rüstung des Nutzerbildes hat bei Abweichungen Vorrang.

Die aktuelle Waffe ist laut Charakterexport vom 12. Oktober ein Saethwyr-Dreizack. Ein eigenes verbindliches Itembild dafür fehlt; das ältere Speerbild wurde nicht als Dreizackvorlage übernommen. Die Darstellung verwendet deshalb einen schlichten braunen Schaft, goldfarbenen Halsring und genau drei stählerne Zinken. Im ersten Set wurde ein hinterer Griff korrigiert. Alle 18 PNGs messen 418×418 Pixel.

Alle Sets zeigen den Trainingsplatz im Draig-Burginnenhof mit hellen Steinmauern, rotem Draig-Banner, Waffenständern und Übungszielen bei Tageslicht. Die beiden Figuren behalten jeweils den Stil ihres eigenen Nutzerporträts.

## Dateien und Prüfung

Die Bilder wurden mit dem integrierten `image_gen` erzeugt. [Prompts](Prompts/) enthält den vollständigen verwendeten Master-Prompt mit den neun konkreten Reaktionen, Auftragsdateien und etwaige Korrekturprompts. [Referenzen](Referenzen/) enthält Originalanhang und berücksichtigte Itembilder; `quellen.json` dokumentiert deren Herkunft. Bei zusätzlichen Umgebungsreferenzen dient ausschließlich die Burg als Vorlage.

Die Einzelbilder unter [Output](Output/) wurden mit den unveränderten Zuschneidemethoden des zentralen Avatar Splitter Pro V3 erstellt, mit 3×3, Lücke X/Y 0 und Autocrop aus. [avatar-manifest.json](avatar-manifest.json) enthält Bildzuordnung, Ausschnittkoordinaten, Pixelmaße, Prüfsummen und dokumentierte Kantenkorrekturen. Alle Einzelbilder wurden auf Vorlagennähe, Mimik, Waffenhaltung und Nachbarbildreste angesehen.

Die vollständigen finalen Sheets bleiben in [Sheets](Sheets/), abweichende Entwürfe getrennt in `Sheets/Entwuerfe`. `Verarbeitung` enthält Arbeitskopien und Zwischenexporte. Für die Nutzung gelten die geprüften PNGs unter `Output`.

[Paket mit allen 18 Kampfavataren](Nudd-Saethwyr-18-Kampfavatare.zip) – inklusive finaler Sheets, Originalreferenz, Prompts und Manifest. Entwürfe und doppelte Arbeitskopien sind nicht Bestandteil des ZIPs. Die Prompts dokumentieren gegebenenfalls auch frühere Korrekturschritte, deren Entwurfsbilder nur im Charakterordner liegen.
