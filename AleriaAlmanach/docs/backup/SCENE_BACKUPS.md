# Szenenbackup nach GitHub

## Umfang

„Sitzung beendet“ für `::session:`-Threads ruft `endSceneSession` auf. Die Firebase-Rolle **Editor, Moderator oder Admin** ist nötig, damit anonyme Besucher keine GitHub-Veröffentlichungen auslösen können. Normale Redestab-Wechsel verwenden die bestehende Speicherung.

Der Abschluss und der Auftrag in `scene_backup_jobs` entstehen in einer Firestore-Transaktion. `writeSceneBackupToGitHub` liest alle Kommentare des Moduls einschließlich historischer Seiten-/Szenenthreads. Die Leseabfragen, Redestab-Stände und der gespeicherte Modulstand bilden einen konsistenten Read-only-Transaktionsstand. Der aktuelle Firebase-Modulstand hat Vorrang; für unveränderte eingebaute Module dient der vorhandene Modulexport aus dem Browser als Basis. `manifest.json` nennt die Herkunft.

Der Export wird unter `scene-backup-staging/<id>/snapshot.json.gz` einmalig in Cloud Storage abgelegt, ohne öffentlichen Downloadtoken. Wiederholungen verwenden exakt diesen Stand. Kommentare, Charaktere, Kreaturen, Würfe, Effekte und Live-Ressourcen werden nicht geschrieben oder neu ausgewertet. Nur Abschlussstatus und Backup-Belege werden gespeichert.

Die vier Dateien landen gemeinsam in einem GitHub-Commit auf `VVhiteVVolf/Aleria`, Branch `master`, unter `AleriaAlmanach/backups/scenes`. Der Branch wird ohne Force aktualisiert; gleichzeitige Commits werden berücksichtigt. Das vorhandene Manifest verhindert doppelte Stände nach verloren gegangenen Antworten. Der sichtbare Status `saved` entsteht erst nach bestätigter Branch-Aktualisierung bzw. Nachweis des identischen Manifests.

## Einmalige Einrichtung

Am 12. Oktober 2026 hat der Nutzer ausdrücklich die vorhandene GitHub-CLI-Anmeldung für den Backup-Server freigegeben. Sie wurde ohne Klartextausgabe oder Schlüsseldatei in Secret Manager hinterlegt. Dieser OAuth-Zugang besitzt weitergehende Repository-Rechte. Bei einer späteren Erneuerung kann er durch einen nur auf Aleria beschränkten Schlüssel ersetzt werden.

1. Einen **Fine-grained GitHub Personal Access Token** für ausschließlich `VVhiteVVolf/Aleria` mit Repository-Recht **Contents: Read and write** erstellen. Ablaufdatum und gegebenenfalls Branch-Regeln berücksichtigen. Der Schlüssel gehört ausschließlich in Firebase Secret Manager, niemals in Quelltext, Module, GitHub-Backups oder Chat.
2. Im Projektverzeichnis den interaktiven Geheimnisdialog verwenden:

   ```powershell
   firebase functions:secrets:set ALERIA_SCENE_BACKUP_GITHUB_TOKEN --project aleriaprojekt
   ```

3. Backend und Regeln gezielt veröffentlichen:

   ```powershell
   firebase deploy --only functions:family-trees:endSceneSession,functions:family-trees:writeSceneBackupToGitHub,firestore:rules --project aleriaprojekt
   ```

4. Die geänderten Almanach-Dateien über den bestehenden Website-Release veröffentlichen. Regeln, Backend und Browser-Release gemeinsam ausrollen: alte Browserstände können Szenen mit den neuen Regeln nicht mehr direkt auf `ended` setzen.
5. Mit einer Testszene prüfen: „Sitzung beendet“, Status `saved`, GitHub-Link, vier Dateien, Kommentaranzahl und Prüfsummen. Wiederholtes Beenden ohne Wiedereröffnen darf keinen zweiten Ordner erzeugen. Eine produktive Szene nicht zu Testzwecken beenden.

Nicht geheime Parameter haben voreingestellte Werte: `ALERIA_SCENE_BACKUP_GITHUB_REPOSITORY=VVhiteVVolf/Aleria`, `ALERIA_SCENE_BACKUP_GITHUB_BRANCH=master`. Eine Änderung des Ziels muss dessen Sichtbarkeit und Lesezugriff berücksichtigen. Der Laufzeit-Serviceaccount benötigt Firestore- und Cloud-Storage-Zugriff sowie Zugriff auf das gebundene Secret; Cloud Functions benötigt aktivierte Eventarc-Infrastruktur und passende Abrechnung wie die übrigen Backend-Funktionen.

