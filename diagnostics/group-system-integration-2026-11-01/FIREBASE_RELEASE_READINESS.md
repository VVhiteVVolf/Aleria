# Firebase vor dem gemeinsamen Release

Stand: 1. November 2026. Ausschließlich lesende Prüfung; kein Deploy, keine
Produktivdatenmutation und keine Migration ausgeführt. Vorhandener Emulator 8187
und sämtliche Testprojekte blieben unverändert. Credentials wurden ausschließlich
intern verwendet; keine Identitäten, Token oder Secretwerte ausgegeben.

## Ergebnis

**Firebase muss vor dem neuen Frontend veröffentlicht und kontrolliert werden.**
Der lokale Netlify-Releasebefehl bündelt ausschließlich die Netlify Functions und
veröffentlicht keine Firebase Cloud Functions, Firestore-Regeln oder Indizes.

Der tatsächliche produktive Metadatenstand liegt in
`firebase-release-readiness.json`:

| Bereich | Produktiv | Lokal / notwendiger Stand |
| --- | --- | --- |
| Cloud Functions | 23, sämtlich ACTIVE | 32 Exporte |
| Codebase | `family-trees` | ebenfalls `family-trees`; der Name ist keine Datenbankanweisung |
| Functions-Region / Laufzeit | `europe-west1`, `nodejs22` | gleiche Region, Node 22 |
| Firestore-Datenbanken | ausschließlich `(default)`, `eur3` | nur diese Datenbank hier veröffentlichen |
| Zusammengesetzte Default-Indizes | 0 | 10 aus `firebase/firestore.indexes.json` |
| Aktiver Default-Regelsatz | abweichender Hash | `firebase/firestore.rules` erforderlich |
| Anmeldung | vorhanden, Zugriff erfolgreich | kein neues Login erforderlich |

Es fehlen produktiv diese neun Funktionen:
`commitGroupInventory`, `commitQuest`, `commitItemDefinition`, `commitItemRecord`,
`commitItemTrade`, `commitItemAward`, `commitItemMigration`, `itemBackup`,
`questBackup`. Kein bestehender produktiver Funktionsname ist lokal weggefallen.
Die vorhandenen Funktionen müssen wegen der gemeinsam geänderten Mechaniken
ebenfalls aktualisiert werden, insbesondere Handel, Übergaben, Rast, Rücknahme,
Kampf und Sicherungsimport. Nur die neun neuen Endpunkte anzulegen reicht nicht.

## Lokale Voraussetzungen

`firebase/functions/package.json` verwendet ESM und Node 22. Die beiden direkten
Abhängigkeiten `firebase-admin` 13.10.0 und `firebase-functions` 7.2.5 stimmen mit
Lockfile und installierten Paketen überein. Die statische Prüfung aller relativen
Imports unter `functions/src` fand weder fehlende Dateien noch Verweise außerhalb
des Functions-Quellpakets. Nach den zusätzlich belegten Normaltransfer-,
Kauf-/Grant- und Belohnungskorrekturen besteht die vollständige Serversuite mit
**323/323 Tests** (`server-units-after-item-grant-fix.log`). Acht weitere zuvor
rote Itemregressionen sind grün, einschließlich Foodkäufen, Definitiongrants,
Quest-/Tafelbelohnungen und Inventar-only Bearbeitungen ohne Profiländerung.
Drei neue echte Firestore-Integrationen bestätigen diese Pfade zusätzlich
(`item-passive-profile-emulator.log`). Die Runtime-/Importprüfung ist weiterhin
für den unveränderten 32er-Exportvertrag gültig.

Die globale CLI ist 15.33.0; die im Firebase-Paket installierte CLI ist 14.27.0.
Der exakte vorhandene globale Befehl ist
`C:\Users\fhg_r\AppData\Roaming\npm\firebase.cmd`.
Beide vorhandenen Parser wurden ohne Deployment auf den unten verwendeten
Default-Selektor geprüft. Das Auth-Lesen im eingeschränkten Prozess scheiterte
zunächst am lokalen Configstore-Schreibversuch der CLI; die autorisierte
Metadatenprüfung mit dem bestehenden Projektclient war anschließend erfolgreich.

