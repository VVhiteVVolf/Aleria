# Zukunftsplan fuer `E:\Aleria\Karten`

Stand: 2026-06-06

## Zielbild

Der Ordner `Karten` soll langfristig sehr viele Karten tragen koennen, ohne dass fuer jede Karte eine eigene HTML-Datei gepflegt werden muss.

Das Ziel ist:

- eine zentrale Karten-Shell/Vorlage
- stabile konkrete Links pro Karte
- Karten-Metadaten in einer Registry
- Kartenbilder und Kartendaten nur dort anlegen, wo die Karte wirklich existiert
- geplante Karten duerfen bereits einen Link und eine ID besitzen
- Celtigerns Wacht bleibt die Referenzkarte und dient als erstes Migrationsbeispiel

Wichtig: Die Ortsseiten existieren noch nicht und werden hier nicht vorausgesetzt. Die Kartenstruktur soll aber spaeter sauber in Ortsseiten integrierbar sein.

## Diagnose

Aktueller Gesamtstand fuer das gewuenschte Zukunftsziel: **95%**

Ausgangsdiagnose vor der Registry: **56%**

Diese Zahl bewertet nicht nur, ob Celtigerns Wacht heute funktioniert, sondern ob der Ordner fuer hunderte zukuenftige Karten vorbereitet ist.

| Bereich | Stand | Diagnose |
| --- | ---: | --- |
| Bestehende Referenzkarte | 78% | Celtigerns Wacht ist als funktionale Beispielkarte vorhanden. |
| Gemeinsame Feature-Logik | 72% | Viele Module liegen bereits in `assets/js`; das ist eine gute Grundlage. |
| Template-Wiederverwendung | 58% | Es gibt ein Template, aber der dokumentierte Prozess ist noch "kopieren pro Karte". |
| Zukunft mit vielen Karten | 32% | Noch fehlt eine zentrale Karten-Shell mit Registry-gesteuertem Laden. |
| Konkrete Links fuer geplante Karten | 15% | Es gibt noch keine Registry fuer geplante Karten-IDs und Ziel-URLs. |
| Ordner-/Hierarchiestruktur | 55% | Die Weltstruktur beginnt mit `Cenyr/celtigerns-wacht`, ist aber noch nicht verbindlich definiert. |
| Asset-Hygiene | 45% | Einige grosse Kartenbilder liegen doppelt vor. Das skaliert schlecht. |
| Validierung / Kontrollwerkzeuge | 25% | Es gibt noch keinen Karten-Validator fuer Registry, Pfade und Bilddateien. |
| Dokumentation fuer neue Karten | 60% | README und Architektur sind hilfreich, aber noch auf HTML-Kopien ausgerichtet. |

## Wichtigste Erkenntnis

Der aktuelle Ordner ist **brauchbar und nicht schlecht gebaut**, aber er ist noch nicht auf dein eigentliches Langfristziel ausgelegt.

Aktuell lautet die implizite Arbeitsweise:

```txt
Neue Karte = Template-Ordner kopieren + HTML-Datei behalten + Config anpassen
```

Das ist fuer wenige Karten okay. Fuer hunderte Karten waere es falsch, weil dann zu viele HTML-Dateien entstehen und Aenderungen an der UI/Vorlage schwer kontrollierbar werden.

Die richtige Zielrichtung lautet:

```txt
Neue Karte = Registry-Eintrag + Kartenbilder/Config nur bei existierender Karte
```

Die HTML-Oberflaeche wird zentral geladen.

## Zielarchitektur

```txt
Karten/
  karte.html
    Zentrale Karten-Shell. Sie ersetzt langfristig einzelne Karten-HTML-Dateien.

  karten.registry.js
    Zentrale Liste existierender und geplanter Karten.
    Liefert IDs, Titel, Hierarchie, Status, Links, Config-Pfade und spaetere Ortsseiten-Bezuege.

  assets/
    css/
    js/
    Gemeinsame Technik fuer alle Karten.

  _template/
    Referenz fuer Struktur und Fallback, aber nicht mehr Kopiervorlage fuer jede Karte.

  Cenyr/
    celtigerns-wacht/
      karte.config.js oder template.config.js
      Kartenbilder/
        CeltigernsWacht.png
        CeltigernsWachtRegionen.png
        CeltigernsWachtMarker.png
```

## Linkstrategie

Alle Karten erhalten stabile Links ueber eine zentrale Shell:

