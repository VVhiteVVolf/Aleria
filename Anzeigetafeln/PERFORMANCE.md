# Performance der Anzeigetafeln

Stand: 29. Oktober 2026.

## Bildbibliothek

Der Kunstkatalog trennt Originale, Anzeigebilder und kleine Vorschaubilder.
`originalSrc` erhält den Originalverweis. Die 39 neuen WebP-Anzeigebilder sind
verlustfrei: Abmessungen und sämtliche RGBA-Pixel stimmen mit den PNGs überein.
Sie benötigen zusammen 12.785.660 statt 21.891.826 Bytes (41,6 % weniger).
Die 87 Bibliotheksvorschauen benötigen zusammen 868.510 Bytes und werden
verzögert geladen. Die beiden zusätzlichen Medienkataloge laden erst beim
Öffnen ihrer Auswahl. Originaldateien bleiben erhalten. Die Provenienz der
Anzeigebilder steht unter `assets/images/board-posters/display/provenance.json`.

## Bearbeitung und Speichern

Die Komposition erstellt pro Renderdurchgang einen Gruppenindex. Beim Ziehen
eines Nagels aktualisiert der Inspektor beide Koordinaten gemeinsam, höchstens
einmal pro Frame. Die Komposition bewegt nur das betroffene Element; sie baut
nicht mehr bei jedem Zeigerereignis die ganze Tafel neu auf. Beim Loslassen
wird die letzte Position übernommen, beim Abbrechen der Ausgangspunkt
wiederhergestellt. Auch Plakatbewegungen und Tafeltransformationen werden
pro Frame gebündelt.

Die bestehende Speicherlogik, Online-IDs und Datenformate bleiben erhalten.
Der erste Lesezugriff überlappt die Initialisierung der Komposition. Eine
ausbleibende Legacy-Firebase-Antwort blockiert den Start höchstens sechs
Sekunden. Dabei bleibt die Quelle als unvollständig markiert und eine
Veröffentlichung gesperrt. Eine verspätete Antwort darf den inzwischen
bearbeiteten Zustand nicht überschreiben. Weitere bewusste Ladevorgänge lesen
die Quellen erneut.

## Prüfung

`tests/board-performance.test.mjs` prüft unter anderem 240 Zeigerereignisse in
einem Frame, atomare Nagelkoordinaten, stabile DOM-Knoten, Loslassen und
Abbrechen, öffentliche und geheime Gruppen sowie die Vorschaugrößen.
`tests/board-storage.test.mjs` prüft Vorladen, erneutes Laden und den Schutz bei
ausbleibenden oder verspäteten Firebase-Antworten.

Diese Prüfungen belegen vermiedene Arbeit und kleinere Übertragungen. Ein
Browser-FPS-Gewinn wurde nicht gemessen. Kartenoptimierungen und die Grenzen
der Browserprüfung stehen in `Karten/docs/PERFORMANCE.md`.
