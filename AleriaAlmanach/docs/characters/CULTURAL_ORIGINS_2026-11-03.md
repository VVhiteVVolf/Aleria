# Völker und kulturelle Herkunftspakete

Der Herkunftskatalog enthält 28 auswählbare Pakete. Die technischen Felder
`ancestry` und `ancestryId` bleiben mit vorhandenen Charakterbögen kompatibel;
die Einträge beschreiben ausdrücklich **kulturelle Ausgangsausbildung**, keine
neuen biologischen Spezies und keine automatische Staatsangehörigkeit.

Jede Figur wählt genau ein Paket: +2 auf ein Attribut, +1 auf ein anderes und
drei Fertigkeitsvorschläge. Regionale Pakete ersetzen das allgemeine Paket;
sie werden nicht zusätzlich dazu angewendet. Fertigkeitsübung wird wie bisher
erst durch bewusste Auswahl beziehungsweise Übernahme der Vorschläge erlangt.
Kein Paket gibt Waffen, Rüstung, Geld, Zauber, Resistenzen oder Techniken.

Die vier bisherigen Pakete Cenyr, Alben, Aldrimarer und Nordmann behalten ihre
Attributsboni und Fertigkeitsvorschläge unverändert. Das Lesen der neuen
Katalogdaten verändert keine vorhandene Figur und keine Live-Ressource.

| Herkunft | +2 | +1 | Fertigkeitsvorschläge |
| --- | --- | --- | --- |
| Cenyr | KRF | CHA | Überzeugen, Auftreten, Religion |
| Alben | GES | WEI | Mit Tieren umgehen, Naturkunde, Überleben |
| Aldrimarer | KRF | KON | Athletik, Mit Tieren umgehen, Überleben |
| Nordmann | KON | KRF | Überleben, Einschüchtern, Körperbeherrschung |
| Vennyr | GES | KON | Athletik, Wahrnehmung, Überleben |
| Morgorn | KON | INT | Athletik, Geschichte, Nachforschungen |
| Alwener / Goldmund | INT | CHA | Überzeugen, Motiv erkennen, Geschichte |
| Aldinger | KRF | INT | Athletik, Geschichte, Überzeugen |
| Blutstädter | INT | CHA | Religion, Geschichte, Überzeugen |
| Weisenfluh | KON | CHA | Athletik, Naturkunde, Überzeugen |
| Venalier | CHA | INT | Überzeugen, Motiv erkennen, Geschichte |
| Aeldrunmar | WEI | KRF | Mit Tieren umgehen, Überleben, Athletik |
| Talyndor | KRF | WEI | Mit Tieren umgehen, Athletik, Geschichte |
| Brevanor | CHA | GES | Auftreten, Überzeugen, Geschichte |
| Alben aus Leitheach | WEI | CHA | Geschichte, Religion, Auftreten |
| Alben aus Aislearneach | GES | WEI | Mit Tieren umgehen, Naturkunde, Überleben |
| Alben aus Dunfal | KRF | WEI | Athletik, Überleben, Geschichte |
| Alben aus Blaithneach | WEI | CHA | Religion, Geschichte, Überzeugen |
| Alben aus Uathneach | GES | WEI | Naturkunde, Überleben, Wahrnehmung |
| Alben aus Faelaorn | GES | INT | Überleben, Geschichte, Wahrnehmung |
| Alben aus Iathneach | GES | WEI | Naturkunde, Überleben, Athletik |
| Alben aus Deitheach | KON | WEI | Überleben, Naturkunde, Athletik |
| Alben aus Moinneach | WEI | KON | Überleben, Naturkunde, Heilkunde |
| Alben aus Ceitheach | WEI | GES | Naturkunde, Überleben, Religion |
| Alben aus Lichthain | GES | WEI | Mit Tieren umgehen, Naturkunde, Überleben |
| Alben aus dem Hain der Druiden | GES | WEI | Mit Tieren umgehen, Naturkunde, Überleben |
| Nordmänner aus Fjordheim | GES | KON | Athletik, Wahrnehmung, Überleben |
| Nordmänner aus Skjaerheim | KON | KRF | Überleben, Einschüchtern, Athletik |

## Quellen und offene Grenzen

Der featurebezogene Katalog
[`cultural-origin-catalog.js`](../../modules/character-origins/cultural-origin-catalog.js)
nennt für jeden Eintrag die tatsächlich gelesenen Quellen (`sourcePaths`),
das bestehende Kultur-/Landeszeichen und einen vorhandenen Seitenverweis.
Beschreibungen folgen dem Länderatlas, den ausgearbeiteten Länderkontexten
und den vorhandenen Kulturseiten des Klassenregisters. Die Stats sind neu
gestaltete Regel-Ausgangspakete im gemeinsamen Budget; sie sind keine aus
der Erzählung zwingend folgende Aussage über jede Person dieser Kultur.

Leitheach und Blaithneach sind regionale Ausprägungen innerhalb der Cruinach,
keine neuen Völker. Lichthain und Hain der Druiden sind bisher nur als fürstliche
Gebiete benannt; sie behalten daher bewusst das allgemeine albische Paket.
Aus dem Namen Hain der Druiden entstehen weder Zauber noch eine Druidenklasse.

Historische Herkunft bleibt möglich: Ceitheach ist untergegangen, Deitheach,
Brevanor und Talyndor stehen unter fremder Herrschaft, Vennyrs Gebiet gehört
heute zu Fjordheim. Herkunft und Besatzungsmacht bleiben verschiedene Angaben.
Die Triarchie ist keine Herkunft; aus dem Dunkelhain wird kein neues Volk
abgeleitet. Jarltümer Aldrimars sind keine zusätzlichen biologischen Völker.
Die historischen Begriffe Briath und Kaiservolk werden nicht durch bloße
Namensnormalisierung in moderne Herkunftsangaben umgeschrieben.

Aeldrunmar, Talyndor, Brevanor und Deitheach liegen auf Aldervan, Venalys auf
Tirnara. Für nicht belegte Kontinentzuordnungen wird kein Wert erfunden.

Die vorhandenen Alben- und Nordmannzeichen wurden aus genau den bisher im
Klassenregister verwendeten Quellen lokal übernommen und als 256px-PNG
bereitgestellt. Originale und Herkunft stehen im
[`Bildmanifest`](../art/character-origins/manifest.json). Andere Pakete verwenden
die bereits vorhandenen passenden Landeszeichen. Das Archiv und die Starthilfe
beziehen dieselben Templates; kulturelle Traits führen das zugehörige Zeichen mit.
