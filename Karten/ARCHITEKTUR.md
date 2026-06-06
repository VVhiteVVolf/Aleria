# Karten-Architektur

Der Ordner `Karten` soll langfristig als gemeinsame Karten-Plattform funktionieren:

- Jede Karte besitzt eigene Daten, Bilder und Konfiguration.
- Gemeinsame Bedienlogik liegt in `assets/js`.
- Gemeinsames Styling liegt in `assets/css`.
- Neue Karten sollen keine Kopien von Feature-Logik enthalten.
- Neue Karten sollen nicht als eigene HTML-Dateien vervielfacht werden.
- Der Standardzugriff laeuft ueber `karte.html?map=<karten-id>` und `karten.registry.js`.

## Aktueller Schnitt

```txt
Karten/
  karte.html                   # zentrale Karten-Shell fuer aktive und geplante Kartenlinks
  karten.registry.js           # Registry fuer Karten-IDs, Hierarchie, Status, Links und Ladepfade
  tools/
    validate-karten-structure.mjs
                                # prueft Registry, aktive Kartenpfade und doppelte Bildinhalte
  assets/
    js/
      karto-app.js              # Kartenkern, Runtime-Bruecke und uebergeordneter State
      karto-firebase.js         # Firebase-Persistenz pro Karte
      core/
        karto-actions.js        # zentrale data-action/data-input-action Event-Delegation
      data/
        data-manager.js         # Import, Export, Backup und Pin-Normalisierung
      dm/
        dm-tools.js             # DM-Sitzungen, Notizen, Gruppen-Status und Tagebuch
      lsb/
        lsb-config.js           # Reise-/Werkzeug-Konstanten
        lsb-calculations.js     # Reisezeit-, Distanz- und Event-Berechnungen
        lsb-tools.js            # Kalibrierungs- und Messwerkzeug-State
        lsb-canvas.js           # Reiseebenen-Canvas, Labels, Routen und Wegpunkt-Hit-Test
        lsb-interaction.js      # LSB-Karteninteraktion fuer Werkzeuge, Routen und Wegpunkt-Dragging
        lsb-groups.js           # Reisegruppenliste, Gruppenaktionen und Wegpunktliste
        lsb-modals.js           # Gruppenmodal, Icon-Auswahl und Wegpunkt-Ereignis-Modal
      map/
        map-interaction.js      # Cursor, Platzierungs-/Stamp-Cursor und Panning-Starthelfer
        map-panning.js          # Panning-State und Pan-Bewegung
        map-panzoom.js          # Fit, Transform, Wheel-Zoom und Tastatur-Zoom
        map-view.js             # Kartenbild-Load und Layer-Steuerung
      pins/
        categories.js           # Kategorie-Leiste, Kategorie-Manager und Kategorie-Marker
        marker-catalog.js       # Marker-Katalog UI und Katalog-State-Zugriffe
        pin-detail-view.js      # Pin-Detailansicht im Lesemodus
        pin-editor.js           # Pin-Editor, Tabellenfelder und Pin-Marker-Picker
        pin-renderer.js         # Pin-Dot-Rendering, Tooltip und Pin-Dragging
        pin-templates.js        # Pin-Vorlagen und neue Pin-Platzierung
        stamp-overwrite.js      # Pin-Kopieren per Stempel und Feld-Overwrite
        search.js               # Pinsuche und Suchergebnis-Navigation
    css/
      karto-map.css             # gemeinsames Karten-Styling, spaeter featureweise teilbar
  _template/
    KartenTemplate.html         # Referenz/Fallback, nicht Standard-Kopiervorlage fuer jede Karte
    template.config.js          # Beispiel-Konfiguration
  Cenyr/
    celtigerns-wacht/
      CeltigernsWachtKarte.html # alter Kompatibilitaetslink zur Referenzkarte
      template.config.js        # individuelle Karten-Konfiguration
      Kartenbilder/             # aktive Kartenbilder fuer Celtigerns Wacht
```

## Regeln fuer neue Karten

Eine neue Karte darf individuelle Inhalte besitzen:

- Registry-Eintrag mit stabiler `id`
- `template.config.js`
- Kartenbilder
- eigene Firebase-`docId`
- spaeter optionale Startdaten

