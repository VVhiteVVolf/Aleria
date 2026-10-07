# Teyrngarch und Penderyn

Die Module stehen unter **Gilden & Zünfte → Brauer & Brenner**, neben Gortach. Bekannte Getränke stehen untereinander im Template Handelsgut & Tiere. Partnerprodukte erhalten einen eigenen Katalog; jedes Stammsortiment enthält fünf noch unbelegte, kompakte Plätze.

## Seitenplan

| Seite | Teyrngarch · 8 Seiten | Penderyn · 9 Seiten | Template |
| --- | --- | --- | --- |
| I | Von der Ähre zum Adel | Ein Brennhaus wird zum Familienerbe | Story mit 2:3-Bild |
| II | Das Haus hinter der Zunft | Die Familie am Brennhaus | Gilde mit Originalporträts |
| III | Ämter, Ausbildung und Verantwortung | Ämter, Ausbildung und Verantwortung | Hierarchie |
| IV | Vom Gerstenfeld zum Schanktisch | Die Kunst zwischen Feuer und Fass | Story mit 2:3-Bild |
| V | Herrschaften, Pachten und Brauorte | Drakenburg, Mathragon und Gwynthor | Organisationsnetzwerk |
| VI | Fünf Eigenbiere + fünf freie Plätze | Zwei Whiskys + fünf freie Plätze | Handelsgut & Tiere |
| VII | Partnerbrauereien: Hakenbräu | Hausbiere: Goldschuppen & Drachenblut | Handelsgut & Tiere |
| VIII | Bündnisse, Macht und Familienbande | Kooperationsbier: Brandhorn | Story / Handelskatalog |
| IX | — | Verbündete, Schutz und Familienbande | Story mit 2:3-Bild |

Das Netzwerk-Template ergänzt die gewünschten Templates für die überlieferten Standorte. Der am 7. Oktober nachgereichte Tavernenbestand ergänzt Penderyns Eigenbiere Goldschuppen und Drachenblut sowie das Gochwyr-Kooperationsbier Brandhorn. `penderyn-beers.mjs` bewahrt die vollständigen Beschreibungen und die ursprünglichen Bildadressen aus „Zum Roten Drachen“. Die dort vertauschten Beschreibungen der beiden Eigenbiere sind nach ihrem Inhalt zugeordnet; Namen, Bilder und Preise bleiben zusammen. Unbekannte Abfüllungen aus den `??`-Feldern der älteren Vorlage bleiben freie Plätze. Hakenbräu bleibt ein örtliches Partnerschaftsbier des Rostigen Hakens; die Mengenpreise ändern seine beschränkte Verfügbarkeit nicht.

## Quellen und Familie

`sources/*.html` bewahrt die beiden eingefügten Vorlagen unverändert. `sources/*.json` enthält ihre Textblöcke mit bereinigter Formatierung. Die Tests sichern sämtliche längeren Inhaltsabsätze. Die beiden Modelle ordnen diese Quellen vorhandenen Templates zu; `brewery-pages.mjs` kapselt gemeinsame Seitenerzeugung. `brewer-guilds-data.js` wird erzeugt, nicht manuell gepflegt. Die Registrierung ergänzt fehlende IDs, ohne vorhandene redaktionelle Bearbeitungen zu überschreiben.

Familienrollen, Originalwappen und Porträts stammen aus den Stammbäumen. Bei Teyrngarch widerspricht die kurze Angabe „Anführer: Gaenor“ der ausführlichen Rangordnung: Diese bindet das Gildenoberhaupt an das Hausoberhaupt Lugh. Die Darstellung folgt der ausführlichen Ordnung: Lugh an der Spitze, Gaenor als führender Familienbrauer, Gandwy als Geselle. Taredd und Sulwen erscheinen als Gründer ohne erfundene Jahreszahlen.

Bei Penderyn steht Talfryn als Träger des Hauses über den fünf überlieferten Zunfträngen. Deren persönliche Amtsinhaber sind unbekannt. Die ausgearbeiteten Zuständigkeiten werden als Erläuterungen gekennzeichnet. Osian und Aneurin erscheinen mit Familienrollen, ohne zu Destilleriemeistern erklärt zu werden. Die Drakenschluck Söldner stehen außerhalb der handwerklichen Rangfolge. Dwnn und Elinor sind verlobt, nicht verheiratet.

