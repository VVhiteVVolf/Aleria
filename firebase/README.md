# Firebase-Backend der Aleria-Stammbäume

Dieses Verzeichnis enthält die isolierte Backend-Schicht für Familienakten. Die bestehende `(default)`-Firestore-Datenbank des Almanachs wird bewusst nicht verändert. Stammbäume verwenden ausschließlich die benannte Datenbank `family-trees`.

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
