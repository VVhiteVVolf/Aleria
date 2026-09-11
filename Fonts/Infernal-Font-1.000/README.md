# Nharazim · Abgrundsigillen · Version 2.000

Ein echter installierbarer Font und Webfont nach dem gewählten Entwurf III.
Die 18 großen Zeichen der Stilvorlage wurden in Lesereihenfolge A bis R
zugeordnet und aus der Vorlage nachgezeichnet. S bis Z, Ä, Ö, Ü und ß wurden
als zwölf neue Sigillen im selben Stil generiert und ebenfalls nachgezeichnet.
Die geschwungenen Konturen, offenen Ringe und hängenden runden Punkte sind
Bestandteil des Fonts, keine Hintergrundbilder oder CSS-Tricks.

## Sofort ausprobieren

1. Das ZIP vollständig entpacken.
2. `demo.html` öffnen. Es werden keine externen Schriften oder Dienste geladen.
3. Eigenen Text eingeben. Die Vorschau meldet Zeichen außerhalb des Zeichensatzes.

## Auf deiner HTML-Seite verwenden

Den Ordner `fonts/` und `nharazim.css` zusammen auf deine Website kopieren.
Die Pfade in der CSS-Datei beziehen sich auf den Speicherort der CSS-Datei.

```html
<meta charset="utf-8">
<link rel="stylesheet" href="nharazim.css?v=2-abgrund">
<p class="infernales">König Kök: zwölf Jäger, große Wölfe & 25 €.</p>
```

Vorhandene Klassen `infernales`, `infernales-glut` und `infernales-vertrag`
bleiben verfügbar. Auch der Familienname `Nharazim` bleibt erhalten.
`infernales-glut` gibt eine optionale dunkelrote Farbe mit dezentem Leuchten;
`infernales-vertrag` setzt Text senkrecht. Normale Farbe, Schriftgröße und
Abstand kannst du über CSS ändern. Für Buchseiten sind etwa 24 bis 32 px
ein guter Ausgangspunkt; sehr kleine Schrift schwächt die feinen Fäden.

## Alte Version ersetzen

Die alte CSS-Datei ersetzen und den neuen `fonts/`-Ordner übernehmen.
Nicht nur das WOFF austauschen: Der Browser bevorzugt gegebenenfalls noch ein
altes WOFF2. In eigenen `@font-face`-Regeln alle drei Dateipfade aktualisieren.
Danach die Seite mit Strg+F5 neu laden. Die neuen CSS-Adressen haben einen
Versionszusatz gegen veraltete Font-Caches.

Bei lokal installierter Schrift die alte Nharazim-Version ersetzen, die neue
`fonts/Nharazim-Regular.ttf` installieren und die Anwendung neu starten.
WOFF2 und WOFF sind Webformate, TTF ist zusätzlich für Desktopprogramme gedacht.

## Zeichenumfang, auch außerhalb der Lore

- A bis Z und a bis z, alle Buchstaben einschließlich J, K, Q, W eigenständig.
- Ä Ö Ü ä ö ü ß ẞ. Groß- und Kleinbuchstaben zeigen dieselbe Sigille.
- Alle druckbaren ASCII-Zeichen U+0020 bis U+007E: Ziffern, Satzzeichen,
  Klammern, Rechenzeichen und Zeichen wie `@ # & % / \\ _ ~`.
- Latin-1 ab U+00A0 und der gesamte Block Latin Extended-A U+0100 bis U+017F.
  Dazu gehören unter anderem É, à, ç, ñ, Ğ, İ, ı, Ş, Ł, œ und æ.
- Die zugehörigen kombinierten Akzente. Ä und A + kombinierter Umlaut ergeben
  dieselbe eigenständige Aeshra-Sigille. Das gilt ebenso für Ö und Ü.
- Typografische Anführungszeichen, Apostrophe, Auslassungszeichen, Striche,
  geschützte Leerzeichen sowie €, £, ¥, ₺, ©, ®, ™, § und ¶.
- Pfeile ← ↑ → ↓ ↔, mathematische Zeichen wie ≠ ≤ ≥ ≈ ∞, Hoch- und Tiefzahlen.
- Alle 30 bisherigen privaten Unicode-Adressen U+E200 bis U+E21D.

