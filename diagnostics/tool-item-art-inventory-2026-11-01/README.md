# Werkzeugbilder: Bestand und gezielte Zuordnung

Der Standardkatalog enthält genau **43** Artikel in `werkzeuge` und **0** in `sonstiges`. Anfangs zeigten alle 43 denselben Markt-Platzhalter `https://i.imgur.com/UbjFi5T.png`.

Bereits vorhanden waren **57** transparente Güterbilder im Pendrwn-Ordner: die **43** exakt passenden Werkzeugmotive und **14** weitere Modulwaren. Das vollständige alte Bildmanifest enthält außerdem **17** Porträts/Szenen, insgesamt also **74** Bilder. Diese Zahlen bezeichnen unterschiedliche Mengen und werden nicht miteinander gleichgesetzt.

Alle 43 passenden Motive wurden in `tool-items-contact-sheet.png` tatsächlich angesehen. Sie entsprechen dem handgemalten Inventarstil. Ihre bestehenden PNGs sind quadratisch (1254 × 1254), haben echte Transparenz (belegter Alphabereich 0–255) und stimmen sämtlich mit den SHA-256-Prüfsummen der ursprünglichen Bildvalidierung überein. Es wurde kein neues Warenmotiv erzeugt und kein vorhandenes Bild verändert. Das Kontaktblatt ist lediglich ein separater Diagnosebeleg.

`tool-image-inventory.json` enthält die exakten Standard-IDs, Bilder, Herkunftsreferenzen, vorhandenen Kandidaten, Prüfwerte und die 14 übrigen Dateinamen. Nach Roots zentralem Katalogbau auf Version `36e5f594322735b9` sind alle 43 aktuellen Köpfe bebildert; **kein Standard-Werkzeugbild fehlt**.

Die Produktionszuordnung liegt in `modules/item-register/item-register-standard-artwork.js`. Der Kataloggenerator übernimmt sie vor dem Erzeugen neuer unveränderlicher Definitionen. Die gemeinsame Bildprojektion ersetzt für exakt verknüpfte Standard-IDs ausschließlich den bekannten Markt-Platzhalter beziehungsweise fehlende Bilder. Absichtlich eigene Bilder, eigene Definitionen/Unikate, fremde IDs und bloß ähnlich benannte Gegenstände bleiben erhalten. Alte Definitionen und gespeicherte Besitzdaten werden dafür nicht umgeschrieben.

Register, Registerauswahl, bestehende Inventarprojektion, klassische Auswahl und Gruppenbestandskarten verwenden dieselbe Auflösung. Ein alter gepinnter Rucksackverweis behält seine historische Definition und Regeln, erhält in der Leseansicht jedoch sein passendes vorhandenes Bild.

Prüfprotokoll: `tool-artwork-tests-final.log`. Die zentrale Katalog-/Mechanics-/Aushang-Generierung führte ausschließlich Root aus; die Inventur selbst startete keine globalen Generatoren. Der zuvor laufende UI-Adapter bleibt für Root geöffnet.
