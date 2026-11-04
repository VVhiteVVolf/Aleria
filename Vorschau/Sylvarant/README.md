# Sylvarant · Vorbereitung

Lokale Länder-Vorbereitungsseite für die östliche Großprovinz des Kaiserreiches
Argentum. Gelieferte Hausnamen bleiben erhalten; neue Haus- und Ortsnamen
werden nach Auftrag erst am Ende ausgearbeitet. Die aktuelle Architektur
verwendet dafür neutrale Arbeitsnummern und stabile IDs.

## Kartenquelle

Die Quelle liegt unter
`C:/Users/fhg_r/Downloads/Länder/Das Kaiserreich Argentum/Sylvarant`.
Die tatsächlich angesehene Karte `Kaiserreich (Sylvarant).png` ist
8126 × 8192 groß. Sie zeigt sieben abgegrenzte Archonate und eine kaiserliche
Domäne mit ausdrücklich bezeichneter Hauptstadt. Zwei Beschriftungen im
ungeteilten blauen Südostgebiet begründen keine neue Grenze oder ein achtes
Archonat.

26 Ortsmarker wurden pixelbasiert gemessen: 18 Kreise, sieben Quadrate und
eine Raute. Markerformen werden nicht in zusätzliche Hausränge übersetzt.
Haus Mede beginnt gemäß Vorgabe in der Hauptstadt-Raute `ort-15`.
Alle anderen Sitze und Ränge bleiben zunächst offen. Regionalbanner werden
ausdrücklich ausgelassen.

`scripts/prepare-map.py` verwendet die bereits vorhandene kulturfreie
Markeranalyse und erstellt ein 4063 × 4096 großes WebP ohne Änderung von
Grenzen, Namen oder anderen Karteninhalten. Das große Original bleibt an
seiner Quelle erhalten; Hashes und Marker stehen in `sources/map-sources.json`.
`scripts/build-territory-data.mjs` verbindet die Messwerte mit den visuell
geprüften Gebieten und erzeugt die neutralen Territorydaten. Wappenpins und
Ortsnummern sind getrennte Anzeigeschichten.

## Gelieferte Originalwappen

`source-import.json` konfiguriert den vorhandenen Shared-Source-Importer.
`scripts/prepare-sources.py` übernimmt 17 Hauswappen und das Reichswappen
byteidentisch nach `assets/originals/`; die separaten WebP-Vorschauen
verändern die Originaldateien nicht. Eingangsliste und Prüfsummen stehen in
`sources/supplied-emblems.json` und `assets.source.json`.
`sources/supplied-house-notes.json` besitzt die sichtbar geprüften Motive,
Paletten und ausschließlich belegten Hauskontexte.

Die Bildproduktion ergänzt 13 Wappen: neun noch fehlende Ortswappen
und vier weitere. Daraus ergeben sich 30 Häuser insgesamt. Mede ist bereits
in den siebzehn gelieferten Häusern enthalten und wird nicht doppelt angelegt.
Die vorhandene kaiserliche Hausfigur wird unverändert wiederverwendet.

## Bildproduktion

Die sieben Klassenprototypen und die individuellen Hausdarstellungen verwenden
den freigegebenen matten Figurenstil. Die Rüstungen bleiben lateinisch-römisch
mit ritterlichen Elementen; Schilde stehen als große rechteckige Scuta auf dem
Boden. Nur Pullo verwendet den arkanen Schattenkämpfer mit zwei Schwertern.
Die bereits freigegebene Mede-Darstellung wird aus Leukonia eingebunden.
Berittene Figuren verweisen auf den vorhandenen Equo-Eintrag im Bestiarium.

Das aktive Provinzwappen ist Revision **v2**: Der Legionär streckt sich mit dem
ganzen Körper sehnsüchtig nach der Berührung des geflügelten Halbgottes.
Seine freie Hand liegt an der Brust; die frühere gelassene Haltung ist ersetzt.
Die vorherige Generatorfassung bleibt als Quelle erhalten.

Alle Bilder entstehen mit dem eingebauten `image_gen`-Werkzeug. Vollständige
Prompts, Bildreferenzen, Tooloriginalpfade und Hashes liegen in `sources/`.
Die neuen PNG-Generatororiginale liegen unter `assets/*/generated/`, die
verwendeten PNGs und WebP-Vorschauen unter `production/` beziehungsweise
`previews/`. Die gelieferten Wappen bleiben in `assets/originals/` unverändert.
Quellen und verworfene Bildfassungen werden nicht statisch veröffentlicht.

`scripts/prepare-warriors.py` konfiguriert die gemeinsame Figurenaufbereitung,
`scripts/prepare-heraldry.py` die gemeinsame kreisrunde Wappenaufbereitung.
Die vom Nutzer erlaubte technische Alpha-Bereinigung bewahrt die RGB-Werte
der Originale. `scripts/build-art-catalog.mjs` erzeugt ausschließlich die
kompakten öffentlichen Bilddaten, ohne Prompts oder lokale Dateipfade.

