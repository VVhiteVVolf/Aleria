# Graue Weite – lokale Übernahme vom 19. Oktober 2026

**Ausschließlich lokal vorbereitet. Kein Commit, Push oder Deployment.**

## Quellen und Vollständigkeit

Die Grafschaftskarte `8da45549-13b9-4411-8bce-1adfdda70984` wurde direkt
über die verbundene Chrome-Erweiterung gelesen. Ihre Bearbeitungsansicht
enthält genau **102 Marker**. Alle haben einen eigenen vollständigen
öffentlichen Beschreibungstext. Markerliste, sämtliche Formularfelder ohne
Formulartoken sowie die DOM-Belege für Bildgröße und dargestellte Positionen
bleiben unter `worldanvil/` mit vier SHA-256-Belegen archiviert. Zusätzliche
Ortskarten und Artikeltexte wurden nicht als Quellen herangezogen.

Die elf gelieferten HTML-Dokumente liegen unverändert unter `sources/`.
`sources.json` enthält ihre Titel, Zuordnung und Prüfsummen. Alle **345
Erzählabsätze** wurden erhalten, einschließlich Banditentum und der
Flora-/Fauna-Unterkapitel der Grafschaft. Leere Platzhalter auf Unterseiten
werden nicht durch Inhalte der Grafschaft oder erfundene Texte ersetzt.

Die drei Originalbilder aus `C:\Users\fhg_r\Downloads\Graue Weite` haben
jeweils **4096 × 2492 Pixel**. `Karten/Cenyr/graue-weite/images.source.json`
belegt Originalnamen, Prüfsummen und die pixelgleichen verlustfreien
WebP-Fassungen von Normal-, Regions- und Markierungskarte.

## Daten und aktuelle Symbole

`Karten/Cenyr/graue-weite/{markers,places,territories}.source.json` ist die
gemeinsame Quelle für Karte und Ortsregister. Jeder der 102 Pins behält die
World-Anvil-UUID im stabilen Schlüssel und zusätzlich in `sourceRef`, zusammen
mit Karten-ID, Originaltitel, Quellenadresse und Originalkoordinaten.

World Anvil verwendet Pixelkoordinaten mit Ursprung links unten. Die
Umrechnung lautet `x / 4096` und `1 - y / 2492`. Für alle 102 Marker wurde
die Umrechnung unabhängig mit ihren tatsächlich gerenderten DOM-Positionen
abgeglichen. Die Karte und ihre Register verwenden dieselben vollständigen
Texte; reine BBCode-Formatierungen werden beim Übertragen entfernt.

**Die aktuelle Markierungsansicht verwendet ausschließlich interaktive
Aleria-Symbole und kein altes Rasterbild als Hintergrund.** Die vorhandene
Unterstützung für Marker ohne eigenes Hintergrundbild wird wiederverwendet.
Dadurch bleiben aktuelle Symbole auch zusammen mit der Regionskarte sichtbar.
Die gelieferte alte Markierungskarte bleibt unverändert als zusätzliche,
standardmäßig ausgeschaltete Ebene „Originale Markierungen“ verfügbar.

Ortsarten und Vorlagen folgen den Beschreibungen und dem bestehenden Katalog.
Beispiele: Jagdklingen-Standorte sind Jägerlager, Vyndar und die weiteren
Heiligtümer nutzen das Heiligtumssymbol, die Ruinenpforte ihren
Universitätsmarker, und verfallene Städte bleiben Ruinen. Die gemeinsamen
Standardgrößen sind Dot 80 / Schrift 50. Andere Karten und individuelle
Einstellungen werden dadurch nicht zurückgesetzt.

`node Karten/tools/import-graue-weite.mjs` prüft den Snapshot. Der schreibende
Import verweigert das Überschreiben bereits bearbeiteter Kartenstände.

## Seiten und territoriale Zuordnung

Die elf Seiten verwenden die gemeinsamen Seiten-, Rats-, Verwaltungs-,
Haus- und Ortskomponenten. Es wurde keine eigene Renderer- oder
Firebase-Logik ergänzt. Ortsregister sind nach Herrschaft und Ortsart
gegliedert; vollständige Beschreibungen öffnen sich innerhalb der Einträge.

Die Grafschaft zeigt 15 lokale Hausakten: elf große Häuser, drei antike
Crannath-Clans und das ausdrücklich erloschene Haus Tanwyn. Die antiken
Clans erhalten keinen unbelegten Aussterbestatus. Tanwyn wird auch bei
Achatsee geführt. Silberwald zeigt Draenog und Lyfant; Skelettküste bleibt
deren eigene Unterherrschaft mit Verweis auf Silberwald. Die getrennten
Vennyr-Herkunftsakten werden nicht als weitere örtliche Häuser angezeigt.
Bestehende Genealogien bleiben unverändert.