Die Namensregel des Comann Braich Alba (Seite IX–X; Abfüllungszusätze auf XI) wird ausdrücklich angewendet: **Penderyn** bleibt der dort als Beispiel genannte Haus- und Traditionsname. Die zweite Abfüllung heißt **Penderyn · Rhagorol**. Auf beiden Etiketten dominiert Penderyn; Rhagorol ist ein Zusatz, Cenyr die Herkunft. Es werden keine unbelegten Landschaftsnamen, Jahreszahlen oder Uisge-Beatha-Prüfsiegel ergänzt. Die historischen Quelltexte bleiben erhalten.

## Preise und Verkaufsgrößen

Die vom Nutzer bestätigten Größen sind Bierkrug **0,5 l**, Bierflasche **1 l**, Whiskyglas **4 cl**, Whiskyflasche **0,7 l**, Fass jeweils **50 l**. `modules/trade-catalog/drink-catalog-model.mjs` leitet Flasche und Fass proportional aus dem Ausschankpreis ab. Die Berechnung verwendet ganzzahlige Pfennige und die bestehende Währungslogik. Keine Mengenrabatte, Pfand- oder Frachtkosten; dies steht auch im Katalog.

| Getränk | Glas / Krug · KT | Flasche · KT | Fass · KT |
| --- | ---: | ---: | ---: |
| Teyrngarch Goldhaube | 8,5 | 17 | 850 |
| Teyrngarch Hellwacht | 2,6 | 5,2 | 260 |
| Teyrngarch Dämmerkrone | 1,95 | 3,9 | 195 |
| Teyrngarch Hopfgold | 1,3 | 2,6 | 130 |
| Teyrngarch Sonnenglanz | 0,6 | 1,2 | 60 |
| Partner: Hakenbräu | 1,3 | 2,6 | 130 |
| Penderyn | 12 | 210 | 15.000 |
| Penderyn · Rhagorol | 6,5 | 113,75 | 8.125 |
| Penderyn: Goldschuppen Bier | 2 | 4 | 200 |
| Penderyn: Drachenblut Bier | 4 | 8 | 400 |
| Kooperation Gochwyr: Brandhorn Bier | 3 | 6 | 300 |

Ausgangspunkt sind Teyrngarchs bisherige Flaschenpreise und Penderyns Glaspreise. Auf anschließenden Nutzerwunsch werden **alle 22 Getränke** einmalig um 20–70 % angehoben. `brewery-prices.mjs` kapselt die Staffel: Bier mit ursprünglichem Krugpreis unter 1 KT +20 %, unter 3 KT +30 %, unter 5 KT +50 %, ab 5 KT +70 %. Whisky mit ursprünglichem Glaspreis unter 8 KT +30 %, unter 16 KT +50 %, ab 16 KT +70 %. Damit erhalten Goldhaube und die 22-/28-jährigen Gortach-Spitzenabfüllungen den höchsten Aufschlag. Hakenbräu ist eingeschlossen.

Erst wird der neue Ausschankpreis auf ganze Pfennige gerundet, dann werden Flasche und Fass nach Inhalt abgeleitet. Wiederholtes Erzeugen erhöht die Preise nicht erneut. Gortachs neue Ausschankpreise liegen bei 1,3–6 KT für Bier und 12–47,6 KT für Whisky. Seine unveränderten Ausgangswerte stehen in `modules/gortach-brauerei/gortach-prices.mjs`. Die später bestätigten Preise für Goldschuppen, Drachenblut und Brandhorn gelten unverändert: Ihre Katalogseiten wählen über `priceBuilder` unmittelbar die gemeinsame Mengenberechnung `buildDrinkPricing`, während die bisherigen 22 Getränke ihre einmalige Erhöhung behalten.

