# Schild von Ailith – vorbereitete Alben-Übersicht

Stand: 22. Oktober 2026. Lokal vorbereitet; nicht veröffentlicht.

## Quellen und Umfang

Die zwei gelieferten Altartikel bleiben unverändert unter `sources/` archiviert. `sources/manifest.json` sichert die ursprünglichen Dateipfade und SHA-256-Prüfsummen. Gestaltung, Tabellenfarben, fremde Bildhoster und leere Altabschnitte werden nicht übernommen.

- Gemeinsame Übersicht: Fianna, fünf aktive Verwaltungsstränge, Prophezeiung, Fürstentümer/Haine, Kultur und ein kurzer historischer Abriss.
- 46 Ämter, Rollen und Titel aus dem Ämterartikel, mit vollständigen Beschreibungen und vorhandener gemeinsamer Suche.
- Ogham, Clan, Sept und alle 21 Clan-Präfixe mit vollständigen Texten; längere Inhalte aufklappbar.
- Zwölf vorbereitete Landeszugänge: Leitheach, Aislearneach, Dunfal, Blaithneach, Uathneach, Faelaorn, Iathneach, Deitheach, Moinneachs, Lichthain, Hain der Druiden und das untergegangene Ceitheach.

Die vollständigen neuen Nutzerangaben – einschließlich des noch nicht vollständig veröffentlichten Ceitheach-Hintergrunds – stehen in [LORE-KONTEXT.md](LORE-KONTEXT.md).

## Einordnung und offene Angaben

Cú Chulainn wird aus der bestehenden kanonischen Stammbaumperson `haus-chulainn/cu-1509-chulainn` geladen. Weitere Ratsmitglieder oder Fianna-Amtsträger sind nicht belegt und werden nicht benannt. Fürstenrang allein beweist keine Fianna-Mitgliedschaft. Die Einstimmigkeitsregel betrifft ausdrücklich die Aufnahme.

Die fünf aktiven Stränge stehen neben einer gesonderten historischen, aufgelösten Dämmerwacht. Örtliche Ratsmagier- oder Druidenämter aus dem Altartikel sind keine Wiedereinsetzung der Arkane der Fürsten. Die alten Ämtertexte enthalten einzelne allgemeine Vergleichsbegriffe wie König, Grafschaften und Milwr; sie benennen damit keine neuen albischen Monarchen oder Territorien.

Sechs Einträge haben belegte Fürstenclans, Sitze und vorhandene lokale Bildquellen. Bei den sechs übrigen Einträgen bleiben Clan, Sitz und Wappen offen. Für Moinneachs ist bislang nur diese Schreibweise aus der alten Fürstenliste belegt. Faelaron/Faelorn wird auf die bereits vorhandene kanonische Schreibweise **Faelaorn** bezogen; dessen ungefähr hälftige Besetzung durch Skjaerheim bleibt berücksichtigt. Dúnfál auf Estryll verweist auf **Dunfal**.

Ceitheach steht als historisches Fürstentum nach den übrigen Ländern. Die behauptete Tuathanach-Abstammung der Rochraide ist ausdrücklich fingiert. Die bestehende Genealogie wird nicht verändert.

## Zuständigkeiten

- `modules/alben/*.source.json`: inhaltliche Quellen nach Bereich, ohne Personenakten oder Länderdateien zu duplizieren.
- `scripts/build-alben.mjs`: drei statische Seiten, Metadaten, kanonischer Rats-Snapshot und ausschließlich der eigene `ALBEN_GENERATED`-Block im Kontinentregister.
- `modules/alben/page-template.mjs` und `content-template.mjs`: gemeinsame Übersicht und vorbereitete Einträge; Ämter verwenden den vorhandenen `kingdom-court`-Renderer samt Filter.
- `modules/alben/principality-links.mjs`: vorhandene echte Fürstentumsseiten aus dem Kontinentregister bevorzugen, sonst vorbereiteten Eintrag öffnen.
- `modules/alben/overview-page.mjs`: gemeinsamer Ratskarten- und Infobox-Renderer.
- `modules/alben/entry-page.mjs`: ausgewählten vorbereiteten Eintrag anzeigen; ohne JavaScript bleiben sämtliche Einträge lesbar.
- `modules/alben/continent-links.mjs`: Links auf Estryll bei später registrierten Länderseiten nachführen.
- `modules/alben/alben.css`: auf die Alben-Ansichten begrenzte Darstellung; Verwaltungsicons stammen aus dem vorhandenen zentralen Iconregister.

Die einzige Erweiterung der gemeinsamen Ämtervorlage ist ein optionaler `realmLabel`. Ohne diese Option bleibt die bestehende Königreichsbeschriftung unverändert. Aldrimars erzeugte Seiten sind unverändert reproduzierbar.

## Späterer Ausbau

Eine ausgearbeitete Landesdatei erhält ihre echte kontinentale Hierarchie und die bereits vorbereitete `pageId` aus `principalities.source.json`. Nach Registrierung bevorzugen beide Verzeichnisse diese Seite. Der Schild von Ailith ist ein gemeinsamer Zugang, keine neue kontinentale Oberherrschaft. Die fünf vorhandenen Landeszugänge und der historische Ceitheach-Eintrag auf Estryll bleiben bestehen.

Build: `node Kontinente/scripts/build-alben.mjs`; Reproduzierbarkeit: derselbe Befehl mit `--check`. Inhalt, Quellen, Links, kanonische Referenz und Hierarchie: `node --experimental-test-isolation=none --test Kontinente/tests/alben.test.mjs`. Die bestehenden Cenyr-/Aldrimar-Tests sichern die gemeinsame Ämterdarstellung ab.
