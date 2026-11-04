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
Die vorhandenen Figuren werden vor dem Dublettenabgleich geladen; fehlende Daten
dürfen nicht als Beleg für eine neue Person behandelt werden.

Prüfungen: `genealogy-bootstrap.test.mjs`, `actor-demand-lifecycle.test.mjs`,
`character-register-views.test.mjs` und `character-family-memberships.test.mjs`.
Die Startregressionen sind in `npm run test:startup` zusammengefasst.
