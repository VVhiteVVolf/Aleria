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

# Automatisch erlernte Kampfform-Techniken

Alle Techniken einer zugänglichen Kampfform werden beim Erreichen ihrer Mindeststufe automatisch ins Arsenal übernommen, auch bei bestehenden Bögen. Historische Attackenslots dürfen die Anzahl erlernter Techniken nicht begrenzen; Pfadwahl, Klassenzugang sowie Waffen-, Schild- und Reitvoraussetzungen bleiben verbindlich. Gemeinsame Vergabe: `modules/classes/class-form-arsenal.js` mit Cenyr-Ausbildungsabgleich; Browser und generierte Servermechanik müssen übereinstimmen.

Am 26. September 2026 wurden die generischen **Besonderen Klassenmanöver vollständig gestrichen**, einschließlich ihrer automatischen Stufenvergaben. Reguläre Kampfform-Techniken und persönliche Fähigkeiten mit Besonderen Aktionen bleiben erhalten. Die bisherige Erholungsoption heißt klassenübergreifend **Durchschnaufen**: 1 eigener Klassen-Trefferwürfel + aufgerundete 10 % maximale TP heilen, ohne KON-Bonus; 1 Bonusaktion, einmal pro langer Rast. Jede Nahkampfklasse und alle bisherigen Empfänger erhalten sie. Zentrale Quelle: `modules/classes/martial-recovery.js`; Nutzungen bei wiederholtem Abgleich niemals auffüllen. Gais bleibt Uchelwyr. Selbstfähigkeiten wählen automatisch die eigene Figur. Schild- und Reittierwechsel verwenden die gemeinsame Ausrüstungs- und Kostenlogik und dürfen keine alten Kampfauswertungen verändern.

Ylvas und Asgeirs am 26. September freigegebene Grenzer-Passiven, Ausrüstung und persönliche Angriffsfolgen sind in [Wolfshorn-Verstärkung und Durchschnaufen](AleriaAlmanach/docs/combat/WOLFSHORN_RECOVERY_RELEASE.md) festgehalten. Ylva erhält keinen Schild. Persönliche Ausbildung darf nicht als übertragbarer Gegenstandsbonus gespeichert werden.

Jungdrachen-Balancing vom 30. September 2026: Geschlossene Schuppe gibt +1 RK. Gemeinsame Waffenart-unabhängige Techniken stehen allen Klassen mit Jungdrachen-Zugang entsprechend ihrer Stufe offen. **Liegend kostet die Bonusaktion im nächsten eigenen Beitrag**, ohne Bewegungsabzug oder Angriffsnachteil. **Lauernde Klaue kostet nur Bonusaktion + Reaktion**, keine Besondere Aktion. Einmalige Vorbereitungen dürfen nicht durch automatische Selbsthaltungen verbraucht werden. Details und Testgrenzen: [Jungdrachen-Balancing](AleriaAlmanach/docs/combat/JUNGDRACHE_BALANCING.md).

Waffenschaden seit 30. September 2026: Aktion/Reaktion verwenden die echte Waffenbasis; leichte Bonusangriffe höchstens W4 je Waffenwürfel, halbe positive feste Schadensmodifikatoren und keinen Ausbildungswürfel. Weitere reguläre Punkte, Besondere Aktionen und Aura-Fokus kaufen zusätzliche Waffenwürfel gemäß `modules/combat-styles/weapon-technique-budget.js`. Zweiwaffenausbildung wird aus erlernten Techniken ermittelt: gemeinsame Angriffe verwenden beide Waffenwürfel, feste Boni einmal; ausdrückliche persönliche Einzelangriffsfolgen bleiben getrennt. Gemeinsame Quelle für beide Hände: `modules/combat/combat-paired-weapons.js`. Details: [Waffen- und Aktionsbalancing](AleriaAlmanach/docs/combat/WEAPON_ACTION_BALANCING.md). Releaseabgleiche dürfen nur Arsenal/Ausbildung und Versionskennung aktualisieren, niemals historische Kampfauswertungen oder Live-Ressourcen überschreiben.

# Rüstungs- und Beitragsbalancing

Balancing vom 3. Oktober 2026: Jungritter-/vergleichbare schwere Startrüstung RK 15 ohne GES, Grundschutz −1 gegen Hieb/Stich/Wucht. Individueller Schutz ersetzt diesen Grundschutz; Gildas bleibt ohne Stichschutz. Mittlere Rüstung RK 14 + GES bis +2 auf Stufe 1–9, +4 auf 10–15, unbegrenzt ab 16; leichte Rüstung voller GES ab Stufe 1. Nur die stärkste positive Kampfform-RK-Haltung zählt. Je Beitrag höchstens eine zufällige Krittrefferfolge pro Angreifer/Ziel und eine Fehlschlagsfolge pro Angreifer. Neu angewandte Hauptaktionssperren sind nicht verlängerbar; nach Ablauf ein eigener Beitrag Handlungssicherheit. Strukturierte martialische Meterwirkungen werden durch einmalige Stellungseffekte ersetzt. Rhiannon einmalig 35 maximale TP ohne Erhöhung aktueller TP; sonst kein pauschaler TP-Buff. Details: [Rüstungs- und Beitragsbalancing](AleriaAlmanach/docs/combat/DEFENSE_BALANCING_2026-10-03.md). Veröffentlichung gleicht nur freigegebene Felder ab, erhält sämtliche Live-Ressourcen und verändert keine bisherigen Würfe.

