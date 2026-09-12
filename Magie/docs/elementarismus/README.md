# Elementarismus: Regelabgleich und gemeinsame Daten

> **Historische Fassung 1.** Diese Dokumentation beschreibt die frühere Umsetzung. Die aktuelle Liste gehört zur gelehrten Schule **Elemente**, umfasst 120 Zauber und verwendet neue Balancewerte. Siehe [Elemente – Fassung 2](../elemente/README.md). Die hier dokumentierten alten Werte bleiben nur für bereits gelernte Fassung-1-Zauber gültig; ein druidisches Verzeichnis folgt später.

> **Globale Manakorrektur vom 12. September 2026:** Auch Fassung 1 verwendet inzwischen die um 15 % erhöhte, aufgerundete Staffel: Grad 0–10 kosten 2, 3, 4, 6, 7, 9, 11, 12, 13, 15, 18 Mana. Die Zahlen im ursprünglichen Prüfprotokoll unten dokumentieren den damaligen Stand. Wirkungen und Aktionspakete bleiben fassungsgebunden.

Grundlage sind die 72 Zauber aus dem vom Nutzer bereitgestellten **Aleria_Elementarismus_Zauberkompendium_v1_1.pdf**, Arbeitsfassung vom 12. September 2026. Der Text des Dokuments wurde als Regelvorschlag behandelt. Seine externen Inspirationsquellen wurden nicht als neue Aleria-Regeln übernommen. Die extrahierten Originaleinträge mit Seitenzahlen stehen in `source-spells-v1_1.json`; die Entscheidung je Zauber steht in `RULE_REVIEW.md`.

## Bewusste Anpassungen

- **Mana:** Die bestehende gemeinsame Staffel gilt. Grade 0–9 kosten 1, 2, 3, 5, 6, 7, 9, 10, 11 und 13 Mana. Der PDF-Vorschlag 1, 3, 6, 10, 15, 21, 28, 36, 45 und 55 wird nicht zum globalen Regelwechsel. Freigeschaltete Grade werden nicht verbraucht.
- **Aktionen:** Kosten wurden nach Wirkung und Rolle einzeln gewählt. Es gibt keine alleinige Besondere Aktion als Ersatz für einen starken Angriffszauber und keine Pakete mit zwei Besonderen Aktionen. Diese Ressource bleibt dauerhaft und wird nicht mit jedem Beitrag aufgefüllt. Die vorhandene gemeinsame Bezahlung, Reservierung, Aura-Alternative und serverseitige Prüfung bleiben verantwortlich.
- **Höhere Grade:** 120 ausdrücklich ausgearbeitete Formen. Nicht aufgeführte Grade ergeben keine zusätzliche Verstärkung. Bei PDF-Alternativen wurde ein fester Pfad gewählt, etwa Schaden statt zusätzlicher Wandlänge oder Zielzahl statt längerer Dauer. Dadurch kann ein gewählter Wirkungsgrad seine Kosten und Würfel eindeutig bestimmen. Geänderte Reichweiten und Dauern stehen auch im Kampf bei der gewählten Form.
- **Nässe:** Benetzen bleibt möglich, aber die vorgeschlagenen zusätzlichen bzw. abgezogenen Schadenswürfel werden nicht zu einer neuen globalen Wechselwirkung.
- **Wiederholungen:** Schmiedeglut, Strömungsgriff, Flammenkrone und Blitzruf verlangen für eine weitere Auslösung ein vollständiges neues Wirken. Ihre verbilligten Folgeauslösungen entfallen. Es gibt keine verdeckten Unterhaltsabbuchungen. Konzentrationszauber verwenden die genannte Höchstdauer ohne zusätzliche Mana-Erhaltungskosten.
- **Rituale:** Ein vollständiger, einmaliger Kostenblock beim Abschluss nach der angegebenen Mindestzeit. Die im PDF gestaffelten mehrfachen Ausgaben Besonderer Aktionen wurden nicht übernommen. Die Ritualzeit und Umweltvoraussetzungen bestätigt die Spielleitung. Ein Ritualabschluss im Kampfeditor überspringt nicht die erzählerisch nötige Vorbereitung.
- **Angekündigte Kampfzauber:** Großer Brandkreis, Erdbeben und Magmabett nutzen die vorhandene Kanalisierung über zwei verschiedene eigene Gesamtbeiträge. Vorbereitung verursacht keinen Schaden und kostet nach bestehender Laufzeitlogik nichts; die Entladung verbraucht den vollständigen Block. Abbruch, Ressourcenprüfung und Rücknahme bleiben im bestehenden Kampfsystem.
- **Schutz und Strukturen:** Schutzwürfe reduzieren einen bestimmten eingehenden Treffer nach Absprache; sie sind weder Heilung noch temporäre Trefferpunkte. Frostsprengung würfelt ausschließlich Strukturschaden. Der neue erzählerische Effekt protokolliert diese Würfe und Kosten, ohne sie irrtümlich von Kreaturen-TP abzuziehen.

