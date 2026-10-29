# Blutstadt · Vorbereitungsseite

Lokaler Einstieg: `http://127.0.0.1:8882/Vorschau/Blutstadt/` bei laufendem
Aleria-Vorschau-Server. Buildless ES-Module; bestehender Netlify-Releaseweg.

Die Seite besitzt ausschließlich ihre Haus-, Gebiets- und Kontextdaten sowie
die Darstellung fester Stadtresidenzen. Karten-, Dialog-, Drag- und lokale
Speicherlogik bleiben in `Vorschau/shared`.

Alle 15 Häuser starten ohne äußeren Sitz. Die fünf Stadtresidenzen sind
Hausangaben, keine vorausgewählten Inselgebiete. Der lokale Zustandsadapter
prüft fünf eindeutige aristokratische Hauptsitze und Burgsitze für Bismarck
und Kastell auch beim Import; fehlerhafte Importe bleiben atomar.

Nach der konkreten Nutzerauswahl sind Blutdorf und Kronberg die beiden
städtischen Hauptorte; Rastenberg, Blutstein und Ewigwacht sind Burgsitze.
Kappel ergänzt als Bergbausiedlung südlich von Felsbrunn den grünen Bereich.
Die Daten umfassen damit 22 Außenorte und die Blutstadt.

Quellen und Bilder:

1. `scripts/prepare-art.mjs` erzeugt Importkonfiguration und vollständige Prompts.
2. `../shared/prepare-country-sources.py source-import.json` archiviert Quellen
   und erstellt WebP-Versionen ohne Veränderung der Kartengrenzen.
3. Einzelne Motive mit dem eingebauten Bildwerkzeug und den protokollierten
   Referenzen erzeugen; keine fremden API-Schlüssel erforderlich.
4. Nach der ausdrücklich erteilten Alpha-Freigabe die gemeinsamen Pipelines
   ausführen: `../shared/prepare-country-art.py Blutstadt --qa-dir diagnostics/blutstadt/heraldry`
   und `prepare-warriors.py build`; Originale und RGB bleiben unverändert.
5. `prepare-warriors.py audit --expected-count 15` und die Blutstadt- sowie
   gemeinsamen Platzierungstests prüfen Daten, Bilder und Entwurfsregeln.

Wappen/Krieger-Ausgaben und Prompts sind vom fachlichen Entwurf getrennt.
Der Auftrag und seine offenen Fragen stehen in `REQUEST.md`.
