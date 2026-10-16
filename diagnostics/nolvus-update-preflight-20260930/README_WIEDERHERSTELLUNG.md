# Nolvus 6.0.20 – Sicherung vor dem Update

## Zuerst den Abschluss prüfen

Die Sicherung ist erst vollständig, wenn im Hauptverzeichnis **BACKUP_COMPLETE.json** mit `status: VERIFIED` liegt. Solange diese Datei fehlt, die alte Installation nicht löschen und kein Update starten.

Diese Sicherung ist eine Dateisicherung der bisherigen Installation. Sie garantiert keine Spielstand- oder Modkompatibilität mit einer neuen Nolvus-Version.

## Aufbau

- **00-Profile-Spielstaende-MO2-Final.zip:** sämtliche MO2-Profile inklusive Saves und SKSE-Begleitdateien, MO2, Skyrim-Dokumente, lokale Skyrim-Einstellungen und Dashboarddateien. Dieses Paket ersetzt die erste Aufnahme `00-Profile-Spielstaende-MO2.zip`, weil sich während der Sicherung zwei Dashboarddateien änderten. Das Wiederherstellungswerkzeug verwendet ausschließlich die finale Aufnahme aus `BACKUP_COMPLETE.json`; die erste Aufnahme bleibt als historischer Zwischenstand liegen.
- **10-Zusatzmods-…:** alle gegenüber dem ursprünglichen Profil hinzugefügten Modordner, auch deaktivierte Varianten. Enthält insbesondere persönliche SkyrimNet-Prompts, Runtime-Daten, NPC-/Body-/Animationsausgaben, zusätzliche Rüstungen und Presets.
- **20-Nolvus-Basis-…:** alle übrigen installierten Modordner als Rückfallkopie. Damit bleiben auch direkte Änderungen in ursprünglichen Nolvus-Mods erhalten.
- **30-StockGame-Tools-Downloads-Berichte:** Stock Game, Tools, Downloads, bisherige Reparaturberichte/Backups sowie übrige Instanzdateien.
- **metadata:** Vergleichstabellen, Profilunterschiede, zusätzliche Separatoren, Ausgangsversion, ursprüngliche Pfade und Prüfberichte.
- **tools:** geprüfte Kopier-/Wiederherstellungsskripte und 7-Zip.

ZIP und TAR.ZST sind Standardarchivformate. TAR.ZST wird für die großen Pakete verwendet, weil der auf diesem Rechner geprüfte Kompressor deutlich schneller als ZIP arbeitet. 7-Zip kann beide Formate lesen. TAR.ZST enthält ein TAR-Archiv; die Python-Wiederherstellung liest dieses direkt als Datenstrom, ohne zunächst eine große TAR-Datei auf die Festplatte zu schreiben.

Zu jedem Paket gehört eine **manifest.csv**: relativer Zielpfad, ursprünglicher Pfad, Dateigröße, genauer Änderungszeitpunkt und SHA-256. Alle regulären Archivdateien wurden nach dem Schreiben erneut entpackt/gelesen und mit der beim Lesen der Quelle ermittelten Prüfsumme verglichen. Leere Verzeichnisse sind in den großen Modpaketen mit erfasst.

## Für das neue Nolvus: nur Zusätze vorbereiten

Nicht die komplette alte Basis oder alle alten Profildateien über eine neue Installation kopieren. Dadurch könnten neue Patches und Reihenfolgen des Updates verloren gehen.

Das Werkzeug akzeptiert ausschließlich einen **noch nicht vorhandenen Zielordner**. Es schreibt nie direkt in eine bestehende Nolvus-Installation. Beispiel mit dem vorhandenen Python dieser Maschine:

```powershell
& 'C:\Users\fhg_r\miniconda3\python.exe' '.\tools\restore_backup.py' --backup '.' --destination 'D:\Nolvus-Migration-Staging' --scope custom
```

Im Backup-Hauptverzeichnis ausführen. Einen Zielort mit ausreichend freiem Speicher wählen: alle Zusätze benötigen unkomprimiert rund 219 GiB. Vor dem Entpacken prüft das Werkzeug den Platz. Für einzelne Mods ist deutlich weniger Platz nötig:

