# Drei fehlende Patrizierfiguren

Nutzerauftrag vom 4. November 2026: „Sonst erstelle sie.“ Betroffen sind die
tatsächlichen Bildlücken Vinicius, Tullius und Arentino. Alle drei wurden mit
dem eingebauten ImageGen und den freigegebenen Stil-/Hauswappenreferenzen
erstellt und über die bestehende gemeinsame Alpha-Pipeline eingebunden.
Prompts und Tooloriginalbelege liegen in den beiden
`Vorschau/Venalys/sources/patrician-warriors-20261104-*.json`-Dateien.

- `prepare-artifacts.py`: reproduzierbare Übernahme der drei Tooloriginale,
  gezielte Verarbeitung, 22er-Audit und Erhalt der bisherigen Bilddateien.
- `audit.json`: 22/22 Bilder bestanden; RGB und Originale erhalten. Mehrere
  Figuren haben schmale, aber transparente Ränder. Beim neuen Arentino sind
  es neun Pixel an der Hellebardenspitze; die vollständige Spitze ist sichtbar.
- `preservation-check.json`: alle 102 vorhandenen Bilddateien bytegleich.
- `contact-sheet.jpg`: alle 22 freigestellten Figuren tatsächlich angesehen;
  neue Heraldik, Farben, komplette Silhouetten und unterschiedliche Helme
  passen zum Bestand. Einzelvergleiche in `*-review.jpg`.
- `verify-http.mjs` / `http-verification.json`: 71 Seiten-/Katalog-/Bilddateien
  auf dem bestehenden lokalen Server per HTTP 200 und Bytevergleich geprüft.

Die gezielten Daten-/Galerie-/Dialogtests bestanden 3/3, die Stände- und
Zuordnungsregressionen 15/15. Befehle:

```text
node --test --experimental-test-isolation=none --test-name-pattern="military representation|supplied patrician|runtime dependency" Vorschau/tests/venalys-data.test.mjs
node --test --experimental-test-isolation=none Vorschau/tests/venalys-estates.test.mjs Vorschau/tests/venalys-assignments.test.mjs
node diagnostics/venalys-patricians-20261104/verify-http.mjs
```

Beim unbeschränkten früheren 21er-Lauf bestand ausschließlich der bestehende
Kartenquellen-Test nicht: Die externe Originaldatei unter
`C:/Users/fhg_r/Downloads/Venalys/Alternative Maps/Venalys Normal.png` ist
nicht mehr vorhanden. Die aktuelle archivierte Karte wurde nicht geändert.
Die Browserprüfung bleibt wegen des CUA-Navigationsfehlers (`timeoutMs`)
eingeschränkt; ein Browser-Pass wird nicht behauptet. Die Bildsichtprüfung
und der unabhängige HTTP-Abgleich sind bestanden. Kein Push oder Deploy.
