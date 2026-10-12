# Ordner für neue Charaktere und Gruppen

Diesen gesamten Ordner nach `Charaktere/Einzelcharaktere/<Charaktername>` oder `Charaktere/Gruppen/<Gruppenname>` kopieren und passend benennen. Für eine einzelne Figur innerhalb einer Gruppe darf die gleiche Struktur als Unterordner verwendet werden.

- `Originale`: unveränderte übernommene Quelldateien.
- `Referenzen`: verbindliche Porträts und bei Bedarf zusätzliche Motivvorlagen.
- `Prompts`: ausgefüllte Auftragsdatei und tatsächlich verwendeter Bildprompt.
- `Sheets`: vollständige 9er-Sheets, im Dateinamen mit Figur und Set bezeichnet.
- `Verarbeitung/set-01`: Arbeitskopie eines Sheets für die Ordnerverarbeitung. V3 legt seine Ausgabe in `output` und verschiebt die Eingabe nach `Benutzt`.
- `Output/set-01`: geprüfte fertige Einzelavatare.

Die `.gitkeep`-Dateien erhalten leere Arbeitsordner in Git. Neue Sets bekommen eigene Ordner, etwa `set-02`; dadurch bleiben frühere Ergebnisse erhalten. Die Auftragsvorlage liegt zentral unter `Vorlagen/Avatar-Auftrag.json`, der vollständige Ablauf in `AvatarWerkstatt/README.md`.
