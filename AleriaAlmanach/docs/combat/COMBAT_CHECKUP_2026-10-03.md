# Kampf-Checkup und Fairnessbewertung – 3. Oktober 2026

Der Check prüft vollständige **Beiträge**, nicht einzelne Angriffe als vermeintliche Runden. Die technische Prüfung ist von der Regelbewertung getrennt: Nachgewiesene Konterfehler sind korrigiert; TP, Klassenwerte und bestehende Kampfergebnisse wurden nicht umgeschrieben.

## Behobene Fehler

1. **Konter berechneten Waffenwerte über einen abweichenden Weg.** Bei ausgebildeten Doppelwaffenkämpfern fehlte der zweite Waffenwürfel; bestimmte Klassenboni fehlten ebenfalls. Beispiele: Asgeirs Konter verwendete vorher W6 statt 2W6; Guineveres Angriffswert wich vom gewöhnlichen Waffenangriff ab. Normale Waffenangriffe und Konter verwenden jetzt gemeinsam `combat-weapon-attack-values.js`. Eine ausdrücklich gesetzte zweihändige Führung vielseitiger Waffen wird ebenfalls berücksichtigt, einschließlich ihres Angriffsabzugs. Strukturierte Waffeneffekte bleiben erhalten. Eine abgelegte zweite Waffe erlaubt keinen fingierten gemeinsamen Angriff.
2. **Verbrauchte begrenzte Gegenstandseffekte innerhalb eines Konters gingen beim Wiederaufbau der Nutzungshistorie verloren.** Der gespeicherte Konterbeleg enthielt die Nutzung, die Auswertung las aber nur den äußeren Angriff. Nun wird das Konterprotokoll mit ausgewertet. Tages-/Szenennutzungen bleiben verbraucht; zulässige Rücknahmen stellen sie wieder her. Konterketten bleiben gesperrt.

Browser- und Servermechanik wurden aus derselben Quelle abgeglichen. Kein Online-Charakterdatensatz musste dafür geändert werden. Alte Beiträge werden nicht erneut gewürfelt oder gespeichert; ihre protokollierten Nutzungen werden für kommende Handlungen korrekt berücksichtigt.

## Beitragslogik, Zustände und Effekte

| Prüfung | Befund |
| --- | --- |
| Aktion + Bonusaktion + Reaktion | Drei passend bepreiste Angriffe teilen ein Beitragsbudget. Ein vierter Angriff mit bereits verbrauchter Ressource wird abgelehnt, auch serverseitig atomar. |
| Mehrere Segmente | Eine Haltung für einen eigenen Beitrag gilt über alle zugehörigen Angriffssegmente; ihre Dauer sinkt nur einmal. Ein fremder Beitrag verbraucht keine eigene Beitragsdauer. |
| Liegend | Sperrt die Bonusaktion des betroffenen eigenen Beitrags. Aktion und Reaktion bleiben verfügbar. Kein zusätzlicher Bewegungs- oder Angriffsmalus. |
| Andere Ressourcensperren | Aktions-, Bonusaktions- und Reaktionssperren betreffen die jeweilige Ressource und bleiben über den ganzen Beitrag wirksam. |
| Zustände erneut anwenden | 321 Zustandsdefinitionen aus den Kampftechnikkatalogen wurden auf Übertragung, erneute Anwendung ohne ungewolltes Stapeln und eigene Beitragsdauer geprüft. |
| Einmalige Vorbereitungen und Konter | Verbrauch, geeignete Auslöser, Vorteil, Munition, Waffenvoraussetzungen, Auswertung und Rücknahme werden durch die bestehenden und neuen Regressionstests geprüft. |
| Kampfunfähigkeit | Bei 0 TP sind Angriffe und eigenständiges Durchschnaufen gesperrt. |
| Kritische Nebeneffekte | Alle zehn Trefferfolgen und zehn Fehlschlagsfolgen sowie Entwaffnung, Aufheben, Besitzübertragung und Verbrauch wurden im isolierten Firestore-Emulator geprüft. |
| Speicherung und Rücknahme | TP, Ressourcen, Zustände und einmalige Nutzungen stimmen zwischen Vorschau, Server und erneut gelesener Historie überein. Gleichzeitige Speicherungen verlieren keine TP-Änderungen. |

