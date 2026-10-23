# Ivarsheim – Übertragung vom 21. Oktober 2026

Die acht Herrschaftsseiten und die reguläre Karte sind lokal eingebunden. Es wurde nichts gepusht oder deployt.

## Quellen und Koordinaten

- World-Anvil-Karte: `a23f5373-807c-4868-8563-43181a86be46`. Alle **136 Einträge** wurden über die verbundene Chrome-Erweiterung aus Markierungsliste und Bearbeitungsformularen gelesen. Die vollständigen Formulartexte, Verknüpfungsfelder und Originalkoordinaten stehen in `sources/worldanvil-markers.json`; die Liste daneben ermöglicht einen unabhängigen Vollständigkeitsabgleich.
- **118 Ortsmarker**, sieben zusätzliche Gildenmarkierungen und elf alte Gebiets-/Verwaltungseinträge. Die 18 überlagernden Einträge bleiben als Quellen erhalten und erzeugen keine doppelten Orte. Die neuen eingezeichneten Regionen ersetzen die alten Flächen.
- Sieben unverändert archivierte HTML-Artikel mit SHA-256-Prüfsummen unter `sources/`. Übernommen wurden Daten und Texte, nicht deren Tabellenlayout.
- Ausschließlich die drei gelieferten Bilder aus `Downloads/Jarltum Ivarsheim`: Normal, Regionen, Markierung. Original- und WebP-Prüfsummen stehen in `images.source.json`. Alle Bilder messen **4096 × 2682 Pixel**. Alte Einzelkarten wurden nicht übernommen.
- Die Originalkoordinaten bleiben in jedem `sourceRef` unangetastet. Die neuen Positionen folgen den Spitzen der gelieferten Kartenzeichen. Laufzeitkoordinaten: `x = X / 4096`, `y = 1 - Y / 2682`, wenn Y von unten gemessen wird. `targetPosition` dokumentiert zusätzlich die von oben gemessene Bildposition.
- Zwei überlappende Zeichen bei Kaldhaug sind getrennt erfasst: das Hügelgrab und die zusätzliche Ruine Caer Dathruinn.

## Ergebnis und Einordnung

**126 Orte**, davon 118 bestehende mit dauerhafter World-Anvil-ID und acht mit ausdrücklich freigegebenen neuen Namen und Texten. Jeder Ort ist über sein Herrschaftsregister direkt auf der Karte erreichbar. Karte und Register verwenden dieselben Beschreibungs- und Zuordnungsdaten.

Die Jarltumsseite breitet sechs eigene Hauptgebiete aus: Ivarsklamm, Silberzungen, Trachwyll, Klippenschlag, Rothain und Saatgrund. Sie führt 108 eigene Orte. Die 15 Orte Winterwachts stehen ausschließlich auf dessen eigener, unter Saatgrund verschachtelter Seite. Die drei Schwarzdorn-Pachtorte erscheinen auf den jeweiligen örtlichen Herrschaftsseiten als getrennte Exklaven; der auswärtige Clan bleibt den Varulv zugeordnet.

| Seite | Eigene Orte | Zusätzliche Exklave |
| --- | ---: | --- |
| Thanentum Ivarsklamm | 12 | Gerstenberg |
| Herrschaft der Silberzungen | 8 | – |
| Herrschaft der Trachwyll | 8 | – |
| Thanentum Klippenschlag | 24 | – |
| Thanentum Rothain | 26 | Hjorthorn |
| Thanentum Saatgrund | 30 | Tirann |
| Hesirentum Winterwacht | 15 | – |

Klippenschlag ist ein **Thanentum**, Clan Grendel ein **Thanenclan**. Thorvalds heutiger Titel wurde angepasst; historische Hesirentitel blieben erhalten. Der Abgleich bereits gespeicherter Grendel-Akten aktualisiert nur die freigegebenen Rang-/Titelmetadaten und bewahrt spätere lokale Personen-, Bild-, Sitz- und Ansichtsbearbeitungen.

**Hårfjel** wurde auf Nutzerentscheidung nach Ivarsklamm westlich von Caer Trachwyll übertragen; seine Grendel-Herkunft bleibt beschrieben. Baltborg und Robynsweid liegen im Grenzbereich des nördlichen Rothain. Gilden und Orden behalten ihre ausdrücklich genannten Zugehörigkeiten; eine Lage im Clanland macht eine Ordensburg nicht zur Clanburg.

