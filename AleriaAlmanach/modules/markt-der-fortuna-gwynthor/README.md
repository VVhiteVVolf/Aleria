# Markt der Fortuna · Gwynthor

Lokaler Schwesterbereich zum Münze-Handelsposten. Zwei Module: Handelshof mit getrennten Seiten für Markt, Blaue Bank, Blaue Kompanie und die kleine Tafel von Mariels Gabe; sieben Interessenbünde und das belegte Partnernetz. Fünf neue Szenenbilder, fünf interaktive Szenen. Kein Push, Deployment oder Schreiben in Live-Daten.

## Verantwortung

- `fortuna-section.mjs`: gemeinsamer Archivpfad und bestehende Gildensymbole; von den drei zugeordneten Geschäftsbuildern wiederverwendet.
- `fortuna-factions.mjs`: sieben führende Häuser, neun institutionelle Ratssitze. Keine erfundenen Personen, Stammbäume oder Wappen für Falto/Nerva.
- `fortuna-network.mjs`: bestehende Partner mit ausdrücklicher Beziehungskategorie und Quellenpfad. Familienkontakte sind keine automatische Mitgliedschaft.
- Vier eigene Hierarchiemodelle; gemeinsame Darstellungslogik in `modules/guild-trading-post/trading-post-hierarchy.mjs`. Die Münze verwendet dieselbe Darstellung mit unveränderten Ausgabedaten.
- `fortuna-module.mjs`: Stories, Familien-/Partnerseiten und stabile Szenen-Threadschlüssel.
- `scripts/build-markt-der-fortuna-gwynthor.mjs`: generierte Registrierung und einzeln importierbare Modulpakete. Bestehende Betriebe werden anhand bestehender IDs verschoben, nicht kopiert. Eigene Archivpositionen und Bearbeitungen bleiben wirksam.

## Nutzerfestlegungen vom 18.10.2026

Örtlicher Verbund: Markt der Fortuna, Blaue Bank, Blaue Kompanie. Dazu nur Mariels Gabe als tatsächlich hier tätige Untergilde. Windreiter werden in diesem Modul nicht aufgeführt; Geeinte Hände erhalten keinen Gwynthorer Bereich. Das allgemeine Fraktionsregister behält deren weltweite Einträge unverändert.

Mariels Gabe ist eine Kaufmannsgilde aus Weisenfluh unter Fortuna. Ihre Warenankünfte laufen den Fortuna-Hafen an. Die dauerhafte örtliche Funktion ist fast ausschließlich die kleine Tafel der Mutter: genießbare aussortierte Lebensmittel vor dem Verderb an Bedürftige und kirchliche Empfänger weitergeben. Drei feste Posten, keine große zweite Handelsverwaltung.

Führende Häuser: Falto, Nerva, Tonnarth, Braglas, Aelmor, Coeddu, Maerllys. Falto und Nerva sind Magnarierhäuser unter Vinicius, seit Jahrhunderten in Gwynthor vertreten; Falto länger, schon vor dem örtlichen Handel der Münze. Falto: Bankwesen, Kaufmannschaft und viele Handelsschiffe. Nerva: militärische Seefahrt, Kriegsschiffe, Metallhandwerk, Schiffbau. Lokale Rivalen.

Planerische Amtsverteilung dieses Ausbaus: Falto 2 und Nerva 2 Ratssitze, die fünf cenyrischen Häuser je 1; kein einzelner Gildenherr. Bankleitung Falto, Kommandantur Nerva. Neue Führung bleibt wie beim Münze-Ausbau zunächst institutionell. Stellenzahlen unterhalb der Führung sind redaktionelle Planung.

Aelmor dienen Saethwyr und bauen Handelsschiffe, keine Kriegsschiffe. Konkurrenz zu den ebenfalls Saethwyr dienenden Gwlannor. Die gemeinsame kanonische Hausprofilquelle wurde entsprechend aktualisiert; Identitäten, Generationen und bestehende Tätigkeiten werden erhalten. Die übrigen bestehenden Dienstbindungen bleiben erhalten; insbesondere erhalten Brenric und Llywelyn kein erfundenes Handels- oder Kompanieamt.

## Ergebnis der Bestandssuche

| Familie | Tatsächlich bestehende Verbindung | Quelle |
| --- | --- | --- |
| Vann | Mitglied und Verbündeter Fortunas; Brenn Kunde der Blauen Bank | Letzte-Rast-Originalbiografie und Vann-Hausseite |
| Raves | Handelskooperation; Tiberian pflegt die Route | Eleganz-Personen-/Modulmodell und Raves-Hausseite |
| Pendrwn | Regelmäßige Belieferung des Vollen Korbs; nur Cadwgan und Idwal | Store-Modell und Pendrwn-Ladenzweig |
| Veltrane | Tirnarischer Partner Fortunas; Stammhaus der Raves | `eleganz-family-records.js` |

Tonnarth, Braglas, Aelmor, Coeddu und Maerllys besitzen bestehende Stammbäume; ihre aktuelle Fortuna-Führungszuordnung stammt aus diesem Nutzerauftrag. Falto/Nerva sind hier neue institutionelle Einordnungen. Ehen allein ziehen keine weitere Familie in die Gilde. Das Partnernetz ist nach Nutzerkorrektur auf Vann, Raves, Cadwgans Pendrwn-Zweig und die über Raves angebundenen Veltrane begrenzt.

## Prüfung und Artefakte

`npm run build:markt-der-fortuna-gwynthor`, `npm run check:markt-der-fortuna-gwynthor`, `npm run test:markt-der-fortuna-gwynthor`.

Bilder und vollständige Prompts: `assets/markt-der-fortuna-gwynthor/`, built-in image_gen, unveränderte 2:3-PNGs gemäß anime-scene-portrait. Modulpakete und Quellen-/Platzierungsplan: `Charakter Archiv Exporte/Module/Markt der Fortuna Gwynthor/`.
