# Pins, Infotabellen und Kartenschriftzüge

Im Bearbeitungsmodus legt **Pin setzen** einen Ort mit einer Infotabellen-Vorlage
an. Neben den bisherigen Vorlagen gibt es gemeinsame Gruppen für Orden/Zünfte,
Institutionen, Verwaltung, Militär, Handwerk, Gastbetriebe, Landwirtschaft und Handel.
Die Vorlagen liegen in `assets/js/pins/pin-templates.js`. Im Pin-Editor können
weitere Zeilen ergänzt und vorhandene Vorlagen geladen werden. Unbekannte Werte
bleiben leer. Die 24 Llysfaener Orte besitzen bereits passende Tabellen.

## Automatische Ortsbilder

Für alle 20 Siedlungskategorien und 14 Pin-/Stempelvorlagen gibt es eigene
quadratische Aquarell-/Buntstiftbilder in `assets/images/pin-placeholders/`.
`pin-placeholder-images.js` wählt das Motiv gemeinsam für Detailansicht,
Editorvorschau und Medienvorschau:

1. Eigene Bilder samt Bildlink haben Vorrang.
2. Eine spezifische Vorlage (z. B. Handwerk oder Militär) bestimmt das Motiv.
3. Bei „Siedlung / Ort“ oder ohne bekannte Vorlage bestimmt der Kategoriename
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
