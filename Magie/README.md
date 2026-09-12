# Magiecodex

Statische Almanach-Seite: `Magie/index.html`. Erreichbar über das bestehende Seitenregister und den Weltpfad **Magie**. Vite bindet die Seite als eigenen Eingang ein; Netlify liefert sie auch direkt aus dem Repository aus.

## Verantwortung

- `index.html`: redaktionelle Kapitel und Schuleinträge; der markierte Domänenbereich wird aus den Fachmodulen erzeugt. Auch ohne JavaScript lesbar; Details werden nativ geöffnet.
- `modules/book-shell`: Rahmen, Navigation, Titelseite und responsive Grundstruktur.
- `modules/book-shell/magic-ornaments.css`: rein dekorative Schriftornamente; verwendet die bestehenden Fontpakete von Arcana und Nharazim. Die Zeichen sind für Screenreader ausgeblendet und stehen außerhalb von Überschriften und Fließtext.
- `modules/catalog`: lokale Suche, Filter, Ankerauflösung und Druckzustand. Suchbegriffe kommen aus dem Inhalt und optionalen `data-keywords`; kein zweiter Inhaltskatalog.
- `modules/lore`: Darstellung der erklärenden Kapitel.
- `modules/domains`: Domänenzuordnung und Vorlage. Namen, Gruppen, Verweise und die Symbole aller 34 celestialen und infernalen Gottheiten stammen über das bestehende Inhaltsrepository aus `Religionen`; nur die magische Zuordnung gehört diesem Modul. Geweihte und Gefallene werden nicht als Haupt- oder Untergottheiten umgedeutet.
- `elementarismus/index.html`: erzeugtes Verzeichnis mit 72 Zaubern, 120 höheren Formen und 42 passenden vorhandenen BG-Icons; fehlende Icons bleiben leer.
- `modules/spell-list`: Darstellung, Suche, Filter und Direktlinks der Zauberlisten. Die Daten stammen aus `AleriaAlmanach/modules/spell-catalog`; Archiv, Charakterbogen und Kampf verwenden denselben versionierten Katalog. Regelabgleich, Grenzen der automatischen Auflösung und Mini-Tests stehen in [docs/elementarismus/README.md](docs/elementarismus/README.md).
- `assets`: erzeugte Embleme, elf eigene Schulicons in `schools/`, sieben eigene Druidenicons in `druidic/` und die beiden Icons für sakrale und infernale Magie in `bound/`, jeweils im Oblivion-Stil. Die jeweiligen `image-prompts.json` dokumentieren die eingebauten Imagegen-Aufrufe.
- `docs`: übergebene Altquelle und dokumentierte redaktionelle Entscheidungen.

Die Hauptseite bleibt ein Weltkundecodex. Die Zauberverzeichnisse teilen ihre Daten mit dem vorhandenen Charakterbogen-Archiv und Kampfresolver; sie besitzen keinen eigenen Firebase-Zugriff. Bestehende Charakterzauber werden nicht anhand ihrer Namen überschrieben.

## Pflege und Prüfung

Neue Einträge als `<details data-magic-entry>` innerhalb des passenden `data-tradition`-Kapitels ergänzen. Stabile IDs erlauben direkte Links wie `index.html#cogniturgie`. Kapitel- und Titelzahlen bei Erweiterungen aktualisieren. Alle Icons und Verweise lokal halten.

Domänen in `modules/domains/magic-domain-assignments.mjs` pflegen und `npm --prefix AleriaAlmanach run build:magic` ausführen. `check:magic` prüft den Abgleich; der Produktionsbuild führt ihn automatisch aus. Der Domänengenerator ändert ausschließlich den markierten Bereich in `index.html`; `build-spell-lists.mjs` erzeugt das Zauberverzeichnis aus dem gemeinsamen Katalog. Neue Gottheiten ohne Zuordnung oder verwaiste Domänen führen zu einem Fehler.

Suche und Direktlinks öffnen benötigte Domänenregister. Nach dem Zurücksetzen der Suche und nach dem Drucken wird der vorherige Öffnungszustand wiederhergestellt.

Vom Workspace aus: `node --test Magie/tests/*.test.mjs AleriaAlmanach/tests/dashboard-rendering.test.mjs`.
Vollständiger Build: `npm --prefix AleriaAlmanach run build`.