**Drei Angriffe sind eine typische Möglichkeit, keine globale Obergrenze.** Eine Technik kann mehrere Punkte bündeln oder eine ausdrücklich bezahlte Angriffsfolge enthalten. Asgeirs persönliche Technik würfelt vier Angriffe. Höhere Klassenstufen können mehr reguläre Ressourcen erhalten. Besondere Aktionen und Aura dürfen deshalb nicht wie kostenlos pro Beitrag erneuerte Zusatzaktionen bewertet werden.

Auch die Häufigkeit kritischer Würfe muss pro Beitrag betrachtet werden: Bei drei unabhängigen normalen W20-Angriffen mit kritischem Treffer nur auf 20 liegt die Chance auf mindestens einen kritischen Treffer bei **14,3 %**, bei vier Angriffen bei **18,5 %**. Dasselbe gilt für mindestens eine natürliche 1. Vorteil, Nachteil und abweichende Kritschwellen verändern diese Werte. Ein Nebeneffekt ist deshalb deutlich häufiger als „5 % pro Runde“. Umgekehrt nimmt eine Bonusaktionssperre nur den zugehörigen Teil des Budgets weg; sie ist keine vollständige Betäubung.

Ein bestehender Duelltest scheiterte zunächst zufällig: Nach einer serverseitig gewürfelten Entwaffnung versuchte sein festes Angriffsskript mit der abgelegten Waffe weiterzukämpfen. Die Sperre war korrekt. Dieser reine Speicher-/Replaytest verwendet jetzt auch für kritische Nebeneffekte ein festes Ergebnis; separate vollständige Duelle testen Entwaffnung und tatsächliches Aufheben.

## Grundlage der Fairnessmessung

Die aktuellen Online-Datensätze wurden nur gelesen. Von 34 Datensätzen mit Kampfprofil sind einige einfache Vorlagen oder noch nicht ausgearbeitete Stufe-1-Figuren. Die vertiefte Schadensmessung untersucht zehn ausgearbeitete Hauptfiguren plus Freki und alternative Waffenführungen. Der breite Handlungstest wertete **2.922 Varianten ohne Auswertungsfehler** aus.

Pro Schadensvergleich wurden **512 vollständige Beiträge** mit fest reproduzierbaren Zufallszahlen simuliert. Die Berechnung verwendet den echten Resolver, tatsächliche Waffen-/Rüstungsregeln, Rettungswürfe, normale kritische Schadenswürfe, Folgeangriffe und das gemeinsame Ressourcenbudget. Sie summiert nicht drei voneinander unabhängige Angriffe mit jeweils frischen Ressourcen.

- **Regulär:** ohne Besondere Aktionen, Aura-Fokus und begrenzte Fähigkeitsnutzungen. Zauber verbrauchen weiterhin Mana; „regulär“ bedeutet bei ihnen nicht unbegrenzt wiederholbar.
- **Verstärkt:** alle ausgeruhten Ressourcen einschließlich Besonderer Aktionen, Aura und begrenzter Nutzungen dürfen eingesetzt werden. Das ist kein Dauer-DPS pro Beitrag.
- Die direkten Offensivfolgen werden anhand von 48 Proben je Kandidat gegen RK 16 gewählt, anschließend als ganze Beiträge erneut simuliert. Gegen konkrete Gegner wird dieselbe gewählte Folge getestet. Dies ist eine belastbare Stichprobe, kein Beweis mathematisch optimaler Taktik.
- Zu Beginn volle TP, keine kostenlosen vorbereiteten Haltungen; keine taktische Heilung, wechselnden Gegner, Bewegungsvorteile oder zufälligen W10-Kritnebenfolgen in der statistischen Tabelle. Diese Nebenfolgen sind separat technisch getestet.
- Schaden bezeichnet ausgewerteten Schaden nach Schadensschutz, einschließlich möglichem Überhang beim letzten Treffer. K.-o.-Quoten werden aus den tatsächlichen verbleibenden TP ermittelt. TP geteilt durch Durchschnittsschaden ist **keine** Siegwahrscheinlichkeit oder genaue Duelllänge.
- Ein beobachtetes K.-o.-Risiko von 0/512 bedeutet nicht, dass ein Ausschalten unmöglich wäre. Die JSON-Ergebnisse enthalten zusätzlich Streuung, Median, 90. Perzentil und eine angenäherte Unsicherheit des Mittelwerts.

