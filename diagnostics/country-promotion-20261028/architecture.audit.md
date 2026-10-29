# Architekturprüfung zur Länderübernahme · 28. Oktober 2026

Leseprüfung für Moinneach, Aldingen, Goldmund, Weisenfluh, Iathneach,
Deitheach (historisch) und Triarchie (besetztes Lothir). Keine produktiven
Dateien geändert; keine privaten Dossiers gelesen oder exportiert.

## Verbindliche Wiederverwendung

Gelesen: `AGENTS.md`, `Kontinente/AGENTS.md`,
`Kontinente/HERRSCHAFTSSEITEN-VORGEHEN.md`,
`Familien Häuser und Clans/HAUSSEITEN-VORGEHEN.md`, `NEUES-HAUS.md`
und `Orte/NEUER-ORT.md` sowie die ausführbaren Uathneach-Module.

Die vorhandene Aufteilung eignet sich auch für die sieben Länder:

1. Ein geprüfter territorialer Quellkatalog besitzt Namen, stabile Kennungen,
   Elterngebiete, Sitze, unmittelbare Lehnsherren, Kultur und Zeitbezug.
2. Ein kleines territoriales Katalogmodul adaptiert ihn für Karten,
   Herrschaftsseiten, Familienprofile und Registerordner.
3. Die gemeinsamen Komponenten `Kontinente/modules/territory-page/`,
   `Kontinente/modules/territory-directory/`,
   `Kontinente/modules/administration/` und die bestehenden Haus-/Ortsshells
   bleiben zuständig für Darstellung und Verhalten.
4. Hausinhalte werden einmal als `HOUSE_CONTENT` gepflegt und mit dem
   bestehenden Build in Hausseite und Stammbaum-Hausbio ausgegeben.

Kein neues Komplett-HTML pro Haus, kein eigener Kartenrenderer, keine neue
Firebase-Schreibstrecke und keine automatische Übernahme von Browserentwürfen.

## Vorhandener Integrationsvertrag

### Territorien und Herrschaftsseiten

Ausführbare Referenzen:

- `Stammbäume/assets/js/data/uathneach-territories.source.json`
- `Stammbäume/assets/js/data/uathneach-territorial-catalog.js`
- `Kontinente/modules/uathneach/page-source.mjs`
- `Kontinente/modules/uathneach/territory-page.mjs`
- `Kontinente/scripts/build-uathneach.mjs`
- `Kontinente/scripts/territory-region-build.mjs`

`createTerritoryPageCatalog(pages, context)` benötigt `territoriesById`,
`placesById`, `countyPath` und optional `map`/`sharedCouncilGroups`.
`createTerritoryData()` erwartet je Seite mindestens die Arrays `families`,
`councilGroups`, `domains`, `vassalGroups`, dazu `copy`, `infobox`, `hierarchy`.
Unmittelbare Unterseiten stehen in `territoryLinks`. `domainReferences` ist
optional und muss ein tatsächlich bestehendes eigenes Ortsregister auflösen.

Minimaler Datensatz:

```js
{
  id: 'land-gebiet', title: 'Gebietsname', shortTitle: 'Gebietsname',
  type: 'Herrschaft', kicker: 'Herrschaft · Hausname',
  parentHref: '/Kontinente/.../Elterngebiet.html', parentLabel: 'Elterngebiet',
  hierarchy: [{type:'Sammlung',name:'Kontinente',slug:'kontinente'},
    {type:'Kontinent',name:'Lothir',slug:'lothir'}, /* fachliche Ebenen */],
  map: {title:'Karte', imageSrc:'...', imageAlt:'...', href:'...'},
  crestSrc: '...', crestAlt: '...',
  copy: {overview:[],history:[],culture:[],economy:[],defense:[],geography:[]},
  infobox: [], families: [], councilGroups: [], vassalGroups: [],
  domains: [{territoryId:'land-gebiet',title:'Gebietsname',sections:[
    {title:'Siedlungen',placeIds:['land-ort']}
  ]}], territoryLinks: []
}
```

Der Regionbuild liest derzeit `modules/<slug>/pages.source.json` und
`Karten/<mapFolder>/territories.import.json`. Er benötigt je Seiten-ID ein
Territorium mit `href`, erzeugt daraus eine dünne HTML-Shell,
`herrschaft.data.mjs` (nur bei Typ Jarltum `jarltum.data.mjs`) und den eigenen
abgegrenzten Block `BEGIN <SLUG>_GENERATED` in `kontinente.registry.js`.
Er nimmt keinen Kontinent automatisch an; `territory.href` und `hierarchy`
bestimmen die tatsächliche Lage.

Die Seitendaten dürfen nur die Häuser und Orte ihrer eigenen Ebene anzeigen.
Das herrschende Haus verwendet `featured:true`; lokale Vasallen folgen darunter.
Historische Häuser dürfen nicht allein wegen `status:'active'` als fortbestehend
gelten. Dieser Registry-Status bedeutet lediglich, dass eine Akte verfügbar ist.

### Zwei zentrale Linkfallen

`Kontinente/assets/js/herrschaft-data.js` ignoriert derzeit `options.href` in
`family()`. Ein Hauseintrag muss `housePage:'kleinehaeuser.html'` beziehungsweise
`'haus.html'` setzen, oder die gemeinsame Funktion muss ausdrücklich `href`
erhalten. Nur `href` wie in Uathneachs Quelle zu setzen führt zunächst zum
Stammbaum und verlässt sich auf die spätere Browserumleitung. Das erfüllt die
Regel der direkten Hausseitenziele nicht vollständig.

