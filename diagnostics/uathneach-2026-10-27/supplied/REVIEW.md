# Nutzerkorrektur: vorhandene Uathneach-Krieger verwenden

23 Original-PNGs aus dem genannten Verzeichnis wurden tatsächlich im Kontaktbogen
angesehen, explizit den Clans zugeordnet und bytegleich ins Projekt übernommen.
Na Fiodhrán, Tir An Creagán und Dál Siubhrán behalten die neu erzeugten Bilder.
Die ersetzten 23 neuen Figuren bleiben im bisherigen Generatorarchiv erhalten.

Die aktive Auswahl ist für alle 26 Clans in der Hausbio, auf der Hausseite, in
deren Kriegerabschnitt, in der zentralen Kriegergalerie und in der Vorbereitung
dieselbe. Die ältere Zuordnung aus Dateinamen wurde für 22 Galeriegruppen durch
die bestätigten Clanakten ersetzt; deren Galerie-IDs und Archivvarianten bleiben.

Browserprüfung:

- Lága-Hausseite: originales PNG als Hauptbild und Kriegerbild vollständig geladen.
- Lága-Wappenbio: Originalbild und getrenntes Wappen geladen; Link zur Hausseite.
- Hauptgalerie: Suche Uathneach ergibt 26 Registerclans mit je einer Illustration;
  Original-Großansicht und ursprüngliche Galerie-IDs funktionieren.
- Mobiler Test in einem eigenen Tab mit tatsächlich geprüften 390 × 844 Pixeln:
  Briccne-Hausseite zeigt das vollständige quadratische Kriegerpaar; Gealân-Hausbio
  zeigt das Original trotz noch personenleerer Akte; Galerie enthält 26 Bilder.
  Alle drei Oberflächen ohne horizontale Überbreite. `qa/responsive-audit.json`.
- Neue Hausseiten sind direkt aus Länderregistern und Karten verlinkt.
- Bestehende Personen, Ehen, Abstammungen und eigene bzw. ausdrücklich entfernte
  Hausbios bleiben durch die bisherige Aktualisierungspolitik erhalten.
- Keine Bildgenerierung, kein Push, Deployment oder administrativer Firebase-Write.

Die Belege unter `qa/` dokumentieren die sichtbaren Ansichten. Der Kontaktbogen
`contact.jpg` und die Bildmaße in `inventory.json` stammen vom gelieferten Ordner.
Die frühere Prüfung im übergeordneten Diagnoseordner betrifft die erste
Generatorserie und bleibt als historischer Beleg erhalten.
