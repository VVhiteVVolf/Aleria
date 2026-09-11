# Hausübersichten auf Grafschafts- und Herrschaftsseiten

Verbindliche Ergänzung vom 11. September 2026.

## Familien vollständig zuordnen

Vor dem Anlegen einer Herrschaftsseite die Familien im zugehörigen Stammbaumordner und dessen Unterordnern abgleichen. Der Abgleich dient der territorialen Zuordnung: Unterherrschaften werden **nicht als Gesamtliste auf der übergeordneten Seite zusammengeführt**.

Die obere Sektion zeigt die großen Häuser der betreffenden Verwaltungsebene, vom Grafen bis zum Ritterfürsten. Darunter stehen ausschließlich die örtlichen Ritter- und Bürgerhäuser. Jede untergeordnete Herrschaft führt ihr eigenes herrschendes Haus und ihre belegten Vasallen. Ausdrücklich gewünschte historische Häuser können zusätzlich auf der übergeordneten Seite erscheinen. Diese Regel gilt auch für alle künftigen Herrschaftsseiten.

Die Sektion **„Ausgestorbene Häuser“ steht nach den bestehenden Haussektionen**, also auch unterhalb der Ritter- und Bürgerhäuser. Sie nutzt dieselben Wappenkarten und zeigt Wappen, Hausname und bekannten ehemaligen Sitz. Als Datenkennung wird `variant: "extinct"` verwendet. Nicht belegte Sitznamen oder Lehnsherren werden nicht ergänzt.

Der Status „active“ in der Stammbaum-Registry bezeichnet eine verfügbare Akte. Er beweist nicht, dass das Haus in der Erzählung fortbesteht. Für die Einordnung die Hausbeschreibung, ausdrückliche Aussterbevermerke, Gründungsdaten und bestehende Quellen verwenden. Eine erloschene Nebenlinie macht nicht automatisch das gesamte Haus ausgestorben. Umgekehrt können Nachkommen durch Einheirat weiterleben, obwohl das ursprüngliche Haus erloschen ist.

## Direkte Hausseitenlinks

Wappen und Hausname öffnen eine vorhandene ausführliche Hausseite direkt. Dieses Ziel wird bereits in den Seitendaten gespeichert; es darf nicht ausschließlich von einer nachträglichen Browserumleitung abhängen. Bei einer alten HTML-Grundlage müssen außerdem die Tabellenlinks und die `href`-Werte im zugehörigen Inline-Export übereinstimmen. Dessen Bildkonfiguration kann zuvor gesetzte Links sonst wieder entfernen.

Liegt noch keine ausführliche Hausseite vor, verweist die Karte auf die vorhandene Familienakte. Im Stammbaum selbst bleibt das Hauswappen mit der kurzen Hausbio verbunden. Personenportraits behalten ihre Personen-/Stammbaumziele.

Nach Änderungen auch die Version der Grafschafts-/Herrschaftsdaten, des Inline-Exports und des einbindenden Registers aktualisieren. Die Bildnummern des alten Inline-Exports hängen von der Reihenfolge der Bilder ab: Beim Ergänzen statischer Bilder müssen alle betroffenen Zuordnungen erhalten oder ausdrücklich neu abgeglichen werden. Neue strukturierte Wappenkarten werden vom Export-Renderer als generierte Ansicht ausgelassen.

## Kompaktes Pergamentregister

Alle bestehenden und künftigen Haus- und Siedlungsübersichten verwenden die gemeinsamen Komponenten unter [modules/territory-directory](modules/territory-directory/README.md). Die alten Tabellen bleiben bei Altseiten als Inhalts- und Bearbeitungsgrundlage erhalten; ihre sichtbare Registeransicht stammt aus denselben Renderern wie die neuen Seitendaten.

