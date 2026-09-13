# Gildas gegen Gawain: Waffenführung, Duellprobe und Speicherprüfung

Stand: 13. September 2026. Lokaler Quellstand, keine Veröffentlichung und keine Änderungen an produktiven Firebase-Daten.

## Waffenführung

Bei vielseitigen Waffen ist einhändige Führung präziser. Zweihändige Führung verwendet den größeren Waffenwürfel und erhält **−1 auf den Angriffswurf**. Die bisherigen Aktionspakete bleiben erhalten. Für Gawains Ritterschwert bedeutet das ohne situationsabhängige Boni:

| Führung | Angriff | Schaden | Kosten |
| --- | ---: | --- | --- |
| Einhändig | +5 | 1W8 + 2 | 1 Aktion |
| Zweihändig | +4 | 1W10 + 2 | 1 Aktion |

Waffengebundene Techniken übernehmen diesen Unterschied. Ihre separaten Ausbildungswürfel bleiben erhalten: Gawains Drachenbiss verwendet beispielsweise einhändig 2W8, zweihändig 1W10 + 1W8; jeweils zuzüglich seines Schadensmodifikators. Echte, ausschließlich zweihändige Waffen bekommen keinen zusätzlichen Abzug aus dieser Vielseitigkeitsregel. Aura verändert den Präzisionsabzug nicht.

Eine geführte Zweitwaffe sperrt die vielseitige Führung. Ein ausgerüsteter Schild oder ein hinterlegter Schildbonus blockiert den Zweihandangriff auch serverseitig; der Griff legt den Schild nicht automatisch ab. Die gemeinsame Schildprüfung wird auch von Klassenanforderungen verwendet. Der beschreibende Hinweis „1W10 bei zweihändiger Führung“ verhindert nicht mehr irrtümlich, dass ein Ritterschwert zusammen mit einem Dolch geführt wird.

Die Regel liegt in `modules/combat/combat-weapon-grip.js`. Auswahl, Angriffswert, Trefferchancenvorschau und tatsächliche Serverauswertung verwenden dieselbe Auflösung. Der Server übernimmt keine vom Client behaupteten Angriffsboni.

## Ergebnis der 400 Duelle

| Gildas führt | Gawain führt | Siege Gildas | Siege Gawain | Unentschieden | Mittlere Rundenzahl |
| --- | --- | ---: | ---: | ---: | ---: |
| Einhändig | Einhändig | 82 | 18 | 0 | 3,09 |
| Zweihändig | Zweihändig | 79 | 21 | 0 | 3,09 |
| Zweihändig | Einhändig | 82 | 18 | 0 | 3,13 |
| Einhändig | Zweihändig | 82 | 18 | 0 | 3,03 |
| **Gesamt** | | **325** | **75** | **0** | |

**Gildas ist unter dieser Spielweise deutlich favorisiert.** Er gewinnt 81,25 % der durchgeführten Kämpfe. Die Waffenführung allein gleicht den Unterschied der Figuren nicht aus. Sie ist jetzt eine Abwägung zwischen Treffergenauigkeit und Schaden. Die kleinen Unterschiede zwischen den vier Reihen sind keine belastbare allgemeine Rangfolge der Führungen.

### Ausgangswerte und Bedingungen

Verwendet wurden ausschließlich Kopien der lokalen Dateien `Charakter Archiv Exporte/gildas-gafyr.json` und `gawain-draig.json`, keine behaupteten Live-Abfragen. SHA-256-Prüfsummen und Ausgangswerte stehen in [results.json](duel-checkup-2026-09-13/results.json). Beide Originaldateien blieben unverändert.

| Wert | Gildas | Gawain |
| --- | ---: | ---: |
| Stufe | 6 | 5 |
| Trefferpunkte | 58 | 49 |
| Verteidigung | 16 | 16 |
| Einhändiger Angriff | +6 | +5 |
| Schadensmodifikator | +3 | +2 |
| Initiative | +4 | +3 |

