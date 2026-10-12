# Firebase Backend von Aleria

Der aktive Almanach verwendet Firestore `(default)` für Kommentare, Szenenzüge, Charaktere, Kampfdaten und Online-Moduländerungen sowie Firebase Authentication für Nutzer und Rollen. Die aktive Stammbaum-Anwendung und die Karten veröffentlichen dagegen nach GitHub über Netlify Functions. Die unten beschriebene ältere Firebase-Familienarchitektur ist vorbereitet, aber nicht der aktuelle Speicherweg; eine Datenbank `family-trees` wurde beim Produktionsaudit am 12. Oktober 2026 nicht gefunden. Sie darf nicht allein aufgrund dieser älteren Anleitung angelegt werden.

## Aktuelle Speicherwege und Sicherungen

| Inhalt | Verbindlicher Speicherweg | Sicherung |
| --- | --- | --- |
| Website, statische Module, Welttexte und lokale Bilddateien | GitHub, ausgeliefert durch Netlify | Git-Verlauf; externe Bildadressen enthalten die Bilddatei nicht |
| Veröffentlichte Stammbäume | `Stammbäume/assets/data/published-families` in GitHub | Registry, Familienakten und vorhandene Revisionsbackups; lokale Entwürfe erst nach Veröffentlichung enthalten |
| Veröffentlichte Karten | jeweilige `Karten/.../data.json` in GitHub | Git-Verlauf; lokale Browserentwürfe erst nach Veröffentlichung enthalten |
| Kommentare, Szenenzüge, Charaktere und Live-Ressourcen | Firebase `(default)` | private Vollsicherung; Szenenbackups enthalten nur das betreffende Modul und seine Kommentare/Züge |
| Online-Moduländerungen | Firebase `module_store_entries` und Manifest | private Vollsicherung; betreffendes Modul auch im Szenenbackup |
| Nutzer, Provider und Rollen | Firebase Authentication | privater Nutzerexport; niemals in das öffentliche GitHub-Backup aufnehmen |
| Bilder bei externen Anbietern | jeweiliger Anbieter | weder Git noch Szenenexport sichern automatisch die Bilddateien |

`backup-project.mjs` liest alle vorhandenen Firestore-Datenbanken samt Untercollections zu einem gemeinsamen Lesezeitpunkt, exportiert Authentication-Nutzer und den App-Storage-Bucket und verschlüsselt das Ergebnis vor dem Schreiben auf die Festplatte. Der Ordner `.private-backups` ist von Git ausgeschlossen. Tokens und Secret-Manager-Inhalte werden nicht exportiert. Auth-Nutzer und Storage werden innerhalb des Sicherungsfensters aufgenommen, ohne datenbankübergreifende Transaktion.

```powershell
node firebase/scripts/backup/backup-project.mjs
node firebase/scripts/backup/verify-project-backup.mjs .private-backups/DATEINAME.aleria-backup
```

Der Schlüssel ist an das aktuelle Windows-Benutzerprofil gebunden. Eine Kopie allein auf einem anderen Datenträger ist deshalb noch keine auf einem anderen PC wiederherstellbare Sicherung. Für ein zusätzliches Ziel muss auch die sichere Schlüsselübergabe festgelegt werden. Der erste Wiederherstellungstest hat alle 4.005 Dokumente des Sicherungsstands vom 12. Oktober 2026 mit identischen Feldprüfsummen in einen isolierten lokalen Emulator geschrieben. Dabei wurden keine Kampfmechaniken ausgeführt und keine Produktionsdokumente geschrieben. Die vollständige Rückübertragung von Auth-Nutzern und Storage ist noch nicht als Wiederherstellungstest umgesetzt.

Eine sichere Firestore-Probe erfolgt mit `FIRESTORE_EMULATOR_HOST=127.0.0.1:PORT` und `verify-project-backup.mjs DATEI --emulator`. Das Prüfwerkzeug akzeptiert ausschließlich lokale Emulatoradressen und schreibt in `demo-aleria-restore-check`. Eine produktive Wiederherstellung erfordert einen eigenen, geprüften Migrationsablauf; das Prüfwerkzeug ist dafür absichtlich nicht verwendbar.

