# Weisenfluh · temporärer Königreichsentwurf

Einstieg: `index.html`. Der Entwurf beschreibt die albische Herkunft als Bànneach,
den kulturellen Wandel und die heutige weisenfluhische Aristokratie nach der
Nutzervorgabe vom 25. Oktober 2026. Er verändert keine kanonischen Welt- oder
Familienregister und benötigt keine Firebase-Verbindung.

Die gelieferten Ordner bestimmen die Ausgangszuordnung von 31 Haus- und
Ordenswappen: Goldkranz als königliches Haus, vier Freiherrenhäuser, 18
Landmannsfamilien, sieben vorerst unzugeordnete albische Clans und die Ritter der
Kornähre. Fünf Provinzen einschließlich der königlichen Domäne Ewigensee, acht
benannte Landmannssitze und das gesondert verpachtete Ährensass bleiben getrennt.
Silbermundt, Weissklippe und Hohenklamm besitzen keine gelieferten Hauswappen;
ihre Zuordnung bleibt offen. Die Nutzerbezeichnung Wolfrieden wird angezeigt;
der abweichende Karten- und Ordnername Wolfenried bleibt nachvollziehbar.

`realm-data.mjs` besitzt die Gebietsdaten und adaptiert sie für die bereits von
Uathneach und Moinneach verwendete gemeinsame Kartenansicht. `source-houses.mjs`
enthält die aus den gelieferten Ordnern abgelesenen Häuser. Die Kartenkomponente
unter `../shared/` bleibt unverändert. `placement-controls.mjs` besitzt die
Drag-and-drop- und Karten-Zielinteraktionen. Die gleichwertige Haus- und
Ortsauswahl lässt sich mit Tastatur und Touch bedienen.

`proposal-state.mjs` kapselt Sitzänderungen, Rücknahme, Ausgangsstand sowie die
streng validierte Entwurfsdatei. Jede Haus-ID hat genau einen Sitz oder `null`.
Die Rollen, Provinzherkunft und Ausgangssitze bleiben unverändert. Persönliche
Verschiebungen liegen ausschließlich unter dem eigenen Browser-Schlüssel
`aleria:proposal:weisenfluh:placements:v1`; JSON-Export und Import sind möglich.
Es gibt keine automatische Übernahme in die kanonischen Register.

Seit dem 26. Oktober zeigen alle 31 Häuser und Clans einschließlich der Ritter
der Kornähre einen eigenen Ganzkörperentwurf. Weisenfluhs Ritter sind höfisch,
wohlhabend und ähnlich dekadent wie jene Goldmunds, treten aber weniger stolz
und kriegerisch auf. Der Bildstil folgt dem freigegebenen Hausritter vom
24. Oktober. Hauswappen, Palette und Thema bestimmen jeweils die Ausrüstung;
Helmform, Haltung und Rüstungsaufbau unterscheiden sich bewusst.

Die fünf Klassenvorschläge folgen der Nutzeranweisung: Landsprotektor, Kürisser,
Harlekin, Mariner und Landsjäger. Landsknechte sind ausgeschlossen. Die Anzeige
verwendet „Kürisser“ und „Mariner“, die vorhandenen Klassen-IDs und Sprungziele
bleiben `kurassier` und `landsmariner`. Diese Vorschläge verändern weder Hausrang
noch Sitz, Provinzherkunft oder kanonische Klassendaten. Albische Ritter tragen
Kilt und Plaid zu gepflegter ritterlicher Ausrüstung.

`house-details.mjs` adaptiert Weisenfluhs Hausdaten für die gemeinsam mit Goldmund
genutzte Darstellung in `../shared/house-detail-render.mjs` und `house-details.css`.
Die breite Ansicht zeigt Figur und Profil nebeneinander, die Mobilansicht
untereinander. Wappen und vollständige Figur besitzen getrennte Großansichten.
Jedes geöffnete Haus startet oben; Zuordnung und Fokusrückgabe bleiben beim
bestehenden Page-/Placement-System.

