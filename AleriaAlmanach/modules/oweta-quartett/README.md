# Owetas Quartett

Die eigenständige Modulquelle verwendet die vorhandenen Hierarchie-,
Gruppenfolio-, Szenen- und Inventarsysteme. Oweta führt; Rianna, Lefraye und
Caralyn bilden die gemeinsame zweite Ebene. Die vier bestehenden Charakter-IDs
und sechs bestehenden Tier-IDs werden verknüpft. Persönlicher Besitz bleibt bei
den Besitzerinnen. Die explizite Tierauswahl verhindert, dass Caralyns Goldfisch
oder ein ungebundener Inventarplatzhalter automatisch mitreisen.

`oweta-quartett-data.mjs` enthält die Identitäten und die einmalige
Startausstattung aus dem bestehenden Warenregister. Diese Ausstattung gehört
in das autoritative `group_quest_accounts/oweta-quartett` und wird nicht als
zweiter Bestand in die manuelle Inventarliste des Folios geschrieben.
Keine Startmünzen, Charakterinventare, Kreaturwerte oder Live-Ressourcen werden
aus der Modulquelle angelegt oder verändert.

`node AleriaAlmanach/scripts/build-oweta-quartett.mjs` erzeugt die statische
Archivergänzung und den Modulimport unter
`Charakter Archiv Exporte/Module/Owetas Quartett/`. Derselbe Befehl mit `--check`
prüft diese Dateien. Die statische Ergänzung verwendet dieselbe stabile ID wie
ein späterer Online-Eintrag; die vorhandene Override-Priorität bleibt zuständig.

Prüfung: `node --test --experimental-test-isolation=none AleriaAlmanach/tests/oweta-quartett.test.mjs`.

Die Gruppe wurde am 3. November 2026 gezielt in Firebase angelegt:
https://dieweltvonaleria.netlify.app/AleriaAlmanach/AleriaAlmanach.html?entry=oweta-quartett

`firebase/scripts/content/publish-oweta-quartet.mjs` bereitet standardmäßig nur
einen lesenden Prüfplan vor. `--apply` verwendet die vorhandene Projektanmeldung,
eine verschlüsselte Sicherung und atomare Vorbedingungen. Modul, Gruppenkonto,
einmaliger Startbeleg und fehlende feste Itemversionen werden gemeinsam angelegt.
Ein vorhandener Beleg verhindert erneute Vorratsvergabe; spätere Bearbeitungen
und verbrauchte Vorräte bleiben erhalten. Persönliche Figuren, Tiere und
Szenenkommentare werden nicht geschrieben. Die Prüfung schließt die echte
serverseitige Entnahme aus dem vorbereiteten Gruppeninventar ein.

Das gewählte Gruppenbild liegt unter
`assets/groups/oweta-quartett/proposals-2026-11-03/01-bachufer.png`.
Die Nutzerauswahl vom 3. November 2026 gilt für Hauptbild, Vorschau, Einstieg,
Folioumschlag und Mittagsrast-Szene. Die Auswahl und der exakte Bildhash liegen
in `oweta-quartett-artwork.mjs`; `withOwetaQuartetArtwork` ersetzt nur diese
fünf Bildfelder. Der ursprüngliche Bildstand `mittagsrast-v1.png` bleibt erhalten.
Es wurde mit dem integrierten Bildgenerator erstellt. Vollständiger Prompt,
angesehene Referenzen und Bildprüfung liegen unter `source/`. Die Onlinefassung
verwendet den nach Dateiinhalt benannten, unveränderlichen Bildpfad des
bestehenden Haus-Draig-Speichers. Publikationsplan und Rückprüfung stehen unter
`diagnostics/oweta-quartett-20261103/`; hierfür war kein Hostingrelease nötig.

`node firebase/scripts/content/publish-oweta-quartet-artwork.mjs` prüft den
gezielten Bildwechsel lesend. Mit `--apply` sichert der Befehl den vorhandenen
Stand, veröffentlicht die ausgewählte Datei unter einem unveränderlichen
Hashpfad und aktualisiert ausschließlich das bestehende Modul samt
Revisionskennung. Gruppenvorrat, Kasse und alle übrigen Inhalte bleiben erhalten.
