# Drachentanz-Register

Der Drachentanz wird zentral in `drachentanz-registry.js` beschrieben. Die Form-IDs liegen in `drachentanz-ids.js`; die Attacken sind nach Ausbildungsabschnitt in `techniques/` gegliedert. Klassen und Charaktere beziehen diese Daten über `combat-style-registry.js` und kopieren sie nicht.

Die Klassenregeln, Waffenvarianten, Lernbudgets und Pfadzugänge liegen getrennt unter `modules/classes/cenyr/`. Der lesbare Gesamtstand wird beim Klassen-Build als [Cenyr-Attackenkatalog](../../../../Klassenordner/docs/CENYR_ATTACK_CATALOG.md) erzeugt.

## Umfang

| Form oder Pfad | Attacken im Gesamtpool | Ausbildung |
| --- | ---: | --- |
| Tanz des Jungdrachens | 60 | Stufe 1–6, einschließlich des cenyrischen Derwyn-Pfades |
| Freie Vertiefung | 24 | Stufe 7–8 |
| Tanz des Schwertdrachens | 24 | Stufe 9–20, einschließlich Barddwyr-Schwertoptionen |
| Tanz des abwartenden Drachens | 18 | Stufe 9–20 |
| Tanz des fliegenden Drachens | 18 | Stufe 9–20 |
| ↳ Tanz des aufsteigenden Drachens | 6 | Unterform des fliegenden Drachens, Stufe 9–20; setzt dessen Wahl voraus |
| Tanz des brüllenden Drachens | 22 | Stufe 9–20; eine Arthwyr-Attacke ab 6 |
| Tanz des ausgeglichenen Drachens | 18 | Stufe 9–20 |
| Tanz des Zwillingsdrachens | 12 | Stufe 9–20 |
| Tanz des Speerdrachens | 12 | Erste Expertenform von Cantref und Uchelwyr, Stufe 9–20 |
| Tanz des peitschenden Drachens | 8 | Cantref und Uchelwyr, Stufe 9–20 |
| Tanz des hütenden Drachens | 8 | Cantref und Uchelwyr, Stufe 9–20 |
| Tanz des stürmenden Drachens | 6 | Berittener Uchelwyr, Stufe 9–20 |
| Tanz des schweifenden Drachens | 12 | Uchelwyr zu Fuß und mit Reiteroptionen, Stufe 9–20 |
| Tanz des lauernden Drachens | 14 | Helwyr: zwölf Bogen-, zwei Schwertoptionen, Stufe 9–20 |
| Tanz des jagenden Drachens | 8 | Helwyr: Bogen, kurze Klingen und gedeckte Bewegung, Stufe 9–20 |
| Tanz der Bärenklaue | 6 | Eigene Arthwyr-Form, Stufe 9–20 |
| Tanz des Drachlings | 5 | Milwr, unverändert Stufe 6–15 |
| Tanz des trällernden Drachens | 4 | Barddwyr, Stufe 7–8 |
| Tanz des kreischenden Drachens | 12 | Barddwyr, Stufe 9–20 |

Das Register enthält 297 Techniken: zehn bestätigte historische/ergänzende Teulu-Techniken, sechs bestätigte Derwyn-Grundtechniken sowie 281 als `draft` geführte Ausbildungsoptionen. Auswahl über verdiente Slots macht Entwürfe auf einem konkreten Charakter nutzbar und bewahrt den Katalogstatus als `sourceStatus`. Kein neuer Pfad erhöht das Lernbudget.

## Klassen und Technikmodule

`DRACHENTANZ_CLASS_PATH_IDS` in `drachentanz-ids.js` hält die verbindliche Pfadzuordnung und Reihenfolge. Teulu behalten ausschließlich die sieben klassischen Expertenformen; Helwyr ergänzen sie um Lauernden und Jagenden Drachen, Arthwyr um die Bärenklaue. Cantref erhalten ausschließlich die drei gemeinsamen Speerformen, Uchelwyr zusätzlich Stürmenden und Schweifenden Drachen. Barddwyr behalten nur Schwertdrache und ihre zwei eigenen Formen. Der Jungdrache und die bestehenden Slot-IDs bleiben erhalten.