Die vorhandene Functions-Umgebungsdatei enthält ausschließlich die zwei
Repository-/Branchparameter des Szenenbackups. Die bestehende Secretbindung des
GitHub-Backuptriggers wird weiterverwendet; keine neuen Secretwerte oder
Authentifizierungsprovider sind für Items, Quests oder Gruppenkonten erforderlich.

## Begrenzter Veröffentlichungsweg

Vom Repository-Stamm aus; diese Befehle sind hier **nicht ausgeführt** worden:

```powershell
firebase deploy --project aleriaprojekt --only "firestore:(default)"
firebase deploy --project aleriaprojekt --only "functions:family-trees"
```

Der erste Befehl wählt in beiden vorhandenen CLI-Versionen genau die Default-
Datenbank und veröffentlicht deren Regeln und Indizes. Keine Datenbank erstellen,
keinen Storage- oder Auth-Deploy ergänzen. Die ältere README-Ersteinrichtung mit
`firestore:databases:create family-trees` und anschließendem breiten Deploy ist
für diesen Release ungeeignet. Auch `firestore:rules` allein ist hier nicht die
präzise Auswahl: die aktuelle globale CLI bezieht damit alle konfigurierten
Datenbanken ein. Die benannte Familien-Datenbank existiert produktiv weiterhin
nicht und wird für den aktiven Almanach nicht benötigt.

