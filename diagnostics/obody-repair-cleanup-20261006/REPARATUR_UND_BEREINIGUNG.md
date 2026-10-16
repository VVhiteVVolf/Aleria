# BodySlide-/OBody-Reparatur und strikte Bereinigung – 6. Oktober 2026

Aktuelles Profil: **Nolvus Awakening - SkyrimNet Beta25 Test**. Nur dieses Profil wurde für die Beibehaltung von Mods berücksichtigt.

## Erledigte Reparaturen

- **19 gezielte BodySlide-Projekte** mit expliziten Nullwerten für sichtbare Körperform-Slider und aktivierter TRI-Ausgabe gebaut. Autoren-Konvertierungsslider und absichtliche Zaps bleiben erhalten.
- **15 Projekte mit nutzbaren Morphs**; die NIF-Formnamen und BODYTRI-Verweise wurden mit den erzeugten TRI-Formtabellen abgeglichen.
- **30 weitere Meshes mit widersprüchlichen BODYTRI-Verweisen korrigiert**. Alle binären Datenblöcke einschließlich Geometrie sind bytegenau identisch mit den Originalen; nur die betreffenden Stringwerte wurden geändert.
- Fehlerhaftes XML der HIMBO-Dark-Brotherhood-Gruppe durch ein gültiges Override repariert.
- BodySlide-Verknüpfungen auf die aktuell im Profil geladenen Quellen umgestellt. Keine alten isolierten BuildCatalog-Snapshots mehr als Quelle dieser Verknüpfungen.
- Neues aktives Ausgabe-Mod **Local - OBody Outfit Repairs 20261006** gewinnt die betreffenden Dateikonflikte. Bestehende Körperausgaben bleiben unverändert.

Gebaut wurden:

- Sorceress Attire  3BA
- Sorceress Boots  3BA
- Sorceress Gloves  3BA
- Sorceress Hood  3BA
- Sorceress Hood  3BA (no hair)
- Sorceress Skirt 3BA
- OStim Calyps Strap-On 3BA
- OStim Calyps Strap-On Simple 3BA
- [Amsedillir]_Triumphal_Coat_3BA
- [Amsedillir]_Triumphal_Necklace_3BA
- [Amsedillir]_Triumphal_HipDetal_3BA
- [Amsedillir]_Triumphal_Torso_3BA
- [Amsedillir]_Triumphal_Boots_3BA
- [Amsedillir]_Triumphal_Hairpin_3BA
- [Amsedillir]_Triumphal_Shoes_3BA
- [Amsedillir]_Triumphal_CoatC_3BA
- Arcane Mage Armour 3BA - Hands
- Falka Armor Gloves S
- CBBE SE - [COCO] TS Neck [3BA]

Vier Quelldatensätze liefern keine nutzbaren Körpermorphs und bleiben feste Zubehörformen:

- [Amsedillir]_Triumphal_Hairpin_3BA
- Arcane Mage Armour 3BA - Hands
- Falka Armor Gloves S
- CBBE SE - [COCO] TS Neck [3BA]

## Bereinigung

**183 weitere deaktivierte Mod-Ordner tatsächlich gelöscht: 130.73 GiB.** Frei auf E: beim Abschluss: **173.35 GiB**.

Es bleiben keine installierten, deaktivierten Nicht-Separator-Mod-Ordner übrig. Nutzung durch andere Profile war ausdrücklich kein Beibehaltungsgrund. Die gelöschten Minus-Einträge wurden aus dem aktuellen Modlist entfernt. Aktive Modreihenfolge und plugins.txt/loadorder.txt sind unverändert; alle aktivierten Mod-Ordner sind vorhanden.

[Vollständige Liste der gelöschten Mods](geloeschte_mods.tsv). Andere Profile können durch diese ausdrücklich gewünschte Bereinigung nun fehlende Mods anzeigen. Ihre Dateien wurden nicht gelöscht.

## Sicherungen und Wiederherstellung

Backup-Ordner: `D:\Nolvus-Backups\Awakening-6.0.20-vor-Update-20260930\updates\20261006-BodySlide-Reparatur-Bereinigung`.

- `inactive-mods-current-profile.tar.zst`: alle 64.777 Dateien der heute gelöschten Mods. Jede Datei unabhängig entpackt und SHA-256-geprüft, anschließend sämtliche aktuellen Quelldateien vor der Löschung erneut gegen das Manifest geprüft.
- `profile-tool-settings-before-repair.zip`: Profil-/Toolkonfiguration vor der Reparatur.
- `delta.zip` / `COMPLETE.json`: aktueller kumulativer Migrationsstand einschließlich Reparatur-Mod, aktuellem Profil und dessen Spielständen. Der vorherige Beta26-/Prisma-Zusatzstand ist übernommen; sämtliche aktiven Modbäume wurden auf Änderungen seit Basisbackup plus vorherigem Zusatzstand anhand Größe/Zeitstempel geprüft. Alle aufgenommenen Dateien unabhängig entpackt und SHA-256-geprüft.
- `LATEST_BACKUP.json` im Backup-Hauptordner zeigt auf diesen neuen geprüften Stand. Gelöschte Mods und andere Profile werden beim normalen Restore nicht wieder hinzugefügt.
- Auch die geänderten Dateien aus 32 ursprünglichen Nolvus-Konfigurationsmods sind für die Migration markiert. Die konkrete Liste liegt im Zusatzstand unter `changed-original-mod-files.tsv`; neue Nolvus-Versionen mit diesen Einstellungen abgleichen, nicht blind alte Programmdateien darüberkopieren.
- Wiederherstellung des neuen Reparatur-Mods in einem frischen Staging-Verzeichnis erfolgreich geprüft: 90 Dateien mit SHA-256-Abgleich.

Für das Nolvus-Update immer zunächst in einen neuen Staging-Ordner wiederherstellen und dort die neuen Nolvus-Konflikte prüfen. Alte MO2-/Tooldateien nicht blind über eine aktualisierte Nolvus-Installation kopieren.

## Noch offene Grenzen

Outfits ohne passende installierte 3BA-/HIMBO-Konvertierung erhalten durch diese Reparatur keine neue Konvertierung. Ihre fehlende OBody-Anpassung lässt sich nicht durch ein bloßes erneutes BodySlide-Bauen beseitigen. Die konkrete Liste bleibt im ursprünglichen Audit unter `../obody-bodyslide-audit-20261006/obody_missing_conversions.txt` dokumentiert.

Unbenutzte mehrdeutige Alternativen (Adventurer Light Body Sleeves, HIMBO Amber Boots und männliche Unterwäschevarianten) wurden nicht willkürlich gebaut. Keine Pandora-/Nemesis-, LOD-, TexGen-, DynDOLOD- oder Synthesis-Ausgaben regeneriert.

**Validierung:** echte Builds erfolgreich; installierte 90 Dateien gegen Stage geprüft; nutzbare TRI/NIF-Verknüpfungen geprüft; unveränderte Geometrie der 30 Referenzreparaturen geprüft; aktive Verzeichnisse und Pluginreihenfolge geprüft. Ein Test dieser Outfits im laufenden Spiel wurde nicht durchgeführt.

Für spätere manuelle Builds: BodySlide über MO2 öffnen, passende Gruppe `Local OBody Current female` bzw. `Local OBody Current male`, passenden Null-Slider-Preset und **Build Morphs** wählen. Ausgabeordner ist das neue Reparatur-Mod.
