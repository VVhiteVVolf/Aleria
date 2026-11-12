# Drei Marktleute aus Gwynthor

Eigenständige Charakterquellen, keine Szenenmodule oder Handelsregister:
Cadwal Wernig (42, Cenyri), Alrik Tannholt (61, Aldrimar), Mairwen Brennig
(59, Herkunft offen). Alle arbeiten auf Gwynthors Marktplatz. Keine neue
Familie, genealogische Verknüpfung, Geburtsjahre, Inventarvergabe oder Kampfwerte.

Abgeschlossen am 5. November 2026: drei Figuren mit den finalen öffentlichen
Porträts angelegt und durch den Hauptlauf vollständig aus Firestore rückgelesen.
Der vorhandene Gwynthor-Reiter enthält zusätzlich genau diese drei Mitglieder
(76 → 79), ohne Untergruppe. Der begrenzte lokale Import führt nun 296 Figuren;
alle 293 bisherigen Akten und Registerzeilen sind unverändert, die 293 einzelnen
Aktendateien bytegleich. 15 gezielte Fach-/Regressionstests und der native
Import-`--check` für alle drei Quellen bestanden. Kein Git-/Website-Deploy.
Belege: `diagnostics/gwynthor-markt-haendler-20261105/final-review.json`,
`publication-verification.json` und `local-import-verification.json`.

`characters.mjs` verwendet die vorhandene Profilfactory und den
Firestore-Biografiesanitizer. `import-plan.mjs` ruft den vorhandenen begrenzten
Figurenimport mit ausdrücklich leerer Familienkandidatenliste auf. Der Plan
prüft, dass sämtliche fremden Akten und Registerzeilen erhalten bleiben.

Quellen und geplanter Import werden ohne Datenbank-/Onlineänderung vorbereitet:

```powershell
node diagnostics/gwynthor-markt-haendler-20261105/prepare.mjs
node --test --experimental-test-isolation=none diagnostics/gwynthor-markt-haendler-20261105/characters.test.mjs AleriaAlmanach/tests/authored-character-import.test.mjs
```

Die endgültigen Bilder stehen in `diagnostics/gwynthor-markt-haendler-20261105/artwork.json`:
genau die drei Slugs, pro Bild `{ "url": "https://…", "sha256": "…" }`.
Die Vorbereitung setzt dieselbe URL in Profil und Biografie. Ohne alle drei
freigegebenen Bilder verweigert der Onlinewrapper das Schreiben.

`diagnostics/gwynthor-markt-haendler-20261105/publish.mjs` plant standardmäßig
lesend. Der explizite `--apply`-Aufruf folgt nach Review der endgültigen Quellen,
Bildbelege und des begrenzten Schreibplans. Er prüft die öffentlichen Bildbytes,
die drei vollständigen Namen und genau drei Ziel-IDs. Er legt nach
verschlüsseltem Vorbeleg ausschließlich drei `characters`-Dokumente in einem
atomaren Commit mit `exists:false` an und liest sie vollständig zurück.
Im selben Commit ergänzt er genau die drei fehlenden Mitgliedschaften des
bereits vorhandenen Gwynthor-Reiters: `char_tabs/config`, Feldmaske ausschließlich
`map.Gwynthor`, geschützt durch die gelesene `updateTime`. Vorherige Werte und
alle übrigen Konfigurationsfelder werden unverändert erhalten und rückgelesen.
Ein Teilbestand oder abweichende bestehende Profile brechen ab. Die Methode
beschreibt keine Untergruppen, Module, Familien oder Bestände.

Der lokale Schreibschritt erfolgt nach Review über den vorhandenen Importer:

```powershell
node CharakterDatenbank/scripts/import-authored-characters.mjs --feature gwynthor-markt-haendler --source "Charakter Archiv Exporte/Gwynthor Markt Haendler/cadwal-wernig.json" --source "Charakter Archiv Exporte/Gwynthor Markt Haendler/alrik-tannholt.json" --source "Charakter Archiv Exporte/Gwynthor Markt Haendler/mairwen-brennig.json"
```

Dabei entstehen drei eigene Ortsakten sowie aktualisierte Registry, Snapshot
und Syncbericht. Der breite Archivsync gehört nicht zu diesem Auftrag.

Die aktiven Bilder liegen unter `AleriaAlmanach/assets/gwynthor-markt-haendler/portraits/`;
`manifest.json` daneben bindet die drei Original-PNGs, SHA256, Maße und öffentlichen URLs.
Alle sind 1024 × 1536 Pixel groß, mit Oberkörperfokus und Marktstand im Hintergrund.
Verwendet wurde der unveränderte gespeicherte Stiltext `anime-scene-portrait`
mit der vereinbarten Referenz `Tales of Xillia/Frieren`. Tatsächliche Prompts,
Generatororiginale und frühere Ganzkörperfassungen sind in `image-prompts.json`
und `image-versions.json` im Diagnoseordner dokumentiert. `image-original-verification.json`
belegt die bytegleichen Projektkopien; alle drei öffentlichen Bilder wurden ebenfalls
bytegleich geprüft und die fertigen Motive tatsächlich angesehen.
