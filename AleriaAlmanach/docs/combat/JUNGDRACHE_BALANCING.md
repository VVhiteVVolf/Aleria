# Jungdrache – Balancing vom 30. September 2026

Gemeinsame Quelle: `modules/combat-styles/drachentanz/techniques/jungdrache-shared-techniques.js`.
Alle sieben Cenyr-Klassen mit Jungdrachen-Zugang erhalten die freigeschalteten Techniken automatisch. Derwyn erhalten sie ausschließlich mit gewählter Jungdrachen-Grundausbildung. Waffenart: **Beliebig**; aktuelle Waffe, Ausrüstungseffekte und Munition gelten weiterhin.

**Geschlossene Schuppe** behält ihre ID und ihre Reaktionskosten, gewährt künftig jedoch nur **+1 RK**. Sie steht ebenfalls allen zugänglichen Jungdrachen-Ausbildungen offen.

| Technik | Stufe | Kosten | Wirkung |
| --- | ---: | --- | --- |
| Sicherer Drachenhieb | 1 | Aktion | Regulärer einzelner Technikangriff |
| Kurze Drachenspur | 1 | Bonusaktion | Leichter einzelner Technikangriff |
| Geschuppte Deckung | 2 | Reaktion + Bonusaktion | +2 RK |
| Verwurzelte Schuppe | 2 | Bonusaktion | Einmalig 4 weniger Schaden beim nächsten schädigenden Treffer |
| Gesammelter Blick | 2 | Bonusaktion + Reaktion | Einmalig +2 auf den nächsten Waffen-/Technikangriff |
| Täuschende Klaue | 2 | Aktion + Bonusaktion | Normaler Waffentreffer; bei Treffer einmalig Vorteil auf den nächsten Angriff |
| Stäubende Schwinge | 3 | Aktion + Reaktion | Normaler Waffentreffer; GES SG 13 oder Liegend |
| Gebundene Klaue | 3 | Aktion + Bonusaktion | Normaler Waffentreffer; STÄ SG 13 oder keine Reaktion |
| Lauernde Klaue | 3 | Bonusaktion + Reaktion | Einmaliger Gegenangriff nach gegnerischem Fehlschlag |
| Unruhiger Griff | 4 | Aktion + Reaktion | Normaler Waffentreffer; STÄ SG 13 oder keine Bonusaktion |
| Gleitende Schuppe | 4 | Reaktion + Besondere Aktion | Einmalig Nachteil auf den nächsten eingehenden Waffen-/Technikangriff |
| Entwaffnende Klaue | 4 | Aktion + Reaktion + Besondere Aktion | Gegenangriff; bei Treffer STÄ SG 13 oder Entwaffnung |
| Fallende Schwinge | 5 | Aktion + Bonusaktion + Besondere Aktion | Gegenangriff; bei Treffer GES SG 13 oder Liegend |
| Erstickte Antwort | 5 | Aktion + Reaktion + Besondere Aktion | Gegenangriff; bei Treffer STÄ SG 13 oder keine Reaktion |
| Drachenklammer | 6 | Aktion + Reaktion + Besondere Aktion | Normaler Waffentreffer; KON SG 13 oder Benommen: keine Aktion |
| Brechender Widerhall | 6 | Aktion + Bonusaktion + Reaktion + Besondere Aktion | Gegenangriff; bei Treffer KON SG 13 oder Benommen: keine Aktion |

## Dauer und Grenzen

