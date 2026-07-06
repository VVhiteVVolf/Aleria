# Waehrungs-, Einkommens- und Lebensstandard-Kalkulator

Stand: 2026-07-06

Ziel: Ein Werkzeug fuer den Aleria Almanach, das auf Basis vorhandener Gueter-, Tier-, Pferde-, Speisen-, Ausruestungs- und Luxuspreise abschaetzt, wie Personen, Familien, Aemter und Herrschaftstraeger in Aleria wirtschaftlich leben.

Der Kalkulator soll nicht nur einzelne Preise anzeigen, sondern ein plausibles Wirtschaftsbild erzeugen:

- Wie hoch sind Einnahmen?
- Welche laufenden Kosten entstehen?
- Welche Abgaben fallen an?
- Was bleibt netto?
- Was bedeutet das fuer Lebensstandard, Kaufkraft, Ruecklagen und Risiko?
- Welche Anschaffungen sind realistisch?

Die Umsetzung erfolgt spaeter. Dieses Dokument legt Zielbild, Datenmodell, Rechenlogik, Architektur und Masterprompt fest.

## Grundentscheidung

Der Kalkulator arbeitet zweistufig:

1. Deterministische Berechnung im Frontend:
   - Waehrungsumrechnung
   - Preisnormalisierung
   - Einnahmen/Ausgaben/Abgaben
   - Tages-, Monats- und Jahreswerte
   - einfache Spannbreiten

2. AleriaGPT-Auswertung:
   - Plausibilitaetsbewertung
   - Lebensstandard-Beschreibung
   - unsichere Annahmen markieren
   - Vergleich mit Rang, Besitz und Standeskosten
   - Erklaerung in natuerlicher Sprache

Wichtig: AleriaGPT soll nicht die einzige Recheninstanz sein. Die KI darf interpretieren, begruenden und Luecken vorsichtig fuellen, aber die Kernzahlen muessen vom Kalkulator nachvollziehbar geliefert werden.

## Nicht-Ziele

Nicht geplant fuer die erste Version:

- keine vollstaendige mittelalterliche Volkswirtschaftssimulation
- keine automatische Aenderung bestehender Markt- oder Itemdaten
- keine versteckte KI-Korrektur von Preisen
- keine globale Wirtschafts-Balance, die alle Preise neu skaliert
- kein Ersatz fuer die Item- und Gueterdatenbank
- keine neuen Einzel-HTML-Dateien pro Berufsstand oder Familie

## Waehrungsregeln

Der Kalkulator rechnet intern immer in Kupfertalern.

```text
1 Goldtaler = 1.000 Kupfertaler
1 Silbertaler = 100 Kupfertaler
10 Silbertaler = 1 Goldtaler
1 Kupfertaler = 100 Pfennig
1 Pfennig = 0,01 Kupfertaler
```

Normierte Ausgabe:

```text
4.350 Kupfertaler = 4 Gold, 3 Silber, 50 Kupfer
0,75 Kupfertaler = 75 Pfennig
```

Offene Regel:

- Wenn eine Quelle nur "Taler" sagt, wird es fuer diesen Kalkulator standardmaessig als Kupfertaler behandelt.
- Ausnahme: Der konkrete Kontext nennt ausdruecklich Goldtaler oder Silbertaler.
- Diese Annahme muss in der UI und in der KI-Auswertung sichtbar sein.

## Bestehende Datenquellen

Der Kalkulator soll nicht eigene Preislisten kopieren. Er soll aus vorhandenen Quellen lesen.

Bereits relevante Quellen:

```text
AleriaAlmanach/modules/item-database/
Markt/Taverne/data/tavern-data.js
Markt/Viehmarkt/data/livestock-data.js
Markt/Alchemist/data/alchemy-data.js
Markt/Arkanist/data/arcane-data.js
Markt/Schwarzmarkt/data/blackmarket-data.js
Markt/Gemischtwarenhaendler/data/goods-data.js
Markt/WaffenRuestungen/data/shop-data.js
Markt/Rossmarkt/data/kontext-pferde.js
```

Die Item- und Gueterdatenbank ist der bevorzugte Einstiegspunkt, weil sie bereits mehrere Marktquellen normalisiert.

Erforderliche Erweiterung spaeter:

