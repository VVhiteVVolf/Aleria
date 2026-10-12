# Weltkarten-Stamps

Die einzelnen PNGs und die fünf kleineren ZIP-Pakete stehen direkt zur Verfügung.
Das vollständige ZIP mit 119 Motiven und drei Hafenvarianten überschreitet GitHubs
Dateigrößenlimit und ist deshalb bytegenau in zwei Teile aufgeteilt.

Für das vollständige ZIP beide `.zip.001`/`.zip.002`-Dateien,
`complete-archive-parts.json` und `Join-CompleteArchive.ps1` in denselben Ordner
herunterladen. Anschließend unter Windows PowerShell ausführen:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Join-CompleteArchive.ps1
```

Das Skript prüft zuerst beide Teile und danach das zusammengesetzte ZIP mit
SHA-256. Eine bereits vorhandene, abweichende Zieldatei wird nicht überschrieben.
Das ursprüngliche ZIP bleibt lokal unverändert erhalten.