`Karten/modules/territory-places/place-catalog.mjs` überträgt momentan keinen
`href` von Marker/Beschreibung in `createPlaceRegister()`. Für echte Ortsseiten
muss dieser kleine Adapter das ausdrückliche Ziel erhalten. Der gemeinsame
Siedlungsrenderer unterstützt `place.href` bereits.

### Karten und Orte

Uathneachs `Karten/Uathneach/places.mjs` erzeugt Marker aus den kanonischen
Siedlungen. Quellenpunkte liegen in Prozent ab links oben. Der Adapter wandelt
sie für `createReviewedPins()` in Pixel ab links unten um; der fertige Pin liegt
wieder normalisiert ab links oben. Diese Pipeline erhalten und Koordinaten nicht
ein zweites Mal invertieren.

`residentFamilyIds` ist eine ausdrückliche Liste, auch für mehrere Häuser in
derselben Stadt. `[]` bedeutet ausdrücklich keine aktuelle Zuordnung. In
`Karten/modules/households/household-model.mjs` hat diese Angabe Vorrang vor
Namens-/Sitzabgleich. Eine territoriale Oberherrschaft bedeutet nicht, dass ihr
Herrscher an jedem Ort wohnt.

```js
{
  id:'ort', name:'Ort', point:[26.5,25],
  territoryId:'land-gebiet', mapRegionId:'land-kartenregion',
  residentFamilyIds:['haus-a','haus-b']
}
```

`Karten/tools/build-uathneach.mjs` ist die Referenz für
`territories.import.json`, `markers.source.json`, `data.json` samt
`generatedStateHash`, festen Revisionen und Registryblock. Er überprüft sämtliche
verwendeten Bilddateien und die SHA-256 der gelieferten Kartenbilder.
`writeGeneratedMap()`/`updateGeneratedMapRegistry()` aus
`Karten/tools/generated-map-output.mjs` weiterverwenden.

Eine Karte ohne Bild hat noch keine sichtbare Platzhalterdarstellung:
`herrschaft-page.js` rendert Infoboxkarte und Kartenpanel nur bei
`map.imageSrc`. Falls ausdrücklich leere vorbereitete Karten verlangt sind,
eine gemeinsame optionale Leermeldung in diesem Renderer ergänzen; keine
fehlenden Bild-URLs oder pro Land kopierte Dummybilder verwenden.

Uathneach besitzt 18 Karten-/Registerorte, aber keine entsprechenden Einträge
in `Orte/orte.registry.js`. Wenn sämtliche Orte einzeln bearbeitbar werden
sollen, sind zusätzliche Ortsdatensätze nötig:

```js
{
 id:'land-ort', slug:'land-ort', name:'Ort', status:'draft', type:'kleinstadt',
 data:'Lothir/Land/Gebiet/Ort/ort.data.js?v=<release>',
 hierarchy:[/* belegte Hierarchie */], tags:['orte','land','ort']
}
```

Die bestehende Shell ist `/Orte/grossstadt.html?id=land-ort`; der Loader liest
`window.ORT_DATA` aus klassischem JS, noch keine ES-Module. Orts-ID und
`meta.storage.document` stabil halten. Der Registrytyp kann die tatsächliche
Ortsart enthalten, obwohl die gemeinsame Shell `grossstadt.html` heißt.
Vorhandene kompakte Quellenadapter unter `Orte/data/` sind sinnvoller als
Kopien der vollständigen Großstadtdaten mit unpassenden Cenyr-Inhalten.

### Stammbaum-Familien, Profile und Ordner

`createBlankHouseFamily()` aus `blank-house-family-factory.js` ist für noch
personenlose Akten geeignet. Es erfindet weder Gründer noch Ehen. Die alternative
Gründerpaar-/Zeitsprung-Fabrik nur bei einem ausdrücklichen Auftrag benutzen.

`createHouseProfileFromFolderPath()` normalisiert `rankId`, `seat`, `barony`,
`county`, `kingdom`, `secondarySeats`, direkte Lehnsherren, `folderIcons` und
`regionEmblems`. Ein fremdes `cultureId` im Profil wird verworfen; Kultur
gehört in die territoriale Quelle bzw. eigene `extensions` und in
`HOUSE_CONTENT.profile.people`. Keine Klassenausbildung aus `classCulture`
oder einem Kriegerbild ableiten.

Wichtig: Pfade bis vier Ebenen werden in `kingdom/county/barony/seat`
abgebildet; längere Pfade behalten zusätzlich ein ausdrückliches `folderPath`.
Leere Icons bleiben positionsgebunden erhalten und dürfen nicht herausgefiltert
werden. Die erste Profilpfadebene ist fachlich das Land, nicht der Kontinent.

Neue Länderfamilien in eigenen `<land>-house-families.js` bündeln und einmal in
`families.registry.js` über `familyRecord()` aufnehmen. Der Registryrand ergänzt
Hausbio-Defaults, bestehende Upgradeadapter, Pfad, Hierarchie und Zusatzansichten.
Leere Gebiete/Orte ohne Familien können über `FAMILY_REGISTRY_FOLDERS` in
`family-registry-folders.js` sichtbar werden. Diese Einträge unterstützen
`path`, `icon`, `description`, `searchTerms`, `plannedHouses`.

### Unterstützte Rangkennungen

Bereits vorhanden: `royal`, `ducal`, `county`, `barony`, `knight-prince`,
`knight`, `knight-simple`, `commoner`, `ri-tiarna`, `ard-tiarna`,
`mor-tiarna`, `dun-tiarna`, `laird`, `sept-lord`, `sept-head` sowie nordische
und venalysische Ränge.

