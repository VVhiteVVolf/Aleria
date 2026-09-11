# Gemeinsames Häuser- und Siedlungsregister

Die sichtbare Darstellung gehört diesem Modul. Bestehende Tabellenparser und strukturierte Herrschaftsdaten liefern normalisierte Einträge an dieselben Renderer. Das verhindert unterschiedliche Layouts zwischen Altseiten, neuen Herrschaften und Vorlagen.

## Zuständigkeiten

- `house-directory.mjs`: Haussektion mit Titel, Anzahl, eigener zentrierter Ebene für hervorgehobene Häuser und Raster für weitere Häuser.
- `settlement-directory.mjs`: Herrschaftskopf, Zentrum und Ortsregister mit expliziten Angaben.
- `directory-elements.mjs`: kleine gemeinsame DOM-Bausteine für Namen, Links und Definitionslisten. Ausschließlich lokale Verwendung innerhalb dieses Features.
- `directory.css`: vollständige Styles für diese Register und ihre Kartenansicht der Gebietskarte; eingebunden durch `assets/css/koenigreich.css`.
- `house-rank.mjs`: Beschriftung belegter Rangangaben; ein unbekannter Rang bleibt „Offen“.
- `council-directory.mjs` und `council.css`: gemeinsame Portraitübersicht für den Rat und seine Amtsträger, einschließlich vorhandener Navigationszeilen.
- `legacy-council.mjs`: liest alte Politikstabellen und aktualisiert deren erzeugte Ansicht mit einem Observer je Tabelle. Quelle und Bildreihenfolge bleiben erhalten.
- `infobox.mjs` und `infobox.css`: klassifizieren bestehende Infoboxzellen, entfernen deren alte visuelle Inline-Formatierung und gestalten die Tabelle an ihrer bisherigen Position.

`assets/js/koenigreich.js` behält die Verantwortung für Hausseiten-Auflösung, Quellenzuordnung und Aktualisierung nach Inhaltsänderungen. Es steuert auch den gekapselten Adapter für alte Ratsübersichten. `assets/js/herrschaft-page.js` übergibt strukturierte Siedlungs- und Ratsdaten und meldet nach dem Aufbau der Seite `aleria:kontinente:content-ready`. Die reinen Renderer besitzen weder Registerzugriffe noch globalen Zustand, Observer oder eigene Firebase-Zugriffe.

Die bestehenden `kingdom-family-*`, `kingdom-domain-*` und `kingdom-place-*` Klassen bleiben für die Unterscheidung zwischen erzeugter Ansicht und bearbeitbarer Quelle erhalten. Der Hausregister-Container erhält zusätzlich `territory-directory`; Siedlungssektionen bringen diese Klasse selbst mit. Alte Inline-Exporte dürfen weiterhin ausschließlich ihre ursprünglichen Quellen und Bildnummern bearbeiten.

## Datenübergabe

`renderFamilySection(section, { resolveHref })` erwartet `title`, optional `variant` und `cards`. Ein Haus enthält `id`, `name`, ein bereits erzeugtes Bild-DOM-Element als `image`, `seat`, `liege`, `rank` und `href`. `resolveHref(card)` bleibt optional und erlaubt dem Adapter, ein vorhandenes Hausseitenregister zu nutzen. Der Seitenadapter ergänzt einen nicht gesetzten Rang aus der vom Hausseiten-Build erzeugten `house-ranks.generated.mjs`.

`featured: true` hebt das Haus auf eine eigene zentrierte Ebene. `featuredLabel` ergänzt den Rang, zum Beispiel „Grafenhaus“. Beide Angaben gehören in die jeweiligen Seitendaten; der Renderer enthält keine Sonderbehandlung für bestimmte Familien. Die unmittelbaren Lehnsherren werden ausdrücklich in den Daten angegeben und nicht aus der visuellen Position abgeleitet.

`renderSettlementDomain(domain)` erwartet `title`, `href`, `crest` (DOM), `center`, `centerHref`, `centerImage` und `places`. Orte enthalten `name`, `type`, `image` (DOM) und `href`; Gruppentrenner enthalten `kind: "separator"` und `title`. `type` wird als „Einordnung“ beschriftet, weil bestehende Quellen dort sowohl Ortsarten als auch Zugehörigkeiten zu einem Orden nennen. Optionales `typeLabel` ermöglicht eine ausdrücklich belegte andere Beschriftung. Allgemeine Sammelbezeichnungen werden ausgelassen. Fehlende Werte bleiben leer, solange keine belegten Inhalte vorliegen.

Beide Renderer geben ein neues DOM-Element zurück und fügen es nicht selbst in das Dokument ein. Alle Textwerte werden über `textContent` eingesetzt. Die übergebenen Bildknoten müssen neue Elemente oder Klone sein, damit die bearbeitbare Quelle unverändert bleibt.

`renderCouncilGroups(groups)` erwartet Gruppen mit `title` und `members`. Mitglieder enthalten `office`, `name`, `image` (neuer DOM-Knoten), `href` sowie optional `featured`, `seat` und `note`. Gruppen können außerdem `links` mit `label`, `href` und `image` enthalten. Die erzeugte Ansicht erhält `data-kontinente-generated-view`; `kontinente-content.js` überspringt sie bei der Zuordnung gespeicherter Tabellen, Texte und Bilder.

## Prüfung

Die beiden Datenprüfungen lassen sich ohne zusätzliche Abhängigkeiten ausführen:

```powershell
node Kontinente/tests/celtigerns-wacht-families.test.mjs
node Kontinente/tests/house-territory-scope.test.mjs
node Kontinente/tests/territory-ranks.test.mjs
```

Der Browsertest benötigt einen lokalen statischen Server und ein vorhandenes Playwright:

```powershell
node Kontinente/tests/territory-directory.browser.mjs
```

Optionale Umgebungsvariablen: `DIRECTORY_TEST_ORIGIN` (standardmäßig `http://127.0.0.1:5500`), `PLAYWRIGHT_MODULE` (Paketname oder Modul-Datei-URL), `PLAYWRIGHT_EXECUTABLE` (vorhandener Chromium-Pfad) und `DIRECTORY_SCREENSHOTS` (Ausgabeordner). Der Test prüft acht Herrschaftsseiten in drei Fensterbreiten, lokale Registerbilder, gleiche Kartenhöhen, die Grafenebene, direkte Links, Tastaturfokus und die alte Grafschaftsvorlage. Externe Ressourcen werden dafür nicht benötigt.