`backup-scene-from-project.mjs DATEI MODUL-ID` prüft einen Szenenexport aus einer solchen Vollsicherung mit dem tatsächlichen Browserimporter. Erst `--apply` legt die vier öffentlichen Dateien auf GitHub an. Dieser Vorgang beendet keine Sitzung und verändert keine Online-Daten. Automatische Sitzungsabschlüsse verwenden weiterhin `endSceneSession` und `writeSceneBackupToGitHub`. Jeder Kommentar steht einmal im Export; Thread-Zuordnung, historische Kommentare und vollständige Mechanikdaten bleiben erhalten.

## Kommentaraktivität und Lesekosten

`indexCommentActivity` schreibt abgeleitete Dokumente in `comment_activity`: vollständige Kommentaranzahl und höchstens 30 kurze Vorschauen je Thread. Der Browser verwendet sie erst nach `comment_activity_meta/state.ready`. Dashboard und Seitenleiste teilen eine Anfrage und einen Cache; bei fehlender Initialisierung oder Fehlern bleibt der bisherige vollständige Leseweg verfügbar. Szenen und Mechaniken verwenden weiterhin die vollständige Historie.

Der Index liest bei einer Kommentaränderung den betroffenen Thread mit projizierten Feldern erneut. Das kostet weiterhin einen Read je Thread-Kommentar, spart aber die wiederholten Komplettabfragen bei Seitenaufrufen. Ein Zeitstempelvergleich verhindert, dass ein verspätetes Ereignis eine neuere Übersicht überschreibt. Die Initialisierung erfolgt erst nach dem Trigger-Deployment mit `node firebase/scripts/operations/backfill-comment-activity.mjs --apply`; sie schreibt ausschließlich die abgeleiteten Dokumente und den Bereitschaftsmarker.

## Anmeldung und Veröffentlichungsrechte

Die produktive Initialisierung am 12. Oktober 2026 umfasst 28 Thread-Zusammenfassungen mit zusammen 3.542 Kommentaren. Die erste Übersichtsabfrage liest 29 Dokumente einschließlich Bereitschaftsmarker statt 3.542 vollständiger Kommentardokumente. Das ist keine gemessene Gesamtreduktion aller Firestore-Kosten. Der Vergleich der Sicherungen vor und nach der Initialisierung hat alle 4.005 ursprünglichen Firestore-Dokumente mit unveränderten Feldern bestätigt.

Die E-Mail/Passwort-Anmeldung im Almanach ist optional. „Gildenpass anlegen“ verknüpft den anonymen Nutzer mit Zugangsdaten und erhält UID und vorhandene Custom Claims. „Anmelden“ wechselt zum gewählten Konto; es führt keine Nutzer zusammen und vergibt keine Rolle. Nach dem Abmelden wird für das Kommentieren ein neuer anonymer Zugang hergestellt. Passwörter werden nur an Firebase Auth übergeben und nicht selbst gespeichert. `browserLocalPersistence` erhält das Konto über einen Browserneustart hinweg; Abmelden, Löschen der Browserdaten und private Browserfenster begrenzen diese Speicherung.

Der frei wählbare Anzeigename ist kein eindeutiger Loginname. Anmeldung und Passwortzurücksetzung verwenden die E-Mail-Adresse. Name und einer von vier freigegebenen Comicavataren werden mit Firebase Auth `updateProfile` gespeichert; es gibt dafür keine zusätzliche Firestore-Collection. Kontoavatare verändern keine Spielfiguren, Kommentarsprecher, Biografien, Kampfbögen oder Rollen. Name und Avatar lassen sich nach der Registrierung im Gildenpass ändern.

Die Bestätigungsmail wird bei der Registrierung nur mit ausgewähltem Kontrollkästchen angefordert, danach über einen eigenen Button. Eine unbestätigte E-Mail sperrt die bisherigen Spielfunktionen nicht. `konto-post.html` verarbeitet ausschließlich Firebase-validierte Einmalcodes für E-Mail-Bestätigung, Passwortzurücksetzung und E-Mail-Wiederherstellung. Es meldet niemanden automatisch an, schreibt keine Spielinhalte und ignoriert fremde Weiterleitungsadressen und API-Schlüssel aus der URL. `configure-account-mail.mjs --apply` prüft vor einer Aktivierung die veröffentlichten Dateien gegen den lokalen Stand, einschließlich Netlifys bekannter Umwandlung des Rücklinks in eine Pretty URL. Kein zusätzlicher Maildienst wird gebucht.

