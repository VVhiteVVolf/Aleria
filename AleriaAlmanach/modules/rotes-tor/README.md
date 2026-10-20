# Zum Roten Tor – Gasthof, Familie und Lieferhof

Das vollständige Gasthofmodul ist seit dem 20. Oktober 2026 angelegt und im
Almanach unter **Cenyr → Celtigerns Wacht → Llamreis Ankunft → Bannkreis
Gwynthor → Zum Roten Tor** eingebunden. Es verwendet die bestehende Familie,
deren 24 Porträts, das Wappen und die auf 14 Gerichte und zwölf Getränke erweiterte Karte.
Fünf neue Ortsbilder ergänzen den Bestand. Der eigenständige Hof bleibt ein
Karteneintrag und Lieferant; ein separates Hofmodul wurde nicht erstellt.

Der aktuelle Auftrag erlaubt den Push, untersagt jedoch das Deployment.
Der Release-Commit erhält deshalb `[skip netlify]`. Keine Online-Module,
Charaktere, Bestände oder Szenen werden über Firebase geschrieben.

## Die zwölf Seiten

1. Der Gasthof unmittelbar vor dem Nordtor.
2. Carwyns Betreiberbiografie mit Eigenschaften, Beziehungen und Familienlink.
3. Haus Penrudd, die Torgeschichte und die beiden Haushalte.
4. Sechs Personalreiter: Führung, Schank/Empfang, Küche, Herberge, Stall/Waren, Sicherheit.
5. Die vorhandene Hauskarte im Gütertemplate, mit freigestellten Item-Icons.
6. Sechs bepreiste Dienste für Kammer, Pferd, Wagen, Gepäck und Wäsche.
7. Ein leeres Gästeverzeichnis mit zwölf Eintragsfeldern, ohne erfundene Gäste.
8.–11. Schankstube, Küche/Vorrat, Gastkammern und Wagenhof/Stall als interaktive Szenen.
12. Die veränderbare Betriebskalkulation als letzte Seite.

Der Betrieb hat 36 Schankplätze, zwei Einzel- und vier Doppelkammern mit
insgesamt zehn Betten, zehn Gastpferdeplätze und vier Wagenplätze. Dies sind
ergänzende redaktionelle Kapazitäten, keine aus der Karte abgeleiteten Maße.
Eine Einzelkammer kostet 2,5 KT, eine ganze Doppelkammer 3,5 KT, ein versorgtes
Gastpferd 1,5 KT und ein Wagenplatz 40 Pfennig je Nacht. Frühstück wird gesondert
bestellt. Gepäck kostet 20 Pfennig je Stück und Tag, kleine Wäsche 50 Pfennig.

## Quellen und Verantwortlichkeiten

`penrudd-household.mjs` ist die gemeinsame Quelle für Personen, Beziehungen,
Haushalte und Lieferverbindung. Stammbaum und Gasthof verwenden dieselben
Personen- und Weltidentitäten; niemand wurde neu angelegt. Die 24 benannten
Personen besitzen nun eigene Porträts; nur die unbekannten Gründer behalten
ihre Platzhalter. `penrudd-appearances.mjs` hält ihr Aussehen fest.

## Familie

Unbekanntes Gründerpaar → Hausknoten → genau ein serieller Zeitsprung →
**Madoc Penrudd (1642–1718) und Nest (1647–1726)** → deren beide Söhne:

- **Gwilym (70) und Enid (68)**: alter Wirtszweig am Roten Tor.
  - **Carwyn (46) und Olwen (43)**: heutige Betreiber.
    - **Aled (24) und Cerys (22)**: Stall und Wagenhof; Sohn **Rhys (2)**.
    - **Mared (20)**: unverheiratet, Empfang und Rechnungsbuch.
    - **Dewi (13)**: altersgemäße kleine Hilfen, kein regulärer Knecht.
  - **Hywel (39) und Ffion (36)**: Keller, Lieferannahme, Zimmer und Wäsche;
    Kinder **Iwan (10)** und **Eleri (6)**.
  - **Rhosyn (35)**: unverheiratet, Schankstube.
