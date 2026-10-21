# Die rote Klaue

Ein eigenständiger Kooperationsbetrieb unter Gwynthors Klingender Münze. Der
Handelsposten verwendet dieselben Personenobjekte für Lucan und Camilla; ihre
gemeinsame Firma ist kein neuer Ratssitz und Aerwen wird durch ihre Ehe kein
zusätzliches Gildenmitglied.

## Zuständigkeiten

- `klaue-people.mjs`: Familie, Angestellte und zwei cenyrische Clachair.
- `klaue-biography.mjs`: Familiengeschichte, Eigenschaften und bekannte Kontakte.
- `klaue-hierarchy.mjs`: vier Aufgabenbereiche mit zwei freien Laufburschenstellen.
- `klaue-services.mjs`: fünf Dienste, Richtgebühren und Vertragsablauf.
- `klaue-rooms.mjs`: drei interaktive Szenen mit stabilen Schlüsseln.
- `klaue-module.mjs`: neun Seiten und bewusst leeres Güterregister.
- `klaue-characters.mjs`: begrenzter Offline-Importplan für neun lebende Personen;
  vorhandene Online-Kennungen, Ausrüstung und Ressourcen bleiben erhalten.

Der Stammbaum liegt unter `Stammbäume/assets/js/data/house-valerus-family.js`.
Er wird über das bestehende Iframe-Template eingebunden. Unbekannte Gründer,
Hausknoten und ein Zeitsprung führen zu Decian und Severina, dann zu den
Zwillingen und Lucans Ehe mit Aerwen. Verstorbene Eltern erhalten keine erfundenen
Porträts. Die Wappenfreigabe gilt für roten Handschuh, goldene Münze, Cremefeld
und dunklen Holzrahmen; das ovale Ladenschild zeigt dagegen eine Drachenklaue.

## Wirtschaft und Fearnan-Verbindung

Die Klaue ist Geldgeber der Fearnan. Angebotener Hauskauf mit Schuldverrechnung
und anschließender Miete ist kanonisch; eine Beteiligung am Diebstahl ist nicht
aufgeklärt. Die Anzeige wird dadurch nicht als Beweis umgeschrieben.

Richtgebühren beziehen sich auf einen Monat mit 36 Tagen. Darlehensstamm und
Tilgung sind Kapitalbewegungen, kein Umsatz aus Waren. Die vorhandene
Gaststätten-/Handelskalkulation würde sie falsch zählen. Deshalb bleibt
`economyCalculationDeferred` gesetzt, bis Darlehensbestand, Ausfälle, Finanzierung
und laufende Gebühren für eine passende Rechnung festgelegt sind. Es gibt keine
automatischen Käufe, Kontobelastungen, Zinsen oder Pfandübertragungen.

## Lokale Prüfung

```powershell
node AleriaAlmanach/scripts/build-rote-klaue.mjs
node AleriaAlmanach/scripts/build-klingende-muenze-gwynthor.mjs
node --test --experimental-test-isolation=none AleriaAlmanach/tests/rote-klaue.test.mjs AleriaAlmanach/tests/klingende-muenze-gwynthor.test.mjs
node AleriaAlmanach/tests/rote-klaue.browser.mjs
```

Bilddateien, Bildprompts, Originalpfade und Prüfsummen liegen unter
`assets/rote-klaue/`. Alle Rasterbilder werden mit dem eingebauten ImageGen
erstellt. Lokale Builds und Familiensnapshots veröffentlichen nichts online.
