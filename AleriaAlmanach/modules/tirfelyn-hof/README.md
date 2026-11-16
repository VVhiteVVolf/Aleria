# Tirfelyn-Hof

Der Hof ist nach Haushalten und Arbeitsbereichen in sieben Module gegliedert.
Alle 37 interaktiven Szenen und ihre Bilder bleiben enthalten. Das Hauptmodul
hat 15 statt der am 15. November veröffentlichten 43 Seiten.
Die Erweiterung verwendet die vorhandene Archivregistrierung, Hierarchieseite,
Szenensteuerung, Figurenakten und Kreaturenwahl.

| Modul | Seiten | Szenen |
| --- | ---: | ---: |
| Tirfelyn-Hof / Familie | 15 | 9 |
| Holzfäller und Waldhäuser | 4 | 3 |
| Mühle und Müllerhaus | 3 | 2 |
| Hufschmiede und Schmiedehaus | 3 | 2 |
| Hofhelfer und Hütten | 5 | 4 |
| Felder und Weiden | 10 | 9 |
| Wirtschaftsgebäude und Vorräte | 9 | 8 |

Herrenhaus, Gerberhaus, Imkerei, Gestüt, Räucherhaus und Gärten bleiben bei der
Familie. Die sechs Bereichsmodule liegen im Archiv unter Tirfelyn-Hof; die
Startseite des Hauptmoduls verlinkt alle Bereiche. Neue Übersichtsseiten sind
keine zusätzlichen Szenen.

## Verantwortlichkeiten

- `shared/tirfelyn-hof/`: gemeinsame Orts-, Bewohner-, Wohnhaus- und Tierquelle;
  keine Abhängigkeit auf eine Benutzeroberfläche.
- `shared/tirfelyn-hof/hof-areas.mjs`: eindeutige Zuordnung aller 35 zusätzlichen
  Orte zu sieben Bereichen und gemeinsame Szenenziele für Karten und Almanach.
- `hof-area-modules.mjs`: sechs native Bereichsmodule, ihre Haushaltsübersichten
  und das Verzeichnis auf der Hauptseite.
- `hof-module.mjs`: ergänzt ausschließlich `tirfelyn-hof`; die Geschwistermodule
  Helfaen und Marchwern behalten ihren Inhalt.
- `hof-scenes.mjs`: native Szenenseiten mit stabilen eigenen Threadschlüsseln
  und Links zur Hofkarte, bei markierten Orten direkt zum Pin. Neue Szenen sind leer und ohne Zeitvorgabe.
- `hof-people.mjs`: Arbeitsgruppen innerhalb der acht unterstützten Hierarchiebäume.
- `hof-characters.mjs`: zwölf ausdrücklich neue Identitäten mit Vornamen,
  Porträt, Kurzbiografie, Arbeitsort und Wohnhaus. Keine Zuordnung als Angehörige
  des Tirfelyn-Stammbaums.
- `Karten/modules/tirfelyn-hof/`: Adapter für die bestehende Kartenarchitektur;
  16 bebilderte Infokarten mit sieben Angaben und nativen `[URL=...]`-Links zur
  tatsächlich zugeordneten Szene. `hof-pin-details.mjs` besitzt die Fakten.
  Sieben Zeilen verwenden die vorhandene bündige Desktopdarstellung mit Bild
  links und Tabelle rechts; schmale Ansichten stapeln beide. Kein globaler
  Kartenrenderer oder fremdes Kartenlayout wurde dafür geändert. Die eigene
  Infokarten-CSS setzt den Lesedialog über die seitlichen Kartenknöpfe, damit
  diese gerade auf schmalen Bildschirmen keine Tabellenangaben verdecken.
  Neun eigens erzeugte Tropfenpins sind im vorhandenen Katalog und der Hofkarte
  registriert. Brunnen, Anbauflächen und Kleinkram erhalten keine Kartenpins.
  Die zusätzliche Ebene „Personen“ zeigt 28 Bewohner an neun Wohnhäusern.
  Hofpins verwenden nun Maßstab 1,5 statt 0,75. Positionen aller übrigen Orte
  bleiben erhalten. Torleifs Wohnteil ist unmittelbar an Hallvards und Rannveigs
  Haus angebaut; die historische Wohnort-/Szenenkennung bleibt stabil. Der
  südliche Schuppen wird nicht als Torleifs Wohnhaus markiert.
- `Karten/modules/place-roster/`: gemeinsame Darstellung für Wappen und Personen;
  Datenzuordnung und Kataloge bleiben in ihren eigenen Features.