- Links steht ein kleines Wappen oder Ortssymbol. Rechts folgen der Name und knapp gesetzte, ausdrücklich beschriftete Angaben: **Sitz**, **Lehnsherr**, **Rang** beziehungsweise **Einordnung** des Orts. Letztere bewahrt sowohl Ortsarten als auch überlieferte Zugehörigkeiten, etwa zu einem Orden. Keine unbeschrifteten dunkelbraunen/goldenen Namensbalken.
- Reguläre Hauseinträge sind mit den drei Angaben ungefähr 100 Pixel hoch, Ortseinträge mindestens 76 Pixel. Einträge innerhalb eines Hausregisters haben gleiche Höhe; längere Namen und Angaben dürfen vollständig umbrechen. Das Register nutzt drei, zwei oder eine Spalte passend zur Fensterbreite.
- Das herrschende Haus wird mit `featured: true` **zentriert auf einer eigenen Ebene über den anderen Häusern** dargestellt. `featuredLabel` benennt gegebenenfalls den Rang. In Celtigerns Wacht steht dort ausschließlich **Draig · Grafenhaus**, mit **Haus Pendrag** als Lehnsherr. Darunter stehen die sechs großen Häuser mit **Haus Draig** als Lehnsherr. Die unmittelbaren Bindungen der Ritter- und Bürgerhäuser werden dadurch nicht geändert: Tlawd dient weiterhin Gafyr.
- Fehlende Sitz- und Lehnsherrangaben werden ausgelassen. Ein unbelegter Rang wird ausdrücklich als „Offen“ gezeigt. Allgemeine Abschnittsbezeichnungen wie „Siedlung/Ort“ und „Nicht zugeteilt“ werden nicht als konkrete Ortsart ausgegeben.
- Wappen und Namen bleiben direkte Links; auch die übrige Fläche verlinkter Einträge ist anklickbar. Namen sind mit der Tastatur erreichbar und erhalten eine sichtbare Fokusmarkierung.
- Ruhiger heller Pergamentgrund, dünne Konturen und geringe Innenabstände. Vorhandene lokale Wappen, Herrschaftsbanner und Ortssymbole wiederverwenden. Unbekannte Inhalte nicht ergänzen, um eine Karte optisch zu füllen.

Die gemeinsame Darstellung ändert keine territoriale Auswahl. Vererbte Datentabellen, Inline-Export-Bildnummern und die kurze Hausbio im Stammbaum behalten ihre Aufgaben.

## Ränge aus den Hausakten

Ein ausdrücklich gesetztes `rank` im Hauseintrag hat Vorrang. Ansonsten wird `profile.rank` beziehungsweise `profile.highestTitle` aus der jeweiligen `haus.content.mjs` verwendet. Der vorhandene Hausseiten-Build erzeugt daraus `Familien Häuser und Clans/modules/house-content/house-ranks.generated.mjs`; diese Datei nicht von Hand pflegen. Auch neue Hausakten erscheinen nach dem Build automatisch in der Rangübersicht.

Die Anzeige benennt den Rang des Hauses: Graf → Grafenhaus, Baron → Baronenhaus, Ritterfürst → Ritterfürstenhaus, Ritterherr → Ritterherrenhaus, Bürgerlich → Bürgerliches Haus. Eigene belegte Rangbezeichnungen bleiben erhalten, etwa „Ard Tiarna (Fürst)“ bei Ui Talamh. Ein unbekannter Rang wird nicht aus einer allgemeinen Ritterhaus-Kategorie, dem Familiennamen oder der Position im Register abgeleitet.

Gelyn wird damit als **Ritterherrenhaus** angezeigt. Bei Ard Conbhrón und den örtlichen Einträgen ohne belegte Rangdaten bleibt die Angabe **Offen**. Der historische Status eines Hauses wird unabhängig vom Rang behandelt.

## Politikübersicht und Infobox

Politikübersicht und Infobox behalten ihre Position im Seitenaufbau. Der Rat steht weiterhin mittig am Beginn des Politikabschnitts; die Infobox bleibt rechts neben der Einführung und folgt auf schmalen Bildschirmen der vorhandenen Anordnung.

