# Gebiete und Grenzen

Alle zentralen Karten verwenden dasselbe Werkzeug unter **Bearbeiten → Gebiete**.
Es benötigt kein zusätzliches Regionsbild. Die bisherige Bildebene kann daneben
weiterhin verwendet werden; der Knopf **Regionen** schaltet beide gemeinsam.

## Bedienung

1. **Neue Fläche** oder **Neue Grenzlinie** wählen und einen Namen eingeben.
2. Mit Linksklick Grenzpunkte setzen; mindestens drei für eine Fläche, zwei für
   eine offene Linie. **Zeichnen beenden** oder Enter beendet diesen Abschnitt.
3. Punkte ziehen, zusätzliche Punkte auf die Grenze setzen oder einen gewählten
   Punkt entfernen. **Punktänderung zurück** nimmt Geometrieänderungen zurück.
4. Weitere Inseln/Exklaven als **Teilfläche / Abschnitt** derselben Region anlegen.
5. Farben, Deckkraft, übergeordnete Region, Herrschaft und Zielkarte zuordnen.
6. **Übernehmen** schreibt sofort in den bestehenden lokalen Kartenentwurf.
   **Verwerfen** lässt die gespeicherte Region unverändert.

Mausrad zoomt. Mittlere oder rechte Maustaste verschiebt die Karte während des
Zeichnens. Escape verwirft nach Rückfrage, wenn Änderungen offen sind.
Der normale Karten-Rückgängig-Verlauf kann übernommene Regionsänderungen und
Entfernungen zurücknehmen. Beim Entfernen einer Oberregion rücken ihre Kinder
eine Ebene auf. Kreiszuordnungen und fehlende Eltern werden vor dem Speichern
abgewiesen.

Offene Regionsentwürfe blockieren Kartenwechsel durch „Aktuelle Karte laden“,
Import, Wiederherstellung und Veröffentlichung. Sie müssen zuerst übernommen
oder verworfen werden. Die Veröffentlichung bleibt der bestehende gesonderte
Vorgang **Online speichern**. JSON-Export/Import besitzt den Abschnitt
**Gebiete und Grenzen**; Vollsicherungen enthalten ihn automatisch.

## Verantwortung und Daten

`modules/regions/` kapselt Modellprüfung, Zeichensitzung, SVG-Ebene,
Werkzeugansicht und Interaktion. Das Modul nutzt `KartoRuntime` für Koordinaten,
Zoom, gemeinsamen Undo-Verlauf und Speicherung. Keine eigenen Datenbankzugriffe.
Werkzeugereignisse bleiben innerhalb der Ansicht; Karten-Panning und Pin-Werkzeuge
erhalten diese Eingaben nicht.

`state.regions` enthält stabile IDs, Namen, `kind: area|boundary`, `paths`,
`color`, `borderColor`, `opacity`, `parentId`, `dominionId`, `targetMapId` sowie
optionale `source`-Metadaten. Koordinaten sind relativ zur tatsächlichen
Kartenbildbreite/-höhe, Ursprung links oben. `paths` hält mehrere voneinander
getrennte Teile. Flächen schließen jeden Teil, offene Grenzlinien nicht.
Importierte Randpunkte knapp außerhalb des Bildes bleiben erhalten.

Der Kartenkern meldet Änderungen über `aleria:karto:state-changed`,
`map-render`, `view-changed`, `layers-changed` und `edit-mode-changed`.
`before-editor-transition` ist abbrechbar und schützt laufende Zeichnungen.
Alte Kartendaten ohne `regions` bleiben kompatibel.

Seit dem 22. Oktober 2026 haben bearbeitbare Grenzen eine sichtbare Breite von
6 Pixeln, die ausgewählte Grenze 8 Pixel. Die SVG-Ebene gleicht den äußeren
CSS-Kartenzoom aus; beim Herauszoomen werden die Linien deshalb nicht dünner.
Das gilt für alle Karten mit Vektorregionen, nicht für eingezeichnete Linien
innerhalb eines Kartenbildes.

## Leitheach-Quellen

Die Übertragung und bekannte Quellgrenzen sind in
[Leitheach/ABGLEICH.md](../Leitheach/ABGLEICH.md) dokumentiert.
