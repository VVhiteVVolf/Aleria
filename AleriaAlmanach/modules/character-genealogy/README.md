# Genealogie und Figurenimport

`genealogy-bootstrap.js` ist der Seiteneinstieg. Er lädt ausschließlich die
gemeinsamen Identitätsfunktionen und veröffentlicht die eingefrorene
`AleriaCharacterGenealogy`-Schnittstelle. Der vollständige Familienbestand ist
keine Voraussetzung für die Archivübersicht oder das Laden von Szenenfiguren.

`ensureFamilyMemberships()` lädt den bestehenden `family-membership-index.js`
bei Bedarf. Gleichzeitige Anfragen teilen denselben Vorgang; Fehler dürfen beim
nächsten Aufruf wiederholt werden. Erst nach Erfolg enthält die Schnittstelle
`getFamilyMemberships`. Anschließend wird das bestehende Dokumentereignis
`aleria:character-genealogy-ready` ausgelöst. Es gibt keinen leeren Ersatzresolver.
Die Identitätsfunktionen sind auch vor diesem Nachladen verwendbar.

Das Figurenregister besitzt seinen Lade-/Fehlerzustand in
`characters/character-register-views.js`. Solange der Resolver fehlt, wartet es
vor gemeinsamen Haus-, Such- und Dashboardklassifikationen. Erfolg zeichnet die
aktuelle Ansicht neu; Fehler bieten eine Wiederholung. Ein späteres Ergebnis
setzt weder die gewählte Ansicht noch bearbeitete Figuren zurück.

Der Bootstrap besitzt ausschließlich den delegierten Einstieg
`data-character-genealogy-action="open-import"`. Er lädt den Importcontroller
und ruft dessen exportierte `openImportDialog()` auf. Der Controller besitzt
seine internen Dialogaktionen, DOM-Verwaltung und Abbruchkennungen. Er darf den
Einstieg nicht zusätzlich behandeln oder die Bootstrap-Schnittstelle ersetzen.
Der vollständige leichte Figuren-Suchbestand wird vor dem Dublettenabgleich
geladen, einschließlich lokal ergänzter Akten. Fehlende Daten dürfen nicht als
Beleg für eine neue Person behandelt werden. Vor einer Verknüpfung mit einem
bestehenden Profil wird gezielt dessen vollständige Akte geladen.

Der Import startet mit einer durchsuchbaren Baumauswahl. Nur der gewählte Baum
wird auf Personen abgebildet; die Gesamtsuche wird ausdrücklich angefordert.
Ergebniswechsel ersetzen die maximal 40 Personenzeilen, statt die Liste stetig
zu vergrößern. Die Auswahl für Sammelübernahmen bleibt separat. Mobil besitzen
Liste und Detailvorschau eigene Ansichten mit Rücksprung; Escape schließt den
Import über seinen eigenen Lebenszyklus und erhält den Fokus im Register.

Prüfungen: `genealogy-bootstrap.test.mjs`, `actor-demand-lifecycle.test.mjs`,
`character-register-views.test.mjs` und `character-family-memberships.test.mjs`.
Die Startregressionen sind in `npm run test:startup` zusammengefasst.
