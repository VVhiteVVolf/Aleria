# Schiffskatzen der Tiefenwyrm

Stand: 12. Oktober 2026. **Lokaler Entwurf, nicht veröffentlicht und nicht auf master gepusht.**

| Kater | Merkmale | Herrchen | Kreatur-ID |
| --- | --- | --- | --- |
| Bwmbo | Orange-weiß, blaue Augen, Backenbart und zerzauster Schopf; ruht auf einer Kiste | Sir Trevor Gwyvern | `companion-trevor-bwmbo` |
| Uffel | Alt, blasser orange-weiß, ein trübes Auge, helle Mähne; steht stolz | Sir Trevor Gwyvern | `companion-trevor-uffel` |

Uffel war bereits auf dem Schiff, als Idwals Mannschaft es übernahm, und ist geblieben. Die spätere Nutzeranweisung ordnet ihn ebenfalls Trevor als Herrchen zu. Bwmbo gehört gemäß der ursprünglichen Auswahl Trevor. Beide sind Cenyric-Schiffskater auf Stufe 2 und unter **Katzen → Tiefenwyrm** eingeordnet. Die ausgewählten PNGs wurden unverändert nach `assets/ship-crews/idwals-schiffsmannschaft/companions/` kopiert.

## Daten und Zuständigkeit

- Kreaturbögen: `modules/creatures/catalog/idwal-ship-cats.js`, über den bestehenden Kreaturenkatalog verfügbar. Trefferwürfel W4; Bwmbo 9 TP/RK 13, Uffel 12 TP/RK 12; Bewegung jeweils 9 m.
- Hierarchie: `modules/ship-crews/idwal-ship-cats-hierarchy.js` ergänzt ausdrücklich den vierten Baum **Schiffskatzen**. Kein automatisches Speichern beim Laden oder Rendern. Die drei bisherigen Bäume, Kompatibilitätsebenen und anderen Seiten bleiben erhalten.
- Inventar: bestehende `attachCreatureToInventory`-Verknüpfung. Beide Karten verweisen auf ihre Kreaturbögen und eigenen Inventarinstanzen. Die zwei leeren Starterkarten wurden verwendet; bestehender Besitz und andere Inventarfelder bleiben erhalten.
- Gemeinsame Kampfprofilvalidierung erhält jetzt auch W4. Die generierte Serverfassung wurde aus derselben Quelle abgeglichen. Bestehende Online-Daten wurden nicht geändert.

## Vorbereitete Exporte

Im Workspace unter `Charakter Archiv Exporte/`:

- `Biographien/idwals-schiffsmannschaft-schiffskatzen-modulpaket-2026-10-12.json`
- `gefaehrten/idwal-schiffskatzen-2026-10-12/companion-trevor-bwmbo.json`
- `gefaehrten/idwal-schiffskatzen-2026-10-12/companion-trevor-uffel.json`
- `gefaehrten/idwal-schiffskatzen-2026-10-12/vorbereitung.json` mit Bildprüfsummen und gelesenen Versionsständen
- `trevor-gwyvern-schiffskatzen-2026-10-12.json` mit Inventarverknüpfungen; durch den späteren [Rhyfel-Auftrag](GWYVERN_RHYFEL_2026-10-12.md) zum vollständigen lokalen Trevor-Export einschließlich Struppi ergänzt. Beide Katzenbögen enthalten jetzt ihren Cenyric-Bestiarium-Verweis.

Vor einer späteren Veröffentlichung den aktuellen Online-Stand erneut lesen und die gezielten Ergänzungen dagegen anwenden. Den Inventarexport nicht über zwischenzeitlich geänderten Besitz schreiben. Modul, Kreaturen und Inventar mit Versionsprüfung gemeinsam speichern; die neuen Bilddateien müssen dann verfügbar sein.

## Prüfung

114 gezielte Tests bestanden. Lokaler Browser-Test: Modulimport gültig, vier Hierarchiereiter, beide Bilder geladen, zwei verknüpfte Inventarkarten und Öffnen von Uffels Bogen über dessen Karte. Biografien und W4-Kampfwerte geprüft, mobile Ansichten ohne horizontalen Überlauf. Browser- und Servervalidierung für W4–W12 stimmen überein. Produktionsbuild erfolgreich; bestehende Vite-Hinweise zu klassischen Skripten und großen Bundles bleiben bestehen.

Lokale Bildschirmaufnahmen und Prüfbericht: `.codex-temp/ship-cats-review/`.
