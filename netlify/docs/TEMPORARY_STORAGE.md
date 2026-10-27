# Vorsichtige Bereinigung temporärer Build-Kopien

`netlify/maintenance/clean-build-copies.py` bearbeitet ausschließlich zwölf
fest benannte ältere Vite-Ausgaben unter `.tmp/`. Es entfernt keine Ordner
rekursiv. Jede ausgewählte Datei erhält einen Inhalts- und Identitätsbeleg.

```text
python netlify/maintenance/clean-build-copies.py --plan .tmp/cleanup-plan.json
python netlify/maintenance/clean-build-copies.py --plan .tmp/cleanup-plan.json --apply
```

Vor `--apply` die Größenaufteilung prüfen und laufende Vorschauprozesse auf die
betroffenen Build-Ordner kontrollieren. Der Plan erlaubt keine beliebigen
weiteren temporären Verzeichnisse.

Eine Datei ist nur entbehrlich, wenn ihr unveränderter Git-Blob vom gepushten
`origin/master` erreichbar ist oder sie ein eindeutig erzeugtes Vite-JS-/CSS-
Bündel in einer erkannten Build-Ausgabe ist. Unbekannte Bilder bleiben erhalten.

Anleitungen und Methoden (`.md`, `.txt`, `.py`, `.mjs`, `.ps1`, `.cmd`, `.bat`,
`.docx`, `.pdf`) werden ausgespart. Projektquellen, Git-Historie, private
Sicherungen, Browserprofile samt IndexedDB, Diagnoseoriginale und temporäre
Live-Daten-Schnappschüsse werden nicht gelöscht.

Unmittelbar vor dem Löschen werden Pfadauflösung, Dateisystemidentität, Größe,
Änderungszeit und Inhaltshash erneut kontrolliert. Geänderte oder umgeleitete
Dateien bleiben stehen. Die Ergebnisdatei neben dem Plan enthält Anzahl,
Bytes, Ausnahmen und den freien Speicher davor/danach. Hardlinks sind bei
der tatsächlichen Platzersparnis nicht mehrfach zu zählen.

Dateien lassen sich über ihren im Plan gespeicherten Blob mit
`git cat-file blob <objekt-id>` wiederherstellen. Erzeugte Bündel werden aus
dem erhaltenen Quellcode und der bestehenden Vite-Konfiguration neu gebaut.
Diese Anleitung und die Schutzwerkzeuge selbst bleiben dauerhaft versioniert.
