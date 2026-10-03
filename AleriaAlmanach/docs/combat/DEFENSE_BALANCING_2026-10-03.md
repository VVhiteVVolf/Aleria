# Rüstung und Beitrags-Balancing – 3. Oktober 2026

Dieses Paket setzt die freigegebenen Vorschläge aus dem Kampf-Checkup um. Die Waffenwürfel und Aktionskosten bleiben unverändert. Ein Beitrag ist weiterhin die gemeinsame Runde aller seiner Segmente.

## Rüstung

| Rüstung | Grund-RK | Geschicklichkeit | Schutz |
| --- | ---: | --- | --- |
| Jungritter-/entsprechende schwere Startrüstung | 15 | Kein Bonus | 1 weniger Hieb, Stich oder Wucht pro Treffer |
| Mittlere Rüstung | 14 | Bis +2 auf Stufe 1–9, +4 auf 10–15, unbegrenzt ab 16 | Individuelle Ausrüstungseffekte bleiben erhalten |
| Leichte Rüstung | 11–12 gemäß Gegenstand | Voller Bonus ab Stufe 1 | Individuelle Ausrüstungseffekte bleiben erhalten |

Sonderschutz ersetzt den Grundschutz: Silberschuppe reduziert weiterhin Hieb/Stich um 2; Gafyr-Platte alle Arten außer Stich um 2. Gildas erhält gegen Stich ausdrücklich keinen zusätzlichen Grundschutz. Senior-Rüstungen mit höherem Grundwert werden nicht auf 15 abgesenkt.

Ylva und Freya erhalten für ihre nun mittlere Rüstung auch die persönliche Rüstungsausbildung. Ylva bleibt ohne Schild. Ein Schild gibt bei Doppelwaffen oder einer echten Zweihandwaffe weder RK noch Schutz oder passive Schildregeln. Explizite Technikvoraussetzungen prüfen weiterhin die ausgewählte Ausrüstung und verhindern widersprüchliche Handbelegungen.

## Effekte pro Beitrag

- Positive RK-Haltungen aus Kampfformen: nur der stärkste aktive Bonus zählt. Rüstung, ein zulässiger Schild, sonstige Boni und negative Modifikatoren bleiben getrennt wirksam.
- Zufällige Kritnebenfolgen: höchstens eine Trefferfolge je Angreifer und Ziel sowie eine Fehlschlagsfolge je Angreifer und Beitrag. Kritischer Schaden und eigene Waffenkrit-Effekte bleiben erhalten.
- Hauptaktionssperre: erneute Anwendung verlängert eine laufende Sperre nicht. Nach Ablauf einer neu angewandten Sperre schützt **Handlungssicherheit** bis zum Ende des nächsten eigenen Beitrags vor einer weiteren Hauptaktionssperre. Ein verhindertes Anwenden wird in der Auswertung erklärt.
- Liegend sperrt unverändert die Bonusaktion. Andere Bonusaktions-/Reaktionssperren reduzieren dieselbe Ressource nicht mehrfach unter null.
- Strukturierte Bewegungswirkungen von Kampftechniken werden für das Spiel ohne Meterbewegung ersetzt: eigene günstige Position gibt −1 auf den nächsten gegnerischen Waffen-/Technikangriff; behinderte Position gibt −1 auf den nächsten eigenen solchen Angriff. Auch ein Fehlschlag verbraucht den Effekt. Gleiche Stellungseffekte stapeln nicht und verfallen spätestens nach dem nächsten eigenen Beitrag. Rettungswürfe und Trefferbedingungen bleiben bestehen.
- Persönliche Mehrfachangriffe behandeln diesen einmaligen Malus nur beim ersten Wurf. Frekis Fesselbiss/Flankenlauf und Ylvas festnagelnder Schuss verwenden dieselbe Regel.

Keine pauschale Änderung von Zaubern. Waffenreichweiten und erzählerische Positionsangaben werden nicht als zusätzliche automatisierte Schadens- oder Bewegungsboni interpretiert.

## Lebenspunkte und Migration

Rhiannons Maximum steigt einmalig von 25 auf 35. Aktuelle und temporäre TP, verbleibende Nutzungen, Ressourcen, Zustände, Stufen, Online-IDs und Besitz bleiben beim Abgleich erhalten. Frekis vorhandene 50 Online-TP werden nicht auf den älteren Katalogwert 38 zurückgesetzt. Weitere pauschale TP-Erhöhungen gibt es nicht.