- **Tudur (66) und Bethan (64)**: Hofzweig am Penrudd-Hof.
  - **Meurig (42) und Nia (40)**: Hofnachfolge, Vieh, Feld, Geflügel und Garten;
    Kinder **Gethin (21)**, **Lowri (16)** und **Osian (11)**, alle unverheiratet.
  - **Eluned (36)**: unverheiratet, Milchkammer, Butter und einfacher Käse.

Insgesamt 26 Personen: zwei unbekannte Gründer, zwei verstorbene Angehörige
und 22 Lebende. Sämtliche sieben namentlich ausgearbeiteten Angeheirateten
tragen ausschließlich Vornamen. Ihre Herkunftshäuser bleiben offen.
Bestehende Penry-Personen, insbesondere der Talgarther Familie, bleiben unverändert.
Alle Namen, Daten und Rollen dieser neuen Familie sind ergänzende Ausarbeitung
nach dem Nutzerauftrag vom 19.10.2026. Niemand wird aus vorhandenen Akten gedoppelt.

## Auswahl des Hofes

Bestehende Bannkreis-Karte:
`Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/data.json`.
Der Pin **gwynthor-marking-041** war ein vollständig unbenannter Bauernhof ohne
Betreiber, Beschreibung, Waren oder Zuordnung. Unter diesen freien Bauernhöfen
liegt er nach den normalisierten Kartenkoordinaten dem Gasthof am nächsten.
Die Markerkarte wurde tatsächlich angesehen: Der Hof liegt am nördlichen Weg,
nahe Owains Anwesen, mit bereits eingezeichneten Äckern und Viehweiden.
Aus der Kartennähe werden keine Kilometer oder Reisezeiten abgeleitet.

Der Hof heißt nun **Penrudd-Hof**. Alle Pin-IDs und Koordinaten bleiben erhalten;
ebenso die bereits belegten Höfe Gwerfil, Afelwyn, Bradrhith und Owains Anwesen.
Die genaue Grundherrschaft und ein möglicher Pachtvertrag bleiben offen.
Der allgemeine Dienstbezug des Familienhauses ist Haus Draig; daraus wird keine
bestimmte Pachtparzelle oder persönliche Hofbelehnung abgeleitet.

Der Bauernzweig liefert Milch, Butter, einfachen Käse, Eier, Geflügel, saisonales
Gemüse sowie Heu und Hafer. Gelegentliches Schlachtvieh verarbeitet ein örtlicher
Fleischer. Hof und Herberge führen getrennte Kassen und rechnen ihre Leistungen
ab. Der Hof hat weitere Abnehmer; die Herberge braucht weitere Lieferanten für
z. B. Bier, Wein und Brot. Keine kostenlose Vollversorgung und keine magische Kühlung.

## Wappen

Gewählter Entwurf: rotes offenes Holztor mit cremefarbener Laterne auf dunkelbraun
bemalten Brettern. Exakt kreisrunder, geschlossener dunkler Eisenrahmen mit Nieten
und vier schlichten Knotenzierden. Wahlspruch: **Ein Platz am Feuer.**

Vor der Generierung wurden die registrierten Gwynthorer Bürgerwappen Vann und
Raves angesehen und als Stilreferenzen übergeben. Verbindlich ist das vollständige
Preset `fantasy-heraldic-emblem`; fremde Motive und Goldrahmen werden nicht übernommen.

Die am 19.10.2026 ausdrücklich freigegebene technische Bereinigung ist abgeschlossen:
innen Alpha 255, außerhalb der exakten Kreisform Alpha 0, mittig mit etwa 87 Prozent
Bildbreite. Motiv und sämtliche ursprünglichen RGB-Pixel bleiben unverändert;
ergänzt wurde nur transparenter Rand. Original, Versatz, Kreisparameter und
Prüfsummen sind in `penrudd-emblem-provenance.json` dokumentiert. Die Darstellung
wurde auf heller und dunkler Unterlage geprüft.

## Prüfung