Jedes Duell beginnt mit den vollständig erholten Ausgangsbögen, dem eigenen Ritterschwert und ohne vorherige Szenenwirkungen. Beide haben 0 Aura-Fokuspunkte. Initiative wird ausgewürfelt; Gleichstände werden über die Seed-Parität entschieden. In jeder Reihe beginnt Gildas 49-mal und Gawain 51-mal. Alle vier Reihen verwenden dieselben 100 Seeds. Wiederholungen eines Seeds über verschiedene Reihen sind keine unabhängigen Stichproben.

Die Strategie ist für beide identisch: Aus den vorhandenen kompatiblen Waffenangriffen und Schadentechniken wird die Kombination mit der höchsten geschätzten Schadenssumme innerhalb des verfügbaren Ressourcenpakets gewählt. Eine Technik wird höchstens einmal je eigenem Gesamtbeitrag geplant. Verbleibende Tagesressourcen werden berücksichtigt und nicht pro Runde erneuert. Aktionen eines Beitrags teilen sich ihr Budget. Die Planung kennt keine zukünftigen Würfe. Sie schätzt Trefferchancen vereinfacht; tatsächliche Treffer, natürliche 1/20, Folgeangriffe, automatische Regeln, Schaden und Zustände kommen vollständig aus den produktiven Kampfmodulen.

Keine aktiven Defensiv-/Bufftechniken, keine optional ausgewählten Schutzreaktionen, keine erfundenen Sonderaktionen, keine Geländeboni und keine Erfahrungspunkte. Automatische Passiva sowie durch gewählte Angriffe ausgelöste Wirkungen bleiben aktiv. Dies ist eine reproduzierbare offensive Spielweise, keine Simulation sämtlicher menschlicher Taktiken. Ein eigener Gesamtbeitrag entspricht einer Gelegenheit pro Runde; das Produktionssystem erzwingt damit noch keine allgemeine Zugreihenfolge. 0 TP beendet das Duell als Kampfunfähigkeit.

Die 400 Kämpfe enthalten **6.251 Zielauswertungen**. Kein Kampf erreicht das Sicherheitslimit von 60 Runden. Die gesamte Ergebnistabelle liegt in [duels.csv](duel-checkup-2026-09-13/duels.csv), ausgewählte Verläufe einschließlich Würfen in [selected-traces.json](duel-checkup-2026-09-13/selected-traces.json).

### Speicherung und Rücknahme

Zwölf ausgewählte vollständige Duelle, darunter Siege beider Figuren und lange Verläufe, wurden erneut gegen den ausschließlich lokalen Firestore-Emulator `demo-aleria-combat-checkup` auf `127.0.0.1:8180` ausgeführt. Jeder gespeicherte Abschnitt wurde mit der Simulation verglichen: Schaden, Trefferpunkte und sämtliche Ressourcenstände. Danach wurden Kampfabschluss und Rücknahme des Abschlusses sowie des letzten Kampfbeitrags geprüft. Alle zwölf Duelle bestanden; [Servernachweis](duel-checkup-2026-09-13/server-verification.json).

Drei zusätzliche Integrationstests prüfen den serverseitigen Angriffswert trotz manipulierter Vorschau, Bonusaktion und Zweihandangriff innerhalb desselben Gesamtbeitrags sowie die Ablehnung eines zwischenzeitlich ausgerüsteten Schildes ohne Teilbuchung.

## Speicher beim Auswählen und Bearbeiten

Der Editor berechnete bei jeder relevanten Auswahländerung vollständige Zielprofile und je Ziel zwanzig Trefferproben für die gesamte verfügbare Figurenliste. Zusätzlich konnte der Profilcache beliebig viele Kombinationen aus Angriff, Führung, Wirkungsgrad und Zahlungsart je dauerhaft referenzierter Figur behalten.

