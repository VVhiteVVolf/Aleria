# Drachentanz Kampfstil

Redaktionelles Almanach-Modul unter **Techniken → Cenyr → Drachentanz Kampfstil**.
Die Registrierung erfolgt nach `data/sections.js` und vor der Initialisierung des Archivs.
Erneutes Laden registriert den Eintrag nicht doppelt.

Die 13 Seiten verwenden die bestehende Standard-/Story-Vorlage und deren Bild- und
Textfelder. `chapters` enthält die direkt bearbeitbaren Absätze; bei der Registrierung
werden sie in die reguläre Seitenbeschreibung überführt. Es gibt keine eigene
Darstellungslogik, keine Zitatgeber und keine vorgegebenen Kommentare. Die reguläre
Kommentierfunktion ist unter jeder Seite aktiviert (`enablePageComments: true`);
eine zusätzliche Kommentarseite wird nicht angehängt.
Das Modul verändert keine Kampfregeln, Techniken oder Klassendaten.

Grundlage ist der am 8. September 2026 bereitgestellte HTML-Text. Seine 314 Sachtextabsätze
sind erhalten; Zitatblöcke, Sprecherangaben und die Einleitung zum entfernten Sprichwort
sind ausgelassen. Die direkte Antwort in der Trivia ist als Sachtext formuliert.
Zwischenüberschriften sowie zusätzliche Fett- und Kursivsetzungen gliedern die Texte.

## Seiten und Bilder

| Seite | Inhalt | Bilddatei |
| --- | --- | --- |
| 1 | Übersicht und Allgemein | `uebersicht.png` |
| 2 | Grundtechniken, ruhender und bewegter Drache | `grundtechniken.png` |
| 3 | Finten, Täuschungen, Beweglichkeit und Geschicklichkeit | `finten-beweglichkeit.png` |
| 4 | Die Tänze | `taenze.png` |
| 5 | Jungdrache | `jungdrache.png` |
| 6 | Schwertdrache | `schwertdrache.png` |
| 7 | Abwartender Drache | `abwartender-drache.png` |
| 8 | Fliegender Drache | `fliegender-aufsteigender-drache.png` |
| 9 | Aufsteigender Drache | `fliegender-aufsteigender-drache.png` |
| 10 | Brüllender Drache | `bruellender-drache.png` |
| 11 | Ausgeglichener Drache | `ausgeglichener-drache.png` |
| 12 | Zwillingsdrache | `zwillingsdrache.png` |
| 13 | Trivia / Wissenswertes | `trivia.png` |

Die vom Nutzer vorgegebenen PNG-Dateien liegen unverändert in
`public/assets/drachentanz-kampfstil/`. `sources.json` dokumentiert ihre Original-URLs
und SHA-256-Prüfsummen. Das gemeinsame Bild der beiden beweglichen Formen wird nur
einmal gespeichert. Die Trivia verwendet die angebotene Alternative `6T0Erkr`, da
`OTCX0TF` bereits den Jungdrachen illustriert. Die Tänze-Übersicht verwendet das ebenfalls
angebotene, bisher ungenutzte Bild `WwJrMiq` mit Ritter und Knappe beim Schwertunterricht.