Fünf territoriale Banner und drei bislang nicht lokal zugeordnete
Politikporträts wurden aus den ausdrücklich gelieferten Bild-URLs archiviert.
Banner sind unter `Stammbäume/assets/images/regions/Cenyr/Graue Weite/`
einschließlich Herkunft und Prüfsumme dokumentiert; Portraitbelege liegen
unter `Kontinente/assets/images/politik/graue-weite/`. Hauswappen und
Herrschaftsbanner bleiben getrennte Bildtypen. Es wurden keine Bilder erzeugt.

- **Dolgan:** Der generische Titel „Fischersiedlung“ wird aus dem eigenen
  Markertext aufgelöst. Dolgan und Eldown gehören nach ihrer ausdrücklich
  beschriebenen Übertragung zu Blaidd, Aldwyn zu Gwaedlyd.
- **Zwei Orte namens Drynth:** Die Bauernsiedlung der Illygoden und die
  Flusssiedlung der Coedwig behalten getrennte IDs, Koordinaten, Texte,
  Vorlagen und Heraldik.
- **Mor Mhachaire:** Liegt gemäß Regionskarte und gräfischer Ortsübersicht
  in der Schimmerküste. Dun Liath liegt dagegen bei Silberwald.
- **Bragdyddol:** Wird gemäß Markertext von Teyrngarch gepachtet und als
  gebietsübergreifende Exklave geführt. Wappen und Banner gehören Teyrngarch;
  Morfil bleibt ausdrücklich als Verpächter benannt. Der Betreiber wird
  nicht als örtliches Vasallenhaus von Morfil ausgegeben.
- **Organisationen:** Jagdklingen, Ruinenpforte, Markt der Fortuna,
  Ritter des Trident, Achatjäger und weitere Betreiber bleiben zusätzlich
  benannt. Ein benannter Kommandant begründet kein neues territoriales Lehen
  seines Herkunftshauses. Aktuelle Nutzung und ehemalige Zugehörigkeit der
  Achatordensruine werden getrennt erhalten.
- **Glyndor/Glydor:** Am 19. Oktober vom Nutzer als Schreibfehler bestätigt.
  Im Register und der Vasallenübersicht steht Glydor genau einmal. Ein
  zusätzlicher Marker oder neuer Ort wurde nicht angelegt.
- Kopierte Überschriften wie „Herrschaft der Gwaedlyd“ auf der Blaidd-Seite
  werden durch den eigenen Seitentitel ersetzt. Strukturierte Namensangaben
  folgen den bestehenden Akten, etwa Cador Brithyll, Gronw Gwaedlyd und
  Islwyn Wivern. Erzähltexte wurden dafür nicht umgeschrieben.

## Fehlende Angaben

**Brandungsgrotte, Ostklippenhöhle, Seewindhöhle, Zwielichtszuflucht,
Verborgene Lichtung und Schattenstieg** sind nur in den gelieferten
Seitenübersichten erwähnt. Eigene Marker, Koordinaten und Beschreibungstexte
fehlen. Sie stehen im Ortsregister ausdrücklich unter „Position und
Beschreibung offen“; es wurden keine Positionen oder Texte erfunden.

Damit enthält das Ortsregister **108 Einträge**, die Karte **102 Pins**.
Für sämtliche tatsächlich vorhandenen Marker liegen vollständige Texte vor.

## Prüfung

- 74 gezielte automatisierte Prüfungen bestehen: acht neue regionale
  Prüfungen, die vorherigen Grafschaften, Verwaltungsabgrenzung, Vorlagen,
  Mediathek, Größenmigration, interaktive Marker ohne Raster und Bildquellen.
- Alle 345 Erzählabsätze stimmen mit den HTML-Quellen überein; die drei
  WebP-Karten sind pixelgleich mit den gelieferten PNGs.
- Direkte Chrome-Prüfung aller elf Seiten bei 1440, 1024, 768 und 390 Pixeln:
  richtige Hauszahlen, gleich hohe Hauskarten, keine seitlichen Überläufe,
  funktionierende aufklappbare Texte und abgegrenzte Verwaltungsfenster.
- Karte: 102 interaktive Marker, aktuelle lokal geladene Symbole, gemeinsam
  schaltbare Regionskarte, separat schaltbare Originalkarte und Größen 80/50.
  Beide Drynth-Orte und Bragdyddol wurden mit ihren Texten, Wappen und Bannern
  geöffnet. Die Ortskarte hat auch bei 390 Pixeln keinen inneren Überlauf.
- Die bestätigte Glydor-Korrektur wurde nach dem Abgleich erneut in der
  Grafschaft und auf Eichenlicht geprüft. `tests/graue-weite.browser.mjs`
  stellt zusätzlich den gemeinsamen lokalen Browserprüflauf bereit; die
  aktuelle visuelle Prüfung erfolgte über die Chrome-Erweiterung.
