# Neue Waffen-, Rüstungs- und Schildstandards – 1. November 2026

Diese Änderung erzeugt neue Katalogversionen für künftige Käufe und bewusst angelegte Varianten. Sie migriert keine vorhandenen Inventare, persönlichen Waffen, Live-Ressourcen oder Kampfbelege. Veröffentlichte alte Regelversionen bleiben im Itemversionsarchiv auflösbar.

## Waffen

| Vorlage | Neue Regeln | Handhabung |
| --- | --- | --- |
| Streitaxt | 1W12 Hieb | Zweihändig, `greataxe`, kein Schild |
| Bisheriges Standard-Ritterschwert → Großschwert | 1W12 Hieb | Zweihändig, `greatsword`, kein Schild |
| Flegel | 3W4 Wucht | Einhändig, `flail` |

Persönliche Jungritter-/Haus-Ritterschwerter behalten ihre eigenen 1W8 und gegebenenfalls vielseitigen 1W10. Es gibt keinen Namenabgleich, der aus einem persönlichen „Ritterschwert“ automatisch ein Großschwert macht. Der ausdrücklich geprüfte bisherige Standardverweis `standard:waffen-rustungen:ritterschwert@5ae37b84286373b6d4569563` bleibt bei 1W8/1W10.

Die bestehenden Waffenwürfel-, Zusatzwürfel-, Bonusangriffs- und Kritregeln bleiben gleich. Auch beim Flegel zählt ein Krit nach der gemeinsamen Regel: maximaler Grundpool plus ein gewürfelter gleicher Pool, feste Boni einmal.

## Körperrüstungen

| Standardvorlage | Basis-RK | Geschicklichkeit |
| --- | --- | --- |
| Stoff, Fell/Pelz, Leder | 11 | Voll |
| Verstärkte Lederrüstung, Gambeson | 12 | Voll |
| Ringpanzer | 12 | Mittlere Rüstungsgrenzen |
| Kettenrüstung, Stahlkürass | 13 | Mittlere Rüstungsgrenzen |
| Schuppenpanzer, Brigantine, Lamellenpanzer | 14 | Mittlere Rüstungsgrenzen |
| Bisherige Ritter-Plattenrüstung → Plattenrüstung | 15 | Kein GES; Jungritterstandard |
| Bisherige Turnierrüstung → Ritterrüstung | 18 | Kein GES; bessere Feldrüstung |

Mittlere Rüstungen behalten die gemeinsame Staffel: GES bis +2 auf Stufe 1–9, bis +4 auf Stufe 10–15 und voller GES ab Stufe 16. Die Abstufung betrifft den Basiswert, nicht die bestehende Ausbildung. Stoff-/Fell-/Lederrüstung gleicher Stufe bieten unterschiedliche Materialien, Preise und erzählerische Eigenschaften; es werden keine bloßen Flavortexte als automatische Schadensresistenzen ausgegeben.

Die neue Plattenrüstung hat den vorhandenen Grundschutz −1 gegen Hieb/Stich/Wucht. Individueller Schutz ersetzt ihn wie bisher. Die bestehende Haus-Rangstaffel und persönliche Sonderrüstungen werden nicht pauschal neu bewertet.

### Explizite Regelversion statt nachträglicher Umdeutung

Neue allgemeine Körper- und Schildstandards erhalten `combatDefinition.armorRuleVersion: 2`. Nur diese neue Version behält ausdrücklich festgelegte Basiswerte und aktiviert die neuen strukturierten Ausrüstungswirkungen. Ohne diese Kennung bleibt der bisherige Abgleich erhalten, insbesondere die alte mittlere Basis-RK 14. So ändern sich alte persönliche Daten und gepinnte Definitionen beim Öffnen eines Bogens nicht unbemerkt.

Eine ausdrücklich gespeicherte neue Rüstungsdefinition aus dem Item Builder verwendet ebenfalls Version 2. Bearbeitete Basiswerte werden dadurch tatsächlich angewendet. Die alte Definition und ihr Besitz werden dabei nicht ersetzt.

## Schilde

| Tatsächlich vorhandener Typ | RK-Bonus | Bewegung | Initiative | Nach Startaufstellung anlegen/aufstellen |
| --- | --- | --- | --- | --- |
| Buckler | +1 nur gegen Nahkampf; gegen Fernkampf/Wurfwaffen +0 | Kein Malus | Kein Malus | 1 Bonusaktion |
| Rundschild | +2 | Kein Malus | Kein Malus | 1 Bonusaktion |
| Kite-Schild | +3 | Kein Malus | Kein Malus | 1 Bonusaktion |
| Turmschild | +4 | −1 m | −1 | 1 Bonusaktion |
| Pavese | +5 | −3 m | −2 | 1 Aktion + 1 Bonusaktion |

Die Startaufstellung bleibt wie bisher kostenlos. Ein Wechsel ohne tatsächliche Änderung kostet nichts. Ablegen oder gewöhnlicher Waffenwechsel kostet weiter eine Bonusaktion. Beim gleichzeitigen Aufstellen einer Pavese und Umgreifen der Waffe wird derselbe vorbereitende Wechsel einmal bezahlt; es gibt keine doppelte Bonusaktionsrechnung.

RK und Nachteile wirken nur beim tatsächlich gewählten, geführten Schild. Ein Schild im Inventar, ein abgelegter Schild oder ein wegen Zweihandwaffe/Zweiwaffenführung blockierter Schild verändert keine Kampfwerte. Mehrere neue Schilde stapeln ihre Boni und Lasten nicht. Persönliche beziehungsweise alte Schildversionen erhalten die neuen Nachteile nicht nachträglich.

