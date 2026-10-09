# Lesbare Beziehungen und stabile Gesamtansicht

Die gemeinsame Darstellung wurde am 9. Oktober 2026 überarbeitet. Personen,
Partnerschaften, Elternschaften, Weltpersonen-IDs und Quellenakten bleiben erhalten.

## Darstellung

- Linien verwenden die endgültigen Kartenanker. Ein alter, frei schwebender
  Anker wird auch dann verworfen, wenn die neue Verbindung eine Umgehung benötigt.
- Bei örtlichen Mehrpartnerbeziehungen beginnen Kinderlinien auf der tatsächlich
  gezeichneten Paarspur. Ein Paarmittelpunkt innerhalb einer anderen Partnerkarte
  ist kein zulässiger Anschluss.
- In der vertikalen Ansicht bekommen entfernte Partner beschriftete Verweise
  `V1`, `V2` usw. Derselbe Code, Beziehungstyp und Name des Gegenübers stehen an
  beiden Karten. Auslöser: mehr als vier Kartenbreiten Abstand oder mindestens
  zwei fremde Karten auf der direkten Verbindung. Die horizontale Ansicht
  behält die gewöhnliche Linienführung.
- Kinder einer solchen Fernbeziehung schließen am Verweis des näheren
  Elternteils an. Beide Eltern bleiben in den Beziehungsmetadaten enthalten.
  Der Verweis öffnet die bestehende Beziehungsübersicht, ohne den Baum neu zu wurzeln.
- Gemeinsame Abzweige bekommen Knotenpunkte. Unabhängige Linienkreuzungen behalten
  ihre hell umrandeten Überführungen. Normale örtliche Paare bleiben verbunden.
- Uneheliche und legitimierte Herkunft wird zusätzlich zur Rahmenfarbe beschriftet.
- Maus- und Tastaturfokus heben direkte Beziehungen hervor. Linienhilfe,
  Zoomknöpfe und Einpassen sind auch im Ansichtsmodus erreichbar.
- Feinere Linien und ein ruhigerer Pergamenthintergrund ergänzen die vorhandenen
  Kartenrahmen, Porträts und Wappen. Zusätzliche Rastergrafiken sind nicht erforderlich.

## Zuständigkeiten

`family-chart-connection-references.js` plant und zeichnet ausschließlich
Darstellungsverweise. `family-chart-link-renderer.js` löst Paaranschlüsse und
Linien aus diesen Plänen auf. Seine `prepareUpdate`-Phase entfernt eigene
Zusatzpfade vor dem nativen D3-Datenabgleich; anschließend werden sie neu gezeichnet.
Dadurch gelangen Pfade ohne Bibliotheksdatum nicht in den nativen Daten-Join.
Nur aktive native Pfade werden übernommen; auslaufende Pfade werden anhand ihrer
konkreten Hierarchieknoten entfernt. Die benannte Bibliothekstransition `path`
wird für aktive Pfade beendet, damit auch ein verzögerter Animationstakt die
endgültige Linienführung nicht wieder überschreibt.

`family-chart-relationship-focus.js` besitzt Fokuszustand und delegierte Listener.
`family-chart-junction-renderer.js` markiert echte Verzweigungen innerhalb einer
Abstammungsgruppe. `chart-reading.css` kapselt die neuen Lesehilfen.

Die Layoutpipeline aktualisiert nach ihren Korrekturen die gemeinsame
`tree.dim`-Instanz über `family-chart-layout-bounds.js`. Die Bibliothek erhält so
beim Einpassen die endgültigen Ausmaße. Der Kollisionsschutz versucht bei Kindern
verschiedener Partnerschaften auch deren kleinere Nachkommenzweige. Ein nicht
teilbarer Block mit knappem Abstand beendet nicht länger die Reparatur anderer
Überdeckungen. Es gibt keine globale Vergrößerung und keine neuen genealogischen Knoten.
`family-chart-reference-spacing.js` reserviert bei vielen Verweisen zusätzlichen
Platz vor der nächsten Generation und verwendet dafür dieselbe Verweisplanung
wie der Renderer.

## Prüfung

Vorher/Nachher wurden sämtliche 506 ausgearbeiteten Registerakten mit derselben
Family-Chart-Version im lokalen Edge-Browser geprüft. Die zwölf reinen
Planungsakten besitzen noch keine Personen und bleiben aus dieser Geometrieprüfung ausgeschlossen.

| Messung | Vorher | Nachher |
| --- | ---: | ---: |
| Personen- und Darstellungskarten | 20.052 | 20.052 |
| Überdeckte Kartenpaare | 5 | 0 |
| Linien durch fremde Karten | 7 | 0 |
| Überlange Partnerlinien nach Browseraudit | 22 | 0 |

Auch die 68 neuen Verweisbeschriftungen wurden geprüft: keine Überdeckung mit
Karten oder anderen Verweisen. Die vorhandenen Abstammungsverbindungen bleiben
im Vergleich vollständig erhalten.

Die Überdeckungen betrafen Nic’Holloran und Eamhra. Drei bereits bestehende
seitlich versetzte serielle Verbindungen zwischen Haus- und Zeitknoten in Blach
und Saith bleiben erhalten; sie kreuzen keine fremden Karten. Breite gemeinsame
Geschwisterlinien werden weiterhin vollständig dargestellt.

Zusätzlich geprüft: vollständiges Einpassen, Zoom, Hervorhebung, beidseitige
Verweise, Öffnen der Beziehungsübersicht und Tastaturbedienung am Desktop und
bei 390 px Bildschirmbreite. Fünfzehn neue Regressionstests und die bisherigen
1.246 Tests in `tests/run-tests.js` bestehen.

Der zusätzliche vollständige Modultestlauf hat acht bestehende Abweichungen in
älteren Import-Prüfständen (Aislearneach, Albenporträts, Blaithneach und Faelaorn).
Ein Gegenlauf mit den unveränderten Dateien aus dem vorherigen Commit ergibt
dieselben acht Fehler. Diese historischen Prüfstände wurden nicht angepasst.

Die reproduzierbare Geometrieprüfung bleibt `tests/browser-layout-audit.mjs`;
für die neuen Regeln ist `tests/family-chart-reading.test.js` zuständig.
