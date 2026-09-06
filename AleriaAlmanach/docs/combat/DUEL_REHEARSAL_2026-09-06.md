# Generalprobe: Gawain Draig gegen Gildas Gafyr

## Wiederholung nach dem gewünschten Balance-Fix

**Nach dem Fix: 1.100 Duelle, 132 Siege für Gawain, 963 für Gildas und 5 doppelte K. o.** Die erste Messreihe bleibt weiter unten als Vergleich erhalten. Beide Reihen verwenden dieselben Seeds und Strategien; sie sind keine voneinander unabhängigen Stichproben.

Gildas hat jetzt **KON 13 statt 14**, dadurch **58 statt 65 maximale LP** und **RK 16 statt 19**. Gawain bleibt bei **49 LP und RK 16**. Die beiden gespeicherten Live-Figuren und die Archivdaten wurden entsprechend aktualisiert. Vorhandener LP-Verlust wird bei der KON-Anpassung erhalten; die zum Änderungszeitpunkt vollständig erholten Figuren bleiben vollständig erholt.

**Rüstungsroutine** schaltet den Geschicklichkeitsanteil angelegter Rüstung für alle 78 im Register geführten Kämpfer- und Kampfhybridklassen erst auf **Stufe 12** frei. Die sieben reinen Zauber-/Alchemieklassen bleiben außerhalb dieser Regel. Die zentrale Klassenregel gilt auch bei alten Ausrüstungseinträgen mit Freischaltung 0 oder 6. Der gewählte GES-Modus, eine Rüstungsbegrenzung oder eine ausdrücklich spätere Ausrüstungsfreischaltung bleiben verbindlich. „GES: Nicht“ bleibt eine Ausrüstungsentscheidung; die Eigenschaft überschreibt keinen solchen Ausschluss und keinen ausdrücklich festen RK-Endwert. Schild-, Magie- und andere Effekte werden weiter berücksichtigt. Ungerüstete Abwehr, Initiative, Fertigkeiten und Waffenangriffe behalten ihre bisherigen Geschicklichkeitsregeln.

Das Merkmal wird aus Klasse und Stufe berechnet, nicht als zusätzlicher Zahlenbonus in den Bogen kopiert. Dadurch funktionieren Freischaltung, erneutes Laden und Zurückstufen ohne Doppelbonus. Sichtbar ist es im Charakterbogen, der Aufstiegsvorschau sowie den ausgearbeiteten Universal- und Cenyr-Klassenseiten.

| Variante nach dem Fix | Duelle | Gawain | Gildas | Doppel-K. o. | Ø Runden | Kürzestes | Längstes |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Nur Grundwaffen | 250 | 49 (19,6 %) | 201 (80,4 %) | 0 | 11,76 | 6 Runden / 11 Beiträge | 21 Runden / 41 Beiträge |
| Erlernte Techniken, auf Schaden optimiert | 250 | 18 (7,2 %) | 232 (92,8 %) | 0 | 4,10 | 2 Runden / 3 Beiträge | 7 Runden / 14 Beiträge |
| Automatische Buffs und Debuffs | 250 | 28 (11,2 %) | 222 (88,8 %) | 0 | 5,39 | 3 Runden / 5 Beiträge | 9 Runden / 18 Beiträge |
| Betäubung und Blutung mit Testleitung | 250 | 24 (9,6 %) | 221 (88,4 %) | 5 (2 %) | 6,49 | 3 Runden / 5 Beiträge | 12 Runden / 23 Beiträge |
| Wechselnde Jungdrachenattacken | 100 | 13 (13 %) | 87 (87 %) | 0 | 4,96 | 2 Runden / 3 Beiträge | 11 Runden / 22 Beiträge |

**Kürzestes Duell:** 2 Runden / 3 Beiträge, beispielsweise Technik-Seed `328043677`, Sieger Gildas mit 45 LP. Der erste Gildas-Beitrag verursacht weiterhin 29 Schaden; Gawain trifft nun in seinem Beitrag für insgesamt 13 Schaden. Gildas beendet das Duell mit dem nächsten Beitrag. Die Schadensformeln wurden durch diesen Fix nicht verändert.

