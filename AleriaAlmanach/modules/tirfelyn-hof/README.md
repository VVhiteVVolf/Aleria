# Tirfelyn-Hof

Der bestehende Hofeintrag erhält 35 weitere interaktive Orte. Zusammen mit den
beiden unveränderten bisherigen Szenenthreads enthält er 37 Szenen auf 43 Seiten.
Die Erweiterung verwendet die vorhandene Archivregistrierung, Hierarchieseite,
Szenensteuerung, Figurenakten und Kreaturenwahl.

## Verantwortlichkeiten

- `shared/tirfelyn-hof/`: gemeinsame Orts-, Bewohner-, Wohnhaus- und Tierquelle;
  keine Abhängigkeit auf eine Benutzeroberfläche.
- `hof-module.mjs`: ergänzt ausschließlich `tirfelyn-hof`; die Geschwistermodule
  Helfaen und Marchwern behalten ihren Inhalt.
- `hof-scenes.mjs`: native Szenenseiten mit stabilen eigenen Threadschlüsseln
  und Links zur Hofkarte, bei markierten Orten direkt zum Pin. Neue Szenen sind leer und ohne Zeitvorgabe.
- `hof-people.mjs`: Arbeitsgruppen innerhalb der acht unterstützten Hierarchiebäume.
- `hof-characters.mjs`: zwölf ausdrücklich neue Identitäten mit Vornamen,
  Porträt, Kurzbiografie, Arbeitsort und Wohnhaus. Keine Zuordnung als Angehörige
  des Tirfelyn-Stammbaums.
- `Karten/modules/tirfelyn-hof/`: Adapter für die bestehende Kartenarchitektur;
  16 einfache bebilderte Infokarten mit nativen `[URL=...]`-Links zur Szene.
  Neun eigens erzeugte Tropfenpins sind im vorhandenen Katalog und der Hofkarte
  registriert. Brunnen, Anbauflächen und Kleinkram erhalten keine Kartenpins.
  Die zusätzliche Ebene „Personen“ zeigt 28 Bewohner an neun Wohnhäusern.
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

Die Browserprüfung verwendet die echte Anwendung und aktuelle lokale Figuren,
einen lokalen Kommentaradapter und keine Anmeldung. Sie prüft 1440, 390 und
320 Pixel, alle Seiten, alle Pins, Menschen- und Tierauswahl sowie die Navigation
zwischen Almanach, Bannkreis, Hofkarte und Szene.

Bei einer späteren Veröffentlichung werden die vorhandenen serverseitigen
Modulkataloge regulär aus der isolierten öffentlichen Commitquelle erzeugt.
Die gemischte lokale Main-Kopie ist dafür keine Ersatzquelle. Diesen Ausbau
nicht als bereits veröffentlicht oder produktiv importiert ausgeben.

Prüfbelege und erhaltene Vorläufe: `diagnostics/tirfelyn-hof-20261115/`.
