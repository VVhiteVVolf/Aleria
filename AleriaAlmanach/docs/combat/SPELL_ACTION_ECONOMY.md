# Aktionsökonomie für Zauber

Verbindliche Gestaltungsgrundlage vom 11. September 2026: das [Kostenschema in AGENTS.md](../../../AGENTS.md). Wirkungsgrad und Mana allein beschreiben den Aufwand eines Zaubers nicht; das Aktionspaket bildet seine Rolle und Stärke ab.

## Rhiannon Draig

Jede genannte Aktionsressource kostet einen Punkt. Mana kommt entsprechend dem gewählten Wirkungsgrad hinzu. Besondere Aktionen bleiben eine begrenzte, dauerhafte Ressource; Aktion, Reaktion und Bonusaktion werden nach den gemeinsamen Kommentarregeln erneuert.

| Zauber | Aktionskosten | Begründung |
| --- | --- | --- |
| Magierhand | Aktion + Bonusaktion | Gezielte kleine Interaktion auf Distanz |
| Licht | Bonusaktion | Einfacher, schneller Nutzzauber |
| Taschenspielerei | Bonusaktion | Kleine unmittelbare Veränderungen |
| Telepathische Botschaft | Bonusaktion | Kurze lautlose Mitteilung |
| Kleine Illusion | Aktion + Bonusaktion | Kurze, gezielt gesetzte Täuschung |
| Magierrüstung | Aktion + Reaktion | Vorbereiteter Schutz mit temporären Trefferpunkten |
| Schild | Reaktion | Unmittelbare Abwehr des nächsten Treffers |
| Magisches Geschoss | Aktion + Bonusaktion | Geringer Grundschaden mit sicherem Treffer |
| Federfall | Reaktion | Schutz als Antwort auf einen Sturz |
| Identifizieren | Aktion | Aktive Untersuchung eines Gegenstands oder Zaubers |
| Magie entdecken | Aktion | Aktives Aufspüren magischer Präsenz |
| Windklinge | Aktion | Regulärer gezielter Schadenszauber |
| Druckstoß | Reaktion + Bonusaktion | Kurzer defensiver Gegenstoß mit respektablem Schaden |
| Nebelschritt | Bonusaktion | Fast augenblicklicher Positionswechsel |
| Spiegelbilder | Aktion + Reaktion | Vorbereiteter Schutz durch mehrere Abwehrladungen |
| Person festhalten | Aktion + Besondere Aktion | Starker Kontrollzauber mit Konzentration |
| Gedanken wahrnehmen | Aktion | Aktives Lesen oberflächlicher Gedanken |
| Sichelwind | Aktion + Reaktion | Verstärkter einzelner Treffer mit mittlerem Schaden |
| Berstende Böe | Aktion + Reaktion + Bonusaktion | Kraftvoller Flächenzauber aus regulären Ressourcen |
| Gegenzauber | Reaktion + Bonusaktion | Aufwendigere reaktive Antwort auf fremde Magie |
| Magie bannen | Aktion + Reaktion | Gezieltes Auflösen einer bestehenden magischen Wirkung |
| Hundert Klingen Sturm | Aktion + Besondere Aktion + Reaktion | Einziger seltener Spitzenzauber: breiter Klingensturm |
| Blitzfunken | Aktion + Besondere Aktion | Stärkster unmittelbarer Einzelzielschaden |

Diese Änderung betrifft die Aktionskosten. Die zuletzt festgelegten [Schadenswürfel und INT-Boni](RHIANNON_SPELL_DAMAGE_2026-09-11.md), Wirkungsgrade, Manakosten und bestehenden Effekte bleiben ihre Berechnungsgrundlage. Beschreibende Zauber bleiben freitextbasiert; aus einer Kostenänderung entstehen keine neuen automatisierten Effekte oder Reaktionsfenster.

`modules/classes/magier/rhiannon-spell-economy.js` ist die gemeinsame Quelle der Pakete. Der vorhandene Profilabgleich übernimmt sie für ältere gespeicherte Kopien. Zusätzliche Kosten, etwa Mana oder separate Nutzungsgrenzen, bleiben erhalten. Charakterexport, Archivdatenbank, Bibliothek und generierte Servermechanik müssen nach Änderungen synchronisiert werden.