Der Releaseplan schreibt nur tatsächlich geänderte Bereiche und ist wiederholbar ohne erneute Boni. Schreibschutzrevisionen und Firestore-Vorbedingungen verhindern ein Überschreiben gleichzeitig geänderter Daten. Historische Beiträge werden nicht geändert. Eine administrative Regelgrenze aktualisiert alte Inventaransichten der Szene und sperrt automatische Rücknahmen über diese Grenze; sie verbraucht keine Beitragsdauer und füllt nichts auf.

## Quellen und Prüfung

Gemeinsame Rüstungsquelle: `modules/character-equipment/equipment-armor-rules.js`. Gemeinsame Stellungseffekte: `modules/combat-styles/martial-position-effects.js`. Browser und generierte Servermechanik verwenden denselben Code. Klassenkataloge, eigene Bögen, Inventarkarten, Handelsregister und Archiv wurden abgeglichen.

Die statistischen Daten stehen in `defense-balance-2026-10-03/fairness.json`. Je Vergleich werden 512 ganze Beiträge ausgewertet; reguläre und einmalig verstärkte Folgen sind getrennt. Die Methode, Grenzen und Ausgangswerte stehen im [vorherigen Checkup](COMBAT_CHECKUP_2026-10-03.md). Die Stichprobe ist keine optimale Duelltaktik und keine Garantie ausgeglichener Siegraten.

## Messergebnisse und Abschlussprüfungen

| Figur | Stufe | Maximale TP | RK mit aktueller Waffenwahl |
| --- | ---: | ---: | ---: |
| Fenrir Varulv | 6 | 82 | 15 |
| Ylva Wolfshorn | 7 | 95 | 16 |
| Freya Skald | 5 | 42 | 17 |
| Asgeir Wolfshorn | 7 | 108 | 15 |
| Gildas Gafyr | 6 | 58 | 15 |
| Guinevere Neidr | 5 | 37 | 15 |
| Nudd Saethwyr | 6 | 73 | 15 |
| Gais Wyrm | 5 | 43 | 15 |
| Gawain Draig | 5 | 49 | 15 |
| Rhiannon Draig | 6 | 35 | 10 |

Mittlere Basis-RK bleibt 14: Ylva erreicht mit GES 16, Asgeir und Fenrir 15. Freya erreicht mit GES und zulässig geführtem Schild 17.

| Angreifer → Ziel, verstärkter Beitrag | Schaden vorher → jetzt | K.-o.-Quote vorher → jetzt |
| --- | ---: | ---: |
| Asgeir Wolfshorn → Ylva Wolfshorn | 29,7 → 22,9 | 0,0 % → 0,0 % |
| Gawain Draig → Guinevere Neidr | 21,3 → 15,8 | 4,7 % → 2,7 % |
| Gildas Gafyr → Freya Skald | 27,4 → 20,0 | 5,7 % → 2,1 % |
| Gawain Draig → Rhiannon Draig | 22,1 → 22,7 | 42,2 % → 7,0 % |
| Gais Wyrm → Gawain Draig | 9,9 → 10,8 | 0,0 % → 0,0 % |
| Nudd Saethwyr → Gildas Gafyr | 9,4 → 10,3 | 0,0 % → 0,0 % |

Die Schutzlücke leichter und mittlerer Figuren sinkt, ohne die TP aller Frontkämpfer anzuheben. Gais und Nudd bleiben offensiv hinter stärker ausgestatteten Kämpfern; dieses Paket hebt ihre Waffenwürfel nicht zusätzlich an. 0 % bedeutet in der Tabelle 0 von 512 Proben, keine Unverwundbarkeit.

Geprüft: 1.274 Browser-/Klassentests, 137 Serverprüfungen, 28 gespeicherte Kampftests und 39 Inventar-/Kritduelltests. Die letzten Serialisierungs-, Archiv- und Konterkorrekturen wurden zusätzlich in 40 gezielten Regressionen, 19 Quellabgleichprüfungen und vier gespeicherten Beitragstests geprüft. Diese Wiederholungen überschneiden sich mit der Gesamtsuite. Produktionsbuild und Klassen-/Archiv-Konsistenzprüfungen bestehen.

Der Handlungstest wertet 2.922 Varianten ohne Fehler aus. 64 Schwerttechniken Duncans bleiben mangels entsprechender Waffe im bestehenden Online-Bogen gesperrt; Besitz wurde nicht erfunden oder automatisch ergänzt.