Der kleine Buckler erhält seinen Nachteil über begrenzte Deckung statt künstlicher Bewegungslast. Sein neuer Kopf hat keinen pauschalen RK-Bonus: Der bestehende Vorwurf-Trigger gibt +1 RK ausschließlich bei tatsächlichen Nahkampf-Waffenangriffen und Nahkampftechniken. Geworfene Waffen, Fernkampftechniken und Schüsse erhalten diesen Bonus nicht. Der optionale strukturierte `attackRange`-Filter verändert bestehende Trigger ohne Reichweitenfilter nicht. Wiederholte geerbte Angriffe behalten die Reichweite ihrer Technik, ausdrückliche Handwechsel und vorbereitete Konter verwenden die tatsächlich geführte Waffe. Register, Schildauswahl und Rüstungsbogen zeigen „Nahkampf +1 RK“. Die alte Bucklerrevision `81bf3a55e2cb1262666adc73` behält ihren bisherigen pauschalen Bonus.

`equipment-preparation-costs.js` ist die gemeinsame Quelle für Kostenvalidierung und Beschriftung. Itemregister, Kampfauswahl, Ressourcenreservierung, gespeicherter Ergebnisbeleg und nach dem zentralen Mechanics-Abgleich auch der Server verwenden dieselben Kosten. Der Item Builder bietet die Aufstellkosten bei Schilden als bearbeitbaren erweiterten Parameter an.

### Dabei behobener Anschlussfehler

„Abwarten / Zug aussetzen“ verwendete `activationType: free`, während die vorhandene Kostenökonomie den kostenfreien Typ `passive` kennt. Dadurch wurde fälschlich eine Aktion verlangt. Nach dem bezahlten Aufstellen der Pavese hätte eine Figur ihren Beitrag deshalb nicht regulär abschließen können. Die Wait-Deklaration verwendet jetzt den bereits unterstützten kostenfreien Typ. Frühere Beiträge werden nicht neu ausgewertet.

## Identitäten, Namen und Quellen

Die Markt-/Standard-IDs `ritterschwert`, `ritterplatte` und `turnierruestung` bleiben stabil. Aktuelle Anzeigenamen und neue Regeln liegen in den neuen Köpfen. Der Kataloggenerator erhält frühere Lookup-Aliase und archiviert die vorherigen Revisionen.

Ein `definitionRef` enthält ID **und** Revision und bleibt damit fest auf seine Regeln gebunden. Ein unversionierter `canonicalKey` ist dagegen ein Verweis auf den aktuellen Katalogkopf. Eine bewusste Übernahme einer neuen Kopfversion bleibt eine explizite Bestandsentscheidung; Namen allein lösen keine Besitzmigration aus.

## Sichere Registertexte

`item-register-text.js` projiziert vorhandene HTML-Beschreibungen in Klartext mit Absätzen, Zeilenumbrüchen und Listen. Die Darstellung escaped diesen Klartext weiterhin. Gespeicherte Quellen bleiben unverändert; fremdes HTML wird nicht mittels einer ungesicherten `innerHTML`-Zuweisung ausgeführt. Waffen-/Rüstungswerte und Ausrüstungskosten erscheinen zusätzlich aus den tatsächlichen strukturierten Regeln.

## Prüfungen und zentraler Abschluss

- 98 gezielte Frontendprüfungen bestanden: neue Standards und Schildleiter, Item-/Inventarprojektion, persönliche Altwaffen, alte gepinnte Revision, Kategorien/GES-Stufen, tatsächlicher Ressourcenverbrauch, Wiederwahl ohne erneute Kosten, Abweisung bei fehlender Aktion, kostenlose Startaufstellung, HTML-Textprojektion und bestehende Verteidigungs-/Krit-/Waffen-Nachbarn.
- Protokoll: `diagnostics/equipment-standards-2026-11-01/frontend-targeted.log`.
- `firebase/functions/tests/integration/equipment-standards.integration.mjs` ist die isolierte echte Speicherprobe: nur `127.0.0.1:8187`, eigenes Projekt `demo-aleria-equipment-standards`, neue Testfiguren mit Zufallskennung. Tatsächlicher Kauf von Pavese und Großschwert neben altem gepinntem Jungritterschwert, bezahltes Aufstellen, Wiederwahl, Zweihandwechsel, Ressourcen-/RK-/Bewegungs-/Initiativgleichheit und unveränderte ältere Belege. Keine Projektlöschung und keine Live-Daten.
- Der Root-Agent hat nach Quellenabschluss den Katalog zentral auf Version `199b06bb0b22443d` gebaut und anschließend den gemeinsamen Mechanics-Abgleich ausgeführt. Dieser Teilauftrag startete keine parallelen Generatoren. Danach bestand die tatsächliche Emulatorprobe vollständig (1/1, `diagnostics/equipment-standards-2026-11-01/emulator.log`); auch die 98 gezielten Frontendprüfungen wurden gegen die neuen generierten Köpfe erneut erfolgreich ausgeführt.
- Nach der ergänzten Nahkampfdeckung des Bucklers wurde zentral Version `d2e935721c83427d` gebaut und der Mechanics-Graph erneut synchronisiert. Die echte Emulatorprobe bestand anschließend 2/2 Fälle (`buckler-emulator.log`): Kauf/Anlegen des neuen Bucklers mit statischer RK0, gleicher Trefferwurf gegen Nahkampf-RK11 beziehungsweise Wurf-RK10, dreifache geworfene Technik ohne irrtümlichen Nahkampfbonus sowie unveränderte frühere Belege. Nach dem Abgleich bestanden auch 94/94 gemeinsame Equipment-, Nachbar- und Gemeinschaftsprüfungen (`final-equipment-community.log`).