**Längstes Duell:** 21 Runden / 41 Beiträge, Grundwaffen-Seed `2081580528`, Sieger Gildas mit 8 LP. Mit Zuständen dauerte der längste Durchlauf 12 Runden / 23 Beiträge, Seed `145195943`, Gildas mit 7 LP. Bei wechselnden Formen gewinnt Gawain den längsten Durchlauf nach 11 Runden / 22 Beiträgen mit nur 1 LP, Seed `2812971464`.

Die Kontrollreihe enthält **309 Aussetzbeiträge und 727 Blutungsfolgen**. In fünf Duellen treffen tödlicher Angriff und die ausdrücklich zum Beitragsende eingereichte eigene Blutungsfolge zusammen: beide Figuren erreichen 0 LP. Diese Fälle sind als Unentschieden erfasst, nicht als abgebrochene Tests. Die vollständigen Doppel-K.-o.-Verläufe werden zusätzlich über Servertransaktionen geprüft. Die wechselnden Formen verbrauchen **89 Besondere Aktionen**; die Regel für deren anhaltenden Verbrauch greift weiter.

### Was sich verbessert hat – und was bleibt

Gawains reguläre Trefferchance steigt von **35 % auf 50 %**, Gildas bleibt bei **55 %**. Der große RK-Sprung zwischen Stufe 5 und 6 ist damit beseitigt. In der Grundwaffenreihe gewinnt Gawain 49 statt 4 Mal; in der Technikreihe 18 statt 1 Mal.

Gildas bleibt stärker: neun zusätzliche LP, +1 Angriff, +1 Grundschaden, +1 Initiative und insbesondere **+2 Teulu-Technikschaden ab Stufe 6**. Die günstige Kombination aus Aktion, Reaktion und Bonusaktion erlaubt weiterhin drei verschiedene Angriffe im Beitrag. Der Fix gleicht die Figuren also deutlich an, macht sie aber nicht gleich stark. Weitere Kosten- oder Schadensänderungen wurden nicht vorweggenommen.

Die Grenze der Zustandsautomatik bleibt dieselbe: RK-/Angriffsboni, Nachteile/Vorteile, Rettungswürfe, Restdauer und Ablauf werden berechnet. Das Aussetzen bei Betäubung und das Auslösen periodischen Blutungsschadens übernimmt in dieser Generalprobe ausdrücklich die Testleitung. Diese beiden Abläufe sind noch keine automatischen Funktionen der produktiven Zustandsvorlagen.

### Nachweise der Wiederholung

**Abschluss:** 552 Frontendtests, 90 Backendtests, 53 Integrationstests und 21 Klassenseitentests bestanden. Die Stufengrenze wurde nach der letzten Absicherung gegen vorzeitig eingetragene Sonderstufen zusätzlich gezielt auf dem Server geprüft. Browserprüfung und Produktionsbuild bestehen ebenfalls. **49 vollständige Duelle nach dem Fix** stimmen mit den Servertransaktionen überein, einschließlich aller fünf Doppel-K.-o.-Fälle; vor dem Fix waren es 43. Die temporäre Umgebung und ihre Fähigkeiten sind entfernt, der Emulator ist beendet und Port 8180 geschlossen.

