# Gruppen als Abenteuerfolio

Die Featureprojektion ergänzt sieben ausdrücklich angeforderte Gruppen, ohne
Bestände, Charakterbögen oder laufende Szenen zu schreiben. Die beiden
Modulnormalisierungen verwenden `AleriaGroupAdventures.upgradeEntry(entry)`.
Die Fassade komponiert dieses Feature mit dem eigenständigen
`withGawainDuncanContent` aus `modules/gawain-duncan`.

`group-adventure-content.mjs` besitzt die bekannte ID-Liste und den einmaligen
Versionsmarker. Nach einer ausdrücklich gespeicherten Übernahme gewinnen
spätere Nutzeränderungen; ein Neuladen setzt weder Folioauswahl noch Lage,
Mitgliederauswahl oder neue Hierarchien zurück. Die vorhandenen
`commentThreadKey` bleiben erhalten. Alte Seiten ohne Schlüssel werden vor
Einfügen einer Landingseite durch die bestehende Gruppenmigration verankert.

`anaraut-content.mjs` ergänzt den belegten Kontext als Erbe von Celtigerns Wacht
und Adjutant des Marschalls. Die bisherige Gefolgehierarchie behält sämtliche
Rangplätze, Titel, Namen und Porträts; nur leere Beschreibungen bekommen ihren
Dienstzweck. Die zusätzliche Seite `anaraut-arian-ship-hierarchy` führt Arian
Saethwyr als einzige benannte Kapitänin. Alle anderen Bordstellen sind vakant
und verwenden die vorhandenen CSS-Silhouetten. Ein Schiffsname, weitere
Personen oder ein bereits laufender Auftrag werden nicht erfunden.

Idwals fertige Inhaltsseiten und Schiffskatzenbaum bleiben unangetastet.
Auch bei Skalli und den drei Arth-Mannschaften wird ausschließlich die
Landingdarstellung aktiviert. Draigs Leibgarde kommt aus ihrer vorhandenen
öffentlichen authored Modulquelle.

## Quellen und Prüfung

`source/*-2026-11-01.json` enthält ausschließlich öffentliche lokale bzw.
öffentlich lesbare Splitstore-Module. Die sechs Remotequellen wurden am
1. November per lesendem Firestore-REST-GET abgefragt; ihr `updateTime` ist
beigefügt. Für `draig-leibgarde` gab es keinen Splitstore-Datensatz (404),
weshalb ausschließlich die lokale authored Quelle aufgenommen wurde.
Private Dossiers und Browserentwürfe wurden nicht eingelesen.

Arians bestehende Identität ist `bFUmD1snc4TSIGLRPuSx`
(`person--haus-saethwyr--arian-saethwyr`). Ihr bestehendes Porträt stammt aus
dem lokalen öffentlichen Charakterdatensatz. Die neue Kapitänsrolle ist durch
den aktuellen Nutzerauftrag festgelegt.

Der eigene Build verändert nur `group-adventures.global.js`:

```powershell
node AleriaAlmanach/scripts/build-group-adventures.mjs
node AleriaAlmanach/scripts/build-group-adventures.mjs --check
node --test --experimental-test-isolation=none AleriaAlmanach/tests/group-adventure-content.test.mjs
```

Reviewausgaben und eine ID-/Threadübersicht liegen unter
`diagnostics/group-adventures-2026-11-01/`. Eine Veröffentlichung oder
produktive Persistierung fand durch dieses Feature nicht statt. Gruppenkonto,
Belohnungsverteilung und Kreaturgäste gehören zu den gemeinsamen Fachmodulen
und werden hier nicht nachgebaut.
