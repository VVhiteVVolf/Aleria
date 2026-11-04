# Ishtaran · Vorbereitungsseite

Lokale Besprechungsseite unter `Vorschau/Ishtaran/index.html`. Mit einem
HTTP-Server aus der Projektwurzel öffnen; die Seite verwendet ES-Module.
Die vorhandene lokale Vorschau ist unter
`http://127.0.0.1:8897/Vorschau/Ishtaran/` erreichbar.

## Inhalt und Grenzen

- Bestätigte Vorgeschichte Maghath → Maghneach → Zarakhul → Orin → Ishtaran.
- Acht hohe Staatsämter und zehn vollständig festgelegte Rangtitel.
- 21 feste Orte: eine Sultanshauptstadt und acht Paschastädte bilden die
  neun großen Orte; dazu kommen zwölf kleine Tarkan-Herrschaften. Die
  gelieferten Normal- und Regionenkarten sind umschaltbar und vergrößerbar.
- Maghneachs blau-weißer Steppenadler, elf unveränderte Wappenoriginale und
  26 zusätzliche freie Wappenvorschläge.
- 38 einzelne Kriegerdarstellungen, jeweils in den Farben und Motiven ihres
  Wappens. Maghneachs Speerkrieger ist ein antiker Bildentwurf; er behauptet
  keine gegenwärtige ishtaranische Klasse.
- Aus 40 Stadt- und 100 Adelsnamensvorschlägen ist ein bearbeitbarer
  Sitzentwurf entstanden: 21 Ortsnamen, 37 benannte heutige Wappenhäuser,
  37 zugeordnete Häuser. Der freie Hausbereich bleibt zum Umstellen verfügbar.
- Nefer, Derwisch, Sipahi, Ghulam, Aschik, Nizet, Keman und Lewent.
  Sarkal und Shahzade/Shahzad verweisen auf die vorhandenen Bestiariumsprofile.
  Die Klassenübersicht verwendet sieben der neuen Wappenfiguren und den
  ausdrücklich behaltenen ursprünglichen Ghulam als Beispiele; sie erzeugt
  keine zusätzlichen Standardfiguren.

Die lokale Merkliste speichert nur ausgewählte Vorschlags-IDs und Notizen.
Sie bietet Rückgängig, JSON-Import und -Export. Der LocalStorage-Schlüssel
lautet `aleria:proposal:ishtaran:shortlist:v1`. Ein Import wird vor jeder
Änderung vollständig validiert. Der Sitzentwurf besitzt eine getrennte
Speicherung unter `ishtaran:placements:v1` mit Rückgängig, Import/Export und
Rückkehr zur Ausgangsverteilung. Kanonische Register und Firebase bleiben
unberührt; Namen, Hausmarker und Ziele sind Overlays über unveränderten Kartenbildern.

## Ausgangsverteilung und Platzregeln

Altasar beherbergt Haus Aschina als vorgeschlagenes Sultanhaus sowie Göktemir
und Aybars sowie Tenguran als drei zusätzliche Tarkan-Häuser. Die jüngste Nutzerkorrektur
nennt für die Hauptstadt mindestens zwei zusätzliche Häuser und keine obere
Grenze. Die frühere Angabe eines einzigen Zusatzhauses ist damit überholt.
Acht weitere große Orte erhalten jeweils ein Paschahaus und optional bis zu
zwei Tarkan-Häuser. Die Belegung variiert zwischen zwei und drei
Häusern. Die elf intakten kleinen Herrschaften erhalten je ein Tarkan-Haus.
Kutlakar ist auf ausdrückliche Nutzerfestlegung zerstört und bleibt leer.
Haus Kutlug ist nach Belduran evakuiert und erscheint dort als ausgegrautes
Kartenwappen. Die Zerstörungsmarkierung sperrt Kutlakar für neue Zuordnungen.
Die zuletzt freien Häuser sind nun ebenfalls verteilt: Tenguran nach Altasar,
Salur nach Ayseran, Ordugan nach Orsakent, Torgun nach Torgasar und Albaran
nach Kembaran. Keine Familie bleibt im Ausgangsentwurf ohne Sitz.