Neue Namen: **Hjarnentor**, **Skarenvik**, **Hrafnskar**, **Riffweide**, **Skeldkliff**, **Brandungsstieg**, **Broch Maeldun** und **Caer Dathruinn**. Die Namen wurden gegen den vorhandenen Ortsbestand geprüft. Ihre Texte folgen Karte und Nutzerkontext: westlich Meer, südlich Roriksheim, östlich jenseits des Grenzflusses Schwarzfenn.

Fridtun, Torsvik, Ravnholt und Alsvik wurden an die bewohnten Orts-/Burgsymbole der neuen Karte angepasst. Die frühere Zerstörung bleibt als Geschichte erhalten. Sämtliche Zuordnungen und bewussten Änderungen sind in `import-decisions.source.json` dokumentiert.

## Fehlende Texte

**Ivarsfels, Hjerimsheim, Jägersruh, Kornweiler und Winterfeste** haben in World Anvil keinen eigenen Markerbeschreibungstext. Die Marker sind erhalten und ausdrücklich als fehlende Quelle gekennzeichnet. Die jeweiligen Herrschaftsartikel sind vorhanden; daraus wurden keine vermeintlichen vollständigen Ortsbeschreibungen erfunden. Insgesamt enthalten 121 Kartenorte Beschreibungstexte.

## Darstellung und Prüfung

- Gemeinsame Herrschaftsoberfläche, Ortsvorlagen, Kategorien, Wappen, Banner und lokale kanonische Ratsbilder; keine kopierten Alt-HTML-Layouts.
- Standardgrößen **Dot 80 / Schrift 50**. Die mit Roriksheim einheitliche Symbolskalierung bleibt erhalten.
- Gezielter gemeinsamer Registerfix: Beschreibungsaufklapper und Hauslinks liegen über der klickbaren Kartenfläche; geöffnete Beschreibungen erhalten ihre Absätze und lassen das Symbol oben stehen.
- Alle acht Seiten bei 390 Pixeln, Haupt-/Herrschaftsseiten bei 1440 Pixeln sowie die Hauptseite bei 768 Pixeln geprüft: kein seitlicher Seitenüberlauf, korrekte Verschachtelung und keine fehlenden geladenen Orts-/Wappenbilder. Aufklapper und Kartendirektlink praktisch geöffnet.
- **40 zielbezogene Tests bestanden** (Ivarsheim, Aldrimar und Roriksheim). Kartenstrukturprüfung: **0 Fehler**, 174 bereits bestehende Hinweise auf identische Bildinhalte.
- Die vollständige Stammbaumprüfung meldet **14 Fehler unter 1246 Tests**. Ein separater Lauf mit dem bisherigen Registry-Abgleich meldet exakt dieselben 14 Fehler; keine zusätzliche Abweichung durch die Rangübernahme. Beleg: `diagnostics/ivarsheim-2026-10-21/family-regression.json`.
- Bildschirmbelege und responsive Prüfwerte: `diagnostics/ivarsheim-2026-10-21/` im Projektstamm.

Reproduzierbare Prüfungen:

```text
node Kontinente/scripts/build-ivarsheim.mjs --check
node Kontinente/scripts/build-roriksheim.mjs --check
node Karten/tools/import-ivarsheim.mjs
node --test --experimental-test-isolation=none Kontinente/tests/ivarsheim.test.mjs Kontinente/tests/aldrimar.test.mjs Kontinente/tests/roriksheim.test.mjs Karten/tests/roriksheim-transfer.test.mjs
node Karten/tools/validate-karten-structure.mjs
```

Der Schreibmodus des Kartenimports verweigert das Überschreiben bereits bearbeiteter Karten. Nachträgliche Übertragungen dürfen die vorhandenen Revisionen und lokalen Daten nicht auf null zurücksetzen.

## Bildaustausch vom 22. Oktober 2026

Die drei vom Nutzer neu bereitgestellten Dateien im Downloadordner wurden erneut übernommen: Normal-, Regionen- und Markierungskarte. Alle behalten **4096 × 2682 Pixel** und dieselbe räumliche Ausrichtung. Der Vergleich zeigt vor allem überarbeitete Farben und Darstellung; eine Umrechnung oder Verschiebung vorhandener Marker ist nicht erforderlich.

Die drei WebP-Kartenbilder und die Vorschau auf den Herrschaftsseiten sind aktualisiert. `images.source.json` enthält die neuen Prüfsummen sowie die vorherigen Quell- und Ausgabesummen. **`data.json`, Kartenrevision, Markerpositionen, Beschreibungstexte und Gebietszuordnungen wurden nicht verändert.** Ebenso unverändert blieben die Karten von Roriksheim und Schwarzfenn. Der Prüfsummenbeleg liegt unter `diagnostics/ivarsheim-2026-10-22/image-replacement.json`. Kein Push oder Deployment.
