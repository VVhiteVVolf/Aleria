# Kampfsystem und neue Item-Anbindung – Checkup 01.11.2026

## Ergebnis und Umfang

Die gemeinsame Regelberechnung, versionierten Itemverweise, Transaktionen, getrennten Live-Ressourcen und historischen Auswertungen sind als Grundlage tragfähig. Im Zusammenspiel wurden sieben konkrete Fehler und eine administrative Rechte-Lücke gezielt behoben. Bestehende Online-Daten, IDs, historische Würfe und Ressourcen wurden nicht migriert oder verändert. Kein Push/Deploy, keine Live-Schreibzugriffe.

Geprüft: Combat-Aufruf, Itemnutzung, Ausrüstungssynchronisation, gepinnte Definitionen, Ladungsregeneration, Rasten, Rücknahmen, aktive Kampfbindungen und die neun bekannten Combat-Abweichungen aus der bisherigen Vollprüfung.

## Behoben

| Priorität | Befund und tatsächliche Auswirkung | Änderung und Nachweis |
| --- | --- | --- |
| P1 | Breiter tatsächlicher Firestore-Lauf zeigte 23 abgewiesene Kampfhandlungen: Wenn sich Zustände ohne Technikrettungswurf ändern, enthielt `targetConditionSnapshot.applied` den unzulässigen Wert `undefined`. Betroffen waren unter anderem Buffs, Berserkergang, Konzentrationswechsel und Zustandsentfernung. | `modules/combat/combat-resolution-service.js:860`: fehlender angewandter Technikzustand wird ausdrücklich als `null` normalisiert. Keine globale Firestore-Einstellung zum Ignorieren ungültiger Werte. Neuer Regressionstest für Vergabe und Entfernung war vorher 2/2 rot und danach 2/2 grün. Vollständiger tatsächlicher Emulator-Wiederholungslauf nach zentralem Sync: 73/73 bestanden. |
| P1 | Rast überlagerte das aktuelle Inventar mit einem historischen Nutzungsbeleg. Bei Ladungsregeneration wurde dieses alte Inventar vollständig gespeichert: späterer Besitz konnte verschwinden und altes Guthaben zurückkehren. Reproduktion: 100 statt tatsächlich 37 Kupfer, späteres Item fehlte. | `firebase/functions/src/mechanics/commit-scene-rest.js:131`: Ladungen verwenden ausdrücklich das aktuell transaktional gelesene Inventar. Derselbe Abgleich in der Browser-Vorschau (`modules/scene-rest/scene-rest-controller.js:103`). Operationstest: echte Nutzung → späterer Besitz-/Geldstand → Rast → Undo; Altbeleg bleibt gleich. |
| P1 | Undo prüfte nur `lastMechanicalCommentId`. Kauf, Zuteilung oder Übergabe ändern diesen Marker nicht. Eine alte Rücknahme konnte neue Items/Geld überschreiben oder einen bereits übergebenen Gegenstand erneut herstellen. | `commit-undo-mechanical-comment.js:47`, neuer gekapselter `mechanical-undo-inventory.js`: Inhaltssignatur des Nachher-Inventars ohne Revisionsnummer; Schlüsselreihenfolge unabhängig. Neue Combat-/Rastbelege speichern diese Signatur; ältere Segment-/Top-Level-Belege liefern ihren gespeicherten Nachher-Snapshot. Tatsächliche Zuteilung und Übergabe in anderer Szene werden geschützt; mehrstufiges normales Undo bleibt trotz steigender Revisionen möglich. |
| P1 | Persistente Rastteilnehmer konnten trotz aktiver Kampfbindung in einer anderen Szene vollständig geheilt und nachgeladen werden. | `commit-scene-rest.js:104`: dieselben vorhandenen `combat_profile_locks` werden vor jeder Änderung gelesen. Nur persistente Teilnehmer betroffen; geteilte Kreaturenvorlagen bleiben frei. Unitnachweis: abgewiesene Rast lässt HP, Ladungen und Historie unverändert, nach Freigabe normale Rast. Zusätzlich im tatsächlichen Firestore-Emulator mit echtem Kampfstart/-ende erfolgreich bestätigt. |
| P2 | Rast akzeptierte einen vor der ausgewerteten Historie liegenden `orderKey`. Persistierter Zustand und spätere Wiedergabe konnten dadurch auseinanderlaufen. | `commit-scene-rest.js:226`: gemeinsame `nextMechanicalCommentOrderKey` wie andere mechanische Beiträge. Test fordert Rast nach der bereits ausgewerteten Nutzung. |
| P2 | Ylvas persönliche Waffen-Techniken verwendeten beim Erstangriff den generischen Typ „physisch“, während Folgeangriffe korrekt „Stich“ verwendeten. Typgebundener Rüstungsschutz wurde beim Erstangriff umgangen. | `modules/characters/personal-techniques/ylva-weapon-techniques.js:11` und `ylva-duel-techniques.js:22`: Waffenschadenstyp erben wie die vorhandenen gemeinsamen Technikfabriken. Regression prüft jeden Speertreffer einschließlich Schutz und Krit-Maximum+Wurf. Keine neue Bewertung alter Belege. |
| P2 | `force:true` beim Undo stand serverseitig jedem angemeldeten Nutzer offen, obwohl der einzige UI-Aufruf die administrative Backupbereinigung ist. Damit ließen sich normale Abhängigkeitsprüfungen umgehen. | `commit-undo-mechanical-comment.js:113`: nur bestehende `admin`-/`moderator`-Rollen. Normales Undo und normale Beiträge behalten ihre bisherigen Rechte. Regressionsfälle für Player/Editor/Admin/Moderator. |
| P3 | Die sieben neuen Brevanor-Kämpferklassen fehlten in der gemeinsamen Rüstungsroutine. Die eigentliche Rüstungs-RK war bereits korrekt, Klassenerkennung/Anzeige nicht. | `modules/classes/armor-routine.js:1,24`: vorhandene `BREVANOR_CLASS_IDS` wiederverwenden; keine zweite Namenliste. Vorhandene Prüfung aller Archivklassen jetzt grün. |

