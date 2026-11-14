# Gwynthor-Unterwelt: Die Reine Ratte und Rattenweg

Lokaler Auftrag vom 14. November 2026. Beide Module stehen als Geschwister unter
`Völker & Kulturen / Cenyr / Celtigerns Wacht / Llamreis Ankunft / Bannkreis Gwynthor / Gwynthor-Stadt / Gwynthor-Unterwelt`.
Die bereits veröffentlichten Pferdehändler bleiben direkt unter Gwynthor-Stadt.

Die Reine Ratte umfasst neun Inhaltsseiten: Hauptseite, Hausbio, Hierarchie,
sechs Dienstleistungen sowie Waschsalon, drei private Stuben und Vorratskeller.
Der Rattenweg enthält ausschließlich vier interaktive Seiten: Kanaleingang,
Schlickmarkt, Blinder Arm und Dochtwinkel. Alle neun Räume haben eigene stabile
Kommentar-Threads. Keine zusätzliche gemeinsame Kommentarseite.

Cadwren Brithog und zwölf Bedienstete sind eigenständige neue Figuren. Die sechs
Zuberdirnen sind 23–30, der Laufbursche ist 20; sämtliche Figuren sind erwachsen.
Zwei Mägde versorgen Wasser, Feuer und Leinen, der Laufbursche hilft; drei
Aufpasser stammen aus Aldrimar, Leitheach und dem untergegangenen Ceitheach.
Keine neuen Häuser, Stammbäume oder erfundenen Verwandtschaften.

Die private Chiffre ist auf ausdrückliche Rückfrage ein Zugang innerhalb der
Spielwelt. Ihr Wortlaut wurde weder bestimmt noch gespeichert. Das ist keine
technische Seitensperre. Weitere Ausgänge werden nur erzählerisch angedeutet;
es gibt keine leeren Folgemodule oder technischen Verknüpfungen zu erfundenen Orten.

## Zuständigkeiten

- `underworld-people.mjs`: Personal, Identitäten, Biografien und aktive Porträts.
- `underworld-rooms.mjs`: neun Räume und ihre ursprünglichen Bildaufträge.
- `rat-hierarchy.mjs` / `rat-services.mjs`: vorhandene Hierarchie-/Dienstvorlagen.
- `underworld-modules.mjs`: Seiten, Bilder, Threads und Kategorie.
- `underworld-characters.mjs`: Einzelprofile ohne Spielwerte oder Verwandtschaft.
- `underworld-data.js`: erzeugte lokale Archivregistrierung; nicht direkt ändern.

`scripts/build-gwynthor-underworld.mjs [--check]` erzeugt Registrierung und zwei
Importpakete. `scripts/build-underworld-character-exports.mjs [--check]` erzeugt
13 Einzelexporte. Die lokale Datenbankaufnahme erfolgte ausschließlich mit dem
bestehenden begrenzten Importer. `scripts/check-underworld-characters.mjs` prüft
sie ohne Schreibmodus. Keine Firebase-, Inventar-, Geld- oder Kampfänderungen.

30 aktive Motive: 13 Porträts, zehn Ortsbilder, ein Schild und sechs Serviceicons.
38 Fassungen im Hauptmanifest und drei neue Vergleichsentwürfe mit vollständigen
Prompts/Originalen bleiben unter `docs/art/gwynthor-underworld-20261114/` erhalten.
Aktiv: Cadwren v5, bytegleich aus dem ausdrücklich ausgewählten zweiten neuen
Entwurf übernommen; alle drei Aufpasser v2 mit gebrauchter Söldnerrüstung;
Schlickmarkt v2 mit dichter Ragged-Flagon-Atmosphäre.
Die Art-Dokumentation wird über die bestehende Publikationsrichtlinie ausgeschlossen.

Aufnahme: `scripts/admit-gwynthor-underworld-art.mjs --write|--check`.
Native Prüfgruppe: `gwynthor-underworld`. Browser:
`tests/gwynthor-underworld.browser.mjs` verwendet die echte lokale Anwendung mit
isoliertem Kontext, Fixture-Backend und blockierten externen Writes.
Belege: `diagnostics/gwynthor-underworld-20261114/`.
