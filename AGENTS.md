# Projektregeln für Zauberkosten

Die vom Nutzer am 11. September 2026 festgelegte Aktionsökonomie gilt auch für künftig ausgearbeitete und überarbeitete Zauber. Kosten nach tatsächlichem Schaden, Wirkung, Dauer und Rolle wählen; nicht jeden Zauber pauschal mit einer Aktion bepreisen.

| Aktionskosten | Verwendung |
| --- | --- |
| Aktion | Schadenszauber, aktive Zauber und Zauber, die Effekte auslösen |
| Aktion + Besondere Aktion | Starke Zauber, meist starker Schaden oder besonders starke Effekte |
| Aktion + Besondere Aktion + Reaktion **oder** Bonusaktion | Seltene, sehr mächtige Zauber, die fast alle Ressourcen binden; Rhiannon hat derzeit einen |
| Aktion + Reaktion | Vorbereitung, Buffs, Debuffs und mittlere Schadenszauber |
| Aktion + Bonusaktion | Geringer Schaden, kurze Zauber, häufig Zaubertricks |
| Aktion + Reaktion + Bonusaktion | Mächtige Zauber, die alle regulären Aktionsressourcen außer Besonderer Aktion nutzen |
| Reaktion | Buffs, mittlerer Schaden und Effekte |
| Bonusaktion | Schnelle, schwache Zauber und Zaubertricks, geringer Schaden |
| Reaktion + Bonusaktion | Reaktive und alternative Zauber mit respektablem Schaden |

Die Pakete sind Gestaltungsregeln, keine automatische Schadensstaffel. Mana und etwaige zusätzliche Nutzungsgrenzen werden separat behandelt. Aktionskosten müssen in Daten, Anzeige, Reservierung und serverseitigem Verbrauch übereinstimmen. Bestehende gemeinsame Ressourcenlogik wiederverwenden und profilbezogene Anpassungen in einem eigenen Klassenmodul kapseln.

Die aktuelle Zuordnung aller 23 Rhiannon-Zauber steht in [SPELL_ACTION_ECONOMY.md](AleriaAlmanach/docs/combat/SPELL_ACTION_ECONOMY.md). Rhiannons Schadenszauber verwenden ihren aktuellen INT-Modifikator; dieser muss in Schadenswurf, Durchschnitt und sichtbarer Formel berücksichtigt werden.