Die Politikübersicht zeigt Ämter, Portraits und Namen auf hellem Pergament. Der Herrscher bleibt zentriert, Ratsposten und nachgeordnete Amtsträger behalten ihre Reihenfolge. Alle Portraits nutzen gleich hohe Flächen mit vollständigem Bild und ohne Überlagerung der Namen. Bestehende Personen-/Familienlinks bleiben erreichbar. Unbekannte Portraits erhalten die vorhandene lokale Silhouette. Vollbreite Navigationszeilen, etwa das Ämter-Icon auf der Königreichsseite, bleiben eigenständige Links.

Die Infobox verwendet einen ruhigen Titelkopf, kleine Abschnittsüberschriften und feine horizontale Linien. Beschriftungen und Werte stehen in getrennten Spalten ohne dunkle Hintergründe. Kartengröße und Desktopbreite von 360 Pixeln bleiben erhalten. Alte Farb- und Schriftformatierungen werden beim Darstellen entfernt, ohne Text, Links oder Bildreihenfolge zu ändern.

Für Celtigerns Wacht wurden 16 externe Portraitquellen anhand ihrer exakten URL den bereits lokal archivierten Bildern zugeordnet. HTML-Grundlage und Inline-Export verwenden dieselben lokalen Ziele. Namen, Ämter und Sitze wurden dabei nicht inhaltlich umgedeutet.

Die erzeugte Ratsansicht wird mit `data-kontinente-generated-view` vom Inline-Export ausgeschlossen. Die ursprüngliche Politikstabelle bleibt als ausgeblendete Inhaltsquelle vorhanden. Inhaltsänderungen aktualisieren die Ansicht; Bildnummern und Tabellenkennungen dürfen dadurch nicht verschoben werden.

## Verwaltungsübersicht

Die acht Verwaltungsbereiche stehen als kompakte Pergamentkacheln in **einer einzigen Zeile**. Die Zeile nutzt bis zu 1120 Pixel Breite; bei weniger Platz scrollt nur diese Zeile horizontal. Kachelhöhen bleiben gleich, Symbole sind 54 Pixel groß. Die bisherigen Verwaltungsfenster und ihre territoriale Zuordnung bleiben erhalten.

Die Gestaltung gehört ausschließlich `modules/administration/administration.css`. Keine zusätzlichen Raster- oder Kartenüberschreibungen in `herrschaft.css` ergänzen. `administration-content.js` enthält die zentrale Zuordnung zu den vorhandenen lokalen Organisationsicons; alte Tabellen und strukturierte Seiten beziehen ihre sichtbaren Symbole daraus.

Die Grafschaftsvorlage enthält dafür bereits einen leeren Container mit `data-administration-grid`, aus dem die gemeinsame Komponente alle acht Bereiche aufbaut. Neue Herrschaften ohne eigene Verwaltungsinhalte öffnen weiterhin einen leeren Bereich und übernehmen keine Inhalte der Grafschaft.

Geprüft auf den acht Herrschaftsseiten und der Grafschaftsvorlage bei 1440, 1024, 768 und 390 Pixeln: eine Kachelreihe, gleiche Höhen, lokal geladene Icons, keine Verbreiterung der Seite, Erreichbarkeit der letzten Kachel per Tastatur sowie Öffnen und Schließen des Verwaltungsfensters mit Fokus-Rückkehr.

### Verwaltungsfenster

Auch die geöffneten Verwaltungsbereiche verwenden helles Pergament. Der kompakte Kopf mit Bereichsicon und Schließen-Knopf bleibt sichtbar; ausschließlich der Inhalt scrollt vertikal. Angaben stehen als beschriftete, schmale Zeilen in zwei Spalten, auf kleinen Bildschirmen in einer Spalte. Fehlende Werte und kurze, noch leere Textabschnitte erscheinen als „Folgt …“.

