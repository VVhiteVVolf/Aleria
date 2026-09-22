# Automatisches Formarsenal · 22. September 2026

Alle Techniken einer zugänglichen Kampfform werden ab ihrer Mindeststufe automatisch erlernt. Die frühere Auswahl weniger Attacken pro Ausbildungsplatz begrenzt das Arsenal nicht mehr. Zusätzliche Pfade benötigen weiterhin ihre Freischaltung; Waffen-, Schild-, Zweihand- und Reitvoraussetzungen entscheiden über die Ausführbarkeit einer erlernten Technik.

## Gemeinsame Quellen

- `modules/classes/class-form-arsenal.js` materialisiert die zugänglichen Katalogtechniken. Der Cenyr-Abgleich erhält historische Auswahlmetadaten und individuelle Techniken; Aldrimar und Vennyr verwenden ihre bestehenden Formkataloge.
- `class-special-maneuvers.js` ergänzt alle registrierten Klassen ab Stufe 5 um eine kleine Vorbereitung und eine starke Option. Beide kosten 1 Besondere Aktion plus eine reguläre Ressource. Weitere Optionen folgen auf 8, 12, 16 und 20. Persönliche Fähigkeiten und aktuelle Ressourcenvorräte bleiben erhalten.
- Die Kataloge, Selbstzielwahl und Ausrüstungsregeln werden von Charakterbogen und Kampfauflösung verwendet; die Mechanik wird nach `firebase/functions/src/generated` synchronisiert. Kein separates Regelwerk im Server.
- Selbstwirkungen wählen die eigene Figur. Schadenslose Bogenvorbereitungen verbrauchen keine Pfeile.
- Ein gewählter Schild erscheint in der linken Hand. Zweitwaffe und Zweihandwaffen schließen ihn aus. Eigene verfügbare Reittiere lassen sich auswählen; berittene Techniken sind ohne Reitstatus gesperrt. Auf-/Absteigen verwendet die bestehende Ausrüstungsökonomie: Startaufstellung kostenlos, später 1 Bonusaktion. Ausrüstungszustände werden in der Szene gespeichert und bei Rücknahme korrekt wiederhergestellt.

## Bestehende Bögen

Der Abgleich erfolgt beim Laden und bei künftigen Auswertungen. Es ist keine überschreibende Datenmigration nötig. Keine vergangenen Kommentare werden neu ausgewertet; TP, Zustände, Besitz und verbrauchte Ressourcen werden nicht zurückgesetzt.

| Figur | Klasse / Stufe | Reguläre Formtechniken, ohne besondere Klassenmanöver |
| --- | --- | ---: |
| Ylva | Skytte 7 | 21 |
| Asgeir | Skjaldr 7 | 21 |
| Gais | Uchelwyr 5 | 14 |
| Nudd | Cantref 6 | 10 |
| Gawain | Teulu 5 | 8 |
| Gildas | Teulu 6 | 10 |

Gais bleibt Uchelwyr. Sein geprüfter Onlinebestand enthält noch kein Reittier. Die Reitprüfung verwendet ausschließlich ein lokales Prüfross; kein Tier wird dem Onlinebestand hinzugefügt.

## Prüfung

- 1.060 Almanach- und Klassenregressionen bestanden, einschließlich Erstellung, Stufenaufstieg, Absenken der Stufe, Pfadgrenzen, Deduplizierung und Erhalt individueller Techniken.
- 122 Serverregressionen bestanden.
- Elf zusätzliche Emulatorprüfungen mit den tatsächlichen Online-Bögen: sechs Figuren mit kleiner/starker Sonderoption und Ressourcenerschöpfung, drei gegenseitige Duelle mit normalen/kritischen Würfen sowie Schildwechsel/Rücknahme und Auf-/Absteigen einschließlich manipulierter Reittierauswahl.
- Bestehende Item-Duellreihe: 37 Prüfungen bestanden, darunter alle kritischen Nebeneffekte, Entwaffnung, Aufheben und vier längere Duelle. Zwei alte Offline-Fixtureprüfungen für Gais/Nudd sind übersprungen, weil deren archivierte Ausgangsdateien noch keine Bögen enthalten; beide aktuellen Online-Bögen sind in den elf zusätzlichen Prüfungen enthalten.
- Browserprüfung am echten Beitragsformular: Selbstziel, Wechsel zurück zum Angriff, Schild/Zweitwaffe, grüne Reittierauswahl und schmale Mobilansicht.
- Produktionsbuild erfolgreich. Die vorhandene Warnung zu großen Bundles bleibt bestehen.

Regressionen: `node --test --test-concurrency=4 tests/*.test.mjs ../Klassenordner/tests/*.test.mjs` im Almanach; Server: `node --test firebase/functions/tests/*.test.js` vom Repository-Stamm. Die zusätzlichen Duelle liegen in `firebase/functions/tests/integration/combat-class-actions.integration.mjs` und verlangen ausdrücklich den lokalen Firestore-Emulator auf `127.0.0.1:8182` sowie einen rein lesend exportierten Charaktersnapshot (`COMBAT_TEST_CHARACTER_SNAPSHOT`).
