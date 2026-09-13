# Ereignischronik

`index.html` ist die eigenständige Übersicht. Das vorhandene Ereignisse-Icon im
Almanach öffnet sie; der Kalender bleibt eine eigene Seite.

- `modules/catalog/events-data.mjs`: einzige Quelle der zehn benannten Ereignisse
  und sechs Kapitel aus der übergebenen Altübersicht. Texte wurden nur sprachlich
  bereinigt. Die unbenannte Reise wird als leeres Kapitel geführt. Die Hochzeit
  ist auf Nutzerangabe dem Jahr 1740 zugeordnet und öffnet das neue Festbuch;
  dessen Registry führt den genauen Termin am 27. Lichtkehr.
- `assets/icons`: unveränderte Original-Icons der Vorlage, lokal gespeichert;
  `sources.json` dokumentiert die Bildquellen. Jedes Ereignis wählt sein eigenes
  Motiv über `icon`. Die statische Ausgabe und die Filteransichten verwenden
  dieselben Bilder; Vite übernimmt ihre Assetpfade in den Build.
- `events-model.mjs`: Suche, Jahresintervalle, Sortierung und Kalenderverweise.
  Historische Angaben haben Jahresgenauigkeit. Es werden keine Monate/Tage oder
  jährlichen Wiederholungen daraus erzeugt. Start- und Endjahr gehören zum Zeitraum.
- `events-render.mjs` / `events-page.mjs`: gemeinsame statische/dynamische Ausgabe
  und gekapselte Bedienung mit Event Delegation. Zustand kann per URL geteilt werden.
- `modules/book-shell`: eigenständige Gestaltung des Chronikbandes.
- `modules/calendar`: Terminvorschau über den bestehenden CalendarStore, dessen
  Wiederholungsmodell und gemeinsame Terminkarten. Keine eigenen Firebase-Zugriffe.
- `../AleriaAlmanach/modules/calendar/calendar-chronicle.mjs`: Jahreskontext im
  Kalender aus derselben Ereignisquelle. Die historischen Einträge werden nicht
  in `calendar_events` geschrieben und verändern weder Weltzeit noch Tageszählungen.

## Weitere Ereignisse und Dossiers

Einträge mit stabiler `id`, `chapter`, Titel, Typ, Text sowie bekannten Jahreswerten
ergänzen. Unbekannte Werte bleiben `null`. `articleHref` erst setzen, wenn die
Unterseite vorhanden ist; Pfade sind relativ zu `Ereignisse/index.html`.
Neue Seiten zusätzlich als Vite-Einstieg registrieren. Noch fehlende Dossiers
haben einen Hinweis und keinen scheinbar funktionierenden Link.

Icon, Titel und der hervorgehobene Link öffnen ein Dossier direkt. `articleHref`
hat Vorrang; solange eine lokale Unterseite fehlt, bewahrt `sourceHref` den in der
Vorlage vorhandenen Animexx-Link. Diese Ziele sind als Animexx gekennzeichnet.
Einträge ohne beide Verweise bleiben als noch offene Ereignisseiten erkennbar.
Die Kalenderlinks stehen zusätzlich daneben und sind kein Zwischenschritt.

Nach Datenänderungen `node Ereignisse/scripts/build-events.mjs` ausführen. Es
aktualisiert nur die markierten Register-/Katalogbereiche in `index.html`;
die HTML-Hülle bleibt handgepflegt. So ist die Übersicht ohne JavaScript lesbar.
Der reguläre Almanach-Prebuild führt den Schritt ebenfalls aus.

Prüfungen aus dem Workspace:

```sh
node Ereignisse/scripts/build-events.mjs --check
node --test Ereignisse/tests/events.test.mjs AleriaAlmanach/tests/calendar-events.test.mjs AleriaAlmanach/tests/scene-time-calendar-day.test.mjs
```

`tests/events.browser.mjs` prüft die Seiten lokal mit isoliertem Browserprofil und
blockierten externen Requests; es verwendet dieselben Playwright-Umgebungsvariablen
wie der bestehende Kalender-Browsertest. Keine Produktivdaten werden verändert.

Stand 13. September 2026: 27 gezielte Modell- und Kalenderprüfungen bestanden.
Browserprüfung für Quellseiten und Vite-Ausgabe umfasst 320, 390, 768 und 1440 Pixel,
Filter, Datumsverweise in beide Richtungen, lokale Terminvorschau, die Hochzeitsseite,
den Almanach-Einstieg und Lesen ohne JavaScript. Auch der bisherige Kalenderablauf
(Anlegen, Bearbeiten, Personen, Icons, Szenenzeit, Startseitenvorschau) besteht weiter.

Im bestehenden Almanach-Build fehlen unabhängig von der Ereignisübersicht drei
Assets: `Karten/karten.registry.js`,
`Stammbäume/assets/js/services/family-library.js` und
`Fonts/Rheunwaith-Font-1.000/Vorschau/Rheunwaith_Font_Render_Test.png`.
Der Browsertest meldet diese separat beim Prüfen der Almanach-Startseite; für
Ereignisse, Kalender und Hochzeitsseite werden fehlende Dateien als Fehler gewertet.