- `foundation-techniques.js` und `teulu-foundation-techniques.js` enthalten die Grundausbildung; die Derwyn-Schwertfolge kommt aus dem gemeinsamen Derwyn-Modul in `sirenentanz/derwyn-techniques.js`.
- `duelist-techniques.js` führt die freien Übergangstechniken der Stufen 7–8.
- `schwertdrachen-path-techniques.js` und die klassischen Expertenmodule enthalten die zugelassenen Teulu-, Helwyr- und Arthwyr-Techniken. Der Schwertdrache bleibt auch Barddwyr zugänglich.
- `spear-path-techniques.js` enthält den eigenständigen Speerdrachen sowie ergänzende offensive und defensive Speertechniken. Beide Speerklassen teilen dieselben IDs und Waffenprofile. Der Speerdrache wahrt die Einzelzielregel auch mit Hellebarde.
- `exclusive-path-techniques.js` erhält die früheren Lanzen- und Bogen-Attacken unter stabilen Technik-IDs; die aktive Formzuordnung lautet jetzt Peitschender/Hütender beziehungsweise Lauernder Drache.
- `uchelwyr-mounted-techniques.js` teilt die bisherigen Reiteroptionen auf Stürmenden und Schweifenden Drachen auf. Jungdrache und freie Vertiefung behalten ihre frühen Reiteroptionen.
- `class-specialist-techniques.js` ergänzt Fußtechniken des Schweifenden, Schwertantworten des Lauernden, die Jagdform und die Bärenklaue. Unterstützende Techniken erzeugen keinen ungewollten Waffenwurf. Verbergen bleibt eine eigene Probe und wird nicht durch einen bloßen Beschreibungstext automatisch gewährt.
- `barddwyr-techniques.js` führt Trällernden und Kreischenden Drachen; übernommene Schwerttechniken liegen jetzt ausschließlich im Schwertdrachen.
- `helwyr-expert-techniques.js`, `bruellender-shield-techniques.js`, `aufsteigender-techniques.js` und `zwillingsdrachen-techniques.js` erhalten die passenden klassischen Erweiterungen. `milwr-techniques.js` bleibt unverändert.
- `drachentanz-technique-factory.js` normalisiert Kosten, Waffenwürfel, Effekte und Klassenmetadaten.

## Bestehende Bögen

`drachentanz-training-migration.js` stellt reine Migrationen für Form- und Technik-IDs bereit. Die vormals nur umbenannte Schwertdrachenfolge wird für Cantref und Uchelwyr in die zwölf korrespondierenden Speerdrache-Techniken überführt. Brauchbare frühere Lanzen-, Bogen-, Reiter- und Barddwyr-IDs behalten ihre Identität und erhalten ihre neue kanonische Form. Klassenfremde Attacken geben ihren Slot frei; eigene Techniken außerhalb der reservierten Katalog-IDs bleiben erhalten.

Ein früherer Sattel- oder Lanzenpfad kann auf zwei neue Formen verteilt sein. Eine Migration schenkt deshalb keinen zweiten Pfad: Der gültige gewählte Pfad bleibt, für weitere Formen gilt der bestehende Slotpreis. Der gemeinsame Auswahlprozess entscheidet über ungültige oder erneut verfügbare Slots.

## Prüfung

`tests/drachentanz-class-forms.test.mjs` prüft die genaue Klassenzuordnung, Speerzugang für beide Klassen, den Ausschluss fremder Techniken, Reiter- und Waffenbedingungen, ausführbare Schutzwirkungen und die ID-Migration. `Klassenordner/tests/cenyr-classes.test.mjs` prüft zusätzlich alle Stufenaufstiege bis 20, manuelle Stufenänderungen, Budgets, Kosten und die erzeugten Klassenseiten.

`tests/drachentanz-class-runtime.test.mjs` führt die echte Szenenauswertung für Hütenden und Jagenden Drachen aus: Schutz ohne Treffer-/Schadenswurf und Ablauf nach dem nächsten eigenen Beitrag, Bewegungshinweis mit Pfadbonus sowie der nur gegen aktiv als „Überrascht“ markierte Ziele geltende Hinterhaltsschuss. Dessen `pre-roll`-Regel gilt ausschließlich für diese Technik; gewöhnliche Schüsse erhalten den Bonus nicht. Heimlichkeit wird weiterhin über die bestehenden Fertigkeitsproben und Szenenzustände beurteilt.

## Freigabe und Vergabe

`getCombatStyleTechniquesForGrants()` verteilt nur bestätigte Techniken. Ein Grant mit `techniqueUnlockLevels` muss eine Technik zusätzlich ausdrücklich einer Stufe zuordnen. Formzugang, Pfadwahl und ein Entwurf im Katalog reichen daher nicht zur Vergabe.

Für Cenyr-Klassen führt `cenyr-technique-selection.js` die eigentliche Ausbildung aus. Es bindet jede gewählte Attacke an einen verdienten Slot und prüft Formzugang, Pfad, Barddwyr-Waffenweg, Mindeststufe, Slotband und eine vorhandene passende Waffe. Geführter und manueller Stufenaufstieg verwenden dieselbe Logik.

Waffenabhängige Attacken speichern `damageModel.mode: "weapon-dice"`. Die Kampfauflösung berechnet die Formel aus der aktuell geführten Waffe. `cenyrTraining.allowedClassIds` und `classWeaponProfiles` begrenzen Klasse und Waffenprofil; `weaponRuleSetId: "cantref-polearm"` aktiviert die Sonderregeln der Stangenwaffen. Reiterattacken verlangen `requiresMounted: true`, Zwillingsdrachen-Techniken zwei geführte Klingen und Schildtechniken einen tatsächlich geführten Schild.