Die Amtsträger werden mit dem gemeinsamen Ratskarten-Renderer dargestellt: Portrait links, Amt und Name rechts. Einzelne Leitungsposten bleiben zentriert auf ihrer Ebene. Benannte Ämter ohne bekannte Amtsträger bleiben mit Silhouetten sichtbar. Gruppen ohne benannte Personen und ohne konkrete Rollen sind aufklappbar, ihre Einträge bleiben erhalten. Aufgabenbeschreibungen stehen weiterhin in aufklappbaren Tabellen mit genau einem Öffnungspfeil. Vorheriger und nächster Bereich werden beim Namen genannt.

Zuständigkeiten: `administration-dialog.js` verwaltet das Fenster, Navigation und das Laden der richtigen Herrschaft. `administration-renderer.mjs` bereinigt den Altcode und erstellt Angaben und Abschnitte; `administration-hierarchy.mjs` liest die Portraitzeilen für den gemeinsamen Ratskarten-Renderer. `administration-dialog.css` enthält ausschließlich Fensterstyles und eng begrenzte Kartenanpassungen. Die äußere Kachelzeile bleibt in `administration.css`.

Die bestehenden 16 Quelldokumente bleiben die Inhaltsquellen. Inhaltliche Nutzerkorrekturen an der Marschallhierarchie, den Ritterfürsten und den Portraits sind in [PERSONAL-KORREKTUREN.md](modules/administration/PERSONAL-KORREKTUREN.md) festgehalten. Archivierte Portraits werden anhand identischer Quell-URLs lokal verknüpft; Fragezeichenbilder und leere Portraits verwenden die vorhandene Silhouette. Für noch externe Portraits ohne lokale Zuordnung greift bei Ladefehlern ebenfalls die Silhouette. Namen, Geschlechter, Ämter und Unterstellungen werden daraus nicht abgeleitet. Fünf Bildquellen haben derzeit keine eindeutige Zuordnung zu einer lebenden Stammbaumperson; siehe `modules/administration/README.md`.

Prüfung: `tests/administration-dialog.browser.mjs` gleicht sämtliche 316 Personen-/Platzhalterkarten der 16 Ansichten mit den Quelldokumenten ab, prüft alle Namen, Bilder und die Darstellung bei 1440, 768 und 390 Pixeln. Navigation, Fokus-Rückkehr und unveränderte Darstellung nicht erkannter Tabellenformen werden ebenfalls geprüft. Die territoriale Abgrenzung bleibt durch `tests/administration-scope.test.mjs` gesichert.

## Abgleich für Celtigerns Wacht

| Ausgestorbenes Haus | Ehemaliger Sitz / Zuordnung | Beleg und Ziel |
| --- | --- | --- |
| Illysywen | Castellbryn, Rhonwens Tränen | Erloschene männliche Linie 1720; ausführliche Hausseite vorhanden. |
| Ard Conbhrón | Lycath; antike Crannath Clans | Auf ausdrücklichen Nutzerwunsch in dieser historischen Gruppe. Die Akte nennt noch lebende Angehörige und bleibt unverändert. |
| Ui Talamh | Antike Crannath Clans; genauer Hauptsitz ungeklärt | Familie besteht laut eigener Akte nicht mehr eigenständig; letzte Nachkommen in andere Häuser eingeheiratet. Hausseite aus dem Altcode und kurze Bio vorhanden. |

Morveth und Skellor erscheinen unter **Ausgestorbene Häuser auf Rhonwens Tränen**. Illysywen bleibt sowohl dort als auch in der ausdrücklich gewünschten historischen Gruppe der Grafschaft sichtbar. Ard Conbhróns Einordnung in diese Anzeige bedeutet nicht, dass seine überlebenden Angehörigen aus dem Stammbaum entfernt oder als verstorben markiert werden.