Produktionsstand vom 12. Oktober 2026: Firebase lehnt sowohl die Myrddin-Vorlage als auch Absender/Betreff und die eigene Handler-URL mit `EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED` ab. Deshalb bleiben die Standardvorlage und der funktionierende Firebase-Bestätigungslink aktiv; das Skript meldet diese Einschränkung ausdrücklich. Der Browser fordert die Nachrichten über `auth.languageCode = 'de'` auf Deutsch an. Die Myrddin-Seite ist veröffentlicht und im Emulator geprüft, aber noch kein Ziel der produktiven Bestätigungsmails. Die Netlify-Domain ist als Auth-Domain zugelassen. Eine Freigabe der Vorlagen durch Firebase oder ein gesondert eingerichteter Maildienst wäre für die vollständige Myrddin-Mail erforderlich.

Die illustrierten Konto- und Themenwandbuttons liegen als transparente WebP-Dateien in `AleriaAlmanach/public/assets/account` beziehungsweise `public/assets/topic-board`; die vollständigen Generierungsprompts stehen daneben. Der veröffentlichte Stand wurde auf Desktop und Handy geprüft: Bilder laden, Anmelden und Registrieren öffnen den richtigen Modus, die Themenwand öffnet sich, und es entsteht kein horizontaler Überlauf im Kontofenster. 34 veröffentlichte Dateien stimmen mit dem Release überein, unter Berücksichtigung der nachgewiesenen HTML-Linkumwandlung durch Netlify. Die Bildbuttons ändern keine Speicherwege oder Spielmechaniken.

Die Kontoübergänge und Bestätigungs-/Passwortcodes sind im lokalen Auth-Emulator geprüft. `firebase/tests/auth-account-browser.mjs` prüft zusätzlich den echten Browserneustart, Profiländerungen, unveränderte UID/Redaktionsrechte, fehlerhafte Anmeldung, Abmeldung und erneute Anmeldung sowie Desktop-/Handydarstellung. Es darf ausschließlich mit lokalem Emulator und Demo-Projekt laufen.

Erweiterter Prüfstand vom 12. Oktober 2026: Die vollständige Almanach-Regression besteht mit **1.374/1.374 Tests**, dazu 155 Backend-Tests, 55 Prüfungen des Veröffentlichungs-Gates und 18 Firestore-Regeltests. Von 82 Kampf-Integrationstests bestanden zunächst 80; zwei veraltete Rüstungserwartungen wurden an das bereits geltende Balancing vom 3. Oktober angepasst und gezielt erfolgreich wiederholt. Dabei wurde keine Kampfmechanik geändert.

Der Checkup fand ein veraltetes generiertes Länder-/Wappenverzeichnis. Es wurde aus der verbindlichen Stammbaum-Registry erneuert und umfasst nun 15 Länder und 518 Häuser. Alle 437 vorher enthaltenen Häuser sind unverändert erhalten. Der Website-Build erzeugt das Verzeichnis künftig vor seinen Prüfungen erneut; der Test vergleicht die vollständige Zuordnung mit der Registry statt zusätzlich eine veraltete feste Länderanzahl zu verlangen.

Die Browserprüfungen umfassen Registrierung, bestehende UID und Redaktionsrechte, Profiländerung, Browserneustart mit erhaltenem Konto, Abmeldung, fehlerhafte und erneute Anmeldung sowie Desktop-/Handydarstellung. Zusätzlich bestanden Biografie-Export/-Import/-Bearbeitung, Themenwand, Modul-Migration/-Speicherung/-Export, Kalender und Szenendatum ihre lokalen Browserprüfungen. Die Modulprüfung bestätigt 32 Vorlagen, deren Ressourcen und den Export-/Import-Rundlauf. Der vollständige Almanach und die Mailseite wurden außerdem bei blockierter Firebase-Verbindung geprüft. Schreibende Funktionstests liefen ausschließlich mit lokalen Testdaten beziehungsweise Demo-Emulatoren; dabei wurden keine produktiven Kommentare, Kämpfe oder Konten angelegt.