Geplante Karten brauchen nur einen Registry-Eintrag. Ordner, Config und Bilder werden erst angelegt, wenn die Karte wirklich entsteht.

Eine neue Karte soll keine eigene Kopie von `karto-app.js`, Feature-JS oder gemeinsamem CSS erhalten.

Eine neue Karte soll auch keine dauerhafte eigene HTML-Datei erhalten. Die zentrale Shell `karte.html` laedt aktive Karten ueber die Registry und zeigt geplante Karten als sauberen Platzhalter.

## Migrationsstatus

Abgeschlossen:

1. Inline-Handler im statischen Template durch `data-action`, `data-input-action`, `data-blur-action`, `data-keydown-action`, `data-file-action` und `data-drop-action` ersetzen.
2. Stabile Featurebereiche aus `karto-app.js` extrahieren:
   - Marker-Katalog
   - Import/Export und Backup
   - Kategorien
   - Suche
   - Pin-Rendering und Pin-Editor
   - Karten-Layer und Pan/Zoom
   - Messwerkzeug, Gruppen und Routen
   - DM-Sitzungen, Tagebuch und Status
3. State-Zugriffe ueber `window.KartoRuntime` kapseln, damit Features nicht direkt am globalen `S` arbeiten muessen.
4. Firebase als Storage-Adapter behalten und nicht in Featuremodule streuen.
5. Zentrale Karten-Shell `karte.html` fuer Registry-gesteuertes Laden anlegen.
6. `karten.registry.js` fuer aktive und geplante Karten-IDs anlegen.
7. Validator fuer Registry, aktive Kartenpfade und doppelte Bildinhalte anlegen.
8. Bekannte Celtigerns-Wacht-Bildduplikate entfernen.

## Bereits extrahiert

Der Marker-Katalog liegt in `assets/js/pins/marker-catalog.js`.

Er arbeitet ueber `window.KartoRuntime` mit dem bestehenden Karten-State. Das Feature ist aus dem Monolithen geloest, ohne gleichzeitig das komplette State-System umzubauen.

Import, Export, Backup und Pin-Normalisierung liegen in `assets/js/data/data-manager.js`.

Auch dieses Modul nutzt `window.KartoRuntime`, damit `karto-app.js` nicht mehr die fachlichen Details des Datenmanagers enthalten muss. Die zentrale Speicherfunktion `saveD` bleibt im Kern, ruft automatische Backups aber nur noch ueber den Datenadapter auf.

DM-Sitzungen, DM-Notizen, Gruppen-Status und Reise-Tagebuch liegen in `assets/js/dm/dm-tools.js`.

Das Modul verwendet `window.KartoRuntime` fuer Speicherzugriff, Toasts, Modal-Schliessen und eine kleine Reisegruppen-Schnittstelle. Dadurch liest der DM-Bereich nicht mehr direkt aus LSB-Interna wie `lsbS`, sondern fragt Gruppen, Reisekalkulation und Event-Infos ueber definierte Runtime-Methoden ab.

LSB-Konstanten und reine Reiseberechnungen liegen in `assets/js/lsb/lsb-config.js` und `assets/js/lsb/lsb-calculations.js`.

Diese Module enthalten Reisemodi, Standard-Icons, Standard-Farben, Ereignistypen sowie pure Funktionen fuer Distanzen, Routenmittelpunkt, Reisezeit, Verzögerungen und Ereignis-Auswirkungen. Der Kartenkern nutzt diese Logik noch ueber kleine Kompatibilitaetsfunktionen, damit der UI-/Canvas-Teil des LSB nicht gleichzeitig umgebaut werden muss.

Kalibrierungs- und Messwerkzeug-State liegt in `assets/js/lsb/lsb-tools.js`.

Das Modul besitzt die lokalen Punktlisten fuer Kalibrierung und Messung, aktualisiert die Werkzeug-Statusanzeigen und setzt den Kartenmassstab. Die LSB-Karteninteraktion fragt die benoetigten Punkte ueber `KartoLsbTools` ab.

Die Reiseebenen-Zeichnung liegt in `assets/js/lsb/lsb-canvas.js`.

