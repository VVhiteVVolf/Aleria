# Kampftechniken: maßvolle Anhebung und differenzierte Kosten

Stand: 6. September 2026. Lokal implementiert und geprüft; keine Veröffentlichung oder Änderung an produktiven Kampfständen durch diese Überarbeitung.

## Ergebnis und Umfang

Die vorhandenen Techniken bleiben wiedererkennbar. Ihr Schaden steigt überwiegend um etwa zwei Punkte pro Treffer. Kostenpakete unterscheiden stärker zwischen großen Handlungen, schnellen Ergänzungen und seltenen Abschlüssen. Trefferpunkte, Grundwaffen, Ressourcenpools und deren Regeneration bleiben unverändert.

| Register | Einträge | Bestehende Schadensangriffe erhöht | Unverändert | Verringert | Mittlere Anhebung |
| --- | ---: | ---: | ---: | ---: | ---: |
| Drachentanz | 212 | 201 | 7 | 0 | +2,42 |
| Sirenentanz | 180 | 146 | 0 | 0 | +2,05 |
| Huskarl | 111 | 88 | 5 | 0 | +2,03 |

Vergleich bei Freigabe, gemeinsame Referenzwaffe 1W10, ohne Attribut-, Klassen-, Zustands- oder Aura-Ersatzbonus. Die Mittelwerte beziehen sich auf die zuvor vorhandenen Schadensangriffe; neue Einträge und reine Hilfstechniken sind ausgenommen. Waffen mit anderen Würfeln können andere Differenzen haben. Der Gesamtbestand umfasst 449 Schadens- und 54 Hilfstechniken. Die vier neuen Teulu-Techniken sind darin enthalten.

Zusätzlich wurden Fenrirs vier individuell ausgearbeitete Axt-/Schildtechniken angepasst. Freyas und Rhiannons Zauber, Heilungen und Berserkergang bleiben in ihrer eigenen Balance bestehen. Ein mit Aura bezahlter gewöhnlicher Schadenszauber verwendet allerdings dieselbe neue Aura-Regel wie andere reguläre Angriffe.

Der [vollständige Vergleich](technique-balance/CATALOG.md) enthält sämtliche 503 Einträge einschließlich Kosten, alter und neuer Formel sowie Stufe 20. [catalog.json](technique-balance/catalog.json) stellt dieselben Daten maschinenlesbar bereit. [before.json](technique-balance/before.json) bewahrt den vor dieser Änderung erfassten Ausgangsstand. Bestehende Entwürfe behalten ihren Katalogstatus; die Überarbeitung schaltet nicht pauschal alle Techniken für jede Figur frei.

## Kosten und Schadensbudget

| Kosten | Schwerpunkt |
| --- | --- |
| Bonusaktion | Schwacher, schneller Ergänzungsangriff; Basis 1W6, oder Unterstützung ohne Schaden |
| Reaktion | Mittlerer Gegenangriff, Abwehr oder Vorbereitung |
| Aktion | Vollwertiger Hauptangriff |
| Aktion + Reaktion / Bonusaktion | Verstärkte reguläre Folge |
| Aktion + Reaktion + Bonusaktion | Aufwendige Folge aus erneuerbaren Ressourcen |
| Bonusaktion + Besondere Aktion | Vielseitiger Nebenangriff mit respektablem Schaden und vorhandenen Zusatzeffekten |
| Reaktion + Besondere Aktion | Starke Antwort oder Abwehrtechnik |
| Aktion + Besondere Aktion | Kräftiger Hauptangriff |
| Reaktion + Bonusaktion + Besondere Aktion | Vielseitige Kombination, lässt die Aktion frei |
| Aktion + Reaktion / Bonusaktion + Besondere Aktion | Sehr starker Abschluss, lässt eine reguläre Ressource frei |
| Aktion + Reaktion + Bonusaktion + Besondere Aktion | Höchstes reguläres Abschlussbudget |
| Ausdrückliche Aura-Kosten | Eigenes Elitebudget mit höheren Schadenswürfeln |

Die Kosten sind keine Garantie für eine starre Rangfolge jedes Einzelangriffs: Freigabestufe, Waffe, Mehrzielwirkung und Kontrolle zählen weiterhin. Hilfstechniken erhalten kein Schadensbudget. Ein Mehrzielangriff hat weiterhin niedrigere Zusatzwürfel pro Ziel. Besondere Aktionen stehen in den Technikregistern immer mit mindestens einer anderen Ressource zusammen. Die Mehrheit der Angriffe bleibt allein mit erneuerbaren Ressourcen nutzbar.

Die Anpassung führt weder zusätzliche tägliche Punkte noch ein Abschnittslimit ein. Besondere Aktionen bleiben bei 2/3/4/5/6 auf Stufe 1/8/10/15/20. Die erste Aura-Verwendung bleibt ab Stufe 8 möglich. Die bisherigen Verbesserungen alter Formen auf Stufe 7/9/13/17, beziehungsweise 6/10/15 beim Milwr, bleiben erhalten: Es zählt jeweils der höchste einzelne Ausbildungswürfel, kein Stapel aller früheren Verbesserungen.

