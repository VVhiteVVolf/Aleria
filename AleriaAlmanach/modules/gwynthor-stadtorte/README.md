# Gwynthors wichtige Stadtorte

Sieben Ortsmodule mit 20 interaktiven Seiten auf der Ebene **Gwynthor-Stadt**.

- Osttor: Torbrücke, kleiner Vorort außerhalb der Mauern, innerer Brunnenplatz am Gestüt.
- Westtor: Torbrücke, kleiner Vorort, innerer Ankunftsplatz mit Brunnen und Wagenhof.
- Hafen: Westhafen, Zentraler Hafen, Südtor-Hafen im Südosten.
- Stadtzentrum: Plaza am großen Stadtpark, Parkwege, öffentlicher Brunnenplatz vor der Großen Kathedrale der Neun.
- Zur Altstadt gehören die Alte Kathedrale, der Festplatz auf den Burgfundamenten und ein kleiner Hain.
- Der Nordtorbezirk umfasst die Torbrücke mit den Cochllamwyr und den Vorort an der Landstraße.
- In der Gwynthorer Vorstadt liegen die offenen Gassen und der Wagenplatz der Gwyllach. Neben der Siedlung liegt die Zirkuswiese.

`stadtorte-scenes.mjs` sammelt die Inhalte und dauerhaften Szenenkennungen.
Die drei Ergänzungen vom 23. November stehen in `stadtorte-viertel.mjs`.
`stadtorte-module.mjs` bildet sie auf das vorhandene Szenenmodell ab.
Registrierung und Importpakete entstehen mit
`node AleriaAlmanach/scripts/build-gwynthor-stadtorte.mjs` (`--check` prüft lesend).
Kommentare, Figurenwahl, Szenenzeit und Ortswechsel gehören weiterhin den
bestehenden Controllern. Es gibt keine neue UI- oder Firebase-Implementierung.

Der große Stadtpark ist vom bestehenden vierteiligen Marktpark unterschieden.
Brunnenplatz und Kathedralinnenräume behalten getrennte Szenen. „Süttor-hafen“
aus dem Auftrag ist als „Südtor-Hafen“ mit der ausdrücklich genannten Lage im
Südosten übernommen. Bestehende Bezirksangaben, Kartenpins und Betriebe bleiben
unverändert; der neue Ankunftshof ist kein benannter Handelsbetrieb. Neue Namen,
Besitzer, Personalakten, Tarife oder Waren werden hier nicht festgelegt.

Der kleine Hain liegt zwischen Altstadthäusern. Auf dem Platz der Alten Burg
sind die niedrigen Fundamente Teil der heutigen Platzanlage. Die Geschichte
über Penrudd am Nordtor folgt dem Kartenprofil. Der Wagenplatz greift die
belegte Fuhrmannszunft der Gwyllach auf. Standplätze, Mitfahrten und Eintritt
können in den jeweiligen Szenen ausgehandelt werden.

Bildregie: wenige große Formen und ruhige Flächen, städtische Größe durch
Dachstaffeln und Maßstab. Stilquelle und vollständige tatsächlich verwendete
Prompts: `stadtorte-art.mjs` / `assets/gwynthor-stadtorte/image-prompts.json`.
Generatororiginale und Receipts bleiben im Quellenordner, aktive WebP-Bilder
unter `public/assets/gwynthor-stadtorte/`. Karte ist Geografiereferenz, Kyrwyn v3
ausschließlich Stilreferenz. Keine Porträtfigur in Szenen übernehmen.

Nutzerkorrektur während der Bildprüfung: Stadttore in jeder Ansicht vollständig
geschlossen, davor Cochllamwyr nach der vorhandenen Ausrüstungsreferenz.
Alle sechs Torbilder verwenden deshalb v2; die offenen v1-Bilder bleiben mit
ihren ursprünglichen Prompts im Quellenarchiv und sind keine aktiven Assets.
Das Parkbild verwendet ebenfalls v2: Der Hintergrund zeigt angrenzende
innerstädtische Häuser statt einer irreführenden Ansicht über Fluss und Außenmauer.
Die Szenen nutzen einen unteren Bildschwerpunkt (`center 65%` bis `center 75%`), damit Wachen und
Brunnen auch im mobilen Bildstreifen sichtbar bleiben. Der bestehende
Szenenrenderer übernimmt dafür die validierten Bildoptionen des allgemeinen
Seitenrenderers. Seiten ohne solche Angaben behalten ihre CSS-Voreinstellungen.

Die acht zusätzlichen Ansichten verwenden dasselbe 2:3-Format und dieselbe
WebP-Aufbereitung. Beide neuen Toransichten zeigen das geschlossene Tor und
die Cochllamwyr. Beim Burgplatz ist v2 aktiv. Das erste Bild und sein Prompt
liegen mit den anderen Originalen unter `assets/gwynthor-stadtorte/`.

Prüfung: `node --test AleriaAlmanach/tests/gwynthor-stadtorte.test.mjs` und
`node AleriaAlmanach/tests/gwynthor-stadtorte.browser.mjs`.
Belege zum ursprünglichen Umfang liegen in `diagnostics/gwynthor-stadtorte-20261112/`.
Die Browserprüfung der Erweiterung legt ihre Aufnahmen in
`diagnostics/gwynthor-stadtviertel-20261123/` ab.
