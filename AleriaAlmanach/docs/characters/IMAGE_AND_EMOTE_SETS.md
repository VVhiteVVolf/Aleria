# Bilder- und Emote-Sets

Stand: 12. September 2026

## Datenmodell

Charaktere speichern benannte Varianten in `imageSets`. Das unveränderliche Set `standard` spiegelt sein Portrait und seine Emotes zusätzlich in die bisherigen Felder `portrait` und `emotes`. Alte Clients, bestehende Kommentare und ältere Exporte bleiben dadurch lesbar.

Jedes Set besitzt eine stabile ID, einen Namen, ein Hauptportrait und bis zu 80 Emotes. Pro Charakter sind höchstens 20 Sets vorgesehen. Neue Sets beginnen vollständig leer. `imageSetSchemaVersion: 1` und `imageSetsOverride: true` markieren den neuen Speicherstand.

Kommentare speichern neben dem fertigen Portrait-Link auch `imageSetId` und `emoteIndex`. Bereits veröffentlichte Beiträge verändern ihr Bild daher nicht, wenn ein Set später bearbeitet wird. Beim Erstellen und Bearbeiten eines Beitrags kann das Set gewechselt werden; die Emote-Paletten aller Abschnitte folgen dieser Auswahl.

## Imgur-Alben

Der Browser sendet Album-IDs ausschließlich an `/.netlify/functions/imgur-album`. Ist `ALERIA_IMGUR_CLIENT_ID` in Netlify gesetzt, liest die Function öffentliche Alben über Imgurs offiziellen Endpunkt `GET /3/album/{albumHash}/images`. Eine Client-ID wird nicht im Browser-JavaScript oder in Firebase gespeichert.

Ohne Client-ID liest die Function die öffentliche Einbettungsseite `https://imgur.com/a/{albumHash}/embed?pub=true`. Der separate Adapter `netlify/lib/imgur-albums/embed-source.mjs` extrahiert ausschließlich deren JSON-Navigationsdaten, ohne JavaScript auszuführen. Album-ID und angekündigte Bilderzahl müssen mit der vollständigen Liste übereinstimmen. Bildadressen werden ausschließlich aus geprüften Imgur-Bild-IDs und Dateiendungen aufgebaut; Vorschaubilder, Werbung und sonstige Seitenbilder werden nicht übernommen. Beide Quellen verwenden denselben Bildfilter und dasselbe Limit von 80 Bildern.

Die Einbettungsdaten sind keine versionierte API: Wenn Imgur dieses Format ändert, muss ausschließlich der Adapter angepasst werden. Unvollständige oder unlesbare Daten führen zu `IMGUR_EMBED_UNAVAILABLE` statt zu einem Teilimport. Der Abruf folgt keinen Weiterleitungen, wartet höchstens zehn Sekunden und liest maximal 2 MiB. Am 12. September 2026 wurden das Nutzeralbum `kWZ0mdI` (neun PNG-Originale) und das öffentliche Album `3Txs1fv` geprüft.

Eine bereits vorhandene eigene Client-ID kann alternativ in Netlify als `ALERIA_IMGUR_CLIENT_ID` im Functions-Scope für Production hinterlegt werden; anschließend neu deployen. Die [Imgur-Dokumentation](https://apidocs.imgur.com/) verweist weiterhin auf die [Anwendungsregistrierung](https://api.imgur.com/oauth2/addclient), die bei der Prüfung nur zur Startseite weiterleitete. Eine neue Registrierung wird deshalb nicht als Voraussetzung vorausgesetzt. Für das Lesen öffentlicher Alben über die API genügt eine Client-ID; ein Client-Secret wird nicht benötigt. Zugangsdaten gehören nicht ins Repository. Ein rein statischer Entwicklungsserver stellt die Function nicht bereit; dort muss die Function über Netlify Dev laufen.

Die Function unterscheidet abgelehnte Client-IDs (`IMGUR_AUTH_FAILED`), nicht erreichbare Alben, Anfragelimits und ungültige Antworten. Bei einer gesetzten, aber abgelehnten Client-ID wird der Konfigurationsfehler weiterhin angezeigt. Imgur-Anfragen laufen nach zehn Sekunden ab; der Browser wartet höchstens 15 Sekunden. Ein HTML-404 eines statischen Hosts wird als fehlender Albumdienst gemeldet.

Geteilte Links mit Titel vor der Album-ID, mobile Imgur-Links sowie Links ohne `https://` werden erkannt. Wechselt der Nutzer während des Abrufs die Figur oder das Set, wird die verspätete Antwort nicht in das andere Set eingefügt. Bereits bearbeitete Labels bleiben bei erneutem Import erhalten.

## Sofortiger Linkimport

`buildCharacterAvatarImport` übernimmt syntaktisch gültige Bildlinks synchron, prüft Duplikate und das 80er-Limit und verändert die übergebenen Slots nicht. Das Herunterladen der Bilder ist keine Voraussetzung für die Übernahme. Die Vorschauen laden im Raster; bei einem Ladefehler bleibt der Link erhalten und das betroffene Feld zeigt einen Hinweis. Das bestehende Autosave sichert die Links im Hintergrund und bündelt schnelle Änderungen weiterhin über 700 ms.

Beim Ziehen verlinkter Bilder wird die Bildquelle aus `text/html` vor dem umgebenden Seitenlink bevorzugt. Reine Links unterstützen `text/uri-list`, `text/plain` und Firefox-URL-Daten. Das Raster erneuert nur geänderte Felder, damit vorhandene Vorschauen und aktive Beschriftungsfelder erhalten bleiben.

## Import und Export

Charakterexporte verwenden Archivversion 3 und enthalten alle Sets. Version 1 und 2 sowie ungekennzeichnete Altdaten werden beim Laden automatisch in ein Standard-Set überführt. Das Löschen oder Leeren eines zusätzlichen Sets verändert das Standardportrait nicht.
