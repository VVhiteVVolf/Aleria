# Waffenführung und Angriffsvorschau · 6. September 2026

## Verhalten

- Eine Figur kann rechts und links eine Handwaffe führen. Vorhandene Einträge wie Guineveres „Helwyr Jagddolche (Paar)“ oder Fenrirs Axtpaar werden automatisch als zwei Waffen erkannt. Eine einzelne Waffe darf nicht dupliziert werden. Bögen und eindeutig zweihändige Waffen schließen die zweite Handwaffe aus.
- Das Häkchen gewährt keine Zusatzattacke und verdoppelt keine Würfel. Beide Waffen haben ihre normalen Angriffe und Kosten. Erlernte Doppelklingentechniken benötigen beide Hände; die Waffenformel folgt der rechten Waffe. Für eine Waffenattacke der linken Hand gelten deren eigene Werte.
- Zwei belegte Waffenhände unterdrücken Schildboni. Ein ausdrücklich gesetzter Gesamt-RK-Override bleibt verbindlich. Der vielseitige Zweihandgriff ist mit einer zweiten Handwaffe nicht verfügbar.
- Die Startausrüstung ist für jede Figur im **ersten eigenen Kampfpost kostenlos**, wie vom Nutzer bestätigt. Ab dem zweiten eigenen Kampfpost kostet ein Wechsel **1 Bonusaktion**. Eine neue Kampfankündigung beginnt eine neue Eröffnung; ohne Ankündigung gilt der Szenenverlauf als Grenze.
- Der Wechsel ist eine Vorbereitung innerhalb des Abschnitts: neue Waffen, kompatible Attacken und verfügbare Ressourcen erscheinen sofort. Weitere Abschnitte übernehmen den Zustand. Die endgültige Auswahl eines Abschnitts zählt als ein Wechsel, nicht jeder Klick im Editor. „Wechsel aufheben“ stellt den vorherigen Entwurfszustand wieder her.
- Waffenwechsel und Angriff werden beim Absenden in derselben Servertransaktion validiert. Aura-Zahlung ersetzt die Kosten des Angriffs; ein separat vorgenommener Waffenwechsel bleibt seine eigene Bonusaktion. Mehrere Ziele bezahlen den Wechsel und die Handlung jeweils einmal.
- Die Rücknahme eines Beitrags stellt über den bestehenden Verlauf beide Waffen und Ressourcen wieder her. Ein Entwurf schreibt keine Ressourcenkosten in die Online-Datenbank.

## Trefferchance und Durchschnitt

Die Zielauswahl und jeder ausgewählte Avatar zeigen eine eigene Trefferchance. Die Vorschau zählt alle 20 möglichen W20-Ergebnisse mit ihren exakten Gewichten; Vor- und Nachteil entsprechen Maximum bzw. Minimum aus zwei Würfeln. Natürliche 1/20, erweiterte Kritbereiche, aktive Boni/Mali, Auren und ausgewählte Eingriffe verwenden denselben deterministischen Auswertungscode wie der tatsächliche Angriff. Frequenzschlüssel und Ressourcen bleiben durch die Vorschau unverändert.

„Treffer“ bezeichnet den erfolgreichen Angriffswurf **vor nachgelagerten Schutzwirkungen**, etwa Spiegelbildern. Bei Rettungswürfen bezeichnet „Wirkung“ die Wahrscheinlichkeit des misslungenen Zielwurfs; Rettungswürfe besitzen keine automatische 1/20-Regel. Automatische Effekte werden entsprechend bezeichnet.

„Ø Schaden“ ist der Mittelwert des normalen Haupttreffers einschließlich fester und aktiver eigener Schadensboni. Krits, Folgetreffer, zielabhängige Eingriffe, Resistenzen und Schadensminderung sind ausgenommen. Mischwürfel und die Schadensuntergrenze von null werden berücksichtigt; Heilung erhält keine irreführende Schadensanzeige.

## Guinevere

Ihre drei verfügbaren Helwyr-Slots auf Stufe 5 sind nun verteilt auf:

| Technik | Waffenweg | Form |
| --- | --- | --- |
| Federblick | Langbogen | Jungdrache |
| Waldwacht | Schwert | Jungdrache |
| Schattenpaar | Doppelklinge / Jagddolche | Jungdrache |

