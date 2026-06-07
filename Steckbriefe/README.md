# Steckbrief-System

Die Steckbriefe sind auf eine gemeinsame technische Basis ausgelegt:

- `SteckbriefVorlage.html`: schlanke HTML-Huelle fuer die Vorschau der Vorlage.
- `steckbrief.html`: zentrale Zielseite fuer registrierte Charaktere.
- `steckbriefe.registry.js`: Registry fuer stabile Charakter-Links und Datenpfade.
- `assets/css/steckbrief.css`: gemeinsames Layout fuer alle Steckbriefe.
- `assets/js/steckbrief.js`: gemeinsame Render-Logik.
- `assets/js/steckbrief-loader.js`: laedt per URL-ID den richtigen Charakterdatensatz.
- `data/steckbrief-vorlage.data.js`: gemeinsame Basisdaten fuer neue Charaktere.
- `_template/SteckbriefTemplate.html`: alte Kopiervorlage fuer Legacy-Einzelseiten.

## Neue Charaktere

Fuer einen neuen Charakter wird ein eigener Ordner angelegt und eine eigene `charakter.data.js` gepflegt. Es soll aber keine neue HTML-Datei mehr pro Charakter entstehen. Der oeffentliche Link zeigt auf die zentrale Seite:

```text
/Steckbriefe/steckbrief.html?id=cenyr-celtigernswacht-adelshaeuser-hausdraig-gawain-draig
```

Der Charakter wird in `steckbriefe.registry.js` registriert. Die Registry enthaelt ID, Namen, Datenpfad, optionale Legacy-HTML-Datei und die grobe Hierarchie.

Beispiel fuer die Ordnerlogik:

```text
Steckbriefe/
  Land/
    Cenyr/
      CeltigernsWacht/
        Adelshaeuser/
          HausDraig/
            GawainDraig/
              charakter.data.js
```

```text
Steckbriefe/
  Land/
    Cenyr/
      CeltigernsWacht/
        BaronieGwendolynsUfer/
          HerrschaftMorddyn/
            StadtMorddyn/
              FamilieBeispiel/
                name-nachname/
                  charakter.data.js
```

Die inhaltliche Einordnung steht zusaetzlich in `hierarchie` in der Daten-Datei. Dadurch kann ein Charakter unabhaengig von der physischen Ordnertiefe sauber Land, Grafschaft, Baronie, Ort, Clan oder Familie zugeordnet werden.

## Registry-Strategie

Aktuell gibt es eine zentrale Registry als stabilen Einstiegspunkt. Wenn der Ordner stark waechst, kann diese Datei spaeter in regionale Registry-Shards aufgeteilt werden.

Sinnvolle Shards:

- Land oder Koenigreich
- Grafschaft oder grosse Region
- Haus, Clan, Orden oder Organisation
- Ort, wenn dort viele Figuren liegen

Nicht sinnvoll:

- eine Registry pro einzelner Figur
- eine riesige dauerhaft manuell gepflegte Datei fuer hunderte Figuren ohne Unterteilung

## Validierung

Nach Registry-Aenderungen:

```bash
node Steckbriefe/tools/validate-steckbriefe-structure.mjs
```

Der Validator prueft:

- eindeutige IDs
- vorhandene Datenpfade
- Abgleich von Registry-ID und `meta.id`
- vorhandene Namen
