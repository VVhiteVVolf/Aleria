# Gwynthorer Module · Veröffentlichung vom 17. Oktober 2026

Der Nutzer gibt nach der Theaterkorrektur ausdrücklich alle vorbereiteten Module für `master` frei. Die frühere lokale Veröffentlichungssperre ist aufgehoben.

Enthalten sind Zum Dritten Funken mit Haus Gofrann, Celtigerns Letzte Rast mit Haus Vann, deren passende Familienverbindungen und die Ergänzungen an Göttlicher Eleganz sowie das Gwynthorer Theater. Lachende Nixe bleibt als bereits vorhandenes vollständiges Modul erhalten. Die sechs betroffenen Familien Gofrann, Tlawd, Vann, Maerllys, Pendrwn und Raves erhalten versionierte Repository-Snapshots mit erhaltenen bestehenden Personen-IDs. Live-Charakterdaten, Inventarbesitz und Kampfverläufe werden nicht verändert.

Das Theater ersetzt die Schlacht am Roten Berg durch **Freydis und die zwölf Prüfungen**: Sigrun als Freydis Frostauge, Sabjorn (23, Aldrimar) als junger Sigurd Vaeren und Cadfan als Vater Njörd Frostauge mit blonder Perücke. Sabjorns Porträt und das neue Bühnenbild wurden mit built-in image_gen erstellt. Zwölf Tafeln stehen für die Prüfungen; die klecksartig auslaufenden transparenten Bildränder bleiben erhalten. Das frühere Stück und dessen Bild gehören nicht mehr zum aktiven Repertoire. Das Ensemble umfasst 13 Personen; für Führung und Ensemble sind 15 Charakterprofile vorbereitet.

Die Archivansicht führt gleiche Modul-IDs genau einmal zusammen. Ausgelieferte Module und vorhandene Editor-Overrides behalten ihre Priorität gegenüber gespeicherten älteren Kopien. Vorhandene gespeicherte Datensätze werden dafür nicht gelöscht. Vorschaubilder der Betriebe verwenden die bildfüllende Darstellung; echte Wappenvorschauen behalten die vollständige Darstellung mit `contain`.

Vor Veröffentlichung bestanden:

- 45 gezielte Tests für Theater, Gofrann, Vann, Eleganz, Archivnavigation und Modulablage.
- Allgemeine Prüfung von 33 Templates und 36 Defaultseiten; stabile Sanitizer- und JSON-Rundläufe.
- Der tatsächliche Netlify-Build einschließlich Prüfung von 514 Stammbäumen mit 20.067 Karten ohne Fehler.
- Browserprüfung aller fünf Gwynthorer Modulkarten mit fünf gespeicherten Altfassungen, jeweils einmalige Darstellung, korrekte Thumbnails bei 1460 und 390 Pixeln und eine getrennte Wappenkontrolle.
- Vollständige Theater-Browserprüfung einschließlich neuem Stück, allen Bildern, 15 vorbereiteten Profilen, Modal- und Inline-Editor sowie Scrollen auf Desktop und Handy.
- Prüfung aller 29 aktiven Theaterbilder mit Prüfsummen und echtem Alphakanal der Bühnenillustrationen.

Lokale Belege: `.tmp/gwynthor-module-release/local-1792196743966/`, `.tmp/gwynthor-theater/browser-1792196743989/`, `.tmp/gwynthor-module-release/site-build.log`. Die Browserprüfungen sperren externe Schreibzugriffe. Die anschließende Netlify-Veröffentlichung wird über den Commit auf `master` ausgelöst und online nachgeprüft.

Reproduktion: `node AleriaAlmanach/tests/gwynthor-modules.browser.mjs`; dieselbe schreibgeschützte Prüfung unterstützt `--origin=https://dieweltvonaleria.netlify.app` für den veröffentlichten Stand.
