# Übergabe für die spätere Nolvus-Migration

## Verbindliche Ausgangslage

- Nolvus Awakening 6.0.20 Ultimate; ursprüngliche Instanz unter `E:\Nolvus\Instances\Nolvus Awakening`.
- Zuletzt ausgewähltes Profil: **Nolvus Awakening - SkyrimNet Beta25 Test**. Alle Profile und Saves sind im Sicherungsumfang.
- Nutzer möchte alle eigenen/Twisted-Ergänzungen erhalten, ausdrücklich auch persönliche SkyrimNet-Prompts. Deaktivierte Mods sind bewusst mit gesichert, aber nicht automatisch einzuschalten.
- Stances zuletzt auf `<` plus Bewegungsrichtungen umgestellt: W hoch, A mittel, S tief, D neutral. Die vier Einzelbelegungen sind auskommentiert. Datei liegt in einem ursprünglichen Nolvus-Ordner (`Stances - Dynamic Animation Sets - Nolvus Settings`), nicht in einem Twisted-Mod.
- Nutzer bleibt für TTS bei **Inworld**, bevorzugte Sprache Englisch. PocketTTS verursachte nach Nutzerbeobachtung Ruckler. Keine alten API-/Modellwerte ungeprüft aus einer Vorgabedatei zurücksetzen.

## Was zur Übernahme bereitliegt

- 519 zusätzliche reguläre Modordner plus vier zusätzliche Separatorordner gegenüber dem erhaltenen Basisprofil.
- Aktivierungen, Reihenfolge, Nexus-ID/Version/Installationsarchiv soweit vorhanden: `migration-map.csv`.
- `mod-classification.csv`, `disabled-base-mods.csv`, `added-mod-folders.json`.
- Das ursprüngliche Basisprofil und alle angepassten Profile mit modlist.txt, plugins.txt, loadorder.txt, INIs und .ess/.skse-Saves.
- Vollständige Dateien auch aller Basis-Modordner: unbekannte direkte Änderungen gehen nicht durch eine bloße Namensklassifizierung verloren.
- Sämtliche unter MODS liegenden bisherigen Reparaturberichte, eigenen Launcher/Skripte und früheren Backups sind in Paket 30 enthalten.

## Nicht blind zurückspielen

Die alte Nolvus-Basis ist eine Rückfallkopie, keine fertige Aktualisierung der neuen Basis. Zuerst die neue Zielversion und deren Save-Kompatibilität prüfen. Dann alte Basis, angepasstes Profil und neue Basis vergleichen. Neue offizielle Mods/Patches erhalten, ergänzte Mods passend einordnen, 54 bisher deaktivierte Originalmods gegen die neue Liste überprüfen. Keine pauschale LOOT-Neusortierung und kein blindes Überschreiben sämtlicher neuer INIs mit alten Dateien.

Besonders beachten: NPC-Replacer und deren Integrationspatches, Körper-/Haut-/Hand-/Argonierdateien, BodySlide/OBody-Ausgaben, Pandora-Ausgaben, MCO-/Dodge-Konfiguration sowie SkyrimNet/IntelEngine/NarrativeEngine/OStimNet/SeverActions. Die alte Zusammenstellung war stark angepasst; die Dateisicherung allein beweist nicht die Kompatibilität dieser Kombination mit einer anderen Version.

## SkyrimNet-Daten

Mindestens `SkyrimNet - Personal Prompt Import 20260927` und `SkyrimNet - Beta25 Test Runtime 20260927` berücksichtigen. Im Runtime-Mod liegen neben Prompts auch Konfiguration, Daten, Stimmen und spielstandsbezogene Daten. Bestehende API-Schlüssel lokal erhalten, niemals in Antworten/öffentliche Protokolle ausgeben. Aktuelle Gewinner im neuen Profil gezielt prüfen, damit Standardprompts nicht über die persönlichen Prompts gewinnen.

## Prüfstatus

Nur `BACKUP_COMPLETE.json` mit `status: VERIFIED` im Backup-Hauptordner bestätigt den vollständigen Abschluss. Einzelne erfolgreiche Teilarchive genügen nicht. Jede reguläre Archivdatei wurde nach dem Schreiben erneut gelesen und mit ihrer beim Erfassen der Quelle erzeugten SHA-256 geprüft; SOURCE_COVERAGE.json enthält den abschließenden Quellenabgleich. Das Entpackwerkzeug prüft erneut und akzeptiert nur ein neues Zielverzeichnis.
