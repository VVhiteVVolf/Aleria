# Persönliche Ausrüstungsbilder · 28. September 2026

41 quadratische PNG-Illustrationen mit echtem Alphakanal bilden die konkret vorhandene Ausrüstung von Gawain, Freya, Guinevere, Gildas, Ylva, Asgeir, Rhiannon, Gais, Nudd und Fenrir ab. Der Bestand wurde mit den lokalen Bögen und lesend mit den zehn Online-Dokumenten abgeglichen. Rhiannons Amethyst-Zauberstab, Dolch und Amulett wurden während der Arbeit ausdrücklich vom Nutzer benannt. Die leeren Vorlagen „Hauptwaffe“ und „Persönlicher Gegenstand“ werden unter ihren vorhandenen IDs konkretisiert; der Dolch erhält eine eigene Inventar-ID. Es werden keine Kampfwerte oder magischen Boni ergänzt.

[Galerie](../../public/assets/character-equipment/index.html) · [Prompts, Referenzen und Zuordnungen](../../public/assets/character-equipment/image-prompts.json)

## Gestaltung

Erstellt mit der integrierten Bildgenerierung. Stilvorlagen: `D:/0-KI Generierte/01 Bilder/01 - Items/Beispiele`. Rüstungen orientieren sich an Hauptportraits und vorhandenen Hauskriegern (Draig, Gafyr, Bleiddorn, Wyrm, Saethwyr); Freya und Fenrir an ihren Portraits. Eine lokale Neidr-Hausseite war nicht vorhanden, daher verwendet Guinevere ihr Portrait. Erfasste Rüstungstypen bleiben maßgeblich.

Ein physischer Gegenstand verwendet ein Bild: Schildstoß teilt das Schildmotiv; Guineveres Pfeilvarianten teilen den jeweiligen Bogen; Asgeirs Handäxte in beiden Händen teilen ein Motiv. Pfeilarten haben eigene Bilder. Gawain und Gildas verwenden denselben bereits gemeinsamen Draig-Dolchtyp.

## Zuständigkeit und Datenfluss

`modules/character-equipment/equipment-artwork.js` löst Bilder anhand von Figuren-ID und Inventar-/Kampfeintrags-ID auf. Keine Zuordnung nur anhand von Namen oder generischen Starter-IDs. Für Gildas sind sowohl die lokale als auch die abweichende Online-ID enthalten.

Das Manifest erzeugt mit `npm run build:equipment-artwork` den kleinen Laufzeitkatalog und die Galerie. `npm run check:equipment-artwork` prüft eindeutige Bindungen, vorhandene quadratische RGBA-Dateien und aktuelle generierte Ausgaben. Neue Bilder erhalten neue versionierte Dateinamen. Bei späteren Bildrevisionen bisherige veröffentlichte URLs in `legacyImages` übernehmen, damit gespeicherte Darstellungen aktualisiert werden können.

- Inventar und Marktbesitz verwenden die gemeinsame Inventarprojektion.
- Kampfbogen und Kommentarausrüstung verwenden die gemeinsame Kampfprofilprojektion.
- Das Charakterbogenarchiv übernimmt die Bilder aus Profil und Güterregister. Bewusste eigene Bilder und Archiv-Overrides bleiben erhalten.
- Bei zukünftigen Gegenstandsübergaben wird das aufgelöste Bild in die übergebene Instanz übernommen; es bleibt beim neuen Besitzer erhalten. Die Serverkopie wird vom bestehenden Mechanik-Sync erzeugt.

Für die vorhandene Ausrüstung erfolgt keine Bildmigration in Firestore. Ausschließlich Rhiannons drei nachbenannte Gegenstände werden einmalig über einen bedingten Patch auf `inventory.items` und `inventory.revision` eingetragen, mit Prüfung des aktuellen Dokumentzeitstempels und unveränderten übrigen Feldern. TP, Aktionsressourcen, Ausrüstungsregeln, bestehende Besitzzuordnungen und alte Kommentar-/Kampfsnapshots bleiben erhalten. Die Cache-Versionen der betroffenen Importketten sind gemeinsam erhöht.

## Bildkorrekturen vom 28. September 2026

Neun Motive wurden auf Nutzerwunsch neu erstellt: Guineveres Lang- und Kurzbogen mit gerader, an beiden Enden befestigter Sehne; Ylvas Dornwacht als eleganter Speer mit Wolfskopf-Fassung; Gais' Lanze als verzierter Speer; Rhiannons Amethyst-Zauberstab mit Drachenkrone und ihr schlanker Dolch mit Draig-Symbolik. Nudd, Gawain und Gildas erhalten ausschließlich den Harnisch mit offenen Hals- und Armausschnitten.

Die neuen Dateien ersetzen ihre Vorgänger über den gemeinsamen Bildkatalog. Bekannte veröffentlichte Projektbilder werden auch bei bereits übertragenen Gegenständen auf die aktuelle Fassung aufgelöst; geteilte externe Platzhalter bleiben an die jeweilige Figur gebunden. Alte veröffentlichte Dateien bleiben erreichbar. Die Korrektur verändert keine gespeicherten Spielstände oder Kampfwerte.

Anschließend wurde Rhiannons Amethyst-Zauberstab auf ausdrücklichen Wunsch erneut vereinfacht: durchgehender Holzschaft ohne abgesetzte Griffzone, Wicklungen oder Metallbeschläge; ein violetter Amethyst in einer kleinen Holzfassung. Der Nutzer hat die zunächst genannte Zuordnung zu Guinevere ausdrücklich auf Rhiannon korrigiert. Beide bisherigen veröffentlichten Stabbilder werden über `legacyImages` auf die neue Fassung aufgelöst.

## Prüfung

Alle 41 ausgewählten Dateien wurden visuell und per Alphakanal geprüft: 1:1, RGBA, vollständig transparente Ecken und transparente Außenflächen. Gemalte Schachbrett-Hintergründe wurden durch erneute Bildbearbeitung ersetzt. Integrationstests prüfen gemeinsame Bildpfade, eigene Bilder, Figurenabgrenzung, Schild/Schildstoß, Weitergabe, Unveränderlichkeit und wiederholte Projektion. Bestehende Charakter- und Ausrüstungsregeltests bleiben Teil der Freigabeprüfung.

Lokaler Chromium-Check: alle 41 Galeriebilder dekodiert, Galerie bei 1441 und 390 Pixeln geprüft; tatsächliche Renderer für Inventar, Markt, Kampfbogen, Charakterbogenarchiv und Kommentarausrüstung mit bestehenden Figuren geladen. Keine JavaScript-Fehler. Dabei wurden keine Online-Schreibvorgänge ausgeführt.
