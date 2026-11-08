# Naht & Siegel

Die kleinere professionelle Maerllys-Schneiderei in Gwynthor kleidet Hauspersonal
und Gefolge ein. Sie kooperiert mit der Göttlichen Eleganz und besitzt einen
eigenen Schwerpunkt: Arbeitskleider, Zofen- und Dienergarnituren, Dienstlivreen
sowie Amts- und Verwaltungsgewänder für Arbeitgeber und Adelshaushalte.

`maerllys-module.mjs` liefert sechs Seiten über die vorhandenen Almanach-Templates:
Laden, Familienhandwerk, Dienstleistungen, Hierarchie, Sortiment und Verkaufsraum.
Nur der Verkaufsraum ist eine Szene. Jede Seite besitzt eine eigene Illustration;
die Dienstleistungen verwenden zusätzlich einfache Icons für die einzelnen
Angebotsarten. Das hölzerne Schild dient als Modul- und Hierarchiesymbol.

`maerllys-collection.mjs` ist die Preis- und Inhaltsquelle der 51 Garnituren:
15 Hausdienst-, 15 Verwaltungs-, 13 Gefolge- und acht Außendienstmodelle.
Alle Preise sind ganze Kupfertaler, 18–1.200 KT je beschriebener Garnitur.
Die native Katalogprojektion wählt lediglich KT/ST/GT für die Anzeige.
Gegenstandsbesitz, Kampfdaten, Arbeitsverträge und Mengenrabatte werden dadurch
nicht vergeben. Die allgemeinen Einstiegsmodelle liegen über Gwniwrs einfachen
Garnituren; der fachliche und gehobene Dienstbereich bleibt unter der kostbaren
Festmode der Eleganz. Die drei Häuser behalten ihre vorhandenen Preisquellen.

`maerllys-hierarchy.mjs` bezieht die vier heutigen Kernkräfte aus dem bestehenden
Familienstammbaum: Iorwerth, Bronwen, Geraint und Llio. Elf noch offene Stellen
bleiben Silhouetten, darunter zwei Ausbildungsplätze. Nia bleibt Zofe der
Prinzessin Isobel Draig; Rhys bleibt im Alltagsverkauf der Göttlichen Eleganz.
Beide sind Familienverbindungen und erhalten keine zweite Ladenstelle.

Die Dienstleistungsseite beschreibt die Bedarfserhebung, Musterfreigabe,
Einzelanproben innerhalb größerer Aufträge, bestätigte Hausfarben und Zeichen,
Reparaturen sowie spätere Ergänzungen. Preise und Termine für Sonderaufträge
werden jeweils vereinbart. Im Modul sind keine bestehenden Kundenverträge oder
festen Liefermengen behauptet.

Die 51 Warenbilder sind eigene transparente Einzelbilder im vorhandenen
Fantasy-Inventarstil auf weißen kopflosen Puppentorsi. Sechs eigene Szenen im
gespeicherten Anime-Stil und ein eigenes Holzschild ergänzen sie. Originale,
vollständige tatsächliche Prompts, Referenzhashes und Aufnahmebelege bleiben
lokal unter `diagnostics/gwniwr-maerllys-20261108/maerllys/art/` erhalten.

`node AleriaAlmanach/scripts/build-maerllys.mjs` erzeugt ausschließlich
`maerllys-data.js` und den nativen Modulexport unter
`Charakter Archiv Exporte/Module/Naht und Siegel/`.
`--check` prüft dieselben beiden Dateien lesend. Registrierung, begrenzte
Figurenveröffentlichung und isolierter Release gehören zum koordinierten
Gwniwr-/Maerllys-Auftrag, nicht zum Modulbuilder.
