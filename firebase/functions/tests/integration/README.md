# Kampfprüfung mit Firestore-Emulator

Diese Tests führen die produktiven Callable-Handler mit echter Firestore-Speicherung aus. Die Würfelbelege kommen aus dem Frontend-Kampfsystem; die Handler berechnen sie mit den Servermodulen erneut. Profile sind Kopien der Charakterbogen- und Inventardaten von Gildas und Gawain. Firebase-Login und produktive Sicherheitsregeln werden hier nicht getestet: Die Testaufrufe erhalten explizite lokale Spieleridentitäten.

Benötigt wird ein separater Firestore-Emulator auf **127.0.0.1:8180**, mit dem Projekt **demo-aleria-combat-checkup**. Die Tests leeren ausschließlich diese feste Demo-Datenbank vor jedem Test. Sie lehnen den Start ohne die passende lokale Emulatoradresse ab.

Beispiel in PowerShell, aus `firebase/functions`, bei bereits laufendem Emulator:

```powershell
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8180'
npm run test:combat-integration
```

Die Integrationstests laufen bewusst separat vom normalen `npm test`. Sie prüfen Start/Sperren, atomare Handlungen und Rücknahmen, zwei gleichzeitige Testspieler, einmalige EP-Vergabe, veraltete Entwürfe, abhängige Beiträge, Aktion plus Bonusaktion, ausgeschiedene Figuren, ein vollständiges Duell bis 0 TP und die Zuordnung persistenter Profile.