Es wurden keine zusätzlichen Waffen angelegt. Die automatische Helwyr-Auswahl belegt zunächst die Hauptwaffe und schließt danach Lücken bei getragenen Schwert- und Doppelwaffen, bevor sie weiter spezialisiert. Bestehende manuelle Auswahlen werden dadurch nicht pauschal ersetzt. Guineveres konkrete Auswahl wurde im Einzelbogen, Datenbank-Snapshot, Register und gemeinsamen Attackenfundus abgeglichen. Der Online-Abgleich änderte ausschließlich ihre Technik-Auswahl und die materialisierten Techniken; sämtliche anderen Felder wurden durch vollständigen Vergleich des zurückgelesenen Datensatzes geprüft.

## Architektur

- `combat-weapon-loadout.js`: zwei Hände, Altbestands-Erkennung, Validierung und Eröffnungsberechtigung.
- `combat-equipment-preparation.js`: Entwurfsvorbereitung, Ressourcenreservierung und Zustandssnapshots.
- `combat-attack-evaluation.js`: aus dem Auswertungsdienst extrahierte deterministische Wurfentscheidung.
- `combat-action-estimates.js`: nebenwirkungsfreie Wahrscheinlichkeiten und Schadensmittelwerte.
- `ui/combat-weapon-loadout-view.js`: Waffenanzeige; Ereignisse bleiben in der bestehenden delegierten Composer-Verwaltung.

`combat.offHandWeaponId` ist optional: fehlend erlaubt die Erkennung eines alten Paareintrags, leer bedeutet ausdrücklich eine freie linke Hand. Historische `before`/`after`-Waffen-IDs bleiben erhalten; neue Snapshots ergänzen `offHandBefore` und `offHandAfter`. Entwürfe transportieren `combatLoadout`, der Server prüft `combatAction.loadout` gegen die tatsächliche Ausrüstung. Die gemeinsame Mechanik wird in die Firebase-Funktionen synchronisiert. Regelauswertung: `combat-evaluation-8`.

## Prüfung

**735 automatisierte Tests bestanden:** 566 Frontendtests, 90 Firebase-Funktionstests, 53 bestehende plus fünf neue Tests gegen den lokalen Firestore-Emulator und 21 Klassentests. Produktionsbuild, Klassen-/Archivabgleich und Prüfung auf Whitespace-Fehler bestanden. Der Build meldet weiterhin die bekannten großen Ausgabedateien.

Die fünf neuen Speichertests prüfen freie Startausrüstung, späteren Kostenabzug, Rücknahme, manipulierte Fremd-/Doppelwaffen, gefälschte Gratisangaben und einmalige Kosten bei mehreren Zielen. Dabei wurde ein bestehender Fehler behoben: Zustände ohne `mechanics` dürfen keinen undefinierten Firestore-Wert erzeugen.

**21 Browserprüfungen** mit der echten Kampfkarte: zwei aktive Slots, Klassenkompatibilität, Wechsel im selben und folgenden Abschnitt, Rücknahme, Ressourcenreservierung, unterschiedliche Ziele, aktive Vor-/Nachteile, deren Aufhebung, Mehrfachauswahl, Desktop und 390-Pixel-Mobilansicht ohne horizontalen Überlauf. Keine JavaScript-Fehler.

Belastungsprobe mit zwei Abschnitten und 100 vollständig ausgearbeiteten Zielprofilen: erstes Laden nach Entfernung doppelter Profilberechnungen etwa **0,91 s statt 3,28 s**, wiederholte Aktualisierung etwa **0,13 s statt 0,25–0,30 s**. Es handelt sich um lokale Messwerte mit synthetischen Zielkopien, keine Garantie für die Ladezeit im Livebetrieb. Die Vorschau verwendet bereits berechnete Zielprofile; Regelquellen werden innerhalb einer Berechnung wiederverwendet.

Alle Testkämpfe liefen ausschließlich im lokalen Demo-Projekt `demo-aleria-combat-checkup` auf `127.0.0.1:8180`. Die Testdaten und temporären Effekte wurden gelöscht, Emulator und Browser-Testserver beendet. Reproduzierbare Tests und ausgewählte Nachweise bleiben im Repository erhalten.
