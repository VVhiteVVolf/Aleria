# Personenebene

Die gemeinsame Kartenseite lädt `people-overlay.mjs`. Ohne
`KARTO_CONFIG.peopleLayer.groups` erzeugt das Feature keine Oberfläche.
Die expliziten Gruppen enthalten jeweils `pinId` und `members` mit stabiler
Figurenkennung, Name, Rolle, Porträtpfad und Figurenlink. Die Karte lädt dafür
keinen ganzen Figurenbestand und keinen Stammbaum.

`people-model.mjs` verbindet ausschließlich diese Zuordnungen mit vorhandenen
Pins. Fehlende/geheime Pins und der aktive Kategorienfilter werden beachtet.
Die Darstellung verwendet `../place-roster/`, denselben Besitzer für Linien,
Platzierung und Ortslisten wie die vorhandene Wappenanzeige.

Der Schalter **Personen** steht hinter den Rasterebenen und bleibt davon
unabhängig. Sein Zustand ist eine persönliche Browseransicht je Karte.
Im Bearbeitungsmodus ist die Ebene verborgen. Der Tirfelyn-Adapter liefert
neun Haushalte mit 28 lebenden Menschen; die Hoftiere sind eigene Tierakten
im Almanach und werden nicht als Personen eingeordnet.