Der **exakte Umfang steht in `zeichensatz.json`** und auf der Testseite.
„Vollständig“ bezieht sich auf diese Blöcke und Zeichen, nicht auf ganz Unicode.
Griechische und kyrillische Alphabete, asiatische Schriften, Emoji und nicht
aufgeführte Spezialzeichen gehören nicht dazu. Sie werden in der Testseite
gemeldet und andernorts gegebenenfalls durch eine Ersatzschrift angezeigt.

## Bedeutung und Eingabe

Die Schrift stellt deinen vorhandenen Text als Sigillen dar. Sie übersetzt ihn
nicht in eine andere Sprache und verschlüsselt ihn nicht. Namen und Bedeutungen
der 30 Lore-Sigillen wurden aus der mitgelieferten Vorlage übernommen.
Zusätzliche Akzente, Ziffern und Symbole erhalten keine neuen Lore-Bedeutungen.
Das ausführliche Verzeichnis steht in `Handbuch.md` und `alphabet.json`.

Jeder Buchstabe bleibt einzeln. Es gibt keine automatischen CH-/SH-Ligaturen
und keine Zusammenlegung von C und K. ß ist eine eigene Sigille und wird
nicht in SS umgewandelt. Satzzeichen bleiben Satzzeichen.

Optionale JavaScript-Hilfe ohne Netzwerkzugriff:

```html
<script src="nharazim.js"></script>
<script>
  console.log(Nharazim.findUnsupported('Kök & 25 €!')); // []
  console.log(Nharazim.encodeTokens(['A', 'K', 'Ä', 'ß']));
</script>
```

`encodeTokens` liefert nur die ausdrücklich benannten Lore-Sigillen aus dem
privaten Unicode-Bereich. Andere Tokens lösen einen Fehler aus.
`findUnsupported` prüft nach Unicode-Normalisierung; Zeilenumbrüche und Tabs
sind zulässige Layoutzeichen. Die Quelldateien sollten als UTF-8 gespeichert sein.

## Barrierefreiheit

Für wichtige Informationen eine lesbare Klartextfassung beibehalten.
Rein dekorative Sigillen können `aria-hidden="true"` erhalten. Private
Unicode-Zeichen sind ohne den Font nicht sinnvoll lesbar; normalen Text
nur dann in solche Zeichen umwandeln, wenn du diese feste Zuordnung brauchst.

## Enthaltene Dateien

- `fonts/`: TTF, WOFF und WOFF2.
- `demo.html`, `nharazim.css`, `nharazim.js`: Testseite und Einbindung.
- `Zeichentafel.png`, `Erweiterter-Zeichensatz.png`: mit dem echten Font gerendert.
- `Handbuch.md`, `alphabet.json`, `zeichensatz.json`: Anleitung und Zuordnungen.
- `source/glyphs/`: 30 nachgezeichnete Kurvenkonturen.
- `source/references/`: freigegebener Entwurf und generierte Ergänzung.
- `source/build_font.py`, `source/compatibility.py`: reproduzierbarer Fontbau.
- `source/test_font.py`: technische Zeichen- und Formatprüfung.

Die SVG-Dateien sind nur die editierbaren Masterkonturen für den Fontbau,
nicht das alte geometrische Design. Die Schrift wird als echter Font geladen.

## Selbst neu bauen

```sh
python -m pip install "fonttools[woff]" brotli shapely
python source/build_font.py
```

Für die zusätzlichen Tests: `python -m pip install uharfbuzz`, dann
`python source/test_font.py`. Bilder und Handbuch sind statische Übersichten.
Das Originaldesign und die Ergänzung wurden mit integrierter Bildgenerierung
erstellt; der Ergänzungsprompt liegt in `source/Design-Prompt.txt`.
Es wurden keine Konturen aus fremden kommerziellen Fonts übernommen.
Verwendung, Webeinbettung und Bearbeitung der für Aleria erstellten Schrift
sind gestattet. Die Vorlagendateien bleiben zur Nachvollziehbarkeit erhalten.
