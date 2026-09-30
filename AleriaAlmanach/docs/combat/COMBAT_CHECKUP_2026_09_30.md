# Fähigkeits- und Schadensprüfung vom 30. September 2026

## Umfang und Grenzen

- 816 Kampfform-Techniken aus Drachentanz, Sirenentanz/Wyrmtanz und Huskarl-Waffenlehre.
- 166 aktuelle Katalogzauber mit insgesamt 346 Grund-/Hochwirkungsformen.
- Frische, ausschließlich lesend geladene Online-Bögen: 24 Charakterdatensätze und 10 Kreaturen.
- 2.931 Auswertungen der verfügbaren Online-Handlungen mit unterschiedlichen Waffen, Waffenpaaren, Schild-/Reitkonfigurationen sowie Treffer, Fehlschlag und Krit.
- Weitere 3.621 Katalogauswertungen: drei Ergebnisse für jede der 816 Techniken und 346 Zauberformen, dazu bestandene sekundäre Rettungswürfe für alle 135 entsprechenden Techniken. Unabhängige Würfelarithmetik prüft Würfelsumme, feste Boni, Krit-Verdopplung und Übereinstimmung mit der Schadensvorschau. Kostenverbrauch, schadensfreie Selbstvorbereitung und beide Zweige der Rettungswurf-Nebenwirkungen werden geprüft.
- Ergänzende Regressionen und Firestore-Integrationstests prüfen Speicherung, Replay, Ressourcensperren, Erholung, Ausrüstung, kritische Folgen, Entwaffnung, Aufnahme und Rücknahme.

Die Katalogprüfung erzwingt die Verfügbarkeit ihrer isolierten Testhandlung, um auch noch nicht von einer Figur erlernte Effekte zu erreichen. Klassen-/Stufenzugang und Ausrüstung werden separat in den bestehenden Vergabe-, Ausrüstungs- und Klassenintegrationstests geprüft. Kanalisierung wird für den reinen Katalog-Würfeltest übersprungen; ihren Ablauf prüfen eigene Tests. Manuell erzählte Zaubereffekte bleiben manuell. Eine automatisch erfolgreiche Testauswertung beweist nicht, dass jede erzählerische Wirkung ausgewogen ist.

Sämtliche Schreibtests verwenden ausschließlich die fest abgesicherten Demo-Projekte auf localhost:8180 bzw. localhost:8182. Die Online-Daten dienen als unveränderte Kopiervorlage. Historische Spielbeiträge werden nicht neu ausgewertet.

## Korrigierte Mechanik

| Fehler | Korrektur und Nachweis |
| --- | --- |
| Bei einem gelungenen Rettungswurf entfielen Zusatzwürfel vor der Halbierung. | Derselbe vollständige Schadenspool wird gewürfelt und danach halbiert. Beispiel mit kontrollierten Viererwürfen: W6 + W4 ergibt 8 bzw. halbiert 4, nicht 2. |
| Ein kritischer Angriff konnte eigene Gesundheitskosten verdoppeln. | Kritische Verdopplung gilt für gegnerischen Schaden. Ein eigener W6 bleibt ein W6. |
| Ein gegnerischer Rettungswurf konnte eigene Gesundheitskosten halbieren. | Selbstschaden bleibt unabhängig vom gegnerischen Rettungswurf. Die Reihenfolge der Effekte darf keine Boni oder Würfel zwischen Selbst- und Fremdschaden vertauschen. |
| Folgeangriffe verloren den Verteidigungsmodifikator ihrer Technik. | Die gesamte Angriffsfolge berücksichtigt den Modifikator. Jeder Teilangriff wird weiterhin separat gewürfelt. |
| Waffen-Techniken zeigten häufig „physisch“ statt Hieb/Stich/Wucht. | Vorschau, Schadensbeleg und Abwehr verwenden dieselbe aufgelöste Schadensart. Die Abwehr hatte den geerbten Typ bereits korrekt verwendet; falsch waren Anzeige und Beleg. |
| Eine ausdrücklich zweihändige Technik konnte bei vielseitigen Waffen mit Einhand-Formel ausgewertet werden. | Der vorgeschriebene Zweihandgriff wird automatisch verwendet, einschließlich des bereits geltenden −1-Angriffstauschs. Die Einhandauswahl ist für diese Technik gesperrt; Schild und Zweitwaffe bleiben Ausschlussgründe. |