Maus und Stift können Wappen zu vorhandenen Ortszielen ziehen. Für Touch und
Tastatur gibt es dieselbe Zuordnung per Hausauswahl und Zielknopf. Rang und
Kapazität werden vor jeder Änderung und vor jedem Import geprüft. Ein Umzug
verändert keinen Hausrang und begründet keine Dienst- oder Lehensbindung.
Vorübergehend freie Leitersitze sind während der Bearbeitung erlaubt.
Göktemirs stabile Haus-ID `pool-18` und ursprüngliche Vorschlags-ID
`house-koektemir` bleiben trotz sichtbarer Umbenennung erhalten, damit
vorhandene Merkliste- und Sitzdateien weiter zuordenbar bleiben.

## Verantwortlichkeiten

`realm-context.mjs`, `name-proposals.mjs`, `heraldry-data.mjs` und
`warrior-data.mjs` besitzen die Landesdaten. `proposal-render.mjs` rendert
escaped HTML; `proposal-app.mjs` verbindet lokale Ereignisse und Speicherung.
`emblem-warrior-data.mjs` verknüpft die Wappen ausschließlich für den
Bildentwurf mit ihren eigenen Kriegern und verwendet die vorhandenen
Klassenmetadaten. `emblem-warrior-view.mjs` besitzt die Paaransichten und
verwendet den gemeinsamen Dossierrenderer. Hausname, vorgeschlagener Rang
und aktueller Entwurfssitz werden getrennt vom unveränderten Bildkatalog ergänzt.
`class-overview-data.mjs` leitet aus den vorhandenen Klassenbeschreibungen und
den Wappenfiguren die acht Klassenkarten ab.
`emblem-warrior-designs.mjs` enthält ausschließlich kompakte Darstellungsfelder;
der Builder unter `scripts/build-emblem-warrior-designs.mjs` hält vollständige
Prompts und Quellenpfade aus dem Browserpaket heraus.
`proposal-draft.mjs` besitzt den Entwurfszustand, `art-dialogs.mjs` die
Bildansichten. Die bestehende Länderwerkstatt liefert gemeinsame Styles und
HTML-Escaping. `house-data.mjs` besitzt die 37 Hausvorschläge;
`territory-data.mjs` besitzt die 21 geprüften Ortsanker und ihre Namen.
`map-data.mjs` verbindet den Sitzentwurf mit den beiden Kartenvarianten.
Die lokalen Platzierungsbausteine verwenden den bestehenden gemeinsamen
Entwurfszustand, Kartenrenderer und die Drag-/Touch-Steuerung.
`placement-state.mjs` besitzt die Rang-, Kapazitäts- und Ruinenregeln;
`placement-storage.mjs` besitzt die gezielte, gesicherte Übernahme älterer
Kutlug-Sitzdateien. `house-placement.mjs` verbindet die gemeinsamen Controller,
`house-placement-render.mjs` besitzt die Orts- und Hauskarten. Neue Standard-
zuordnungen überschreiben keine bewusst freigelassenen Sitze in fremden Entwürfen.
`scripts/build-settlement-proposal.mjs` erzeugt die reinen Laufzeitdaten aus
den aufbewahrten Namens-, Zuordnungs- und Ankerquellen unter `sources/`.

## Bildquellen und Transparenz

Alle neu erstellten Wappen- und Kriegerillustrationen werden mit dem
eingebauten `image_gen` erzeugt.
Prompts, Referenzen, unbearbeitete Generatorausgaben und Prüfsummen bleiben
erhalten. Der Nutzer hat am 3. November 2026 die technische Alpha-Aufbereitung
ausdrücklich freigegeben. Sie verwendet die vorhandenen gemeinsamen
Alpha-Funktionen; Produktions-RGB und Generatororiginale bleiben erhalten.

- Originaldownloads: `assets/source/`, Prüfsummen in `assets.source.json`.
- Neue Wappen: `assets/emblems/{generated,production,previews}/`.
- Beim goldenen Adler / Haus Barsbek wurde der zusätzliche Vorderflügel per
  eingebautem `image_gen` gezielt entfernt. Rahmen, Farben und übriges Motiv
  bleiben erhalten; Ausgangsfassung und Editbeleg stehen im Quellenarchiv
  beziehungsweise `sources/pool-07-wing-fix-20261103-v1.json`.