```powershell
node --test --experimental-test-isolation=none Stammbäume/tests/house-penrudd.test.js
node Stammbäume/tools/check-chart-geometry.mjs --families=haus-penrudd
```

Die Diagrammprüfung muss genau einen seriellen Übergang hinter dem Hauswappen
und beide Brüder erst unter Madoc und Nest zeigen. Das Gasthofmodul verändert
weder Genealogie noch Porträts. Zusätzliche Prüfungen:

```powershell
node AleriaAlmanach/scripts/build-rotes-tor.mjs
node AleriaAlmanach/scripts/build-rotes-tor.mjs --check
node --test --experimental-test-isolation=none AleriaAlmanach/tests/rotes-tor.test.mjs AleriaAlmanach/tests/rotes-tor-menu.test.mjs
node AleriaAlmanach/tests/rotes-tor.browser.mjs
```

`tor-module.mjs` baut die Seiten auf, `tor-biography.mjs` die beiden Biografien,
`tor-hierarchy.mjs` den Dienstplan, `tor-services.mjs` die Leistungen und
`tor-rooms.mjs` Räume und Kapazitäten. `tor-people.mjs` ist nur ein Adapter
auf die vorhandene Familie. Registrierung und JSON-Paket erzeugt der Build
mit der gemeinsamen Archivregistrierung; wiederholtes Laden dupliziert nichts.

`tor-dishes.mjs` hält die Rezepte getrennt von der Güterdarstellung in
`tor-menu.mjs`. `tor-beer.mjs` wählt vier günstige Ausschankbiere aus den
aktuellen Zunftkatalogen. Der Node-Adapter
`brewer-guilds/brewery-catalog-source.mjs` liest diese erzeugten Kataloge;
`trade-catalog/catalog-serving-selection.mjs` übernimmt die jeweilige
Ausschankeinheit samt Preis und Bild. Auch die Kanne verwendet diese Auswahl.

## Kalkulation

`tor-economy.mjs` verwendet das gemeinsame Geld-, Kalender-, Personal- und
Rechenmodell. Acht arbeitende Erwachsene zählen jeweils einmal; Cerys ist
mit drei Teilzeittagen angesetzt. Küchenhilfe, Kammermagd und Nachtwache sind
ausdrücklich unbesetzt. Kinder, Altenteil und der gesamte Hofzweig sind keine
zusätzlichen Lohnempfänger. Die Haushaltsentnahme trägt den Anteil von Kindern
und Altenteil; die übrigen arbeitenden Erwachsenen erhalten Familienvergütung
und persönliche Kost/Logis. Hoflieferungen sind im Einkaufsaufwand enthalten.

Zimmer, Stall und Wagen sind durch tatsächliche Kapazitäten begrenzt; der
Bratentag durch höchstens 18 Portionen je Neuntagewoche. Mahlzeiten und
Übernachtung werden getrennt verkauft. Die Buchungsraten, Löhne, Pacht und
Abgaben bleiben sichtbare Annahmen; Vermögen, Schulden und Grundeigentümer
sind nicht erhoben. Ein reicher Stadtlebensstandard wird nicht automatisch auf
den ländlichen Gasthof übertragen. Der gemeinsame Wirtschaftsbericht übernimmt
die eigene Kalkulation statt sie durch ein generisches Ladenprofil zu ersetzen.

Die Kartenerweiterung verteilt dieselben 0,84 Speisen und 1,7 Getränke je
Schankbesuch auf mehr Auswahl. Ein Fünftel der Getränkemenge entfällt auf
die vier Zunftbiere; ihr höherer Einkaufsanteil enthält den bezahlten Bezug.
Mehr Auswahl erhöht weder automatisch die Gästezahl noch die Belegschaft.

## Ortsbilder

Die fünf neuen PNGs liegen unter `assets/rotes-tor/scenes/`, im 2:3-Preset
`anime-scene-portrait`. `scene-prompts.json` enthält die vollständigen Prompts
und tatsächlichen Referenzen, `scene-results.json` die Originalpfade und Hashes.
Die Originalpixel und Archivdateien bleiben unverändert. Für die vier Raum- und
Hofbilder wurde die neue Außenansicht als Gebäudereferenz verwendet.

