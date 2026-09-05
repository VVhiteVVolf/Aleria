# Lokale Gruppenkampfprüfung · 6. September 2026

**12 vollständige Gruppenkämpfe und 21 gezielte Integrationstests bestanden.** Zusätzlich bestanden 496 Frontend-, 89 Server- und 21 Klassentests: zusammen 639 Tests. Der lokale Produktionsbuild, Klassen-/Katalogabgleich und der Abgleich der 226 Archivfiguren sind erfolgreich.

Die Kampftests verwenden ausschließlich `demo-aleria-combat-checkup` im Firestore-Emulator unter `127.0.0.1:8180`. Charaktere und Inventare stammen aus den vorhandenen Exporten, Gegner und Tanor aus dem Kreaturenkatalog. Produktive Daten wurden nicht verändert. Die Auflösung läuft durch die tatsächlichen Frontend- und Servermodule und wird in der lokalen Datenbank gespeichert.

## Vollständige Begegnungen

Jede Begegnung wurde mit den reproduzierbaren Würfelfolgen **13, 71 und 2026** durchgespielt. Insgesamt: **58 Runden, 263 gespeicherte Handlungen und 348 Zielauswertungen**. Flächenhandlungen zählen als eine Handlung mit mehreren Zielauswertungen.

| Gruppe gegen Gegner | Runden je Würfelfolge | Siege | Erste Figur ausgeschieden |
| --- | --- | --- | --- |
| Rhiannon (6) + Gawain (5) gegen Gildas (6) + Plünderer (3) | 6 / 4 / 6 | Gafyr / Gafyr / Draig | Runde 3 / 3 / 4 |
| Guinevere (5) + Gawain (5) + Tanor (1) gegen Gildas (6) + Schütze (3) + Plünderer (3) | 4 / 4 / 4 | Gafyr / Draig / Gafyr | Runde 2 / 2 / 2 |
| Fenrir (6) + Freya (5) gegen Raubritter (7) + zwei Plünderer (3) | 8 / 6 / 8 | Gegner / Gegner / Gegner | Runde 5 / 5 / 5 |
| Duncan (20) gegen zwei Raubritter (7) + zwei Schützen (3) | 3 / 2 / 3 | Duncan / Duncan / Duncan | Runde 1 / 1 / 1 |

Im Rhiannon/Gawain-Szenario lag der höchste beobachtete normale Angriffsschaden bei 15, der höchste kritische bei 23. Gawains 39 TP wurden in diesen Durchläufen nicht durch einen einzelnen Angriff vollständig genommen. Das ist eine Beobachtung dieser Würfelfolgen, keine allgemeine Schadensobergrenze.

Bei Fenrir/Freya ist die gewählte Dreiergruppe klar gefährlich; nach Freyas teurem Schrei nimmt ihre Angriffskraft ab. Duncan dominiert die deutlich niedrigstufigeren Gegner. Aus diesen kleinen Stichproben wurden keine zusätzlichen pauschalen TP- oder Schadensänderungen abgeleitet.

## Gefundene und behobene Fehler