- ein wirtschaftlicher Preisindex, der aus Itemdatenbank-Eintraegen berechnet wird
- robuste Umrechnung von Preistexten in Kupferwerte
- Kategorien fuer laufende Lebenshaltungskosten
- Kategorien fuer Kapitalgueter, z. B. Pferd, Ruestung, Waffe, Vieh, Werkzeug
- Kategorien fuer Verbrauchskosten, z. B. Essen, Futter, Stall, Pflege, Unterkunft

## Wirtschaftlicher Preisindex

Der Preisindex ist eine abgeleitete Leseschicht. Er schreibt keine Daten zurueck.

Vorgeschlagene Struktur:

```js
{
  id: "pferde:ceffyl",
  title: "Ceffyl",
  category: "pferde",
  source: "Markt/Rossmarkt",
  priceCopper: {
    min: 5000,
    typical: 20000,
    max: 35000
  },
  unit: "Tier",
  isCapitalGood: true,
  isRecurringCost: false,
  upkeepCopper: {
    period: "month",
    min: null,
    typical: null,
    max: null
  },
  confidence: "source",
  notes: []
}
```

Preis-Confidence:

| Wert | Bedeutung |
| --- | --- |
| `source` | Preis direkt aus vorhandener Quelle |
| `derived` | aus vorhandener Quelle abgeleitet, z. B. Wochenkosten auf Jahr |
| `analog` | aus aehnlichem Gut abgeleitet |
| `assumed` | ausdrueckliche Annahme des Kalkulators oder Nutzers |

## Haushaltstypen

Der Kalkulator sollte mit Profilen arbeiten. Profile sind keine festen Wahrheiten, sondern Startwerte.

Erste Profile:

- einfacher Bauer
- wohlhabender Bauer
- Paechterfamilie
- Pferdezuechterfamilie
- Handwerker
- Haendler
- Gildenmeister
- einfacher Ritter
- Amtstraeger
- Kaemmerer
- Marschall
- Ritterherr
- Ritterfuerst
- Baron
- Graf
- Koenig

Jedes Profil enthaelt:

```js
{
  id: "horse-breeder-family",
  label: "Pferdezuechterfamilie",
  rankBand: "laendliche Oberschicht",
  defaultHouseholdSize: 5,
  defaultStaff: [],
  defaultAssets: [],
  defaultObligations: [],
  defaultLifestyle: "solide",
  riskNotes: []
}
```

## Szenario-Modell

Ein konkreter Kalkulationsfall sollte strukturiert gespeichert werden.

```js
{
  profileId: "horse-breeder-family",
  title: "Pferdezuechterfamilie mit Rhyfel-, Hest- und Ceffyl-Zucht",
  household: {
    adults: 2,
    children: 3,
    staff: [
      { role: "Knecht", count: 1 },
      { role: "Stallhilfe", count: 1 }
    ]
  },
  assets: {
    land: [],
    animals: [
      { itemKey: "pferde:rhyfel", count: 12, role: "Zuchtbestand" },
      { itemKey: "pferde:hest", count: 10, role: "Zuchtbestand und Arbeit" },
      { itemKey: "pferde:ceffyl", count: 3, role: "Elite-Zuchtbestand" }
    ],
    buildings: [
      { label: "Hof", count: 1 },
      { label: "Stallungen", count: 1 },
      { label: "Weiden", count: 1 }
    ]
  },
  production: [
    {
      label: "Rhyfel-Fohlen/Jungpferde",
      itemKey: "pferde:rhyfel",
      soldPerYear: { min: 2, typical: 3, max: 4 },
      salePriceFactor: 0.65
    },
    {
      label: "Hest-Fohlen/Jungpferde",
      itemKey: "pferde:hest",
      soldPerYear: { min: 2, typical: 4, max: 5 },
      salePriceFactor: 0.7
    },
    {
      label: "Ceffyl-Fohlen/Jungpferde",
      itemKey: "pferde:ceffyl",
      soldPerYear: { min: 0, typical: 1, max: 1 },
      salePriceFactor: 0.55
    }
  ],
  obligations: [
    { type: "noble-rent", label: "Pacht/Lehensanteil an Adel", mode: "percent-profit", value: 10 },
    { type: "church-tithe", label: "Kirchenzehnt", mode: "percent-profit", value: 10 },
    { type: "in-kind", label: "Pferde an Adel", mode: "custom", value: null }
  ]
}
```

