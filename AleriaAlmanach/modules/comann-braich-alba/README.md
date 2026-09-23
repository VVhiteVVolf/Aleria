# Comann Braich Alba – Der albische Malzbund

Themenmodul unter **Weltpfade → Gilden & Zünfte → Handwerk & Kulturbünde**. Stabile Modul-ID: `comann-braich-alba`.

## Inhalt und Darstellung

Der vom Nutzer am 23. September 2026 bereitgestellte Text ist vollständig auf 13 Story-Seiten verteilt. Alle 273 nichtleeren Absätze einschließlich der Glossareinträge bleiben erhalten. Lediglich leere Überschriften, HTML-Formatierungsreste und zwei offensichtliche Satz-/Hervorhebungsfehler wurden bereinigt. Zusammengehörige Abschnitte wurden gebündelt; die Grundregel schließt die Herkunfts- und Abfüllungsregeln ab. Die geographischen Begriffe stehen als kompakte Begriffserklärung im Text, da der bestehende Story-Richtext keine Tabellen unterstützt.

| Seite | Kapitel | Eigenes Szenenbild |
| --- | --- | --- |
| I | Der Malzbund | Einsame Brennerei im Hochland |
| II | Auftrag, Siegel & Herkunft | Flasche, Siegel und Herkunftsurkunde |
| III | Getreide & Brennhandwerk | Brennerin und Lehrling am Maischebottich |
| IV | Eiche & Fasswissen | Küfer bei der Fassarbeit |
| V | Fünf Jahre & das Alter | Fasskeller und Zeit |
| VI | Reinheit & Wasser | Quellwasser und natürliche Whiskyfarben |
| VII | Die Beweisstärke | Prüferin, Messspindel und Brennmeister |
| VIII | Herkunftswege & Rückführung | Rückkehr der Fässer über einen Hafen |
| IX | Landschaft & Brennereiname | Brennerei im Gerstental |
| X | Häuser, Zeichen & Tradition | Archiv mit Drachen- und Wolfssymbol |
| XI | Die Geschichte in der Flasche | Abfüllungen im Winterlicht |
| XII | Prüfung & die Fianna | Herkunftsprüfung mit einem Wächter |
| XIII | Die Hüter & lebendige Tradition | Erzählrunde im Brennhaus |

Die Figuren sind namenlose Illustrationen. Die Bilder behaupten keine neuen Amtsträger, Sitze, Familienwappen oder Ereignisse. Herstellung, Reifung und Abfüllung im anerkannten Kulturraum, fünf vollständige Jahre in Eiche, das Zusatzverbot mit Wasser-Ausnahme und die Rückführung bleiben entsprechend der Vorlage erhalten. Insbesondere werden weder eine moderne Alkoholprozentzahl noch politische Ansprüche auf Cenyr oder Aldrimar ergänzt.

## Einbindung und Pflege

`comann-braich-alba-data.js` kapselt Inhalt und einmalige Archivregistrierung in derselben Weise wie andere vorhandene Themenmodule. Die Datei lädt nach `data/sections.js` und vor der Initialisierung des Modul-Stores. Sie verwendet ausschließlich vorhandene Story-, Navigations-, Kommentar-, Editor- und Importfunktionen. Es gibt keine eigenen Listener, globalen Zustände, CSS-Überschreibungen oder Firebase-Zugriffe.

Alle Seiten besitzen ein eigenes Bild in **1024 × 1536 Pixeln (2:3)**. `imageFit: 'contain'` erhält die vollständige Bildkomposition. Es wird keine zusätzliche Kommentarabschlussseite angelegt.

Die Bilder liegen in [`public/assets/comann-braich-alba`](../../public/assets/comann-braich-alba/). Das [Bildmanifest](../../public/assets/comann-braich-alba/image-prompts.json) dokumentiert alle endgültigen Prompts und Originalpfade. Generiert mit dem integrierten `image_gen`, im gewünschten Frieren-/Tales-of-Symphonia-Anime-Stil und mittelalterlich-gälischen Setting.

## Prüfung am 23. September 2026

- Vollständigkeitsabgleich aller 273 nichtleeren Originalabsätze und Glossareinträge.
- `npm run check:templates`: Asset-Verträge, Registry und JSON-Roundtrips bestanden.
- 20 vorhandene Tests für Story-Kommentare, Modalnavigation und Modulvorschau bestanden.
- 26 lokale Browseransichten: sämtliche 13 Seiten bei 1440 und 390 Pixeln Breite; keine JavaScript-Fehler, fehlenden lokalen Assets oder horizontalen Textüberläufe.
- Für dieses Modul zusätzlich JSON-Import/Sanitizer geprüft: alle 13 Seiten behalten Text, Bildpfad und Story-Typ; keine zusätzliche Abschlussseite.
- Alle 13 unterschiedlichen PNG-Dateien im Format 1024 × 1536; Darstellung ohne Bildbeschnitt geprüft.

Die lokalen Browserprüfungen liefen in einem frischen Kontext mit blockierter Firebase-Verbindung. Sie haben keine Online-Module, Charaktere oder Kampfdaten verändert.
