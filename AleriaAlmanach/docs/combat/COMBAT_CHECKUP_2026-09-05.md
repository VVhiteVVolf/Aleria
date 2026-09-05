# Abschließende Kampfprüfung: Gildas Gafyr gegen Gawain Draig

Der lokale Arbeitsstand wurde am 5. September 2026 erneut geprüft. Schwerpunkt waren diesmal echte Speichertransaktionen und das Zusammenspiel von Browser, Serverberechnung, Szenen-Replay und Rücknahme.

## Gefundene und behobene Fehler

1. **Gleichzeitige Angriffe konnten eine falsche Szenenreihenfolge erhalten.** Nach einer Transaktionswiederholung wurde der alte Zeitwert weiterhin als Reihenfolge verwendet. Die Charakterdaten enthielten im reproduzierten Fall 25 TP, das Neuladen der Szene ergab 32 TP. Kampfhandlungen und Kampfereignisse erhalten nun ihre Reihenfolge aus der innerhalb der Transaktion gelesenen Historie. Der gemeinsame Code liegt in `mechanical-comment-order.js`.
2. **Bereits vorbereitete Angriffe ließen sich nach Kampfende speichern.** Neue Browserbeiträge tragen jetzt die Kampfkennung, die beim Beginn der Auswertung galt. Der Server prüft diese innerhalb der Speichertransaktion und weist beendete/gewechselte Kämpfe sowie ausgeschiedene Akteure zurück. Standalone-Handlungen bleiben möglich. Alte Clients ohne dieses Feld müssen für diesen Schutz neu geladen werden.
3. **Rücknahmen berücksichtigten reine Leseabhängigkeiten nicht.** Die Startankündigung konnte trotz nachfolgendem Angriff gelöscht werden. Ebenso konnte ein Fazit ohne EP bestehen bleiben, obwohl eine zugrundeliegende Handlung zurückgenommen wurde. Vor der normalen Rücknahme prüft der Server jetzt spätere mechanische Beiträge derselben Figuren; neuere abhängige Beiträge müssen zuerst zurückgenommen werden. Das vorhandene ausdrückliche Erzwingen bleibt ein gesondertes Werkzeug.
4. **Abweichende Akteur- und Profilkennungen wurden erst beim Angriff erkannt.** Bereits die Kampferöffnung weist solche ungültigen persistenten Zuordnungen nun mit einer verständlichen Meldung zurück.

## Ergebnisse

| Prüfung | Ergebnis |
| --- | --- |
| Integration mit echtem lokalem Firestore | 13/13 bestanden |
| Backend-Regressionen | 87/87 bestanden |
| Frontend-Regressionen | 441/442 bestanden |
| Browser: echter Würfelangriff und serverseitige Verbuchung | bestanden |
| Browser: Neuladen, Fazit, EP und Doppelklick | bestanden |
| Produktionsbuild und `git diff --check` | bestanden |

Die Integrationstests verwenden die produktiven Callable-Handler und den Frontend-Resolver mit den unveränderten Kampfprofilen beider Figuren. Geprüft wurden unter anderem zwei gleichzeitig schreibende Testspieler, Angriff in einer Redeblase, Aktion plus Jungdrachen-Bonusaktion in einer Handlungsblase, atomar zurückgewiesene Doppelaktionen, ausgeschiedene Figuren, vollständige Rücknahme einschließlich EP/Sperren sowie ein ganzes Duell bis 0 TP. Nach jeder Handlung des Duells wurden Profilwerte mit dem neu berechneten Szenenstand verglichen.

Im Browser wurde die echte Kampfoberfläche einschließlich Würfelsystem mit derselben lokalen Datenbank verbunden. Gildas würfelte **W20 10 + 7 = 17 gegen RK 16** und verursachte **10 Schaden**. Gawain wechselte von **39 auf 29 TP** und behielt diesen Wert nach dem Neuladen. Das Fazit enthielt diese Werte. Der Abschluss wegen Aufgabe vergab **genau einmal 1100 EP** an Gildas, ließ Gawains 29 TP unverändert und entfernte die Leiste des laufenden Kampfes. Es wurden keine JavaScript-Laufzeitfehler erfasst. Das externe Porträt aus Gawains Export wurde im Testbrowser nicht geladen; die Profilwerte und Bedienung funktionierten.

Der einzige fehlgeschlagene Frontend-Test bleibt der bereits vor diesen Änderungen fehlerhafte Dashboard-Test in `tests/dashboard-rendering.test.mjs:64` (erwartet „Die Chronik von Cenyr“). Er betrifft nicht die Kampfmechanik.

Der Build meldet weiterhin die bestehende Warnung zu großen JavaScript-Bundles.

## Wiederholbarkeit und Betriebsgrenze

Die neuen dauerhaften Integrationstests liegen unter `firebase/functions/tests/integration/`; die dortige README beschreibt den separaten Aufruf. Der Emulator verwendet ausschließlich `demo-aleria-combat-checkup` auf `127.0.0.1:8180`. Die temporäre sichtbare Testszene, lokale Browseranbindung, Screenshots und das Browserprofil wurden nach der Prüfung entfernt; die Testdatenbank und Hilfsserver wurden beendet. Produktive Profile und Szenen wurden nicht verändert.

Dies prüft echte lokale Firestore-Transaktionen, aber keinen gemeinsamen Login gegen die veröffentlichte Anwendung. Für den bevorstehenden Online-Kampf müssen der aktuelle Almanach und insbesondere `commitCombatComment`, `commitCombatEncounter` und `commitUndoMechanicalComment` zusammen veröffentlicht werden. Anschließend beide Browser neu laden. Die Veröffentlichung gehört nicht zu diesem Checkup.