`warrior-art-direction.mjs` besitzt alle 31 Motive, Helmformen und vollständigen
Bildprompts. `node Vorschau/Weisenfluh/scripts/build-warrior-catalog.mjs` erstellt
den Laufzeitkatalog `warrior-data.mjs` sowie `assets/warriors/prompts.json`.
Alle Bilder wurden einzeln mit dem eingebauten `image_gen` erzeugt, nicht per
API-/CLI-Generierung. Die unveränderten Originale liegen unter
`assets/warriors/generated/`, die ausschließlich am Alphakanal bereinigten
PNG-Dateien unter `production/` (1024 × 1536), die WebP-Anzeigen unter `previews/`
(768 × 1152). Freistellung und Deckung sind ausdrücklich freigegeben; RGB bleibt
bytegleich, offene Zwischenräume bleiben transparent.

Die gemeinsame technische Pipeline liegt unter `../shared/warrior-artifacts/`.
`python -B Vorschau/Weisenfluh/scripts/prepare_warriors.py build` erstellt Artefakte;
`audit --expected-count 31` prüft Quellen, RGB, Alpha und Bildränder, `contact`
erstellt die QA-Übersicht. Das Manifest liegt in `assets/warriors/manifest.json`.
Fünf Kürisserentwürfe verwenden die vorhandenen Pferderassen Erlenglanz oder
Goldmähne; die Stil-/Rassereferenzen sind im Promptmanifest dokumentiert.

Alle 33 gelieferten PNG-Dateien liegen unverändert in `assets/originals/`.
`assets.source.json` dokumentiert ihre relativen Quellnamen, SHA-256-Werte und
Abmessungen. Separate WebP-Anzeigen verkleinern die übertragene Bildmenge; die
Originaldateien bleiben für Großansichten und spätere Übernahme erhalten.

Bànneachs historischer Wappenentwurf zeigt nach der ausdrücklichen Korrektur
einen **weißen Stier**. Er wurde mit dem eingebauten Imagegen-Werkzeug anhand
der tatsächlich angesehenen antiken Länderwappen Oseneach, Glanneach und
Muirneach erstellt. Motiv, vollständiger Prompt und Referenzen stehen in
`banneach-art.json`. Das unbearbeitete Generatorbild bleibt unter
`assets/originals/banneach-white-bull.png` erhalten. Die vorhandene gemeinsame
Alphakanal-Aufbereitung des Projekts stellt ausschließlich Deckung und
Freistellung her; das RGB-Motiv bleibt erhalten. `banneach-alpha-audit.json`
enthält den Prüfbeleg. Eine frühere Wind-Fassung wird nicht eingebunden.

Prüfung: `node --test --experimental-test-isolation=none Vorschau/tests/weisenfluh.test.mjs`.
Die vorhandene Netlify-Prüfgruppe für `Vorschau/` entdeckt diese Tests automatisch.

Die Gegenstandsprüfung vom 26. Oktober 2026 umfasst alle 51 Krieger Goldmunds
und Weisenfluhs. Bei Blumenthal wurde die verdrehte Schwertachse durch eine
senkrechte Ruhehaltung ersetzt. Frühere Fassungen und der verworfene erste
Korrekturlauf bleiben unter `assets/warriors/generated-archive/` erhalten;
`corrections.json` und das Promptmanifest dokumentieren die Eingriffe. Der
Prüfbeleg liegt unter `diagnostics/warrior-object-review-2026-10-26/review.json`.

Die anschließende Nutzerüberarbeitung betrifft ausschließlich Goldkranz,
Cnagallan, Blumenthal und Edelweiss: runder Lorbeer-Kronenhelm, vollständige
Laute mit natürlichem Griff, geschlossener Armet und geschlossener Einhornhelm
mit anatomisch getrenntem Pferdeschweif. Die bereits korrigierte gerade
Schwertführung Blumenthals bleibt erhalten. Vorfassungen und genaue Editprompts
sind archiviert; `diagnostics/weisenfluh-art-refinement-2026-10-26/review.json`
belegt vier geänderte und 47 bytegleich erhaltene Darstellungen beider Länder.
