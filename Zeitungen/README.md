# Zeitungssystem

Das Zeitungssystem trennt wiederverwendbare Seitendarstellung, Ausgabedaten und Artikeltexte voneinander.

## Aufbau

- `zeitung.html` zeigt eine komplette Ausgabe mit Artikelkarten, Artikelarten und Redaktion.
- `artikel.html` zeigt einen einzelnen vollständigen Artikel samt Autorenportrait und Blattangaben.
- `assets/js/newspaper-registry.mjs` registriert alle Zeitungen und Ausgaben.
- `data/<ausgabe>/edition.mjs` enthält Blattdaten, Autoren, Artikelarten und das Artikelverzeichnis.
- Das Standard-Erscheinungsdatum folgt dem Aleria-Kalender: `18. Tag, Dritter Monat, Jahr 1740`.
- `data/<ausgabe>/articles/` enthält ausschließlich die eigentlichen, bereinigten Artikeltexte.
- `data/<ausgabe>/assets/` hält Logo und Portraits lokal vor.

Eine Ortsseite verlinkt ihre Ausgabe über den `href` des Mediums `zeitung-png`. Für eine neue Ausgabe wird ein eigener Datenordner angelegt und genau ein Eintrag im Zeitungsregister ergänzt. Die Rendering-Module bleiben unverändert.

## Lokale Ziele

- Gwynthorer Ausgabe: `/Zeitungen/zeitung.html?zeitung=schwarzbote-gwynthor`
- Einzelartikel: `/Zeitungen/artikel.html?zeitung=schwarzbote-gwynthor&artikel=<artikel-id>`

Die alten HTML-Artikel können bei Bedarf mit `tools/import-legacy-article.mjs` in bereinigte Inhaltsfragmente überführt werden. Der Importer entfernt alte Layouttabellen, Inline-Stile und externe Links; die Laufzeitseite akzeptiert zusätzlich nur eine kleine Liste semantischer Textelemente.
