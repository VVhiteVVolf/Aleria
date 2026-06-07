# Zukunftsplan: Anzeigetafeln

Stand: 2026-06-07

Dieser Plan beschreibt, wie der Ordner `Anzeigetafeln` langfristig stabil, erweiterbar und ortsseitenfaehig gemacht wird. Die bestehende Morddyn-Tafel gilt dabei als Beispieltafel. Ziel ist dieselbe Grundlogik wie bei `Karten`: viele zukuenftige Inhalte, aber keine tausenden gepflegten HTML-Kopien.

## Zielbild

Die Anzeigetafeln sollen spaeter ueber Ortsseiten erreichbar sein, nicht ueber eine eigene Index-Seite.

Beispiel:

```txt
Ortsseite Morddyn
  -> Karte Morddyn
  -> Anzeigetafel Morddyn
```

Dafuer braucht `Anzeigetafeln` keine oeffentliche Uebersichtsseite. Es braucht aber eine zentrale technische Ladehuelle, stabile Links und saubere Einzeldaten pro Tafel.

Ziel-Link fuer eine Tafel:

```txt
Anzeigetafeln/tafel.html?tafel=cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn
```

Der Link bleibt stabil. Die eigentliche Tafel wird ueber eine Registry geladen. Jede Tafel besitzt weiterhin eigene Firebase-Daten, eigene Bildquellen und eigene Ortszuordnung.

## Aktuelle Diagnose

Gesamtstand: **59% fertig**

Das Fundament ist gut, aber noch nicht final skaliert.

| Bereich | Stand | Bewertung |
| --- | ---: | --- |
| Bestehende Morddyn-Tafel | 78% | Funktioniert als Beispiel und besitzt eigene Config, Bilder und Firebase-ID. |
| Gemeinsame Feature-Module | 72% | Viele Module sind bereits sauber ausgelagert: Pins, Zettel, Kategorien, LSB, Board, Data Manager. |
| Zukunftsfaehige Linkstruktur | 35% | Hierarchische Ordner existieren, aber es gibt noch keine zentrale Registry fuer stabile Links. |
| Vermeidung vieler HTML-Dateien | 25% | Aktuell gibt es noch Template-HTML und Morddyn-HTML als Kopien. Das muss auf eine zentrale Shell umgestellt werden. |
| Browserbasierte Bildpflege | 20% | Board- und Markerbilder kommen aktuell aus Config-Dateien. Imgur-Links sollten spaeter direkt im Bearbeitungsmodus setzbar sein. |
| Firebase-Trennung pro Tafel | 80% | Das Prinzip ist richtig: jede Tafel braucht eine eigene `firebase.docId`. |
| Validierung / Ratifikation | 10% | Es gibt noch kein Werkzeug, das IDs, Links, Firebase-DocIds und Bildquellen prueft. |
| Dokumentation | 55% | README und Architektur existieren, aber der finale Skalierungsweg fehlt bisher. |

## Wichtigste Architekturentscheidung

Es soll keine Index-Seite fuer Anzeigetafeln entstehen.

Trotzdem braucht es eine zentrale Datei:

```txt
Anzeigetafeln/tafel.html
```

Diese Datei ist keine Inhaltsuebersicht, sondern die technische Anzeigehuelle. Sie liest den Parameter `?tafel=...`, sucht die passende Tafel in `tafeln.registry.js` und laedt danach Titel, Bilder, Firebase-ID und Ortsdaten.

Dadurch entstehen spaeter nicht:

```txt
MorddynAnzeigetafel.html
VortigernsRuhAnzeigetafel.html
SonnenkuesteAnzeigetafel.html
...
```

Sondern:

```txt
tafel.html?tafel=...
```

## Zielstruktur

Empfohlene Struktur:

```txt
Anzeigetafeln/
  tafel.html
  tafeln.registry.js
  README.md
  ARCHITEKTUR.md
  ZUKUNFTSPLAN.md
  assets/
    css/
    js/
  tools/
    validate-tafeln-structure.mjs
  Cenyr/
    celtigerns-wacht/
      baronie-gwendolyns-ufer/
        morddyn/
          Bilder/
            MorddynTafel.png
            MorddynTafelMarker.png
          tafel.config.js       # spaeter optional oder Migrationsrest
```