## Aktuelle TP und Verteidigung

Die Werte sind aus den zum Prüfzeitpunkt gespeicherten Bögen abgeleitet, mit ihrer aktuellen Ausrüstung und ohne vorbereitete temporäre Haltungen.

| Figur | Stufe | Maximale TP | RK |
| --- | ---: | ---: | ---: |
| Gawain | 5 | 49 | 16 |
| Gildas | 6 | 58 | 16 |
| Asgeir | 7 | 108 | 14 |
| Ylva | 7 | 95 | 12 |
| Nudd | 6 | 73 | 16 |
| Gais | 5 | 43 | 16 |
| Fenrir | 6 | 82 | 16 |
| Guinevere | 5 | 37 | 11 |
| Freya | 5 | 42 | 13 |
| Rhiannon | 6 | 25 | 10 |
| Freki | 4 | 50 | 13 |

Frekis Online-Stand beträgt inzwischen 50 TP. Der alte Freigabewert 38 wurde ausdrücklich nicht erneut als Importvorgabe angewandt.

## Schaden pro vollständigem Beitrag

Mittelwerte nach tatsächlichem gegnerischem Schadensschutz; gerundet. „TP-Anteil“ bezieht sich auf den verstärkten Beitrag und die maximalen TP des Ziels.

| Angreifer → Ziel | Regulär | Verstärkt | TP-Anteil verstärkt |
| --- | ---: | ---: | ---: |
| Gawain → Gildas | 6,7 | 11,4 | 20 % |
| Gildas → Gawain | 13,0 | 18,6 | 38 % |
| Asgeir → Gawain | 15,5 | 20,0 | 41 % |
| Gawain → Asgeir | 8,3 | 12,9 | 12 % |
| Asgeir → Gildas | 15,7 | 20,4 | 35 % |
| Gildas → Asgeir | 14,9 | 21,5 | 20 % |
| Ylva mit Bogen → Asgeir | 15,4 | 18,3 | 17 % |
| Asgeir → Ylva | 22,7 | 29,7 | 31 % |
| Nudd → Gildas | 8,0 | 9,4 | 16 % |
| Gildas → Nudd | 17,1 | 23,2 | 32 % |
| Gais → Gawain | 6,8 | 9,9 | 20 % |
| Gawain → Gais | 10,1 | 14,6 | 34 % |
| Gawain → Guinevere | 15,0 | 21,3 | 58 % |
| Gildas → Freya | 20,7 | 27,4 | 65 % |
| Gawain → Rhiannon | 15,8 | 22,1 | 88 % |

Ein konkretes Beispiel für die Berücksichtigung eurer Ökonomie: Gawains reguläre geprüfte Folge besteht aus Drachenzahn, Erstem Hieb und Gekreuzten Klauen; alle drei liegen im selben Beitrag. Asgeirs beste reguläre direkte Folge in diesem Vergleich bündelt dagegen Ressourcen in zwei Handlungen. Mehr einzelne Angriffe bedeutet nicht automatisch mehr Gesamtschaden.

**Bewertung:** Ein pauschaler TP-Aufschlag für alle Figuren ist durch diese Daten nicht begründet. Die Frontkämpfer halten mehrere gegnerische Beiträge aus; bei empfindlichen Figuren kann ein einziger Beitrag fast den gesamten TP-Vorrat abtragen. Rüstungsschutz wirkt dabei pro entsprechendem Treffer und ist gegen mehrere kleine Treffer besonders wertvoll.

## Auffälligkeiten und Empfehlungen

### 1. Rhiannons Überlebensreserve ist stark von Vorbereitung abhängig

Mit 25 TP und RK 10 wird sie in dieser Probe von Gawains regulärem Beitrag in **8,4 %**, vom verstärkten Beitrag in **42,2 %** der Fälle aus vollen TP ausgeschaltet. Das ist ein reales Risiko innerhalb eines einzigen gegnerischen Posts, bevor sie wieder selbst handeln kann.

Vorhandene, vorher bezahlte Schutzzauber verändern das Ergebnis erheblich:

