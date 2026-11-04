# Calidaria · Vorbereitung

Lokale Besprechungsseite für das ehemals Tlapatlan genannte Archipel im
Kaiserreich Argentum. Die Kultur der Tlapanui wird vor allem durch Rapa Nui,
ergänzend durch aztekische und Maya-Einflüsse bestimmt. Die 17 Tlapanui-Häuser
tragen Namen nach dem gelieferten Nuatlapa-Sprachmodul; die elf Siedlerhäuser
argentische Familiennamen. Orts- und Klassennamen bleiben offen.

## Quellen und Karte

Die beiden gelieferten PNGs liegen unter
`C:/Users/fhg_r/Downloads/Länder/Das Kaiserreich Argentum/Calidaria Provinz`.
Originale bleiben dort erhalten. `scripts/prepare-map-sources.py` erstellt
4096 × 2349 große WebP-Fassungen mit unveränderten Grenzen und Beschriftungen.
Die Quittungen unter `sources/map-sources.json` und `assets.source.json`
enthalten Originalhashes, Ausgabehashes, Dimensionen und gemessene Marker.

Die tatsächlich angesehenen Karten zeigen sieben Archonate und eine eigene
kaiserliche Domäne. 22 Orte sind markiert: 14 Kreise, sieben Quadrate und eine
Raute. Es gibt keine eingebrannten Ortsnamen. Aus der Markerform wird kein
zusätzlicher Rang abgeleitet. Der Nutzer hat Haus Mede ausdrücklich in der
durch die Raute markierten Hauptstadt bestätigt. Der Ortsname bleibt offen.

`scripts/build-territory-data.mjs` verbindet die gemessenen Zentren mit den
visuell geprüften Gebietszusammenhängen und erzeugt `territory-data.mjs`.
Stabile neutrale Orts-IDs und Arbeitsnummern bleiben unabhängig von späteren
Eigennamen. Versetzte Wappen und Ortsnummern sind eigene HTML-Bildschichten.

## Verantwortung und Wiederverwendung

- `realm-context.mjs` besitzt Calidarias Kultur und verwendet die bestätigte
  Reichsordnung aus Leukonia als gemeinsame Quelle.
- `territory-data.mjs` besitzt die sieben Archonate, die Domäne, beide
  Kartenvarianten und die 22 neutral nummerierten Orte.
- `house-data.mjs` und `warrior-data.mjs` sind die von der Bildproduktion
  gepflegten Kataloge. Die UI liest keine Promptarchive.
- `art-view.mjs`, `map-view.mjs` und `proposal-render.mjs` besitzen die
  Calidaria-Komposition. Kulturfreie Bild-, Sitzkarten- und Reichsordnungs-
  Renderer werden aus der vorhandenen Leukonia-Seite wiederverwendet.
- `placement-state.mjs` konfiguriert den gemeinsamen atomaren Entwurfszustand;
  `house-placement.mjs` verbindet die gemeinsamen Karten-, Drag-, Import- und
  Speicherfunktionen. Der Variantenschalter verwendet die vorhandene Logik.
- `art-dialogs.mjs` zeigt Wappen, Hauskrieger und Prototypdetails. Mede verwendet sein
  vorhandenes Wappen und seine vorhandene Prätorianer-Ritterdarstellung aus
  Leukonia unverändert. Die neuen Hausdarstellungen orientieren sich an Wappen,
  Farben und kultureller Prägung sowie den passenden Kriegerrollen.

## Umfang

Der bestätigte Wappenpool umfasst 22 Orte plus sechs weitere Zeichen, also
28 Hauswappen. Elf sind argentisch geprägt, 17 Tlapanui-geprägt; die Rundung
entspricht ungefähr dem gewünschten Verhältnis 40 zu 60 Prozent. Das ist
ein Verhältnis der neuen Hausentwürfe und keine Bevölkerungsstatistik.
Das vorhandene Haus Mede kommt zusätzlich hinzu: 29 Häuser insgesamt,
Mede in der Hauptstadt und 28 neue Häuser zunächst ohne Sitz und Rang.
Die fünf beschriebenen Tlapanui-Kriegerprototypen werden separat gezeigt.
Nach dem Folgeauftrag erhält jedes der 28 neuen Häuser eine eigene
Kriegerdarstellung; zusammen mit Medes vorhandener Figur sind es 29 Hausfiguren.

