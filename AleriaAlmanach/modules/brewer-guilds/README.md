# Teyrngarch und Penderyn

Die Module stehen unter **Gilden & Zünfte → Brauer & Brenner**, neben Gortach. Bekannte Getränke stehen untereinander im Template Handelsgut & Tiere. Partnerprodukte erhalten einen eigenen Katalog; jedes Stammsortiment enthält fünf noch unbelegte, kompakte Plätze.

## Seitenplan

| Seite | Teyrngarch · 8 Seiten | Penderyn · 7 Seiten | Template |
| --- | --- | --- | --- |
| I | Von der Ähre zum Adel | Ein Brennhaus wird zum Familienerbe | Story mit 2:3-Bild |
| II | Das Haus hinter der Zunft | Die Familie am Brennhaus | Gilde mit Originalporträts |
| III | Ämter, Ausbildung und Verantwortung | Ämter, Ausbildung und Verantwortung | Hierarchie |
| IV | Vom Gerstenfeld zum Schanktisch | Die Kunst zwischen Feuer und Fass | Story mit 2:3-Bild |
| V | Herrschaften, Pachten und Brauorte | Drakenburg, Mathragon und Gwynthor | Organisationsnetzwerk |
| VI | Fünf Eigenbiere + fünf freie Plätze | Zwei Whiskys + fünf freie Plätze | Handelsgut & Tiere |
| VII | Partnerbrauereien: Hakenbräu | Verbündete, Schutz und Familienbande | Handelskatalog / Story |
| VIII | Bündnisse, Macht und Familienbande | — | Story mit 2:3-Bild |

Das Netzwerk-Template ergänzt die gewünschten Templates für die überlieferten Standorte. Penderyn erhält keine erfundenen Eigenbiere. Seine unbekannten Abfüllungen aus den `??`-Feldern der Vorlage werden durch freie Plätze ersetzt. Hakenbräu bleibt ein örtliches Partnerschaftsbier des Rostigen Hakens; die Mengenpreise ändern seine beschränkte Verfügbarkeit nicht.

## Quellen und Familie

`sources/*.html` bewahrt die beiden eingefügten Vorlagen unverändert. `sources/*.json` enthält ihre Textblöcke mit bereinigter Formatierung. Die Tests sichern sämtliche längeren Inhaltsabsätze. Die beiden Modelle ordnen diese Quellen vorhandenen Templates zu; `brewery-pages.mjs` kapselt gemeinsame Seitenerzeugung. `brewer-guilds-data.js` wird erzeugt, nicht manuell gepflegt. Die Registrierung ergänzt fehlende IDs, ohne vorhandene redaktionelle Bearbeitungen zu überschreiben.

Familienrollen, Originalwappen und Porträts stammen aus den Stammbäumen. Bei Teyrngarch widerspricht die kurze Angabe „Anführer: Gaenor“ der ausführlichen Rangordnung: Diese bindet das Gildenoberhaupt an das Hausoberhaupt Lugh. Die Darstellung folgt der ausführlichen Ordnung: Lugh an der Spitze, Gaenor als führender Familienbrauer, Gandwy als Geselle. Taredd und Sulwen erscheinen als Gründer ohne erfundene Jahreszahlen.

Bei Penderyn steht Talfryn als Träger des Hauses über den fünf überlieferten Zunfträngen. Deren persönliche Amtsinhaber sind unbekannt. Die ausgearbeiteten Zuständigkeiten werden als Erläuterungen gekennzeichnet. Osian und Aneurin erscheinen mit Familienrollen, ohne zu Destilleriemeistern erklärt zu werden. Die Drakenschluck Söldner stehen außerhalb der handwerklichen Rangfolge. Dwnn und Elinor sind verlobt, nicht verheiratet.

## Preise und Verkaufsgrößen

Die vom Nutzer bestätigten Größen sind Bierkrug **0,5 l**, Bierflasche **1 l**, Whiskyglas **4 cl**, Whiskyflasche **0,7 l**, Fass jeweils **50 l**. `modules/trade-catalog/drink-catalog-model.mjs` leitet Flasche und Fass proportional aus dem Ausschankpreis ab. Die Berechnung verwendet ganzzahlige Pfennige und die bestehende Währungslogik. Keine Mengenrabatte, Pfand- oder Frachtkosten; dies steht auch im Katalog.

| Getränk | Glas / Krug · KT | Flasche · KT | Fass · KT |
| --- | ---: | ---: | ---: |
| Teyrngarch Goldhaube | 5 | 10 | 500 |
| Teyrngarch Hellwacht | 2 | 4 | 200 |
| Teyrngarch Dämmerkrone | 1,5 | 3 | 150 |
| Teyrngarch Hopfgold | 1 | 2 | 100 |
| Teyrngarch Sonnenglanz | 0,5 | 1 | 50 |
| Partner: Hakenbräu | 1 | 2 | 100 |
| Penderyn Whiskey | 8 | 140 | 10.000 |
| Rhagorol Whiskey | 5 | 87,5 | 6.250 |

Damit bleiben Teyrngarchs bisherige Flaschenpreise und Penderyns Glaspreise erhalten. Gortachs neue Ausschankpreise liegen bei 1–4 KT für Bier und 8–28 KT für Whisky; Reifezeit und Seltenheit begründen die höheren Whisky-Stufen. Einzelwerte stehen in `modules/gortach-brauerei/gortach-prices.mjs` und nutzen dieselbe Ableitung.

Das vorhandene Handelstemplate erhält zwei optionale Felder: `status: 'planned'` für Reserven und `priceOptions: [{label, unit, price}]` für Verkaufsgrößen. Der Editor erhält beide beim Bearbeiten und Importieren. Ohne Optionen bleibt die bisherige Preisspanne bestehen. Die gemeinsame Warenregister-Projektion erzeugt drei getrennte Angebote pro Getränk, insgesamt 66 aus den drei Brauereien. Reserven erzeugen keine Angebote. Derselbe Code wird für die serverseitige Preisprüfung erzeugt; bestehende Inventare und historische Käufe werden nicht migriert.

## Bilder und Navigation

19 neue Bilder liegen unter `public/assets/brewer-guilds`: sechs Storybilder und acht Produktbilder im Format 2:3, zwei alternative Marken und drei Navigationssymbole. [image-prompts.json](image-prompts.json) dokumentiert vollständige Prompts und Referenzdateien der integrierten Bildgenerierung. Storybilder folgen dem vorgegebenen Anime-Stil; Produktbilder dem bestehenden Warenregister-/Gortach-Stil. Lugh, Gaenor, Gandwy, Talfryn und Osian sind in Familienszenen vertreten; ergänzend gibt es Stillleben.

Teyrngarchs Brauzeichen verwendet Krug, Gerstenähren und Grün/Gold. Penderyns Brennzeichen übersetzt das rote Wappen in einen Drachen um eine Flasche. Die Marken erscheinen auf Etiketten und als große, zentrierte Wasserzeichen hinter dem Artikelbild: 23 % Deckkraft und −18° Drehung. Die Beschreibung bleibt auf die Bildhöhe begrenzt und bei Bedarf scrollbar.

Die drei Navigationsbereiche erhalten eigene Motive: Krug/Brennblase, Hammer/Keltenknoten und Feder/Pergament. Archivordner starten geschlossen. Nur eine ausdrückliche Auswahl oder das Aufklappen öffnet sie; erneutes Rendern öffnet keinen zuvor eingeklappten Ordner.

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
