# Lesbare Inventarbücher

`document-item-model.js` löst die kanonische `documentRef: { id }` einer Itemdefinition auf und verwendet den vorhandenen Werkstattleser. Der Itembaukasten kann solche Verweise anlegen. Inventarkarten öffnen das Dokument über einen normalen Link; Lesen verbraucht den Gegenstand nicht.

Ein Doppelklick auf eine Inventarzeile verwendet denselben instanzgebundenen Leselink. Gegenstände ohne Dokument öffnen stattdessen ihre vorhandene Itemkarte. Einzelklick und separate Schaltflächen behalten ihre Aktionen. Die Gestaltung des öffentlichen Lesepults liegt getrennt von Buchinhalt, Werkstatt und Exporten in `DokumentenWerkstatt/css/document-reader.css`.

Die Adresse eines besessenen Buchs enthält Dokument-ID, Inventarart, aktuelle Figuren-ID und Besitzinstanz. Die Zugriffsentscheidung trifft ausschließlich `firebase/functions/src/document-notes/document-item-notes.js`, einschließlich aktueller Inventarzugehörigkeit und kanonischer Itemversion. Besitzer und berechtigte Spielleitung können lesen und schreiben. Ein veralteter Besitzerlink verliert nach Übergabe den Zugriff.

Gemeinsame Notizen liegen getrennt in `item_document_notes`. Ihre Identität besteht aus Dokument-ID und stabiler Besitzinstanz; sie folgen dem Buch bei einer Übergabe. Speichern verwendet Revisionen und gebundene Wiederholungskennungen. Ein Konflikt erhält den lokalen Entwurf und erlaubt den Vergleich mit dem gespeicherten Stand. Die Funktion ändert keine Inventar-, Geld- oder Kampfwerte. Direkter Firestore-Zugriff bleibt durch die vorhandene abschließende Sperrregel ausgeschlossen; die Sammlung ist im bestehenden Itembackup enthalten.

Der eigentliche Controller, Firebase-Adapter und die Exportvariante gehören nach `DokumentenWerkstatt/js/notes/`. Die Werkstatt zeigt eine ausdrücklich nicht bearbeitbare Vorschau. Im Leser sind Notizen bedienbar. Ein Dokument ohne konkrete Besitzadresse sowie ein heruntergeladenes eigenständiges HTML besitzen ausschließlich persönliche Browsernotizen.

`bookPageSides` und `notesPage` sind optionale Felder des Werkstattschemas 3. Alte Dokumente bleiben Schema 2. Der Publisher weist Aktualisierungen von Schema-3-Büchern durch ältere Clients zurück, damit Seitenpositionen und Notizseite erhalten bleiben. Die vorhandene Bestiarium-Buchengine verantwortet weiterhin Navigation und Seitenteilung.

Prüfungen: `tests/inventory-documents.test.mjs`, `tests/inventory-documents.browser.mjs` und `firebase/functions/tests/document-item-notes.test.js`. Der Browserlauf verwendet die echte Oberfläche, getrennte Kontexte und den echten Backendkern mit einer lokalen Transaktionsfixture; er speichert keine Produktivdaten.
