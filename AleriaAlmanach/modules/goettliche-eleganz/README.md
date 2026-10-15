# Göttliche Eleganz

Redaktionelle Quelle für das Gwynthorer Geschäft und die Familien Raves/Veltrane.

- `eleganz-family-people.mjs`: verbindliche Namen, Welt-IDs, Verwandtschaften und Porträtpfade.
- `eleganz-module.mjs`: sechs Seiten mit bestehenden Almanach-Templates; nur der Verkaufsraum ist interaktiv.
- `eleganz-hierarchy.mjs`: drei wechselbare Reiter, sieben arbeitende Familienmitglieder und 15 einzeln benannte freie Posten.
- `eleganz-collection.mjs` / `eleganz-catalog.mjs`: 20 Hausgarnituren und sechs Hochzeitsmodelle in vier Reitern des Güterregisters. `eleganz-wedding-collection.mjs` enthält je drei Braut- und Bräutigamsgarnituren.
- `eleganz-characters.mjs`: reiner Importplan für die gemeinsame Charakterverzeichnis-Publikation. Bestehende Profile erhalten ausschließlich Familienquellen; Welt-IDs und andere Sammlungen bleiben erhalten.

Die Familienakten liegen unter `Stammbäume/assets/js/data/eleganz-family-records.js` und `eleganz-family-links.js`. Maelwen Coeddu behält ihre bestehende Welt-ID. Die Maerllys-Hauptlinie folgt seriell hinter Gwenoras älterem Schneiderzweig. Luciano gehört einem anderen, nicht einzeln überlieferten Veltrane-Zweig an.

## Preise

Verglichen mit dem vorhandenen Standardregister (`item-register-standard.js`): einfache Kleidung 10 Kupfertaler, Wollmütze 6 Kupfertaler, Leinenband (5 m) 1 Kupfertaler und Stoffrüstung 50 Kupfertaler. Die günstigsten vollständigen Hausgarnituren beginnen bei 18 Kupfertalern. Seide, Silberstickerei und Maßarbeit steigern den Preis; die Spitzenmodelle enthalten mehrteilige Einzelentwürfe, Weißgoldfassungen und ausgewählte Steine für 48 beziehungsweise 52 Goldtaler. Die Hochzeitsmode reicht von 220/240 Kupfertalern über 2,8/3 Goldtaler bis zu 65/68 Goldtalern für persönliche Einzelentwürfe. Das sind gestalterisch festgelegte Verkaufspreise anhand der vorhandenen Spielökonomie. Die serverseitige Angebotsauflösung prüft die tatsächlichen Kupferwerte aller 26 Angebote ohne Kaufvorgang.

## Bilder

Alle 14 Porträts wurden nach der Nutzerkorrektur vom 16. Oktober neu erstellt: gespeicherter Aleria-Anime-Stil, stehende Oberkörperporträts, ruhige unterschiedliche Posen ohne gehaltene Gegenstände. Elternporträts dienten bei den Kindern als zusätzliche Identitätsreferenz. Wappen sind immer kreisrund. Die freigegebene Alphabereinigung verändert ausschließlich den Alphakanal, keine RGB-Werte.

Finale Bilder: `AleriaAlmanach/assets/goettliche-eleganz/` und die beiden Wappenpfade im Stammbaum-Verzeichnis. Prompts: `assets/goettliche-eleganz/image-prompts.json`. Erzeugung mit dem eingebauten Bildwerkzeug. Abgelehnte Varianten bleiben lokal erhalten und werden nicht veröffentlicht.

Die Kleidungsbilder liegen unter `assets/goettliche-eleganz/kleidung/`, ihr vollständiger Promptsatz in dessen `image-prompts.json`. Nutzeranweisung vom 16. Oktober: handgemalter Rüstungs-/Inventarstil, weiße kopflose Puppentorsi, Oberteil und Hosenansatz beziehungsweise oberer Rockansatz, keine Beine, Füße oder Schuhe. Die Rüstungen dienen ausschließlich als Malstilreferenz; die beiden ersten Kleidungsbilder bestimmen das gemeinsame Präsentationsformat. Keine echten Personen oder anatomischen Hände.

## Bauen und veröffentlichen

```powershell
node AleriaAlmanach/scripts/build-goettliche-eleganz.mjs
node AleriaAlmanach/scripts/build-eleganz-clothing-prompts.mjs
node 'Familien Häuser und Clans/scripts/build-house-content.mjs'
node AleriaAlmanach/scripts/publish-eleganz-families.mjs --apply
node --test --experimental-test-isolation=none AleriaAlmanach/tests/goettliche-eleganz.test.mjs AleriaAlmanach/tests/krumme-kanne.test.mjs
node AleriaAlmanach/tests/goettliche-eleganz.browser.mjs
node firebase/scripts/content/publish-goettliche-eleganz.mjs
```

Der letzte Befehl ist zunächst ein lesender Probelauf. Nach Veröffentlichung der statischen Dateien prüft `--apply` die exakte Online-Bildfassung, sichert die ursprünglichen Firestore-Dokumente verschlüsselt und veröffentlicht Modul, Profile und Sammlungszuordnungen atomar mit Versionsvorbedingungen. Keine Käufe, Kämpfe, Kommentare oder Live-Ressourcen werden verändert.