Das Modul initialisiert den Mess-/Reise-Canvas, betreibt den permanenten Zeichnungsloop, rendert Kalibrierungspunkte, Messlinien, Gruppenrouten, Start-/Zielmarker, Ereignis-Wegpunkte und die Live-Routenvorschau. Der Wegpunkt-Hit-Test liegt ebenfalls dort, damit Karteninteraktion nicht mehr eigene Canvas-/Routengeometrie dupliziert.

Die LSB-Karteninteraktion liegt in `assets/js/lsb/lsb-interaction.js`.

Das Modul behandelt Kartenklicks fuer Kalibrierung, Messpunkte, Startmarker setzen, Routen zeichnen, Route per Enter/Backspace abschliessen oder korrigieren sowie Wegpunkt-Dragging per Halten und Ziehen. Der Kern stellt dafuer nur noch Reise-State, Koordinatenumrechnung, Speichern und UI-Aktualisierung ueber `KartoRuntime` bereit.

Die LSB-Gruppenliste liegt in `assets/js/lsb/lsb-groups.js`.

Das Modul rendert Reisegruppen, Wegpunktlisten und die Gruppenaktionen fuer Auswaehlen, Umbenennen, Loeschen, Reisemodus, Marker setzen, Route starten/fortsetzen/loeschen und Wegpunkt loeschen. Karteninteraktion, Wegpunkt-Modal und Canvas sind inzwischen eigene LSB-Module und werden ueber `window.KartoRuntime` angebunden.

Die LSB-Gruppen- und Wegpunkt-Modals liegen in `assets/js/lsb/lsb-modals.js`.

Das Modul besitzt den lokalen Dialog-State fuer Gruppenbearbeitung, Icon-Auswahl, eigene Icon-Slots und Wegpunkt-Ereignisse. Die statischen Dialoge in Template und Referenzkarte verwenden dafuer zentrale `data-action`, `data-input-action`, `data-keydown-action` und `data-file-action` Attribute. `karto-app.js` stellt nur noch die Runtime-Bruecken fuer Reise-State, Speichern, Redraw und Modal-Schliessen bereit.

Kategorien liegen in `assets/js/pins/categories.js`.

Der App-Start erfolgt jetzt ueber `assets/js/core/karto-bootstrap.js`, nachdem alle Featuremodule geladen sind. Dadurch kann `karto-app.js` beim Initialisieren bereits ausgelagerte Funktionen wie `renderCatBar` verwenden.

Suche liegt in `assets/js/pins/search.js`.

Dafuer stellt `window.KartoRuntime` eine kleine Viewport-/Pin-API bereit:

- `visiblePins`
- `categoryForPin`
- `jumpToPin`
- `openPin`
- `setLayer`

Kartenbild-Load und Layer-Steuerung liegen in `assets/js/map/map-view.js`.

Fit, Transform, Wheel-Zoom und Tastatur-Zoom liegen in `assets/js/map/map-panzoom.js`.

Panning-State und Pan-Bewegung liegen in `assets/js/map/map-panning.js`.

Der Kern entscheidet aktuell noch, wann Panning starten darf, weil diese Entscheidung mit Dragging, Pin-Platzierung, Messwerkzeug und Routenmodus gekoppelt ist. Die eigentliche Panning-Ausfuehrung liegt aber nicht mehr im Kern.

Cursor-Helfer, Platzierungs-Cursor, Stamp-Cursor und Panning-Startbedingungen liegen in `assets/js/map/map-interaction.js`.

Pin-Vorlagen und neue Pin-Platzierung liegen in `assets/js/pins/pin-templates.js`.

Die Template-Liste wird als `window.PIN_TEMPLATES` bereitgestellt, weil Overwrite-Dialog und Sidebar-Presets sie aktuell noch konsumieren.

Stamp/Overwrite liegt in `assets/js/pins/stamp-overwrite.js`.

Das Modul besitzt jetzt eigenen lokalen State fuer aktive Stempel- und Overwrite-Modi. `karto-app.js` fragt nur noch ab, ob ein Modus aktiv ist, und delegiert die Ausfuehrung an das Modul. Die statischen Stamp-/Overwrite-Dialoge nutzen zentrale `data-action`- und `data-input-action`-Events statt eigener Inline-Handler.

