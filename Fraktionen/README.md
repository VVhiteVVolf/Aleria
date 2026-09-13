# Fraktionen von Aleria

Eigenständiges, statisch erzeugtes Fraktionsregister unter `Fraktionen/index.html`. Der Almanach bindet es über einen gemeinsamen Reiter mit `IconOrdner/ReiterIcons/Fraktionen.svg` ein.

## Bestand und Zugehörigkeit

| Bereich | Einträge | Ordnung |
| --- | ---: | --- |
| Gilden | 94 | Wolken der Dämmerung als Aufsichtsorgan; Untergilden bleiben ihren unmittelbaren Verbänden zugeordnet. |
| Orden | 41 | Kirchliche Gewalt als Rahmen; direkte Kirchenzweige und lokale Unterorden sind gesondert verknüpft. |
| Organisationen | 42 | Eigenständig oder landesgebunden; Banner der Blauschwingen und die albenische Administration bleiben erkennbar. |
| Dunkle Gilden | 19 | Loge der Dämmerung; eigene Zweige und Unterbanner der Blutsegel. |
| Kulte | 28 | 17 übernommene und 11 ergänzte Einträge; nach Gottheiten geordnet, ohne gemeinsame Führung. |

Die 224 Einträge sind Registereinträge, keine Behauptung über 224 eindeutig verschiedene aktive Organisationen. Unbenannte Wappen, gestrichene Namen und mehrdeutige Doppeleinträge werden bewusst bewahrt.

## Zuständigkeiten

- `data/<bereich>.json`: Namen, Gruppen, unmittelbare Zugehörigkeit, zusätzliche Verbindungen, Kurzprofile und Herkunft. Hier werden Fraktionen ergänzt und gepflegt.
- `modules/catalog/faction-categories.mjs`: Die fünf Bereiche und ihre übergeordnete Ordnung.
- `modules/catalog/faction-repository.mjs`: Laden und Validieren der Fraktionsdaten. Gottheiten, ihre bestehenden Symbole und Zielseiten werden zur Buildzeit über das vorhandene Religions-Repository aufgelöst.
- `modules/catalog/faction-hierarchy.mjs`: Leitet aus `parentId` den Darstellungsbaum ab; jeder Eintrag erscheint genau einmal mit seinen unmittelbaren Unterverbänden.
- `modules/catalog/faction-template.mjs`: Statische, auch ohne JavaScript vollständige Seite. Verweise und Inhalte werden HTML-escaped ausgegeben.
- `modules/catalog/faction-model.mjs`: Suche und Auswahl; Vorfahren bleiben bei Treffern als Kontext sichtbar, zählen aber nicht als Suchtreffer.
- `modules/catalog/faction-controller.mjs`: Lokaler Seitenzustand, delegierte Listener, Bereichswechsel, Hashnavigation und Fokus bei Fraktionsverweisen.
- `modules/book-shell/` und `modules/catalog/faction-catalog.css`: Seitengestaltung, Titelbanner und Wappenregister.
- `assets/emblems/`: Lokal gespeicherte, auf maximal 400 Pixel optimierte Originalwappen. Keine Laufzeitabhängigkeit von Imgur oder Tumblr.
- `assets/categories/`: Optimierte Varianten der fünf bisherigen Reitericons. Herkunft in `category-sources.json`.

Keine neuen globalen States, Inline-Handler, Firebase-Zugriffe oder Paketabhängigkeiten. Die Religionen bleiben für Gottheiten und Kirchenlehre zuständig; die Fraktionsseite verwaltet deren konkrete Gemeinschaften.

## Datenkonventionen

`id` muss innerhalb des gesamten Registers eindeutig und stabil bleiben. `groupId` verweist auf eine Gruppe desselben Bereichs. `parentId` benennt einen unmittelbaren übergeordneten Verband; für die Untergilden des Marktes der Fortuna ist dies der Markt, dessen eigener übergeordneter Verband wiederum die Wolken der Dämmerung sind. `group.parentId` ist die gemeinsame Zugehörigkeit aller Einträge einer Gruppe.

`affiliations` beschreibt zusätzliche Verbindungen, ohne den Bereich zu wechseln: Die Erben der Morgenröte bleiben ein Kult, sind aber mit der Dämmerwacht verknüpft; die fürstlichen Einrichtungen bleiben Organisationen und verweisen auf Fianna. Die drei Säulen der Triarchie verweisen aufeinander. `deityId` ist eine Glaubenszuordnung und **kein** `parentId`.

Oberfraktionen und ihre Unterverbände erscheinen gemeinsam in einem umrahmten Bündel: beispielsweise Markt der Fortuna mit Mariels Gabe und Geeinten Händen, Musen der Maid mit ihren Untergilden sowie Blutsegel, Schwanenorden und Blauschwingen mit ihren Bannern. Vorhandene Fachgruppen bleiben innerhalb des jeweiligen Verbandes erhalten. Bündel stehen innerhalb einer Fachgruppe vor den einzelnen Fraktionen, damit deren Karten geschlossene Reihen bilden. Übergeordnete Aufsichtsorgane umschließen ihre eigenen Verbände, ohne die anderen Bereiche einzugliedern. Die Suche erhält sämtliche notwendigen Vorfahren und blendet leere Unterbereiche aus; Verweise behalten die bisherigen Fraktions-IDs.