```txt
Karten/karte.html?map=cenyr
Karten/karte.html?map=cenyr-celtigerns-wacht
Karten/karte.html?map=cenyr-celtigerns-wacht-gwendolyns-ufer
Karten/karte.html?map=cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn
```

Das bedeutet:

- Der Link kann existieren, bevor die Karte fertig ist.
- Die Registry entscheidet, ob die Karte aktiv, geplant oder archiviert ist.
- Wenn eine Karte geplant ist, zeigt die Shell eine saubere Platzhalteransicht statt kaputter Bilder.
- Wenn eine Karte aktiv ist, laedt die Shell die passende Config und die passenden Kartenbilder.
- Spaeter koennen Ortsseiten exakt diese Links verwenden.

## Registry-Konzept

Die Registry ist kein Selbstzweck. Sie loest drei konkrete Probleme:

1. Sie erzeugt stabile Links, bevor die Karte existiert.
2. Sie verhindert tausende HTML-Dateien.
3. Sie macht Hierarchie, Status und spaetere Ortsseiten-Verknuepfungen maschinenlesbar.

Beispiel:

```js
{
  id: "cenyr-celtigerns-wacht",
  title: "Celtigerns Wacht",
  status: "active",
  type: "county",
  hierarchy: {
    kingdom: "Cenyr",
    county: "Celtigerns Wacht"
  },
  path: "Cenyr/celtigerns-wacht",
  config: "Cenyr/celtigerns-wacht/template.config.js",
  link: "karte.html?map=cenyr-celtigerns-wacht",
  firebaseDocId: "cenyr-celtigerns-wacht"
}
```

Geplante Karte:

```js
{
  id: "cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn",
  title: "Morddyn",
  status: "planned",
  type: "city",
  hierarchy: {
    kingdom: "Cenyr",
    county: "Celtigerns Wacht",
    barony: "Gwendolyns Ufer",
    city: "Morddyn"
  },
  link: "karte.html?map=cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn"
}
```

Bei `status: "planned"` muss noch kein Kartenordner existieren.

## Phasenplan

### Phase 1: Bestand absichern

Zielstand nach Phase: **60%**

- Celtigerns Wacht als Referenzkarte festhalten.
- Aktuelle Pfade, Bilder, Config und Firebase-ID dokumentieren.
- Doppelte Bilddateien markieren und spaeter gezielt bereinigen.
- Keine funktionierenden Dateien loeschen, bevor die neue Shell laeuft.

Ergebnis:

- Wir wissen exakt, was aktuell funktioniert.
- Die Referenzkarte bleibt stabil.

### Phase 2: Karten-Registry anlegen

Zielstand nach Phase: **68%**

Umsetzungsstatus: **erledigt**

- `karten.registry.js` anlegen.
- Celtigerns Wacht als `active` eintragen.
- Erste geplante Karten als `planned` eintragen, ohne Ordner oder Bilder anzulegen.
- ID-Regeln festlegen:
  - lowercase
  - Bindestriche statt Leerzeichen
  - Hierarchie von gross nach klein
  - Beispiel: `cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn`

Ergebnis:

- Konkrete Links koennen sofort geplant werden.
- Die Struktur ist maschinenlesbar.

### Phase 3: Zentrale Karten-Shell bauen

Zielstand nach Phase: **76%**

Umsetzungsstatus: **erledigt**

- `karte.html` aus der bestehenden Vorlage ableiten.
- Shell liest `?map=...`.
- Shell sucht die Karte in der Registry.
- Bei `active` laedt sie Config und Karte.
- Bei `planned` zeigt sie eine saubere Platzhalteransicht.
- Bei unbekannter ID zeigt sie einen klaren Fehler.

Ergebnis:

- Eine HTML-Datei kann viele Karten bedienen.
- Neue Karten brauchen keine eigene HTML-Kopie mehr.

### Phase 4: Celtigerns Wacht migrieren

Zielstand nach Phase: **82%**

Umsetzungsstatus: **Kern erledigt**

- `Karten/karte.html?map=cenyr-celtigerns-wacht` muss Celtigerns Wacht laden.
- Die alte Datei `CeltigernsWachtKarte.html` bleibt zunaechst als Kompatibilitaet bestehen.
- Erst wenn die neue Shell stabil ist, kann entschieden werden, ob alte Einzeldateien archiviert werden.

Ergebnis:

- Das Zukunftsprinzip ist an einer echten Karte bewiesen.

### Phase 5: Validator und Arbeitsablauf

Zielstand nach Phase: **89%**

Umsetzungsstatus: **erledigt**