Browser und generierte Servermechanik verwenden dieselben Änderungen. Die Korrekturen betreffen kommende Auswertungen, nicht gespeicherte Würfe.

## Inhaltliche Balancing-Befunde – keine stillen Regeländerungen

### Leichte Angriffe auf Stufe 7

Die zentrale Schadensstaffel verwendet für reine Bonusaktionsangriffe einen festen W6. Ab Stufe 7 kommt bei älteren Techniken ein Ausbildungs-W4 hinzu; Attribute, persönliche Ausbildung und Ausrüstung werden anschließend addiert.

| Figur / Handlung | Kosten | Aktuelle Formel | Ø Rohschaden |
| --- | --- | --- | --- |
| Asgeir: normaler rechter Axthieb | Aktion | W6 + 6 | 9,5 |
| Asgeir: Kurzer Axthieb | Bonusaktion | W6 + W4 + 6 | 12 |
| Ylva: normaler Langbogenschuss | Aktion | W8 + 5 | 9,5 |
| Ylva: Erster Jagdpfeil | Bonusaktion | W6 + W4 + 5 | 11 |

Das ist rechnerisch korrekt, macht aber die als „leicht“ beschriebenen Angriffe auffällig effizient. Der feste W6 hängt außerdem nicht am Waffenwürfel: Ein Dolch und eine schwere Axt bekommen denselben Grundwürfel dieser Technik. Eine Überarbeitung sollte die **gesamte** leichte Schadensstaffel samt Ausbildungsbonus betrachten, statt einzelne Charaktere durch Sonderkorrekturen zu verändern.

### Neue Technik bedeutet nicht automatisch mehr Schaden

Asgeir mit den Handäxten, Stufe 7:

- **Doppelter Axtgriff**, ab Stufe 4, Aktion + Reaktion: 2W6 + W4 + 6, Ø 15,5.
- **Gekreuzte Axtwende**, ab Stufe 7, Aktion + Reaktion: 2W6 + 7, Ø 14; dafür bei Treffer +1 RK für einen eigenen Beitrag.

Die Differenz entsteht aus der getrennten Staffel für Freischaltstufe und spätere Ausbildung. Hier gibt es einen nachvollziehbaren Tausch von Schaden gegen Deckung. Allein aus dem höheren Mindestlevel folgt deshalb kein sicherer Fehler. Die Würfel sind addierte Schadensanteile **eines** Angriffs, keine automatischen Zusatzangriffe; Ylvas und Asgeirs persönliche Angriffsfolgen bilden ausdrückliche Ausnahmen mit separaten W20-Würfen.

### Bewegungswirkungen ohne Bewegungsreichweite

115 Katalogtechniken enthalten eine Bewegungswirkung oder einen entsprechenden Rettungswurf-Nebeneffekt. Ihre weiteren Schäden/Schutzeffekte können sinnvoll bleiben; eine Meteränderung allein bietet in der gewünschten Spielweise jedoch keinen messbaren Vorteil.

Konkrete betroffene Beispiele:

- Frekis **Flankenlauf**: Bonusaktion + Reaktion für ausschließlich +3 m Bewegung.
- Frekis **Fesselbiss**: Der zusätzliche Nutzen der Reaktion ist derzeit der Bewegungsabzug nach Rettungswurf.
- Ylvas Langbogen: **Festnagelnder Schuss** reduziert bei Krit die Bewegung um 2 m.

Diese Fähigkeiten wurden nicht eigenmächtig in Ressourcensperren umgewandelt. Das wäre eine erhebliche Wirkungsänderung. „Liegend“ bleibt ausdrücklich wie freigegeben: Bonusaktion im nächsten eigenen Beitrag gesperrt, keine zusätzlichen Bewegungs-/Angriffsabzüge.