- [Alle 1.100 Duelle nach dem Fix](duel-rehearsal-2026-09-06/after-duels.csv)
- [Ergebnisse, Extremfälle und Unsicherheitsintervalle nach dem Fix](duel-rehearsal-2026-09-06/after-results.json)
- [Vollständige ausgewählte Verläufe nach dem Fix](duel-rehearsal-2026-09-06/after-selected-traces.json)
- [Zurückgelesene Live-Werte und geprüfte Änderungsfelder](duel-rehearsal-2026-09-06/live-balance-verification.json)
- [Abschließende Tests, Serverstichproben und Bereinigung](duel-rehearsal-2026-09-06/verification.json)
- [Geprüfte Anzeige von Gildas' Kampfwerten](duel-rehearsal-2026-09-06/armor-routine-browser.png)
- Ausgangsbögen als reine Dokumentationsdaten: [vorher](duel-rehearsal-2026-09-06/source-profiles-before.json) und [nachher](duel-rehearsal-2026-09-06/source-profiles-after.json). Die darin gespeicherten Waffen und Fähigkeiten sind die bestehenden Figurenwerte; die experimentellen Duellfähigkeiten wurden nur vorübergehend in Kopien ergänzt.

Die folgenden Abschnitte dokumentieren ausdrücklich die **erste Messreihe vor Rüstungsroutine und KON-Anpassung**.

## Erste Messreihe: vorheriger Stand

**6. September 2026. Ergebnis: 1.100 vollständige Testduelle, 8 Siege für Gawain, 1.092 für Gildas, kein Unentschieden.** Die aktuellen Figuren sind unter der unten beschriebenen Spielweise sehr ungleich stark. Die Generalprobe bestätigt die geprüften Rechen- und Speicherabläufe; sie bestätigt weder ein ausgeglichenes Duell noch eine bereits vollautomatische Betäubungs- oder Blutungsmechanik.

## Ausgangslage

Es wurden die beiden aktuellen Live-Kampfbögen ausschließlich gelesen und in eine isolierte Testumgebung kopiert. Besonders wichtig: Gildas wurde über seine tatsächliche Live-ID `person--haus-gafyr--gildas-gafyr` geladen, nicht über die ältere Exportkennung `gildas-gafyr`.

| Startwert | Gawain Draig | Gildas Gafyr |
| --- | ---: | ---: |
| Klasse | Teulu | Teulu |
| Stufe | 5 | 6 |
| Lebenspunkte | 49/49 | 65/65 |
| Rüstungsklasse | 16 | 19 |
| Angriff | +5 | +6 |
| Initiative | +3 | +4 |
| Grundschaden Ritterschwert, einhändig | 1W8 +2 | 1W8 +3 |
| Zusätzlicher Teulu-Technikschaden ab Stufe 6 | noch nicht | +2 |
| Aktion / Bonusaktion / Reaktion | 1 / 1 / 1 | 1 / 1 / 1 |
| Besondere Aktionen | 2 | 2 |
| Aura-Fokuspunkte | 0 | 0 |

Beide beginnen jedes Duell vollständig erholt, ohne zusätzliche temporäre LP oder bereits laufende Szenenzustände. Vorhandene dauerhafte Persönlichkeitseffekte bleiben Bestandteil der Bögen. Beide führen ihr Ritterschwert einhändig; es werden keine Fernkampf-, Reiter-, Gelände- oder Überraschungsboni erfunden. Die Testduelle vergeben keine Erfahrung.

Eine **Runde** bedeutet hier: Beide Figuren erhalten in der einmal ausgewürfelten Initiativreihenfolge je einen vollständigen Beitrag. Sobald eine Figur bei 0 LP liegt, endet das Duell. Eine angefangene letzte Runde zählt mit. Deshalb werden zusätzlich die tatsächlich gespielten Beiträge angegeben. Ein Beitrag kann mehrere Angriffsabschnitte enthalten; diese teilen sich ihre Ressourcen.

## Ergebnisse

| Variante | Duelle | Gawain gewinnt | Gildas gewinnt | Ø Runden | Kürzestes Duell | Längstes Duell |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Nur Grundwaffen | 250 | 4 (1,6 %) | 246 (98,4 %) | 12,07 | 6 Runden / 11 Beiträge | 24 Runden / 47 Beiträge |
| Erlernte Techniken, auf Schaden optimiert | 250 | 1 (0,4 %) | 249 (99,6 %) | 4,15 | 2 Runden / 3 Beiträge | 9 Runden / 18 Beiträge |
| Automatische Buffs und Debuffs | 250 | 0 | 250 (100 %) | 5,45 | 3 Runden / 5 Beiträge | 10 Runden / 20 Beiträge |
| Betäubung und Blutung mit Testleitung | 250 | 1 (0,4 %) | 249 (99,6 %) | 6,52 | 3 Runden / 5 Beiträge | 13 Runden / 26 Beiträge |
| Zusatzprüfung: wechselnde Jungdrachenattacken | 100 | 2 (2 %) | 98 (98 %) | 4,86 | 2 Runden / 3 Beiträge | 9 Runden / 18 Beiträge |

**Gesamtsumme: Gawain 8, Gildas 1.092.** Diese Summe beschreibt die tatsächlich geprüften unterschiedlichen Varianten; sie ist keine allgemeingültige Gewinnwahrscheinlichkeit für jede mögliche Spielweise.

In keinem dieser 1.100 Duelle wurde eine Figur bereits in Runde 1 ausgeschaltet. Das ist ein beobachtetes Ergebnis dieser Würfelfolgen, kein mathematischer Ausschluss anderer Würfelkombinationen.

### Kürzestes Duell im Detail

Variante „Erlernte Techniken“, Seed `328043677`: Gildas beginnt und gewinnt nach **2 Runden beziehungsweise 3 Beiträgen**. Er hat anschließend 55 LP.

| Runde / Beitrag | Handelnde Figur | Ausgeführte Angriffe | Ergebnis |
| --- | --- | --- | --- |
| 1 / 1 | Gildas | Gekreuzte Klauen: 12; Ritterschwert: 9, kritisch; Erster Hieb: 8 | Gawain 49 → 20 LP |
| 1 / 2 | Gawain | Ritterschwert: 6; Gekreuzte Klauen: 4; Erster Hieb verfehlt | Gildas 65 → 55 LP |
| 2 / 3 | Gildas | Gekreuzte Klauen: 13; Ritterschwert: 6; Erster Hieb: 9 | Gawain 20 → 0 LP |

Der letzte Beitrag würfelt zusammen 28 Schaden; wegen der vorhandenen 20 LP werden nur 20 LP abgezogen. Es entstehen keine negativen LP. Aktion, Bonusaktion und Reaktion werden jeweils genau einmal bezahlt. Das schnelle Ende entsteht durch mehrere bezahlte Treffer und die ungleichen Figurenwerte, nicht durch einen einzelnen übergroßen Schadenswurf.

### Längstes Duell

Nur Grundwaffen, Seed `1398450561`: **24 Runden beziehungsweise 47 Beiträge**. Gildas gewinnt mit 24 LP. Hier steht pro Beitrag nur der gewöhnliche Schwertangriff zur Verfügung. Die vielen verfehlten Angriffe verlängern den Kampf erheblich.

Das längste Duell mit Betäubung/Blutung dauert **13 Runden beziehungsweise 26 Beiträge**, Seed `3883378348`. Gildas gewinnt mit 18 LP. Ein tatsächlich geprüfter Sieg Gawains in dieser Variante ist Seed `2334270680`: 8 Runden und 15 Beiträge. Alle seltenen Gawain-Siege und die Extremfälle wurden zusätzlich über vollständige lokale Servertransaktionen nachvollzogen.

## Welche Spielweise wurde geprüft?

Die ersten vier Reihen verwenden jeweils dieselben 250 Seeds. Initiative wird zu Duellbeginn ausgewürfelt; bei gleichem Gesamtwert entscheidet die Seed-Parität. In jeder dieser Reihen beginnt Gawain 124-mal und Gildas 126-mal. Es gibt also keine fest zugunsten Gildas vorgegebene Startreihenfolge.

Die Grundwaffenreihe verwendet ausschließlich das aktiv geführte Ritterschwert. Die Technikreihe prüft alle bezahlbaren Kombinationen unterschiedlicher verfügbarer Waffen-/Technikaktionen und wählt die Kombination mit dem höchsten mittleren Würfelschaden einschließlich der hinterlegten Schadensboni. Die Angriffe werden nach mittlerem Einzelschaden ausgeführt. Es wird nicht anhand der kommenden Würfel „vorausgesehen“.

In der Buff- und Kontrollreihe kommt zuerst die für diese Runde vorgesehene Testfähigkeit, danach dieselbe Auswahl unter den verbleibenden Ressourcen. Beide Figuren folgen derselben Entscheidungsregel. Diese einfache, reproduzierbare Strategie ist kein Modell für jede mögliche menschliche Taktik und keine Suche nach einer spieltheoretisch optimalen Strategie.

Die zusätzliche Reihe mit 100 Duellen beginnt einen Beitrag mit einer anhand von Seed und Rundenzahl wechselnden, bezahlbaren Jungdrachenattacke und verwendet dann die übrigen Ressourcen. Dadurch wurden **alle sechs Jungdrachenattacken** tatsächlich ausgeführt, Gawain entsprechend seiner Stufe nur seine fünf freigeschalteten. Dabei wurden **93 Besondere Aktionen** verbraucht. Ein erschöpfter besonderer Vorrat wurde nicht durch den nächsten gewöhnlichen Beitrag aufgefüllt.

## Temporäre Fähigkeiten und Zustände

Diese Definitionen existierten nur auf den lokalen Testkopien. Es wurden keine neuen Fähigkeiten an echte Figuren, Klassen oder den produktiven Katalog angehängt.

| Testfähigkeit | Kosten | Wirkung und Dauer | Was das System selbst übernimmt |
| --- | --- | --- | --- |
| Deckung | 1 Reaktion | +2 RK bis zum Ende eines weiteren eigenen Beitrags | Vergabe, RK-Bonus, Restdauer, Ablauf |
| Verunsichern | 1 Bonusaktion | Gegner: −2 Angriff für zwei eigene Beiträge | Vergabe, Angriffsmalus, Restdauer, Ablauf |
| Sammeln | 1 Bonusaktion | Angriffsvorteil bis zum Ende eines weiteren eigenen Beitrags | Zwei W20, Auswahl des höheren Wurfs, Restdauer, Ablauf |
| Betäubender Stoß | 1 Aktion + 1 Bonusaktion | KON-Rettungswurf SG 12; bei Misslingen Betäubung für einen eigenen Beitrag | Rettungswurf, Zustandsvergabe, Restdauer, Ablauf |
| Blutender Schnitt | 1 Aktion | Angriff mit 1W6 plus regulärem Fähigkeits-Schadensmodifikator; bei Treffer Blutung für zwei eigene Beiträge | Treffer, unmittelbarer Schaden, Zustandsvergabe, Restdauer, Ablauf |
| Blutungsfolge der Testleitung | kein Aktionsverbrauch | Fest 2 Eigenschaden am Ende eines betroffenen eigenen Beitrags | Auswertung und Speicherung des ausdrücklich eingereichten Schadenseffekts |

Der Schwierigkeitsgrad 12 wurde ausschließlich in den Kopien für die Testfähigkeiten gesetzt. Er verändert keine produktiven Zauberwerte.

In der Buff-Reihe wechseln Deckung, Verunsichern und Sammeln nach Rundennummer. In der Kontrollreihe wechseln Betäubungsversuch, Blutender Schnitt und Deckung. Ein bereits laufender entsprechender Effekt wird nicht unnötig erneut gesetzt. In der Kontrollreihe gab es **291 Aussetzbeiträge und 590 Blutungsfolgen**.

### Grenze: Was Betäubung und Blutung noch nicht automatisch tun

Die Testleitung lässt eine betäubte Figur einen Beitrag aussetzen und reicht bei aktiver Blutung den festgelegten Folgeschaden ausdrücklich als letzten Abschnitt desselben Beitrags ein. Auch beim Aussetzen zählt der Beitrag für die Zustandsdauer; es entsteht kein zusätzlicher Tick pro Abschnitt.

**Die produktive Vorlage „Betäubt“ verhindert allein noch keine Kampfeingabe. „Blutend“ löst allein noch keinen periodischen Schaden aus.** Der Zustandsname ist bisher Beschreibung. Die Kontrollreihe beweist die Wirkung dieser konkreten Testregeln zusammen mit dem bestehenden Kampf- und Dauerverwaltungssystem. Sie ist kein Nachweis, dass ein vollautomatischer Stun oder Blutungstimer bereits produktiv existiert.

Das System zählt eigene Beiträge oder Szenenbeiträge; es besitzt für solche Effekte bisher keine eigenständige globale Rundenuhr. Im geordneten Zweierduell entspricht ein eigener Beitrag einer eigenen Gelegenheit pro Runde. Diese Gleichsetzung lässt sich nicht ungeprüft auf beliebig viele Figuren pro Post übertragen.

## Gefundener und behobener Fehler

Ein ausdrücklich mit `target: 'self'` definierter schädlicher Effekt wurde abgewiesen, sobald die Figur auch als ihr eigenes Ziel ausgewählt war. Derselbe Eigeneffekt konnte bei einem anderen ausgewählten Gegenüber hingegen auf den Akteur angewendet werden. Das widersprach der expliziten Effektzuordnung und verhinderte den korrekt beschriebenen Test-Folgeschaden.

Die gemeinsame Auflösung unterscheidet jetzt zwischen **ausdrücklich selbstgerichteten Auswirkungen** und gewöhnlichen gegnerischen Angriffen. Ein definierter eigener LP-Einsatz wird genau einmal ausgewertet und gespeichert. Ein gewöhnlicher Schwertangriff gegen sich selbst bleibt abgewiesen. Eine Testfähigkeit wird dadurch weder aus einem Zustandsnamen erzeugt noch automatisch ausgeführt.

Der neue Frontend-Regressionstest wurde zuerst rot ausgeführt und besteht nach der Korrektur. Ein zusätzlicher Firebase-Integrationstest prüft den Eigenschaden, den Reaktionsverbrauch, den gespeicherten LP-Stand, das Replay, die vollständige Rücknahme und die weiterhin bestehende Ablehnung gewöhnlicher Selbstangriffe. Browser und Server verwenden denselben korrigierten Regelkern; die neue Regelkennung lautet `combat-evaluation-7`.

## Bewertung der Balance

Gildas hat 16 LP mehr, 3 Punkte mehr RK und +1 mehr Angriff. Der Rüstungssprung ist in den vorhandenen Daten ausdrücklich definiert: Die Jungritter-Plattenrüstung erlaubt den Geschicklichkeitsbonus erst ab Stufe 6. Gawain hat diese Schwelle noch nicht erreicht. Zusätzlich erhält Gildas den Teulu-Technikschaden ab Stufe 6.

Ohne weitere Effekte trifft Gawain RK 19 mit +5 auf einer natürlichen 14–20: **35 %**. Gildas trifft RK 16 mit +6 auf 10–20: **55 %**. In der Grundwaffenreihe wurden passend dazu 1.044 Treffer aus 2.895 Angriffen Gawains und 1.638 aus 3.017 Angriffen Gildas beobachtet. Die normale kritische Trefferregel bleibt aktiv.

Die Technikoptimierung bevorzugt fast immer **Schwertangriff + Gekreuzte Klauen + Erster Hieb**. Das ergibt drei getrennte Angriffe für Aktion, Reaktion und Bonusaktion. Die Ressourcenprüfung funktioniert dabei: Kein Pool wird doppelt ausgegeben. Trotzdem kann der Beitrag drei Treffer enthalten. In dieser Auswahl wurden keine Besonderen Aktionen benötigt. Gerade deshalb wurde die zusätzliche Technikwechsel-Reihe ergänzt.

Meine Bewertung: Das Duell ist mit diesen Bögen keine Begegnung annähernd gleich starker Gegner. Noch mehr LP für beide verlängern den Kampf, beseitigen aber weder den großen Unterschied der Trefferchancen noch den gebündelten Stufe-6-Vorteil. Für eine spätere Balanceentscheidung sind der abrupte Rüstungssprung und die Effizienz des frei verfügbaren Reaktionsangriffs die stärkeren Ansatzpunkte. Charakterwerte und Klassenkosten wurden für diese Generalprobe nicht stillschweigend umgeschrieben.

Auch 0 Gawain-Siege in 250 Buff-Duellen bedeutet nicht, dass ein Sieg unmöglich ist. Die 95-%-Wilson-Intervalle für Gawains beobachtete Siegquote stehen in der Ergebnisdatei: beispielsweise ungefähr 0,62–4,04 % bei Grundwaffen und 0–1,51 % in der Buff-Reihe. Sie beschreiben nur die jeweilige feste Teststrategie, nicht sämtliche Spielweisen.

## Prüfnachweise und Abgrenzung

- **1.100 vollständige Duelle** im gemeinsamen Produktions-Regelkern; keine vereinfachte Ersatz-Schadensformel für die eigentlichen Würfe.
- Ausgewählte Duelle zusätzlich komplett durch den **lokalen Firestore-Emulator** und die echten Firebase-Transaktionsfunktionen: Angriff, Ressourcenkosten, Zustände, LP, Ablauf und Kampfabschluss. Würfelwerte, Beiträge, LP und Zustandsverläufe werden mit der großen Serie verglichen. Zufallsbeleg-IDs und die Kennzeichnung der serverseitigen Bestätigung werden beim Vergleich ausgeschlossen.
- **548 Frontendtests, 90 Firebase-Unit-Tests und 52 Integrationstests bestanden.** Die Duellstichprobe ist zusätzlich zu diesen Tests ausgewiesen und wird nicht als weitere zufällige Serie gezählt.
- Browserprüfung mit Kopien der aktuellen Bögen: standardmäßig geschlossene Zustandsübersicht, beide Figuren, Vergabe vor Kampfstart, automatischer Vorteil, Aufhebung von Gawains sozialem Nachteil durch passenden Vorteil, unveränderter Textentwurf, Restdauer 2 → 1 → abgelaufen, Rückkehr zum normalen Angriffswurf und 390-Pixel-Mobilansicht. Keine JavaScript-Fehler.
- Produktionsbuild erfolgreich, explizit bestätigter Exit-Code 0. Die bekannten Vite-Hinweise zu großen Paketen und bestehenden klassischen Skripten bleiben bestehen.

Während der großen Serie wurden unveränderliche Basisprofile im Testtreiber zwischengespeichert; Angriffe, Ressourcen, Zustandsüberlagerung, Würfel und Replay laufen weiterhin durch die vorhandenen Module. Die vollständig im Backend wiederholten Duelle verwenden den normalen Vorbereitungsweg ohne diesen Testcache. Frühe Testadapter-Abweichungen betrafen ausschließlich `visualMode` und nicht gespeicherte `undefined`-Felder; es wurde kein Ergebniswert zum Bestehen des Vergleichs angepasst.

## Reproduzierbarkeit, Daten und Aufräumen

Ausgangsstand des Projekts: Commit `8ce934648769f1deba9d676c8b07ed113e08dd66`; dazu die im selben Arbeitsstand dokumentierte Eigenschadenkorrektur. Für Laufindex `i` gilt der Seed `(0xA1E21A + i * 0x9E3779B1) >>> 0`. Würfel verwenden den bestehenden `CheckupDice`-Adapter mit Xorshift32. Initiative: W20 + Initiativebonus. Gleiche Seeds werden zwischen Varianten wiederverwendet, damit Unterschiede nicht durch komplett unabhängige Stichproben verdeckt werden.

- [Alle 1.100 Duelle als CSV](duel-rehearsal-2026-09-06/duels.csv)
- [Ergebniszahlen, Startprofil-Prüfsummen und Unsicherheitsintervalle](duel-rehearsal-2026-09-06/results.json)
- [18 vollständige Detailverläufe: Extremfälle und Gawain-Siege](duel-rehearsal-2026-09-06/selected-traces.json)
- [Abschließender Prüfnachweis einschließlich Serverstichprobe und Aufräumen](duel-rehearsal-2026-09-06/verification.json)

Die Testdatenbank ist ausschließlich `demo-aleria-combat-checkup` auf `127.0.0.1:8180`. Der Integrationseinstieg verweigert andere Hosts. Die temporäre Umgebung und die experimentellen Fähigkeiten werden nach den Prüfungen vollständig entfernt; erhalten bleiben dieser Bericht, die Ergebnisbelege und die allgemeinen Regressionstests für den behobenen Fehler. Der abschließende Aufräumnachweis wird in `verification.json` festgehalten.
