# Magiecodex

Statische Almanach-Seite: `Magie/index.html`. Erreichbar über das bestehende Seitenregister und den Weltpfad **Magie**. Vite bindet die Seite als eigenen Eingang ein; Netlify liefert sie auch direkt aus dem Repository aus.

## Verantwortung

- `index.html`: redaktionelle Kapitel und Schuleinträge; der markierte Domänenbereich wird aus den Fachmodulen erzeugt. Auch ohne JavaScript lesbar; Details werden nativ geöffnet.
- `modules/book-shell`: Rahmen, Navigation, Titelseite und responsive Grundstruktur.
- `modules/book-shell/magic-ornaments.css`: rein dekorative Schriftornamente; verwendet die bestehenden Fontpakete von Arcana und Nharazim. Die Zeichen sind für Screenreader ausgeblendet und stehen außerhalb von Überschriften und Fließtext.
- `modules/catalog`: lokale Suche, Filter, Ankerauflösung und Druckzustand. Suchbegriffe kommen aus dem Inhalt und optionalen `data-keywords`; kein zweiter Inhaltskatalog.
- `modules/lore`: Darstellung der erklärenden Kapitel.
- `modules/domains`: Domänenzuordnung und Vorlage. Namen, Gruppen, Verweise und die Symbole aller 34 celestialen und infernalen Gottheiten stammen über das bestehende Inhaltsrepository aus `Religionen`; nur die magische Zuordnung gehört diesem Modul. Geweihte und Gefallene werden nicht als Haupt- oder Untergottheiten umgedeutet.
- `assets`: erzeugte Embleme, elf eigene Schulicons in `schools/`, sieben eigene Druidenicons in `druidic/` und die beiden Icons für sakrale und infernale Magie in `bound/`, jeweils im Oblivion-Stil. Die jeweiligen `image-prompts.json` dokumentieren die eingebauten Imagegen-Aufrufe.
- `docs`: übergebene Altquelle und dokumentierte redaktionelle Entscheidungen.

Keine Firebase-Anbindung und keine Änderung an Kampfwerten, Ressourcen oder Klassenprofilen. Die Seite ist ein Weltkundecodex, kein zweiter Regelresolver.

## Pflege und Prüfung

Neue Einträge als `<details data-magic-entry>` innerhalb des passenden `data-tradition`-Kapitels ergänzen. Stabile IDs erlauben direkte Links wie `index.html#cogniturgie`. Kapitel- und Titelzahlen bei Erweiterungen aktualisieren. Alle Icons und Verweise lokal halten.

Domänen in `modules/domains/magic-domain-assignments.mjs` pflegen und `npm --prefix AleriaAlmanach run build:magic` ausführen. `check:magic` prüft den Abgleich; der Produktionsbuild führt ihn automatisch aus. Der Generator ändert ausschließlich den markierten Bereich in `index.html`. Neue Gottheiten ohne Zuordnung oder verwaiste Domänen führen zu einem Fehler.

Suche und Direktlinks öffnen benötigte Domänenregister. Nach dem Zurücksetzen der Suche und nach dem Drucken wird der vorherige Öffnungszustand wiederhergestellt.

Vom Workspace aus: `node --test Magie/tests/*.test.mjs AleriaAlmanach/tests/dashboard-rendering.test.mjs`.
Vollständiger Build: `npm --prefix AleriaAlmanach run build`.
