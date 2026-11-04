# Kronental / Heldenwacht: Clanseiten, Hausbios und Darstellungen

Der lokale Auftrag vom 3. November 2026 umfasst alle **29 öffentlichen Familienakten** des Kronental-Registers, einschließlich der kleinen Huskarl- und Bürgerclans: 24 lebende und fünf historische Familien. Jede erhält eine Hausseite, eine redaktionell gekürzte Hausbio und eine passende Darstellung. Der Umfang folgt dem tatsächlichen öffentlichen Registerbestand, nicht nur den 19 gelieferten Vorlagen. Es werden keine neuen Familien oder genealogischen Verbindungen aus diesen Vorlagen angelegt.

Der Vorherstand umfasst ein Königshaus, sieben Hesirenclans, zwölf Huskarlclans, drei Bürgerclans und sechs Familien mit offenem Rang. Südstahl und Albholz besitzen bereits ausführliche registrierte Hausseiten und je eine Galerieabbildung. Stammbaum-Hausbios fehlen zunächst bei allen 29 Familien. Die beiden vorhandenen Seiten werden mit ihren belegten Inhalten, Personenverweisen, Originalbildern und Aliaslinks in die gemeinsame Pflege überführt; ihre bisherigen Datendateien sind zusätzlich bytegleich archiviert.

## Kanonische Orte, Ränge und Personen

Die Familienregistrierung und Hausprofile führen weiterhin **Kronental**. Die aktuelle Territorialquelle nennt Kronental einen älteren Namen des **Jarltums Heldenwacht**. Rücklinks verwenden deshalb die bestehende ID `jarltum-heldenwacht` und die Seite `Kontinente/Estryll/Königreich Aldrimar/Jarltum Heldenwacht/Jarltum Heldenwacht.html`. Es entsteht weder eine zusätzliche Jarltumsakte noch ein erfundener Pfad unter „Jarltum Kronental“.

Aktuelle IDs, Profile, Ränge, Orte und Hierarchien gehen alten Infotabellen vor. Der Vorlagenname „Sturmgeborener“ gehört zur bestehenden Akte `haus-sturmgeborene`; „Mamhar“ gehört zu `haus-mac-mamhar`. König **Sigurd Vaeren** ist das Clanoberhaupt der Vaeren. **Skjor Vaeren** bekleidet das territoriale Jarlsamt; dieses Amt ersetzt Sigurd nicht als Clanoberhaupt. Ein Amt im Jarlsrat begründet ebenfalls keine Führung des jeweiligen Herkunftsclans.

Die Frostaugen werden vom amtierenden Hesir Aegir geführt; Gangr ist ausdrücklich dessen Erbe. Beim heutigen Vorn Frostzorn ist **1697 das Geburtsjahr**, kein Amtsbeginn. Er bleibt von seinem früheren Vorfahren und Gründer Vorn Frostauge getrennt. Arvid wird nicht aufgrund seiner Position im Personenarray oder einer Linienmarkierung zum amtierenden Oberhaupt erhoben. Frostzorn lebt als abtrünnige Linie in Vintrefjord weiter, mit offenem Rang und ohne reguläre Lehensbindung.

Spindelschlag bleibt ein **bürgerlicher Thengr ohne Adelsbrief**, mit Sitz Spindelheim und bestehender Bindung an Vaeren. Eine frühere Überlegung, die Familie später mit Torrenheim zu belohnen, ist keine aktuelle Vergabe. Morchaon und Hvelgrson bleiben ebenfalls bürgerlich; ihre Profile enthalten keine Lehnsherren. Südstahl und Albholz bleiben in Heldenwacht verzeichnet. Herkunftsorte, Schwertschule, Universität oder andere Betriebe erzeugen keine neuen Familiensitze.

## Historische Familien und Darstellungen

Die fünf erloschenen Clans sind **Holmr, Skaife, Grimr, Isvanyr und Mac Mamhar**. Holmr, Skaife und Grimr waren nacheinander Herren Torrenheims. Der reale letzte Sitz Torrenheim bleibt erhalten; Torrenwacht ist heute vakant. Die kanonische Kennzeichnung `family.extensions.extinctHouse` gilt auch dann, wenn der Registerordner nicht mit „Ausgestorbene“ beginnt. Alle fünf historischen Ränge bleiben offen. Kulturordner wie Norrnaigh und Glaennath sind keine historischen Stammsitze.

Die 19 Vorlagen liefern **19 Originaldarstellungen für 18 Häuser**. Wellensänger besitzt zwei Figuren; beide bleiben erhalten und werden auf der Seite und in der Galerie eingebunden. Südstahls und Albholzes Bilder sind bereits lokal vorhanden und werden bytegleich wiederverwendet. Auch Dämmerrufers Gruppenbild und die übrigen kulturellen Originale werden nicht ersetzt oder stilistisch überarbeitet.