Nicht vorhanden: `prince`, `king`, `baron`, `landmann`, `freiherr`, `junker`,
`ministerialer`. Solche Vorschaukennungen niemals ungeprüft ins Profil kopieren;
`getHouseRank()` normalisiert sie sonst zu `unknown`. Bereits vorhandene
semantische Entsprechungen bewusst abbilden. Eigenständige ausdrücklich
gewünschte Ränge wie Freiherr/Junker/Ministerialer zentral in
`Stammbäume/assets/js/domain/house-profile.js` ergänzen, einschließlich
angemessener Reihenfolge und ggf. vorhandener Iconzuordnung. Hauskarten und
Hausseite sollen trotzdem die belegten kulturellen Rangnamen anzeigen.

`Karten/modules/households/household-model.mjs` besitzt eine eigene Rangfolge;
neue Kennungen dort einordnen oder gezielt auf die gemeinsame Rangordnung
umstellen. Unbekannte Kennungen rutschen derzeit ans Ende.

### Bestehende Familien erhalten

Ein Laufzeitimport der aktuellen Registry fand in diesen sieben Ländern genau:

| ID | Aktueller Pfad | Personen | Quellrevision nach Bio-Defaults |
| --- | --- | ---: | ---: |
| `haus-von-hochreuth` | Goldmund / Unsortierte Häuser | 27 | 4 |
| `haus-weinlaub` | Weisenfluh / Region Ewigensee / Ewigensee | 9 | 1 |
| `haus-sonnenfels` | Weisenfluh / Burg Sonnenfels | 25 | 1 |

`haus-roden` ist im Hochreuth-Graphen als benanntes Haus erwähnt, hat derzeit
aber keine eigenständige Registryakte. Die neue Akte darf denselben stabilen
Familienbezug verwenden, ohne Hochreuths Personen zu duplizieren. Hochreuths
alte Burg ist nach Goldmunds Vorschau ausdrücklich nicht auf der gelieferten
Karte verortet. Weinlaub und Sonnenfels nicht mit Vorschauhäusern Sonnenfeld
oder ähnlichen Namen zusammenlegen.

Für reine Umordnungen `sourceRevision` gezielt erhöhen,
`registryManagedHouseProfileFields` und möglichst feldbezogene
`registryManagedHouseProfileFieldRevisions` setzen. Die Schutzgrenze
`registryManagedEntitySourceRevision` erhält bereits übernommene Personen.
Keine genealogischen Arrays durch leere Akten ersetzen. Lokale Zusatzpersonen,
Beziehungen, Tombstones und bearbeitete Bios bleiben erhalten.

### Hausseiten, Bios und Galerie

`Familien Häuser und Clans/modules/house-content/house-content-outputs.mjs`
ist der gemeinsame reine Adapter. Pro Haus ein schmales
`haus.content.mjs`, das an den fachlichen Länderadapter delegiert, ist bereits
Uathneachs Muster. Benötigt werden u.a. `profile`, `sections`, `images`,
`biographySummary`, `heads`, `heirs`, `offices`, `allies`, `cadets`, `figures`,
`trivia`; unbekannte Listen bleiben leer.

Für Registrierung: `registerPage:true`, `page:'kleinehaeuser.html'` oder
`'haus.html'`, stabile `id`, `contentVersion` und bewusste
`biographySourceRevision`. `prepared:true` dokumentiert unvollständige Lore.
`omitMilitaryProfile:true` verhindert, dass ein Figurenentwurf als belegte
Truppenstärke erscheint. Das Bild kann unter `warriorGallery.entries` erscheinen,
mit Beschreibung der dargestellten Kleidung und Bewaffnung.

Pfadkonvention: `content.images.*` und Galerieeinträge sind relativ zum
Featurestamm `Familien Häuser und Clans/`, z.B.
`../Vorschau/Aldingen/assets/warriors/production/klingen.png` oder
`../Stammbäume/assets/images/references/haus-klingen/krieger.png`.
Rohe absolute `/...`-Pfade werden vom aktuellen `biographyImage()` falsch
vorangestellt. Entweder die bestehende relative Konvention einhalten oder die
gemeinsame Pfadnormalisierung korrekt erweitern.

Der Hausbuild entdeckt derzeit **nur `Estryll/`**. Der Auftrag betrifft auch
Lothir und Deitheach auf Aldervan. Unterstützte Kontinentwurzeln bewusst
ergänzen; keine falschen Estryll-Hierarchien nur wegen des bisherigen Builds
erzeugen. Bereits veröffentlichte Hochreuth-URLs unter Estryll erhalten.

Der Build erzeugt `haus.data.js`, `haus.biography.mjs`,
`house-biographies.registry.js`, `house-ranks.generated.mjs` und den generierten
Hausseitenregisterbereich. Generierte Dateien nicht einzeln pflegen.
`withHouseBiographyDefault()` und `house-biography-default-upgrade.js` erhalten
individuell bearbeitete oder ausdrücklich entfernte Bios. Neue Standardbios
nicht als zwangsverwaltetes Graphfeld markieren.