Pin-Dot-Rendering, Pin-Tooltip und Pin-Dragging liegen in `assets/js/pins/pin-renderer.js`.

Der Kern ruft nur noch `renderPins()` als stabile Bruecke auf. Das Modul entscheidet selbst, welche Pins sichtbar sind, verwaltet den Drag-State und delegiert Pin-Klicks zurueck an `runtime.openPin()` oder an den Overwrite-Modus.

Die Pin-Detailansicht im Lesemodus liegt in `assets/js/pins/pin-detail-view.js`.

Das Modul rendert die Pergament-/Scroll-Ansicht, Wappen, Banner, Infotabelle, Lore-Text und die View-Footer-Aktionen. Der Kern entscheidet weiterhin, ob ein Pin im View- oder Editmodus geoeffnet wird. Die Detailansicht delegiert Editor-Oeffnung, Loeschen und externe Links ueber zentrale `data-action`-Events.

Der Pin-Editor liegt in `assets/js/pins/pin-editor.js`.

Das Modul rendert die Sidebar-Form, synchronisiert Formularwerte in den Pin-State, verwaltet Tabellenzeilen, Presets, Bild-/Wappen-/Banner-Vorschauen und den Pin-Marker-Picker. `karto-app.js` oeffnet den Editor nur noch ueber `KartoPinEditor` und bleibt fuer uebergeordnete Aktionen wie Loeschen und globale Tastatursteuerung verantwortlich.

Die dynamischen Editor-Aktionen laufen jetzt ebenfalls ueber zentrale `data-action`- und `data-input-action`-Handler:

- Tabellenzeilen hinzufuegen/loeschen
- Presets anwenden
- Bild-/Wappen-/Banner-Vorschau
- Pin-Marker-Picker oeffnen, suchen und auswaehlen
- Speichern, Abbrechen und Textformatierung

Zentrale Pointer-/Koordinatenumrechnung laeuft ueber `window.KartoRuntime`:

- `viewportPointFromClient`
- `mapPointFromClient`
- `normalizedMapPointFromClient`
- `pinLayer`
- `pinDisplayOptions`
- `formatText`
- `travelGroups`
- `travelIconSize`
- `travelScale`
- `travelEventInfo`
- `formatTravelHours`
- `calcTravelRoute`
- `ensureToolsSidebarOpen`

Diese Schnittstelle wird bereits von Pin-Dragging, Pin-Platzierung, Touch-Zoom und LSB-Werkzeugen genutzt.

## Optionaler Feinschliff

Die Kartenbasis ist fuer den naechsten Ausbau bereit. Sinnvolle spaetere Feinschliffe waeren:

- weitere Kapselung des Karten-State hinter `KartoRuntime`
- Reduktion alter Kompatibilitaets-Globals, sobald keine Module sie mehr brauchen
- featureweise CSS-Aufteilung, falls `karto-map.css` weiter stark waechst
- alte Einzelkarten-HTML-Dateien schrittweise als Kompatibilitaetswege markieren oder archivieren
- Config-Dateien spaeter konsistent von `template.config.js` zu `karte.config.js` umbenennen, falls gewuenscht

Die reinen LSB-Daten, Berechnungen, Kalibrierung/Messung, Reiseebenen-Canvas, Karteninteraktion, Gruppenliste und Gruppen-/Wegpunkt-Modals sind bereits ausgelagert.

Die statischen Template- und Referenzkarten-Handler laufen inzwischen ebenfalls ueber zentrale `data-*`-Attribute. Das betrifft auch die verbliebenen Stamp-/Overwrite-/Datenmanager-/Marker-/Icon-/Passwort-Dialoge.

## Fortschritt

Grobe Zukunfts-Fortschrittsanzeige: 95%.

Die fehlenden 5% betreffen bewusst spaetere Ortsseiten-Integration und moegliche Kompatibilitaetsbereinigung alter Einzelkarten-HTML-Dateien. Der Kartenordner selbst ist aktuell ueber zentrale Shell, Registry, Validator und bereinigte Assets stabil fuer den naechsten Ausbau vorbereitet.