## Datenbefund: Duncan

Der aktuelle Online-Bogen und sein jüngerer Archivstand enthalten als Waffe nur „Nahkampf“, während der ursprüngliche Export `duncan-gafyr.json` die **Gafyr-Meisterklinge** enthält. Dadurch sind im aktuellen Online-Bogen 64 Schwerttechniken mangels passender Waffe gesperrt. Sein Inventar besteht aus allgemeinen Platzhaltern, nicht aus einer verknüpften Meisterklinge.

Die Sperre funktioniert regelgerecht; zu klären ist der beabsichtigte Besitzstand. Der Checkup setzt deshalb weder die alte Ausrüstung noch alte TP/Ressourcen aus dem historischen Export in den Live-Bogen zurück.

## Testpflege

- Historische Klassenintegrationstests prüfen jetzt **Durchschnaufen** und reguläre Techniken mit Besonderer Aktion, nicht die gestrichenen generischen Klassenmanöver.
- Die Inventar-Duellvorlage wählt Gildas und Gawain ausdrücklich nach Namen. Dass Gais und Nudd inzwischen Kampfbögen haben, darf ihre feste Testzuordnung nicht verschieben.
- Ein vorhandener Kampfbogen wird an maximalen TP und Waffen erkannt; 0 aktuelle TP nach einem echten Kampf sind kein fehlender Bogen.
- Die automatische Testkampf-Auswahl berücksichtigt gesperrte Ressourcen nach dem Auffüllen eines Beitrags. Ohne nutzbaren Angriff wird ein regulärer Wartebeitrag erzeugt, damit Zustände normal auslaufen können.
- Der ältere Zweihand-Duellsimulator vergleicht mit einer frisch berechneten lokalen Referenz statt mit Siegern/Rest-TP vom 13. September. Für diesen begrenzten Würfel-/Griffvergleich wird ausdrücklich die alte Begegnungsversion ohne W10-Nebeneffekte verwendet. Die aktuelle Begegnungsversion einschließlich aller kritischen Folgen wird separat in den Inventar- und Jungdrachen-Duellen geprüft.

Vollständige Testkämpfe prüfen die Mechanik unter einer einfachen automatischen Handlungswahl. Ihre Sieger sind keine belastbare Rangliste der Figuren und ersetzen kein Balancing mit menschlichen Entscheidungen.

## Wiederholbare Prüfungen

Abschließender Stand: **1.228 Frontend-/Klassentests, 135 Server-Unit-Tests und 236 unterschiedliche Integrationstests erfolgreich**. Die Integration wurde auf den jeweils vorgeschriebenen Emulator-Ports ausgeführt; nach Korrektur veralteter Testvorlagen wurden die betroffenen 12 Griff-Duelle und der Helwyr-Kampf gezielt wiederholt. Vier neue gespeicherte Schadens-/Zweihandfälle ergänzen den bisherigen Bestand. Der Produktionsbuild ist erfolgreich.

Die reine Katalogprüfung umfasst 3.621 Auswertungen; der zusätzliche Durchlauf mit Online-Kopien 2.931. Diese Auswertungen sind keine weiteren unabhängigen Testfälle. Der historische Gawain–Gildas-Verlauf wurde separat lesend mit seiner Sicherung verglichen: alle 121 bisherigen Beiträge unverändert.

- `node --test tests/combat-damage-contract.test.mjs tests/combat-catalog-resolution.test.mjs tests/combat-weapon-grip.test.mjs` im Almanach.
- Vollständiger Frontend-/Klassenbestand: `node --test --test-concurrency=2 tests/*.test.mjs ../Klassenordner/tests/*.test.mjs`.
- Server: `node scripts/sync-almanach-mechanics.mjs`, danach `node --test tests/*.test.js` in `firebase/functions`.
- Integrationstests benötigen ihre in den Kontextdateien festgelegten Demo-Projekte/Ports. Die drei Dateien `combat-class-actions`, `item-duel` und `scene-item-authoring` verwenden Port 8182, die übrigen Port 8180. Pro Projekt nacheinander ausführen.