Die globale Kriegergalerie liest kanonische Familien aus `FAMILY_REGISTRY`
sowie `HOUSE_CONTENT.images.scene`/`warriorGallery.entries` und
`references/<haus-id>/krieger.png`. Sie dedupliziert nach SHA-256 und führt
Quellenbelege weiter. Deshalb zuerst Familien und Hausinhalte registrieren,
danach `Gallerien/krieger/scripts/build-catalog.mjs` ausführen. Neue Bilder
benötigen keine zweite manuelle globale Hausliste. Den `catalog.json?v=...`-
Verweis in `Gallerien/krieger/warrior-gallery.mjs` beim Release aktualisieren.

## Zeit, Besatzung und Kontinente

Die Vorschau belegt Aldingen ausdrücklich auf **Lothir**. Deitheach liegt
ausdrücklich auf **Aldervan**. Triarchies aktueller Auftrag umfasst ausschließlich
besetztes Lothir, nicht ihre gesamten Besitzungen. Diese Seiten dürfen die
Uathneach-Konstante Estryll nicht übernehmen. Bestehende Verbindungen im Schild
von Ailith sind eine Konföderationsnavigation und ändern den Kontinent nicht.

Vorbild für historische und aktuelle Ordnung:
`faelaorn-current-control.js`, `faelaorn-house-profiles.js` und
`faelaorn-registry-folders.js`. Sie trennen alte Lehensbindungen,
gegenwärtige Kontrolle und Zusatzansichten mit `role:'asylum'` bzw. `'origin'`.
Besatzung ist kein Beleg freiwilliger Vasallität.

Mac Farraigeach: heutiger Sitz Sgeir Tearmainn im freien Iathneach; Cuansioda
bleibt ehemaliger Herkunftssitz. Kein zweites heute besitzendes Haus aus dieser
historischen Angabe erzeugen. Deitheach: historische Ansiedlung und Rang vor
der Eroberung bezeichnen; heutiges Clanschicksal ausdrücklich offen lassen.
Unterwerfung setzt `extinct` nicht automatisch auf wahr.

`loadHouseholdSources()` versteht bisher nur `content.extinct` und bestimmte
Formulierungen im Sitztext für `dispossessed`. Ein neues
`extensions.currentControl` wird von der Kartenbewohnerlogik nicht automatisch
ausgewertet. Historische/residenzlose Fälle müssen daher ausdrücklich über
Bewohnerlisten und ggf. einen kleinen gemeinsamen Statusadapter geregelt werden.

## Navigation und bestehende Kennungen

`Kontinente/modules/alben/principalities.source.json` besitzt derzeit:
`iathneach`/`fuerstentum-iathneach`,
`deitheach`/`fuerstentum-deitheach`,
**`moinneachs`/`fuerstentum-moinneachs`** (alte Pluralform).
Diese Kennungen berücksichtigen bzw. als Aliase erhalten. `principalityHref()`
schlägt `pageId` in `KONTINENTE_REGISTRY` nach. Nach Ergänzung des Katalogs
`build-alben.mjs` erzeugen; erforderliche direkte Atlaslinks in ihren tatsächlichen
Kontinentübersichten zusätzlich pflegen. Deitheach nicht mehr als derzeit
unbesetztes unabhängiges Fürstentum ausgeben.

Moinneachs Vorschauzahl ist besonders wichtig:
`original`, `number:1` = **zehn Stadtgebiete**;
`alternative-1`, `number:2` = drei Sumpfmarken;
`alternative-2`, `number:3` = fünf Sumpflande.
Eine Freigabe von „Variante 1“ nicht mit der ID `alternative-1` verwechseln.
Alle elf ursprünglichen Clans haben zunächst `rank:null`, `liege:null`.
Gemeinsame Stadt, Farbe oder großes Gebiet beweisen keine Lehnskette.

## Minimaler Datei-/Änderungsplan

1. Pro Land die ausdrücklich akzeptierten Vorschauwerte in einem eigenen
   geprüften Quellkatalog festhalten; keine Browser-LocalStorage-Entwürfe lesen.
2. Kleine `<land>-territorial-catalog.js`, `<land>-house-families.js` und bei
   Bedarf `<land>-registry-folders.js` erstellen. Neue Rangkennungen zentral
   ergänzen. Bestehende drei Familien gezielt umordnen, nicht ersetzen.
3. Kartenbilder/Markerquellen lokal referenzieren; Karte und Landeskatalog
   nutzen dieselben IDs. Pro Land eigener dünner Kartenbuild auf den bestehenden
   Ausgabefunktionen, oder eine klar gekapselte gemeinsame Parameterfunktion.
4. Je Land `page-source.mjs`, `territory-page.mjs`, dünner Buildwrapper und
   generierte Seitendaten/Registryblock. Kartendaten zuerst erzeugen, weil der
   Seitenbuild `territories.import.json` liest.
5. Falls echte Ortsseiten Teil der Übernahme sind: eigener fachlicher
   Ortsdatenadapter + pro Ort schlanke `ort.data.js` und generierter eigener
   Registryblock; gemeinsame Shell behalten. Explizite Ortslinks im
   `createPlaceRegister()` erhalten.
6. Je Land eigener Hausinhaltsadapter mit schmalen fachlichen Hausmodulen;
   Hausbuild um die benötigten Kontinentwurzeln erweitern und ausführen.
7. Familien-/Ordnerregister, Schild-von-Ailith-Quelle und Kontinentnavigation
   verbinden. Haushaltssnapshot und globale Kriegergalerie neu erzeugen.
8. Gemeinsame Link-/Kartenplatzhalterlücken gezielt beheben; keine neuen
   Inline-Handler, kein großflächiger Refactor.

## Befehle und sinnvolle Prüfung