## Aura ersetzt die Kosten und verstärkt den Angriff

Wählt man für einen regulären Angriff Aura anstelle seines normalen Kostenpakets, kommt **genau ein weiterer Würfel mit der höchsten Seitenzahl des aufgelösten Angriffswurfs** hinzu. Aus 2W8 + 1W4 + 2 wird 3W8 + 1W4 + 2. Auch bei einem Großschwert mit 2W6 ist der Zusatz ein W6, kein weiteres Paar.

Die Berechnung erfolgt nach Waffenführung und gegebenenfalls Hochwirken. Vorübergehender Berserkerschaden, Eigenschaden und getrennte Folgeangriffe erzeugen keine zusätzlichen Aura-Würfel. Feste Boni bleiben einfach; bei einem kritischen Treffer wird der neue Schadenswürfel wie die übrigen Angriffswürfel verdoppelt. Mehrzielangriffe nutzen den verstärkten Wurf pro getroffenem Ziel und bezahlen das Paket einmal.

Eine bereits ausdrücklich mit Aura bepreiste Elite-Technik hat ihre Verstärkung im regulären Budget und erhält keinen zweiten Ersatzbonus. Heilungen, reine Schutzwirkungen und Angriffe mit ausschließlich festem Schaden bekommen keinen erfundenen Schadenswürfel. Aura bezahlt weiterhin das gesamte ersetzbare Kostenpaket; gesonderte Nutzungsbegrenzungen bleiben erhalten.

Auswahl, Durchschnittsanzeige, Würfelanforderung und serverseitige Auswertung verwenden dieselbe abgeleitete Formel. Die Verstärkung wird nicht dauerhaft in die Technik gespeichert. Zurückschalten auf reguläre Kosten stellt die unverstärkte Formel wieder her. Das Rückgängigmachen eines Kampfbeitrags stellt Lebenspunkte, Effekte und verbrauchte Ressourcen wieder her.

## Erweiterter Teulu-Jungdrache

| Neue Technik | Ab Stufe | Kosten | Wirkung |
| --- | ---: | --- | --- |
| Schuppenschnitt | 2 | Aktion | Direkter Schwertangriff |
| Geschlossene Schuppe | 3 | Reaktion | Kein Schaden; +2 RK bis zum Ende des nächsten eigenen Beitrags |
| Flügelschritt des Jungdrachens | 4 | Bonusaktion + Besondere Aktion | Schwertangriff; bei Treffer bis zu 2 m Bewegung innerhalb des Bewegungsbudgets und +1 RK bis zum Ende des nächsten eigenen Beitrags |
| Ruhiger Drachenatem | 6 | Bonusaktion | Kein Schaden; +1 auf Angriffswürfe bis zum Ende des nächsten eigenen Beitrags |

Die beiden reinen Unterstützungen werden automatisch ohne Angriffswurf angewandt. Wiederholungen erneuern ihre Dauer und stapeln den jeweiligen Effekt nicht mehrfach.

Zusätzlich kostet der vorhandene **Schweifkreis ab Stufe 4 Aktion + Besondere Aktion**. Ein Teulu hat dadurch schon auf Stufe 4 zwei entsprechende Optionen. Die ursprünglichen sechs Jungdrachen-Techniken bleiben erhalten. Die Anzahl belegbarer Grundtechniken wächst auf Stufe 1–6 mit **1 / 3 / 5 / 7 / 8 / 10**. Auf Stufe 20 stehen insgesamt 24 Slots zur Verfügung, bevor zusätzliche Pfadwahlen Slots binden.

Die bisher festgelegte halbe Slotzahl des Helwyr bleibt im Verhältnis erhalten: fünf Grundtechnikslots auf Stufe 6, insgesamt zwölf auf Stufe 20. Seine Waffenwege und eingeschränkte Schwertauswahl bleiben bestehen. Andere Klassen erhalten durch diese Teulu-Erweiterung keine pauschale Slotsteigerung.

Bestehende Slot-IDs und individuelle Entscheidungen bleiben erhalten. Geführte und manuelle Aufstiege verwenden dieselben Regeln; mehrere neue Slots derselben Stufe bieten keine bereits anderweitig gewählte Technik erneut an. Gawain, Gildas, Duncan, Gethin, Kane und Guinevere wurden mit erhaltenen bisherigen Entscheidungen abgeglichen. Archivdaten, Exporte, Klassenseiten und die Attackenbibliothek sind synchronisiert.

## Konkrete Schadensbeispiele

Gildas, Stufe 6, einhändiges Ritterschwert 1W8, bestehende Attribut-/Klassenboni zusammen +5. Angaben ohne äußere Buffs; ein erfolgreicher Treffer wird vorausgesetzt.

| Angriff | Schaden jetzt | Durchschnitt |
| --- | --- | ---: |
| Grundangriff | 1W8 + 5 | 9,5 |
| Erster Hieb | 1W6 + 5 | 8,5 |
| Gekreuzte Klauen | 1W8 + 1 + 5 | 10,5 |
| Biss des Jungdrachens | 2W8 + 5 | 14 |
| Schweifkreis | 1W8 + 1W6 + 1 + 5 je Ziel | 14 |
| Stürmende Drachenspur | 2W8 + 1 + 5 | 15 |
| Sechsfacher Lehrhieb | 2W8 + 2 + 5 | 16 |