- **Veralteter Zauberplatzverbrauch:** Zaubergrade dienen jetzt auch in der Auflösung nur der Freischaltung. Anwendungen bezahlen Mana und ihre Aktionskosten. Ein alter Grad-Zähler mit `current: 0` sperrt einen freigeschalteten Grad nicht mehr.
- **Zu geringe Kosten beim Hochwirken:** Der ausgewählte Grad bestimmt die Manakosten. Rhiannons Magisches Geschoss kostet auf Grad III 5 Mana statt der 2 Mana des Grundgrades. Wiederholte Anwendungen und vollständige Rücknahme wurden gespeichert und geprüft.
- **Ungültige Formeln beim Hochwirken:** Aus beispielsweise `1W4+1` und zwei zusätzlichen W4 wird eine ausführbare Formel `3W4+1`. Die gemeinsame Formelfunktion wird auch für Ausbildungs- und Rage-Zusatzwürfel verwendet.
- **Verbleibende Freigaben nach manuellem Herabstufen:** Höhere kanonische Zaubergrade werden wieder gesperrt. Geprüft wurde insbesondere Stufe 6 → 8 → 6.
- **Abbruch einer begonnenen Flächenhandlung bei Eigenschaden:** Freyas Schrei wird für alle gewählten Ziele ausgewertet, auch wenn der einmalige Eigenschaden sie auf 0 TP bringt. Eine nachfolgende neue Handlung bei 0 TP bleibt auf Client und Server gesperrt. Die Fortsetzung darf nur auf das bereits aufgelöste erste Ziel derselben Handlung verweisen.
- **Widersprüchliche Anzeigen:** Der Charakterbogen zeigt freigeschaltete Grade anstelle verbrauchbarer Zauberplatz-Zähler. Zauberkarten nennen die tatsächlichen Manakosten, und die Kampfkarte zeigt den gewählten Wirkungsgrad.

## Geprüfte Zusammenhänge

- Vorschau und Server ergeben für jedes Ziel denselben Schaden und dieselben verbleibenden TP.
- Nach jeder gespeicherten Handlung stimmen persistente TP, temporäre TP und der aus der Szenenhistorie rekonstruierte Zustand überein. Ressourcen bleiben innerhalb ihrer zulässigen Werte.
- Mehrzielaktionen bezahlen Ressourcen, Munition und eigene Effekte einmal. Ausgewählte Gegner und unbeteiligte Verbündete bleiben getrennt.
- Rhiannons Magierrüstung, Schildladung, abgewehrter normaler Treffer und kritischer Schilddurchbruch funktionieren einschließlich Rücknahme.
- Fenrirs Berserkergang und Doppelhieb stimmen zwischen Würfelbelegen, Vorschau und Server überein; der Folgeangriff erhält keinen zweiten vollständigen Schadensbonus.
- Aura bezahlt ab Stufe 8 das vollständige Kostenpaket; reguläre Ressourcen bleiben für eine weitere bezahlbare Handlung erhalten.
- Zwei Instanzen derselben Kreatur besitzen getrennte Szenen-TP. Ihre gemeinsame Kreaturvorlage wird nicht beschädigt.
- Neue Handlungen ausgeschiedener Figuren werden abgewiesen. Rücknahmen stellen TP, temporäre TP und Ressourcen wieder her. Die bestehenden Konkurrenz-, EP- und Begegnungsabschlussprüfungen bestehen weiterhin.

Im lokalen Testbrowser wurden Gradwahl, dynamische Manakosten, gesperrte Grade und die Anzeige auf Desktop und bei 390 Pixeln Breite geprüft. Es traten keine JavaScript-Fehler auf. Die isolierten Komponentenansichten liegen unter [artifacts](artifacts/); sie sind keine vollständigen Screenshots der angemeldeten Anwendung.

## Aussagegrenzen und Wiederholung

Die automatische Strategie verwendet feste Prioritäten für Schutz/Berserkergang/Schrei und wählt danach bezahlbare Angriffe nach ihrem erwarteten Schaden. Ziele und Entfernungen werden vom Szenario vorgegeben; Bewegung, Deckung und freie Spielertaktik werden nicht simuliert. Pro Zug werden unterschiedliche Attacken bevorzugt. Aura wird in einem eigenen Integrationstest geprüft. Deshalb sind die Ergebnisse technische Regressionen mit einer ersten Balanceprobe, keine statistisch belastbaren Siegquoten oder Prüfung jeder möglichen Angriffskombination.

Authentifizierung, produktive Firebase-Regeln und die vollständige angemeldete Kommentieroberfläche gehören nicht zu diesem Emulatorlauf. Die Tests erhalten ausdrücklich lokale Spieleridentitäten.

Die [Startanleitung](README.md) beschreibt die Wiederholung. Die vollständigen aufgezeichneten Handlungen stehen in [combat-party-results.json](combat-party-results.json).