| Vorbereiteter Schutz bei weiterhin 25 TP | K.-o.-Risiko gegen Gawains verstärkten Beitrag |
| --- | ---: |
| Keiner | 42,2 % |
| Schild: eine Abwehrladung | 13,1 % |
| Spiegelbilder: zwei Abwehrladungen | 2,9 % |
| Magierrüstung: in dieser Probe 9 temporäre TP | 8,0 % |

Diese Schutzmaßnahmen kosten eigene Ressourcen und Mana; sie sind kein kostenloser Bestandteil der Basistabelle. Die Magierrüstungsprobe verwendet einen festen vorbereitenden Wurf, keine Durchschnittsbehauptung über alle möglichen temporären TP.

Hypothetische reine TP-Anpassungen ohne Schutz: Bei 30 TP sinkt dasselbe K.-o.-Risiko auf 19,1 %, bei 35 auf 7,0 %, bei 40 auf 2,1 %, bei 45 auf 0,6 %. **Empfehlung zur Diskussion:** Falls ein ausgeruhter Magier ohne Vorbereitungsbeitrag üblicherweise wenigstens einmal reagieren können soll, ist eine Zielreserve um 35 TP hier plausibler als 25. Keine dieser Änderungen wurde übernommen. Schutzzauber, gegnerische Schadensspitzen und andere Magier müssen bei einer allgemeinen Klassenregel gemeinsam bewertet werden.

### 2. Leichte Rüstung kann aktuell schlechter sein als keine Rüstung

Die zentrale Rüstungsroutine rechnet bei den betreffenden Klassen vor Stufe 12 keinen Geschicklichkeitsbonus auf getragene Rüstung. Ohne Rüstung gilt Geschicklichkeit. Dadurch ergibt die reine RK-Probe:

| Figur | Rüstung angelegt | Körperrüstung abgelegt |
| --- | ---: | ---: |
| Ylva | 12 | 13 |
| Guinevere | 11 | 14 |
| Asgeir | 14 | 11 |

Ausziehen entfernt selbstverständlich auch Gegenstandseffekte; Ylva verliert etwa Schadensschutz. Für Guinevere ist die RK-Differenz dennoch besonders ungünstig. Das Verhalten entspricht der bisherigen ausdrücklich kodierten Klassenregel und wurde daher nicht als beiläufiger Fehler „repariert“. **Empfehlung:** Leichte Rüstung und Geschicklichkeit gesondert überarbeiten, bevor ihre TP oder sämtliche Gegnerwürfel erhöht/gesenkt werden.

### 3. Ylvas gewünschte Überlegenheit über Asgeir ist im Einzelduell nicht belegt

Ihre offensive Ausgabe und geringere RK gleichen Asgeirs 108 TP im direkten Schlagabtausch nicht aus. Ihr Speer löst das allein nicht: Die getestete verstärkte Speerfolge verursacht gegen Gawain ungefähr 12,2 Schaden, gegenüber 12,4 mit dem Bogen.

**Mit Freki ist der Vergleich anders:** Er hat im aktuellen Datensatz 50 eigene TP und ein eigenes Beitragsbudget; seine geprüfte Folge verursacht etwa 4,6 Schaden gegen Gawain bzw. 7,7 gegen Asgeir. Diese Werte dürfen nicht als kostenloser Zusatz innerhalb von Ylvas Beitrag dargestellt werden. Für eine weitere Verstärkung zuerst festlegen, ob „stärker“ Ylva allein oder Ylva samt Gefährten bedeutet. In einem System ohne ausgeprägten Reichweitenvorteil verlieren Bogenschützen zudem einen Teil ihres taktischen Vorteils.

### 4. Gais und Nudd haben Optionen, aber geringere direkte Angriffswerte

Der Unterschied zu Gildas ist nicht einfach eine fehlende Technikliste. Ihre aktuellen Waffen-/Attributwerte und jeweiligen Rollen verursachen weniger direkten Schaden; Gais bleibt Uchelwyr. Reiter-, Schild- und Vorbereitungsmöglichkeiten wurden nicht als kostenloser Zusatz zu einer voll offensiven Folge gerechnet. Eine Verstärkung sollte an Rolle und tatsächlicher Handlungswirkung ansetzen, nicht weitere weitgehend identische Techniken hinzufügen.

### 5. Bewegungseffekte benötigen für eure Spielweise eine klare Bedeutung

