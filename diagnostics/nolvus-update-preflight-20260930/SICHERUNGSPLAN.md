# Nolvus-Update: Bestandsaufnahme und Sicherungsplan

Stand: 30.09.2026. Installierte Version: 6.0.20, Ultimate.
Aktives Profil: Nolvus Awakening - SkyrimNet Beta25 Test.

**Es wurde kein Nolvus-Update gestartet und noch keine vollständige Sicherung angelegt.** Die Dateien in diesem Verzeichnis sind eine Bestandsaufnahme und keine Wiederherstellungskopie der Mods.

## Ergebnis

- 4.110 installierte Modordner ohne Separatoren.
- 519 Ordner fehlen im erhaltenen Basisprofil, zusammen 218,58 GiB logische Dateigröße; 376 davon sind aktuell aktiviert.
- 54 im Basisprofil aktive Originalmods sind im aktuellen Profil deaktiviert.
- Kein im Basisprofil aufgeführter Modordner fehlt.
- Profile enthalten zusammen etwa 1,98 GiB Saves, teilweise Kopien. .ess und .skse zusammen erhalten.
- Overwrite war zum Prüfzeitpunkt leer.
- Freier Speicher: E: etwa 14,6 GiB, D: etwa 513,7 GiB.

Das Basisprofil ist eine nützliche Vergleichsbasis, aber kein verifiziertes offizielles Manifest. Gleiche Ordnernamen beweisen nicht, dass deren Inhalt unverändert ist. Mod Organizer lief während der Bestandsaufnahme; vor einer abschließenden Sicherung müssen seine Einstellungen regulär gespeichert sein.

## Markierung ohne Umbenennen

`mod-classification.csv` ordnet jeden installierten Modordner als Zusatz gegenüber dem Basisprofil oder als möglicherweise veränderten Basisordner ein. Die Tabelle enthält Aktivierungsstatus, Pfad und für die Zusätze Dateianzahl/Größe. `disabled-base-mods.csv` dokumentiert die 54 deaktivierten Originalmods.

Für die Oberfläche sind MO2-Notizen/Kategorien geeignet, ohne die Modnamen oder Reihenfolge zu ändern. Kategorien allein verhindern kein Überschreiben. Ursprüngliche Nolvus-Modordner nicht zur Markierung umbenennen, verschieben oder löschen. Eine Kategorie wurde noch nicht in MO2 eingetragen.

## Vorgeschlagenes Backupziel

`D:\Nolvus-Backups\Awakening-6.0.20-vor-Update-20260930\`

Dieser Ordner wurde noch nicht angelegt. Er liegt außerhalb des vom Nolvus-Dashboard verwalteten Baums. Für die ermittelten Zusatzmods ist ausreichend Platz vorhanden; der zusätzliche Platzbedarf angepasster Originalmods, Downloads und Stock-Game-Dateien ist vor dem Kopieren noch zu bestimmen. Eine vollständige Instanzkopie ist die sicherste Variante, benötigt aber deutlich mehr als die 218,58 GiB der Zusätze.

## Sicherungsumfang

1. Alle 519 Zusatzordner einschließlich deaktivierter Varianten und meta.ini, versteckter/optionaler Dateien sowie der Originalordnernamen.
2. Alle Profile vollständig: modlist.txt, plugins.txt, loadorder.txt, lockedorder.txt, INIs, settings.ini und Saves mit SKSE-Begleitdateien. Aktivierungen und Reihenfolgen getrennt erfassen.
3. Angepasste Originalmods gesondert identifizieren und sichern. Bekanntes Beispiel: Stances - Dynamic Animation Sets - Nolvus Settings enthält unsere direkte AIO-Tastenänderung. Weitere Änderungen über vorhandene Installationsberichte/Backups sowie verfügbare Originalarchive abgleichen; verbleibende Unsicherheit nicht als unverändert behandeln.
4. Generierte Mesh-/Animations-/NPC-Ausgaben: BodySlide/OBody, Pandora und Integrationspatches. Zur Wiederherstellung aufbewahren, nach dem Update Kompatibilität prüfen bzw. passend neu erzeugen.
5. SkyrimNet vollständig: Personal Prompt Import, Runtime-Mod, eigene Aktionen, Konfiguration, Datenbanken, Stimmen und spielstandsbezogene Daten. Beide Prompt-Verzeichnisse erhalten. Laufende Datenbanken nur bei beendetem Skyrim kopieren. API-Zugangsdaten nicht in öffentliche Berichte schreiben.
6. Overwrite erneut prüfen; außerdem ModOrganizer.ini, portable MO2-Einstellungen, Kategorien, ausführbare Programme/Argumente und eigene MO2-Regeln sichern.
7. Instanzdefinition InstancesData.xml und installierte Version/Optionen dokumentieren; Änderungen im STOCK GAME einschließlich ENB/ReShade/ControlMap_Custom.txt und Root-Dateien einbeziehen. Separat liegende Dokumente-/Save-Verzeichnisse bei der eigentlichen Sicherung prüfen.
8. Manuelle Downloadarchive einschließlich installierter Unterordner und Download-Metadaten aufbewahren. Archive ersetzen nicht die Sicherung installierter Konfigurationen.
9. Vorherige Reparaturberichte und Backups mitnehmen, insbesondere um Änderungen an Originalordnern nachvollziehen zu können.

## Prüfung und spätere Übernahme

Die eigentliche Sicherung mit Datei-Manifest (relativer Pfad, Größe, SHA-256) prüfen. Kopierfehler, Links/Junctions, übersprungene Dateien und fehlende Quellen explizit behandeln. Keine Hardlinks als unabhängige Sicherung verwenden. Quell- und Zieldateien dürfen bei Rückspielen nicht unkontrolliert gelöscht oder gespiegelt werden.

Für diese stark angepasste Liste bevorzugt eine getrennte aktualisierte Installation aufbauen und die bisherige lauffähige Fassung behalten. Installationsweg und freier Speicher müssen vorher feststehen. Ein In-place-Update ist erst mit vollständiger Rückfallmöglichkeit vertretbar.

Nach dem Update nicht die alten kompletten modlist/plugins/loadorder-Dateien blind über die neue Basis kopieren. Stattdessen alte Basis, bisheriges angepasstes Profil und neue Basis abgleichen: neue offizielle Mods behalten, Zusätze einordnen, bewusste Deaktivierungen überprüfen und eigene Einstellungen gezielt übernehmen. Neue Vorgaben dürfen nicht versehentlich von alten kompletten INIs überdeckt werden. Alte generierte Dateien bei Bedarf neu bauen. Nur mit Kopien der Saves testen; Dateierhalt garantiert keine Save-Kompatibilität zur Zielversion.

## Offizielle Grundlage

https://www.nolvus.net/appendix/installer/customization

Die Nolvus-Anleitung erklärt gemeinsam genutzte Modordner, mögliche Neuordnung zusätzlicher Plugins und den Umgang mit angepassten Originalmods. Sie rät bei stark veränderten Listen ausdrücklich vom automatischen Update ab. Ein zweites MO2-Profil ist deshalb keine Dateisicherung.