## Aussehen und Porträts

Geborene Penrudds haben braune Haare und braune Augen, ältere Angehörige
altersgemäß graue Haare. Enid, Nest und die rothaarige Olwen sind Cenyri;
Bethan und Cerys stammen aus Aldrimar, Nia und Ffion sind menschliche Albinnen
mit runden Ohren. Alle Personen unterscheiden sich in Gesicht, Frisur, Kleidung,
Mimik und einer unkomplizierten stehenden Pose. Historische Porträts zeigen
Madoc mit 70 und Nest mit 72 Jahren zu Lebzeiten. Kinder sind altersgerecht
und vollständig bekleidet dargestellt.

## Hauskarte

`tor-dishes.mjs` ist die Quelle für Speisenportionen, Preise und Herkunft. Der Hof liefert
einen Teil der Zutaten gegen Bezahlung; weitere Waren werden zugekauft.

| Gericht | Preis |
| --- | --- |
| Warmer Apfel-Haferbrei | 55 Pfennig |
| Hofeier mit Speck und Brot | 1,8 Kupfertaler |
| Dickmilch mit Beeren und Hafer | 75 Pfennig |
| Hofbrot mit Butter und Käse | 70 Pfennig |
| Lauch- und Gerstensuppe | 60 Pfennig |
| Roter Tortopf | 1,4 Kupfertaler |
| Olwens Huhn im Wurzelsud | 2,4 Kupfertaler |
| Kohlpfanne mit Ei | 1,1 Kupfertaler |
| Bohnenpfanne mit Tomate und Speck, dazu Brot | 1,8 Kupfertaler |
| Geschmorte Schweineschulter mit Gerste | 2,8 Kupfertaler |
| Gebratener Flussfisch mit Wurzeln | 2,2 Kupfertaler |
| Braten vom Hofrind | 4 Kupfertaler |
| Warmer Apfel-Haferauflauf | 65 Pfennig |
| Fuhrmannsbeutel | 1,2 Kupfertaler |

Der Braten ist nur an einem angekündigten Bratentag je Neuntagewoche und nach
Lieferlage erhältlich. Sieben gewöhnliche Getränke übernehmen Preis, Portion,
Waren-ID und Bild aus dem gemeinsamen Standardsortiment; dazu kommt schlichter
roter Tischwein zu 80 Pfennig je 0,20-l-Becher.

Als günstiger Zunftbezug ergänzen **Sonnenglanz (0,60 KT), Hopfgold (1,30 KT)
und Dämmerkrone (1,95 KT)** von Teyrngarch sowie **Goldschuppen (2 KT)** von
Penderyn den Ausschank. Alle vier Preise gelten für einen Krug mit 0,5 l und
werden samt Originalbild unverändert aus dem aktuellen Zunftkatalog übernommen.
Es gibt dadurch keine neue Gildenmitgliedschaft des Gasthofs.

Die drei neuen Frühstücke werden morgens angeboten. Tomaten kommen nach Saison
oder eingekocht aus regionalem Einkauf, Speck und Schweineschulter vom örtlichen
Fleischer. Das Fischgericht bleibt ohne passende frische Lieferung aus.

Alle Gerichte sind quadratische, freigestellte Inventar-Icons mit echtem
PNG-Alphakanal nach `fantasy-inventory-item`. Der erste Brot-Entwurf im
Szenenstil wurde nach Nutzerkorrektur verworfen und ersetzt. Die 24 Porträts
verwenden das 2:3-Preset `anime-scene-portrait` mit Tales of Xillia/Frieren.
Erzeugung ausschließlich mit dem eingebauten ImageGen; Originale bleiben erhalten.
Dateien: `assets/rotes-tor/portraits/`, `assets/rotes-tor/food/`.
Vollständige Prompts, Referenzen und Ergebnisse: `assets/rotes-tor/image-prompts.json`
und `image-results.json`. Der Prompt-Build trennt Speisen und Figuren ausdrücklich.