Der einhändige Lehrhieb steigt von durchschnittlich 14 auf 16 Schaden. Sein Maximum beträgt 23 normal und 39 kritisch. Gawain hat aktuell 49 maximale LP. Lehrhieb plus Gekreuzte Klauen erreichen zusammen maximal 37 ohne Krit. Zweihändig erreicht der Lehrhieb maximal 25 normal beziehungsweise 43 kritisch. Diese Beispiele schließen zusätzliche Buffs und andere Kombinationen nicht ein und garantieren keine bestimmte Duelllänge.

Auf Stufe 8 lautet Gildas' einhändiger Lehrhieb 2W8 + 1W4 + 2 + 5, durchschnittlich 18,5. Mit Aura-Ersatz wird daraus 3W8 + 1W4 + 2 + 5, durchschnittlich 23. Auf Stufe 16 verbessert die bestehende Ausbildungsstaffel den regulären Lehrhieb auf 3W8 + 2 zuzüglich der dann geltenden Klassen-/Attributboni.

Fenrirs Zerschmetternder Hieb steigt auf 1W12 + 1W6, Schildstoß auf 1W6, Doppelhieb auf 1W6 + 1 im Haupttreffer und unverändert 1W4 im Folgetreffer. Kreiselwurf verwendet 2W6 + 1 und Reaktion + Besondere Aktion. Zusätzliche eigene Schadensboni werden beim Doppelhieb weiterhin nicht erneut auf den Folgetreffer gerechnet.

## Umsetzung und Prüfungen

Das gemeinsame Budget bleibt in `drachentanz-damage-progression.js`; Sirenentanz und Huskarl verwenden es wieder. Ein optionaler fester `damageModel.bonusModifier` wird einmal aufgelöst und beim Speichern erhalten. Die eigenständige Datei `combat-aura-attack.js` berechnet ausschließlich den temporären Aura-Zusatz. Client und generierte Firebase-Module verwenden dieselbe Logik. Es gibt keine neue globale Zustandsverwaltung oder parallele Berechnung nur für die Anzeige.

Die automatischen Prüfungen umfassen alle Katalogeinträge mit sechs Waffengrößen über ihre nutzbaren Stufen bis 20, Kostenverfügbarkeit bei Freigabe, nicht sinkende Fortschreibung, Slotmigrationen, Würfelbelege, kritische Treffer und reine Hilfstechniken. Neue Emulatorfälle prüfen Aura-Verbrauch und Rücknahme, manipulierte Eingaben, Mehrzielangriffe, die Abwehrdauer und bereits mit Aura bepreiste Elite-Techniken. Die bestehenden Integrationsfälle decken zusätzlich Zustände, Heilung, Ressourcen, Waffenwechsel, Berserkergang und den Landtroll ab.

Ein vollständiger deterministischer Gruppenkampf mit Seed 81000 wurde nach jedem Beitrag mit der autoritativen Transaktion und ihrer Wiederholung abgeglichen: 29 Beiträge, sechs Runden, Gruppensieg; verbleibende LP Fenrir 26, Freya 42, Guinevere 37, Gawain 21. Der Troll regenerierte insgesamt 78 LP. Dieser einzelne Verlauf ist eine Funktionsprüfung und keine neue statistische Gewinnquote; die früheren Serienberichte bleiben historische Ergebnisse.

Im Browser wurden reguläre/Aura-Zahlung samt Rückwechsel, der echte Technikselektor, schadensfreie Abwehr und die Teulu-Klassenseite geprüft. Die mobile Ansicht bei 390 px hat keinen horizontalen Überlauf. Belege: [Aura am Desktop](technique-balance/aura-desktop.png), [Abwehr mobil](technique-balance/guard-mobile.png). Der integrierte Browser war nicht verfügbar; diese lokale Prüfung lief mit Edge und einer temporären Fixture ohne produktive Firebase-Verbindung.

Abschließender Teststand: **790 bestandene Tests, keine Fehler und keine übersprungenen Tests**: 588 Frontend-/Mechaniktests, 38 Klassentests, 90 Funktionstests auf Serverseite, 69 bestehende Emulatorfälle und fünf neue Aura-/Technikfälle. Produktions-Build, Klassen-/Bibliotheksabgleich, Charakterdaten-Abgleich und `git diff --check` sind ebenfalls erfolgreich. Vite meldet weiterhin große Ausgabepakete; dies ist keine neue Maßnahme zur Ladezeitoptimierung.

Die Testdaten der ausschließlich lokalen Datenbank `demo-aleria-combat-checkup` wurden danach gelöscht. Ihr Firestore-Emulator samt Java-Starter wurde beendet und Port 8180 als frei geprüft. Die temporäre Browser-Fixture wurde entfernt. Reproduzierbare Testfälle, dieser Bericht und die beiden Bildschirmbelege bleiben im Repository erhalten.