Die Firebase-Dokumentation beschreibt sowohl den
[datenbankspezifischen Regeldeploy](https://firebase.google.com/docs/rules/manage-deploy)
als auch den [Codebase-Selektor](https://firebase.google.com/docs/functions/organize-functions).
Die verwendeten Selektoren wurden zusätzlich an den tatsächlich installierten
CLI-Modulen geprüft. Für viele Funktionen empfiehlt Firebase
[begrenzte Funktionsdeploys in Gruppen bis zehn](https://firebase.google.com/docs/functions/manage-functions).
Bei Quotenproblemen können statt des zweiten Befehls die vier vollständigen,
nicht überlappenden Batches am Ende dieses Berichts verwendet werden.

Unter PowerShell lässt sich der vorhandene globale Befehl ausdrücklich wählen:

```powershell
& 'C:\Users\fhg_r\AppData\Roaming\npm\firebase.cmd' deploy --project aleriaprojekt --only 'firestore:(default)'
& 'C:\Users\fhg_r\AppData\Roaming\npm\firebase.cmd' deploy --project aleriaprojekt --only 'functions:family-trees'
```

Der vorhandene Firebase-Predeploy-Hook führt `npm --prefix "$RESOURCE_DIR" test`
aus. Darin läuft der Mechanik-Sync vor den Backendtests. Deshalb erst nach dem
gemeinsamen Quellenabschluss deployen; die vorher geprüften Kopien müssen dabei
inhaltlich identisch bleiben. Kein `--force` und keine Funktions-/Indexlöschungen
an diesen Release anhängen. Die vollständige Codebase hat keine entfernten
Produktivendpunkte, und produktiv sind bislang keine Composite-Indizes vorhanden.

Nach Firebase-Deployment lesend nachprüfen:

```powershell
node diagnostics/group-system-integration-2026-11-01/audit-firebase-release-readiness.mjs --after
```

Der Bericht landet getrennt in `firebase-release-after.json`, damit der
Vorhernachweis erhalten bleibt. Ziel: sämtliche 32 Exporte vorhanden und ACTIVE,
Region und Runtime unverändert, Default-Regelhash identisch sowie alle zehn
Indizes vorhanden und READY. Ein erfolgreicher CLI-Upload allein beweist den
Indexaufbau nicht. Firebase dokumentiert, dass
[Indexaufbau und Backfill Zeit benötigen](https://firebase.google.com/docs/firestore/query-data/indexing).
Auch Regeln brauchen eine kurze Verbreitungszeit; lesende Quest-/Szenenabfragen
anschließend prüfen. Dafür keine produktiven Kampf-/Inventartransaktionen als
Smoke-Test auslösen. `releaseReady` fasst diese Metadatenbedingungen zusammen;
den erfolgreichen Codeupload belegen zusätzlich die erfolgreichen Firebase-
Deploylogs. Der Metadatencheck behauptet keine eigene binäre Sourceattestierung.

Erst danach folgt der bestehende Netlify-Prozess mit finalem Releasecommit samt
`[skip netlify]`, normalem Push und `node netlify/release/release.mjs --publish --push`.
Dieser letzte Schritt liegt bei Root. Der aktive alte Client bleibt während des
Firebase-Deployments im Dienst; keine pauschale Altbestandsmigration dazwischen
einschieben. Die neuen Sperren betreffen kanonische Inventar-/Mechanikschreibwege,
nicht gewöhnliche Rollenspielbeiträge.

## Welche Daten vorher nicht pauschal geschrieben werden müssen

| Inhalt | Bereitstellung / Datenbedarf |
| --- | --- |
| Gemeinsame Standarditemdefinitionen | Browser- und Serverkatalog sind Codeprojektionen. `readItemDefinition` löst Builtins direkt aus der Registry auf. Keine Massenanlage aller Definitionen in Firestore erforderlich. Eigene Definitionen entstehen über die geprüfte Buildertransaktion. |
| Alte Inventare und reine Bogenwaffen | Weiterhin kompatible Altbestände. Eine Übernahme ist ein eigener, revisionsgeschützter `commitItemMigration`-Vorgang mit Vorschau und Einzelprüfung. Weder Deploy noch Importskript dürfen alle Figuren auf neue Regeln zurücksetzen. |
| Gruppenlandingseiten / Anaraut / Gawain | Browser und Backend verwenden dieselbe reine versionierte `upgradeEntry`-Projektion. Sichtbare neue Mitglieder benötigen vor ihrem ersten regulären Speichern keinen massenhaften Modul-Write. Gespeicherte Nutzerentscheidungen haben Vorrang. |
| Gruppenkassen und Gegenstände | Ausschließlich kanonische `group_quest_accounts`, entstanden bei wirklichen Questrewards/Beiträgen/Grants. Das redaktionelle Kassenbuch wird nicht als Geldbestand importiert. Keine Startguthaben oder Inventare künstlich vorbesetzen. |
| Questdefinitionen / Tafeln / erste Pferdequest | Öffentliche Quellen und Tafelprojektionen liefert Netlify. Ein Start kann serverseitig die mitgelieferte Definition aufnehmen, wenn noch keine gespeicherte Akte existiert; kein flächendeckendes Quest-Seeding nötig. Aktive Durchläufe, Ereignisse und Auszahlungen entstehen nur durch echte Nutzeraktionen. |
| Gawains öffentliche Biografie | Lokaler FamilySnapshot plus Datenbank sind bereits gezielt aktualisiert. Die gemeinsame Leseprojektion ergänzt den bekannten alten/fehlenden öffentlichen Text, ohne Inventare oder Kampfprofile zu ändern und ohne spätere fremde Biografien zu überschreiben. Kein produktiver Charakter-Replace für die Darstellung erforderlich. |
| Backups | Neue Item-/Quest-/Gruppenbelege gehören zu den vorhandenen Sicherungspfaden. Kein Restore als Veröffentlichungsmigration verwenden; produktive spätere Belege sind autoritativ. |

Die allgemeine Charakterdatenbank-Neuprojektion verlangt weiterhin sechs
unabhängige Ablagewechsel. Der normale Familien-Ganzabgleich hat außerdem den
bekannten fremden Tuilelaith-Validierungsrest. Beide sind getrennte Datenarbeiten,
keine Voraussetzung zum Deployen der hier bereits gezielten sicheren Projektion.
Die 255 IDs und Inventar-/Kampfprofil-Hashes sind lokal unverändert belegt.

Nicht blind ausführen: `seed-family-workspaces.mjs --commit/--force`,
allgemeine Charakter-/Familien-Neuprojektion, frühere
`firebase/scripts/content/publish-*.mjs --apply`, breite Itemmigration,
Backup-Restore oder Abschluss-/Payout-Test mit echten Figuren. Vorhandene
Publikationsskripte sind jeweils fachlich begrenzte Datenänderungen und kein
generischer Ersatz für einen Code-Release. Das Audit hat keine produktiven
Charaktere oder Bestandsdokumente gelesen; es behauptet deshalb keinen neuen
Live-Datenzensus oder eine bereits erledigte Altbestandsübernahme.

## Frische Regelnachweise vor dem Deployment

Beide bestehenden Regelsuiten wurden unverändert gegen ihre jeweiligen
Regelquellen neu ausgeführt. Die Testinfrastruktur akzeptiert nun einen
ausdrücklich isolierten `demo-`-Projektparameter und den bestehenden Port 8187;
ein überschreibender Produktionsprojektname wird abgewiesen. Es wurden nur die
eigenen Demo-Daten zurückgesetzt, keine globalen Emulatorlöschungen ausgeführt.

- `demo-aleria-release-default-rules`: **21/21**, `release-default-rules.log`.
- `demo-aleria-release-family-rules`: **7/7**, `release-family-rules.log`.

Die Defaultsuite bestätigt ausdrücklich: Browser können auch als Spielleitung
keine kanonischen Itemregeln, Bestände, Gruppenbuchungen, Quittungen,
Questfortschritte oder Auszahlungen fälschen. Gewöhnliche Biografiebearbeitung und
öffentliche Lesewege bleiben möglich. Die Familienprobe ist eine Regression des
vorhandenen Quellregelsatzes; sie begründet keinen Bedarf, eine entsprechende
Produktivdatenbank anzulegen.

## Belohnungsidentität der tatsächlichen Pferdequest

Die zusätzlich vermutete Doppelzahlung über eine nackte Pferdequest-ID wurde
anhand der tatsächlichen Quellen nicht bestätigt. Die nackte ID
`gwynthor-der-staedter-und-sein-pferd` ist der Dossier-/Aushangschlüssel; statischer
Questkatalog und dynamische Tafelprojektion verwenden beide
`notice:cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel:gwynthor-der-staedter-und-sein-pferd`.
Das entspricht genau dem Tafelaward-Vertrag aus Board-ID und `noticeGroupId`.
Der Darstellungsstapel bestimmt diese Identität bei vorhandener Gruppe nicht.

Drei neue Regressionen lesen die echten Config-/Aushang-/Katalogquellen und
prüfen die Auszahlung in beiden Reihenfolgen: 50 Kupfer und beide Gegenstände
gelangen genau einmal ins Inventar, vollständige Kampfprofile bleiben erhalten.
Unabhängige wiederholbare Quests mit denselben bloßen Verweisen bleiben mehrfach
auszahlbar. Es wurde deshalb keine produktive Keyableitung oder pauschale
Linksperre geändert. Nachweis: `quest-notice-identity-tests.log`, 16/16 mit
Questnachbarn.

## Optionale vollständige Functions-Batches

Diese vier Befehle sind eine Alternative zum einen Codebase-Deploy oben. Alle 32
lokalen Endpunkte sind genau einmal enthalten. Erst nach Erfolg aller Batches
und der anschließenden Metadatenprüfung das Frontend veröffentlichen.

```powershell
firebase deploy --project aleriaprojekt --only "functions:family-trees:commitGroupInventory,functions:family-trees:commitItemAward,functions:family-trees:commitItemDefinition,functions:family-trees:commitItemMigration,functions:family-trees:commitItemRecord,functions:family-trees:commitItemTrade,functions:family-trees:commitQuest,functions:family-trees:itemBackup,functions:family-trees:questBackup"
firebase deploy --project aleriaprojekt --only "functions:family-trees:commitItemRegister,functions:family-trees:commitInventoryTransfer,functions:family-trees:commitSceneItem,functions:family-trees:commitSceneRest,functions:family-trees:commitUndoMechanicalComment,functions:family-trees:commitLootClaim,functions:family-trees:commitCombatComment,functions:family-trees:commitCombatStatus,functions:family-trees:commitCombatEncounter,functions:family-trees:commitNarrativeComment"
firebase deploy --project aleriaprojekt --only "functions:family-trees:commitEditCombatEncounterText,functions:family-trees:commitHerausforderung,functions:family-trees:commitResetCombatParticipants,functions:family-trees:commitSkillComment,functions:family-trees:endSceneSession,functions:family-trees:finalizeCombatNarration,functions:family-trees:importBackupRecords,functions:family-trees:indexCommentActivity,functions:family-trees:publishFamily,functions:family-trees:setAleriaRole"
firebase deploy --project aleriaprojekt --only "functions:family-trees:setFamilyMemberRole,functions:family-trees:uploadFamilyAsset,functions:family-trees:writeSceneBackupToGitHub"
```