Alle **77 angelegten Hausseiten und Bios bleiben erhalten**. Auf der Grafschaft erscheinen **37 Karten**: sieben große Häuser, 14 örtliche Ritterhäuser, 13 örtliche Bürgerhäuser und drei historische Häuser. Die übrigen Häuser stehen auf ihren eigenen Herrschaftsseiten. Von Hochreuth wird wegen der ungeklärten Zuordnung Goldmund / Haus Roden nicht länger als örtliches Haus angezeigt; seine Hausseite bleibt verfügbar.

| Herrschaft | Hausübersicht |
| --- | --- |
| Gwendolyns Ufer | Gwyvern, 15 Ritterhäuser und zwei Bürgerhäuser |
| Artus Streben | Gwefrydd, zehn Ritterhäuser und vier Bürgerhäuser |
| Rhonwens Tränen | Arwydd, fünf Ritterhäuser sowie Illysywen, Morveth und Skellor |
| Gafyr | Gafyr, Tlawd und Gostyn |
| Saethwyr | Saethwyr, Chwedonol und Eneiniog |
| Wyrm | Wyrm, Rhyddid, Cludwyr, Loer, Argall sowie die bereits benannten örtlichen Familien ohne Akte |
| Camruisge | Garrael und die bereits vorhandene Salach-Karte |

Die kleine Vorlage `kleinehaeuser.html?haus=…` ist eine vollständige Hausseite und darf nicht mit der kurzen Stammbaum-Bio verwechselt werden. Quellenabgleich und offene Fragen stehen in [GWENDOLYNS-UFER-HAUSSEITEN.md](../Familien%20H%C3%A4user%20und%20Clans/GWENDOLYNS-UFER-HAUSSEITEN.md) und im vorherigen [Ritterhäuser-Protokoll](../Familien%20H%C3%A4user%20und%20Clans/RITTERHAEUSER-UND-VORBEREITUNG.md).

Maßgebliche Quellen: `Stammbäume/assets/js/data/families.registry.js`, `house-illysywen-family.js`, `house-ui-talamh-family.js`, `house-ard-conbhron-family.js`, `rhonwens-traenen-house-families.js` und `celtigerns-wacht-house-profiles.js`.

## Prüfung vor Abschluss

- Reihenfolge, territoriale Zuordnung und Vollständigkeit anhand der Familienakten kontrollieren; keine ungewollten Hauslisten aus Unterherrschaften auf der Grafschaft.
- Alle Wappen lokal laden und ihre tatsächlichen Klickziele öffnen.
- Direkte Hausseitenlinks auch bei nicht verfügbarem zusätzlichen Hausseitenregister prüfen.
- Bei vorhandenem Inline-Export nach dessen Anwendung prüfen, damit keine Links zurückgesetzt werden.
- Bestehende Personenlinks und Häuser ohne eigene ausführliche Hausseite weiterhin erreichen können.
- Die eigene Ebene des herrschenden Hauses, beschriftete Angaben, gleiche Kartenhöhen und die Darstellung bei 1440, 768 und 390 Pixeln prüfen.

Das Register sowie Politik- und Infobereich wurden auf allen acht bestehenden Seiten im Bereich Celtigerns Wacht bei diesen drei Breiten geprüft: lokale Bilder, Hausränge, direkte Hausseitenlinks, Tastaturfokus, die alleinstehende Grafenebene, Infoboxposition und vollständige Portraits oberhalb der Namen. Die alte Grafschaftsvorlage und der Ämter-Link auf der Königreichsseite wurden ebenfalls geprüft. Automatisierte Prüfungen liegen in `tests/territory-directory.browser.mjs`, `tests/territory-ranks.test.mjs`, `tests/house-territory-scope.test.mjs` und `tests/celtigerns-wacht-families.test.mjs`.

Die Prüfungen des jeweils letzten Ausbauschritts sind im zugehörigen Hausseiten-Protokoll dokumentiert. Frühere Gesamtzahlen der Grafschaft gelten nach einer Änderung ihrer territorialen Auswahl nicht weiter.
