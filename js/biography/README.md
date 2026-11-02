# Öffentliche Biografien

Charakterbogen, Biographie-Template und Stammbaum verwenden denselben Seitenaufbau
aus `AleriaAlmanach/modules/biography/biography-card-rendering.js` und dieselbe
Darstellung aus `AleriaAlmanach/styles/module-page-biography.css`. Die jeweiligen
Adapter behalten ihre eigene Speicherung, Bildnavigation und Inhaltsprüfung.

Der Bearbeitungsmodus gliedert Inhalte in aufklappbare Kapitel. Lange
Beschreibungen erhalten mehrzeilige Eingabefelder; Absatz, Zwischentitel und
Trenner bleiben beim Speichern erhalten. Auf schmalen Bildschirmen wechseln die
Editoren zwischen Bearbeitung und Vorschau. Import, Export und Entfernen bleiben
im Stammbaum über „Weitere Aktionen“ erreichbar.

## Redaktion und Zuordnungen

`sources/public-biographies.json` enthält den abgeglichenen öffentlichen Bestand
vom 2. November 2026: 72 Personenbios, davon 13 mit belegten Ausbildungspersonen.
63 Bios sind mit bekannten Charakterakten und 63 mit Stammbaumpersonen verbunden;
acht Zuordnungen verbinden bestehende Personen- beziehungsweise Paarmodule.
Ensemble- und Hausbiografien werden nicht in Einzelpersonenbios umgewandelt.

Die Ausbildungsbelege und ihre vorhandenen Porträts stehen zusätzlich in
`sources/knight-training.json`. Idwals zwei Mündelschaften wurden vom Nutzer
ausdrücklich bestätigt: zuerst Mervyn Gwyvern, danach Parzifal Arth. Unbekannte
Ausbildungspersonen bleiben leer. Private Dossiers gehören nicht in diesen
Bestand.

```powershell
node js/biography/build-public-biographies.mjs
node js/biography/build-public-biographies.mjs --check
```

Der Generator erstellt `public-biographies.generated.js`. Dieser schreibgeschützte
Katalog überbrückt die vorhandenen klassischen Almanach-Skripte und die
ES-Module des Stammbaums. Quellen und Generator werden im Repository erhalten;
das Quellenverzeichnis wird nicht statisch veröffentlicht.

Der Katalog ist kein zweites Speicherziel für Online-Bearbeitungen. Er ergänzt
fehlende Bios anhand ausdrücklich erfasster Identitäten. Eine vorhandene
Erzählfassung erhält die redaktionelle Gliederung nur dann, wenn ihr narrativer
Fingerabdruck einer überprüften Ausgangsfassung entspricht. Später individuell
überarbeitete Prosa bleibt erhalten. Fehlende Ausbildungskarten dürfen ergänzt
werden; eine ausdrücklich leere Liste `knightMentors: []` bleibt leer.
Eine ausdrücklich gesetzte Weltperson-ID hat Vorrang vor älteren Charakter- und
Stammbaum-Aliasen. Modulzuordnungen gelten ausschließlich für ihre konkrete
Biografieseite, damit zusätzliche Seiten keine fremden Ausbildungskarten erhalten.

Eine bewusst entfernte Stammbaumbio erhält den Marker `disabled: true`. Diesen
Marker erhalten auch Veröffentlichung und Normalisierung, damit der Katalog die
gelöschte Bio nicht wieder einblendet. Neu angelegte oder importierte Bios
ersetzen diesen Marker mit ihren tatsächlichen Daten.

## Prüfung

```powershell
cd AleriaAlmanach
npm run test:biographies
node tests/biography-redesign.browser.mjs
```

Die Fachtests prüfen den Import-/Export- und Veröffentlichungsweg über den
gesamten Bestand, die geordneten Mündelschaften, sichere Bildpfade, erhaltene
Porträtbeschriftungen sowie den Schutz eigener Texte und bewusster Löschungen.
Der Browsertest verwendet lokale Seiten ohne Live-Konto und blockiert externe
Schreibzugriffe. Er prüft Desktop und Mobilansicht, Textformatierung,
Vorschauwechsel, Kapitel und Ausbildungspersonen im Inline-Editor.

Prüfbelege liegen unter `diagnostics/biography-redesign-20261102/`; Browserbilder
liegen in `.tmp/biography-redesign-20261102/`. Der abschließende Browsertest
bestätigt H4-/Trenner-Roundtrips, mobile Vorschauwechsel und Inline-Mentoren ohne
JavaScript-Fehler. Die mobilen Formularbreiten entsprechen ihren Scrollbreiten
(Charakter 356 px, Stammbaum 390 px); es gibt keinen horizontalen Überlauf.
`browser-verification.json` dokumentiert den geprüften Bildsatz.
Der große Stammbaum-Testlauf hat
55 bestehende Fehler unter 1.246 Prüfungen. Ein Vergleich mit den unveränderten
Bio-Produktdateien aus `HEAD` zeigt dieselbe Fehlermenge; durch die
Bio-Überarbeitung kamen keine hinzu.

Diese Arbeit enthält keine Veröffentlichung und keine Firestore-Schreibzugriffe.
