# Deployment und temporäre Bereinigung · 27. Oktober 2026

Entfernt: 73,081 einzeln geprüfte Dateien aus zwölf alten Vite-Builds,
zusammen 23.28 GiB. Zusätzlich 305.454.124 Bytes
erneut herunterladbarer NPM-Cache. Gesamter entfernter Bestand: 23.56 GiB.
Keine Ausnahmen beim Löschlauf. Alle entfernten Build-Dateien hatten nur einen Hardlink.

14,623 ausgesparte Dateien in diesen Ordnern sind weiterhin vorhanden;
ihre Anzahl wurde je Ordner nachkontrolliert. Anleitungen, Methoden, Vorlagen,
unklare Dateien, Originalbilder, Browserprofile, Live-Daten-Schnappschüsse,
private Sicherungen und Git-Historie wurden nicht bereinigt.
Die benötigte Netlify-CLI liegt dauerhaft unter `netlify/.cli/`.

Der geprüfte neue Release a8622e93eec4bbafc766381b2846b35901ca2332 ist live:
https://dieweltvonaleria.netlify.app
Deploy-ID: 6ae0fc59f61edd9f87793fa7. 28,232 öffentliche Dateien und
sechs Functions abgeglichen. 29 Build-Gruppen mit 1.012 Tests bestanden;
zusätzlich vier Python-Schutzprüfungen. Temporäre Release-Pakete anschließend entfernt.
Rund 0,67 GiB reine Generator- und Diagnosequellen werden nicht mehr statisch
hochgeladen; ihr Quellbestand bleibt erhalten. Die aktiven großen Bildbestände
bleiben unter ihren bisherigen URLs verfügbar.

Die Methode verwendet einen normalen Push mit `[skip netlify]`, danach einen
geprüften direkten Deploy. Die globale Build-Automatik der Web-Publisher bleibt
unverändert. Es gibt keinen Force-Push und keine Historienumschreibung.

- [Release-Anleitung](../../netlify/docs/LOCAL_RELEASES.md)
- [Bereinigungsregeln](../../netlify/docs/TEMPORARY_STORAGE.md)
- [Ergebnis mit Größen und Belegen](cleanup-summary.json)
- [Komprimierter Wiederherstellungsplan](cleanup-plan.json.gz)

Der komprimierte Plan enthält für jede entfernte Datei Pfad, Git-Blob,
Dateiidentität und Löschgrund. Seine Dekompression wurde bytegleich mit dem
ursprünglichen Plan verglichen. Private Berichtsdaten sind vom Webpaket ausgeschlossen.
