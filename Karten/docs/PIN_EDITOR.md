# Pins, Infotabellen und Kartenschriftzüge

Im Bearbeitungsmodus legt **Pin setzen** einen Ort mit einer Infotabellen-Vorlage
an. Neben den bisherigen Vorlagen gibt es gemeinsame Gruppen für Orden/Zünfte,
Institutionen, Verwaltung, Militär, Handwerk, Gastbetriebe, Landwirtschaft und Handel.
Die Vorlagendaten liegen in `assets/js/pins/pin-template-catalog.js`; der Picker
in `pin-templates.js` und der Kartenimport verwenden dieselbe Quelle. Im Pin-Editor können
weitere Zeilen ergänzt und vorhandene Vorlagen geladen werden. Unbekannte Werte
bleiben leer. Die 24 Llysfaener Orte besitzen bereits passende Tabellen.

`pin-table-presets.js` ergänzt passende Feldgruppen für alle 100 Ortstypen, etwa
Abbauweise, Rohstoffe und Tiefe für Minen oder Wasserqualität und Ergiebigkeit
für Quellen. Platzierung, Vorlagenwechsel und Import verwenden denselben Katalog.
Beim Kategorienwechsel folgen nur unveränderte leere Standardtabellen dem neuen
Ortstyp; ausgefüllte, angepasste oder ausdrücklich geleerte Tabellen bleiben erhalten.
Eine ausdrücklich gewählte fachfremde Vorlage behält ihre eigenen Felder.
Bild und Tabelle teilen sich in der Desktopkarte dieselbe Grid-Zeile und Höhe;
auf schmalen Bildschirmen stehen sie untereinander.

## Automatische Ortsbilder

Für alle 20 Siedlungskategorien und 14 Pin-/Stempelvorlagen gibt es eigene
quadratische Aquarell-/Buntstiftbilder in `assets/images/pin-placeholders/`.
Der gemeinsame Katalog ergänzt 51 allgemeine und kleinere Ortstypen mit
44 weiteren Bildern; sieben passende Motive werden aus den Vorlagen wiederverwendet.
Der vollständige Symbolbogen-Abgleich ergänzt weitere 29 eigenständige Typen
mit 27 neuen Motiven und zwei passenden vorhandenen Bildern. Damit umfasst
der Standardkatalog 100 Kategorien; gleichbedeutende Varianten sind als Aliasse
zugeordnet. Die geprüften Bezeichnungen stehen in `location-symbol-types.json`.
`pin-placeholder-images.js` wählt das Motiv gemeinsam für Detailansicht,
Editorvorschau und Medienvorschau:

1. Eigene Bilder samt Bildlink haben Vorrang.
2. Gehört der Ortstyp zur gewählten Vorlage, erscheint sein genaueres Ortsmotiv:
   Mine + Handwerk zeigt die Mine, Höhle + Natur die Höhle. Die Zuordnung folgt
   demselben Ortsprofil in `pin-table-presets.js` wie die Infotabelle.
3. Eine abweichende spezifische Vorlage bestimmt weiterhin das Motiv, etwa
   Militär bei Hauptstadt. Bei „Siedlung / Ort“ oder ohne bekannte Vorlage bestimmt der Kategoriename
   das Motiv, unabhängig von der Kategorie-ID der jeweiligen Karte.
4. Unbekannte Kategorien ohne passende Vorlage erhalten das allgemeine Ortsbild.

Die Auswahl wird bei der Darstellung berechnet und nicht in `pin.img` gespeichert.
Damit folgen auch vorhandene Pins und Stempelkopien automatisch Änderungen.
Früher gespeicherte integrierte Platzhalter werden ebenfalls neu zugeordnet.
Ein Vorlagen-Overwrite übernimmt mit der Infotabelle auch `templateId`; Undo
stellt die vorherige Zuordnung wieder her. Eigene Bilder bleiben erhalten.

Die 34 Motive wurden mit dem integrierten Imagegen-Werkzeug anhand von
`default-siedlung.webp` erzeugt. Das Promptset liegt als
`assets/images/pin-placeholders/generation-prompts.json` bei. Die ursprünglichen
drei Bilder bleiben für bestehende direkte Verweise verfügbar.

Die zusätzlichen Bilder wurden ebenfalls mit dem integrierten Imagegen-Werkzeug
und derselben Stilreferenz erzeugt. Ihre Prompts stehen in
`assets/images/pin-placeholders/location-generation-prompts.json`.
Die Ergänzungen aus dem vollständigen Symbolbogen stehen in
`assets/images/pin-placeholders/symbol-types-generation-prompts.json`.

## Gemeinsame Ortskategorien und Gwynthor