Die Zielauswahl enthält weiterhin alle Figuren. Vollständige Vorschauen werden jetzt für aktuelle Beteiligte, ausgewählte Figuren und mögliche Reaktionsquellen berechnet. Ein zuvor unbeteiligtes Ziel bekommt seine Werte unmittelbar bei Auswahl. Profilvarianten sind auf die acht zuletzt verwendeten Einträge pro Quellfigur begrenzt. Reine Editorvorschauen bauen keinen zusätzlichen vollständigen Erzählkontext auf; echte Auswertungen behalten ihn. Beim Schließen von Erstellen- oder Bearbeiten-Dialog werden Kampfoberfläche, Zustandstracker, Kontext und Caches freigegeben.

Gemessen wurde in einem lokalen, unsichtbaren Edge-Testbrowser mit echten Controller- und Darstellungsmodulen, ohne externe Netzaufrufe:

| Messung: 150 auswählbare Figuren, 30 Führungswechsel | Vorher | Nachher |
| --- | ---: | ---: |
| Erster Aufbau | 1.479 ms | 142 ms |
| Mittlerer Wechsel | 176 ms | 28 ms |
| Belegter JavaScript-Heap nach erzwungener Speicherbereinigung | 9,33 MB | 6,03 MB |

Der größere Stresstest mit **1.000 auswählbaren Figuren und 120 Wechseln** blieb ohne JavaScript-Fehler. Nach der Aufwärmphase stieg der bereinigte Heap nur von 6,38 auf 6,43 MB; die Zahl der Listener blieb bei 34 und die DOM-Knotenanzahl stabil. Nach Freigabe der Oberfläche blieben 28 DOM-Knoten und 22 Listener des Testdokuments. Ein zuvor unberechnetes Ziel ließ sich auswählen und zeigte anschließend seine korrekten Werte. Desktop (1280 px) und Mobilansicht (390 px) zeigten keinen horizontalen Seitenüberlauf.

Messwerte: [vorher](duel-checkup-2026-09-13/browser-before.json), [nachher](duel-checkup-2026-09-13/browser-after.json), [Stresstest](duel-checkup-2026-09-13/browser-stress.json). Die Werte sind JavaScript-Heap-Messungen des isolierten Editors, keine Messungen des gesamten Browserprozesses. Der gemeldete Speicherabsturz ließ sich nicht direkt reproduzieren; die verringerte Last ist nachgewiesen, eine Behebung jeder möglichen Absturzursache nicht.

## Abschlussprüfungen und Wiederholung

- Frontend: **838 von 839 Tests erfolgreich**. Der bereits vor der Änderung beobachtete unabhängige Fehler betrifft die fehlende Rüstungsroutine-Zuordnung für **Grungar**. Gildas und Gawain sind Teulu; ihre Tests bestehen.
- Server-Testsuite: **110 Tests erfolgreich**.
- Emulator: **15 Tests erfolgreich**, davon zwölf vollständige Duelle und drei Waffenführungsregressionen.
- Browser: Auswahl, spätes Nachladen von Zielwerten, Speicherstresstest und Freigabe erfolgreich.
- Produktionsbuild und `git diff --check` erfolgreich. Der Build meldet weiterhin große Bundles.

Reproduzierbare Simulation aus dem Projektordner `AleriaAlmanach`:

```powershell
node tools/duel-rehearsal/run-duels.mjs
```

Standard sind 100 Duelle pro Führungskombination, steuerbar über `DUEL_COUNT`. Die Ergebnisdateien werden aktualisiert. Für den Servernachweis zuerst die Simulation auf dem aktuellen Stand ausführen und dann, bei laufendem dediziertem Emulator, aus `firebase/functions`:

```powershell
node scripts/sync-almanach-mechanics.mjs
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8180'
$env:DUEL_SERVER_REPORT = '1'
node --test --test-concurrency=1 tests/integration/combat-weapon-grip.integration.mjs tests/integration/combat-duel.integration.mjs
```

Die Testfixtures verweigern jede andere Emulatoradresse und leeren ausschließlich das feste Demo-Testprojekt. Browserprogramm und vollständige Testlogs stehen lokal unter `.codex-temp/duel-checkup/`.