Die passiven Pfadeigenschaften liegen unabhängig von den Attackendaten in `drachentanz-path-features.js`. Sie werden nur aktiv, wenn der Pfad gelernt, die erforderliche Stufe erreicht und eine Technik dieses Pfades gewählt wurde. So bleiben Duellgegnerzahl, Reiterstatus, Waffenprofil, Kritbereich und temporäre Haltungseffekte zentral prüfbar. Der Aufsteigende Drache verlangt als Unterpfad zuerst den Fliegenden Drachen.

Die meisten Attacken verwenden ausschließlich erneuerbare Kombinationen aus Aktion, Bonusaktion und Reaktion. Einfache Ergänzungshiebe und kurze Antworten sind schwächer als vollständige Angriffsfolgen. Starke Abschlüsse und Meisterattacken verlangen zusätzlich Besondere Aktionen; ausgewählte Expertenattacken benötigen Aura. Jede Attacke ist auf ihrer Mindeststufe unabhängig von der gewählten Poolsteigerung bezahlbar.

Aktion, Bonusaktion und Reaktion beginnen bei 1 und erneuern sich pro vollständigem Beitrag. Auf Stufe 10, 15 und 20 wird jeweils ein anderer Pool auf 2 erhöht. Besondere Aktionen wachsen auf 2 / 3 / 4 / 5 / 6 bei Stufe 1 / 8 / 10 / 15 / 20 und erneuern sich täglich. Aura-Ausbildung beginnt auf Stufe 6, der erste ausgebbare Fokuspunkt auf Stufe 8; weitere Punkte folgen auf 12, 16 und 20. Aura kann weiterhin das gesamte reguläre Kostenpaket ersetzen (begrenzte Techniknutzungen bleiben erhalten). Bei einem regulären Schadensangriff kommt dabei einmal der größte einzelne Angriffswürfel hinzu. Bereits mit Aura bepreiste Elite-Techniken erhalten diesen Ersatzbonus nicht nochmals.

`combat-action-progression.js` verwaltet die Poolwahlen, `combat-resource-progression.js` die Aura-Staffel. Manuell hochgestufte oder ältere Bögen erhalten fehlende Poolwahlen automatisch; der geführte Aufstieg verlangt eine Wahl. Gespeicherte Kampfstände übernehmen die geltenden Maxima und behalten bereits verbrauchte Punkte bei. Cenyr-Techniken werden zur Laufzeit aus dem gemeinsamen Katalog aktualisiert, damit alte Kopien keine überholten Kosten verwenden.

## Schadensbalance und ältere Formen

`drachentanz-damage-progression.js` legt das gemeinsame Schadensbudget für Drachentanz, Wyrmtanz und Huskarl anhand der Freigabestufe und des Kostenpakets fest. Aktion, Reaktion und Bonusaktion haben eigene Budgets; Kombinationen mit einer Besonderen Aktion reichen vom vielseitigen Nebenangriff bis zur vollständigen Meisterfolge. Eine reguläre Technik verwendet einmal die Waffenwürfel und begrenzte einzelne Zusatzwürfel. Ein Großschwert mit 2W6 erhält pro Zusatzwürfel nur ein weiteres W6. Reine Bonusangriffe beginnen mit 1W6. Flächenattacken tauschen einen Teil ihres Schadens pro Ziel gegen mehrere Ziele ein. `damageModel.bonusModifier` enthält gegebenenfalls einen kleinen festen Technikbonus, der bei kritischen Treffern nicht verdoppelt wird. Reine Schutz- und Hilfstechniken erhalten keinen Waffenwurf.

`damageModel.scalingSteps` enthält den Ausbildungsbonus älterer Attacken. `combat-technique-damage.js` wählt ausschließlich den höchsten erreichten Eintrag; weder mehrere Pfade noch erneutes Speichern vervielfachen ihn. Waffenwechsel, ein- oder zweihändige Führung und manuelle Stufenänderungen berechnen die Formel neu. Die Schritte 7/9 bilden den Form- und Pfadwechsel ab, 13/17 die vertiefte Experten- und Meisterausbildung. Milwr verwendet stattdessen 6/10/15.

Die [Schadensübersicht](../../../../Klassenordner/docs/COMBAT_DAMAGE_BALANCE.md) verlinkt den aktuellen Balancebericht. Der generierte Cenyr-Attackenkatalog zeigt für alle Techniken den Vergleich bei Freigabe und auf Stufe 20; der stilübergreifende Prüfbericht vergleicht die registrierten Einträge mit ihrem vorherigen Stand.
