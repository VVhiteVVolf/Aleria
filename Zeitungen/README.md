# Zeitungssystem

Das Zeitungssystem trennt Blattprofil, örtliche Zeitungsausgabe, datierten Archivstand und Artikeltext voneinander. Ein Ort kann mehrere konkurrierende Zeitungen anbieten; jede Zeitung kann beliebig viele Ausgaben besitzen.

## Aufbau

- `zeitung.html` zeigt eine komplette Ausgabe sowie die Navigation durch das Ausgabenarchiv.
- `artikel.html` zeigt einen einzelnen Artikel und bewahrt dabei die gewählte Ausgabe in der URL.
- `assets/js/newspaper-registry.mjs` registriert die örtlichen Zeitungen, ihre Titelbilder und ihre Ausgaben.
- `assets/js/newspaper-archive.mjs` sortiert Ausgaben, bestimmt die aktuelle Ausgabe und baut dauerhafte Links.
- `assets/js/newspaper-model.mjs` trennt unveränderliche Blattdaten mit `createPublication` von datierten Ausgaben mit `createIssue`.
- `assets/js/newspaper-distribution-policy.mjs` hält die Verbreitungsregeln der Zeitungstitel zentral fest, damit Ortsseiten und spätere Ortsvorlagen dieselben Vorgaben verwenden.
- `assets/js/newspaper-aleria-date.mjs` bildet den Kalendervertrag des AleriaAlmanachs ab, ohne den Almanach zu verändern.
- `data/<blatt-ort>/edition.mjs` enthält aktuell das Blattprofil und die erste datierte Ausgabe.
- `data/<blatt-ort>/articles/` enthält ausschließlich bereinigte Artikeltexte.
- `data/<blatt-ort>/assets/` hält Titelbild, Druckzeichen und Portraits lokal vor.
- `data/celtigerns-echo/publication.mjs` bündelt das gemeinsame Profil, Erscheinungsbild und die Platzhalterlogik aller örtlichen Ausgaben von `Celtigerns Echo`.
- `data/kronenspiegel/current-issue.mjs` ist der einzige Inhaltsstand der nationalen Ausgabe. `data/kronenspiegel/publication.mjs` ergänzt nur Blattprofil, Mathragoner Hauptredaktion und den jeweiligen Druck- und Korrespondenzstandort; die kleinen Standortmodule vervielfältigen keine Artikel.
- `data/fluesterfaecher/publication.mjs` definiert die gemeinsame Magazinmarke, zwölf feste Rubriken und den wiederverwendbaren Aufbau einer eigenständigen Lokalredaktion. Jede Grafenstadt erhält ihr eigenes Ausgabenmodul und eigene Artikel; aktuell ist Gwynthor vorbereitet.

Das Standard-Erscheinungsdatum wird als `Lyristag, 18.03 Jahr 1740` angezeigt. Der Aleria-Kalender besitzt neun Wochentage, 36 Tage je Monat und 13 nummerierte Monate.

## Neue Ausgabe ergänzen

1. Unter `data/<blatt-ort>/issues/<ausgabe>/` ein Ausgabenmodul und dessen Artikelordner anlegen.
2. Das stabile Blattprofil aus der vorhandenen `edition.mjs` importieren und mit `createIssue` nur Datum, Zusammenfassung und Artikel der neuen Ausgabe ergänzen.
3. In `newspaper-registry.mjs` unter dem betreffenden Blatt einen weiteren `issues`-Eintrag mit eindeutiger ID, Aleria-Datum und Modulpfad registrieren.

Die Reihenfolge im Register ist unerheblich. Das Archiv sortiert anhand des Aleria-Datums. Fehlt der URL-Parameter `ausgabe`, wird immer die jüngste registrierte Ausgabe geladen.

## Weiteres Blatt an einem Ort

Ein Konkurrenzblatt erhält einen eigenen Registereintrag mit derselben `placeId`, einer eigenen `titleId`, einem Titelbild und einem `themeId`. Genau ein Blatt je Ort wird mit `isDefaultForPlace: true` ausgezeichnet; derzeit ist dies überall der Schwarzbote. Der Pressewechsler der Ortsseite erkennt weitere Einträge automatisch.

Die Verbreitung folgt festen Titelregeln:

- Der Schwarzbote ist als Grundausstattung für jeden ausgearbeiteten Ort vorgesehen.
- Der Kronenspiegel erscheint in allen großen Städten Cenyrs. Mathragon verantwortet eine gemeinsame nationale Ausgabe; die Standorte sammeln Nachrichten und drucken denselben Inhalt. Er erscheint am 1., 18. und letzten Tag des 36-tägigen Monats.
- Der Flüsterfächer erscheint ausschließlich in Cenyrs Haupt- und Grafenstädten. Der Hauptsitz in der Blutstadt wahrt Marke und Stil; jede Stadt führt eine eigene Redaktion, eigene Themen und ein unabhängiges Archiv. Gwynthor ist die erste vorbereitete Lokalausgabe.
- Celtigerns Echo ist eine Lokalzeitung für Celtigerns Wacht und seine Orte. Gwynthor ist mit Falchdyn-Mitgliedern und freien Autorenstellen besetzt; Abergwint, Castellbryn und Rhosmere besitzen unabhängige, zunächst unbesetzte Lokalredaktionen.
- Siedlungszeitungen können zusätzlich auf genau einen Ort begrenzt werden.

## Lokale Ziele

- Gwynthorer Ausgabe: `/Zeitungen/zeitung.html?zeitung=schwarzbote-gwynthor`
- Hauptsitz des Kronenspiegels in Mathragon: `/Zeitungen/zeitung.html?zeitung=kronenspiegel`
- Gwynthorer Echo-Ausgabe: `/Zeitungen/zeitung.html?zeitung=celtigerns-echo-gwynthor`
- Cenyrweite Kronenspiegel-Ausgabe am Standort Gwynthor: `/Zeitungen/zeitung.html?zeitung=kronenspiegel-gwynthor`
- Gwynthorer Flüsterfächer: `/Zeitungen/zeitung.html?zeitung=fluesterfaecher-gwynthor`
- Abergwinter Ausgabe: `/Zeitungen/zeitung.html?zeitung=schwarzbote-abergwint`
- Cenyrweite Kronenspiegel-Ausgabe am Standort Abergwint: `/Zeitungen/zeitung.html?zeitung=kronenspiegel-abergwint`
- Castellbryner Ausgabe: `/Zeitungen/zeitung.html?zeitung=schwarzbote-castellbryn`
- Cenyrweite Kronenspiegel-Ausgabe am Standort Castellbryn: `/Zeitungen/zeitung.html?zeitung=kronenspiegel-castellbryn`
- Rhosmerer Ausgabe: `/Zeitungen/zeitung.html?zeitung=schwarzbote-rhosmere`
- Cenyrweite Kronenspiegel-Ausgabe am Standort Rhosmere: `/Zeitungen/zeitung.html?zeitung=kronenspiegel-rhosmere`
- Datierte Ausgabe: `/Zeitungen/zeitung.html?zeitung=schwarzbote-gwynthor&ausgabe=1740-03-18`
- Einzelartikel: `/Zeitungen/artikel.html?zeitung=schwarzbote-gwynthor&artikel=<artikel-id>&ausgabe=1740-03-18`

Die alten HTML-Artikel können bei Bedarf mit `tools/import-legacy-article.mjs` in bereinigte Inhaltsfragmente überführt werden. Der Importer entfernt alte Layouttabellen, Inline-Stile und externe Links; die Laufzeitseite akzeptiert zusätzlich nur eine kleine Liste semantischer Textelemente.