## Rechenlogik

Der Kalkulator soll fuer jede Berechnung drei Werte fuehren:

- niedrig
- typisch
- hoch

Dadurch wird keine falsche Genauigkeit erzeugt.

### Einnahmen

Einnahmen koennen entstehen aus:

- Verkauf von Tieren
- Verkauf von Ernte oder Waren
- Pacht- und Lehenseinnahmen
- Amtssold
- Handelsspanne
- Gildenanteilen
- Minen, Zollen, Muehlen, Marktgebuehren
- Naturalien, sofern sie Lebenshaltungskosten ersetzen oder verkaufbar sind

### Betriebskosten

Betriebskosten koennen entstehen aus:

- Futter
- Stallung
- Hufpflege
- Tierarzt/Heilmittel
- Saatgut
- Werkzeug
- Transport
- Reparaturen
- Personal
- Lagerung
- Verluste durch Krankheit, Alter, Unfall oder Diebstahl

### Haushaltskosten

Haushaltskosten koennen entstehen aus:

- Essen und Trinken
- Kleidung
- Brennstoff
- Unterkunft oder Gebaeudeunterhalt
- einfache Reparaturen
- Reisen
- kleine Abgaben und Gebuehren
- Festtage, Gastpflichten, Kirche, soziale Verpflichtungen

### Standeskosten

Standeskosten sind besonders wichtig, weil hoher Rang nicht nur Einnahmen bringt, sondern auch Ausgaben erzwingt.

Ritter:

- Pferd
- Ruestung
- Waffen
- Schild/Lanze/Ersatzteile
- Knappe oder Knecht
- Stallung und Futter
- Turnier- oder Kriegskosten
- angemessene Kleidung

Ritterherr/Ritterfuerst/Baron/Graf/Koenig:

- Hofhaltung
- Wachen und Soldaten
- Beamte und Schreiber
- Burg-, Strassen-, Bruecken- oder Stadtunterhalt
- Geschenke und Patronage
- Feste
- diplomatische Reisen
- religioese und oeffentliche Stiftungen
- Reserve fuer Krieg, Missernte, Brand, Seuche

Amtstraeger:

- Gehalt oder Amtsanteil
- Schreibmaterial
- Boten
- Dienstkleidung
- Repräsentation
- ggf. eigenes Personal

## Abgabenmodell

Standard-Abgaben:

- Kirchenzehnt
- Pacht/Lehensanteil
- Naturalabgaben
- Sonderpflichten
- Militaer- oder Dienstpflichten

Fuer die erste Version:

- Prozentuale Abgaben werden standardmaessig auf Ueberschuss nach direkten Betriebskosten gerechnet.
- Wenn eine Abgabe eindeutig auf Bruttoeinnahmen gerechnet werden soll, muss das im Szenario stehen.
- Naturalabgaben werden als eigener Posten gefuehrt, nicht heimlich in Geld umgerechnet, ausser ein Geldwert ist angegeben.

## Beispiel: Pferdezuechterfamilie

Wichtige Regel:

Ein Zuechter verkauft nicht den gesamten Bestand. Der Bestand ist Kapital, nicht Jahresumsatz.

Zu unterscheiden:

- Zuchtbestand bleibt erhalten.
- Jungtiere/Fohlen werden teilweise verkauft.
- besonders gute Tiere werden fuer die Zucht behalten.
- Elitepferde wie Ceffyl sind seltene Hochwertverkaeufe.
- Hest und Rhyfel erzeugen regelmaessigere, aber niedrigere Einnahmen.
- Futter, Stall, Weide, Pflege, Arbeitskraft und Verluste sind erhebliche Kosten.
- Adel und Kirche nehmen Abgaben.

Fuer Ceffyl/Rhyfel/Hest:

```text
Ceffyl: 5.000-35.000 Kupfertaler
Rhyfel: 800-4.000 Kupfertaler
Hest: 300-1.000 Kupfertaler
```

Falls der Nutzer wie im Beispiel sagt:

```text
Ceffyl-Bestand: 2-4 Tiere
Rhyfel/Hest-Bestand: zusammen 20-30 Tiere
ein Teil geht an den Adel
10% Gewinn an Adel
10% Gewinn an Kirche
```