Das gemeinsame Reitericon ist ein quadratisches SVG mit Pergamentstruktur, Zierrahmen und drei Bannern in Gold-Braun, passend zu den bestehenden Reitericons.

Symbole und Seitenziele sind relativ zu `Fraktionen/` angegeben. Die Fraktionsseite verlinkt ausschließlich interne Ziele. Die alten Animexx-Adressen bleiben als Herkunftsangabe in `source.href` und in den unveränderten Importvorlagen dokumentiert; sie werden nicht als Seitenziele ausgegeben. Ein fehlendes internes Ziel erzeugt keinen leeren Link. Ergänzte Kulte verweisen auf den Kultabschnitt der zugehörigen Gottheit.

## Quellen und redaktionelle Entscheidungen

Die fünf unveränderten HTML-Vorlagen stehen in `docs/sources/`. `docs/import-manifest.json` enthält ihre SHA-256-Prüfsummen und Importzahlen. Jeder übernommene Datensatz bewahrt Quelldokument, Tabellenzeile und -spalte, Originalnamen, Bildadresse und ursprünglichen Seitenverweis. Bildherkunft und Prüfsummen der heruntergeladenen Originaldateien stehen in `assets/emblem-sources.json`.

- Leere Tabellenplätze (`-`, `...`) und leere Gruppen wurden verworfen. Zwei mit `???` benannte Wappen bleiben als unbenannte Einträge erhalten.
- Wintersonne, Runenkrieger, Ost-Kaiserliche Handelsgilde und der separate gestrichene Dämmerwacht-Eintrag behalten `status: "struck"`. Daraus wird kein unbelegtes Gründungs-, Auflösungs- oder Todesdatum abgeleitet.
- Die doppelte Dämmerwacht bleibt nachvollziehbar als gesonderter gestrichener Eintrag bestehen; sie ist nicht Teil der zuvor stehenden Fianna-Administration.
- Die beiden Hetären-Einträge unterscheiden sich durch „klerikal“ und „karitativ“. Die beiden Einträge zu Mardrans Contubernium behalten ihre unterschiedlichen Quellenziele und werden durch „Argentum“ bzw. „Militärregister“ unterschieden.
- „Richter des Reinen Butes“ wird als „Richter des Reinen Blutes“ und „Orden des Zerissenen Geistes“ als „Orden des Zerrissenen Geistes“ angezeigt. Die Originalschreibweisen bleiben als Suchalias erhalten.
- Schemafehler der Vorlagen wurden beim Import ausgeglichen: Das Wappen der Musen der Maid steht versetzt unter einer anderen Tabellenspalte; Erben des ersten Schwurs und Schwanenorden verteilen Namen, Untertitel und Bild auf drei Zeilen.
- Der Zarakim-Kult, Totensaat und der Orden des Zerrissenen Geistes bleiben wie in der Vorlage ohne feste Gottheitszuordnung. Namensähnlichkeit allein begründet keine neue Unterstellung.
- Die Alerische Kirche nutzt das bestehende Religionssymbol und verweist auf `Religionen/religionen/alerische-kirche/index.html`.

### Ergänzte Kulte

Die folgenden **neuen Kultnamen und Kurzprofile** wurden im vom Nutzer beauftragten Ausbau am 13. September 2026 ergänzt. Sie sind keine aus den alten Tabellen übernommenen Namen. Ihre thematischen Grundlagen stammen aus den bestehenden Gottheitsprofilen; darüber hinaus werden keine Sitze, Anführer, Ereignisse oder gemeinsame Hierarchien erfunden.

| Gottheit | Ergänzter Kult |
| --- | --- |
| Nyxara | Die Schleier der Nacht |
| Adar | Kinder des Spalts |
| Thraal | Der Ertrunkene Chor |
| Nemsara | Die Dornen der Vergeltung |
| Azrath & Morvath | Kinder des Zerrissenen Spiegels |
| Migdal | Bund der letzten Wünsche |
| Nergaloth | Bruderschaft des Fahlen Keims |
| Syressa | Hüter der Verschlossenen Zuflucht |
| Nhaera | Die Heimkehrlosen |
| Nymhra | Der Sanfte Schleier |
| Maelach | Stimmen der Tausend Münder |

Damit besitzen alle zehn hohen Infernalen und neun infernalen Untergottheiten mindestens einen Kult im Register. Die neuen Einträge nutzen unmittelbar die vorhandenen infernalen Icons. Gefallene und Geweihte werden ohne benannte Kultüberlieferung nicht pauschal in weitere neue Fraktionen umgedeutet.

## Erzeugen und prüfen

Im Verzeichnis `AleriaAlmanach/`:

```sh
npm run build:factions
npm run check:factions
npm run test:factions
```

`index.html` ist generiert und wird eingecheckt; Änderungen erfolgen in Daten, Templates oder Featuremodulen. Der reguläre Almanach-Prebuild erzeugt sie nach den Religionen erneut. Vite enthält einen eigenen Eingang für die Fraktionsseite und verarbeitet ihre statisch referenzierten Bilder, Styles und Skripte auch bei relativem Deploymentpfad.

Die Tests prüfen Quellenbestand, Hierarchien, fehlende und zyklische Elternbezüge, Kultabdeckung, lokale Wappen, Suchkontext, statische Erreichbarkeit und den Ersatz der alten Almanach-Reiter. Browserprüfungen umfassen Bereichsfilter, Suche, Rücksetzen, Verweise zwischen Bereichen, Kirchenziel und mobile Darstellung.
