# Gwrgan gegen Lleucu · Personen, Familien und Wappen

Lokale Ausarbeitung vom 30. Oktober 2026. Sechs Porträts und drei Wappen wurden mit **built-in image_gen** erstellt. Die bestätigten Stilvorgaben stammen aus `docs/art/image-style-presets.json`: Animeporträts in 2:3 nach Tales of Xillia/Frieren und kreisrunde Familienwappen in 1:1. Alle aktiven Bilder liegen im Projekt.

## Die sechs Personen

| Person | Alter 1740 | Einordnung | Porträt |
| --- | --- | --- | --- |
| Lleucu Swyll | 38 | Reederin, Tochter von Emyr und Tegwen, Rhodris Zwillingsschwester | [Lleucu](portraits/lleucu-swyll.png) |
| Gwrgan Cochdon | 43 | Heimgekehrter Seehändler und Kläger | [Gwrgan](portraits/gwrgan-cochdon.png) |
| Eifion Twyllod | 44 | Kapitän, Lleucus zweiter Ehemann, Arians jüngerer Bruder | [Eifion](portraits/eifion-twyllod.png) |
| Gethin Falchdyn | 26 | Bestehender Sohn von Emrys Falchdyn und Lowri Llawen; vom Hof bestellter Fürsprecher | [Gethin](portraits/gethin-falchdyn.png) |
| Valeriano Falto | 38 | In Venalys ausgebildeter Gildenfürsprecher Fortunas in Gwynthor | [Valeriano](portraits/valeriano-falto.png) |
| Sir Cynfarch Llafnfor | 46 | Ritterherr unter den Dyfrgi von Caer Cryftlawd, Kapitän und Gwrgans Retter | [Cynfarch](portraits/cynfarch-llafnfor.png) |

Gethin erhielt seine juristische Ausbildung in der Gwynthorer Gerichtskanzlei, aufbauend auf Schriftführung und Urkundenkunde seiner Familie. Seine Herkunft erhält dadurch einen passenden neuen Berufszweig. Valeriano besetzt eine eigene Stelle in der Fortuna-Kanzlei; die neun institutionellen Ratssitze bleiben bestehen.

## Familien

Alle neuen Familien beginnen mit unbekanntem Gründerpaar, Hauswappen-Knoten und einem seriellen Überlieferungssprung. Erst danach folgen die bekannten Personen.

**Cochdon:** Gorwystl Cochdon (1663–1728) und Gwenfrewi (1667–1717) haben vier Söhne: Cynfelyn (1690–1720), Tegfan (1693–1720), Gwrgan (1697–) und Ithel (1700–1720). Drei Brüder ertranken bei der Schlacht der tausend Wellen. Gorwystl überlebte den vermeintlichen Verlust aller Söhne, versank in Trauer und schwerem Trinken und vermachte Lleucu den verbliebenen Besitz ausdrücklich. Die genaue medizinische Todesursache bleibt ungewiss.

**Swyll:** Lleucu ergänzt Emyrs und Tegwens Kinder als zehntes Kind, Zwillingsschwester Rhodris. Ihre bestehenden neun Geschwister und deren Beziehungen bleiben erhalten. Beide Ehen Lleucus verweisen mit denselben Personen- und Ehe-IDs auf die jeweiligen Gegenakten. Mit Gwrgan hat sie kein Kind.

**Twyllod:** Die Familie war bereits durch Glendowers Biografie erwähnt, hatte aber keine eigene Familienakte. Cynwrig Twyllod (1665–) und Morfudd (1668–) sind die ergänzten Eltern von Arian (1690–) und Eifion (1696–). Arian ist Eithnes früherer Ehemann, ausdrücklich **nicht Glendowers leiblicher Vater**. Eithnes Ausstoßung und Glendowers vorhandene Vorgeschichte bleiben erhalten; Eifions individuelle damalige Haltung wird offengelassen. Eifion und Lleucu haben Gwenfor (1730), Eirwen (1733) und Nudd (1736).

**Llafnfor:** Ritterherrenfamilie unter `haus-dyfrgi-caer-cryftlawd`, in dessen Herrschaftsbereich Klaueninsel → Talklaue → Caer Cryftlawd eingeordnet. Nach dem Gründerpaar und Zeitsprung ist nur Cynfarch ausgearbeitet. Kein eigener Sitz und keine weiteren Verwandten wurden erfunden.

