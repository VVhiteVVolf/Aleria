# Theaterrepertoire-Template

Eigenständige wiederverwendbare Vorlage, unabhängig vom Gwynthorer Theater. Seitenflag `theatreProgramPage`, Nutzdaten `page.theatreProgram`. Der Eintrag im bestehenden Template-Register besitzt Renderer, Defaultseite, Modal- und Inline-Editor.

`theatre-program-data.js` normalisiert Überschrift, Einleitung, Fußzeile und beliebig viele Stücke. Jedes Stück hat Titel, Gattung, Zeit/Hintergrund, Zusammenfassung, Besetzung, Inszenierung und Szenenbild. Ein leerer Titel ergibt einen bewusst freien Platz. Solche Einträge werden nicht weggefiltert. Die Defaultseite enthält acht freie Plätze.

`theatre-program-renderer.js` rendert zwei Karten je Zeile, bei weniger als 720 Pixeln verfügbarer Breite eine. Bilder behalten ihren Alphakanal und werden vollständig angezeigt. Der eigene Scrollbereich ist per Tastatur fokussierbar und trägt einen zugänglichen Namen. Keine globalen IDs, Bild- oder Spieldaten und kein eigener veränderlicher Zustand.

`theatre-program-editor.js` registriert `theatreProgram.items` im vorhandenen Zeilenschema. Hinzufügen, Bearbeiten und Entfernen verwenden dessen gemeinsame Event- und Zustandsverwaltung. Leere Plätze überleben beide Editoren und einen JSON-/Sanitizer-Rundlauf. `theatre-program.css` kapselt Darstellung und Containeranpassung.

Prüfungen liegen in `tests/gwynthor-theater.test.mjs` und `tests/gwynthor-theater.browser.mjs`; zusätzlich nehmen die allgemeinen Template-Asset- und Rundlaufprüfungen die neue Vorlage auf.
