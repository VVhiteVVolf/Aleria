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

## Ergänzung: örtliche Partnerschaften und Beziehungsübersicht

Owains bereits vorhandene Wiederholung für die Beziehung mit Sylvia wurde im
ersten Layoutschritt richtig platziert. Spätere Korrekturen verwendeten jedoch
die Personen-ID für beide Darstellungen und verschoben Sylvia zum anderen
Owain. Alle Layoutschritte erhalten jetzt eine reine Geometrieprojektion mit
den konkreten Darstellungskarten. Sylvia bleibt bei ihrer Herkunftsfamilie;
Owains zugehörige Darstellung und Siana bilden dort den örtlichen Familienzweig.
Die genealogischen Personen, Beziehungen und Online-IDs werden nicht geändert.

`family-chart-appearance-layout.js` besitzt diese Projektion. Der gemeinsame
Appearance-Router ergänzt außerdem örtliche Wiederholungen für externe Personen
ohne eigenen Herkunftszweig, wenn mehrere Partnerschaften mit Kindern sonst
verschiedene Herkunftsfamilien zusammenziehen würden. Ausdrücklich kuratierte
Mehrpartneranordnungen und alternative Elternschaften behalten ihre Vorgaben.
Herkunftsseitige Partnerspiegel bleiben in der Geometrie berücksichtigt.

`family-chart-partnership-nodes.js` plant örtliche Beziehungsknoten, deren Typ,
belegten Zeitraum und Status. Gemeinsame Kinder schließen an genau diesem
Knoten an. `partnership-presentation.js` stellt dieselben Angaben für Baum und
Beziehungsübersicht bereit. Fehlende Reihenfolgen oder Zeiträume werden nicht
aus Geburtsdaten oder Arraypositionen abgeleitet. Fernverweise bleiben für
Verbindungen erhalten, deren Partner nicht sinnvoll örtlich zusammenstehen.

Beschriftungen erhalten vor der nächsten Generation den tatsächlich benötigten
Platz. Die Kollisionsgeometrie berücksichtigt auch die angehobenen Karten von
Zweighäusern; CSS und Linienplanung verwenden denselben Versatz.

Die Beziehungsübersicht zeigt jede Partnerschaft mit ihren eigenen Partnern
und eindeutig zugeordneten Kindern. Nicht eindeutig zuordenbare Kinder werden
gesondert aufgeführt. Affären erzeugen keine angenommenen Stief- oder
Schwiegerverhältnisse. Navigation innerhalb der Übersicht unterstützt Zurück,
Rückkehr zur Ausgangsperson und Tastaturfokus. Ein Beziehungsknoten öffnet
direkt die entsprechende Partnerschaft. Die mobile Ansicht zeigt die Person
und ihre Partnerschaften zuerst.

## Automatische Veröffentlichungsschranke

`chart-geometry-audit.js` prüft dieselbe gerenderte Geometrie im vorhandenen
Browseraudit und im neuen, isolierten Veröffentlichungsprüfer. Er erkennt:

- überdeckte Karten, kollidierende Beschriftungen und Linien durch fremde Karten;
- freie Linienenden und Beschriftungen ohne zugehörigen Anschluss;
- fehlende oder widersprüchliche Gegenverweise;
- örtliche Partnerdarstellungen, die wieder als Fernverbindung auseinandergerissen werden.

Die isolierte Browserseite lädt ausschließlich lokale Module und Bibliotheken.
Sie verwendet keine Firebase-Verbindungen und schreibt keine Familiendaten.
Transparente technische Zeitstufen zählen nicht als sichtbare Kartenhindernisse.
Legitime Linienverzweigungen werden anhand ihrer Beziehungsmetadaten erkannt.

`tools/check-release.mjs` führt die fokussierten Regressionstests und danach
sämtliche ausgearbeiteten Registerakten im Browser aus. Der Netlify-Build ruft
diesen Prüfer vor dem bisherigen Karten-Build auf und bricht bei jedem Fehler
ab. Browser- und Testabhängigkeiten werden fest versioniert installiert und
vor der Veröffentlichung aus dem Websiteverzeichnis entfernt.

Lokale Verwendung im Verzeichnis `Stammbäume`:

```sh
npm ci
npx playwright-core install chromium
npm run test:geometry
npm run test:release
```

Unter Windows wird vorhandenes Edge oder Chrome automatisch verwendet.
`STAMMBAUM_BROWSER_PATH` erlaubt einen eigenen Browserpfad. Einzelakten lassen
sich mit `npm run test:geometry -- --families=haus-arth` prüfen; die horizontale
Variante unterstützt `--orientation=horizontal`.

Abschließend bestanden alle 506 ausgearbeiteten Stammbäume die erweiterte
Geometrieprüfung: 19.911 sichtbare Karten, keine erkannten Darstellungsfehler.
Arth, Ragnulf und Marchog wurden zusätzlich horizontal geprüft. Desktop und
390-px-Ansicht von Arth wurden mit echtem Anwendungsdialog, Navigation,
Tastaturbedienung und Zoom kontrolliert. Dreizehn zusätzliche Regressionstests
und alle 1.246 bisherigen Tests in `tests/run-tests.js` bestehen. Der vollständige
Modultestlauf enthält weiterhin dieselben acht oben dokumentierten historischen
Importabweichungen (222 von 230 Tests bestanden).
