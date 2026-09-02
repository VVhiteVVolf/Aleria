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
- das Tafelbild im eigenen `Bilder`-Ordner oder eine im Editor gepflegte HTTPS-Bildquelle

Die Konfiguration enthält nur die Tafeldaten, insbesondere keine Minimap und kein Markerbild:

```js
window.TAFEL_CONFIG = {
  boardId: "beispiel-anzeigetafel",
  title: "Anzeigetafel — Beispielort",
  documentTitle: "Anzeigetafel Beispielort - Aleria",
  images: { board: "Bilder/tafel.webp" },
  storage: { dataPath: "Cenyr/.../beispielort/data.json" }
};
```

## 3. Registry-Eintrag ergänzen

In `tafeln.registry.js` werden ID, Hierarchie, Konfiguration, Tafelbild, Datendatei und stabiler Link eingetragen. `editableDraft: true` erlaubt bei einer geplanten Tafel einen Platzhalter, bis das Tafelbild im Editor gesetzt wurde.

## 4. Inhalte bearbeiten

1. Tafel-Link öffnen.
2. `Bearbeiten` aktivieren.
3. Bei Bedarf das einzige Tafelbild über `Tafelbild` setzen.
4. Mit `Aushang setzen` Quest, Steckbrief oder einen anderen Aushang auf der Tafel platzieren.
5. Inhalte werden automatisch als lokaler Entwurf gesichert.
6. Erst mit `Auf GitHub veröffentlichen` wird der Stand online versioniert.

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
