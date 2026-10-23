# Leitheach – Prüfung

- Sieben Karten, 36 Grenzobjekte: Quellabgleich und Builder-Prüfung bestanden.
- `Karten/tests/*.test.mjs`: 100 Tests bestanden.
- `Kontinente/tests/alben.test.mjs`: acht Tests bestanden.
- Kartenstruktur: keine Fehler; 174 bereits bestehende Bildduplikatwarnungen.
- 31 vorhandene Kartendateien per SHA-256 verglichen: keine Änderungen.
- Chrome-Prüfung: Flächen zeichnen, Punkte verschieben/einfügen/entfernen,
  Rückgängig, sofortiges lokales Speichern und Neuladen, Testregion entfernen,
  Schutz offener Entwürfe, gültiger/leerer und ungültiger Regionsimport.
- Alle sechs Teilkarten und die Übersicht im Browser geöffnet; Maße,
  Grenzzahlen, Verschachtelung und Kartenverknüpfungen geprüft.
- Der vorübergehend fehlende Dateizugriff der Chrome-Erweiterung wurde nach
  deren Wiederverbindung behoben; der Importtest anschließend abgeschlossen.
- Temporäre Teständerungen im Browser zurückgesetzt; bestehende Sicherungen
  bleiben über den üblichen Backup-Verlauf zugänglich.
- Kein Push und keine Veröffentlichung.

`browser-verification.json` enthält den Browserbeleg. `overview.jpg`,
`detail.jpg` und `editor.jpg` zeigen Übersicht, Sinsear und die bearbeitbare
Fancha-Grenze. Die Quellen und ihre Grenzen stehen in
[ABGLEICH.md](../../Karten/Leitheach/ABGLEICH.md).
