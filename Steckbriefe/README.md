# Steckbrief-System

Die Vorlage ist jetzt in drei Ebenen getrennt:

- `SteckbriefVorlage.html`: schlanke HTML-Hülle für die Vorschau der Vorlage.
- `assets/css/steckbrief.css`: gemeinsames Layout für alle Steckbriefe.
- `assets/js/steckbrief.js`: gemeinsame Render-Logik.
- `data/steckbrief-vorlage.data.js`: austauschbare Daten der aktuellen Vorlage.
- `_template/SteckbriefTemplate.html`: Kopiervorlage für neue Charakterordner.

## Neue Charaktere

Für einen neuen Charakter wird ein eigener Ordner angelegt und eine eigene `charakter.data.js` gepflegt. Die HTML-Datei bleibt fast unverändert und nutzt weiter dieselbe CSS- und JS-Basis. Die Kopiervorlage nutzt `/Steckbriefe/assets/...`, damit sie auch tief unter Land, Grafschaft, Baronie, Clan, Ort oder Familie funktioniert.

Beispiele für Ordnerlogik:

```text
Steckbriefe/
  Cenyr/
    Celtigerns-Wacht/
      Clan-Morddyn/
        name-nachname/
          index.html
          charakter.data.js
```

```text
Steckbriefe/
  Cenyr/
    Celtigerns-Wacht/
      Baronie-Gwendolyns-Ufer/
        Herrschaft-Morddyn/
          Stadt-Morddyn/
            Dorf-Beispiel/
              Familie-Beispiel/
                name-nachname/
                  index.html
                  charakter.data.js
```

Die inhaltliche Einordnung steht zusätzlich in `hierarchie` in der Daten-Datei. Dadurch kann ein Charakter unabhängig von der physischen Ordnertiefe sauber Land, Grafschaft, Baronie, Ort, Clan oder Familie zugeordnet werden.