`pins/category-catalog.js` besitzt die Standardkategorien, Bildzuordnung und
Namensvarianten. `upgrade()` ergänzt fehlende neue Typen beim Laden alter Karten,
lokaler Entwürfe und Kategorienimporte. Vorhandene IDs, Farben, Marker und Namen
bleiben erhalten. Beispielsweise werden „Einfacher Hof“, „Castell/ Burg“, „Heim“
und „Lager“ wiederverwendet. Die gespeicherte `categoryCatalogVersion` verhindert,
dass später bewusst gelöschte Kategorien beim nächsten Laden erneut auftauchen.
Exporte mit Kategorien enthalten diese Versionskennung ebenfalls.
Version 2 ergänzt unter anderem Sumpf-/Unterwasser-/Brauersiedlungen, Magierturm,
Diebesgilde, Schiff, Fährstelle, Kultstätte, Münzprägestätte und einzelne Ruinentypen.

Die Gwynthor-Markierungsebene wurde am 1. Oktober 2026 mit 170 Symbolen abgeglichen:
12 vorhandene Pins bleiben unverändert, 158 neue Pins besitzen Typnamen, passende
Templates mit leeren Tabellenwerten und die gewünschten Gwynthor-/Llamreis-Medien.
Höfe verwenden Landwirtschaft, Gewerbe Handwerk, Türme und Rittergüter
Militär, Tavernen Gastbetrieb und Naturorte Natur/POI. Die Bilder entsprechen
dem jeweiligen Ortstyp innerhalb dieser Vorlagen. Die Symbole für
Rosszucht- und Brauersiedlungen verwenden ihre eigenen Kategorien und die Vorlage
Siedlung/Ort; dadurch bleibt auch ihr spezifisches Siedlungsbild erhalten.
Das geprüfte Inventar
`Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/markings.inventory.json`
dokumentiert die Symbolgrenzen im 8192 × 6300 großen Originalbild sowie die
jeweilige `templateId`. Neue Importpins benötigen eine gültige Vorlage;
ihre Tabellen werden aus dem gemeinsamen Vorlagenkatalog erzeugt.
`tools/merge-marking-pins.mjs` führt solche Inventare anhand von ID/Position
additiv zusammen und erhält alle bestehenden Pin-Daten. Die Zusammenführung
läuft nicht automatisch im Browser; die ergänzten Pins stehen in `data.json`.

Ein älterer lokaler Entwurf bleibt gemäß der bestehenden Speicherlogik erhalten.
Mit **Aktuelle Karte laden** lässt sich die veröffentlichte Version übernehmen;
die bestehende Sicherung schützt dabei den vorherigen Entwurf.

## Pin-Darstellung und Schriftzüge

**Dots dauerhaft anzeigen** ist eine gespeicherte Karteneinstellung
(`showMarkers`, standardmäßig `false`). Im Bearbeitungsmodus bleiben die
Platzierungspunkte sichtbar. Schriftzüge sind von dieser Einstellung unabhängig.
Dots starten bei 80 (Bereich 8–240), die Beschriftung bei 40 (9–160). Bereits
gespeicherte Größen anderer Karten bleiben erhalten. Llysfaens Kartendaten
verwenden die neuen Standardwerte.

Die Karte zeichnet einen weißen Halo unter die Pin-Darstellung. Beim Überfahren
wird er verstärkt. Für Symbole im Kartenbild ist dies ein Ring über dem Hintergrund,
ohne das Symbol selbst zu verdecken. Separate Pin-Bilder erhalten zusätzlich einen
Schein entlang ihrer transparenten Kontur.

**Aa Schriftzug setzen** legt einen Pin mit `kind: "text"` an. Der Titel ist die
sichtbare Schrift. Unter **Basis** lassen sich Breite, Schriftgröße, Drehung,
Zeichenabstand, Farbe und zwei Bézier-Kurvenpunkte einstellen. Gleiche Höhen
erzeugen einen Bogen, gegenläufige Höhen eine S-Kurve. Bei langen Titeln hilft
eine größere Breite oder kleinere Schrift. Die Vorschau zeigt die Änderungen,
bevor **Übernehmen** sie in die Karte schreibt; **Abbrechen** verwirft den Entwurf.

`pin-lettering.js` kapselt Normalisierung, SVG-Geometrie, Darstellung und
Editorfelder. Die Formdaten liegen im Pin unter `lettering` und werden mit
Entwurf, Export, Stempelkopie und Veröffentlichung gespeichert. SVG-IDs werden
pro Darstellung erzeugt; Text wird als Textknoten eingefügt.

Beim Ziehen aktualisiert `pin-renderer.js` nur das bewegte DOM-Element,
höchstens einmal pro Animationsframe. Der Kartenstand behält die letzte
Mausposition auch bei noch ausstehendem Frame. Erst beim Loslassen werden
die Darstellung neu aufgebaut, eine Sicherung ausgelöst und ein einzelner
Rückgängig-Schritt angelegt. Mausbewegungen und Loslassen außerhalb der
Kartenfläche werden über dokumentweite Listener erfasst.
