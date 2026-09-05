# Drachentanz-Register

Der Drachentanz wird zentral in `drachentanz-registry.js` beschrieben. Die Form-IDs liegen in `drachentanz-ids.js`; die Attacken sind nach Ausbildungsabschnitt in `techniques/` gegliedert. Klassen und Charaktere beziehen diese Daten über `combat-style-registry.js` und kopieren sie nicht.

Die Klassenregeln, Waffenvarianten, Lernbudgets und Pfadzugänge liegen getrennt unter `modules/classes/cenyr/`. Der lesbare Gesamtstand wird beim Klassen-Build als [Cenyr-Attackenkatalog](../../../../Klassenordner/docs/CENYR_ATTACK_CATALOG.md) erzeugt.

## Umfang

| Form oder Pfad | Attacken im Gesamtpool | Ausbildung |
| --- | ---: | --- |
| Tanz des Jungdrachens | 50 | Stufe 1–6 |
| Tanz des Schwertdrachens | 24 | Stufe 7–8 |
| Tanz des abwartenden Drachens | 24 | Stufe 9–20 |
| Tanz des fliegenden Drachens | 24 | Stufe 9–20 |
| Tanz des brüllenden Drachens | 21 | Stufe 9–20; eine Arthwyr-Attacke ab 6 |
| Tanz des ausgeglichenen Drachens | 24 | Stufe 9–20 |
| Tanz des zornigen Drachens | 20 | Stufe 9–20 |
| Tanz des Drachlings | 5 | Milwr, Stufe 6–15 |
| Tanz des trällernden Drachens | 4 | Barddwyr, Stufe 7–8 |
| Tanz des kreischenden Drachens | 12 | Barddwyr, Stufe 9–20 |

Das Register enthält 208 Attacken. Die sechs historischen Jungdrachen-Attacken sind als `confirmed` markiert und bilden die bestätigte Teulu-Schwertfolge. Alle 202 neu geplanten Attacken tragen im Katalog `draft`. Ein Charakter erhält eine Attacke erst durch eine ausdrückliche Slotwahl; danach ist seine gespeicherte Kopie nutzbar und merkt sich den ursprünglichen Katalogstatus als `sourceStatus`.

## Technikmodule

- `foundation-techniques.js` enthält die klasseneigenen Grundfolgen.
- `duelist-techniques.js` enthält die Duellantenfolgen auf Stufe 7–8.
- Die fünf Dateien `abwartender-`, `fliegender-`, `bruellender-`, `ausgeglichener-` und `zorniger-techniques.js` enthalten je zwölf gemeinsame Ritterattacken.
- `uchelwyr-mounted-techniques.js` ergänzt genau zwei Reiteroptionen für jede allgemeine Form und jeden allgemeinen Pfad.
- `helwyr-expert-techniques.js` enthält sechs Fernkampf- oder Klingenoptionen je Expertenpfad.
- `barddwyr-techniques.js` enthält Trällernder Drache, Kreischender Drache und die verkleinerten Schwertpfade.
- `milwr-techniques.js` enthält die fünf Drachling-Attacken.
- `drachentanz-technique-factory.js` normalisiert Kosten, Waffenwürfel, Effekte und Klassenmetadaten.

## Freigabe und Vergabe

`getCombatStyleTechniquesForGrants()` verteilt nur bestätigte Techniken. Ein Grant mit `techniqueUnlockLevels` muss eine Technik zusätzlich ausdrücklich einer Stufe zuordnen. Formzugang, Pfadwahl und ein Entwurf im Katalog reichen daher nicht zur Vergabe.

Für Cenyr-Klassen führt `cenyr-technique-selection.js` die eigentliche Ausbildung aus. Es bindet jede gewählte Attacke an einen verdienten Slot und prüft Formzugang, Pfad, Barddwyr-Waffenweg, Mindeststufe, Slotband und eine vorhandene passende Waffe. Geführter und manueller Stufenaufstieg verwenden dieselbe Logik.

Waffenabhängige Attacken speichern `damageModel.mode: "weapon-dice"`. Die Kampfauflösung berechnet die Formel aus der aktuell geführten Waffe. `cenyrTraining.allowedClassIds` und `classWeaponProfiles` begrenzen Klasse und Waffenprofil; `weaponRuleSetId: "cantref-polearm"` aktiviert die Sonderregeln der Stangenwaffen. Reiterattacken verlangen `requiresMounted: true`.

Die meisten Attacken verwenden ausschließlich erneuerbare Kombinationen aus Aktion, Bonusaktion und Reaktion. Einfache Ergänzungshiebe und kurze Antworten sind schwächer als vollständige Angriffsfolgen. Starke Abschlüsse und Meisterattacken verlangen zusätzlich Besondere Aktionen; ausgewählte Expertenattacken benötigen Aura. Jede Attacke ist auf ihrer Mindeststufe unabhängig von der gewählten Poolsteigerung bezahlbar.

Aktion, Bonusaktion und Reaktion beginnen bei 1 und erneuern sich pro vollständigem Beitrag. Auf Stufe 10, 15 und 20 wird jeweils ein anderer Pool auf 2 erhöht. Besondere Aktionen wachsen auf 2 / 3 / 4 / 5 / 6 bei Stufe 1 / 8 / 10 / 15 / 20 und erneuern sich täglich. Aura-Ausbildung beginnt auf Stufe 6, der erste ausgebbare Fokuspunkt auf Stufe 8; weitere Punkte folgen auf 12, 16 und 20. Aura kann weiterhin das gesamte reguläre Kostenpaket ersetzen (begrenzte Techniknutzungen bleiben erhalten).

`combat-action-progression.js` verwaltet die Poolwahlen, `combat-resource-progression.js` die Aura-Staffel. Manuell hochgestufte oder ältere Bögen erhalten fehlende Poolwahlen automatisch; der geführte Aufstieg verlangt eine Wahl. Gespeicherte Kampfstände übernehmen die geltenden Maxima und behalten bereits verbrauchte Punkte bei. Cenyr-Techniken werden zur Laufzeit aus dem gemeinsamen Katalog aktualisiert, damit alte Kopien keine überholten Kosten verwenden.

## Schadensbalance und ältere Formen

`drachentanz-damage-progression.js` legt das gemeinsame Schadensbudget anhand der Freigabestufe und des Kostenpakets fest. Eine reguläre Technik verwendet einmal die Waffenwürfel und begrenzte einzelne Zusatzwürfel. Ein Großschwert mit 2W6 erhält pro Zusatzwürfel nur ein weiteres W6. Reine Bonusangriffe beginnen mit 1W4. Flächenattacken tauschen einen Teil ihres Schadens pro Ziel gegen Reichweite ein.

`damageModel.scalingSteps` enthält den Ausbildungsbonus älterer Attacken. `combat-technique-damage.js` wählt ausschließlich den höchsten erreichten Eintrag; weder mehrere Pfade noch erneutes Speichern vervielfachen ihn. Waffenwechsel, ein- oder zweihändige Führung und manuelle Stufenänderungen berechnen die Formel neu. Die Schritte 7/9 bilden den Form- und Pfadwechsel ab, 13/17 die vertiefte Experten- und Meisterausbildung. Milwr verwendet stattdessen 6/10/15.

Die [Schadensübersicht](../../../../Klassenordner/docs/COMBAT_DAMAGE_BALANCE.md) dokumentiert die Staffel, sämtliche geprüften Klassenvorlagen und die weiteren ausgearbeiteten Charakterangriffe. Der generierte Attackenkatalog zeigt für alle 208 Attacken den Vergleich bei Freigabe und auf Stufe 20.
