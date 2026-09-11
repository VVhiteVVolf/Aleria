# Nharazim 2.000: Prüfung des ausgelieferten Pakets

- 443 zugeordnete Unicode-Zeichen, 278 interne Glyphen.
- TTF, WOFF und WOFF2: identische Zeichenzuordnungen, Konturen, Metriken
  und OpenType-Tabellen für Akzentzusammensetzung und -positionierung.
- Vollständige Abdeckung von U+0020 bis U+007E und U+00A0 bis U+017F.
- Alle 30 Lore-Zeichen, ihre Kleinbuchstaben und U+E200 bis U+E21D geprüft.
- 30 unterschiedliche Hauptkonturen; K und C sind verschieden.
- ß und ẞ zeigen dieselbe Sigille. SS und CH bleiben zwei Zeichen.
- Alle 900 möglichen Paare privater Lore-Zeichen bleiben zwei getrennte Sigillen.
- Jedes zugeordnete Zeichen ohne fehlende Glyphe durch HarfBuzz geformt.
- Alle Zeichen von U+00C0 bis U+017F in zusammengesetzter und zerlegter
  Unicode-Schreibweise mit identischem Shaping-Ergebnis geprüft.
- Vertikale Glyphengrenzen liegen innerhalb von Auf- und Abstieg des Fonts.
- Beispieltexte mit Deutsch, Türkisch, Akzenten, Zahlen und Sonderzeichen geprüft.
- JavaScript-Hilfen, Initialisierung der Demo, alle 443 Zeichensatzfelder,
  Sonderzeichen-Schaltfläche, Größen-/Farbsteuerung und Dateipfade geprüft.
- Zeichentafel, Erweiterungsübersicht und Leseprobe aus dem TTF gerendert
  und visuell kontrolliert.

Die technischen Fontprüfungen lassen sich mit `source/test_font.py` wiederholen.
Die HTML-Steuerung wurde in einer JavaScript-Testumgebung geprüft, nicht in
jedem Zielbrowser oder Desktopprogramm. Die tatsächliche Größe und der
Kontrast sollten zusätzlich in deinem Buchlayout kontrolliert werden.

Nicht unterstützte Unicode-Zeichen sind kein Teil des versprochenen Umfangs.
Die Demo meldet sie; `zeichensatz.json` enthält die verbindliche Liste.
