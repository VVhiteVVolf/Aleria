# Gemeinsame Hauszuordnung im Weltatlas

Die sichtbaren Hausregister für Städte, Ortschaften und Herrschaften werden beim Laden aus ihrer redaktionellen Auswahl und den bestätigten Familienplatzierungen zusammengesetzt. Es wird kein vollständiger Stammbaum im Browser geladen; die gemeinsame Projektion enthält ausschließlich benötigte Registerangaben.

- `source-reader.mjs` liest die vorhandenen Familien-, Hausseiten-, Orts- und Territorialregister beim Build. Die dynamischen Celtigerns-Ortsdefinitionen gehören zur Ortsregistry und werden mitgelesen. Genealogien, Personen, Quellenrevisionen und Spielstände werden nicht geändert. Für bereits strukturierte Territorialdaten wird der bestehende Datenprovider kurz bereitgestellt und anschließend vollständig wiederhergestellt.
- `house-placement.mjs` verantwortet geografische Auswahl, ausdrücklich belegte Zweitsitze und zusätzliche Platzierungen, eindeutige Altkennungen und Ergänzung fehlender Karten. Lehnsherren und Dienstbindungen sind keine Wohnorte. Gleichnamige Häuser in verschiedenen Ländern bleiben unabhängig. Ein Altverweis ohne Kennung wird nur anhand eines einzigen unabhängig bestätigten örtlichen Hauses verbunden. Mehrdeutige Fälle bleiben offen.
- `build-house-directories.mjs` erzeugt `house-directories.generated.json`. `--check` vergleicht ohne Schreibzugriff. Nur gegenüber den bisherigen Registern abweichende Projektionen werden ausgegeben. Vorhandene Gruppen und präzisere Angaben bleiben erhalten; bestätigte fehlende Lehnsherren ersetzen ausschließlich leere Angaben beziehungsweise Auslassungspunkte.
- `house-projection.mjs` ist die kleine browserfähige Übergabe. Die jeweiligen Loader veröffentlichen die vollständigen Daten vor ihrem bestehenden `data-ready`-Ereignis. Das gemeinsame Häuser-UI bleibt für Darstellung, Suche und Ansichtswechsel zuständig. Eine leere Folgemeldung entfernt alte Karten statt den vorherigen Ort zu zeigen.

Die Sichtbarkeitsgrenze stammt aus dem bestehenden sichtbaren Bestand: aktive Hausseiten und ausdrücklich bereits verwendete Registerverweise. Eine gemischte lokale Familienregistry allein erlaubt keine zusätzliche öffentliche Listung. Verknüpfte Ursprungsakten werden nicht pauschal an aktuelle Exilorte kopiert. Ein Haushalt ohne gesicherten Ortsbezug erhält keinen erfundenen Wohnort.

Städte zeigen ihre Einwohnerhäuser und belegten Zweitsitze. Geografische Baronie-/Herrschaftsseiten können ihre eigene, genau passende Region ergänzen. Länder und Grafschaften werden nicht mit sämtlichen kleineren Häusern ihrer Unterherrschaften aufgefüllt. Ein abweichender redaktioneller Geltungsbereich steht ausdrücklich in den verantwortlichen Seitendaten als `view.familyScope`; Celtigerns Wacht benennt dort Llamreis Ankunft und behält seine großen und historischen Häuser.

Die kanonische Ortskennung `mwyncreig` besitzt im zuständigen Celtigerns-Katalog den belegten früheren Schreibalias `mwyncraig`. Ortslinks und Zweitsitzzuordnung verwenden dadurch denselben Auflöser, ohne Familienprofile oder historische Texte umzuschreiben.

```powershell
node shared/world-directory/build-house-directories.mjs
node shared/world-directory/build-house-directories.mjs --check
node --test --experimental-test-isolation=none shared/world-directory/tests/house-placement.test.mjs shared/world-directory/tests/catalog-coverage.test.mjs
node shared/world-directory/tests/directories.browser.mjs
```

Der Browserlauf startet eigene Loopback-Server und einen frischen Chrome-Kontext, erlaubt nur lokale GET-Anfragen und legt einen neuen datierten Ausgabeordner an. Er prüft alle geänderten Ortsprojektionen, repräsentative Herrschaften, exakte IDs/Links, lokale Wappen, Desktop/Mobil, Suche, Aktualisierungen, alte Ortsaliases und unbekannte Kennungen. Das normale Territory-Releasegate prüft Builder und Modultests; Builder und Quellenleser sind keine statischen Laufzeitressourcen.
