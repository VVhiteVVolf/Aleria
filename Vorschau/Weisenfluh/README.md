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
