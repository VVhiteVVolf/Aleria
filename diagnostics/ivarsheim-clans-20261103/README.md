# Abschluss der nördlichen Hausübernahmen

3. November 2026: Roriksheim umfasst 33, Ivarsheim 13 fertige Hausseiten mit Hausbios, Darstellung und tatsächlichem Stammbaum-Iframe. Die zwölf älteren Ivarsheim-Akten und sämtliche 33 Roriksheim-Graphen bleiben unverändert. Zusätzlich schützen die Tests Wolfshorn, Bleiddorn und Trachwylls Talfronwyn-Ursprung.

Ivarsheim verwendet elf neu gesicherte Originalfiguren und das unveränderte bereits vorhandene Trachwyll-Original. Für Hrafnvald wurden ein kreisrundes Wappen und eine anonyme Hausfigur mit dem eingebauten Imagegen-Werkzeug erstellt. Prompts, Herkunftspfade, Originalhashes und Sichtprüfungen stehen in den jeweils benannten JSON-Belegen. `all-clan-figures.jpg` ist eine reine Prüfübersicht; die Einzelbilder wurden nicht nachbearbeitet.

Hrafnvald ist Livs neu benannter Herkunftsclan in Ivarsfels unter Wargh. Ihre vitalen Identitätsfelder sind erhalten. Nur die neue Clanakte weist ihr `house-hrafnvald` und `familyRole: core` zu; die älteren Akten werden nicht umgeschrieben. Torleif und Liv erhalten keine erfundene Verwandtschaft.

Die ausführlichen Kapitel bleiben auf den Seiten, die kurzen Hausbios verweisen darauf. Vollständig redigierte Seiten verwenden die große Vorlage, damit auch ihre Kriegerkapitel sichtbar sind. Die gemeinsame Aldrimar-Komposition liegt im Featuremodul `reviewed-aldrimar-house-content.mjs`; bestehende Darstellungs- und Upgrade-Systeme bleiben zuständig.

## Validierung

- Roriksheim: 10/10 Tests.
- Ivarsheim: 10/10 Tests.
- Vennyr-Bildmigration samt späterer Trachwyll-Hausbio: 9/9 Tests.
- Gemeinsame Hausvorbereitung: 6/6 Tests.
- Begrenzte Hausseitenausgabe: 8/8 Tests.
- Galerie: 9/9 Katalogtests und 12/12 Scope-Tests.
- Gesamt: 64 gezielte Prüfungen bestanden. Einzelprotokolle: `check-0.txt` bis `check-6.txt`.
- Zusätzlich 8/8 Prüfungen der Quellen-/Frontend-/Referenzbild-Auslieferung bestanden; insgesamt 72 erfolgreiche Prüfungen.
- Hausseiten-/Bio-Generator und Galerie für genau 46 ausgewählte IDs mit `--check`: bestanden.
- `git diff --check`: bestanden.
- Browser: Varulvs Originalfigur und tatsächlicher Stammbaum-Iframe, Eisenjungfers erhaltene ausführliche Bio mit neuer Figur, Hrafnvalds vollständige Seite samt Liv im Iframe und Mac Luins historischer Sitz Ard Eabhraig samt Originalfigur sichtbar geprüft.

Der erste Mehrdateilauf mit `node --test` wurde durch die Sandbox beim Childprozess-Start (`spawn EPERM`) blockiert. Die identischen Tests liefen anschließend einzeln direkt mit Node erfolgreich. Keine Rechteänderung und kein alternatives Testgerüst erforderlich.

Der begrenzte Import besitzt eine explizite Wiederaufnahme (`--resume`), die vorhandene redaktionelle Inhalte nur bei vollständiger Gleichheit akzeptiert. Sie diente der Fertigstellung nach einer zunächst falsch angenommenen Arrayform des Hrafnvald-Quellenbelegs. Es wurden keine fremden Quellen überschrieben.

Kein Commit, Push oder Deploy durch diesen Auftrag ausgeführt. Vorhandene Server, Arbeitsquellen, Diagnosebelege und fremde laufende Arbeiten erhalten.