Das Provinzwappen Calidarias und das antike Hammerhaiwappen Tlapatlans
werden als eigene Zeichen neben den Hauswappen geführt. Ihre aktiven V2-
Fassungen sind flächiger beziehungsweise stärker tribal gestaltet; die
Auswahl steht in `sources/artwork-revisions.json`, die V1-Originale bleiben
erhalten. Die jüngste
Maskenkorrektur verlangt furchterregende Grimassen; spätere Hausberserker
mit Wappentieren erhalten fast dämonische Tierfratzen. Die aktive
Berserkerfassung liegt unter `prototype-03-v2`, die frühere Fassung bleibt
als Quelle erhalten. Auch der schlichtere Nautilusrahmen wird über eine
explizite Quellenrevision geführt.

## Sprache und Hausnamen

Die Zuordnung der 28 neuen Hausnamen steht in
`sources/house-name-assignments.json` und wird vom Katalog-Builder übernommen.
Die 17 Tlapanui-Namen sind eigenständige Familiennamen nach dem gelieferten
Nuatlapa-Modul, keine Kopien der Vornamenlisten und keine behaupteten
wörtlichen Tierübersetzungen. Die elf Siedlerhäuser behalten argentischen
Namensklang. Geprüfte Sprachquellen und ihr Herkunftsbeleg stehen unter
`sources/language-context/`; das Originalpaket bleibt unverändert in Downloads.


## Bildaufbereitung

`scripts/prepare-warriors.py` konfiguriert ausschließlich die gemeinsame
Krieger-Pipeline. `build`, `audit`, `contact` und `review` bleiben deren
unveränderte Befehle. Die Generatororiginale und die RGB-Kanäle der
1024 × 1536 großen Produktions-PNGs bleiben erhalten. Vorschauen sind
768 × 1152 groß. Die Alpha-Aufbereitung füllt keine Figurenlücken.

`scripts/prepare-heraldry.py` verarbeitet die vorhandenen Generatororiginale
über die bestehende gemeinsame Wappenaufbereitung, mit exaktem Kreis,
deckender Innenfläche und transparentem Außenraum. Unveränderte bereits
geprüfte Dateien werden beim erneuten Aufruf übersprungen. Die Quittung
liegt in `sources/emblem-asset-receipts.json`.

`scripts/build-art-catalog.mjs` liest die drei Wappen-Jobkataloge, die
fünf Prototypen und die drei Hauskrieger-Jobkataloge. Die neuen Bilder
werden mit dem eingebauten Bildwerkzeug erstellt; vollständige Prompts
und Ergebnisbelege liegen in den jeweiligen `sources/house-warriors-*-jobs.json`
und `sources/house-warriors-*-results.json`. Der Builder veröffentlicht ausschließlich kurze Darstellungsdaten;
Prompts und Generatorpfade verbleiben unter `sources/`. `ready:true` setzt
eine vorhandene Produktionsdatei und eine vorhandene Vorschau voraus.
Die Kataloge lassen die Ränge und Sitze der 28 neuen Häuser offen. Mede
behält die kaiserliche Stellung und beginnt in der durch die Raute
markierten Hauptstadt.

Der Entwurf verwendet ausschließlich
`aleria:proposal:calidaria:placements:v1`. Fremde oder unvollständige Importe
werden vor einer Zustandsänderung abgewiesen. Keine kanonischen Register,
Genealogien oder Firebase-Daten werden verändert. Veröffentlichungen folgen
dem bestehenden Aleria-Releaseweg und werden hier nicht ausgelöst.
