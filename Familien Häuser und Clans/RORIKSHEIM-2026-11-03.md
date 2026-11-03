# Roriksheim: Clanseiten, Hausbios und Darstellungen

Der Abgleich umfasst sämtliche 33 öffentlichen Familienakten des Jarltums: 27 heutige Clans, Haus Frostgeborene und fünf ausgestorbene Clans. Die ursprünglichen Familiengraphen, Hausprofile, Titel, Wappen, Personen und IDs bleiben erhalten. Es wurden keine gelieferten Stammbaumtabellen importiert; jede Seite bettet die bereits bestehende Familienakte ein.

Die 18 gelieferten Vorlagen ergänzen Varulv, Vangandr, Freiwinter, Skaal, Brathfengr, Schwarzdorn, Kampfgeborene, Frostgeborene, Nachtjäger, Skjegg, Sterkr, Sökeren, Skald, Ulvasar, Bjornskar, Vanir, Tíogar und Fiadhrach. Ihre 19 Originalfiguren bleiben unverändert; Varulv besitzt zwei Darstellungen. Fehlerhafte Überschriften wie Ulvasar über dem Bjornskar-Text begründen keine neue Identität.

Die übrigen 15 Darstellungen gehören zu Grünklang, Flammenschritt, Runensänger, Sturmsänger, Liedtrinker, Spottzunge, Eisenjungfer, Blutdorn, Dornacker, Bärenherz, Krähenrufer, Unholdbann, Rotstahl, Bogenhand und Wolfshorn. Sie wurden mit dem eingebauten Imagegen-Werkzeug nach `fantasy-rpg-character` erstellt. Wappen und die tatsächlich angesehene freigegebene Hausritter-Stilreferenz wurden als Bildreferenzen mitgegeben. Hausfiguren sind repräsentative Illustrationen und begründen keine neuen Personendatensätze, Berufe oder Mechaniken.

Die ausführliche vorhandene Eisenjungfer-Bio wird extern verwaltet und bleibt erhalten; Hauptbild und Hausseitenverweis werden gezielt ergänzt. Die neuen Kurzbiografien verlinken die ausführlichen Clanseiten. Unbelegte Lebensläufe und Familienbräuche der kleineren Clans werden nicht erfunden. Huskarltum, Kriegskunst der historischen Alben und bürgerliches Hausleben erhalten passende Abschnittstitel über die bestehende gemeinsame Ausgabe.

Ulvasar, Bjornskar, Vanir, Tíogar und Fiadhrach sind historische ausgestorbene Clans. Ihre Registerrangfelder bleiben offen. Kulturordner wie „Glaennath (Alben)“ werden auf der Seite als Kultur bezeichnet; ausschließlich vorhandene historische Ortsbezüge aus `secondarySeats` können als Sitz erscheinen. Unterschiedliche Berichte über die Fiadhrach werden vorsichtig als Überlieferung behandelt. Wolfshorn in Hornhall und der ausgewanderte Zweig Bleiddorn bleiben eigenständige Akten.

Quellenarchive, redigierte Kapitel, Bildbelege, Prompts und die Vorher-Sicherung liegen unter `diagnostics/roriksheim-clans-20261103/`. Produktive redaktionelle Quellen stehen pro Familie unter `Estryll/Aldrimar/Roriksheim/`; die gemeinsame Ausgabe und ihre Register werden ausschließlich für die 33 ausgewählten IDs aufgebaut. Militärstatistiken und geheime Vaterschaftsbehauptungen aus alten Tabellen werden nicht übernommen.

Gezielte Prüfung: `node "Familien Häuser und Clans/tests/roriksheim-house-pages.test.mjs"`. Hausseiten- und Galerie-Generatoren unterstützen dieselbe begrenzte Auswahl mit `--houses=...` sowie `--check`; keine unbeschränkte Neugenerierung ist für diese Übernahme erforderlich.

Der Auftrag wurde lokal bearbeitet; Commit, Push und Deploy sind kein Bestandteil dieser Übernahme.
