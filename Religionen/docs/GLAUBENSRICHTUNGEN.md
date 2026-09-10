# Die acht ergänzten Glaubensrichtungen

Die am 10.09.2026 gelieferten acht HTML-Vorlagen sind als vollständige Religionsartikel eingebunden. Die übernommene Lore einschließlich Listen, Zitaten und verschachtelten Rangbeschreibungen umfasst 165.641 Zeichen. Der Import wurde gegen sämtliche substanziellen Absätze und Listeneinträge der Originale geprüft. Dateihashes, Anhangs-IDs und Prüfsummen der übernommenen Texte stehen in [religionen-import.json](religionen-import.json).

| Religion | Gestalten nach Gruppen | Geistliche Ränge |
| --- | --- | --- |
| Nordischer Pantheon | 9 + 5 | 11 |
| Alter Pantheon | 9 + 5 + 5 | 12 |
| Celestische Synode | 9 + 1 + 5 | 11 |
| Hohe Drei | 3 + 14 | 11 |
| Harmonie von Mond & Sonne | 2 | 10 |
| Zirkel des Ewigen Waldes | 1 + 7 + 1 + 5 | 12 |
| Phalantischer Bund | 1 + 6 + 12 + 3 | keine eigene Rangtabelle geliefert |
| Offenbarung der Schwarzen Sonne | 1 + 1 | 12 |

Insgesamt 105 dargestellte Gestalten und 79 Ränge. Die Reihenfolge der Hierarchien entspricht der jeweiligen Vorlage. Militärische Nebenämter bleiben dem zugehörigen geistlichen Rang zugeordnet. Die eigenständigen Hierarchien dieser Religionen verwenden ihre eigenen Überlieferungen; die spätere Nutzervorgabe zur Alerischen Kirche wird ausschließlich in deren Klerusbereich gepflegt.

## Bildfamilien und Herkunft

90 gelieferte Bildnisse werden unverändert verwendet. Das nicht erreichbare Tumblr-Bild war ein wiederholter Platzhalter für zehn fehlende Gestalten. Zusätzlich wurden auf ausdrücklichen Nutzerwunsch die fünf schwarzen Feindbild-Symbole des Waldzirkels durch passende Figuren ersetzt. Insgesamt sind 15 Ergänzungen aus dem eingebauten `image_gen` eingebunden:

- Alter Pantheon: Nimue, Rhea, Zephyr, Aelthar und Thyrael. Farbige keltische Figurenzeichnungen mit Tiergeistern auf warmem Pergament; Schwalbe, Widder, Adler, Greif und Phönix entsprechend der Vorlage.
- Celestische Synode: Pyrotes, Nereidia, Fortuna, Nemesis und Geminius. Klassische Figuren als feine bronzefarbene Konturzeichnungen mit echtem transparentem PNG-Hintergrund.
- Zirkel des Ewigen Waldes: Tethron, Baalzor, Lyrion, Gryloth und Aurion & Noxus als antikisierende Ganzfiguren in dunklem Braun mit ockerfarbenen Konturen und Akzenten, entsprechend Klytharios, Kyreon und den Göttinnen. Alle fünf sind mit transparentem Hintergrund eingebunden. Die früheren Symbolbilder bleiben unverändert als Quellen unter `legacyImages` verzeichnet; der Artikel verwendet die neuen `*-waldzirkel.png`.

Bei Baalzor, Lyrion, Gryloth und Aurion & Noxus erzeugte das Bildwerkzeug zunächst ein aufgemaltes Transparenzmuster. Der Nutzer hat die lokale Freistellung ausdrücklich genehmigt. Pillow/NumPy entfernen den neutralen Hintergrund anhand der braun-ockerfarbenen Figur und bereinigen die Kanten; die Figuren werden dabei nicht neu gezeichnet. Diese Bearbeitung samt Eingangshash steht in den Bildmanifesten und den Bildprompts unter `postProcessing` beziehungsweise `edits`.