Langfristig soll die Registry die fuehrende Quelle sein. Einzelne alte `tafel.config.js`-Dateien koennen fuer Kompatibilitaet bleiben, sollten aber nicht mehr der normale Weg fuer neue Tafeln sein.

## Registry-Konzept

`tafeln.registry.js` wird die zentrale Liste aller bekannten Tafeln.

Beispiel:

```js
window.TAFEL_REGISTRY = {
  "cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn": {
    status: "active",
    title: "Anzeigetafel Morddyn",
    hierarchy: {
      kingdom: "Cenyr",
      county: "Celtigerns Wacht",
      barony: "Gwendolyns Ufer",
      settlement: "Morddyn"
    },
    images: {
      board: "Cenyr/celtigerns-wacht/baronie-gwendolyns-ufer/morddyn/Bilder/MorddynTafel.png",
      marker: "Cenyr/celtigerns-wacht/baronie-gwendolyns-ufer/morddyn/Bilder/MorddynTafelMarker.png"
    },
    firebase: {
      collection: "anzeigetafeln",
      docId: "cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn"
    }
  }
};
```

Jede Tafel braucht zwingend:

- eine eindeutige Tafel-ID
- eine eindeutige `firebase.docId`
- eine Ortszuordnung
- Bildquellen fuer Tafelbild und Markerbild
- einen stabilen Link fuer spaetere Ortsseiten

## Neue Tafeln in Zukunft

Neue Tafeln sollen spaeter nicht durch Kopieren einer HTML-Datei entstehen.

Stattdessen:

1. Tafel-ID festlegen.
2. Ortszuordnung in der Registry eintragen.
3. Firebase-DocId vergeben.
4. Link in der Ortsseite verwenden.
5. Im Bearbeitungsmodus Tafelbild und Markerbild per Imgur-Link setzen.
6. Inhalte direkt auf der Tafel pflegen.
7. Validator laufen lassen.

Beispiel-Link:

```txt
Anzeigetafeln/tafel.html?tafel=cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn
```

## Phasenplan bis Finale

### Phase 1: Bestand sichern und Referenz definieren

Zielstand danach: **62%**

- Morddyn als offizielle Beispieltafel dokumentieren.
- Pruefen, welche Teile der Config wirklich pro Tafel individuell sind.
- Alte Template-Logik nicht entfernen, bevor die zentrale Shell funktioniert.
- Bild- und Firebase-Pfade der Morddyn-Tafel als Referenz festhalten.

Ergebnis:

Morddyn bleibt stabil und dient als Testfall fuer alle spaeteren Tafeln.

### Phase 2: Registry einfuehren

Zielstand danach: **70%**

Status: **umgesetzt fuer Morddyn**

- `tafeln.registry.js` anlegen.
- Morddyn als erste aktive Tafel eintragen.
- Felder fuer `status`, `title`, `hierarchy`, `images`, `firebase` definieren.
- Zukuenftige Tafeln duerfen als `planned` oder `editableDraft` eingetragen werden.

Ergebnis:

Es gibt erstmals stabile Tafel-Links, auch wenn einzelne Tafeln noch keine Bilder haben.

### Phase 3: Zentrale Tafel-Shell bauen

Zielstand danach: **78%**

Status: **umgesetzt als `tafel.html`**

- `Anzeigetafeln/tafel.html` als zentrale Ladehuelle erstellen.
- `?tafel=...` aus der URL lesen.
- Passenden Registry-Eintrag laden.
- Daraus `window.TAFEL_CONFIG` erzeugen.
- Danach die bestehende App-Logik starten.

Ergebnis:

Eine HTML-Datei kann alle Tafeln laden.

### Phase 4: Morddyn auf die zentrale Shell migrieren

Zielstand danach: **83%**

Status: **umgesetzt**

- Morddyn ueber `tafel.html?tafel=cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn` lauffaehig machen.
- Alte `MorddynAnzeigetafel.html` nur als Kompatibilitaet oder Weiterleitung behalten.
- Sicherstellen, dass bestehende Firebase-Daten nicht verloren gehen.

Ergebnis:

Die erste echte Tafel laeuft ueber das neue Zukunftsmodell.
Der alte Morddyn-HTML-Pfad bleibt als schlanke Weiterleitung erhalten.