Beispielablauf: `prepare-heraldry.py`, `prepare-warriors.py build`,
`build-art-catalog.mjs`, danach die Tests unter `tests/` und die beiden
Alpha-/Dateiprüfungen. PNGs werden nur bewusst neu aufbereitet, ohne
Originale zu überschreiben.

Erstprüfung vor den späteren Bildkorrekturen: 46 Fach- und Regressionstests bestanden, 35 neue Figuren
ohne Alpha- oder Randfehler, 14 neue Wappen mit deckendem Innenkreis und
transparentem Außenbereich. Alle 49 aktiven Generatororiginale und zwei
frühere Versionen wurden byteidentisch zu ihren Tooloriginalen bestätigt.
Alle 30 Hauspaare und sieben Klassen wurden in Bildübersichten angesehen.
Der Browser-Sichttest bleibt wegen des CUA-`timeoutMs`-Verbindungsfehlers
eingeschränkt; die HTTP-Vorschau antwortet mit 200. Die Diagnosebelege
liegen unter `diagnostics/argentum-sylvarant/`, die Zusammenfassung in
`sources/review/completion-review.json`.

### Bildkorrekturen vom 4. November 2026

Sieben Hausdarstellungen verwenden jetzt versionierte v2-Bilder:
Cerunia trägt einen geraden Gladius, Rinia einen Dreizack; die Marinekrieger
mit Schlüssel- und Ankerwappen erhalten gerade Schwerter. Maborel besitzt
einen offenen spätrömischen Helm und kleine Lamellen in abwechselnd
olivgrünen und hellen Reihen. Stalitia und der Kapitellkrieger erhalten
reichere Harnische mit vollständig bedeckten Beinen. Der Marineprototyp
wurde ebenfalls auf einen geraden Gladius umgestellt.

Die Auswahl wird durch `sources/house-warrior-revisions.json` und
`sources/prototype-revisions.json` bestimmt. Einzelprompts und Toolbelege
liegen in `sources/warrior-revisions-20261104-*-{jobs,results}.json` sowie
`sources/prototype-03-v2-{job,result}.json`; Erzeugung mit eingebautem
`image_gen`. Neue Original-PNGs liegen unter `assets/warriors/generated/`
mit Suffix `-v2`, die aktiven PNGs und WebPs in den entsprechenden
`production/`- und `previews/`-Ordnern. Frühere Fassungen bleiben als
Quellen erhalten und werden nicht mehr statisch veröffentlicht.

Acht betroffene Fachprüfungen und der Alpha-/Rand-/RGB-Audit aller 43
erhaltenen Figurenfassungen bestanden. Die acht neuen Generatororiginale
sind byteidentisch zu ihren Tooloriginalen; 23 andere Häuser bleiben
unverändert. Die v2-Bilder wurden gemeinsam auf neutralem Grund angesehen.
Prüfbelege: `diagnostics/argentum-sylvarant/revisions-20261104/` und
`sources/review/warrior-corrections-20261104.json`. Der Browserstatus bleibt
wegen des bekannten Verbindungsfehlers eingeschränkt.

## Verantwortlichkeiten

- `realm-context.mjs` besitzt die örtliche Gestaltung und verwendet die
  bestätigte Reichsordnung aus Leukonia als gemeinsame Datenquelle.
- `territory-data.mjs` besitzt die Karte, sieben Archonate, die Domäne,
  26 Orte und die bestätigte Mede-Ausgangszuordnung.
- `house-data.mjs`, `art-data.mjs` und `warrior-data.mjs` werden von der
  Bildproduktion gepflegt. Die UI lädt keine Promptarchive.
- `art-view.mjs`, `map-view.mjs` und `proposal-render.mjs` besitzen die
  Sylvarant-Sektionen. Gemeinsame Bild-, Sitzkarten- und Reichsordnungsrenderer
  werden wiederverwendet.
- `art-dialogs.mjs` kombiniert örtliche Fakten mit `renderHouseDossier` und
  dem neuen kulturfreien Shared-Controller `art-dialog-session.mjs`.
  Er besitzt Fokus, Schließen und Auswahl aus dem Dossier.
- `house-placement.mjs` und `placement-state.mjs` konfigurieren die
  gemeinsamen Karten-, Drag-, Import-, Undo- und Speicherfunktionen.
- Die Styles bleiben in Kontext, Karte und Bildergalerie aufgeteilt.

Der eigene Speicherschlüssel lautet
`aleria:proposal:sylvarant:placements:v1`. Fremde und unvollständige Importe
werden atomar abgewiesen. Hausränge, Genealogien, kanonische Register und
Firebase-Daten werden durch den Sitzentwurf nicht geändert. Die Umsetzung
bleibt lokal und verwendet bei einer späteren Freigabe den bestehenden
Aleria-Releaseweg.
