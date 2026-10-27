# Uathneach: Originalbilder, Hausseiten und Hausbios

Die Nutzerkorrektur vom 27. Oktober 2026 priorisiert 23 bereits vorhandene PNGs
aus `D:/0-KI Generierte/01 Bilder/Bilder für Krieger/Uathneach`. Nur Na Fiodhrán,
Tir An Creagán und Dál Siubhrán behalten die neu erzeugten Entwürfe. Sämtliche
26 ursprünglichen Generatorbilder bleiben im Vorschauarchiv erhalten.

Die explizite Auswahl mit den abweichenden Dateischreibweisen steht in
`assets/data/family-sources/uathneach-warriors.source.json`. Import:

```text
python -B Stammbäume/tools/import-uathneach-warriors.py
node "Familien Häuser und Clans/scripts/build-house-content.mjs"
node Gallerien/krieger/scripts/build-catalog.mjs
```

Die Original-PNGs werden bytegleich nach
`assets/images/references/<familyId>/krieger.png` kopiert. Herkunft, Prüfsummen,
Bildmaße und WebP-Vorschauen dokumentiert
`assets/data/source-inventories/uathneach-warriors-2026-10-27.json`.
`assets/js/data/uathneach-warriors.js` ist die erzeugte gemeinsame Bildauswahl.

Die 26 kleinen Autorenmodule unter
`Familien Häuser und Clans/Estryll/Uathneach/` nutzen eine gemeinsame fachliche
Fabrik in `modules/uathneach/uathneach-house-content.mjs`. Sie enthalten nur
bestätigte Namen, Ränge, Sitze und Lehnsherren sowie die Bildbeschreibung.
Die bekannten Lága-Personen bleiben aus der vorhandenen Familienakte verlinkt;
für die übrigen Clans werden keine Personen oder Chroniken erfunden.
Die Klasse ist eine Beschriftung der sichtbaren Ausrüstung, keine Ausbildungsvorgabe.

Hausseiten, Kriegerabschnitte, die kurze Stammbaum-Hausbio und die Vorschau
verwenden dieselbe Auswahl. Biografie-Revision 5 erhält die bisherige
`registryManagedEntitySourceRevision`: Personen, Ehen, Abstammung und eigenständig
bearbeitete oder ausdrücklich entfernte Hausbios bleiben geschützt.

22 bereits importierte Archivgruppen werden über die redaktionellen
`localGroupPrimaries` der Galerieauswahl wieder mit ihren Originalen verbunden.
Ihre bisherigen Bild-IDs und Varianten bleiben erhalten; die Clan-Zuordnung
folgt den bestätigten Hausakten statt alten Dateinamensvermutungen.

Diese Ergänzung wurde lokal vorbereitet; kein Push, Deployment oder administrativer
Firebase-Schreibzugriff gehört zu diesem Auftrag.
