# Geplante Klassenentwicklung: Level 1–20

Status: **Planung, keine implementierte Klassenprogression.** Die Universalklassenseiten enthalten ausschließlich die gelieferten Hintergrundtexte und beschreibenden Fähigkeiten. Es gibt keine Levelauswahl, erfundenen Freischaltungen oder automatischen Änderungen am Charakterbogen.

Dieser Plan gilt weiterhin für die **Universalklassen**. Für Cenyr besteht ein gesonderter erster Ausbildungsplan mit der vorhandenen Drachentanz-Mechanik: [CENYR_CLASS_PROGRESSION.md](CENYR_CLASS_PROGRESSION.md).

## Trennung der Verantwortung

1. **Hintergrund und Erscheinungsbild:** `Basisklassen/<id>/klasse.json` mit eigener Darstellung über `modules/pages/`. Diese Daten bleiben unabhängig von Spielwerten lesbar.
2. **Künftige Klassenregeln:** pro Klasse eine separate, versionierte Regeldatei im jeweiligen Klassenordner. Der konkrete Aufbau wird nach Besprechung der ersten Klasse festgelegt, damit nicht traditionelle Klassen hineinpassen.
3. **Anwendung im Kampfsystem:** ein gezielter Adapter bei den vorhandenen Klassen- und Stufenaufstiegsmodulen. Keine Mechanikauswertung aus Seiten-HTML, kein Firebase-Zugriff aus der Klassenansicht und keine zweite Fortschrittsberechnung im Register.

## Vor jeder Klasse gemeinsam festlegen

- Grundkonzept, Rolle und eventuelle Kombinationen mit anderen Klassen.
- Startausstattung, Voraussetzungen und grundlegende Fähigkeiten.
- Welche Merkmale auf welchen Stufen von 1 bis 20 hinzukommen.
- Ressourcen, Kosten, Erholung und Wechselwirkungen mit der Aktionsökonomie.
- Aktive Fähigkeiten, passive Merkmale, Zauber und wählbare Spezialisierungen.
- Verhalten beim Stufenaufstieg, Rücksetzen und bei bestehenden Charakteren.

Keine D&D-Progression wird allein aus einem bekannten Klassennamen abgeleitet. Die Texte beschreiben bisher den Hintergrund; sie sind keine ausführbaren Regeln.

## Bestehende Zuständigkeiten wiederverwenden

- `AleriaAlmanach/modules/combat/character-creation-templates.js`: vorhandene Startvorlagen.
- `combat-level-up-model.js`: Stufenaufstieg und Vorschau für Charaktere.
- `combat-progression.js`: Erfahrungsschwellen.
- `combat-resource-progression.js`: gemeinsame Ressourcenentwicklung.
- `combat-profile-model.js`: validiertes Kampfprofil.

Das Kampfsystem kennt neben den gewöhnlichen Stufen auch Sonderstufen 21–30. Diese werden von dieser Planung nicht verändert und gehören nicht zum Umfang der ersten Klassenbögen.

## Namen und Kennungen

| Klassenname | Seitenkennung | Bestehende Regelkennung |
| --- | --- | --- |
| Kämpfer / Krieger | `kampfer` | noch kein eigenes universelles Regelpaket |
| Magier | `magier` | `magier` |
| Asket | `asket` | `asket` |
| Paktträger | `pakttrager` | `hexer` |
| Kleriker | `kleriker` | `kleriker` |
| Eidgeschworener | `eidgeschworener` | noch kein eigenes universelles Regelpaket |

Alte Namen wie Mönch, Hexenmeister, Hexer und Paladin bleiben Navigations- bzw. Archiv-Aliase. Bestehende gespeicherte Kampfprofil-IDs werden durch die Umbenennung nicht migriert. Bei der späteren Regelanbindung ist ein ausdrückliches Mapping erforderlich.
