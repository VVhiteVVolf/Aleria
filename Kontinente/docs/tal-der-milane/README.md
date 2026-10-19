# Tal der Milane · geprüfte lokale Übernahme

Stand: 19. Oktober 2026. Ausschließlich lokal; kein Commit, Push oder Deployment.

Die sieben gelieferten HTML-Seiten sind unter `sources/` unverändert archiviert;
`sources.json` enthält ihre SHA-256-Prüfsummen. Die World-Anvil-Karte
`b3fb40f8-1c57-4690-99b2-0e7d415cbd4f` wurde über die verbundene Chrome-Erweiterung
in der Bearbeitungsansicht gelesen. Die vollständige Liste, alle 83 Markerformulare
ohne Sitzungstoken sowie Kartenmaße und gerenderte Positionen stehen unter
`worldanvil/`. Unterkarten und ältere Ortsartikel wurden nicht geöffnet.

## Umfang und Darstellung

- Grafschaft, Taubenfurt, Falkenhöh, Schwalbenhort und die Herrschaften der Tylluan,
  Mwyalchen und Eryr verwenden die gemeinsamen modularen Register und Renderer.
- 83 dauerhafte Marker-IDs, davon 78 mit vollständigem Beschreibungstext.
  `tal-der-milane-<World-Anvil-UUID>` bleibt auch nach einer Umbenennung stabil;
  `sourceRef` erhält Quellname, Quell-UUID und ursprüngliche Pixelkoordinaten.
- Alle drei gelieferten Bilder haben 4096 × 4018 Pixel und liegen ohne
  Skalierung als verlustlose WebP-Dateien vor. Der Quellursprung ist unten links:
  `x = Quell-X / 4096`, `y = 1 - Quell-Y / 4018`. Die ursprünglichen
  World-Anvil-DOM-Positionen bestätigen sämtliche Umrechnungen unabhängig.
- Die aktive Markierungsebene zeigt aktuelle Aleria-Symbole auf transparentem
  Hintergrund; „Originale Markierungen“ blendet das gelieferte Raster zusätzlich
  ein. Die Regionskarte bleibt mit den interaktiven Symbolen kombinierbar.
- Dot 80 / Schrift 50 gelten für diesen neuen Kartenstand. Vorhandene
  Nutzereinstellungen und andere Kartenstände werden nicht zurückgesetzt.
- Ortslisten sind nach Gebiet und Ortsart gegliedert. Vollständige Beschreibungen
  bleiben aufklappbar; die Kartenansicht öffnet das bestehende Ortsfenster.

## Belegte Zuordnungen und bereinigte Metadaten

- Aderyn regiert die Grafschaft und Yvains Klamm; Gaeth regiert Taubenfurt,
  Hebog Falkenhöh, Ilyuncu Schwalbenhort. Die drei weiteren Ritterfürstenhäuser
  führen ihre eigenen Register und die aus dem gelieferten Code archivierten
  Banner. Bereits vorhandene Wappen und Regionsbanner bleiben erhalten.
- Hochblick liegt in Falkenhöh, ist laut eigenem Markertext aber persönlicher
  Besitz des Grafen. Es erhält einen eigenen Eintrag mit Aderyn-Wappen und
  Aderyn-Banner, die Gebietshierarchie führt über Falkenhöh.
- Die Grafschaft zeigt 19 Häuser: sieben große Häuser, neun örtliche
  Ritterhäuser, Ffwnarch und die beiden antiken Crannath-Clans. Sliabh erscheint
  in Schwalbenhort. Faelwyn steht gemäß ausdrücklicher Lehnsherrangabe in der
  gelieferten Haustabelle bei Tylluan; das allgemeine Stammbaumprofil nennt
  bisher Aderyn. Die bestehende genealogische Akte wurde nicht verändert.
- Túr Briste wird gemäß eigenem Markertext und vorhandenem Wappen Ua Fíonnghal
  zugeordnet; Dun Talonach Ui Gormárd. Die abweichende Clanbeschriftung im alten
  Taubenfurt-Verzeichnis wurde nicht als neues Haus übernommen. Antike Clans
  werden ohne erfundene Aussage zum Aussterben gezeigt.
