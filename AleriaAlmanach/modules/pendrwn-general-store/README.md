# Zum Vollen Korb · lokaler Entwurf

Cadwgan Pendrwn (1684), Idwals ältester Sohn, führt den Gemischtwarenhandel gemeinsam mit seinem Vater. Mabli (1687), Rhun (1710) und Tesni (1715) bilden seinen kleinen Familienzweig. Elen, Iestyn und Cadoc sind die drei Angestellten; Fflam ist ein Cenyric-Kater mit vorhandenem Bestiarium-Verweis.

Der Markt der Fortuna beliefert den Laden unmittelbar. Haus Pendrwn dient dem Haus Draig. Meilyrs und Gweniths bestehende Linien bekommen keine Ladenrollen; ihre Beziehungen, Lebensdaten und bisherigen Weltpersonen-IDs bleiben erhalten. Ergänzte Porträts von Meilyr und Gwenith werden über ihre vorhandenen gemeinsamen Ehedefinitionen auch in den Gegenakten verwendet. Caradog Draenmelyn und Eirwen Swyll bleiben ohne neu erzeugte Porträts.

## Inhalt und Verantwortung

- `store-people.mjs`: kleiner Händlerzweig, Ladenpersonal und Bildverweise.
- `store-catalog.mjs`: Ableitung aller 47 Standardwaren aus dem gemeinsamen Katalog; zehn zusätzliche Waren. Standardpreise, Einheiten und Preisspannen werden übernommen, Bilder nur für diesen Laden ergänzt.
- `store-hierarchy.mjs`: Verkauf, Logistik, Sicherheit und Haustiere.
- `store-rooms.mjs`: Verkaufsraum, Hinterstube und Warenlager.
- `store-module.mjs`: acht Inhaltsseiten; der Almanach ergänzt die Kommentarseite.
- `store-data.js`: erzeugte Einbindung, nicht von Hand bearbeiten.
- `Stammbäume/assets/js/data/pendrwn-store-branch.js`: ergänzt ausschließlich Cadwgans Zweig und Idwals Ladenrolle. Vorhandene Abstammungen und Ehen werden erhalten.

## Erzeugen und prüfen

Vom Projektstamm aus:

```powershell
node AleriaAlmanach/scripts/build-pendrwn-store.mjs
node AleriaAlmanach/scripts/build-pendrwn-store.mjs --check
```

Die lokalen Modul- und Stammbaumpakete liegen unter `Charakter Archiv Exporte/Module/Zum Vollen Korb/`. Dieser Build veröffentlicht nichts und greift nicht auf Firebase zu.

## Bilder und geprüfter Stand

Alle 74 endgültigen Bilder wurden mit dem eingebauten ImageGen erzeugt. 57 Inventarbilder besitzen den unveränderten erzeugten PNG-Alphakanal; 13 Porträts einschließlich Katze und vier Ortsbilder sind deckend im 2:3-Format. Die fünf ergänzten Porträts der alten Pendrwn-Linie liegen im bestehenden Stammbaum-Porträtordner; die restlichen Bilder unter `AleriaAlmanach/assets/pendrwn-general-store/`.

Vollständige Prompts, tatsächliche Referenzdateien, Quellpfade und Prüfsummen stehen dort in `image-prompts.json`, `image-results.json` und `image-validation.json`. `quality-check.json` dokumentiert den bestandenen Desktop-/Mobiltest: sämtliche Seiten und Bilder, vier Hierarchiereiter, Katalogfilter und Suche, Preisbereich, Editor-Übernahme, einklappbare Szenentexte und erhaltene bestehende Familienbeziehungen. Externe Schreibzugriffe waren im Browsercheck gesperrt.

**Stand: lokal. Nicht gepusht, nicht veröffentlicht, nicht in Firebase importiert.**