## Automatisierung und Spielleitung

Direkte Angriffe, Rettungen, typisierter Schaden, höhere Schadensgrade, Mana und Aktionspakete laufen durch die vorhandene Kampfauflösung. Flächen verwenden die vorhandene Mehrzielauflösung: Ziele einzeln auswählen, Kosten einmal bezahlen. Das System bestimmt weder Positionen noch Wirkungslinien automatisch. Fehlende Zaubersymbole bleiben leer; 42 passende BG-Icons sind zugeordnet. Aktionssymbole stammen aus dem gemeinsamen Register der Charakterbögen, Würfel und Mana aus dem BG-Bestand; mangels BG-Reichweitensymbol wird das vorhandene Reichweitensymbol verwendet.

Gelände, Materialmengen, Wetter, Wallsegmente, Restvorräte von Steinhaut, Reaktionszeitpunkte, weitere Zonenkontakte, Befreiungsversuche und die genannten zusätzlichen Zustände werden mit der Spielleitung aufgelöst. Die Karte und die Sprechblasen nennen dies ausdrücklich. Konzentrationsabbruch wird bereits verfolgt; die Höchstdauer in **Beiträgen des Zaubernden** wird gemeinsam nachgehalten, weil das vorhandene Zustandsmodell Beiträge des Zustandsträgers zählt. Es wird keine falsche automatische Dauer vorgetäuscht.

**Sturm der vereinten Kräfte** bleibt eine mehrteilige, gemeinsam aufgelöste Wirkung. Der Beginn bezahlt einmal Aktion + Besondere Aktion + Reaktion und Grad-Mana. Jeder spätere Puls verlangt eine gesondert verbuchte Aktion und fortbestehende Konzentration; keine zusätzlichen Mana- oder Besonderen-Aktionskosten. Im automatischen Ergebnis des Beginns entsteht kein Kreaturenschaden. Die drei Pulse werden mit ihren angegebenen Würfeln separat aufgelöst. **Tragender Aufwind** verlangt für eine spätere Höhenänderung ebenfalls eine gesondert verbuchte Aktion. Diese Vorgänge sind keine automatisch angebotenen Folgehandlungen.

## Verantwortung und Datenfluss

