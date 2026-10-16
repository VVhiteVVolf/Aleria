# Die Lachende Nixe

Ausbau des vorhandenen Moduls vom 16. Oktober 2026. Die unveränderte Online-Ausgangsfassung liegt unter `sources/module-before-finalization.json`; sie ist zugleich die Vorbedingung der Veröffentlichung.

## Verantwortlichkeiten

- `nixe-module.mjs`: redaktionelle Ergänzungen der zehn bestehenden Seiten und eine neue Services-Seite direkt hinter dem Warenangebot. Kommentarstränge, Szenentermine und Albrechts bisherige Texte bleiben erhalten, auch bei den verschobenen Seiten.
- `nixe-hierarchy.mjs`: sechs wechselbare Personalreiter, 47 Einzelposten. Alle 25 ursprünglichen Knoten einschließlich der 14 freien Plätze bleiben erhalten; insgesamt sind 34 Stellen frei.
- `nixe-menu.mjs` und `nixe-catalog.mjs`: sieben kleine Weisenfluher Gerichte, sieben Weine und sechs Zunftimporte. Die 21 Standards behalten ihre ursprünglichen Kaufkennungen, Portionen und Preise. 41 Waren ergeben durch die Glas-/Flaschenvarianten 45 Angebote.
- `nixe-services.mjs`: 14 Leistungen im vorhandenen Dienste-Template mit acht eigenen Icons, konkreten Zeitangaben und Tarifen. Die vereinbarten Leistungen bleiben eigenständig und werden nicht als Inventarwaren geführt.
- `nixe-family-people.mjs`: 21 benannte Angehörige und ihre verbindlichen Bildmerkmale. Der Stammbaum wird in `Stammbäume/assets/js/data/house-sonnenfels-family.js` aufgebaut; er enthält außerdem das unbekannte Gründerpaar, Adelheids unbekannten Gemahl und Kaspars unbekannte Mutter.
- `nixe-characters.mjs`: reine Planung der 28 Almanach-Profile und der Sammlung „Die Lachende Nixe“. Bestehende Profile erhalten ausschließlich fehlende Stammbaumquellen; Livewerte, Inventare und eigene Texte bleiben erhalten.

Dietmar führt das Weisenfluher Haus. Albrecht bleibt Dagoraths legitimer Sohn. Gerold und Konrad sind die Verwandten aus dem überlieferten Erbstreit. Adelheids Linie führt zu einem unbekannten angeheirateten Haus; Kaspar bleibt der anerkannte uneheliche Sohn einer unbekannten Mutter. Rosalinde ist 19 Jahre alt und übernimmt Briefe und besondere Empfangstermine. Die beiden Kinder in Weisenfluh gehören nicht zum Personal.

## Bilder

Das ursprüngliche Herzschild und die elf vorhandenen Figurenporträts bleiben erhalten. Die 46 neuen Bilder umfassen sechs Hafenszenen/Räume, 17 Familienporträts, sieben Gerichte, sieben Weine, acht Service-Icons und das kreisrunde Sonnenfels-Wappen. Vorlagen und vollständige Prompts: `assets/lachende-nixe/image-prompts.json`; Herkunft und Prüfbelege liegen im gleichen Bildordner. Die Weisenfluher Männer wurden nach Nutzerkorrektur mit unterschiedlichen Gesichtern, Haaren, Bärten und Hausrüstungen neu gestaltet. Das gemeinsame Merkmal bleibt der rosafarbene Haarverlauf. Ausschließlich der bereits freigegebene Wappen-Alphakanal wird per Skript bereinigt; RGB und Originale bleiben erhalten.

## Servicepreise

Preisanker sind die unveränderten Standardportionen (Frühstück 0,5 KT, geröstetes Fleisch 4 KT), die leichte neue Hausküche (Hauptgerichte 8–10,5 KT, Monatsgericht 16,5 KT) und die besonderen Weine (6–18 KT je Glas). Eine Einzelkammer kostet 12 KT pro Nacht; persönliche Gesellschaft mit reservierter Zeit liegt darüber. Der Tarif für 36 Nächte einschließlich täglichen einfachen Frühstücks beträgt 360 KT statt einzeln 450 KT, also 20 % weniger. Die Perlenstube kostet 25 KT je Nacht oder 720 KT für 36 Nächte einschließlich Frühstück für zwei Gäste. Ein Aleria-Monat hat 36 Tage; es wird kein 30-Tage-Monat unterstellt. Zeit der Künstlerinnen, Räume, Getränke und Mahlzeiten bleiben jeweils eindeutig bezeichnet.

## Bauen und prüfen

```powershell
node AleriaAlmanach/scripts/build-lachende-nixe.mjs
node AleriaAlmanach/scripts/build-lachende-nixe.mjs --check
node AleriaAlmanach/scripts/publish-nixe-family.mjs --apply
node --test --experimental-test-isolation=none AleriaAlmanach/tests/lachende-nixe.test.mjs
node AleriaAlmanach/tests/lachende-nixe.browser.mjs
python AleriaAlmanach/scripts/inspect-nixe-art.py
```

`firebase/scripts/content/publish-lachende-nixe.mjs` ist zunächst schreibgeschützt. `--apply` prüft die ausgelieferten Bilder, sichert die betroffenen Rohdokumente verschlüsselt und veröffentlicht Modul und Profile atomar mit Versionsvorbedingungen. Die gemeinsame Routine verändert keine Kampfdaten. Wiederholtes Ausführen erzeugt keine weiteren Profile oder Sammelplätze. Der versionierte Stammbaum wird mit der Website veröffentlicht.
