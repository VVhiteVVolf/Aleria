# Inventarinteraktion in Szenen

Der Inventarbeutel öffnet Geldbewegungen, Gegenstandsübergaben und den
bestehenden Szenenhandel. Geld kann an eine Figur übertragen oder über
„Ausgeben · Bank“ ohne empfangende Figur ausgebucht werden. Die Bank ist
kein Charakterkonto und besitzt keinen Bestand.

## Zuständigkeiten

- `scene-inventory-ui.js` und `styles/scene-inventory.css`: Dialog, Modus,
  Lade-/Sperrzustand und lebensdauergebundene Modulmontage.
- `scene-inventory-people.js`: wiederverwendete Avatarwähler und
  Szenenteilnehmerauflösung, Suche, Szenenfilter und priorisierte Vorschläge.
- `scene-inventory-money-ui.js`: Geldvorschau, Gegenwerte und Schnellbeträge.
- `scene-inventory-money.js`: gemeinsame reine Pfennigrechnung. Ein Kupfer
  entspricht 100 Eisenpfennig; 90 Pfennig aus einem Kupfer lassen zehn
  Pfennig übrig. Es werden weder Gegenstände noch Kampfprofile normalisiert.
- `scene-inventory-money-client.js`: vorhandener Firebase-Kontext,
  Geldrequest und nach UID/Thread getrennte offene Vorgänge.
- `inventory-transactions/inventory-transaction-submission.js`: gemeinsamer
  Wiederholungsablauf für Geld und den bestehenden Szenenhandel. Der
  Handelsadapter und seine bisherigen Sitzungsschlüssel bleiben kompatibel.
- `scene-inventory-state.js`, `scene-inventory-events.js`: klassische
  Inventaransicht, Formularadapter und Buchungs-/Aktualisierungsablauf.
- `firebase/functions/src/mechanics/commit-scene-money-transfer.js`: atomare
  Geldbuchung hinter dem vorhandenen Callable `commitInventoryTransfer`.

## Buchungsregeln

Geldbeträge bestehen aus positiven ganzen Münzmengen und werden intern in
ganzen Eisenpfennigen geprüft. Die Vorschau verwendet dieselbe Rechnung
wie der Server. Gespeicherte Geldformate bleiben lesbar; Teilpfennige,
negative Werte, Überläufe und unzureichendes Guthaben werden abgewiesen.

Jede angemeldete Person kann für die gewählten Figuren Geld bewegen.
Der Server prüft die echten Geldbestände, erwarteten Inventarrevisionen
und Kampfsperren. Er schreibt ausschließlich Geldfelder,
Inventarrevision und Aktualisierungszeit. Ein privater Transaktionsbeleg
verhindert doppelte Buchungen bei Wiederholung.

Geld erzeugt keine Szenenkommentare, Bilder, Flavourtexte,
Szenenbenachrichtigungen, Aktivitätsstempel oder Scrollsprünge. Der Client
aktualisiert nur den Inventarbestand. Historische Belege und der bisherige
Gegenstandsweg bleiben erhalten.

Vor dem ersten Aufruf wird die genaue Buchung im Sitzungsspeicher
festgehalten. Bei unklarer Antwort bleiben Betrag, Ziel und Vorgangskennung
unverändert. Wiederöffnen oder Neuladen bietet denselben Vorgang zur
erneuten Prüfung an. Ein definitiver Fehler gibt eine neue Buchung frei.

## Prüfung und Veröffentlichung

Fachtests: `scene-inventory-money.test.mjs`,
`scene-inventory-money-ui.test.mjs`, `scene-money-submission.test.mjs`,
`scene-inventory-transfer.test.mjs` sowie die bestehenden Handelsprüfungen.
Der echte Controller wird mit `scene-inventory-money.browser.mjs` und
abgeschottetem Fixturetransport auf Desktop und Mobil geprüft.

Backendfälle liegen in `firebase/functions/tests/inventory-transfer.test.js`
und `tests/integration/inventory-transfer.integration.mjs`. Letztere erlauben
nur den lokalen Demo-Emulator. Produktionsinventare sind kein Testmaterial.

Frontend und der aktualisierte Callable `commitInventoryTransfer` gehören
zusammen in den Release. Die bestehenden Firestore-Regeln und Indizes
benötigen keine Änderung. Methoden und Belege:
`diagnostics/scene-inventory-money-20261105/`.