1. `AleriaAlmanach/modules/spell-catalog/elementarismus-v1.js` enthält die ausgearbeiteten, versionierten Regeln. Keine Laufzeit-Auswertung des PDFs und kein Import fremder Regeln.
2. `spell-catalog.js` liefert vollständige Charakterzauber und die Form des gewählten Wirkungsgrades. Die Manafunktion und Aktionspakete werden aus den bestehenden Kampfmodulen wiederverwendet.
3. `spell-catalog-archive.js` ergänzt diese Einträge im Charakterbogen-Archiv. Die Website wird aus demselben Katalog gerendert. Ein Link führt gezielt zur entsprechenden Archivvorlage; das Hinzufügen zu einem konkreten Charakter erfolgt über dessen bestehenden Archivpicker.
4. Ein gelernter Zauber besitzt seine eigene Profil-ID **und** `catalogReference: { id, revision }`. Profilnormalisierung, JSON-Speicherung, Charakterlisten, Editor, Kampf, Vorschau und serverseitige Auflösung erhalten diese Referenz. Die Serverkopie entsteht durch das bestehende Importgraph-Synchronisationsskript.
5. Alte Zauber werden nicht anhand ihres Namens migriert. Insbesondere können Feuerball aus dem Feuerarsenal und Feuerball aus dem Elementarismus nebeneinander existieren. Rhiannons 23 bestehende Zauber behalten ihre IDs, Pakete und profilgebundenen INT-Boni.
6. Beim Bearbeiten einer Katalogvorlage entsteht eine eigene Fassung mit `catalogOrigin`. Die ursprüngliche Referenz und ihre automatischen höheren Formen werden abgelöst. Der Hinweis steht vor dem Speichern im Editor. Andere Charaktere und die gemeinsame Vorlage werden nicht geändert.
7. Archivschlüssel unterscheiden Katalogfassungen, eigene Ableitungen und bisherige Namenseinträge. Auch die Bildzuordnung unterscheidet diese Varianten.

Eine veröffentlichte Katalogrevision ist unveränderlich. Für spätere Regeländerungen eine neue Revision hinzufügen und die alte weiterhin auflösen können; keine automatische Massenmigration gelernter Zauber. Bislang unbekannte Revisionen bleiben als gespeicherte Lesefassung erhalten, werden im Kampf aber nicht als bekannte Regeln ausgeführt. Weitere Magierichtungen können das Datenformat, die Archivschnittstelle und die Darstellung wiederverwenden.

## Prüfung

Die Mini-Tests verwenden feste Würfelergebnisse, damit Schaden und Kosten nachvollziehbar geprüft werden:

| Fall | Erwartetes Ergebnis |
| --- | --- |
| Feuerball auf Grad 5 | 10W6 Feuer, 7 Mana, eine Aktion und eine Besondere Aktion; jede fehlende Teilressource verhindert das Wirken |
| Hagelsturm auf Grad 5 | 5W6 Wucht + 4W6 Kälte, Vorschau durchschnittlich 31,5 vor Abwehr; bei Testwürfen von je 11 und erfolgreicher Rettung je 5 Schaden, Kälteresistenz reduziert den zweiten Anteil weiter auf 2 |
| Herdhauch | Kosten werden bezahlt; keine TP-Änderung und kein Schadenswert in der Vorschau |
| Feuerdämpfung | Schutzwurf wird protokolliert; keine direkte TP-Änderung des Ziels |
| Frostsprengung | Strukturwurf wird protokolliert; kein Kreaturenschaden |
| Großer Brandkreis | Erster Beitrag nur Vorbereitung, derselbe Beitrag kann nicht erneut fortschreiten; nächster Beitrag verursacht Schaden und bezahlt einmal |
| Archiv / Charakter / Server | Referenz überlebt Hinzufügen und JSON-Rundlauf; alte gleichnamige Fassung bleibt getrennt; manipulierte Werte einer bekannten Referenz ersetzen nicht die Katalogkosten |

Automatische Prüfungen stehen in `AleriaAlmanach/tests/spell-catalog.test.mjs`, `Magie/tests/spell-list.test.mjs` und `firebase/functions/tests/spell-catalog.test.js`. Die Browserprüfung umfasst Suche, Gradfilter, Tastatur, höhere Formen, Direktlinks, Druckansicht, alle Bilder und Breiten von 320 bis 1440 Pixeln. Die Kampfbalance einer langen Spielsitzung ist durch diese Funktionsprüfungen nicht abschließend bewertet.

Build und Prüfung: `npm run build:magic`, `npm run check:magic`, `npm run test:magic` im Almanach; `npm test` und `npm run sync:mechanics` in den Firebase Functions. Website und Functions müssen für den produktiven Einsatz denselben Stand verwenden.
