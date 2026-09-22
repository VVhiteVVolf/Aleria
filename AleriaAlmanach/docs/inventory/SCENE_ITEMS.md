# Gegenstand Einfügen

Stand: 22. September 2026. Lokal implementiert und geprüft, noch nicht veröffentlicht.

Der Erzähler kann neben Handlung einen Abschnitt **Gegenstand Einfügen** verwenden.
Registervorlagen sind nach Warengruppe und Sortiment geordnet; eigene Gegenstände
haben Bildlink, Kartentyp, Kurzbeschreibung, Szenentext, Handelspreis (einschließlich
Pfennigen), Diagrammwerte und Infotabelle. Waffen und Rüstungen besitzen editierbare
Kampfwerte. Beschriebene Freitextwirkungen sind Erzählerregeln; automatische
Vorlageneffekte werden aus dem serverseitig gelesenen Register übernommen.

Die blaugraue Gegenstandsblase öffnet den vorhandenen Inventar-Kartenrenderer.
Der Entwurf und seine Vorgangskennung überstehen Schließen und Wiederherstellen.
Escape in der Karte schließt nur die Karte.

## Gemeinsame Datenquelle

- `scene-item-definition.js`: gemeinsamer Vertrag für Editor und Server.
- `scene-items-composer.js`: gekapselte Eingaben und Vorlagen; kein eigener Besitzspeicher.
- `commitSceneItem` / `scene-item-authoring.js`: autorisierte, atomare Speicherung
  des gesamten Erzählerbeitrags; Standard- und Angebotsvorlagen werden auf dem
  Server gelesen. Wiederholte Vorgänge erzeugen keine zweite Kopie.
- Szenenereignisse machen den Fund sofort für **Interagieren → Aktive Szene** verfügbar.
- Aufnahme läuft durch die bestehende Kampf-/Inventartransaktion. Sie schreibt
  `characters/<id>.inventory` und die verknüpfte Ausrüstung gemeinsam und verhindert
  konkurrierende Doppelaufnahmen. Die `instanceId` bleibt erhalten.
- Handelsregister, Charakterbogen und Archiv lesen denselben Online-Besitz.
  Registerdetails übernehmen auch Diagramm und Infotabelle der individuellen Instanz.
  Ein lokales Klassenupdate darf Online-Ausrüstung nicht verdrängen.
- Es entsteht weder ein erfundener Kaufbeleg noch ein zusätzlicher Händlerbestand.
  Aufgenommene Funde erscheinen im Register unter **Individuelle Listen** der Figur.
- Ein Platzierungsbeitrag kann erst zurückgenommen werden, wenn abhängige
  Aufnahmen/Verwendungen ebenfalls zurückgenommen wurden. Bei Verbindungsfehlern
  bleibt der Entwurf stehen; es gibt keinen lokalen Ersatzbesitz.

## Prüfung und Veröffentlichung

`scene-item-authoring.test.mjs` prüft sechs Kartentypen, Preise, Vorlageneffekte,
Validierung, HTML-Escaping und Szenenprojektion. Die Firestore-Integration
`scene-item-authoring.integration.mjs` prüft mehrere Gegenstände pro Beitrag,
Idempotenz, unabhängigen Online-Leser, Aufnahme, Bogen-/Archiv-/Registerparität,
Kampfverwendung, Rücknahme und atomare Fehlerbehandlung. Sie läuft ausschließlich
gegen `demo-aleria-item-duels` auf `127.0.0.1:8182`.

Zusätzlich geprüft: bestehende Inventar-/Archiv-/Kampfregressionen, 40 erfolgreiche
Emulatorprüfungen einschließlich der vollständigen Duelle und Browserbedienung auf
Desktop/Mobilgerät. Die zwei bekannten Duell-Skips betreffen fehlende Kampfbögen
von Gais und Nudd. Produktionsbuild erfolgreich.

Frontend und aktualisierte Funktion `commitSceneItem` müssen gemeinsam freigegeben
werden. Bis zum Abschluss des laufenden Gildas–Gawain-Kampfes bleiben die Änderungen
lokal; keine Live-Daten wurden für diese Tests geändert.