Das vorhandene Handelstemplate erhält zwei optionale Felder: `status: 'planned'` für Reserven und `priceOptions: [{label, unit, price}]` für Verkaufsgrößen. Der Editor erhält beide beim Bearbeiten und Importieren. Ohne Optionen bleibt die bisherige Preisspanne bestehen. Die gemeinsame Warenregister-Projektion erzeugt drei getrennte Angebote pro Getränk, mit dem Penderyn-Nachtrag insgesamt 75 aus den drei Brauereien. Reserven erzeugen keine Angebote. Derselbe Code wird für die serverseitige Preisprüfung erzeugt; bestehende Inventare und historische Käufe werden nicht migriert.

Die Preisanzeige verwendet die vorhandenen Kupfertaler- und Eisenpfennig-Symbole statt des Kürzels KT. Unter einem Kupfertaler erscheinen ausschließlich Eisenpfennige; gemischte Beträge werden in ganze Kupfertaler und Restpfennige aufgeteilt. Große Beträge bleiben in Kupfertalern. `trade-catalog-money.js` verwendet den gemeinsamen Warenregister-Parser; Berechnung, Speicherung und Kaufprüfung bleiben unverändert. Der Renderer lädt ihn als ES-Modul und erhält den bestehenden öffentlichen Template-Einstieg `buildTradeCatalogPage`.

## Bilder und Navigation

19 neue Bilder liegen unter `public/assets/brewer-guilds`: sechs Storybilder und acht Produktbilder im Format 2:3, zwei alternative Marken und drei Navigationssymbole. [image-prompts.json](image-prompts.json) dokumentiert vollständige Prompts und Referenzdateien der integrierten Bildgenerierung. Storybilder folgen dem vorgegebenen Anime-Stil; Produktbilder dem bestehenden Warenregister-/Gortach-Stil. Lugh, Gaenor, Gandwy, Talfryn und Osian sind in Familienszenen vertreten; ergänzend gibt es Stillleben.

Die drei nachgereichten Bierbilder sind unveränderte Original-PNGs aus der Taverne, lokal als `bier-goldschuppen.png`, `bier-drachenblut.png` und `bier-brandhorn.png` gesichert. Ihr quadratisches Format und ihre Transparenz bleiben erhalten; `imageFormat` wird je Produkt übernommen.

Teyrngarchs Brauzeichen verwendet Krug, Gerstenähren und Grün/Gold. Penderyns Brennzeichen übersetzt das rote Wappen in einen Drachen um eine Flasche. Die Marken erscheinen auf Etiketten und als große, zentrierte Wasserzeichen hinter dem Artikelbild: 23 % Deckkraft und −18° Drehung. Die Beschreibung bleibt auf die Bildhöhe begrenzt und bei Bedarf scrollbar.

Die beiden Penderyn-Etiketten wurden entsprechend der Namensordnung überarbeitet. Zusätzlich wurde beim gemeinsamen `public/assets/inventory/coins/eisenpfennig.png` der Hintergrund einschließlich des Münzlochs transparent freigestellt. Die Bearbeitungsprompts stehen ebenfalls im Bildmanifest.

Die drei Navigationsbereiche erhalten eigene Motive: Krug/Brennblase, Hammer/Keltenknoten und Feder/Pergament. Das Hauptsymbol „Gilden & Zünfte“ behält sein bisheriges Weltpfad-Motiv; Unterbereichssymbole werden nicht an die Hauptkarte vererbt. Ein ausdrücklich gesetztes Wurzelsymbol bleibt maßgeblich. Archivordner starten geschlossen. Nur eine ausdrückliche Auswahl oder das Aufklappen öffnet sie; erneutes Rendern öffnet keinen zuvor eingeklappten Ordner.

## Erzeugung und Prüfung

Im Verzeichnis `AleriaAlmanach`:

```sh
npm run build:brewer-guilds
npm run build:gortach
npm run check:brewer-guilds
npm run check:gortach
npm run test:brewer-guilds
npm run test:gortach
npm run check:templates
```

Gezielte Tests prüfen Preise, Reserven, Quellen, Familienrollen, Bildverweise, Seitenstruktur, Registrierung und Archivnavigation. Der isolierte Browsercheck umfasst 51 Ansichten bei 1600, 1120 und 390 Pixeln, Bildladung, Textgrenzen, Wasserzeichen, Preisanzeige, Filter, Auf-/Einklappen und Editor-Rücklauf. Servertests prüfen den Kauf jeder Größe zum korrekten Preis und weisen manipulierte Preise zurück.
