# Uathneach: Vorschlag für Patrick

Patrick hat am 24. Oktober 2026 Variante 1 gewählt. Die reguläre Umsetzung liegt
unter `Kontinente/Estryll/Fürstentum Uathneach/` und `Karten/Uathneach/`;
der bestätigte Bestand hat seine eigene Quelle
`Stammbäume/assets/js/data/uathneach-territories.source.json`.
Diese Vorschau bleibt als unabhängiges Archiv der drei Möglichkeiten erhalten.

## Kriegerentwürfe, 27. Oktober 2026

Alle 26 bestätigten Clans besitzen eine freigestellte Kriegerdarstellung.
Die Galerie und die bestehenden Clanfenster zeigen Figur, Wappen, Klassenvorschlag
und die Sitzangaben der gerade gewählten historischen Kartenvariante.
Klassenwahl und Ausstattung sind Bildvorschläge, keine kanonischen Ausbildungsdaten.
Clannamen, Ränge, Sitze und Familiengraphen bleiben unverändert.

Nach der Nutzerkorrektur haben die 23 vorhandenen Originale aus
`D:/0-KI Generierte/01 Bilder/Bilder für Krieger/Uathneach` Vorrang.
Na Fiodhrán, Tir An Creagán und Dál Siubhrán behalten ihre neuen Darstellungen.
Die aktive Auswahl liegt zentral in `Stammbäume/assets/js/data/uathneach-warriors.js`
und wird auch von den Hausseiten, Hausbios und der Kriegergalerie verwendet.
Die Klassenzuordnung beschreibt die tatsächlich sichtbare Ausrüstung.

`warrior-art-direction.mjs` hält die individuellen Ausrüstungs- und Kulturbriefings;
`scripts/build-warrior-catalog.mjs` erhält die vollständigen Erzeugungsprompts
und verweist den Vorschaukatalog auf die gemeinsame aktive Auswahl.
Die erste Serie mit 26 neu erzeugten Figuren bleibt als Entwurfsarchiv erhalten.
Ihre Originale und Herkunft
liegen unter `assets/warriors/generated/` und `provenance.json`; die gemeinsame
Alpha-Pipeline erhält RGB und Originaldateien. Produktions-PNGs, WebP-Vorschauen
und Prüfnachweise liegen daneben. Keine Veröffentlichung dieser Ergänzung ohne
passende neue Nutzerfreigabe.

```text
node Vorschau/Uathneach/scripts/build-warrior-catalog.mjs
python -B Stammbäume/tools/import-uathneach-warriors.py
python -B Vorschau/Uathneach/scripts/prepare_warriors.py build
python -B Vorschau/Uathneach/scripts/prepare_warriors.py audit --expected-count 26
python -B Vorschau/Uathneach/scripts/prepare_warriors.py contact
```

Eigenständige, experimentelle Vorschau mit drei Varianten. Kein Eintrag in den
Welt-, Haus- oder Kartenregistern; keine Firebase-Anbindung. Änderungen im
Bearbeitungsmodus gelten nur bis zum Neuladen der geöffneten Seite.

Einstieg: `index.html`. Die Module und verlustfreien WebP-Bilder sind vollständig
lokal enthalten. Die temporäre Einzeldatei und verworfene Entwürfe werden nicht
veröffentlicht. Suchmaschinen erhalten `noindex,nofollow`; der Link selbst ist
öffentlich zugänglich und kein geschützter Freigaberaum.

Quelle: die gemeinsam geprüfte Werkstattvorschau unter `.tmp/uathneach-vorschau`,
Stand 23. Oktober 2026. Die drei neu aufgenommenen Clans und die Korrekturen der
Präfixe, Wohnsitze und Varianten sind enthalten.
