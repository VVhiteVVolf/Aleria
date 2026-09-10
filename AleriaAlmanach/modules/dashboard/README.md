# Almanach-Startseite

Die Übersicht verwendet die vorhandenen Archivdaten, den lokalen Leseverlauf,
die Szenenaktivität und die gespeicherten Archivfunken. Sie legt keinen eigenen
Inhalts- oder Navigationszustand an.

## Gestaltung und Zuständigkeiten

- `dashboard.css` gestaltet ausschließlich die Übersicht: Einstieg, Bestandszahlen,
  Leseverlauf, Weltpfade, Szenenchronik, Tagesfundstück und Archivfunken. Container-
  Abfragen richten sich nach der tatsächlichen Inhaltsbreite zwischen den Registern.
- `../archive/archive-shell.css` enthält Kopfbereich, Grundgestaltung der Reiter und Archivsuche.
  `../archive/archive-navigation.js` und `.css` ergänzen Scrollpfeile und die
  vollständige Bereichsauswahl mit denselben Weltpfadicons wie die Startseite.
  Die `--almanach-*`-Farben gehören zur Seitenhülle; die Theme-Variablen der bestehenden
  Modulansichten und Editoren bleiben davon unabhängig.
- `../../styles/layout-sidebar.css` verantwortet die Seitenaufteilung und Register.
  Die Datumsanzeige und ihr natives `details`-Menü liegen in `../../styles/world-date.css`.
  Die drei bisherigen Datumsaktionen behalten ihre Ereigniszuordnung. Der aktuelle
  Tag und Synchronisierungsstatus bleiben auch bei geschlossenem Menü sichtbar.
- `../archive/archive-dashboard.js` erzeugt weiterhin die Übersicht; `archive-view.js`
  verwaltet Suche und Reiterwechsel. Die sichtbare Bezeichnung „Übersicht“ verwendet
  weiterhin den internen Reiter `Alle`.

Alle Weltpfade bleiben erreichbar, einschließlich noch leerer Kategorien. Titel
werden an Wortgrenzen umbrochen. Das Tagesfundstück bevorzugt Einträge mit echten
Illustrationen; in einem Archiv ohne Bilder bleiben Textfundstücke möglich.
Die dekorative Kompassrose liegt als SVG in `public/assets/dashboard/compass.svg`.

## Prüfung

Die vorhandenen Dashboard- und Weltdatumtests sowie die Vorlagenprüfung
(`npm run check:templates`) sichern Datenherkunft, Bildauswahl, Kalenderverhalten und
Vorlagenkompatibilität. Der lokale Browsertest vom 10. September 2026 prüfte:

- 320, 390, 768, 1024, 1440 und 1920 Pixel: alle Weltpfade sichtbar, Titel ohne
  Abschneiden und kein horizontaler Seitenüberlauf, auch bei geöffneter Werkzeugleiste.
- 390 und 1440 Pixel: Suche, keine Treffer, Leeren/Escape, Navigation,
  Weiterlesen an derselben Modulseite, Verlauf und Öffnen/Abbrechen eines neuen Moduls.
- Datumsmenü per Tastatur, Datum bearbeiten und abbrechen; Tageswechsel und
  Synchronisationsaktion mit einer lokalen Testattrappe ohne Backend-Schreibzugriff.
- Bestehende mehrseitige Leseansicht, Seitenkommentare, Inline-Bearbeitung und
  verlustfreie Übernahme der Seiten im vollständigen Editor.