In dieser Shell ist Node nicht auf PATH, aber vorhanden unter
`C:\Program Files\nodejs\node.exe`. Befehle nachfolgend in Kurzform; lokal ggf.
`& 'C:\Program Files\nodejs\node.exe' ...` verwenden.

```powershell
# Referenzreihenfolge, neue Länderbuilds entsprechend ergänzen:
node Karten/tools/build-<land>.mjs
node Kontinente/scripts/build-<land>.mjs
node "Familien Häuser und Clans/scripts/build-house-content.mjs"
node Kontinente/scripts/build-alben.mjs
node Karten/tools/build-households.mjs
node Gallerien/krieger/scripts/build-catalog.mjs

# Driftprüfungen nach denselben Builds:
node Karten/tools/build-<land>.mjs --check
node Kontinente/scripts/build-<land>.mjs --check
node "Familien Häuser und Clans/scripts/build-house-content.mjs" --check
node Kontinente/scripts/build-alben.mjs --check
node Karten/tools/build-households.mjs --check
node Gallerien/krieger/scripts/build-catalog.mjs --check

node --test Kontinente/tests/territory-ranks.test.mjs
node --test Kontinente/tests/house-territory-scope.test.mjs
node --test Kontinente/tests/uathneach.test.mjs
node --test Gallerien/krieger/tests/gallery-catalog.test.mjs
node --test Stammbäume/tests/uathneach-warriors.test.js
node Stammbäume/tests/run-tests.js
```

Für die neue Übernahme ein fachliches Integrationstestmodul mit echten
Vertragsprüfungen ergänzen: eindeutige IDs, Elternzyklen, jede Siedlung genau
einmal, alle Familien-/Seitenziele vorhanden, alle verwendeten Bilder vorhanden,
keine erfundenen Personen, aktuelle und historische Bindungen getrennt,
Hochreuth/Weinlaub/Sonnenfels-Graphen unverändert. Bestehende versiegelte
Fachbaselines nicht pauschal neu schreiben.

Browserprüfung bei 1440, 768 und 390 Pixeln: eigene Ebene des Herrscherhauses,
beschriftete Ränge und Sitze, echte direkte Haus-/Ortsziele, Karte oder
Leermeldung, erreichbare Untergebiete, Hausseite und Hausbio samt Rücklink,
Kriegerzuordnung, eine unveränderte Altseite und Konsole/fehlende Bilder.

## Nachtrag: vollständiger Vertrag für reguläre Ortsseiten

Nach dem ausdrücklichen Zusatzauftrag sollen alle benannten Hauptsiedlungen
eigene reguläre Ortsseiten erhalten. Die bestehende Anwendung besitzt nur
`grossstadt.html` für Siedlungen und `zunft.html` für einzelne Einrichtungen.
Es gibt keine gesonderte Burg-/Kleinstadt-Shell. `grossstadt.html` ist bereits
für Bauernsiedlungen, Bergbausiedlungen, Burgen und Städte datengetrieben
einsetzbar; die Ortsart kommt aus `meta.type` und dem Registrytyp.

### Wichtig: zwei unterschiedliche Datenformate

`Orte/data/grossstadt-vorlage.data.js` ist eine ältere beschreibende
Vorlagenfassung (`sections` als Array, `images.main/crest/map`, `infobox`).
Diese Form ist **nicht** der aktuelle Bindungsvertrag der statischen Shell.
Die neuen Ortsdatensätze sollen das aktuelle Schema benutzen, das
`js/world-content/celtigerns-wacht-places.js:createPlaceData()` ausgibt und
`orte-grossstadt.js`, `orte-place-content.js` und die Featuremodule konsumieren.

`createPlaceData()` ist bisher eng an den Cenyr-Katalog gebunden: Es findet
nur dort registrierte IDs und setzt Cenyr/Celtigerns Wacht als Standard.
Neue Länder deshalb nicht in diesen Katalog hineinpassen. Ein reiner neuer
Buildzeitadapter kann dasselbe Schema aus dem territorialen Quellkatalog
erzeugen, ohne Runtime-Globale oder eine neue Darstellung einzuführen.

Empfohlene Ownership:

```text
Orte/modules/country-preparation/place-data.mjs    # reiner Datenadapter
Orte/scripts/build-country-places.mjs             # Ausgabe + eigener Registryblock
Orte/Lothir/<Land>/<Gebiet>/<Ort>/ort.data.js       # erzeugtes klassisches JS
Orte/Aldervan/Deitheach/<Gebiet>/<Ort>/ort.data.js  # historisch eingeordnet
```

Der bestehende Loader unterstützt nur klassische Skripte und sendet das
`aleria:orte:data-ready`-Event bei `script.onload`. Ein dynamischer Import im
`ort.data.js` würde dieses Event zu früh auslösen. Deshalb synchron
`window.ORT_DATA = <generiertes JSON>;` ausgeben. Dasselbe Script lädt die
eigenständige Militäransicht; sie benötigt deshalb ebenfalls synchrones JSON.
Keine eigenen Orts-HTML-Kopien notwendig.

### Vollständiger vorbereiteter Datensatz

