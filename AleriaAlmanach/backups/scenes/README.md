# Automatische Szenensicherungen

Nach „Sitzung beendet“ speichert der serverseitige Sicherungsauftrag je Abschluss einen neuen Ordner:

```text
<modul-id>-<id-hash>/<UTC-Zeitpunkt>-<Backup-ID>/
    module.json       Importierbares Almanach-Modul
    comments.json     Importierbarer Kommentar-Export aller Modulthreads
    history.md        Lesbare Fassung des Verlaufs
    manifest.json     Zeitpunkte, Herkunft, Anzahl und SHA-256-Prüfsummen
```

Dieses Verzeichnis liegt im **öffentlichen** Aleria-Repository. Löschcodes, Löschcode-Hashes und technische Verfasser-IDs werden aus den Kommentardatensätzen entfernt. Texte, IDs der Kommentare und Figuren, Würfe, Effekte und strukturierte Beitragsdaten bleiben erhalten. Bilder und Anhänge sind verlinkt, ihre externen Dateien sind nicht Bestandteil der Sicherung.

Der Export entsteht beim ersten erfolgreichen Lesen durch den Hintergrundauftrag. `requestedAt` bezeichnet den Klick, `capturedAt` den konsistenten Firestore-Lesestand. Spätere Bearbeitungen verändern einen bereits eingefrorenen Export nicht. Erneutes Öffnen und Beenden erzeugt einen weiteren Stand. Mehrfachklicks oder Wiederholungsversuche derselben beendeten Sitzung verwenden denselben Auftrag.

Der Status und ein Link zum bestätigten GitHub-Stand stehen im Redestab-Bereich. Bei einem Fehler bleibt der Auftrag erhalten. „Sicherung erneut versuchen“ überträgt den vorhandenen Export erneut. Nach einem Totalausfall von Firebase lassen sich die Dateien unabhängig aus GitHub herunterladen und lesen; ein Import ins laufende System benötigt dessen Backend.

Einrichtung, Betrieb und Grenzen: [Szenenbackup](../../docs/backup/SCENE_BACKUPS.md).
