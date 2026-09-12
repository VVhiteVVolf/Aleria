# Bilder- und Emote-Sets

Stand: 12. September 2026

## Datenmodell

Charaktere speichern benannte Varianten in `imageSets`. Das unveränderliche Set `standard` spiegelt sein Portrait und seine Emotes zusätzlich in die bisherigen Felder `portrait` und `emotes`. Alte Clients, bestehende Kommentare und ältere Exporte bleiben dadurch lesbar.

Jedes Set besitzt eine stabile ID, einen Namen, ein Hauptportrait und bis zu 80 Emotes. Pro Charakter sind höchstens 20 Sets vorgesehen. Neue Sets beginnen vollständig leer. `imageSetSchemaVersion: 1` und `imageSetsOverride: true` markieren den neuen Speicherstand.

Kommentare speichern neben dem fertigen Portrait-Link auch `imageSetId` und `emoteIndex`. Bereits veröffentlichte Beiträge verändern ihr Bild daher nicht, wenn ein Set später bearbeitet wird. Beim Erstellen und Bearbeiten eines Beitrags kann das Set gewechselt werden; die Emote-Paletten aller Abschnitte folgen dieser Auswahl.

## Imgur-Alben

Der Browser sendet Album-IDs ausschließlich an `/.netlify/functions/imgur-album`. Die Function liest öffentliche Alben über Imgurs offiziellen Endpunkt `GET /3/album/{albumHash}/images`. Dafür muss in Netlify die Umgebungsvariable `ALERIA_IMGUR_CLIENT_ID` gesetzt sein. Eine Client-ID wird bewusst nicht in JavaScript oder Firebase gespeichert.

Ohne diese Variable bleiben Einzel- und Mehrfachlinks vollständig nutzbar; der Albumimport zeigt eine konkrete Konfigurationsmeldung. Auf einen HTML-Scraper wird verzichtet, weil dieser von Imgurs Seitenmarkup und CORS-Verhalten abhängig wäre.

Einrichtung: Eine eigene Anwendung bei [Imgur registrieren](https://api.imgur.com/oauth2/addclient), ihre Client-ID in Netlify als `ALERIA_IMGUR_CLIENT_ID` im Functions-Kontext für Production hinterlegen und anschließend neu deployen. Für das Lesen öffentlicher Alben genügt die Client-ID ([Imgur-Authentifizierung](https://apidocs.imgur.com/)); weder ein Client-Secret noch GitHub-Rechte werden benötigt. Zugangsdaten gehören nicht ins Repository. Ein rein statischer Entwicklungsserver stellt die Function nicht bereit; dort muss die Function über Netlify Dev laufen.

Die Function unterscheidet fehlende Konfiguration (`IMGUR_NOT_CONFIGURED`), abgelehnte Client-ID (`IMGUR_AUTH_FAILED`), nicht erreichbare Alben, Anfragelimits und ungültige Antworten. Imgur-Anfragen laufen nach zehn Sekunden ab; der Browser wartet höchstens 15 Sekunden. Ein HTML-404 eines statischen Hosts wird als fehlender Albumdienst gemeldet.

Geteilte Links mit Titel vor der Album-ID, mobile Imgur-Links sowie Links ohne `https://` werden erkannt. Wechselt der Nutzer während des Abrufs die Figur oder das Set, wird die verspätete Antwort nicht in das andere Set eingefügt. Bereits bearbeitete Labels bleiben bei erneutem Import erhalten.

## Sofortiger Linkimport

`buildCharacterAvatarImport` übernimmt syntaktisch gültige Bildlinks synchron, prüft Duplikate und das 80er-Limit und verändert die übergebenen Slots nicht. Das Herunterladen der Bilder ist keine Voraussetzung für die Übernahme. Die Vorschauen laden im Raster; bei einem Ladefehler bleibt der Link erhalten und das betroffene Feld zeigt einen Hinweis. Das bestehende Autosave sichert die Links im Hintergrund und bündelt schnelle Änderungen weiterhin über 700 ms.

Beim Ziehen verlinkter Bilder wird die Bildquelle aus `text/html` vor dem umgebenden Seitenlink bevorzugt. Reine Links unterstützen `text/uri-list`, `text/plain` und Firefox-URL-Daten. Das Raster erneuert nur geänderte Felder, damit vorhandene Vorschauen und aktive Beschriftungsfelder erhalten bleiben.

## Import und Export

Charakterexporte verwenden Archivversion 3 und enthalten alle Sets. Version 1 und 2 sowie ungekennzeichnete Altdaten werden beim Laden automatisch in ein Standard-Set überführt. Das Löschen oder Leeren eines zusätzlichen Sets verändert das Standardportrait nicht.
