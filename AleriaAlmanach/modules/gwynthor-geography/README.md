# Gwynthor: Bannkreis und Stadt

Die Nutzerfestlegung vom 19. Oktober 2026 gilt unter **Völker & Kulturen**:

```text
Cenyr
└─ Celtigerns Wacht
   └─ Llamreis Ankunft
      └─ Bannkreis Gwynthor
         ├─ Owains Anwesen & Gestüt
         ├─ Zum Roten Tor
         └─ Gwynthor-Stadt
            ├─ städtische Ortsmodule und Burgen
            ├─ Die Klingende Münze - Gwynthor
            └─ Der Markt der Fortuna - Gwynthor
```

`gwynthor-section-layout.mjs` ist die gemeinsame reine Klassifikationslogik.
Die bisher unterhalb der Stadt liegende Bannkreis-Gruppe wird darüber angeordnet;
der frühere Stadtknoten heißt anschließend Gwynthor-Stadt. Bestehende Knoten-IDs
werden behalten und über ihre Eltern neu verknüpft. Eine Umstellung erzeugt
keine Elternzyklen; Einträge, Kommentar-Threadschlüssel, Szenendaten, Overrides
und ausgeblendete Module werden nicht umgeschrieben. Ein gemischter alter
Abschnitt kann in Stadtorte und Owains Bestand aufgeteilt werden.

Die Modulablage wendet dieselbe Projektion auf geladene Custom-Daten und auf
die mitgelieferten Ortsabschnitte an. Alte Quelldateien legen dadurch keinen
zweiten Gwynthor-Ordner an. Export und Abschnittsverwaltung sehen die tatsächlichen
neuen Pfade. Die Migration selbst führt keine Backend-Schreibzugriffe aus;
der unveränderte lokale Rohstand und seine Synchronisationsquittung bleiben
erhalten. Ein späterer bewusster Speichervorgang übernimmt den aktuellen Baum.

Vorhandene offizielle Bilder aus `IconOrdner/Länder und Häuser Icons/Haus Draig`
kennzeichnen Königreich, Grafschaft, Baronie und Stadt. Das bestehende ländliche
Kartenzeichen mit Mühle und Häusern kennzeichnet den Bannkreis; Gestüt und
Gasthof haben eigene bestehende Kartenzeichen. Die Icons wurden angesehen;
zusätzliche Bildgenerierung war nicht nötig. Unterbereiche der Gilden behalten
ihre eigenen Embleme.

Der Bereich Zum Roten Tor enthält seit dem 20.10.2026 das vollständige
Gasthofmodul mit zwölf Seiten. Die ursprüngliche Ortsquelle ist der
Eintrag „Gasthof - Zum Roten Tor“ unter
`Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/data.json`:
Ursprünglich Familie Penry, seit der ausdrücklichen Umbenennung vom 19.10.2026
die eigenständige Familie Penrudd, unmittelbar vor dem Nordtor, einfache bis
mittlere Preislage, Gastzimmer und Platz für Pferde/Wagen. Die neue Familie und
der zugeordnete Lieferhof stehen unter `../rotes-tor/`; die vorhandenen
Penry-Identitäten aus Talgarth bleiben davon unberührt.
Die geografische Migration selbst erzeugt keine Bewohner oder Angebote;
das Gasthofmodul verwendet die vorhandene Familie und Hauskarte.

```powershell
node AleriaAlmanach/scripts/build-gwynthor-geography.mjs
node AleriaAlmanach/scripts/build-gwynthor-geography.mjs --check
node --test --experimental-test-isolation=none AleriaAlmanach/tests/gwynthor-geography.test.mjs AleriaAlmanach/tests/module-store-revision.test.mjs
node AleriaAlmanach/tests/gwynthor-navigation.browser.mjs
```

Die Navigationsoptimierung gehört separat zum Feature `archive`. Sie hält nur
den Datenstand der eingebundenen Verzeichnisansicht und verwirft ihn bei einer
Moduländerung; es gibt keinen zweiten persistenten Inhalts- oder Firebase-Cache.
