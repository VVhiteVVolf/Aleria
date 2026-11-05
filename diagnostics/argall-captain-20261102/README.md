# Caer Ysgellfor · Argall-Haushalt

Autorenauftrag vom 2. November 2026. Lokaler Stand, nicht veröffentlicht.

Rhydric Argall (1700, 40) ist Dyrwyns elf Jahre jüngerer Vollbruder und
Vetter Uthyrs und Brinthans. Perwyn Argall (1723, 17) ist sein eitler Knappe.
Perwyn bleibt biologisches Kind der geschiedenen Ehe mit Gwenella (1702, 38).
Gwenellas aktive Affäre mit Maelor Ffionydd (1705, 35) trägt exakt den Vermerk
„Durchgebrannt nach Aberon“. Sie hat mit Maelor keine erfassten Kinder.

Vier neue individuelle Porträts wurden mit dem integrierten Bildgenerator im
gespeicherten Anime-Porträtstil erstellt. Perwyn verwendet seine beiden neuen
Elternporträts als Identitätsreferenzen. Originale und Produktionspfade stehen
in `portrait-generation.json`. Alle Bilder wurden tatsächlich angesehen.

Die öffentlichen Personenquellen liegen in
`AleriaAlmanach/modules/fleischsammler-argall/`. Die Familienquelle besitzt die
Beziehungen und den gezielten Quellenabgleich. Die bestehende Beziehungsübersicht
zeigt den Barden über Gwenella einschließlich Affärengrund; die Hauptansicht
zeigt das geschiedene Elternpaar und Perwyn. Es wurden keine künstlichen
Abstammungskanten oder neuen Verwandtschaften für das Diagrammlayout angelegt.

Der begrenzte Figurenimport übernimmt nur diese vier Personen und erhält die
261 übrigen Archivfiguren. Explizite Weltpersonenkennungen haben beim Abgleich
Vorrang vor Namensheuristiken, damit Gwenella auch ohne erfundenen Nachnamen
verknüpft bleibt. Personenbiografien und der neutrale Questkontakt sind getrennt.
Rhydric ist der vierte Questkontakt. Madog Ysgellfor bleibt ziviler Vorratsleiter.
Die Brauerfamilien Bragwen und Eiddfer bleiben eigenständige Familien.

## Prüfung

- `focused-tests.tap`: 70/70 Fach- und Regressionstests bestanden.
- `release-policy-tests.tap`: 26/26 Build-Auswahl- und Releasepolicy-Tests bestanden.
- Figurenimport, Questvorbereitungen und Questkatalog: `--check` bestanden.
- Sieben Kartenorte und das Register mit 765 Wappen: `--check` bestanden.
- Browserprüfung bei 1440 × 1100 und 430 × 1000 bestanden: vier Questkontakte,
  sieben Orte, acht Familienquellen, alle Bilder geladen, kein horizontaler Überlauf.
- Desktopprüfung der Argall-Familie und Gwenellas Beziehungsübersicht bestanden:
  Rhydric, Gwenella, Perwyn und Maelor sichtbar, geschiedene Ehe und Affäre getrennt,
  der genaue Affärengrund lesbar.

Browserbelege liegen in `../fleischsammler-quest-20261102/`, insbesondere
`family-argall.png`, `family-argall-relationships.png` und `contacts-1440.png`.

Der zusätzlich ausgeführte umfassende alte Stammbaum-Testlauf meldete 1191/1246
erfolgreiche Tests und 55 Fehler. Die Namen stehen in `legacy-family-tests.json`.
Keiner der erfassten fehlgeschlagenen Testnamen betrifft Argall. Ohne einen
Vergleichslauf vor dieser Arbeit ist damit keine Aussage über die Ursache oder
das vorherige Bestehen der 55 Fehler bewiesen. Dieser Lauf ist keine vollständige
Releasefreigabe.

Die private Fallakte wurde außerhalb des Repositorys um die vier Personen und
Porträts auf 31 Bilder ergänzt. Der vorherige JSON-Stand bleibt separat erhalten.
Private Täterdaten sind keine öffentliche Buildquelle.