```js
window.ORT_DATA = {
  meta: {id:'aldingen-ort',title:'Ort – Aleria',type:'Burg',
    status:'Draft',template:'grossstadt'},
  name:'Ort',
  canonicalPath:'Lothir / Aldingen / Gebiet / Ort',
  hierarchy:[/* dieselbe belegte Hierarchie wie im Ortsregister */],
  parentage:{kingdom:'Aldingen',county:'Grafschaft',domain:'Herrschaft',
    region:'Gebiet',settlement:'Ort',liege:'Haus Beispiel'},
  navigation:{parentHref:'/Kontinente/.../Gebiet.html',parentLabel:'Gebiet'},
  features:{districts:false,noticeBoard:true,militaryView:true,
    personalitiesCollapsed:true},
  presentation:{motto:'',mottoSource:'',map:'',images:{
    'icon-png':{src:'/vorhandenes/wappen.webp',alt:'Belegtes Wappen von …'},
    'wappen-banner-png':{src:'/vorhandenes/gebietsschild.webp',
      alt:'Gebietsschild von …',href:'/Kontinente/.../Gebiet.html',fit:'contain'},
    'karten-bild-png':{src:'/vorhandene/karte.webp',
      alt:'Lagekarte von Ort und Umgebung',href:'/Karten/karte.html?map=aldingen',
      fit:'contain'},
    'regionen-karte-png':{src:'/vorhandene/karte.webp',
      alt:'Gebietskarte',href:'/Karten/karte.html?map=aldingen',fit:'contain'}
  }},
  structure:{
    land:'Aldingen',provinz:'Grafschaft',region:'Gebiet',region2:'Burg',name:'Ort',
    'vorherrschender adel':'Haus Beispiel',regierungstyp:'Offen',gewerbe:'Offen',
    herrschaft:'Herrschaft',lehnsherr:'Haus Beispiel','bekannte familien':'Haus Beispiel',
    'stände':'Offen',einwohnerzahl:'Offen',ritter:'Offen',waffenknechte:'Offen',
    ortswache:'Offen',flotte:'Offen','sonstiges aufgebot':'Offen',
    bedrohungen:'Offen',ressourcen:'Offen'
  },
  sections:{
    introduction:['Belegte knappe Einordnung von Ort, Ortsart und Land.'],
    background:['Noch nicht ausgearbeitet.'],
    location:['Belegte Lage oder ausdrücklich noch offene Beschreibung.'],
    administration:['Noch nicht ausgearbeitet.'],
    conflicts:['Noch nicht ausgearbeitet.'],
    history:['Noch nicht ausgearbeitet.'],
    houses:[],population:['Noch nicht ausgearbeitet.'],
    newspaper:['Für diesen Ort ist noch keine Zeitung eingerichtet.'],
    region:['Die Karte zeigt das zugeordnete Gebiet; weitere Orte und POI sind offen.'],
    culture:['Kulturelle Einordnung nach der belegten Landesquelle.'],
    districts:[],builtEnvironment:['Noch nicht ausgearbeitet.'],
    military:['Aufgebot und Besatzung sind noch nicht ausgearbeitet.'],
    economy:['Örtliche Betriebe und Etablissements sind noch nicht ausgearbeitet.'],
    trivia:[]
  },
  houses:[{title:'Örtliche Häuser',items:[{
    familyId:'haus-beispiel',name:'Haus Beispiel',rank:'Belegter Hausrang',
    seat:'Ort',liege:'Unmittelbarer Lehnsherr oder leer',
    emblem:'/vorhandenes/hauswappen.webp',
    href:'/Familien Häuser und Clans/kleinehaeuser.html?haus=haus-beispiel'
  }]}],
  merchants:[],personalities:[]
};
```

Das Beispiel zeigt Form und Leerstellen, keine zusätzlichen Loreannahmen.
Bekannte örtliche Fakten gezielt einsetzen; Einwohner, Garnisonen, Regierung,
Wirtschaft und Personen nicht aus der Ortsart ableiten. Der Einleitungstext
kann das bestätigte Land/Region/Ortsart/Sitzverhältnis nennen. Historische
Orte erhalten ausdrücklich historische Formulierungen und ggf. eine kurze
Besatzungseinordnung, ohne aktuelle Loyalitäten zu erfinden.

`sections` ist ein **Objekt mit englischen Schlüsseln**, dessen Werte Arrays
aus Strings oder Blöcken sind. Unterstützt: `{type:'subheading',text:'…'}`,
`{type:'list',items:[…]}` und die vorhandenen optionalen Flavor-Szenen.
Leere Abschnitte rendern bislang nicht neu und lassen die statischen `...`
stehen. Für neutrale vollständige Vorbereitungen bekannte Absätze und
bewusste Leermeldungen verwenden, insbesondere `region`, weil die Shell dort
sonst pauschal vom „Umland der Stadt“ spricht.

`structure` verwendet normalisierte **deutsche Tabellenbeschriftungen**.
Eine leere Zeichenfolge überschreibt vorhandene Shellwerte nicht. Für
unbekannte übergeordnete Regionen ausdrücklich „Offen“ liefern oder die
gemeinsamen Cenyr-Fallbacks gezielt entfernen; sonst fällt
`orte-grossstadt.js` bei leerem `parentage.county` auf Celtigerns Wacht zurück.
Die doppelte Regionszeile wird intern als `region` und `region2` behandelt.
`region2` trägt sinnvoll die tatsächliche Ortsart.

### Bilder und leere Featurebereiche

`presentation.images` ist der entscheidende Bildvertrag. Die alten Felder
`images.main/crest/map` allein werden von `orte-place-media.js` nicht gebunden.
Jeder Schlüssel akzeptiert einen String oder `{src,alt,href,fit}`.
Unterstützte Slots:

