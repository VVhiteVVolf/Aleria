# Die Krumme Kanne

Inhaltliche Fertigstellung und Korrekturen vom 14. Oktober 2026.

- Bestehendes Modul `modul-1781474092957`, weiterhin zehn Inhaltsseiten. Seitenidentitäten, Kommentare, Gästeregister und Szenenuhren bleiben erhalten.
- Hausbio mit drei gleichberechtigten Veteranen als Inhabern; Gründung 1722, Standort im östlichen Hafenviertel Gwynthors.
- Sechs wechselbare Hierarchiereiter mit 29 Menschen und zwei Haustieren. Drei erwachsene Schankmägde; Kinder mit altersgemäßen Aufgaben, die jüngsten ohne Dienstpflicht.
- Güterregister statt der alten Warentabelle: elf Standardspeisen, zehn Standardgetränke, vier Vorspeisen, acht Hauptgerichte, drei wöchentliche Wildgerichte und acht importierte Getränke. Alle 44 Angebote sind enthalten; Standardpreise, Portionsgrößen und Angebots-IDs bleiben erhalten. Hauseigene Gerichte erhalten jeweils drei ausführliche Absätze.
- Familien Trevoryn, Svathamar und Dubhdarach: unbekannte Gründer, serieller Zeitsprung, dann heutige Familie. Spiegelungen verwenden dieselben Weltpersonen. Mairs frühere Verbindung mit Gareth und Caradogs leibliche Abstammung bleiben erhalten.
- Drei Bürgerwappen und Hausseiten; Aufnahme in Gwynthors Bürgerhäuser und Celtigerns Wachts Herrschaftsübersicht. Svathamar zeigt ausschließlich Berg und Turmruine, ohne Arm oder Hand.

## Zuständigkeiten

`modules/krumme-kanne` enthält Personen, Räume, Rezepte, ausführliche Speisentexte und die reine Übertragung in die vorhandenen Modulvorlagen. `krumme-kanne-trade-catalog.mjs` verwendet das bestehende Güterregister. Seine feste Portionsangabe `unit` wird von Editor, Anzeige, Browserregister und serverseitiger Angebotsprüfung unterstützt.

`Stammbäume/assets/js/data/krumme-kanne-family-people.js` liefert gemeinsame Personenidentitäten; `krumme-kanne-families.js` erstellt die drei Familienakten. `Familien Häuser und Clans/modules/house-content/krumme-kanne-house-content.mjs` ergänzt die redaktionellen Hausseiten über den bestehenden Builder.

## Bilder

Alle endgültigen Porträts, Speisen und Raumbilder liegen unter `assets/krumme-kanne`. Die Wappen liegen unter `Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor`. Die vollständigen Prompts und Referenzen stehen in `assets/krumme-kanne/image-prompts.json` und `crest-prompts.json`.

Erzeugt mit dem eingebauten `image_gen` anhand der gespeicherten Stilvorlagen. Tesnis schwebende Hand wurde entfernt; beide Tiere sind Ganzkörperbilder. Die vom Nutzer bestätigte Skriptbereinigung beschränkt die Wappenalpha auf außen 0 und innen 255, ohne Änderung des RGB-Motivs.

## Erzeugung und Veröffentlichung

```powershell
node AleriaAlmanach/scripts/build-krumme-kanne.mjs
node "Familien Häuser und Clans/scripts/build-house-content.mjs"
```

Das überprüfbare Modulpaket liegt unter `Charakter Archiv Exporte/Module/Krumme Kanne/krumme-kanne-2026-10-14.json`. `firebase/scripts/content/publish-krumme-kanne.mjs` vergleicht vor jeder Änderung den aktuellen Online-Stand mit der gesicherten Ausgangsfassung. Ohne `--apply` schreibt es nichts. Die eigentliche Veröffentlichung verlangt vorher bytegleich bereitgestellte Bilder und sichert Modul und Manifest verschlüsselt; sie verändert ausschließlich dieses Modul und die zugehörige Manifestrevision.

Die drei neuen öffentlichen Familienakten und die ergänzte Tonnarth-Fassung werden samt Revisionsbelegen im bestehenden GitHub-Familienregister veröffentlicht. Tonnarths bisherige Personen-IDs, Weltpersonen-IDs und Lebensdaten bleiben erhalten.

## Prüfung

Gezielte Daten- und Kauftransaktionsprüfungen, Browserprüfung aller sechs Hierarchiereiter und vier Angebotskategorien, Laden der drei Hausseiten sowie Erreichbarkeit ihrer Wappen in Stadt und Grafschaft. Die Geometrieprüfung umfasst Trevoryn, Svathamar, Dubhdarach und Tonnarth: 65 Karten ohne Befund. Die Browserprüfung blockiert alle externen Anfragen und schreibt keine Produktionsdaten.