dann soll die KI nicht stumpf `30 Pferde * Maximalpreis` rechnen, sondern:

- Verkaufsquote pro Jahr schaetzen
- Preisfaktor fuer Jungtiere anwenden
- Rueckhaltung fuer Zuchtlinien abziehen
- Eliteverkauf als seltenen Jahresfall behandeln
- Abgaben nach Betriebskosten abziehen
- am Ende Lebensstandard bewerten

## Architekturvorschlag

Feature-Ordner spaeter:

```text
AleriaAlmanach/modules/economy-calculator/
  economy-currency.js
  economy-price-index.js
  economy-profiles.js
  economy-scenarios.js
  economy-calculator.js
  economy-ai-context.js
  economy-ui.js
  economy-events.js
  economy-storage.js
  economy-calculator.css
```

Verantwortlichkeiten:

| Modul | Verantwortung |
| --- | --- |
| `economy-currency.js` | Waehrungsumrechnung, Formatierung, Preistext-Parsing |
| `economy-price-index.js` | Leseschicht auf Item- und Gueterdatenbank, Preisnormalisierung |
| `economy-profiles.js` | Startprofile fuer Bauer, Ritter, Amtstraeger, Adel usw. |
| `economy-scenarios.js` | Szenario-Datenmodell, Vorlagen, Validierung |
| `economy-calculator.js` | harte Berechnung von Einnahmen, Kosten, Abgaben, Netto |
| `economy-ai-context.js` | kompakten AleriaGPT-Kontext bauen |
| `economy-ui.js` | Panel, Formular, Ergebnisansicht |
| `economy-events.js` | Event Delegation, data-action-Verarbeitung |
| `economy-storage.js` | lokale Szenario-Speicherung und spaeter Firebase |
| `economy-calculator.css` | isolierte Styles fuer das Tool |

Keine Sammeldatei `utils.js`.

## UI-Idee

Der Kalkulator kann spaeter als Werkzeug aus Sidebar oder Archiv-Tools geoeffnet werden.

Basisansicht:

- Profil-Auswahl
- Szenario-Name
- Haushalt
- Besitz
- Produktion/Einnahmen
- Ausgaben
- Abgaben
- Ergebnis
- AleriaGPT-Einschaetzung

Wichtige Controls:

- Profil-Dropdown
- Preisquellen-Suche aus Itemdatenbank
- wiederholbare Zeilen fuer Besitz/Einnahmen/Kosten
- Umschalter niedrig/typisch/hoch
- Button "Mit AleriaGPT auswerten"
- Button "Szenario speichern"
- Button "Als Text exportieren"

## AleriaGPT-Anbindung

Empfohlen wird ein eigener Antwortmodus:

```text
responseMode: economy-calculation
answerStyle: deep
```

Der bestehende Worker kann spaeter fuer diesen Modus einen eigenen Promptzweig erhalten. Dadurch bleibt der normale Chat-Prompt unveraendert.

Der Request an AleriaGPT sollte enthalten:

- Nutzerfrage
- Waehrungsregeln
- berechnete Kernzahlen
- verwendete Preisquellen
- Szenarioannahmen
- fehlende Daten
- Ergebnisbereiche niedrig/typisch/hoch

Die KI soll keine Rohdatenbank mit hunderten Items bekommen, sondern nur die fuer das Szenario relevanten Werte plus wenige Vergleichswerte.

## Masterprompt V1

