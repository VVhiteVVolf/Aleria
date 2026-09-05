# Kampfankündigung und Abschluss

Stand: 5. September 2026. Lokal implementiert und geprüft; nicht veröffentlicht.

## Ablauf

- **Eröffnen:** Titel, optionaler Erzählertext, regulärer Kampf/Duell/Übungskampf, Beteiligte und Seiten. Die Figuren der Szene stehen zuerst; eine Suche durchsucht das gesamte Register. Ausgewählte Figuren erhalten zunächst eigene Seitennamen. Gleiche Namen bilden eine Partei.
- **Laufender Kampf:** Eine Leiste über der Beitragsliste und Schaltflächen an der ursprünglichen Ankündigung öffnen die Verwaltung oder den Abschluss. Start und Ende bleiben getrennte Beiträge derselben Kampfkennung.
- **Abschließen:** Kampfstände prüfen, Sieg/Unentschieden/Abbruch und einen Grund angeben, optional Erzählertext schreiben, Vorschau prüfen und veröffentlichen. Ein eindeutiger Kampfstand kann einen Sieger vorschlagen. Kampfunfähigkeit löst keinen automatischen Abschluss aus.
- **Fazit:** Ergebnis, Grund, TP bei Eintritt und Abschluss, ausgewertete Handlungen, verursachter Schaden, dokumentierte Handlungs- und Reaktionskosten, besondere Treffer/Kampfunfähigkeit und EP. Eine Mehrzielhandlung zählt als eine Handlung. Frühere Ankündigungen ohne Eintrittssnapshot zeigen unbekannte Anfangswerte ausdrücklich als „nicht erfasst“.
- **EP:** Übungskämpfe ohne EP als Vorgabe; bewusst aktivierbar. Unentschieden und Abbruch vergeben keine Sieg-EP. Die Vorschau verwendet dieselbe Aufteilung wie der Server. Der Server ermittelt Profilwerte und das endgültige Fazit selbst.

## Zuständigkeiten

`modules/combat/combat-encounter-model.js` besitzt Ereignisse, Parteizugehörigkeit und Replay. `combat-encounter-lifecycle.js` validiert Übergänge und übernimmt Teilnehmerdaten aus ihren autoritativen Quellen. `combat-encounter-summary.js` erstellt begrenzte, deterministische Snapshots und Statistiken; `combat-encounter-outcome.js` besitzt Ergebnisbegriffe und Vorschläge.

`modules/combat-encounter/` besitzt Dialog, lokale Entwürfe, Kandidatenauswahl, Fazitdarstellung und Szenenleiste. Der Kommentar-Renderer übergibt nur Host, Szene und vollständige Historie an die Leiste. Firebase-Zugriffe bleiben im vorhandenen Backend. Die gemeinsamen Mechanikmodule werden über `firebase/functions/scripts/sync-almanach-mechanics.mjs` synchronisiert.

## Behobene Fehler

- Normalisierte Statusformulare überschreiben gespeicherte EP-Werte, Profilquellen, Namen und Anfangswerte nicht mehr.
- Das Ende bereinigt kampfgebundene Zustände nur bei Beteiligten bzw. der betreffenden Aura. Außenstehende behalten ihre Zustände. Trefferpunkte und verbrauchte Ressourcen werden nicht aufgefüllt.
- Sieger werden nicht mehr ohne Anhaltspunkt als erste Partei vorausgewählt. Aufgabe ist ein eigener Teilnehmerstatus.
- Verdeckte Abschlussfelder bleiben bei der Eröffnung auch unter den Dialog-CSS-Regeln verborgen.
- Suchfilter, Seitennamen und Statusentwürfe bleiben beim Wechsel der Verwaltung erhalten. Die Speichern-Schaltfläche wird beim erneuten Öffnen freigegeben.
- Neue bestätigte Szenenbeiträge machen eine offene Vorschau ungültig. Die Aktualisierung erhält Titel und Erzählertext und lädt die Kampfstände erneut. Der Server prüft die mitgesendete Revision innerhalb der Transaktion.
- Ein bereits beendeter Kampf kann nicht erneut abgeschlossen oder mit derselben Kennung eröffnet werden. Persistente Profile dürfen nicht mehrfach unter verschiedenen Akteurkennungen teilnehmen; eigenständige Kreaturinstanzen bleiben erlaubt.
- Der Server hängt Kampfereignisse hinter die ausgewertete Historie. Ein zurückdatierter Abschluss kann dadurch den Kampf nicht nachträglich wieder aktiv erscheinen lassen.
- Die Kämpferliste behält im hohen Abschlussdialog ihre Höhe. Kleine Bildschirme scrollen eine breite Fazittabelle innerhalb der Tabelle.

## Prüfung

- Frontend: **440/441 Tests bestanden**. Unveränderter, bereits vorher bestehender Fehler in `tests/dashboard-rendering.test.mjs:64`: Erwartung „Die Chronik von Cenyr“ passt nicht zur gerenderten Archivübersicht.
- Backend: **84/84 Tests bestanden**.
- Zwölf neue Frontend-Regressionstests für Übergänge, EP-Daten, Außenstehende, Mehrzielhandlungen, Reaktionskosten, spätere Beitritte, sichere Textdarstellung und echte Profile von Gildas Gafyr/Gawain Draig. Zwei neue Backend-Prüfungen für Reihenfolge und veraltete/doppelte Abschlüsse.
- Browser: temporäre lokale Szene mit echten Charakterexporten und lokalem Speicherersatz. Eröffnung, eindeutiger Siegvorschlag, 1100-EP-Vorschau für Gawains Profil, standardmäßig 0 EP im Übungskampf, Entwurfserhalt, veraltete Vorschau, Aktualisierung, Doppelklick, Abschlussbeitrag, Unentschieden und Abbruch geprüft. Darstellung bei 1280×1000 und 390×844 geprüft.
- Produktionsbuild erfolgreich; vorhandene Warnung zu großen Bundles bleibt bestehen.
- Temporäres Szenenmodul, Browserprofil, Testskripte und Screenshots entfernt; Testserver beendet. Keine Firebase-Testbeiträge oder Profiländerungen vorgenommen.

Für den gemeinsamen Betrieb müssen Frontend und aktualisierte Firebase-Funktion `commitCombatEncounter` veröffentlicht werden. Die bisherigen Live-Daten werden durch diese lokale Änderung nicht migriert.
