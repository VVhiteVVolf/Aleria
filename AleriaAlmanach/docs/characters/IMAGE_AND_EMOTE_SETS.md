# Bilder- und Emote-Sets

Stand: 3. August 2026

## Datenmodell

Charaktere speichern benannte Varianten in `imageSets`. Das unveränderliche Set `standard` spiegelt sein Portrait und seine Emotes zusätzlich in die bisherigen Felder `portrait` und `emotes`. Alte Clients, bestehende Kommentare und ältere Exporte bleiben dadurch lesbar.

Jedes Set besitzt eine stabile ID, einen Namen, ein Hauptportrait und bis zu 80 Emotes. Pro Charakter sind höchstens 20 Sets vorgesehen. Neue Sets beginnen vollständig leer. `imageSetSchemaVersion: 1` und `imageSetsOverride: true` markieren den neuen Speicherstand.

Kommentare speichern neben dem fertigen Portrait-Link auch `imageSetId` und `emoteIndex`. Bereits veröffentlichte Beiträge verändern ihr Bild daher nicht, wenn ein Set später bearbeitet wird. Beim Erstellen und Bearbeiten eines Beitrags kann das Set gewechselt werden; die Emote-Paletten aller Abschnitte folgen dieser Auswahl.

## Imgur-Alben

Der Browser sendet Album-IDs ausschließlich an `/.netlify/functions/imgur-album`. Die Function liest öffentliche Alben über Imgurs offiziellen Endpunkt `GET /3/album/{albumHash}/images`. Dafür muss in Netlify die Umgebungsvariable `ALERIA_IMGUR_CLIENT_ID` gesetzt sein. Eine Client-ID wird bewusst nicht in JavaScript oder Firebase gespeichert.

Ohne diese Variable bleiben Einzel- und Mehrfachlinks vollständig nutzbar; der Albumimport zeigt eine konkrete Konfigurationsmeldung. Auf einen HTML-Scraper wird verzichtet, weil dieser von Imgurs Seitenmarkup und CORS-Verhalten abhängig wäre.

## Import und Export

Charakterexporte verwenden Archivversion 3 und enthalten alle Sets. Version 1 und 2 sowie ungekennzeichnete Altdaten werden beim Laden automatisch in ein Standard-Set überführt. Das Löschen oder Leeren eines zusätzlichen Sets verändert das Standardportrait nicht.