```powershell
& 'C:\Users\fhg_r\miniconda3\python.exe' '.\tools\restore_backup.py' --backup '.' --destination 'D:\Nolvus-Prompts-Staging' --scope custom --mod 'SkyrimNet - Personal Prompt Import 20260927'
```

Ergebnis liegt unter `Zielordner\instance\MODS\mods`. Das Werkzeug überprüft jede wiederhergestellte Datei erneut mit SHA-256. Persönliche Prompts liegen zusätzlich im SkyrimNet-Runtime-Mod; für eine vollständige SkyrimNet-Übernahme auch diesen berücksichtigen.

Das getestete Python ist 3.13.5 mit **zstandard 0.23.0**. Andere Python-Umgebungen benötigen das Paket für TAR.ZST. Die Sicherung selbst hängt nicht von dieser Python-Installation ab: alternativ die mitgelieferte 7-Zip-Version verwenden. Beim manuellen Entpacken alte Basisdateien ausschließlich in einen separaten Ordner schreiben.

## Übernahme in das aktualisierte Profil

1. Zielversion und deren Save-/SKSE-/Modkompatibilität klären. Die bisherige Sicherung unverändert behalten.
2. Neue Nolvus-Basis zunächst unverändert testen; neues Anpassungsprofil anlegen.
3. Zusatzordner mit ihren bisherigen Namen übernehmen. Installation einer neuen Version desselben Mods nicht durch blindes Zurückkopieren einer alten Variante ersetzen.
4. `metadata/migration-map.csv` enthält die bisherige Aktivierung, Reihenfolge, benachbarte Originalmods, Versionsangaben und das jeweilige Sicherungspaket. Zusammen mit `metadata/mod-classification.csv` und den gesicherten modlist.txt-Dateien für die Einordnung nutzen. Die Pluginreihenfolge separat aus plugins.txt/loadorder.txt vergleichen und an die neue Basis anpassen.
5. Die **54 deaktivierten Originalmods** aus `metadata/disabled-base-mods.csv` prüfen. Besonders NPC-Replacer, Körpermods und frühere Konfliktkorrekturen dürfen nicht versehentlich doppelt aktiv werden.
6. Direkte Änderungen an ursprünglichen Mods gezielt übernehmen. Bekanntes Beispiel: die Stances-Konfiguration für `<` + W/A/S/D liegt in `Stances - Dynamic Animation Sets - Nolvus Settings`. Originalordner dabei nicht umbenennen.
7. SkyrimNet-Prompts, Runtime-Konfiguration, Stimmen, eigene Aktionen und Datenbanken übernehmen. Neue Konfigurationsfelder behalten; keine alten kompletten Konfigurationen ungeprüft über neue Versionen schreiben.
8. BodySlide/OBody-, Pandora- und NPC-Ausgaben auf die neue Zusammenstellung abstimmen und nötigenfalls neu erzeugen. Die gesicherten Ausgaben dienen als Rückfallkopie.
9. Saves immer paarweise mit .skse-Begleitdateien kopieren. Zuerst mit einer Kopie des bisherigen Spielstands testen.

## Vollständige Rückfallkopie entpacken

`--scope all` stellt alle Pakete in einen neuen Staging-Ordner wieder her. Dafür sind mindestens die gesamte unkomprimierte Größe plus Reserve nötig. Unter `instance` liegt die bisherige Nolvus-Instanz, unter `dashboard` deren Dashboardbestand, unter `external` liegen Dateien aus Dokumente und AppData. Beim Wechsel von Laufwerk oder Ordner müssen absolute Pfade in MO2, Verknüpfungen und Dashboarddefinition geprüft werden. Externe Programme wie Miniconda sind nicht als komplette Programme in dieser Nolvus-Sicherung enthalten; der Launcher und seine Pfade bleiben dokumentiert.

## Vertrauliche Daten

Die Sicherung enthält persönliche Spielstände und möglicherweise API-Schlüssel in den gesicherten Konfigurationen. Lokal aufbewahren und nicht unbereinigt veröffentlichen.