### Phase 5: Imgur-Bildlinks im Bearbeitungsmodus

Zielstand danach: **87%**

Status: **umgesetzt fuer Tafelbild und Markerbild**

- Im Bearbeitungsmodus eine Bildverwaltung ergaenzen.
- Tafelbild und Markerbild direkt im Browser setzen.
- Externe HTTPS-Links wie Imgur erlauben.
- Bildlinks pro `firebase.docId` speichern, nicht global.
- Registry-Bilder bleiben Fallback, falls noch keine gespeicherten Links existieren.

Ergebnis:

Neue Tafeln koennen vorbereitet werden, ohne jedes Mal die IDE zu oeffnen.

### Phase 6: Ratifikation per Validator

Zielstand danach: **91%**

Status: **umgesetzt**

- `tools/validate-tafeln-structure.mjs` anlegen.
- Pruefen:
  - jede Tafel-ID ist eindeutig
  - jede `firebase.docId` ist eindeutig
  - aktive Tafeln haben Bildquellen
  - lokale Bildpfade existieren
  - HTTPS-Bildlinks sind erlaubt
  - geplante Tafeln duerfen Platzhalter nutzen
  - Hierarchie-Felder sind vollstaendig

Ergebnis:

Neue Tafeln werden nicht nur angelegt, sondern auch ratifiziert.
Geplante oder editierbare Tafeln koennen mit Platzhalterflaeche starten und spaeter im Browser mit Bildlinks befuellt werden.

### Phase 7: Dokumentation und Arbeitsablauf finalisieren

Zielstand danach: **94%**

Status: **umgesetzt**

- README aktualisieren.
- `NEUE-TAFEL.md` oder Abschnitt im README erstellen.
- Klar beschreiben:
  - wie eine Tafel-ID gebildet wird
  - wie eine Tafel verlinkt wird
  - wie Imgur-Bilder gesetzt werden
  - wie Firebase-Daten getrennt bleiben
  - wie der Validator ausgefuehrt wird

Ergebnis:

Auch in Monaten ist noch klar, wie neue Tafeln korrekt entstehen.

### Phase 8: Finaltest

Zielstand danach: **95%**

Status: **umgesetzt**

- Morddyn lokal im Browser testen.
- Eine geplante Dummy-Tafel testen.
- Bildlink-Speicherung testen.
- Firebase-Trennung pruefen.
- Validator ausfuehren.
- Alte HTML-Kompatibilitaet pruefen.

Ergebnis:

Der Ordner ist fuer zukuenftige Ortsseiten vorbereitet.

Die letzten 5% bleiben bewusst fuer die spaetere echte Ortsseiten-Integration offen.

## Finale Definition

Der Ordner `Anzeigetafeln` gilt als final vorbereitet, wenn:

- `tafel.html?tafel=...` jede registrierte Tafel laden kann.
- Morddyn als aktive Referenztafel funktioniert.
- geplante Tafeln stabile Links besitzen.
- Tafelbild und Markerbild im Bearbeitungsmodus per Imgur-Link setzbar sind.
- jede Tafel eigene Firebase-Daten nutzt.
- ein Validator fehlerhafte IDs, Pfade und doppelte DocIds findet.
- README und Architektur den neuen Ablauf erklaeren.
- keine neuen Tafel-HTML-Kopien mehr noetig sind.

## Was bewusst nicht gebaut wird

- keine oeffentliche Index-Seite fuer alle Tafeln
- keine tausenden Einzel-HTML-Dateien
- keine neue zentrale Monsterdatei
- keine Kopie der gesamten Morddyn-Tafel pro Ort
- keine GitHub-Pflicht fuer Tafelbilder, wenn Imgur-Links ausreichen

## Naechster sinnvoller Schritt

Als naechstes sollte Phase 2 umgesetzt werden:

1. `tafeln.registry.js` anlegen.
2. Morddyn als aktive Referenztafel eintragen.
3. Den stabilen Morddyn-Link vorbereiten.
4. Danach erst `tafel.html` als zentrale Ladehuelle bauen.

Aktueller Gesamtfortschritt: **95%**

Klares Finale: **95% erreicht. Die restlichen 5% gehoeren zur spaeteren Ortsseiten-Integration.**