## Fehler und Grenzen

- Temporäre Übertragungsfehler werden bis zu acht Versuche lang erneut versucht. Endgültige Fehler zeigen `failed`; der Button versucht denselben Stand erneut. Eine abgelaufene Worker-Sperre kann durch erneutes Beenden wieder angestoßen werden.
- Fehlende/abgelaufene Schlüssel, fehlende Rechte oder Branch-Regeln müssen zuerst korrigiert werden. HTTP-Fehler werden ohne Schlüssel oder GitHub-Antwortinhalt angezeigt. Den Secretwert nie zur Diagnose ausgeben.
- Cloud-Storage-Zwischenstände bleiben für Wiederherstellung und Diagnose erhalten. Es gibt keine automatische Löschung oder Rotation von Backups.
- Der Modulexport im Auftrag ist auf 750 KB begrenzt, der eingefrorene Gesamtstand auf 80 MiB und eine einzelne GitHub-Datei auf 50 MiB. Überschreitungen brechen sichtbar ab; es wird niemals ein gekürzter Kommentarbestand als erfolgreiche Sicherung gemeldet.
- Der Sicherungszeitpunkt ist `capturedAt`, beim ersten Verarbeiten. Zwischen dem Klick und diesem Zeitpunkt eintreffende Änderungen können enthalten sein. Wird die Szene sofort wieder eröffnet, wird ihr Abschlussbeleg trotzdem als beendet exportiert. Der Live-Redestab wird durch einen verspäteten Auftrag nicht zurückgesetzt.
- Externe Bilder, Porträts und Dokumente bleiben Referenzen. Für vollständig unabhängige Medienarchive wäre ein zusätzlicher, eigener Asset-Export nötig.
- Ein Backup-Commit kann beim Hosting einen normalen Repository-Deploy auslösen. `[skip ci]` ist im Commit enthalten; Verhalten des konkreten Hosters prüfen.

## Wiederherstellung

`module.json` verwendet den vorhandenen `aleria-module`-Import. `comments.json` verwendet `aleria-module-comments-export` und lässt sich über den bestehenden Kommentarimport einem Thread zuordnen. Mechanische Beiträge bleiben beim vorhandenen Import historische Belege; sie werden nicht als neue Kampfhandlungen angewendet. Der Backup-Ordner ist auch ohne Firebase lesbar. Dies ist ein Szenenarchiv, kein vollständiges Backup aller Charakterprofile und Inventare.

## Prüfung

Produktivprüfung am 12. Oktober 2026: Beide Funktionen und Regeln sind veröffentlicht. Ein temporärer Firebase-Testnutzer mit Editor-Claim hat den echten HTTPS-Abschluss zweimal aufgerufen; beide Antworten nannten denselben Auftrag. Der Hintergrundauftrag speicherte zwei Testkommentare und das Modul im ersten Versuch. Alle vier GitHub-Dateien, ihre Prüfsummen und das Entfernen technischer Verfasser-/Löschdaten wurden unabhängig über die öffentlichen Dateien bestätigt. Testnutzer, Testkommentare und Redestab-Fixture wurden anschließend entfernt; der [GitHub-Sicherungsstand](https://github.com/VVhiteVVolf/Aleria/tree/5296e4e14b6c662621320cf07761ad7b0700c8e1/AleriaAlmanach/backups/scenes/scene-backup-systemtest-20261012-81bd7f85-c65bd9c114/2026-10-12T12-17-04-504Z-38bf1dac-4dc3-4e05-9ffd-ef13f5f76934) bleibt als Beleg erhalten. 154 Backend-Tests und 17 Firestore-Regelprüfungen bestanden; Desktop- und Handyansicht wurden visuell geprüft.

```powershell
npm --prefix firebase/functions test
node --test AleriaAlmanach/tests/scene-backup-ui.test.mjs
npm --prefix firebase run test:rules
```

Referenzen: [Firestore-Trigger und mehrfache Zustellung](https://firebase.google.com/docs/functions/firestore-events), [Firebase Secret Manager](https://firebase.google.com/docs/functions/config-env), [GitHub Git Trees](https://docs.github.com/en/rest/git/trees), [GitHub Git References](https://docs.github.com/en/rest/git/refs).
