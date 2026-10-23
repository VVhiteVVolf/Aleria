# Aleria: Weltseiten, Karten und Uathneach-Vorschau

## Umfang

Der vorbereitete Stand umfasst die noch nicht veröffentlichten Aleria-Änderungen:
Reichs- und Herrschaftsseiten mit verschachtelten Lehen, übertragene und korrigierte
Karten samt Markern und Regionen, Banner und Familienzuordnungen, die globale
Wappenansicht der Karten sowie Ereignis- und Kalendererweiterungen.

Die vollständige Uathneach-Werkstattvorschau ist zusätzlich als eigenständige Seite
unter `Vorschau/Uathneach/` enthalten. Drei Varianten, 26 Clans, Karten, Banner und
Wappen; Bearbeitungen bleiben sitzungslokal. Keine Einträge in den kanonischen
Weltregistern und keine Firebase-Schreibzugriffe.

Die alten Skyrim-/XTTS-Verzeichnisse bleiben gemäß `AGENTS.md` aus Aleria entfernt.
Ihre beabsichtigte Auslagerung nach `D:\Skyrim-Modding` wird im Commit nachvollzogen.

## Prüfungen

- Gemeinsame Netlify-Pipeline um eigene Prüfgruppen für Herrschaftsseiten,
  Kartensysteme, geänderte Familienakten, Ereignisse/Kalender und Vorschau ergänzt.
- Kartenprüfungen einschließlich Wappenansicht: 125 Tests bestanden.
- Geänderte Familien-, Rang- und Dunfal-Porträtdaten: 23 Tests bestanden.
- Vollständige Netlify-Releasepipeline bestanden; Buildpolicy nach der zusätzlichen
  Änderung nochmals separat geprüft.
- Almanach-Produktionsbuild mit Vite bestanden (bestehende Hinweise zur künftigen
  nativen Config-Auflösung und zur Größe der klassischen Bundles).
- Bestehende Stammbaum-Geometrieprüfung: 525 befüllte Akten, 20.220 Karten,
  keine Fehler.
- Vorschau live im verbundenen Chrome geprüft: drei Varianten vorhanden,
  Karten-Großansicht und alle 26 Wappen vorhanden, keine defekten geladenen Bilder.

## Bekannte historische Testabweichungen

Ein zusätzlicher Lauf über sämtliche `Stammbäume/tests/*.test.js` zeigte 17
fehlgeschlagene Erwartungen. Ein separater Lauf mit den vorhandenen Git-Modulen
von `dd63fe127a728e3eb60ef2946b2fbee7d0636057` reproduzierte dieselben 17 Fehler;
die Arbeitsdateien wurden dafür nicht zurückgesetzt.

Betroffen sind alte Gesamtbestandszahlen und Import-Fingerabdrücke in den Tests
für Aislearneach, Albenporträts, Blaithneach, Braigh, Brann, Ceitheach, Damh,
Faelaorn, Faerna und Mathgham sowie eine ältere Mehrfachvorkommens-Erwartung zu
Styr in `krumme-kanne-families.test.js`. Diese Erwartungen wurden nicht pauschal
überschrieben. Die Releasepipeline führt die zu den aktuellen Änderungen
gehörenden Familientests sowie die bestehenden Schema- und Geometrieprüfungen
aus; die historischen Importprüfungen bleiben gesondert nachzuarbeiten.

Lokale vollständige Protokolle: `.tmp/release-full-build.log`,
`.tmp/release-family-baseline.log`, `.tmp/release-final-build.log`.

## Veröffentlichung

Patricks Vorschau wurde als separater Netlify-Draft bereitgestellt:

https://6adaab2663682d4f0dc4a13c--dieweltvonaleria.netlify.app/Vorschau/Uathneach/

Dabei blieb der veröffentlichte Produktionsdeploy
`6ad92c532964ababbe0baa77` unverändert. Der Link ist öffentlich zugänglich;
`noindex,nofollow` verhindert keine Weitergabe.

Push und Produktivveröffentlichung sind durch diesen Vorbereitungsschritt noch
nicht ausgeführt.

## Nachprüfung der Estryll-Navigation

Die veröffentlichte Übersicht zeigt noch den alten Stand mit nur zwei verlinkten
Reichen. Der vorbereitete Stand enthält sämtliche elf bereits angelegten
Reichsseiten, Leitheach und die gemeinsame Alben-Ansicht. Zusätzlich wurden der
fehlende Bannerlink des Dunkelhains, direkt verlinkte Königreichsnamen und das
direkte Faelaorn-Ziel ergänzt. Die experimentelle Uathneach-Vorschau bleibt separat.
Bei der Sichtprüfung wurde außerdem die überlappende Unterzeile der breiten
Alben-Übersichtskachel in der gemeinsamen Komponente korrigiert.

Ein neuer Navigationstest gleicht die Einträge mit dem tatsächlichen Seitenregister
ab und prüft Namens- und Bannerlinks sowie vorhandene Ziele. Die 22 zugehörigen
Navigations-, Alben- und Faelaorn-/Skjaerheim-Tests bestehen.