Reine Änderungen wie −3 m Bewegung haben ohne Bewegungsreichweite wenig verlässlichen Kampfwert. Das betrifft unter anderem einzelne kritische Folgen und bewegungsbezogene Fähigkeiten. Die Technik kann technisch korrekt gespeichert sein und trotzdem im Play kaum etwas bewirken. Solche Effekte sollten gezielt durch definierte Interaktions- oder Ressourcenwirkungen ersetzt werden; eine zusätzliche Aktionssperre ist jedoch eine Balancingentscheidung und wurde nicht automatisch unterstellt.

Ebenso bedeutet ein manuell gesetztes Symbol wie „Brennend“, „Blutend“ oder „Vergiftet“ nicht automatisch einen universellen Schadenswurf pro Beitrag. Automatischer Folgeschaden braucht eine entsprechende mechanische Definition der Quelle. Beschreibender Zustand und tatsächlich ausgeführte Wirkung müssen bei neuen Fähigkeiten zusammen gepflegt werden.

### 6. Duncans Online-Bogen hat eine Ausrüstungslücke

64 Techniken waren im Handlungstest ausschließlich bei Duncan mangels passender Waffe gesperrt. Sein aktueller Online-Bogen liefert keine passende Schwertausrüstung und fällt auf Nahkampf zurück. Das ist von den bestehenden Techniken und ihrer Freischaltung zu unterscheiden. Besitz wurde nicht erfunden oder aus einem älteren Export über den Live-Datensatz geschrieben; vor einem Einsatz dieses Bogens muss seine tatsächlich gewünschte Ausrüstung geklärt werden.

## Nachweise und Wiederholung

- 1.259 Browser-/Klassen-Unit-Tests bestanden; 137 Server-Unit-Tests bestanden.
- 141 Fälle des breiten Server-Integrationstests ausgeführt; den zunächst zufälligen Duellabbruch wie oben erklärt korrigiert. Alle 13 Fälle der betroffenen Datei plus zwei neue Speicherregressionen danach bestanden.
- Zusätzlich 39/39 Fälle im eigenen Emulatorlauf für kritische Folgen, Gegenstände und vollständige Duelle mit Aufheben bestanden. Damit sind 182 unterschiedliche Server-Integrationsfälle abgedeckt; die betroffene Duelltestdatei wurde nach ihrer Korrektur wiederholt.
- Produktionsbuild erfolgreich. Bestehende Warnung zu großen JavaScript-Bundles bleibt bestehen; dieser Check ist keine Performanceüberarbeitung.
- Online-Historie, tatsächliche aktuelle TP, Ressourcenvorräte, Zustände, Inventarbesitz und IDs unverändert.

Die Roh-Ergebnisdateien enthalten die einzelnen Pläne, Kosten und Messwerte: [Hauptvergleich](checkup-2026-10-03/fairness.json), [Waffenführungen und Rüstung](checkup-2026-10-03/loadouts.json), [Überlebensreserve](checkup-2026-10-03/survival.json), [Freki](checkup-2026-10-03/companion.json). Persönliche Online-Rohdaten werden nicht als neuer öffentlicher Export beigelegt. SHA-256 des verwendeten lokalen Eingabeexports: `d196d3ae91e589a759d8978c77a4a65cc72ee1cddb0b6326f43483f97fb2610f`.

Offline-Wiederholung ab Repositorywurzel mit einem JSON-Array exportierter Charakter-/Kreaturdatensätze:

```powershell
node AleriaAlmanach/tools/combat-audit/run-action-sweep.mjs records.json actions.json
node AleriaAlmanach/tools/combat-audit/run-fairness.mjs records.json fairness.json
node AleriaAlmanach/tools/combat-audit/run-loadouts.mjs records.json loadouts.json
node AleriaAlmanach/tools/combat-audit/run-survival.mjs records.json fairness.json survival.json
node AleriaAlmanach/tools/combat-audit/run-companion.mjs records.json companion.json
```

Die Werkzeuge haben keine Firebase-Schreibverbindung. Sie arbeiten ausschließlich auf lokalen Kopien mit festem Zufallsstartwert. Der Online-Eingabeexport wird bei einer Wiederholung bewusst neu gewählt; Veränderungen an Figuren können die Ergebnisse ändern.