# Kritische Kampfergebnisse

Krittabellen seit 3. Oktober 2026: jeweils W20 für kritische Waffen-/Techniktreffer und Fehlschläge, kein zusätzlicher Flavorwurf. Erste zehn Einträge erhalten, zehn ergänzt. Neue Konsequenzbelege Version 2, alte W10-Belege unverändert; bestehende Phasenaktivierung bleibt Version 1. Nachschaden tickt einmal am Anfang eines ganzen eigenen Beitrags, auch bei Rede/Interaktion, ohne Rüstung oder temporäre TP. Einmaleffekte nutzen gemeinsame Regelverbrauchsbelege und gelten bei Angriffsfolgen nur einmal. Details: [Kritische Kampfergebnisse](AleriaAlmanach/docs/combat/CRITICAL_CONSEQUENCES.md).

# Play-Chronologie

Der **9. Lichtkehr 1740 (09.03.1740)** ist unveränderlich **Tag 1 des Plays**. Der 10. Lichtkehr ist Tag 2, der 11. Tag 3; frühere Daten werden als **Vergangenheit** bezeichnet. Die Zählung gilt szenenübergreifend und verwendet den Aleria-Kalender mit 36 Tagen pro Monat und 13 Monaten pro Jahr. `AleriaCalendar.playStartDate`, `playDay` und `playDayLabel` sind die gemeinsame Quelle. Aktuelles Weltdatum und Szenenbeginn dürfen den Playbeginn nicht verschieben. Gespeicherte relative Szenenuhren und mechanische Erholungsschlüssel dürfen nicht zur Korrektur einer Play-Tagesanzeige umnummeriert werden.

# Freigegebene Veröffentlichung während des Gildas–Gawain-Duells

Ylva Wolfshorn (Skytte 7), Asgeir Wolfshorn/Bleiddorn (Skjaldr 7) und Ylvas Gramnir Freki (4) gehören zur freigegebenen Veröffentlichung. Bestehende Online-IDs erhalten; Release- und Verknüpfungsdetails: [Wolfshorn-Kampfbögen](AleriaAlmanach/docs/combat/WOLFSHORN_COMBAT_SHEETS.md).

Die Aldrimar-Erweiterung umfasst 303 Katalogoptionen (zuvor 111), mindestens zwei zusätzliche Möglichkeiten pro Klasse und Stufe 1–8 sowie weitere Pfadoptionen. Freki erhält sechs aktive Manöver und einmalig 15 % mehr TP: 33 → **38**, aufgerundet. Bei späteren Importen diesen Aufschlag nicht erneut anwenden.

Die zuletzt festgelegten Ausrüstungswerte stehen in der unten verlinkten Übernahme-Liste: Silberschuppe −2 Schaden gegen Hieb/Stich, Gafyr-Plattenrüstung −2 gegen alles außer Stich; beide ohne zusätzlichen RK-Bonus. Drachenzahn +1 Schaden und +2 bei kritischem Treffer (nicht nochmals verdoppelt); Pflichtschwur +1 Angriff/+1 Schaden ohne kritischen Zusatzeffekt. Frühere Vorschläge wie Schuppenpolster oder Wachtstellung sind ersetzt.

Am 22. September 2026 hat der Nutzer die vorherige Veröffentlichungssperre ausdrücklich aufgehoben: **sämtliche Änderungen auf master pushen, veröffentlichen und online einsatzbereit machen.** Der bisherige Gildas–Gawain-Kampfverlauf einschließlich aller Würfe und Effekte muss unverändert bleiben; kommende Handlungen verwenden die neuen Regeln. Bestehende Beiträge niemals neu auswerten oder überschreiben. Die administrative `combat-rules-release`-Grenze aktiviert kritische Nebeneffekte für kommende Handlungen, gleicht Inventarsnapshots ab und darf weder Aktionsressourcen auffüllen noch Zustandsdauern fortschreiben. Automatische Rücknahmen über diese Grenze sind gesperrt, damit alte Ausrüstungsdaten nicht wiederhergestellt werden. Live-TP, Ressourcen, Zustände, Besitz und Online-IDs erhalten. Details: [Ausrüstungsübernahme](AleriaAlmanach/docs/inventory/PENDING_DUEL_EQUIPMENT_RELEASE.md).
