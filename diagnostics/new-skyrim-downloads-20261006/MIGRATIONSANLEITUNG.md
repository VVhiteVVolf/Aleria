# Aktuelle Wiederherstellung – 6. Oktober 2026

Aktueller geprüfter Zusatzstand: `updates/20261006-New-Downloads`. Dieser Zusatz ist kumulativ zum ursprünglichen Basisbackup. Enthalten sind die bisherigen SkyrimNet-Beta26-/Prisma-Anpassungen, persönlichen Prompts, Körperreparaturen und aktiven Zusatzmods sowie die neue Modinstallation, alle neuen BodySlide-Ausgaben und das aktuelle Profil einschließlich Spielständen.

28.073 Dateien wurden unabhängig entpackt und per SHA-256 geprüft. Der Wiederherstellungstest der neuen BodySlide-Ausgabe hat 3.014 Dateien erfolgreich wiederhergestellt. Alle 56 neuen Modordner sind in der Liste der insgesamt 469 gesicherten Zusatz-/angepassten Modordner enthalten.

Nur das aktuelle Profil wird für diese Migration berücksichtigt. Deaktivierte ersetzte Mods werden nicht automatisch wieder hinzugefügt.

Wiederherstellung immer in einen neuen Staging-Ordner. Aus dem Backup-Wurzelordner ausführen:

```powershell
python tools/restore_latest.py --destination D:\Nolvus-Wiederherstellung-20261006-Neue-Mods --scope migration
```

Danach Zusatzmods gezielt in die neue Nolvus-Version übernehmen und Konflikte prüfen. Alte Profillisten nicht blind über die neue Basis legen. BodySlide-Binaries und MO2-Konfiguration dienen zum Abgleich; Toolversionen und Pfade an die neue Installation anpassen. Im derzeitigen Profil sind 252 normale Plugins aktiv; eine neue Nolvus-Basis kann eine andere Anzahl mitbringen.

Die frühere Sicherung der 183 gelöschten inaktiven Mods bleibt separat unter `updates/20261006-BodySlide-Reparatur-Bereinigung/inactive-mods-current-profile.tar.zst` erhalten. Sie wird beim normalen Migrationsrestore nicht eingespielt.

Installationsbericht und Prüfnachweise liegen im Unterordner `installation-records` des aktuellen Zusatzbackups. Maßgeblich sind dessen `COMPLETE.json` und der Wurzelzeiger `LATEST_BACKUP.json`.
