# Kampfprüfung mit Firestore-Emulator

Diese Tests führen die produktiven Callable-Handler mit echter Firestore-Speicherung aus. Die Würfelbelege kommen aus dem Frontend-Kampfsystem; die Handler berechnen sie mit den Servermodulen erneut. Profile sind Kopien der vorhandenen Charakterbogen-, Inventar- und Kreaturendaten. Firebase-Login und produktive Sicherheitsregeln werden hier nicht getestet: Die Testaufrufe erhalten explizite lokale Spieleridentitäten.

Benötigt wird ein separater Firestore-Emulator auf **127.0.0.1:8180**, mit dem Projekt **demo-aleria-combat-checkup**. Die Tests leeren ausschließlich diese feste Demo-Datenbank vor jedem Test. Sie lehnen den Start ohne die passende lokale Emulatoradresse ab.

Den bereits installierten Emulator beispielsweise in einem eigenen Terminal starten:

```powershell
$combatEmulatorJar = Join-Path $env:USERPROFILE '.cache/firebase/emulators/cloud-firestore-emulator-v1.19.8.jar'
java -jar $combatEmulatorJar --host 127.0.0.1 --port 8180 --project_id demo-aleria-combat-checkup --single_project_mode true
```

Beispiel in PowerShell, aus `firebase/functions`, bei bereits laufendem Emulator:

```powershell
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8180'
npm run test:combat-integration
# Danach die zwölf vollständigen Gruppenkämpfe mit festen Zufallsfolgen:
$env:COMBAT_PARTY_REPORT = '1'
npm run test:combat-simulation
```

Die Integrationstests laufen bewusst separat vom normalen `npm test`. Sie prüfen Start/Sperren, atomare Handlungen und Rücknahmen, zwei gleichzeitige Testspieler, einmalige EP-Vergabe, veraltete Entwürfe, abhängige Beiträge, Aktion plus Bonusaktion, ausgeschiedene Figuren, ein vollständiges Duell bis 0 TP und die Zuordnung persistenter Profile. Gruppentests ergänzen Magie, Schutz, Eigenschaden, Hochwirken, Aura, Folgeattacken und voneinander unabhängige Kreaturinstanzen.

Die beiden Befehle dürfen nicht gleichzeitig laufen, weil sie dieselbe wegwerfbare Demo-Datenbank verwenden. Innerhalb von `test:combat-integration` erzwingt `--test-concurrency=1` die getrennte Ausführung der Testdateien.

`combat-test-actions.mjs` verwendet dieselbe Auflösung und Regelhäufigkeit wie die Vorschau; `combat-test-context.mjs` verwendet dieselbe Komprimierung der Mechanikdaten wie der Client. `combat-party-context.mjs` verwaltet Gruppen und prüft nach jeder Speicherung Vorschau, Serverergebnis, Szenen-Replay und persistente TP. `combat-party-simulation.mjs` enthält Szenarien und die begrenzte automatische Zugstrategie.

Mit `COMBAT_PARTY_REPORT=1` wird `combat-party-results.json` nach dem Simulationslauf erneuert. Darin stehen Würfelfolge, Runden, Sieger, Endzustände und die einzelnen Zielauswertungen. Die Einordnung des geprüften Standes steht im [Kampfprüfbericht](COMBAT_PARTY_REPORT.md).