- Krieger: `assets/warriors/{generated,production,previews}/`.
- Prompts, Aufbereitungsbelege und Quelldokumente: `sources/`.
- Vollständige Bildprompts: `sources/maghneach-generation.json`,
  `sources/emblem-generation.json` und `sources/warrior-generation.json`.
- Die aktuelle Wappenkrieger-Serie besitzt eigene V3-Entwurfsdateien und
  Generationsbelege für `source`, `pool-01-13` und `pool-14-26` unter
  `sources/emblem-warriors-…-art-direction-v3.*` beziehungsweise
  `sources/emblem-warriors-…-generation-v3.json`. Die behaltenen Ausnahmen
  verweisen über `approved-warrior-images.json` auf ihre ursprünglichen Belege.
- Kartenansichten: `assets/maps/`; die großen PNG-Originale bleiben
  unverändert im gelieferten Downloads-Ordner, belegt in `sources/map-sources.json`.
- Der gemeinsame Krieger-Aufbereitungsbeleg: `assets/warriors/manifest.json`.
- Der dünne Krieger-Pipeline-Wrapper: `scripts/prepare_warriors.py`.
- Derselbe Wrapper verarbeitet die acht Klassenbilder und die 38
  wappenspezifischen Figuren; der vollständige Audit erwartet 46 Einträge.
  Sieben der ursprünglichen Klassenbilder bleiben reine Autorenquellen und
  werden nicht statisch ausgeliefert. Der ausdrücklich behaltene ursprüngliche
  Ghulam bleibt als Klassenbeispiel sichtbar. Hinzu kommen die 38
  wappenspezifischen Figuren, einschließlich des freigegebenen Dahakid.
- Die Bildausnahmen Dahakid, Feuerschalen-Derwisch und Widder-Ghulam sowie
  der ursprüngliche Ghulam bleiben nach ausdrücklicher Auswahl erhalten;
  Rohhashes und Erhaltungsbelege stehen in `sources/approved-warrior-images.json`.
  Die anderen 35 Wappenfiguren folgen den jungen Erwachsenen und traditionellen
  kulturellen Kopfbedeckungen der aktuellen Bildvorgabe. Altersangaben betreffen
  ausschließlich die Darstellung und legen keine Personenakten an.
- Visuelle und technische Prüfbelege: `diagnostics/ishtaran/` im Projektroot.

Autorenkataloge, Quellen- und Aufbereitungsbelege, Pipeline-Skripte,
Generatorarchive und Diagnosematerial sind durch die Netlify-Publikationspolicy
von der statischen Auslieferung ausgeschlossen. Die Laufzeitmodule der Seite
bleiben auslieferbar.
Aktive Bilder und ausdrückliche Originaldownloads bleiben auslieferbar.
Diese Arbeit ist lokal vorbereitet; sie enthält keinen Push oder Deploy.

## Prüfungen

`Vorschau/tests/ishtaran-draft.test.mjs` prüft lokale Speicherung und atomare
Importe; `ishtaran-data.test.mjs` prüft Quellen, aktuelle Festlegungen und
aktive Verweise. Der Datencheck umfasst auch Kartenprüfsummen, unveränderte
Geometrie und die Trennung zwischen Quellenarchiv und aktiven Kartenbildern.
`ishtaran-placement.test.mjs` prüft die Hausverteilung, Ranggrenzen, gesperrte
Ruinen, atomare Importe, gesicherte Altentwürfe und stabile Umbenennungs-IDs.
Die abschließende Browserprüfung umfasst einen wirklichen Maus-Drag,
Touch-/Tastatur-Zielauswahl, Export/Import, Zurücknehmen und Neuladen sowie
beide Kartenvarianten und vollständige Marker im Handyformat.
Für die vorhandene Windows-Testumgebung:

```powershell
$ishtaranTests = Get-ChildItem Vorschau/tests -Filter '*.test.mjs' |
    Select-Object -ExpandProperty FullName
node --test --experimental-test-isolation=none $ishtaranTests
```
