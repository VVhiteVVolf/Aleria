# Neue Anzeigetafel anlegen

Neue Tafeln verwenden immer die zentrale Shell:

```txt
tafel.html?tafel=<tafel-id>
```

Es wird keine eigene HTML-Datei kopiert.

## 1. Tafel-ID festlegen

Die stabile ID folgt der Orts-Hierarchie, kleingeschrieben und mit Bindestrichen:

```txt
<koenigreich>-<grafschaft>-<herrschaft>-<ort>-anzeigetafel
```

## 2. Ordner und Dateien anlegen

Eine aktive Tafel braucht:

- `tafel.config.js`
- `data.json`
- das gemeinsame leere Brett oder ein eigenes **leeres** Tafelbild

`_template/tafel.config.js` und `_template/data.json` kopieren und IDs/Pfade
ersetzen. Neue Tafeln beginnen mit einem vollständigen leeren Zustand, nicht
mit `state: null`; ein Firebase-Altimport ist nur für tatsächlich alte Tafeln nötig.

Die Konfiguration enthält nur die Tafeldaten, insbesondere keine Minimap und kein Markerbild:

```js
window.TAFEL_CONFIG = {
  boardId: "beispiel-anzeigetafel",
  title: "Anzeigetafel — Beispielort",
  documentTitle: "Anzeigetafel Beispielort - Aleria",
  images: { board: "assets/images/boards/town-square-v1.png" },
  storage: { dataPath: "Cenyr/.../beispielort/data.json" }
};
```

Der gemeinsame Plakatdialog ist automatisch aktiv. Eine vorbereitete
Ortsanordnung ist optional:

```js
boardComposition: {
  background: "assets/images/boards/town-square-v1.png",
  presetPath: "Cenyr/.../beispielort/board-layout.json"
}
```

Ohne `presetPath` beginnt das Brett leer. Eine Vorlage enthält
`layout: { version: 1, posters: [...] }`; jeder `assetId` muss im gemeinsamen
`assets/data/board-art-catalog.json` existieren. Nägel bleiben sichtbar,
`pin.enabled: false` deaktiviert ausschließlich die Klickfunktion.

## 3. Registry-Eintrag ergänzen

In `tafeln.registry.js` werden ID, Hierarchie, Konfiguration, Tafelbild, Datendatei und stabiler Link eingetragen. `editableDraft: true` erlaubt bei einer geplanten Tafel einen Platzhalter, bis das Tafelbild im Editor gesetzt wurde.

## 4. Inhalte bearbeiten

1. Tafel-Link öffnen.
2. `Bearbeiten` aktivieren.
3. Bei Bedarf das einzige Tafelbild über `Tafelbild` setzen.
4. Mit `Aushang setzen` erst Plakatbild, dann Nagel und dessen Position, dann
   Inhalt wählen. Auch reine Dekoration ist möglich. Papier und Nagel bilden
   anschließend eine gemeinsam verschiebbare Einheit; Größe, Drehung und Ebene
   lassen sich im Plakatwerkzeug ändern.
5. Inhalte werden automatisch als lokaler Entwurf gesichert.
6. Erst mit `Auf GitHub veröffentlichen` wird der Stand online versioniert.

Der lokale Entwurf ist nur die noch unveröffentlichte Arbeitskopie. Das
veröffentlichte Layout samt Bildern und Nagelpositionen ist für alle Besucher
online verfügbar. Siehe [gemeinsame Plakattafeln](PLAKATTAFEL.md).

## 5. Prüfen

```bash
node Anzeigetafeln/tools/validate-tafeln-structure.mjs
```

Eine Tafel wird erst aktiv geschaltet, wenn Link, Doc-ID, Datenpfad und Ortszuordnung eindeutig sind und der Validator ohne Fehler läuft.

## Nicht machen

- keine neue große HTML-Datei kopieren
- keine Karten-, Pin-, Marker-, Minimap- oder Routenmodule einbinden
- keine Tafel-ID nachträglich ändern, sobald sie verlinkt ist
- keine GitHub-Veröffentlichung ohne Revisionsprüfung umgehen
