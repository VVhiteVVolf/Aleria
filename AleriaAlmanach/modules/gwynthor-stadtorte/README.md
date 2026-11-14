# Gwynthors wichtige Stadtorte

Vier POI-Module auf der vorhandenen Ebene **Gwynthor-Stadt**, jeweils genau drei
interaktive Seiten. Keine neuen Bezirke oder Navigationsunterkategorien.

- Osttor: Torbrücke, kleiner Vorort außerhalb der Mauern, innerer Brunnenplatz am Gestüt.
- Westtor: Torbrücke, kleiner Vorort, innerer Ankunftsplatz mit Brunnen und Wagenhof.
- Hafen: Westhafen, Zentraler Hafen, Südtor-Hafen im Südosten.
- Stadtzentrum: Plaza am großen Stadtpark, Parkwege, öffentlicher Brunnenplatz vor der Großen Kathedrale der Neun.

`stadtorte-scenes.mjs` verantwortet Inhalte und dauerhafte Szenenkennungen;
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

Prüfung: `node --test AleriaAlmanach/tests/gwynthor-stadtorte.test.mjs` und
`node AleriaAlmanach/tests/gwynthor-stadtorte.browser.mjs`.
Auftragsbelege: `diagnostics/gwynthor-stadtorte-20261112/`.