```text
Du bist AleriaGPT im Modus "Wirtschafts- und Lebensstandard-Kalkulator".

Deine Aufgabe ist es, auf Basis der gelieferten Wirtschaftsdaten eine plausible, nachvollziehbare und vorsichtige Einschaetzung zu Einkommen, Ausgaben, Abgaben, Besitzstand, Lebensstandard und Kaufkraft einer Person, Familie, Institution oder Herrschaft in Aleria zu erstellen.

WAEHRUNG:
- Rechne intern immer in Kupfertalern.
- 1 Goldtaler = 1.000 Kupfertaler.
- 1 Silbertaler = 100 Kupfertaler.
- 10 Silbertaler = 1 Goldtaler.
- 1 Kupfertaler = 100 Pfennig.
- 1 Pfennig = 0,01 Kupfertaler.
- Wenn eine Quelle nur "Taler" sagt, behandle es als Kupfertaler, ausser der Kontext sagt ausdruecklich Gold/Silber.

DATENBINDUNG:
- Nutze primaer die gelieferten Gueter-, Tier-, Pferde-, Speisen-, Ausruestungs- und Luxuspreise.
- Erfinde keine festen Preise, wenn ein passender Datenpunkt vorhanden ist.
- Wenn ein Preis fehlt, nutze den naechsten plausiblen Vergleichswert und markiere ihn klar als Annahme.
- Gib keine Scheingenauigkeit aus. Bei unsicheren Bereichen arbeite mit niedrig / typisch / hoch.
- Trenne harte Berechnung von Interpretation.

RECHENLOGIK:
1. Bestimme Haushaltstyp und sozialen Rang.
2. Ermittle alle Einnahmequellen:
   - Verkauf von Waren, Tieren, Pferden, Ernten oder Handwerksguetern.
   - Pacht, Abgaben, Lehensrechte, Sold, Amtseinkommen, Handelsgewinne.
   - Naturalien nur als Geldwert zaehlen, wenn sie den Lebensunterhalt ersetzen oder verkauft werden.
3. Ermittle direkte Betriebskosten:
   - Futter, Stallung, Pflege, Saatgut, Werkzeuge, Reparaturen, Transport, Personal.
   - Bei Zuchtbetrieben: Nicht jedes Tier wird jaehrlich verkauft. Zuchtbestand, Jungtiere, Eigenbedarf, Ausfaelle und Rueckhaltung fuer Blutlinien beruecksichtigen.
4. Ermittle Haushaltskosten:
   - Nahrung, Kleidung, Unterkunft, Heizung, einfache Reparaturen, Reisen, Gaeste, religioese und soziale Pflichten.
5. Ermittle Standeskosten:
   - Ritter: Pferd, Ruestung, Waffen, Knappen/Knechte, Stall, Turnier-/Kriegskosten.
   - Adel: Hofhaltung, Wachen, Beamte, Geschenke, Feste, Strassen/Burg/Stadtunterhalt.
   - Amtstraeger: Gehalt, Dienstkosten, Schreiber, Kleidung, Repraesentation.
6. Ziehe Abgaben ab:
   - Adelspacht, Kirchenzehnt, Lehenspflichten, Sonderabgaben.
   - Wenn unklar: Zehnt auf erwirtschafteten Ueberschuss nach direkten Betriebskosten rechnen und Annahme nennen.
7. Berechne:
   - Bruttoeinnahmen jaehrlich.
   - Betriebskosten jaehrlich.
   - Abgaben jaehrlich.
   - Haushalts-/Standeskosten jaehrlich.
   - verfuegbares Netto jaehrlich, monatlich und taeglich.
8. Bewerte:
   - Kann diese Person/Familie gut leben?
   - Welche Gueter sind alltaeglich, welche Luxus?
   - Welche Anschaffungen sind realistisch?
   - Wie anfaellig ist das Modell gegen Krankheit, Missernte, Krieg, Tierverlust oder Preisschwankungen?

AUSGABEFORMAT:
Gib zuerst eine kurze klare Einschaetzung.
Danach:
- Annahmen
- Einnahmen
- Ausgaben
- Abgaben
- Netto/Kaufkraft
- Lebensweise
- Plausibilitaetspruefung
- Unsicherheiten

Alle Geldwerte immer zusaetzlich lesbar formatieren:
Beispiel: 4.350 Kupfer = 4 Gold, 3 Silber, 50 Kupfer.

Wenn der Nutzer eine konkrete Familie, ein Amt oder einen Rang beschreibt, rechne genau dieses Szenario. Wenn Angaben fehlen, ergaenze nur minimale plausible Annahmen und markiere sie.
```

## Ergebnisformat des Rechners

Der Rechner sollte vor der KI-Auswertung ein klares Ergebnisobjekt bauen.

```js
{
  currency: {
    base: "copper",
    display: "mixed"
  },
  totals: {
    grossIncomeYear: { low: 0, typical: 0, high: 0 },
    operatingCostsYear: { low: 0, typical: 0, high: 0 },
    obligationsYear: { low: 0, typical: 0, high: 0 },
    householdCostsYear: { low: 0, typical: 0, high: 0 },
    netYear: { low: 0, typical: 0, high: 0 },
    netMonth: { low: 0, typical: 0, high: 0 },
    netDay: { low: 0, typical: 0, high: 0 }
  },
  lines: {
    income: [],
    costs: [],
    obligations: [],
    assumptions: []
  },
  warnings: []
}
```