Die ergänzende Produktionsprüfung war ausschließlich lesend: Das registrierte Bestandskonto behält seine UID und Editorrolle; alle 23 Cloud Functions sind aktiv. Alle 4.034 Firestore-Dokumente stimmen feldweise mit der privaten Sicherung vom selben Tag überein. Der Aktivitätsindex enthält weiterhin genau 3.542 Kommentare in 28 Threads ohne Zählabweichungen. Seit der vorherigen Konto-Veröffentlichung fanden sich bis zum Prüfzeitpunkt keine Laufzeit- oder Kontingentfehler, sondern ausschließlich die bereits dokumentierten Ablehnungen der Mailvorlagen-Konfiguration. Das 10-EUR-Budget, seine Warnschwellen und das aktivierte Backup-Secret wurden bestätigt. Die drei veröffentlichten Archivdateien der Anhörung (Modul, 3.055 Kommentare und Verlauf) wurden erneut von GitHub geladen und gegen die SHA-256-Prüfsummen im Manifest geprüft. Das bestätigt diesen Sicherungsbestand; vollständige Auth- und Storage-Wiederherstellungen bleiben separat zu prüfen.

Karten- und Stammbaum-Publisher prüfen übermittelte Firebase-ID-Tokens. `ALERIA_PUBLISHER_ACCESS_MODE` steht standardmäßig auf `observe`: vorhandene Veröffentlichungen funktionieren weiter, protokolliert werden nur Prüfstatus und Berechtigungsentscheidung, keine Tokens, E-Mail-Adressen oder Nutzer-IDs. Erst nach getesteter Zuordnung beider Nutzer darf `enforce` aktiviert werden. Dann sind ausschließlich die serverseitigen Rollen `editor`, `moderator` und `admin` zugelassen. Ein Anzeigename identifiziert keinen Nutzer. Die anderen Publisher behalten ihre eigenen Zugriffsregeln.

App Check wird nicht ohne Site-Key und beobachtete gültige Zugriffe erzwungen. Das würde bestehende Browser aussperren und ist kein Ersatz für Nutzerrechte.

## Kosten und Veröffentlichungen

`configure-cost-alerts.mjs --apply` verwaltet nur das Aleria-Budget mit 10 EUR pro Kalendermonat, ohne Verrechnung von Testguthaben. Warnschwellen: 20, 50, 80 und 100 Prozent sowie 100 Prozent prognostizierter Kosten. Bestehende andere Budgets werden erhalten. Budgetwarnungen sind kein Ausgabenlimit und stoppen keine Dienste. Das Konto wird dadurch nicht auf einen bezahlten Tarif umgestellt.

Das im Konto angezeigte Google-Testguthaben endet am 3. November 2026. Für dauerhaften Betrieb muss der Kontoinhaber vor Ablauf den gewünschten Abrechnungsstatus prüfen. Firestore hat auf Blaze kein projektspezifisches hartes Kostenlimit. Die Warnung gilt nur für Aleria; ein weiteres Projekt im selben Abrechnungskonto ist davon getrennt.

Netlify wird separat abgerechnet. Beim Audit war automatisches Nachkaufen ausgeschaltet. 97 erfolgreiche Produktionsdeployments im laufenden Abrechnungszeitraum entsprechen nach dem aktuellen Tarif rechnerisch 1.455 Deploy-Credits; dies ist keine Rechnung und kein verifizierter Kontostand. Produktive Veröffentlichungen bündeln. Reine Archiv- und Backup-Commits tragen `[skip ci]`, damit sie keinen Website-Deploy auslösen. Der tatsächliche verbleibende Creditstand muss im Netlify-Abrechnungsbereich geprüft werden.

Der GitHub-Bestand enthält ungefähr 13,9 GB aktuelle Dateien, überwiegend Stammbaumbilder. Das ist eine Wartungs- und Übertragungsfrage. Keine Originale löschen, Bilder massenhaft umbenennen oder Git-Historie umschreiben, bevor Archivziel und sämtliche bestehenden Verweise geprüft sind.

## Vorbereitete ältere Familienarchitektur

## Verantwortlichkeiten

