# Rhiannons Zauberschaden und Vorschau

Stand: 11. September 2026. Rhiannons sieben ausgearbeitete Schadenszauber addieren den aktuellen INT-Modifikator einmal pro Schadenswurf. Bei INT 20 ist das +5. Die vorhandenen Grundwürfel und Hochwirkungsregeln bleiben bestehen.

| Zauber | Grundgrad | Schaden mit INT +5 | Durchschnitt vor Abwehr |
| --- | --- | --- | ---: |
| Magisches Geschoss | I | 1W4 +6 | 8,5 |
| Windklinge | I | 1W8 +5 | 9,5 |
| Druckstoß | I | 1W6 +5 | 8,5 |
| Sichelwind | II | 2W6 +5 | 12 |
| Berstende Böe | II | 2W4 +5 | 10 |
| Hundert Klingen Sturm | III | 3W4 +5 | 12,5 |
| Blitzfunken | III | 3W6 +5 | 15,5 |

Magisches Geschoss enthält bereits einen festen +1-Bonus. Zusammen mit INT +5 ergeben sich +6. Auf Grad II lautet der Wurf 2W4 +6 (Ø 11), auf Grad III 3W4 +6 (Ø 13,5). Die anderen Schadenszauber haben bisher keine ausgearbeitete Schadenssteigerung beim Hochwirken. Flächenschaden gilt pro Ziel; eine bestandene Rettung halbiert gegebenenfalls das gesamte Ergebnis einschließlich INT-Bonus und rundet ab. Kritische Treffer verdoppeln nur die Würfel.

Die Zauberleiste zeigt die vollständige Schadensnotation, den angewendeten Schadensmodifikator und den Durchschnitt gemeinsam an. Strukturierte Schadenseffekte sind die Quelle; eine leere oder nur teilweise hochgewirkte alte `rollFormula` verdeckt die tatsächlichen Würfel nicht mehr. Heilung und Schutzwirkungen erzeugen keinen Schadenswert.

Der Attributbezug verwendet das bestehende Effektfeld `bonusAttribute`. `getCombatEffectAttributeModifier` löst es aus dem aktuellen Profil auf, sodass Attributänderungen und manuelle Modifikatoren berücksichtigt werden. Die gemeinsame Kampfauswertung wendet es jetzt auch auf den ersten Schadenseffekt an. `class-damage-revisions.js` ergänzt INT bei älteren Kopien der sieben bekannten Zauber und bewahrt ausdrücklich andere hinterlegte Bonusattribute. Charakterexport, Datenbank, Zauberbibliothek und generierte Servermodule sind synchronisiert.

`combat-spell-damage-preview.test.mjs` prüft alle freigeschalteten Grade, tatsächlich angeforderte Würfel, aktive Boni, Attributänderungen, Rettungen und Krits. `firebase/functions/tests/combat-resolution-integrity.test.js` prüft die serverseitige Neuberechnung aus alten Profildaten und Einzelwürfeln, einschließlich der Ablehnung gefälschter Client-Summen durch Neuberechnung.