- Tool anlegen, das Registry und Dateien prueft:
  - doppelte IDs
  - ungueltige Links
  - aktive Karten ohne Config
  - aktive Karten ohne Bilder
  - geplante Karten mit versehentlich fehlendem Status
  - doppelte Bilddateien
- Kurzanleitung fuer neue Karten erstellen.

Ergebnis:

- Fehler fallen frueh auf.
- Neue Karten koennen strukturiert angelegt werden.

Validator-Befund nach Phase 5:

- Fehler: 0
- Warnungen: 3
- Die Warnungen betreffen doppelte Celtigerns-Wacht-Bilddateien unter `Cenyr/Kartenbilder` und `Cenyr/celtigerns-wacht/Kartenbilder`.

### Phase 6: Asset-Hygiene

Zielstand nach Phase: **93%**

Umsetzungsstatus: **erledigt**

- Doppelte Kartenbilder auswerten.
- Gemeinsame oder falsche Ablageorte bereinigen.
- Keine Loeschung ohne vorherige Link- und Config-Pruefung.
- Optional spaeter Bildgroessen optimieren.

Ergebnis:

- Der Ordner bleibt auch bei vielen Karten handhabbar.

Aktueller Validator-Befund nach Phase 6:

- Fehler: 0
- Warnungen: 0
- Entfernt wurden nur die unreferenzierten Celtigerns-Wacht-Duplikate unter `Cenyr/Kartenbilder`.
- Die aktiven Celtigerns-Wacht-Bilder liegen weiterhin unter `Cenyr/celtigerns-wacht/Kartenbilder`.

### Phase 7: Finale Abnahme

Zielstand: **95%**

Umsetzungsstatus: **erledigt**

Eine stabile Zukunftsversion gilt als erreicht, wenn:

- `karte.html?map=cenyr-celtigerns-wacht` funktioniert.
- geplante Kartenlinks sauber angezeigt werden.
- neue Karten ohne neue HTML-Datei moeglich sind.
- Registry, Config und Bilder validiert werden koennen.
- README und Architekturplan die neue Arbeitsweise beschreiben.
- alte Einzelkarten-Dateien nicht mehr als Standardprozess benoetigt werden.

Die letzten 5% bleiben bewusst offen fuer spaetere Ortsseiten-Integration, weil diese Seiten noch nicht existieren.

Aktueller Abschlussstand:

- `karte.html?map=cenyr-celtigerns-wacht` laedt die aktive Referenzkarte.
- `karte.html?map=cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn` zeigt einen geplanten Kartenlink als sauberen Platzhalter.
- `karten.registry.js` enthaelt aktive und geplante Karten.
- `tools/validate-karten-structure.mjs` meldet aktuell 0 Fehler und 0 Warnungen.
- `README.md` und `ARCHITEKTUR.md` beschreiben die neue Arbeitsweise.
- Die alte `CeltigernsWachtKarte.html` bleibt als Kompatibilitaetsweg erhalten.

## Konkreter naechster Schritt

Der naechste Ausbau nach diesem Plan ist nicht mehr Teil der Grundsanierung. Sinnvolle Anschlussarbeiten waeren:

1. Bei Bedarf weitere geplante Karten in die Registry eintragen.
2. Wenn eine Karte wirklich erstellt wird, Ordner, Config und Kartenbilder anlegen.
3. Spaetere Ortsseiten auf `karte.html?map=<karten-id>` verlinken.
4. Alte Einzelkarten-HTML-Dateien erst archivieren, wenn alle Links auf die zentrale Shell zeigen.

Danach ist der Kartenordner fuer den naechsten Ausbau bereit.

## Nicht tun

- Nicht fuer jede geplante Karte einen Ordner anlegen.
- Nicht fuer jede Karte eine HTML-Datei kopieren.
- Nicht die funktionierende Celtigerns-Wacht-Datei loeschen, bevor die neue Shell bewiesen ist.
- Nicht Bilder verschieben oder loeschen, bevor Configs und Links geprueft sind.
- Nicht eine riesige zentrale Monsterdatei bauen, die Registry, Shell, UI und Kartenlogik vermischt.

## Zusammenfassung

Der Kartenordner ist technisch auf einem soliden Zwischenstand, aber noch nicht zukunftsfertig fuer hunderte Karten.

Die zentrale Verbesserung ist nicht mehr Feature-Code, sondern **Routing und Datenmodell**:

```txt
Karte anklicken -> stabile Karten-ID -> Registry -> zentrale Shell -> Config/Bilder laden
```

Damit bleiben Links konkret, Karten planbar und die HTML-Struktur langfristig wartbar.
