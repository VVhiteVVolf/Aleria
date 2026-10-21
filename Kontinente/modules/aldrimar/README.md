# Königreich Aldrimar

Die elf statischen Seiten werden mit `node Kontinente/scripts/build-aldrimar.mjs`
aus den regionalen Daten erzeugt. `--check` prüft Seiten und erzeugte Ratskarten
ohne zu schreiben. Es entsteht kein neues Jarltum und keine neue Familienakte.

- `kingdom.source.json`: Reichsabschnitte, Einordnung, Rat, große Clans und Organisationen.
- `offices.source.json`: 45 Rollen mit Aufgaben, Untergruppen und Quellenhinweisen.
- `succession.source.json`: Herrscherfolge, Erbrecht und acht vollständige Biografien.
- `royal-references.mjs`: prüft vorhandene Familien- und Personenkennungen beim Build.
- `kingdom-data.mjs`, `succession-data.mjs`: verbinden regionale Angaben mit den
  aktuellen Namen, Portraits, Lebensdaten und Links der bestehenden Familienakten.
- Die vier `*-template.mjs`-Dateien besitzen jeweils ihre Seitendarstellung;
  `content-template.mjs` rendert ausschließlich strukturierte Textblöcke und Fakten.
- `kingdom.cards.generated.json`: kleiner, erzeugter Browserbestand für Rat und Clans.
  `kingdom-page.mjs` montiert nur diese zwei Bereiche mit den gemeinsamen Registern.
- `aldrimar.css`: nur regionale Kompositionen. Die Seitenschale, Suche, Register,
  Ratskarten und Verwaltungszeile stammen aus den jeweiligen gemeinsamen Modulen.

Die Hauptseite verwendet ausdrücklich dieselbe Darstellung wie die Hauptseite
des Königreichs Cenyr: `assets/css/koenigreich.css`, `world-codex`, rechte Infobox
mit passendem Lesescrollbereich und helle Referenztabellen. Die Ämter-, Kronfolge-
und Biografieseiten verwenden die gemeinsame Hofseiten-Vorlage. Diese beiden
Seitentypen bleiben getrennt; es gibt keine eigene Aldrimar-Themenkopie.

Originalquellen, Prüfsummen und Einordnungen: `Kontinente/docs/aldrimar/README.md`.
Die Suchlogik und die Lesefunktionen benötigen keine Firebase-Anbindung.