- `firestore.family-trees.rules`: rollenbasierter Zugriff auf private Arbeitsfassungen; Browser-Schreibvorgänge müssen die Revision atomar erhöhen.
- `firestore.family-trees.indexes.json`: versionierte zusammengesetzte Indizes.
- `storage.rules`: öffentliche Bild-Assets sind lesbar; direkte Browser-Uploads bleiben vollständig gesperrt.
- `functions/src/publishing`: serverseitig validierte und bereinigte, unveränderliche Veröffentlichungs-Releases.
- `functions/src/assets`: autorisierte Bild-Uploads, da Storage Rules keine Rollen aus einer benannten Firestore-Datenbank lesen können.
- `scripts/seed-family-workspaces.mjs`: wiederholbarer Import der statischen Registry; ohne `--commit` immer nur Vorschau.
- `tests`: Emulator-Prüfungen für Firestore- und Storage-Regeln.

## Datenstruktur

```text
familyWorkspaces/{familyId}
├── members/{uid}
├── persons/{personId}
├── partnerships/{partnershipId}
├── parentages/{parentageId}
├── houses/{houseId}
├── cadetBranches/{branchId}
├── timeJumps/{timeJumpId}
└── changeSets/{revision}

publishedFamilies/{familyId}
└── releases/{releaseId}/{entityCollection}/{entityId}

registryDraftNodes/{nodeId}
publishedRegistryNodes/{nodeId}
familyAssets/{assetId}
auditEvents/{eventId}
users/{uid}
```

Private Arbeitsfassungen und öffentliche Releases sind getrennt. Eine Veröffentlichung schreibt zuerst einen vollständigen Release und setzt anschließend im selben Batch `activeReleaseId`. Private Notizen, Extensions und nicht öffentliche Beziehungen gelangen nicht in den Release.

## Rollen

- `viewer`: private Arbeitsfassung lesen
- `editor`: bearbeiten und revisionsgebunden speichern
- `reviewer`: bearbeiten und veröffentlichen
- `admin`: Familie, Mitglieder und Veröffentlichung verwalten
- globale Custom Claims `admin` und `archivist`: projektweite Verwaltung

Das bisherige Werkstatt-Passwort `7777` öffnet nur die lokale UI. Firebase-Rechte entstehen ausschließlich durch Firebase Authentication und Mitgliedsdokumente beziehungsweise globale Claims.

## Lokale Prüfung

```powershell
cd firebase
npm install

cd functions
npm install
npm test
```

Rules werden getrennt gegen die Emulatoren geprüft:

```powershell
npx firebase-tools emulators:exec --project aleria-family-rules-test --only firestore "node --test firebase/tests/firestore-rules.test.mjs"
npx firebase-tools emulators:exec --project aleria-family-storage-rules-test --only storage "node --test firebase/tests/storage-rules.test.mjs"
```

## Ersteinrichtung Produktion

Die folgenden Schritte benötigen ein autorisiertes Firebase-Konto mit passenden IAM-Rechten und eine bewusst gewählte Firestore-Region:

```powershell
npx firebase-tools login
npx firebase-tools firestore:databases:list --project aleriaprojekt
npx firebase-tools firestore:databases:create family-trees --project aleriaprojekt --location=REGION --delete-protection=ENABLED
npx firebase-tools deploy --project aleriaprojekt --only firestore,storage,functions
```

Danach E-Mail/Passwort in Firebase Authentication aktivieren, mindestens ein Benutzerkonto anlegen und den Erstimport mit dessen UID ausführen:

```powershell
cd firebase
npm run seed:families -- --owner-uid=FIREBASE_UID
```

Ohne `--owner-uid` erzeugt die Migration bewusst keine Browser-Mitgliedschaft. Vor einem Produktionsimport zuerst den Dry-Run `npm run seed:families:dry` prüfen.

## Noch notwendige Konsolenentscheidungen

- getrenntes Staging-Projekt anlegen und als Alias ergänzen;
- Region der Datenbank festlegen;
- E-Mail/Passwort-Provider und Benutzerkonten einrichten;
- reCAPTCHA Enterprise Site Key hinterlegen und App Check nach einer Monitoring-Phase erzwingen;
- PITR und geplante Backups aktivieren;
- Budgetwarnungen sowie Functions-/Firestore-Monitoring konfigurieren.