| Schlüssel | Rolle |
| --- | --- |
| `icon-png` | Hauptzeichen im Seitenkopf |
| `supporter-left-png`, `supporter-right-png` | nur tatsächlich belegte Wappenhalter |
| `wappen-banner-png` | übergeordnetes Gebiets-/Herrschaftszeichen |
| `karten-bild-png` | Ortsbild oder Karte neben der Einleitung |
| `regionen-karte-png` | Gebietskarte in der Umlandsektion |
| `stadtsektionen-png` | nur vorhandene Bezirkskarte |
| `bild-einer-stadtwache-png` | nur tatsächlich vorhandene Wachdarstellung |
| `zeitung-png` | nur vorhandenes Zeitungsblatt |

Fehlende Slots weglassen; keine Dummydateien behaupten. Ein Hauswappen als
Hauptzeichen braucht einen ehrlichen Alttext; ein Gebietsschild ist kein neu
belegtes Stadtwappen. Die vorhandene Landeskarte darf die Lage veranschaulichen,
muss aber als Landes-/Lagekarte bezeichnet werden und darf keine erfundene
eigenständige Stadtkarte vortäuschen.

`regionMap:{mapId,title,embedHref,fullHref,pois:[]}` kann eine vorhandene
registrierte Gebietskarte interaktiv einbetten. Ohne eigenen Bannkreis
denselben bekannten Landkartenbezug ausdrücklich benennen oder nur das
statische Kartenbild verwenden. Es müssen dafür keine erfundenen lokalen
Map-IDs erzeugt werden.

`merchants:[]` zeigt bereits die korrekte Leermeldung „Für diesen Ort sind
noch keine Händler oder Etablissements eingetragen.“ Kein Zunftdatensatz und
keine Wirtschaftsperson nötig. `personalities:[]` entfernt die vielen
statischen Beispielpersonen. Optional können die belegten generischen
Amtsgruppen mit `items:[]` vorbereitet werden; das legt keine Personen an.
`houses:[]` blendet die leere Hausregisterzeile aus. Nichtörtliche Vasallen
nicht nur zur Füllung in diese Liste übernehmen.

`noticeBoard:true` ohne `noticeBoardMap` ergibt die bereits vorhandene,
ortsspezifisch benannte „Anzeigetafel in Vorbereitung“. Militärzugang kann
aktiv bleiben: Ohne `militaryView`-Profil zeigt
`/Orte/militaer.html?id=<id>` eine ortsspezifische leere Aufstellung, ohne
Truppenzahlen zu erfinden. Keine Firebase-Schreibvorgänge werden dabei
ausgelöst.

Die gemeinsame statische Shell enthält noch externe Tumblr-Beispielportraits.
`personalities:[]` entfernt sie nach dem Datenladen, verhindert aber nicht
unbedingt ihre ersten Netzwerkanfragen. Falls ausschließlich lokale Bilder
und fehlerfreie Netzwerkanfragen gefordert sind, diese generischen
Platzhalter in Shell und `_template/GrosseStadtTemplate.html` gezielt durch
vorhandene lokale Silhouetten bzw. leere Bildslots ersetzen. Das ist eine
gemeinsame Vorlagenkorrektur, keine pro Land zu duplizierende Bearbeitung.

### Registry, Bearbeitung und Prüfungen

Registrybeispiel wie oben, ergänzt bei Bedarf:

```js
{
 id:'aldingen-ort',slug:'aldingen-ort',name:'Ort',status:'draft',type:'burg',
 data:'Lothir/Aldingen/Gebiet/Ort/ort.data.js?v=country-promotion-20261028',
 inlineCollection:'orte_inline_content',sceneCollection:'orte_scenes',
 hierarchy:[/* fachlicher Pfad */],tags:['orte','burg','aldingen']
}
```

`orte-loader.js` setzt den Bearbeitungsdokumentnamen aus `entry.docId || entry.id`
und liefert ihn als `window.ORTE_CONFIG.docId`. Ein zusätzliches
`meta.storage.document` ist im aktuellen Ortsadapter **nicht erforderlich**.
Stabile IDs und unveränderte bestehende `docId`s erhalten. Eine sinnvolle
neue ID ist `<land>-<ort>`, damit gleichnamige Siedlungen verschiedener Länder
nicht kollidieren und keine Cenyr-Namensfallbacks getroffen werden.

Ein allgemeiner Ortsgenerator ist bislang nicht vorhanden. Der neue
Buildwrapper kann reinen Datenadapter + eigenen abgegrenzten
`orte.registry.js`-Block besitzen und wie die anderen Generatoren `--check`
unterstützen. Die Registry nicht aus den sieben Ländern vollständig neu
aufbauen, sondern alle bestehenden Orte erhalten.

Geeignete Prüfungen:

```powershell
node --test Orte/tests/*.test.mjs
node Orte/tests/place-layout.browser.mjs
```

Der Browsercheck erwartet Port 5500 oder `ORTE_TEST_ORIGIN`; vorhandene
Playwright-Konfiguration siehe `Orte/modules/layout/README.md`. Ein gezielter
neuer Datenvertragstest sollte jede neue Registrydaten-Datei mit `node:vm`
laden (ohne Cenyr-Katalog), `meta.id`/Registry-ID vergleichen, alle Bildziele
auf Existenz prüfen, keine fremden Standardtexte/Personen enthalten lassen,
Ortsart/Leermeldungen kontrollieren und bestehende Ortsregistereinträge
unverändert nachweisen. Neue Stadt und neue Burg zusätzlich breit/schmal im
Browser prüfen; Militär- und Anzeigetafelplatzhalter mitöffnen.

## Nachprüfung der tatsächlich angesehenen Karten