- Nutzerbestätigung: „Trevelin“ ist ein Schreibfehler für Trelinon. Der einzige
  zugehörige Marker bleibt nach Regionskarte und eigenem Text in Falkenhöh.
  Die Varianten Trelion, Trefgolwyn und Penhydfaen erzeugen ebenfalls keine
  zusätzlichen Marker neben Trelinon, Tregolwyn und Penrhydfaen.
- Die veraltete Ratsüberschrift „Graf von Talgarth“ lautet in den strukturierten
  Daten „Graf des Tals der Milane“. Namen werden mit vorhandenen Familienakten
  abgeglichen, etwa Bowen Tylluan, Grufydd Aderyn und Ilyuncu. Unbekannte Ämter
  behalten lokale Silhouetten. Reese wurde aus der gelieferten Portraitquelle
  lokal archiviert; die übrigen Portraits waren bereits vorhanden.
- Die gelieferten Erzähltexte bleiben unverändert, einschließlich älterer
  Regionsnamen oder Schreibweisen. Die übernommenen Marker haben keine
  ausgewählten World-Anvil-Verknüpfungsziele; die leeren Originalfelder bleiben
  im Quellenarchiv nachprüfbar. Lokale Karten-, Gebiets- und Familienlinks
  verwenden die bestehenden Aleria-Verknüpfungen.

## Fehlende Quellenangaben

| Ort | Fehlende Angabe |
| --- | --- |
| Penbryn | World-Anvil-Beschreibung leer |
| Penllyn | World-Anvil-Beschreibung leer |
| Talwyn | World-Anvil-Beschreibung leer |
| Caer Gwennol | World-Anvil-Beschreibung leer |
| Castell Eryr | World-Anvil-Beschreibung leer |
| Felsengrube | Kein Marker und kein eigener Text; Eryr-Verzeichnis |
| Donnerspitze | Kein Marker und kein eigener Text; Falkenhöh-Verzeichnis |
| Wurzelspalt | Kein Marker und kein eigener Text; Grafschaftsverzeichnis |
| Trawsfynydd | Nur in Falkenhöhs Erzähltext erwähnt; kein Marker und kein eigener Text |

Die letzten vier Orte stehen ausschließlich als offene Registereinträge ohne
erfundene Position. Die fünf vorhandenen, aber textlosen Marker bleiben auf der
Karte und tragen einen ausdrücklichen Quellenhinweis. Leere Amtsnamen und weitere
Platzhalter der gelieferten Seiten wurden nicht durch erfundene Inhalte ersetzt.

## Prüfung

`tests/tal-der-milane.test.mjs` prüft Quellprüfsummen, alle Marker-IDs, Texte,
Koordinaten und deren unabhängigen DOM-Abgleich, Häuserauswahl, Banner und aktuelle
Symbole, leere Quellenangaben, Standardgrößen und den Schutz vor erneutem Import.
Der Import verweigert das Überschreiben einer bereits bearbeiteten Karte.

Die 157 Erzählabsätze wurden einzeln gegen die archivierten Originalseiten
verglichen; alle drei WebP-Dateien sind pixelgleich zu den gelieferten PNGs.
Die sieben Seiten wurden direkt im verbundenen Chrome bei 1440, 1024, 768 und
390 Pixeln geprüft: keine Seiten- oder Kartenüberläufe, gleiche Hauskartenhöhen,
lokale Bilder, acht Verwaltungskacheln, aufklappbare Texte und korrekt abgegrenzte
Verwaltungsfenster. Die Karte wurde mit 83 gerenderten Positionen, Regions- und
Originalebene, 80/50-Standards sowie Hochblick- und Trelinon-Ortsfenstern geprüft.
Der abschließende gemeinsame Prüflauf umfasst 82 bestandene Tests einschließlich
der bereits bearbeiteten Grafschaften. `git diff --check` meldet keine Fehler.
