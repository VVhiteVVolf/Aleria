# Ordner für neue Charaktere und Gruppen

Diesen gesamten Ordner nach `Charaktere/Einzelcharaktere/<Charaktername>` oder `Charaktere/Gruppen/<Gruppenname>` kopieren und passend benennen. Für eine einzelne Figur innerhalb einer Gruppe darf die gleiche Struktur als Unterordner verwendet werden.

- `Originale`: unveränderte übernommene Quelldateien.
- `Referenzen`: verbindliche Porträts und bei Bedarf zusätzliche Motivvorlagen.
- `Prompts`: ausgefüllte Auftragsdatei und tatsächlich verwendeter Bildprompt.
- `Sheets`: vollständige 9er-Sheets, im Dateinamen mit Figur und Set bezeichnet.
- `Verarbeitung/set-01`: Arbeitskopie eines Sheets für die Ordnerverarbeitung. V3 legt seine Ausgabe in `output` und verschiebt die Eingabe nach `Benutzt`.
- `Output`: alle geprüften fertigen Einzelavatare dieser Figur, gemeinsam für sämtliche Sets. Keine Unterordner pro Set; Figur und Set im Dateinamen erhalten.

Die `.gitkeep`-Dateien erhalten leere Arbeitsordner in Git. Nur neue Verarbeitungsläufe bekommen eigene Arbeitsordner, etwa `Verarbeitung/set-02`. Fertige Bilder bleiben gemeinsam unter `Output` und erhalten eindeutige Dateinamen. Die Auftragsvorlage liegt zentral unter `Vorlagen/Avatar-Auftrag.json`, der vollständige Ablauf in `AvatarWerkstatt/README.md`.
