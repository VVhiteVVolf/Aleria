AVATAR SPLITTER PRO V3
======================

Start unter Windows:
1. ZIP entpacken.
2. starten.bat doppelklicken.
3. Beim ersten Start wird Pillow automatisch installiert, falls nötig.

Wichtigste Bedienung
--------------------
Bild laden:
- Lädt PNG, JPG, JPEG oder WEBP.

Einzelzelle / einzelne Kante:
- Avatar im großen Bild anklicken.
- Die grün markierte Zelle ist ausgewählt.
- Eine ihrer Kanten anklicken und ziehen.
- Nur diese Kante dieses Avatars wird verändert.
- Rechts können Links/Oben/Rechts/Unten zusätzlich pixelgenau gesetzt werden.
- Die Buttons -1/+1/-10/+10 ermöglichen schnelle Feinkorrekturen.

Rasterlinien verschieben:
- Modus "Rasterlinien verschieben" wählen.
- Eine rote gestrichelte Linie ziehen.
- Dadurch ändert sich die globale Teilung zwischen den angrenzenden Spalten/Zeilen.

Tastatur:
- Pfeiltasten: ausgewählten Avatar wechseln.
- Alt + Pfeiltaste: passende Kante um 1 Pixel verändern.
- Alt + Shift + Pfeiltaste: passende Kante um 10 Pixel verändern.

Reset:
- "Nur diesen Avatar zurücksetzen" entfernt nur dessen individuelle Korrekturen.
- "Raster zurücksetzen" setzt nur die roten Rasterlinien gleichmäßig zurück.
- "Alle Korrekturen löschen" entfernt alle individuellen Kantenkorrekturen.

Export:
- "Aktuelles Bild ... exportieren" exportiert alle Ausschnitte mit dem Namen des Ausgangsbildes.
- "Ordner verarbeiten" behält den alten Workflow bei:
  * Ergebnisse landen in /output
  * Originalbilder werden nach /Benutzt verschoben
  * Dateinamen bleiben Bild1.png, Bild2.png usw. mit automatischer Kollisionsnummerierung.

Hinweis zu Kantenwerten:
- Links positiv: linke Kante nach rechts.
- Oben positiv: obere Kante nach unten.
- Rechts positiv: rechte Kante nach rechts, der Ausschnitt wird breiter.
- Unten positiv: untere Kante nach unten, der Ausschnitt wird höher.
- Negative Werte bewegen jeweils in die Gegenrichtung.
