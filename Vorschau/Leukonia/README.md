# Leukonia · Vorbereitung

Lokale Vorbereitungsseite für Leukonia mit dem bestätigten Kontext des
Kaiserreichs Argentum. Der aktuelle Veröffentlichungsstopp bleibt bestehen.
Die Seite übernimmt keine Hauszuordnungen in kanonische Register oder Firebase.

## Quellen und Karten

Die maßgeblichen Karten sind die beiden 8192 × 4698 großen PNGs unter
`C:/Users/fhg_r/Downloads/Länder/Das Kaiserreich Argentum/Tirnara Provinz`:
`Kaiserreich (Tirnara Normal).png` und `Kaiserreich (Tirnara Portion).png`.
Die drei älteren kleinen Übersichtskarten im übergeordneten Ordner zeigen
verschiedene Reichsteile und werden nicht als austauschbare Kartenvarianten
verwendet. Originale und ihre Beschriftungen bleiben erhalten.

Aktiv ist nach der neuesten Nutzerkorrektur ausschließlich das Festland.
Die südliche Insel bleibt als unveränderte Bildquelle erhalten und wird vorerst
nicht als Archonat oder Teil der Hausverteilung behandelt. Die aktiven Archonate
und Orte werden aus `territory-data.mjs` abgeleitet. Vier Namen sind eingebrannt:
Alvanista, Aspio, Zaphias und Allantaic. Namenlose Gebiete und Orte bleiben
als solche erkennbar. Die Form eines Markers legt keine zusätzliche Hauptstadt-
oder Adelsfunktion fest. Insbesondere wird aus Zaphias kein siebtes Archonat.

Das diagnostische Quellen- und Architekturinventar liegt unter
`diagnostics/argentum-leukonia/architecture-inventory.json`. Die Kartenprüfung
und die prozentualen Anker werden separat vom Kartenmodul dokumentiert.

## Daten und Darstellung

- `realm-context.mjs` besitzt die bestätigte Geschichte, Provinzen, Verwaltung,
  den Archon als Adelsrang, dreizehn Reichsposten, Institutionen und Militärbegriffe.
- `culture-data.mjs` besitzt die sechs gesellschaftlichen Schichten. Kaste,
  Amtsgewalt und konkrete Personen werden getrennt geführt.
- `territory-data.mjs` besitzt `MAP_VARIANTS`, `ARCHONATES` und `SETTLEMENTS`.
  `map-data.mjs` fügt nur die aktuellen Hausmarker als getrennte Bildschicht hinzu.
- `house-data.mjs`, `art-data.mjs` und `warrior-data.mjs` besitzen Hausidentitäten,
  Bilddateien und Darstellungsvorschläge. Sie werden von der Bildproduktion
  gepflegt; die UI importiert keine Prompt- oder Quellenarchive.
- `realm-context-view.mjs`, `art-view.mjs` und `proposal-render.mjs` rendern
  unabhängige Seitenbereiche mit dem gemeinsamen HTML-Escaping.
- `art-dialogs.mjs` verwendet für fertige Wappen-Figuren-Paare das gemeinsame
  `renderHouseDossier`. Es liest den aktuellen Sitz erst beim Öffnen aus.
- `proposal-app.mjs` verbindet die Bereiche und besitzt nur die Seiteneinstieg-
  und Bildaktionen. Kartenaktionen werden im Platzierungsbereich abgewickelt.

Die sieben vorgegebenen Kriegerrollen haben noch keine festgelegten
Klassennamen. Die Benutzerangabe „sechs“ bei sieben aufgezählten Rollen wird
als offene Abweichung dokumentiert. Es werden keine fremden Länderklassen
oder unbelegten Klassenprofile eingesetzt.

## Lokaler Sitzentwurf

Die sechs Häuser Apinia, Bolar, Lex, Orania, Pelagia und Tremelia behalten ihre
vorgegebenen Ränge. Fünf von ihnen erhalten vorgeschlagene Sitze in den aktiven
Festlandarchonaten; Bolar bleibt nach Ausschluss der Insel vorerst ohne Sitz.
Haus Mede erhält Zaphias als kaiserliche Domäne. Die konkreten vorgeschlagenen
Stadtsitze stehen in den Daten. Zusätzliche Hauswappen beginnen ohne Sitz; ihre
Anzahl folgt der Zahl der aktiven Festlandorte plus sechs. Die Ausgangssitze
bleiben bearbeitbar; es werden keine zusätzlichen Sitzsperren oder Kapazitäten
erfunden.

`placement-state.mjs` konfiguriert ausschließlich das gemeinsame
`Vorschau/shared/placement-state.mjs`. Dieses besitzt Momentaufnahmen,
Rückgängig und die atomare vollständige Importvalidierung. Die gemeinsame
`country-placement.mjs` verbindet Speicherung, Auswahl, Import/Export und
die vorhandenen Drag- und Kartenmodule.

Der eigene Speicherschlüssel lautet
`aleria:proposal:leukonia:placements:v1`. Ein Wechsel verändert weder
Hausnamen und Ränge noch Lehnsherrschaft oder Bilddaten. Wohnort und
Amtsinhaberschaft werden nicht gleichgesetzt.

## Bildstand und Prüfung

Bildkataloge dürfen unfertige Einträge mit `ready:false` oder ohne Bildpfad
führen. Die Seite zeigt dafür einen kurzen Status und keine Ersatzgrafik.
Ein fertiges Bild wird vollständig mit `object-fit:contain` gezeigt. Hausfigur,
Wappen, Banner, Kastenillustration und Klassenprototyp besitzen Großansichten.
Die sieben Klassenprototypen und anschließend die aktiven Hausfiguren gehören zur
Bildproduktion; dieser README behauptet keinen vorzeitigen Abschluss.

Für die abschließende Prüfung sind Datenbelege, vollständige lokale Pfade,
Originalhashes und tatsächliche Desktop-/Handyansichten relevant. Maus-/Stift-
Drag, alternative Auswahl, Rückgängig, Import/Export, Neuladen und Zurücksetzen
werden mit dem vorhandenen gemeinsamen System geprüft. Die Bildaufbereitung
bleibt in den bestehenden gemeinsamen Pipelines.
