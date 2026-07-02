# Neue Zunft, Gewerbe oder Standortseite anlegen

Diese Vorlage ist fuer kleinere Orte innerhalb einer Siedlung oder eines Bannkreises gedacht:
Geschaefte, Werkstaetten, Kontore, Gilden, Zuenfte, Orden, Tavernen, Institutionen und aehnliche POI.

## Technische Vorlage

- Shell: `/Orte/zunft.html`
- Template-Datei: `Orte/_template/ZunftsTemplate.html`
- Vorlagendaten: `Orte/data/zunfts-vorlage.data.js`
- Registry-ID der Vorlage: `zunfts-vorlage`

Aufruf:

```text
/Orte/zunft.html?id=zunfts-vorlage
```

## Ordnerstruktur

Eine Einrichtung innerhalb einer Stadt liegt unter der Stadt:

```text
Orte/
  Koenigreich_Cenyr/
    Grafschaft_Celtigerns_Wacht/
      Baronie_Llamreis_Ankunft/
        Herrschaft_Haus_Wyrm/
          Lysfaens_Bannkreis/
            Lysfaen/
              Zuenfte/
                <zunft-slug>/
                  ort.data.js
```

Eine Einrichtung im Bannkreis, aber ausserhalb der Stadt, liegt direkt im Bannkreis:

```text
Orte/
  Koenigreich_Cenyr/
    Grafschaft_Celtigerns_Wacht/
      Baronie_Llamreis_Ankunft/
        Herrschaft_Haus_Wyrm/
          Lysfaens_Bannkreis/
            <standort-slug>/
              ort.data.js
```

## Firebase-ID

Jede konkrete Einrichtung braucht eine eigene stabile Dokument-ID.

Empfohlenes Muster:

```text
<orts-id>__zunft__<zunft-slug>
```

Beispiel:

```text
lysfaen__zunft__kontor-von-glyndraith
```

Damit bleiben Stadtseite, Szenen, Inline-Inhalte und einzelne Einrichtungen sauber getrennt.