Es bestehen **elf echte Bildlücken**: Frostzorn sowie Eibenschild, Donnerblut, Moorbrand, Jormung, Nidfengr, Tarbhann, Bjarnvarg, Tauwind, Morchaon und Hvelgrson. Nur diese erhalten neue anonyme Hausfiguren im freigegebenen Stil. Vier Familien besitzen derzeit lediglich ein neutrales Wappen: Nidfengr, Tarbhann, Morchaon und Hvelgrson. Daraus werden weder neue Heraldik noch Berufe oder Hausgeschichte abgeleitet. Eibenschild bleibt der belegte Huskarlclan von Vagaborg unter Wellenschild; die noch unbenannten Clans von Sundkrone und Lothirblick werden weder damit vermischt noch neu angelegt.

## Quellen, Ausgaben und Prüfung

Gelieferte Stammbaumabschnitte und Militärstatistiken werden vollständig ausgeschlossen. Die Seiten betten ausschließlich vorhandene Familienakten per Iframe ein. Bestehende Graphen, Personen, Profile, Titel, Wappen und IDs bleiben unverändert. Verlinkte Angehörigenkarten verwenden reale Personen-IDs und ihre belegten Portraits. Bereits gespeicherte eigene Hausbios und bewusste Löschungen müssen bei Standardaktualisierungen erhalten bleiben.

Die gemeinsamen Quellen liegen pro Familie unter `Estryll/Aldrimar/Kronental/`. `haus.content.mjs` liefert Hausseite und Hausbio über die vorhandenen Adapter; aktuelle kanonische Metadaten und redigierte Kapitel werden gemeinsam gepflegt. Quellenarchive und Diagnosen gehören nicht in das statische Auslieferungspaket. Private Dossiers und geheime Inhalte sind keine Quellen dieses Auftrags.

Die Vorher-Sicherung und Belege liegen unter `diagnostics/kronental-clans-20261103/`: `baseline.json`, `registry-audit.json`, `attachments.json`, `attachment-mapping.json`, `initial-house-pages.json`, `original-images.json`, `original-images-verification.json` und `missing-originals.json`. Die beiden ursprünglichen Seitendateien liegen bytegleich unter `initial-house-pages/`. Die Bildübersichten `original-clan-figures.jpg` und `additional-crests.jpg` wurden angesehen; die 19 Originalhashes sind unabhängig geprüft.

**Prüfstatus: bestanden.** 105 Fach- und Regressionstests einschließlich der zehn gezielten Kronental-Prüfungen bestätigen alle 29 Bestandsgraphen und Profile, historische Einordnungen, aktuelle Führung und Erbfolge, Bilder, Iframes, Aliaslinks, Quellenarchive sowie den Erhalt eigener Bio-Bearbeitungen und bewusster Löschungen. Die abschließend betroffenen Hausseiten- und Galerietests wurden nach der sprachlichen Korrektur erneut bestanden. Hausseiten- und Galerie-Build sind mit den ausdrücklich ausgewählten 29 IDs und `--check` aktuell; die auftragsbezogene Whitespace-Prüfung ist bestanden.

Die gemeinsame Aufbereitung berücksichtigt das kanonische `family.extensions.extinctHouse` auch bei Familien in ihrem letzten Ortsordner. Historische reale Sitze wie Torrenheim bleiben erhalten; Kulturkategorien werden als Sitze ausgeschlossen. Zwei gezielte Unittests sichern diese Fälle, ohne Familienakten zu ändern.

Die Browserprüfung zeigt Vaerens bestehende interaktive Familienakte tatsächlich im Iframe und die neue Hausbio mit Sigurd als Oberhaupt. Beide Wellensänger-Originale sind auf der Hausseite sichtbar, der frühere Südstahl-Alias öffnet die ergänzte Seite, Frostzorn bleibt aktiv, Morchaon bürgerlich und Mac Mamhar historisch. Die helle Kontaktübersicht mit 30 Darstellungen für 29 Familien und die elf neuen Figuren wurden tatsächlich angesehen; Hashes, PNG-Maße und Transparenz sind geprüft. Kleine unveränderte Quellartefakte sind im Bildprüfbeleg dokumentiert; keine blockierenden Bildfehler.

Abschlussbelege unter `diagnostics/kronental-clans-20261103/`: `test-results.json`, `final-audit.json`, `image-verification.json`, `browser-verification.json`, `all-clan-figures.jpg`, `generated-images.json` und `image-prompts.json`.

Commit, Push und Deploy sind kein Bestandteil dieser lokalen Übernahme.