- `Karten/modules/people/`: optionale Kartenebene aus expliziten Wohnhauszuordnungen;
  keine Stammbäume oder Figurenbestände werden im Kartenbrowser nachgeladen.
- `modules/creatures/catalog/tirfelyn-hof-animals.js`: ein Ponter und zwei Bugail
  im gemeinsamen Hofbesitz; Standard-Hundeprofil und echte Bestiarium-Verweise,
  ohne persönliche Inventarzuweisung.

## Quellen und Bilder

Die zwölf Personenvorgaben und die unbeschriftete Ortskarte stammen vom Nutzer.
Familienidentitäten und Aufgaben verwenden den bestehenden Landfamilienkatalog.
Die beschriftete Karte dient nur der Ortszuordnung und wird nicht ausgeliefert.
Normal- und Markerebene verwenden dieselbe unveränderte `Tirfelyn - Hof.png`.
Die beiden JPEG-Anzeigegrößen sind ausschließlich technische Ableitungen.

35 separate 2:3-Szenenbilder, drei Tierbilder, neun Kartenpins und die vorherigen zwölf Porträts
liegen in den jeweiligen Assetordnern. Originale, tatsächliche Imagegen-Prompts,
Versionen und Hashbelege liegen unter `docs/art/tirfelyn-hof-20261115/`.
Diese Autorenquellen gehören zum Repository, nicht zum Websitepaket.

## Erzeugen und prüfen

```powershell
node AleriaAlmanach/scripts/build-gwynthor-landfamilien.mjs --check
node AleriaAlmanach/scripts/build-tirfelyn-hof-characters.mjs --check
node Karten/tools/build-tirfelyn-hof-map.mjs --check
node --test --experimental-test-isolation=none AleriaAlmanach/tests/tirfelyn-hof.test.mjs Karten/tests/tirfelyn-hof-map.test.mjs
node AleriaAlmanach/tests/tirfelyn-hof.browser.mjs
```

Bei einer neuen lokalen Figurenübernahme zuerst `--plan`, dann `--write`.
Der bestehende begrenzte Import prüft den zwischenzeitlich unveränderten Bestand
und erhält alle übrigen Figuren. `--check` ist lesend. Das ist kein Firestore-Import.
Ein neuer Auftrag kann über `TIRFELYN_CHARACTER_PLAN_PATH` einen eigenen Belegpfad
verwenden, ohne ältere Importpläne zu überschreiben.

Die Browserprüfung verwendet die echte Anwendung und aktuelle lokale Figuren,
einen lokalen Kommentaradapter und keine Anmeldung. Sie prüft 1440, 390 und
320 Pixel, alle Seiten, alle Pins, Menschen- und Tierauswahl sowie die Navigation
zwischen Almanach, Bannkreis, Hofkarte und Szene.

## Alte Szenenlinks und Veröffentlichung

`commentThreadAliases` enthält am neuen Modul ausschließlich Navigationsrouten
von früheren zu aktuellen vollständigen Threadkennungen. Die gemeinsame
Kommentar-Routingfunktion bevorzugt vorhandene direkte Ziele und verweigert
mehrdeutige Aliase. Kopien mit anderer Modulkennung übernehmen die Ziele nicht.
Normalisierung, JSON-Export und Import erhalten diese Routen. Die URL-Navigation
und bestehende `openEntryById`-Navigation verwenden dieselbe Auflösung.

Diese Weiterleitungen verschieben keine Kommentare, Szenenzustände oder
historischen Belege. Eine spätere Veröffentlichung muss die 28 ausgelagerten
Szenen innerhalb ihrer Schreibtransaktion erneut auf Kommentare, Elemente und
Szenenzustände prüfen und bei inzwischen begonnener Geschichte stoppen. Beide
ursprünglichen Familienszenen behalten Modul- und Threadkennung unverändert.
Die sieben Modulakten samt Manifest sind dann zusammenhängend zu aktualisieren;
Torleifs Wohnortkorrektur darf nur die überprüften redaktionellen Felder ändern.

Bei einer späteren Veröffentlichung werden die vorhandenen serverseitigen
Modulkataloge regulär aus der isolierten öffentlichen Commitquelle erzeugt.
Die gemischte lokale Main-Kopie ist dafür keine Ersatzquelle. Der 43-Seiten-
Ausgangsstand wurde am 15. November veröffentlicht. Diese Neuaufteilung und
Kartenkorrektur sind lokale Folgearbeit und noch kein neuer Produktionsstand.

Prüfbelege und erhaltene Vorläufe: `diagnostics/tirfelyn-hof-20261115/`,
`diagnostics/tirfelyn-hof-release-20261115/` und
`diagnostics/tirfelyn-hof-reorganisation-20261116/`.