## Bisherige Combat-Testabweichungen

Neun Fälle sind aufgeklärt: Kerant war der oben behobene echte Kataloganschlussfehler. Der Schadensbudget-Test ignorierte die am 15.10. freigegebene kleine Positionswirkung für −1 Schaden. Sieben Ylva-Fälle erwarteten veraltete Würfelnotation ohne feste Boni beziehungsweise verdoppelte Kritwürfel. Aktualisiert wurden die Prüfannahmen, nicht das freigegebene Balancing. Zusätzlich fand die genauere Prüfung den unabhängigen echten Schadenstypfehler.

## Noch zu gestaltende Schnittstellen – getrennt von Fehlerkorrekturen

1. **P1: Verbindliches Steuerungsmodell für mechanische Figurenaktionen festlegen.** `commit-combat-comment.js:211`, Rast und normale Rücknahme verlangen Anmeldung, aber keine Besitzberechtigung. Das steht dem strikteren Eigentumsmodell der Itemzuteilung/-übergabe gegenüber. Viele Altfiguren haben keinen `ownerUid`, NPCs werden gemeinschaftlich geführt. Deshalb keine pauschale neue Besitzsperre eingeführt. Sinnvoll ist eine ausdrückliche Steuerungsfreigabe für Gruppen/NPCs/Spielleitung, die Erzählbeiträge frei lässt. Nur das bereits eindeutig administrative Force-Undo wurde eingeschränkt.
2. **P1/P2: Würfelautorität bewusst entscheiden.** `provided-dice-adapter.js:47,91,118` prüft Würfelanzahl, Grenzen, Vorteil/Nachteil und berechnet Boni/Schaden serverseitig neu. Die Einzelwürfel stammen weiter aus dem Browser; die Belege belegen keine unveränderbare serverseitige Ziehung. Für kooperatives Vertrauen ist das das bestehende Modell. Für manipulationsgeschützte mechanische Belohnungen wäre ein einmal verwendbarer serverseitiger Wurfbeleg beziehungsweise eine serverseitige Ziehung vor der Animation erforderlich. Keine spontane Umstellung und keine Einschränkung normaler Texte.
3. **P2: Tageserholung szenenübergreifend vereinheitlichen.** `commit-combat-comment.js:260` und `commit-scene-rest.js:86` verwenden `scene:<entryId>:day-N`. Dieselbe Figur erhält beim Wechsel in eine andere Szene einen anderen Tageskennungsschlüssel, auch wenn das Weltdatum gleich ist. Dieser bekannte technische Szenenbezug sollte bei einer künftigen ausdrücklich versionierten Erholungsregel durch einen gemeinsamen Weltzeitbezug ergänzt werden. Historische Schlüssel und Play-Tageszählung dabei erhalten; kein spontanes Umnummerieren.
4. **P2: Rast mit derselben dauerhaften Vorgangsquittung wie neue Item-/Questoperationen versehen.** `commit-scene-rest.js:62` erzeugt noch eine neue Kommentar-ID je Aufruf und keine `operationId`-Quittung. Ein wiederholter identischer Aufruf nach verlorener Antwort wird durch die Mindestdauer-/Zeitprüfung zwar gewöhnlich zurückgewiesen, liefert aber nicht denselben erfolgreichen Beleg zurück. Das ist eine Bedienungs-/Wiederanlauf-Lücke, keine belegte Doppelheilung im geprüften Ablauf.
5. **P3: Historische Rücknahme ohne Nachher-Beleg bleibt ein Altformat.** Für neue Belege besteht der Inhaltsschutz; bei historischen Belegen mit Inventarsnapshot ebenfalls. Ein alter Sonderbeleg mit `mechanicalUndo.before.inventory`, aber ohne irgendeinen Nachher-Inventarsnapshot kann nicht nachträglich sicher mit dem heutigen Inventar verglichen werden. Keine Massenänderung solcher Belege vornehmen; bei tatsächlich gefundenen Fällen gezielt eine sichere manuelle Korrektur anbieten.