- Schutzhaltungen ersetzen einander: Geschlossene Schuppe, Geschuppte Deckung, Verwurzelte Schuppe, Gleitende Schuppe und Konterhaltungen sind nicht untereinander stapelbar. Angriffsvorbereitungen bilden eine eigene, ebenfalls nicht stapelbare Gruppe.
- Haltungen und Vorbereitungen verfallen spätestens am Ende des nächsten eigenen Beitrags. Einmalige Angriffsboni werden auch bei Fehlschlag verbraucht, jedoch nicht durch automatische Selbstfähigkeiten.
- **Liegend:** Die Bonusaktion entfällt im nächsten eigenen Beitrag. Kein Bewegungsabzug, kein Angriffsnachteil. Dieselbe Wirkung gilt für die manuell auswählbare Liegend-Vorlage.
- Sperren betreffen nur die ausdrücklich genannte Ressource, bis zum Ende des nächsten eigenen Beitrags. Benommen sperrt die Aktion; Bonusaktion und Reaktion bleiben möglich. Wiederholtes Anwenden stapelt denselben Effekt nicht.
- Kontrollangriffe verwenden normalen Waffenschaden ohne zusätzliche Technik-Schadensstaffel. Ihre Kosten bezahlen vor allem den möglichen Zusatzeffekt.
- Die neuen Techniken lassen sich nicht über Aura-Fokus an ihren ausdrücklich vorgesehenen Kosten vorbei bezahlen.

## Konter und Speicherung

Ein verfehlter Waffen- oder Technikangriff löst höchstens einen vorbereiteten Gegenangriff aus. Bei einer fest zusammengehörigen Angriffsfolge erfolgt die Antwort nach Abschluss dieser Auswertung; sie unterbricht nicht bereits bezahlte Teilangriffe. Der Konter verwendet die dann verfügbare geführte Waffe, hat immer Vorteil und kann selbst treffen, verfehlen oder kritisch treffen. Waffen- und Rüstungseffekte werden regulär berücksichtigt. Ein Gegenangriff löst keine weitere Konterkette aus. Kampfunfähigkeit und fehlende Munition verhindern den Konter nachvollziehbar.

Die Würfe erfolgen ohne weiteres Würfelfenster. Auswertung und Erzähltext zeigen Konter, Angriffswurf, gegnerische Verteidigung, Schaden, Rettungswurf und TP-Änderung. Munition wird beim Konternden abgezogen. Entwaffnete Waffen erscheinen als aufnehmbare Szenengegenstände; Körperwaffen erhalten stattdessen einen kurzen Malus von −1 Angriff.

Browser und generierte Servermechanik verwenden denselben Resolver. Der Server prüft die eigenen Würfelbelege des Konters. Die gemeinsame Auswertung enthält beide TP-Ketten, Zustände und Inventaränderungen, sodass Speicherung, Szenen-Replay und Rücknahme übereinstimmen.

## Übernahme und Prüfung

`firebase/functions/scripts/jungdrache-release-model.mjs` liefert ausschließlich Änderungen an Techniken und gegebenenfalls Ausbildungsdaten. Der Online-Abgleich verwendet Versionsvorbedingungen und erhöht die geschützte Bogenrevision. Keine Neuauswertung historischer Beiträge, keine Auffüllung von TP, Aktionspunkten oder Nutzungen.

Prüfungen: alle 16 Techniken, Klassen-/Stufenzugang, Schutzersetzung, einmalige Vorbereitung, Liegend, Ressourcensperren, fünf Kontervarianten, Munition, Manipulation von Würfelbelegen, Browser-Auswahl und automatische Selbstziele. `firebase/functions/tests/integration/jungdrache-duel.integration.mjs` prüft echte Speicherungen/Rücknahmen und Asgeir gegen Gawain und Gildas ausschließlich im lokalen Demo-Emulator. Der protokollierte deterministische Testkampf ist ein Funktionstest, keine statistische Aussage über Siegchancen.

Validiert: 1.219 Frontend-/Klassenprüfungen, 135 Serverprüfungen und 17 Emulatorprüfungen. Auswahl als Liste und Arsenal, Konterauswertung sowie Desktop-/Mobilansicht wurden im lokalen Browser geprüft; der Produktionsbuild ist erfolgreich. Der Übernahmeplan umfasst acht bestehende Online-Bögen. Die 121 gespeicherten Beiträge des bisherigen Gawain–Gildas-Duells wurden vor der Veröffentlichung unverändert vorgefunden.
