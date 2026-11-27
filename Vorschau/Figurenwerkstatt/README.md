# Entwurfswerkstatt

Die Werkstatt liegt unter [Vorschau/Figurenwerkstatt/](index.html) und ist von der
[Vorbereitungsübersicht](../index.html) aus erreichbar. Die Entwurfsmappe
speichert Figuren, Häuser, Orte, Fraktionen, Kreaturen und Gegenstände im
Browser. Für den Austausch kann man die
ganze Mappe oder einen einzelnen Entwurf als JSON herunterladen. Die Lesefassung
zeigt die ausgefüllten Abschnitte zusammenhängend.

Unter „Musterbeispiele“ stehen sechs verknüpfte Entwürfe rund um Gelynwacht.
Zur Musterfigur Mared Celynbarth und ihrem Haus kommen der Ort Gelynwacht,
der Bund der Uferlaternen, Kiesel und das Fährlicht von Gelynwacht. Beim
Öffnen eines dieser Muster ergänzt die Werkstatt die fehlenden Entwürfe.
Neu aufgearbeitete Musterbilder werden bei den bisherigen Standardlinks
übernommen. Bearbeitete Texte, Festlegungen und eigene Bildadressen bleiben
in den gespeicherten Fassungen erhalten.

Caer Ysgellfor lässt sich als eigener Ortsentwurf öffnen. Der Pitch verbindet
den Kartenpunkt und die sechs belegten Bewohner mit einer ersten Ansicht
der Straßenfestung. Architektur und Szeneneinstieg sind Vorschläge. Die
vorhandenen Porträts von Rhydric und Perwyn sind im Bewohnerreiter verlinkt.

Über „Neuer Entwurf“ lässt sich jede Vorlage in derselben Mappe anlegen. Alle
Vorlagen bieten drei verlinkbare Bildvarianten mit Vorschau, Großansicht und
Favorit sowie Beziehungen, Entscheidungen, Zeitleiste, Quellen und offene Fragen.

- Figuren und Häuser behalten ihre Profiltexte und acht Merkmale. Für Figuren
  gibt es Gefährten, Fähigkeiten und Werdegang, für Häuser Familie, Gefolge,
  Erbfolge, Sitze, Besitz und Besonderheiten.
- Orte sammeln Karten, Ortspunkte mit Bild, Bewohner, Wege, Versorgung und
  Schauplätze.
- Fraktionen erfassen Führung, Ränge, Aufnahme, Stützpunkte, Mittel und
  Bündnisse.
- Kreaturen erfassen Art, Lebensraum, Verhalten, Bindungen, Merkmalsicons und
  Fähigkeiten.
- Gegenstände halten Ausführungen, Herstellung, Einsatz, Wirkungen, Wert und
  Besitz fest.

Beziehungsfelder akzeptieren Namen und Arbeitsnamen. Die Registersuche verbindet
einen Eintrag über seine Kennung mit einer Almanachfigur, einem Haus oder einem
Entwurf einer beliebigen Vorlage in der Mappe. Die neuen Vorlagen unterstützen
auch freie Register- und Quellenlinks bei Beziehungen. Beim Import mehrerer zusammengehöriger Entwürfe
bleiben ihre Beziehungen auch bei Kennungskollisionen zusammen. Die Vorschau
erwartet einen direkten HTTP-/HTTPS-Bildlink oder einen Aleria-Seitenpfad.
Das Vorschauformat kann pro Bild gewählt oder aus dem Bild ermittelt werden.
Neue Kreaturenentwürfe starten mit Porträts in 2:3, Fraktionen und Gegenstände
mit quadratischen Bildern in 1:1 und Orte mit Ansichten in 3:2. Die Vorschau
zeigt jeweils das vollständige Bild.

Unter „Als Hauptbild festlegen“ wird eine Bildvariante mit ihrer Bezeichnung,
ihrem Link und ihrem Vorschauformat gespeichert. Das Hauptbild erscheint im
Steckbrief und in der Lesefassung. Der Reiter „Entscheidungen“ sammelt
Grundentscheidungen mit Festlegung, Alternativen und Begründung. Vorgegebene
Themen übernehmen passende Angaben aus dem Entwurf. Eine festgelegte
Entscheidung lässt sich zum Überarbeiten erneut öffnen.

Das Entscheidungsblatt fasst Hauptbild, Festlegungen und offene Vorschläge als
Textdatei zusammen. Der JSON-Export enthält die vollständige Entwurfsfassung
mit Entscheidungen und Bildfestlegung. Die Werkstatt liest ihre JSON-Versionen
1 und 2 weiterhin und exportiert alle sechs Vorlagen als Version 3.

## Zuständigkeiten

- `concept-schema.mjs` registriert die Vorlagen. Reiter und Listen stehen in
  den Vorlagendateien. `concept-template-sections.mjs` enthält die gemeinsam
  verwendeten Felder und Abschnitte.
- `concept-drafts.mjs` validiert das versionierte Format und erhält
  Querverweise beim Austausch. `concept-store.mjs` besitzt den eigenen
  Speicherschlüssel und fasst Änderungen zwischen Tabs nach Möglichkeit mit
  Web Locks zusammen.
- `concept-catalogs.mjs` liest den vorhandenen Figurenindex, die sichtbaren
  Hausprojektionen, die veröffentlichten Stammbäume und die Merkmalsbilder bei
  Bedarf. Die Verknüpfungen verwenden die jeweiligen vorhandenen Seitenrouten.
- `concept-editor.mjs` und `concept-reading.mjs` besitzen die Ansichten.
  `concept-events.mjs` bindet deren delegierte Ereignisse. `workshop-app.mjs`
  verbindet Ansicht, Dialoge und Speicher.
- `concept-decisions.mjs` beschreibt die Festlegung und das Entscheidungsblatt.
  `concept-decision-view.mjs` rendert den Reiter und die Entscheidungsanzeigen.
- `concept-example-catalog.mjs` besitzt die Musterkennungen und Vorschaubilder.
  `concept-examples.mjs` fügt die Muster hinzu und aktualisiert bestehende
  Standardbildlinks. Die Muster und der Orts-Pitch haben eigene Datenmodule.

Die Werkstatt verwendet lesende Registerzugriffe und lokale Entwurfsdaten.
Das Layout nutzt Pergament, Leder, Messingrahmen und Schaltflächen aus den
gemeinsamen Materialien der Herrschaftswerkstatt.

```powershell
node --test --experimental-test-isolation=none Vorschau/tests/figurenwerkstatt.test.mjs Vorschau/tests/preparation-overview.test.mjs
node Vorschau/tests/figurenwerkstatt.browser.mjs
```