## Plausibilitaetsregeln

Der Kalkulator sollte Warnungen erzeugen, bevor AleriaGPT antwortet.

Beispiele:

- Verkaufte Tiere pro Jahr uebersteigen plausiblen Nachwuchs.
- Elitepferde werden als Massenware verkauft.
- Keine Futterkosten fuer grossen Tierbestand eingetragen.
- Ritterprofil ohne Pferd oder Ruestung.
- Adeliger Rang ohne Hofhaltungs- oder Personalkosten.
- Einkommen hoch, aber Abgaben fehlen.
- Preisquelle ist unsicher oder nur analog abgeleitet.

## Speicherstrategie

Erste Version:

- Szenarien lokal im Browser speichern.
- Keine Firebase-Pflicht.
- Export/Import als JSON.

Spaeter:

- optionale Firebase-Speicherung fuer gemeinsame Weltwirtschaftsprofile.
- gespeicherte Standardprofile fuer Kampagne/Region.
- wiederverwendbare Szenario-Vorlagen.

## Testplan spaeter

Mindestens pruefen:

- Waehrungsumrechnung Pfennig/Kupfer/Silber/Gold
- Preisparser fuer `P`, `K`, `S`, `G`, `Pfennig`, `Kupfertaler`, `Silbertaler`, `Goldtaler`
- Preisbereiche niedrig/typisch/hoch
- Rossmarkt-Preise aus Markdown-Kontext
- Vieh-Unterhalt pro Woche/Monat/Jahr
- Taverne-Speisen in Pfennig
- Waffen/Ruestungen als Kapitalgueter
- Pferdezuechter-Szenario mit Ceffyl/Rhyfel/Hest
- Ritter-Szenario mit Pferd, Ruestung, Waffe, Standeskosten
- Baron/Graf-Szenario mit Untergebenen, Abgaben und Hofhaltung
- AleriaGPT-Auswertung ohne erfundene fixe Preise

## Offene Fragen

- Sollen "Taler" im Rossmarkt dauerhaft als Kupfertaler gelten?
- Gibt es feste regionale Preisfaktoren, z. B. Stadt, Dorf, Krieg, Hungerwinter, Hafenstadt?
- Wie werden Naturalabgaben bewertet?
- Wie hoch sind typische Lohnkosten fuer Knechte, Schreiber, Wachen, Knappen?
- Gibt es kanonische Regeln fuer Lehensabgaben ausser dem Zehnt?
- Soll ein Ritter Sold erhalten oder nur aus Besitz/Pacht leben?
- Welche Kosten sind Pflicht fuer Amtstraeger wie Kaemmerer oder Marschall?
- Soll der Kalkulator auch Vermoegen und nicht nur Einkommen schaetzen?

## Umsetzungsphasen

### Phase 1: Dokumentation und Datenanalyse

- dieses Plan-Dokument anlegen
- relevante Preisquellen pruefen
- Preisparser-Anforderungen festlegen
- fehlende Wirtschaftsgrundwerte sammeln

### Phase 2: Waehrung und Preisindex

- `economy-currency.js`
- Preistext zu Kupfertalern
- gemischte Ausgabe Gold/Silber/Kupfer/Pfennig
- Preisindex aus Itemdatenbank lesen

### Phase 3: Rechnerkern

- Szenario-Modell
- Einnahmen/Kosten/Abgaben
- niedrig/typisch/hoch
- Warnungen und Plausibilitaet

### Phase 4: UI

- Tool-Panel
- Profil-Auswahl
- wiederholbare Besitz-/Einnahmen-/Kostenzeilen
- Ergebnisansicht
- Export/Import

### Phase 5: AleriaGPT

- `economy-ai-context.js`
- eigener `responseMode: economy-calculation`
- Worker-Promptzweig
- Ergebnisinterpretation

### Phase 6: Gespeicherte Profile

- Standardprofile fuer Ränge und Berufe
- regionale Modifikatoren
- geteilte Vorlagen

