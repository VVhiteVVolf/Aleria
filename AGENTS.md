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

Am 12. September 2026 wurden die Manakosten aller Zaubergrade um 15 % erhöht, auf ganze Punkte aufgerundet. Die zentrale Staffel für Grad 0–10 lautet **2, 3, 4, 6, 7, 9, 11, 12, 13, 15, 18**. Sie gilt auch für ältere Katalogfassungen und bereits gelernte Zauber. `getSpellManaCost` bleibt die gemeinsame Quelle; gespeicherte Kosten niemals erneut mit 1,15 multiplizieren. Manavorräte, Regeneration und Aktionskosten werden durch diese Erhöhung nicht verändert.

Die aktuelle Zuordnung aller 23 Rhiannon-Zauber steht in [SPELL_ACTION_ECONOMY.md](AleriaAlmanach/docs/combat/SPELL_ACTION_ECONOMY.md). Rhiannons Schadenszauber verwenden ihren aktuellen INT-Modifikator; dieser muss in Schadenswurf, Durchschnitt und sichtbarer Formel berücksichtigt werden.

# Play-Chronologie

Der **9. Lichtkehr 1740 (09.03.1740)** ist unveränderlich **Tag 1 des Plays**. Der 10. Lichtkehr ist Tag 2, der 11. Tag 3; frühere Daten werden als **Vergangenheit** bezeichnet. Die Zählung gilt szenenübergreifend und verwendet den Aleria-Kalender mit 36 Tagen pro Monat und 13 Monaten pro Jahr. `AleriaCalendar.playStartDate`, `playDay` und `playDayLabel` sind die gemeinsame Quelle. Aktuelles Weltdatum und Szenenbeginn dürfen den Playbeginn nicht verschieben. Gespeicherte relative Szenenuhren und mechanische Erholungsschlüssel dürfen nicht zur Korrektur einer Play-Tagesanzeige umnummeriert werden.

# Freigegebene Veröffentlichung während des Gildas–Gawain-Duells

Ylva Wolfshorn (Skytte 7), Asgeir Wolfshorn/Bleiddorn (Skjaldr 7) und Ylvas Gramnir Freki (4) gehören zur freigegebenen Veröffentlichung. Bestehende Online-IDs erhalten; Release- und Verknüpfungsdetails: [Wolfshorn-Kampfbögen](AleriaAlmanach/docs/combat/WOLFSHORN_COMBAT_SHEETS.md).

Die Aldrimar-Erweiterung umfasst 303 Katalogoptionen (zuvor 111), mindestens zwei zusätzliche Möglichkeiten pro Klasse und Stufe 1–8 sowie weitere Pfadoptionen. Freki erhält sechs aktive Manöver und einmalig 15 % mehr TP: 33 → **38**, aufgerundet. Bei späteren Importen diesen Aufschlag nicht erneut anwenden.

Die zuletzt festgelegten Ausrüstungswerte stehen in der unten verlinkten Übernahme-Liste: Silberschuppe −2 Schaden gegen Hieb/Stich, Gafyr-Plattenrüstung −2 gegen alles außer Stich; beide ohne zusätzlichen RK-Bonus. Drachenzahn +1 Schaden und +2 bei kritischem Treffer (nicht nochmals verdoppelt); Pflichtschwur +1 Angriff/+1 Schaden ohne kritischen Zusatzeffekt. Frühere Vorschläge wie Schuppenpolster oder Wachtstellung sind ersetzt.

Am 22. September 2026 hat der Nutzer die vorherige Veröffentlichungssperre ausdrücklich aufgehoben: **sämtliche Änderungen auf master pushen, veröffentlichen und online einsatzbereit machen.** Der bisherige Gildas–Gawain-Kampfverlauf einschließlich aller Würfe und Effekte muss unverändert bleiben; kommende Handlungen verwenden die neuen Regeln. Bestehende Beiträge niemals neu auswerten oder überschreiben. Die administrative `combat-rules-release`-Grenze aktiviert kritische Nebeneffekte für kommende Handlungen, gleicht Inventarsnapshots ab und darf weder Aktionsressourcen auffüllen noch Zustandsdauern fortschreiben. Automatische Rücknahmen über diese Grenze sind gesperrt, damit alte Ausrüstungsdaten nicht wiederhergestellt werden. Live-TP, Ressourcen, Zustände, Besitz und Online-IDs erhalten. Details: [Ausrüstungsübernahme](AleriaAlmanach/docs/inventory/PENDING_DUEL_EQUIPMENT_RELEASE.md).