Am 28. Oktober 2026 tatsächlich angesehen:
`Vorschau/Iathneach/assets/map-full.webp` (Regionen),
`Vorschau/Iathneach/assets/map-normal.webp` und
`Vorschau/Moinneach/assets/map.webp` (ursprüngliche Aufteilung).

Iathneach zeigt vier große Räume mit jeweils zwei benannten Hauptsiedlungen:

| Raum aus der Vorbereitung | Sichtbare Orte | Belegbare Rangentscheidung |
| --- | --- | --- |
| Fürstliche Domäne Sgeire | Botharin, Sgeir Tearmainn | Fürstenfamilie und Farraigeachs Exilsitz folgen den Textquellen; nicht allein der Karte. |
| Beann, ockerfarben | Ailtean, Mharaich | Kein ausdrücklich markierter Mor-Hauptsitz. |
| Allt, türkis | Tirnafaoi, Sidheanna | Kein ausdrücklich markierter Mor-Hauptsitz. |
| Coille, blau | Fiontarach, Famhair | Kein ausdrücklich markierter Mor-Hauptsitz. |

Beide Iathneach-Karten besitzen keine Ranglegende, Clanwappen an den Orten,
Herrschernamen oder Kennzeichnung „Mor Tiarna“/„Dún Tiarna“/„Laird“.
Die Miniaturen unterscheiden befestigte Anlagen und verschieden gestaltete
Städte, tragen aber keine belegte Rangsemantik. In keinem der drei freien
Regionenpaare ist daher belastbar zu bestimmen, welcher Ort der Mor-Sitz und
welcher ein Dún-/Laird-Sitz wäre. Eine Zuteilung allein nach Größe, Farbe,
Schlossform oder Leserichtung wäre eine neue Setzung. Der Platzhalter
„Sitzraum“ in den Vorbereitungsdaten ist entsprechend zutreffend.

Moinneachs Originalkarte zeigt zehn einzeln rot umgrenzte Flächen mit jeweils
einem Hauptort: Tarvex, Druanax, Drunemax, Amabactoix (Kartenbeschriftung
„Ambactiox“), Vironax, Arvonax, Taranux, Senodex, Camulax und Gergonax.
Sie zeigt keine übergeordneten Mor-Großregionen. Cethrenn und Barrex sind beide
textlich Tarvex zugeordnet. Die jetzt vorgesehene Einordnung Cethrenn als
Ard Tiarna, Barrex als Laird und die neun übrigen Herrschaftsführer als Lairds
ist eine vom aktuellen Auftrag autorisierte strukturelle Ableitung. Diese
Quellart ausdrücklich vermerken; die Karte selbst schreibt die Ränge nicht
aus. Keine nachträgliche Dreier- oder Fünfergliederung aus den alternativen
Karten in die akzeptierte ursprüngliche Zehneraufteilung übernehmen.

Neue gesonderte Freigabe während dieser Nachprüfung: Haus Sonnenfels darf
passend in der südlichen Weisenfluher Provinz Weißlauf unter Weißmann auf
Burg Sonnenfels zugeordnet werden. Das ist eine aktuelle Nutzerentscheidung
und kein vorher vorhandener Kartenbeleg. Die bestehende Familien-ID und alle
25 Personen bleiben erhalten.

## Nachprüfung vorhandener Hausdarstellungen: Sonnenfels und Weinlaub

Ergebnis: **Für beide Häuser fehlt eine kanonisch zugeordnete Hauskrieger-
oder Hausillustration.** Der aktuelle globale Galeriekatalog führt
`haus-sonnenfels` und `haus-weinlaub` als registrierte Häuser mit jeweils
`illustrationIds:[]`. Es gibt auch keine Illustration mit einer dieser
`houseIds` und keine entsprechende Zuordnung in Auswahl/zusätzlichen Bildern
oder der lokalen Quellenprüfung der Galerie.

Gefundene, ausdrücklich andersartige Bestände:

- Sonnenfels: Wappen unter
  `Stammbäume/assets/images/houses/Weisenfluh/haus-sonnenfels.png`.
  `AleriaAlmanach/modules/lachende-nixe/nixe-family-people.mjs` ordnet
  einzelnen Personen die Bilder unter
  `AleriaAlmanach/assets/lachende-nixe/portraits/` und
  `references/` zu. Auch gerüstete Oberkörperdarstellungen dort sind
  **Personenportraits**, keine stellvertretenden Hauskrieger.
- Weinlaub: Wappen unter
  `Stammbäume/assets/images/houses/Weisenfluh/haus-weinlaub.png`,
  Gideon-/Miryam-Portraits unter
  `Stammbäume/assets/images/portraits/haus-weinlaub/` und die
  freigestellten Weinflaschen unter
  `AleriaAlmanach/assets/lachende-nixe/drinks/weinlaub-1734.png` bzw.
  `weinlaub-1728.png`. Die Flaschen sind Warenbilder.
- Die neue Vorschau-/Übernahmedarstellung `sonnenfeld` gehört zum anderen
  Haus Sonnenfeld und darf nicht Sonnenfels zugeteilt werden.

Diese Bilder nicht umdeuten, um fehlende Hauskrieger optisch aufzufüllen.
Hausseite/Bio können ihre vorhandene Leerdarstellung verwenden; die Galerie
muss die fehlende Illustration weiter korrekt ausweisen.

Zum Vergleich führt auch `haus-von-hochreuth` aktuell
`illustrationIds:[]`. Seine vorhandene Quelle und Familienakte erhalten;
keinen neuen Goldmunder Kartensitz durch diese Prüfung behaupten.
