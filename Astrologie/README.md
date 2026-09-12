# Der Sternencodex von Aleria

Statische, ohne Anmeldung lesbare Astrologieseite im Buchstil von Religionen und Bestiarium. Einstieg: `Astrologie/index.html`, im Almanach unter **Sternzeichen** verlinkt.

## Verantwortlichkeiten

- `modules/zodiac/zodiac-data.mjs`: Monatszuordnungen, infernale Widersacher, Deutungen und Bahnparameter. Die bestehenden internen Felder `gift`, `trial` und `shadowId` bezeichnen Tugendneigung, Versuchung zur Sünde und Widersacher; keine Dualität innerhalb einer Gottheit.
- `modules/zodiac/zodiac-repository.mjs`: liest Namen, Beinamen, Seitenziele und vorhandene Themenbilder aus dem Religionskatalog und verhindert doppelte infernale Zuordnungen. Keine zweite Götterdatenbank.
- `modules/zodiac/zodiac-art.mjs`: gemeinsame Bilddarstellung für Titelbereich und Sternenkarten. Die Themenbilder werden direkt aus `Religionen/assets` geladen und als Ausschnitte untereinander dargestellt; der infernale Ausschnitt wird per CSS um 180° gedreht. Die Originaldateien bleiben unverändert. Fehlende Bilder oder noch offene Zuordnungen erhalten einen Platzhalter. Oben steht die Tugend, unten die Warnung vor der infernalen Versuchung.
- `modules/ephemeris/ephemeris-model.mjs`: reine Berechnung mit der übergebenen gemeinsamen `AleriaCalendar`-API. Kein Firebase-Zugriff, kein Zufall, keine Speicherung.
- `modules/page`: statische Seitenerzeugung und lokal gekapselte Bedienung. Ereignisse werden auf der Seite delegiert; die Datumsabfrage verändert das Weltdatum nicht.
- Das lokale Weltdatum wird ausschließlich über `AleriaWorldDateStore.getState()` gelesen. Ohne lokalen Stand gilt das zentrale Standarddatum. Es wird keine zusätzliche Firebase-Verbindung aufgebaut.
- `assets/cards`: 19 ungenutzte Sternenkarten als WebP. Auf Nutzerwunsch verwendet die Seite vorerst die vorhandenen Themenbilder des Glaubenscodex. Die abgelehnten Sternenkarten werden nicht geladen; die bisherigen Entwürfe und ihre Herkunft in `assets/sources.json` bleiben erhalten.

## Weltregeln vom 12. September 2026

Die vom Nutzer vorgegebenen Regeln: 13 Monate; acht der neun Celestialen plus fünf Untergötter als Monatszeichen; Ordan als nur alle 1.000 Jahre sichtbarer Drache; fünf Souveräne auf berechenbaren, durch die Monate wandernden Bahnen; göttliches Zeichen und Zeichen des infernalen Widersachers gleichzeitig sichtbar. Zwei Monde und eine benannte Sonne. Die Karten behalten die Gottheit oben mit blauem Hintergrund und den Widersacher unten mit rotem Hintergrund. Nachträgliche Korrekturen des Nutzers: jeden Infernalen nur einmal zuordnen und Ordan mit Adar verbinden. Nach den zwischenzeitlichen Platzhaltern dienen die vorhandenen Themenbilder vorerst als Übergangslösung; die untere Hälfte steht wie bei einer Spielkarte auf dem Kopf.

### Verbindliche theologische Korrektur des Nutzers

Die Celestialen sind absolut gut, statisch und unveränderlich. Ihre Tugenden sind vollkommen; die Gottheiten werden weder korrumpiert noch durch einen infernalen Anteil vervollständigt. Das Infernale ist die Abwesenheit des Guten, keine gleichwertige Gegenkraft oder notwendige Ergänzung. Die Infernalen verkörpern Sünde und wollen Menschen korrumpieren, die nach Vollkommenheit streben oder sich bereits für gut halten.

Das Bild des Nutzers ist Rost an einem Schwert: Ohne Rost bleibt das vollkommene Schwert; Rost für sich ist wertlos. Entsprechend zerstört Sünde das gute Potenzial eines Menschen. Ein Geburtszeichen deutet sowohl seine Neigung zu den Tugenden der Gottheit als auch seine Anfälligkeit für jene Sünden, die dieses Potenzial herabziehen. Es beschreibt keine Wandlung der Gottheit. Die gleichzeitige Sichtbarkeit der Sternbilder und die zwei Kartenhälften begründen keine theologische Dualität oder anzustrebende Balance.

Die Deutungen müssen Tugend, menschliche Anfälligkeit und den Versuch ihrer Korruption unterscheiden. Infernale sind keine Lehrer, die eine hilfreiche Lektion oder fehlende Tugend ergänzen. Insbesondere bei der Maid stehen Enthaltsamkeit, Treue, Fürsorge und Kreativität den Versuchungen zu Wollust, Untreue, Faulheit und Vernachlässigung gegenüber.

