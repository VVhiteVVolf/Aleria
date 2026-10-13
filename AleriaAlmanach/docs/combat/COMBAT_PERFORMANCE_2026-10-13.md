# Kampf-, Beitrags- und Würfelperformance · 13. Oktober 2026

Der Nutzer meldete Verzögerungen und gelegentliche Abstürze insbesondere beim
Absenden/Speichern in Opera GX und Chrome. Dieser Release verbessert die gemeinsame
Profilberechnung, die Lebensdauer der 3D-Würfel und den Abschluss bestätigter
Beitragsspeicherungen.

## Befunde und Messgrenzen

Eine ausschließlich lesende Auswertung der vorhandenen Serverprotokolle ergab bei
neun Kampfspeicherungen einen Median von 5,31 Sekunden und ein Maximum von 8,04
Sekunden. 45 normale Beitragsspeicherungen lagen bei 0,73 Sekunden im Median.
Diese Werte enthalten die Serverlaufzeit; Würfelanimation, Browserdarstellung und
der gesamte Netzwerkweg sind damit nicht vollständig gemessen.

Für die lokale Analyse wurde eine bestehende Szene mit 162 Beiträgen verwendet.
Das reine Fortschreiben des Szenenstands dauerte ungefähr 4,4 Millisekunden.
Der CPU-Profiler zeigte dagegen viele wiederholte vollständige Normalisierungen
derselben Charakterprofile, insbesondere ihrer umfangreichen Techniklisten.

| Lokale Messung, zehn Durchläufe nach Aufwärmen | Vorher, Median | Nachher, Median |
| --- | ---: | ---: |
| Vorbereitung eines Kampfbeitrags | 1.062 ms | 157 ms |
| Autoritative Berechnung der Speichertransaktion ohne Datenbank-/Netzwerkwartezeit | 789 ms | 138 ms |

Die Testtransaktion verwendet die echte Mechanik und einen lokalen atomaren
Datenbankadapter. Sie schreibt niemals in die Online-Szene. Unter gleichzeitigem
Testbetrieb lagen weitere Kandidatenmessungen bei 232 bzw. 208 ms. Die Tabellenwerte
beschreiben lokale Rechenzeit und sind keine Zusage für die gesamte Online-Speicherdauer.
Die Antwortgröße bleibt mit rund 658 KB unverändert.

## Änderungen und Verantwortlichkeiten

- `combat-profile-read-model.js` verwaltet getrennte, rekursiv unveränderliche
  Berechnungssnapshots. Eine private `WeakSet` erkennt ausschließlich lokal erzeugte
  Snapshots. Veränderliche Bögen werden weder eingefroren noch zwischengespeichert;
  übertragene JSON-Daten durchlaufen weiterhin die normale Validierung.
- `combat-profile-model.js`, `combat-profile-resolver.js` und
  `combat-profile-context.js` normalisieren innerhalb einer Berechnung einmal und
  verwenden den Snapshot für die vielen Attribut-, Waffen-, Technik-, Zauber- und
  Fertigkeitsabfragen. Die generierten Servermodule übernehmen dieselbe Quelle.
- `scene-dice/dice-service.js` hält eine gemeinsame 3D-Engine für Szenen-, Kampf-
  und Fertigkeitsfenster. Containerwechsel versetzen deren Canvas. Gleichzeitige
  Initialisierung erzeugt ebenfalls nur eine Engine; ein laufender Wurf kann durch
  ein anderes Fenster weder verschoben noch geleert werden.
- Der gezielte Build-Patch `scripts/dice-box-lifecycle-patch.mjs` ergänzt bei der
  fest gepinnten Dice-Box-Version 1.1.4 das Versetzen des Canvas und einen einzigen
  Resize-Listener. Resize wartet auf die fertige Physikwelt. Der Patch bricht bei
  unerwartetem Quelltext ab und wird über den bestehenden Vendor-Build angewandt.
- `comments-submit.js` unterscheidet bestätigtes Speichern von nachfolgenden
  Darstellungsfehlern. Scheitert der Szenen-Refresh nach der Bestätigung, erscheint
  ein Hinweis zum Neuladen. Es folgt kein zweiter lokaler Schreibversuch.
- Alle drei Würfelverbraucher importieren dieselbe versionierte Service-URL.
  Aktualisierte HTML-Einstiegspunkte laden den neuen Stand.

Vorher stieg die Workerzahl bei fünf Würfelfensterwechseln von zwei auf zehn.
Nachher bleiben bei 100 Wechseln zwei Worker aktiv; das erneute Vorbereiten benötigt
unter einer Millisekunde statt etwa 120 ms. Zufallsmechanik, Würfelformeln und
Animationsphysik werden durch diesen Release nicht geändert. Der reproduzierte
Ressourcenverlust ist behoben; damit sind nicht automatisch sämtliche möglichen
Absturzursachen auf jedem Gerät ausgeschlossen.

## Prüfung

- Neue Regressionstests prüfen isolierte Berechnungssnapshots, unveränderte Werte,
  gleichzeitige Würfelinitialisierung, Fenstertausch, Schutz laufender Würfe,
  Textfallback und bestätigte Speicherungen bei anschließendem Anzeigefehler.
- Neun vollständige Charakter- und Zielprofile wurden gegen die bisherige
  Implementierung verglichen, einschließlich identischer aktueller Metadaten.
- Breiter Browsermechanik-Lauf: 736 Tests bestanden. Eine zusätzliche Archivprüfung
  für exakte Wolfshorn-Exports ist von parallel bearbeiteten Reittierdatensätzen
  betroffen und wurde im abgegrenzten Release-Lauf ausdrücklich ausgelassen.
  Für diesen Lauf werden die unveränderten Reittiermodule über einen temporären
  Testloader gelesen; diese Module und Datensätze gehören nicht zu diesem Release.
- 161 Servertests und 73 lokale Firestore-Integrationstests bestanden. Letztere
  umfassen echte Transaktionen, Parallelzugriffe, Kosten, Zustände, Konzentration,
  Gegenangriffe und Rücknahmen.
- Chromium-Browsertest: 100 Canvaswechsel, anschließend echter 3D-W20 mit Modifikator,
  zwei Worker, keine Browserfehler.
- Szenenprofil-Browsertest auf Desktop und Mobilansicht: aktuelle TP, Ressourcen,
  Zustände, begrenzte Itemnutzungen, Gegenangriffe, entfernte Aktualisierungen,
  erneutes Rendern und Cache-Invalidierung bestanden. Scrollposition und geöffnete
  Detailbereiche bleiben erhalten.

Die lokalen Messdaten und lesend exportierten Szenendaten bleiben im ignorierten
Arbeitsordner `.codex-temp/combat-performance`. Historische Beiträge, Würfe,
Live-TP, Ressourcen und Online-IDs werden durch diesen Release nicht migriert.