**Falto:** Die bestehende venalysische Magnarierfamilie unter Vinicius erhält eine schmale Akte mit Valeriano. Die örtliche Präsenz in Gwynthor ist als zusätzliche Platzierung desselben Hauses erfasst. Weitere Angehörige, Stammsitz und eigenes Falto-Wappen bleiben offen. Sehr hellblaues Haar und sehr helle blaue Augen folgen der neuen Familienvorgabe.

## Wappen

| Familie | Bestätigte Fassung | PNG |
| --- | --- | --- |
| Cochdon | Silberner springender Tunfisch, roter Kamm und rote Flossen, Petrol; dunkler Eisenrahmen mit Tauornament | [Cochdon](crests/cochdon.png) |
| Llafnfor | Silberner Schwertfisch durchbohrt eine dunkelgrüne Seeschlange auf Meerblau; Silberrahmen mit Wellenknoten | [Llafnfor](crests/llafnfor.png) |
| Twyllod | Silberner Hering vor dunklem Fischernetz auf gedämpftem Ocker; einfacher Eisenrahmen | [Twyllod](crests/twyllod.png) |

Llafnfor wurde auf ausdrücklichen Hinweis korrigiert: ein durchgehender Schlangenkörper, ein Kopf, ein Schwanz. Die Generatororiginale bleiben unter `diagnostics/gwynthor-erbstreit-2026-10-30/image-sources/` im Repository und außerhalb des statischen Auslieferungspakets erhalten. Der vom Nutzer ausdrücklich freigegebene gemeinsame Wappen-Aufbereiter bereinigt ausschließlich den Alphakanal; RGB-Werte bleiben unverändert. Innen Alpha 255, außen Alpha 0. Nachweis: [Alphaprotokoll](emblem-alpha-correction.json).

## Zeitliche Ausarbeitung und offener Rechtsstreit

Als zusammenpassende Arbeitsdaten sind ergänzt: erste Heirat 1720 vor dem Aufbruch, Todeserklärung 1724, Gorwystls Tod und Testament 1728, zweite Heirat 1729. Diese genauen Jahre konkretisieren die Vorgeschichte und lassen sich bei einer späteren Datumsfestlegung gemeinsam ändern.

1720–1726: Minenarbeit. 1726–1737: zunehmende Verantwortung bis zur eigenen Mine als Thrallführer. 1737–1740: Hafenaufsicht und Fluchtplanung. 1740 fliehen Gwrgan und fünfzig weitere Thralls; Cynfarch rettet Gwrgan und zwölf andere. 38 Flüchtende sterben. Der rettende Kapitän führt die Überlebenden fürsorglich heim.

Die erste Ehe wurde aufgrund der amtlichen Todesannahme als beendet behandelt. Gwrgans Rückkehr macht ihre Rechtsfolgen zum Streitgegenstand. Die anerkannte zweite Ehe und die drei ehelichen Kinder werden nicht nachträglich durch Gwrgans Behauptungen umklassifiziert. Sein Vermögens- und Entschädigungsbegehren ist kein vorweggenommenes Urteil. Heute führen Lleucu und Eifion fünf Schiffe, bei etwa vervierfachtem Vermögen.

## Quellen, Prompts und Prüfungen

- Vollständige Porträtprompts und bestätigte Entscheidungen: [portrait-specs-approved.json](portrait-specs-approved.json).
- Vollständiger universeller Wappenprompt mit Referenzen: [heraldry-specs-approved.json](heraldry-specs-approved.json).
- Bildkorrekturen: [heraldry-edits.json](heraldry-edits.json).
- Aktive Bilddateien, Größen und SHA-256: [image-results.json](image-results.json).
- Familienquellen: `Stammbäume/assets/js/data/gwynthor-erbstreit/`; Erweiterungen in `house-swyll-family.js` und `house-falchdyn-family.js`.
- Bestehende Twyllod-Quelle: `CharakterDatenbank/records/unzugeordnet/unassigned/glendower-o-cenyr--glendower-o-cenyr/character.json`. Die Charakterakte selbst wurde nicht verändert.
- Struktur- und Integrationsprüfung: `node --experimental-test-isolation=none --test Stammbäume/tests/gwynthor-erbstreit.test.js AleriaAlmanach/tests/markt-der-fortuna-gwynthor.test.mjs`.
- Browser-Geometrieprüfung: sechs Familien, 123 Karten, keine gefundenen Geometriefehler. Bericht unter `diagnostics/gwynthor-erbstreit-2026-10-30/chart-geometry.json`.

Kein Gerichtsurteil und keine Verlautbarung vorweggenommen. Diese Ausarbeitung wurde lokal eingebunden; keine Firebase-Daten geschrieben und kein neuer Deploy durchgeführt.