Spätere ausdrückliche Herkunftsfestlegung des Nutzers: **Syressa war eine Celestiale und wurde durch Stolz infernal.** Diese konkrete Vorgabe bleibt für ihre Biografie maßgeblich und darf nicht durch die ältere pauschale Beschreibung umgedeutet oder entfernt werden. Ihre gegenwärtige Rolle als Widersacherin Rheas begründet weiterhin keine notwendige Ergänzung oder Dualität der Tugend. Die vollständigen Herkunfts- und Hierarchieentscheidungen stehen in [INFERNALE_ERWEITERUNG.md](../Religionen/docs/INFERNALE_ERWEITERUNG.md).

### Zuordnungen und Bahnen

Alle 19 Gottheiten und ihre 19 eindeutigen Widersacher sind im Religionscodex registriert und mit Themenbildern dargestellt.

| Monat | Zeichen | Infernaler Widersacher |
| --- | --- | --- |
| Sternwacht | Orin | Amon |
| Silberglanz | Mariel | Lunara |
| Lichtkehr | Maldras | Bhaal |
| Himmelsbogen | Sylvana | Zatrach |
| Sonnenkranz | Jovena | Azrath & Morvath |
| Goldschein | Lyris | Sanguine |
| Hochlicht | Selarion | Nemsara |
| Abendglut | Baldran | Grimnar |
| Dämmerschleier | Auron | Nergaloth |
| Mondpfad | Tharim | Nyxara |
| Schattenruh | Tethyra | Nhaera, die Heimatlose |
| Nachtkrone | Orith | Migdal |
| Jahrswend | Kharon | Hela |

**Drachennacht:** nur am 36. Jahrswend der Jahre 1000, 2000, 3000 usw. Ordan/Adar ergänzt Kharon/Hela, ersetzt den Monat jedoch nicht. Die Festlegung auf genau diese eine Nacht ist eine neue Präzisierung des Jahrtausendzeichens.

**Gestirne:** Sonne Áine; großer silberner Mond Brìgh (36 Tage); kleiner blauer Mond Aonghus (52 Tage). Gälisch inspirierte Benennung innerhalb der Fantasywelt, keine Behauptung über historische Mondgottheiten. Die Zuordnung Brìgh/Mariel und Aonghus/Lyris/Orin ist neue astrologische Überlieferung. Beide Monde beginnen am 1. Sternwacht mit Neumond und stehen am 19. Hochlicht gemeinsam im Vollmond. Ihr gemeinsamer Zyklus hat 468 Tage.

**Souveräne:** Nimue/Thraal: Umlauf 47, Versatz 8, Sichtdauer 3 Tage; Rhea/Syressa: 73/29/4; Zephyr/Maelach: 97/51/3; Aelthar/Nymhra: 127/79/2; Thyrael/Dagon: 163/113/3. Sämtliche Widersacher sind ausgewählt. Syressa, Maelach, Nymhra und Nhaera besitzen Katalogeinträge und Bilder. Alle neuen Zuordnungen und die festgehaltenen Mythen sind über [INFERNALE_ERWEITERUNG.md](../Religionen/docs/INFERNALE_ERWEITERUNG.md) erreichbar. Gerechnet wird mit verstrichenen Tagen seit dem 1. Sternwacht 1 (T = 0). Sichtbar ist ein Souverän, wenn der nichtnegative Rest `(T - Versatz) mod Umlauf` kleiner als die Sichtdauer ist. Die Bahnen laufen kontinuierlich über Jahresgrenzen; mehrere Souveräne dürfen gleichzeitig erscheinen.

Die großen Feindschaften sind im Religionscodex verankert. Weitere Zuordnungen der Untergötter und Souveränen sind **astrologische Zuordnungen von Versuchungen**, keine rückwirkende Änderung ihrer religiösen Biografien. Auf ausdrücklichen Wunsch des Nutzers wird Thraal im Sternzeichenregister ausschließlich Nimue zugeordnet. Tethyras neue Widersacherin ist Nhaera, ihre mythologische Zwillingsschwester; ihre Deutung verbindet Abenteuerlust und Freiheit mit der essenziellen Heimkehr. Adar erscheint bei Ordan in der Drachennacht, Dagon ausschließlich bei Thyrael. Ältere dualistische Formulierungen in anderen Codextexten oder den archivierten Bildentwürfen sind keine Grundlage für die astrologische Deutung; maßgeblich ist die oben dokumentierte Korrektur des Nutzers.

## Aktualisieren und prüfen

Aus `AleriaAlmanach`:

```sh
npm run build:astrology
npm run check:astrology
npm run test:astrology
```

Der normale Vite-Build erzeugt die Seite im Prebuild mit und führt sie als eigenen HTML-Einstieg. Die eingecheckte HTML-Seite bedient auch das statische Hosting des Repositorys. Änderungen an Göttern erfordern anschließend `build:astrology`, damit sichtbare Texte und eingebettete Browserdaten gemeinsam aktualisiert werden.

Datumsabfragen lassen sich über `?year=1740&month=3&day=9#firmament` teilen. Eingaben müssen vollständig und ganzzahlig sein (Jahr 1–999999). Ausblicke dürfen darüber hinausreichen, etwa bis zur Drachennacht des Jahres 1000000.
