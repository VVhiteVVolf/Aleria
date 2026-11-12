# Cenyrs Grafschaftsnavigation

`counties.source.json` ordnet die neun bestehenden Grafschaftskennungen ihren Bannern, Namen und Sitzen zu. Die Ziele stammen ausschließlich aus `kontinente.registry.js`. Fehlende Kennungen brechen den Build ab; Reihenfolge und ähnlich klingende Namen dienen nicht zur Auflösung.

`node Kontinente/scripts/build-cenyr-navigation.mjs` aktualisiert ausschließlich den markierten Abschnitt der bestehenden Königreichsseite. `--check` prüft ihn ohne Schreibzugriff und ist im normalen Territory-Releasegate eingetragen. Die Links funktionieren bereits ohne JavaScript.

Die gemeinsame `territory-page/territory-navigation-template.mjs` rendert dieselben Karten für diesen statischen Abschnitt und für strukturierte Herrschaften. Die frühere mehrzeilige Banner-Tabelle mit einzeln kopierten Links entfällt. Andere Tabellen, Bilder, Geschichten und Personen der Königreichsseite bleiben eigenständig erhalten.