Die genaue Vorgabe des Nutzers bleibt verbindlich: **„Keinen einheitlichen stil erfinden!“** Jede Religion behält ihre vorhandene Bildsprache. Es gibt keine globale Farbkorrektur, Umzeichnung oder Beschneidung. Die vorhandenen farbigen Religionssymbole aus der ursprünglichen Hauptübersicht bleiben erhalten; der Phalantische Bund verwendet sein vorhandenes Helmzeichen. Die schwarzen Kopfzeichen der neuen Tabellen ersetzen diese Symbole nicht.

Jeder Religionsordner besitzt `assets/sources.json` mit Herkunft, Bildmaßen und SHA-256. Generierte Ergänzungen verweisen zusätzlich auf ihre lokalen Vorbilder und auf die vollständigen [Bildprompts](religionen-bildprompts.json). Alle Bildnisse können in vollständiger Größe geöffnet werden, auch nach dem Vite-Build.

## Lore und kulturelle Zuordnungen

Regionale Namen und Aspektkombinationen bleiben erhalten. Beispielsweise verweist Krathos auf Ordan, Baldran und Grimnar. „Vergleich im Codex“ führt zu den jeweiligen vorhandenen Einzelprofilen oder direkt zum benannten Registereintrag, wenn noch kein eigener Artikel existiert. Damit erhalten Narath und ähnliche Registergestalten keine leeren neuen Profilseiten.

Die Quellen unterscheiden sich teilweise in theologischen Zählungen. Aussagen über neun Infernale bleiben in den jeweiligen Lehren bestehen; ein kurzer Hinweis führt zur heutigen Infernus-Übersicht mit zehn hohen Mächten und Adars umstrittener Zugehörigkeit. Nicht benannte Aesir, Halbgötter oder Heilige werden nicht mit erfundenen Figuren aufgefüllt. Leere Zitatfelder und reine Auslassungszeichen entfallen. Bei namentlich gelieferten Rängen ohne Beschreibung bleibt erkennbar, dass deren Text noch fehlt.

Für die Triarchie der Eroberung war unter diesen acht Anhängen keine Vorlage enthalten. Ihr bisheriger Registerartikel mit Zeichen bleibt bis zur weiteren Ausarbeitung bestehen.

## Pflege und Verantwortung

Jede Religion besitzt einen eigenen Ordner unter `religionen/<id>/`:

- `eintrag.json`: Artikeltitel, Einleitung, vollständige Lehre, Abschnitte, Beziehungen und `traditionSource`.
- `glaube.json`: Göttergruppen mit lokalen Namen, Aspekten, Bildverweisen und `relatedIds`; optional eigene Hierarchie, Zitat und Überlieferungshinweise.
- `assets/`: vollständige Bildnisse und Herkunftsmanifest.
- `index.html`: erzeugter statischer Artikel.

`modules/traditions/tradition-repository.mjs` validiert Figuren, lokale Bildpfade, Maße und Vergleiche mit dem übrigen Codex. `tradition-template.mjs` rendert Bildregister und Hierarchie; `tradition.css` gestaltet ausschließlich diesen Bereich. Artikel und Register teilen sich die vorhandene Suche aus `modules/catalog`. Deren Bedienelemente sind in `catalog-controls.css` gekapselt. `renderShell` trennt die Aktivierung der Suche vom Layout einer vollständigen Katalogseite.

Neue Gestalten werden ausschließlich in der passenden Gruppe von `glaube.json` ergänzt. Ihre IDs sind innerhalb der Religion eindeutig; derselbe lokale Name darf in unterschiedlichen Religionsordnern vorkommen. `relatedIds` referenzieren bestehende Einträge oder Registergestalten. Bildpfade sind relativ zu `Religionen/`. Gruppenfilter, Zähler, lokale Suche und Hauptsuche wachsen aus diesen Daten mit. Neue Listener oder eigene Seitenvorlagen sind dafür nicht nötig.

Nach Inhaltsänderungen `node Religionen/scripts/build-religions.mjs` ausführen. Der gemeinsame Generator bleibt bei 70 HTML-Dateien: Diese Arbeit erweitert acht bereits vorhandene Artikel. Die Tests unter `tests/traditions.test.mjs` prüfen vollständige Textübernahme, Bildintegrität, Verknüpfungen, Suche, sichere Ausgabe und ungültige Daten.
