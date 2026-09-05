# Abschlussprüfung für master · 6. September 2026

**1.999 automatisierte Tests bestanden.** Zusätzlich wurden der Produktionsbuild, das Charakterarchiv, die generierten Klassenseiten, lokale Dateiverweise und die Bedienung der Klassenübersicht im Browser geprüft. Ausgangspunkt war `d551fe9b`; dieser entsprach beim Abruf bereits `origin/master`.

| Prüfbereich | Bestandene Tests |
| --- | ---: |
| Almanach einschließlich Charakterbögen, Inventar, Ressourcen, Kampf und neuem Ausbildungs-Cache-Test | 497 |
| Universal- und Cenyr-Klassen | 21 |
| Firebase-Functions | 89 |
| Lokale Transaktionen, Gruppenkampf-Randfälle und Rücknahmen | 21 |
| Vollständige Gruppenkämpfe mit drei Würfelfolgen je Begegnung | 12 |
| Orte, Karten, Kontinente, Anzeigetafeln und Zeitungen | 92 |
| Familienregister und Bradrhith | 10 |
| Familien, Stammbäume und Migrationen | 1.246 |
| Firestore-Regeln der Almanach-Datenbank | 11 |

## Behobener Fehler im Abschlussreview

Die Signatur des Cenyr-Ausbildungs-Caches verwendete zweimal den Schlüssel `techniques`. Dadurch wurde die Auswahl aus `classTraining.techniqueSelections` in der Signatur überschrieben. Wenn sich die Attackenwahl innerhalb desselben Profilobjekts änderte, konnte die Kampfauswertung die alte materialisierte Ausbildung weiterverwenden.

Die Signatur trennt jetzt `techniqueSelections` und `techniques`. Der neue Regressionstest ändert einen gültigen Attackenslot in Duncans vorhandenem Profil, während die alten materialisierten Attacken zunächst unverändert bleiben. Vor der Korrektur fehlte die neue Attacke im Ergebnis; danach ersetzt sie die vorherige Attacke sofort und die Zahl verdienter Attacken bleibt erhalten. Die Serverkopie der gemeinsamen Regeln und die betroffenen Browser-Cache-Verweise wurden aktualisiert.

Sieben bereits im Ausgangsstand vorhandene Familientests erwarteten widersprüchliche feste Revisionsnummern. Beispielsweise erwarteten zwei Sterkr-Tests Revision 6 beziehungsweise 5, während die ausgelieferte Quelle Revision 4 trägt. Diese Prüfungen vergleichen nun mit der tatsächlichen Quellrevision. Die Migrationstests verlangen zusätzlich eine echte Erhöhung gegenüber der alten Revision und prüfen weiterhin Migrationsnachweis, Personen, Beziehungen und Identitäten. Familieninhalte wurden dafür nicht verändert.

## Zusammenhang und Auslieferung

- 15 Universalklassen und sieben Cenyr-Klassen, der Katalog mit 208 Attacken und die zugehörigen Archivseiten sind synchron.
- Die sechs vorhandenen Cenyr-Charakterbögen, beide Draig-Rittersets, die Zauber-/Attackenbibliothek und alle 226 Archivfiguren bestehen ihre Abgleichprüfungen.
- Der Syntax- und Verweisaudit prüfte 208 geänderte JavaScript-Dateien, 47 JSON-Dateien und 2.013 lokale Verweise. Nach Synchronisierung der Servermodule blieben keine Syntaxwarnungen, doppelten Schlüssel, fehlenden Ziele oder Unterschiede in der Groß-/Kleinschreibung dieser Verweise übrig.
- Im lokalen Browser wurden alle 22 Klassenseiten geöffnet, Suche und Navigation verwendet und 35 Stufenwechsel auf den sieben Cenyr-Seiten durchgeführt. Die Stufenwahl übersteht ein Neuladen; die mobile Ansicht wurde bei 390 Pixeln Breite geprüft. Keine JavaScript-Fehler oder fehlenden lokalen Dateien.
- `npm run build` ist erfolgreich. Die vorhandenen Größenwarnungen für große Almanach-/Würfel-Bundles bleiben bestehen.
- Die Gruppenkämpfe und ihre Aussagegrenzen sind im [Kampfprüfbericht](../../../firebase/functions/tests/integration/COMBAT_PARTY_REPORT.md) beschrieben. Emulatorprüfungen verwenden lokale Testidentitäten und verändern keine produktiven Charakterdaten.

Der Git-Push versioniert auch die geänderten Firebase-Functions. Das produktive Firebase-Deployment ist ein separater Schritt: Die Netlify-Buildkonfiguration führt den Karten-Medienbuild aus und veröffentlicht das Repository, deployt jedoch keine Firebase-Functions. Die lokale Prüfung bestätigt den gemeinsamen Codezustand; sie bestätigt kein bereits erfolgtes Firebase-Deployment.