Die zusätzliche Prüfverbesserung ist bereits umgesetzt: `firebase/functions/tests/fixtures/combat-transaction-database.js` prüft vor `create`/`set`/`update` rekursiv auf ungültige `undefined`-Werte und nennt ihren Feldpfad, bevor die bisherige JSON-Kopie sie verschlucken kann. Das erklärt und schließt die bisherige Lücke zwischen Unitprüfungen und Firestore. Die sieben neuen Fixture-Fälle prüfen verschachtelte Objekte/Arrays, Transaktionsrollback und gültige Null-/Nullwert-/Boolean-Daten; danach bestanden alle Server-Units.

## Prüfbelege

- `combat-browser.log`: 618/618 relevante Browser-Combat-/Ausrüstungs-/Nutzungs-/Rastprüfungen bestanden.
- `combat-server-targeted.log`: 36/36 Serverprüfungen bestanden (Rast, Item-Undo, Legacybelege, mehrstufiges Undo, echte spätere Zuteilung/Übergabe, Force-Rollen, kritische Szenenitems).
- `server-units-strict-fixture.log`: vollständiger Server-Unitlauf mit gehärtetem gemeinsamen Transaktionsfixture, 292/292 bestanden.
- `combat-fixture-before.log` / `combat-fixture-after.log`: sieben neue Fixture-Prüfungen, vorher 1/7 bestanden (sechs Fälle reproduzieren das stille Entfernen von `undefined`), nachher 7/7 bestanden.
- `combat-rest-lock-emulator.log`: 1/1 echte Emulatorprüfung bestanden. `firebase/functions/tests/integration/combat-rest-lock.integration.mjs` verwendet ausschließlich `127.0.0.1:8187` und das eigene Projekt `demo-aleria-combat-checkup`; echter Encounter-Start sperrt fremde Rast ohne HP-/Ladungsänderung oder Rastbeitrag, echter Encounter-Ende erlaubt danach die Heilung und Ladungsregeneration. Keine Projekte oder Emulatorbestände gelöscht.
- `combat-integration-before-fix.log`: vollständiger erster Lauf der neun bestehenden Dateien aus `test:combat-integration`, ohne Generatorlauf, sequenziell mit `--test-concurrency=1`: 73 Fälle, 49 bestanden, 24 fehlgeschlagen. Davon 23 derselbe oben behobene Snapshot-Speicherfehler; eine veraltete Krit-Erwartung (10 statt korrekt 15: Maximum von 1W6+1W4 = 10, plus einzelner gerollter Pool 3+2; Eigenschaden unverändert 3). Fixture korrigiert und Maximum sowie tatsächliche Würfelanzahl zusätzlich geprüft.
- `combat-integration-full.log`: korrigierter vollständiger Lauf derselben neun Dateien, 73/73 bestanden in 154 Sekunden. Isolierter tatsächlicher Java-Firestore-Emulator auf `127.0.0.1:8180`, englische Locale, ausschließlich `demo-aleria-combat-checkup` und vorhandene Projektregeln. Kein erneuter Generatorlauf innerhalb des Testbefehls, keine Live-Daten und keine globale Löschung. Die Fixture leert ausschließlich ihr fest benanntes Wegwerf-Demoprojekt auf diesem separaten Emulator.
- `combat-condition-storage-before.log` / `combat-condition-storage-after.log`: neue Speicher-Regressionsprüfung 0/2 vor, 2/2 nach der gezielten Korrektur.
- Zentraler Mechanics-Generator durch Root-Agent ausgeführt; anschließend die neue Emulatorprüfung erfolgreich abgeschlossen. Der übergreifende Volltest wird vom Root-Agent zusammengeführt; kein paralleler Generatorlauf dieses Teilauftrags.

## Geänderte Dateien dieses Teilauftrags

- `AleriaAlmanach/modules/classes/armor-routine.js`
- `AleriaAlmanach/modules/characters/personal-techniques/ylva-weapon-techniques.js`
- `AleriaAlmanach/modules/characters/personal-techniques/ylva-duel-techniques.js`
- `AleriaAlmanach/modules/scene-rest/scene-rest-controller.js`
- `AleriaAlmanach/modules/combat/combat-resolution-service.js`
- `AleriaAlmanach/tests/combat-condition-storage.test.mjs`
- `AleriaAlmanach/tests/weapon-action-balancing.test.mjs`
- `AleriaAlmanach/tests/ylva-weapon-expansion.test.mjs`
- `firebase/functions/src/mechanics/commit-combat-comment.js`
- `firebase/functions/src/mechanics/commit-scene-rest.js`
- `firebase/functions/src/mechanics/commit-undo-mechanical-comment.js`
- `firebase/functions/src/mechanics/mechanical-undo-inventory.js`
- `firebase/functions/tests/scene-rest-current-inventory.test.js`
- `firebase/functions/tests/mechanical-undo-inventory.test.js`
- `firebase/functions/tests/integration/combat-rest-lock.integration.mjs`
- `firebase/functions/tests/integration/combat-checkup-regressions.integration.mjs`
- `firebase/functions/tests/fixtures/combat-transaction-database.js`
- `firebase/functions/tests/firestore-transaction-fixture.test.js`
