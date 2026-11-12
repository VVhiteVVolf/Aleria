# Göttliche Eleganz

Redaktionelle Quelle für das Gwynthorer Geschäft und die Familien Raves/Veltrane.

- `eleganz-family-people.mjs`: verbindliche Namen, Welt-IDs, Verwandtschaften und Porträtpfade.
- `eleganz-module.mjs`: sechs Seiten mit bestehenden Almanach-Templates; nur der Verkaufsraum ist interaktiv.
- `eleganz-hierarchy.mjs`: drei wechselbare Reiter, elf arbeitende Personen einschließlich Eirlys Vann, Rhys Maerllys, Catrin und Efa Gwernant sowie elf freie Posten.
- `eleganz-sales-staff.mjs`: ausdrücklich bestätigte externe Verkaufskräfte mit Identität aus der zuständigen Familienquelle; Beschäftigung und Darstellung gehören dem Shopmodul.
- `eleganz-collection.mjs` / `eleganz-catalog.mjs`: 51 Garnituren in vier Reitern des Güterregisters: je 15 Damen- und Herrenmodelle, 13 Brautkleider und acht Bräutigamsgarnituren. Die Erweiterung vom 4. November liegt getrennt in `eleganz-womens-additions.mjs`, `eleganz-mens-additions.mjs` und `eleganz-bridal-additions.mjs`; die ursprünglichen Produktkennungen bleiben erhalten.
- `eleganz-characters.mjs`: reiner Importplan für die gemeinsame Charakterverzeichnis-Publikation. Bestehende Profile erhalten ausschließlich Familienquellen; Welt-IDs und andere Sammlungen bleiben erhalten.

Die Familienakten liegen unter `Stammbäume/assets/js/data/eleganz-family-records.js` und `eleganz-family-links.js`. Maelwen Coeddu behält ihre bestehende Welt-ID. Die Maerllys-Hauptlinie folgt seriell hinter Gwenoras älterem Schneiderzweig. Luciano gehört einem anderen, nicht einzeln überlieferten Veltrane-Zweig an.

Wegverheiratete Linien enden im Herkunftsbaum am verlinkten Zielhaus. Maelwens Tochter wird nur bei Raves fortgeführt; Eirians Kinder nur bei Svathamar und Mairs jüngere Kinder nur bei Dubhdarach. Caradog bleibt Tonnarth. Eleonora ist die ausdrücklich festgelegte Ausnahme: Ihre Kinder führen Raves fort. `married-away-continuation.js` entfernt die doppelten Projektionen einschließlich alter gespeicherter Fassungen; die Veröffentlichung prüft den Erhalt derselben Weltpersonen und ihrer Abstammung im Zielhaus. Veraltete Charakter-Quellenverweise werden gezielt entfernt.

Die Modulkarte verwendet `previewImage` für die Außenansicht. Ein ausdrückliches Vorschaubild hat Vorrang vor der sonst üblichen Gildenwappen-Auswahl und bleibt im Moduleditor bearbeitbar.

Am 6. November 2026 ist Rhys Maerllys auf ausdrückliche Nutzerwahl für
„Verkauf · Alltag & gute Tuche“ ergänzt. Name, Weltpersonen-ID und Alter stammen
aus der bestehenden Maerllys-Familie; das neue Verkäuferporträt liegt unter
`assets/goettliche-eleganz/portraits/rhys-maerllys.png`. Seine Beschäftigung
erzeugt keine neue Familienprojektion oder Figurenakte und verändert weder
`ELEGANZ_PEOPLE` noch den Szenen-Cast. Eirlys Vanns bestehende Festkleidungsberatung
und Maelwens Empfang bleiben erhalten. Keine Falchdyn werden zugeordnet. Vorherstand und begrenzter
Quellenvergleich: `diagnostics/maelwen-avatars-staff-20261106/rhys-assignment/`.

Auf ausdrücklichen Folgeauftrag vom 6. November 2026 sind Catrin Gwernant (26)
für Maßaufträge und ihre Schwester Efa (22) für Verkaufsraum und Wäschepflege
ergänzt. Die neue normale Leinen-/Kurzwarenhändlerfamilie besitzt eine eigene
Familienakte und Hausseite. Beide Frauen sind ledig und unverlobt. Die
Shopprojektion bezieht ihre stabilen Weltidentitäten, Namen, Alter und Porträts
direkt aus dieser Familienquelle; es entstehen keine neuen Raves-Verwandtschaften
oder automatischen Figurenakten. Auftrags- und Prüfbelege: `diagnostics/gwernant-20261106/`.

Der ausdrückliche spätere Figurenauftrag besitzt einen eigenen begrenzten
Workflow: `eleganz-sales-characters.mjs` erstellt ausschließlich Rhys, Catrin und
Efa unter ihren vorhandenen Weltpersonenkennungen. `eleganz-sales-artwork.mjs`
validiert die aufgenommenen Bilder und verwendet das gemeinsame Bildsetmodell;
Rhys und Catrin erhalten neun allgemeine Emotes im Standardset und neun weitere
im Set „Verkäufer“ beziehungsweise „Verkäuferin“. Auf Folgeauftrag erhält Efa
neun allgemeine Emotes und neun weitere im Set „Hausdienst“; ihr Porträt bleibt
erhalten. Familienidentitäten und Stammbaumquellen bleiben verknüpft; es werden
keine Gegenstände oder Kampfwerte vergeben.

`build-eleganz-sales-characters.mjs --artwork <Manifest> --published` schreibt
zunächst nur einen lokalen Importplan. `--apply` übernimmt genau drei
Einzelfigurenexporte und ihre lokalen Datenbankprojektionen, `--check` prüft die
Reproduzierbarkeit. Namen, Weltidentitäten und fremde Akten sind gegen
Überschreiben geschützt. Eine Onlineanlage bleibt ein eigener koordinierter
create-only Vorgang; der ursprüngliche Sieben-Figuren-/Modulpublisher und der
Szenen-Cast werden dafür nicht neu ausgeführt. Belege:
`diagnostics/sales-staff-avatars-20261106/publication/`.

Efas spätere Bildaufnahme verwendet `eleganz-efa-media-update.mjs`: Das Modul
bestimmt ausschließlich die Medienfelder ihrer bestehenden Akte und bestätigt
lokale Projektionen über den vorhandenen Quellenhistorienvertrag. Eigene Notizen,
Spielwerte und andere Personen bleiben erhalten. Der koordinierte Publisher
unter `diagnostics/efa-avatars-20261106/publication/` aktualisiert online nur diese
Medienfelder und `updatedAt` mit Dokumentzeitbedingung; er legt keine Figur neu an
und verändert keine Sammlung. Der Dreierbuilder prüft jetzt die 57 Kunstdateien;
seine neuen Plan-/Importbelege liegen ebenfalls dort.

Die öffentliche Prüfung verwendet `build-eleganz-sales-characters.mjs
--source-exports --check`. Dieser begrenzte Modus liest nur die drei eingecheckten
Figurenexporte und Datenbankprojektionen, benötigt weder Werkstattbilder noch
private Diagnosemanifeste und führt keine Bild- oder Netzabfragen aus.

## Preise

Alle Quellpreise sind ganzzahlige Kupfertaler; 100 Kupfertaler entsprechen einem Silbertaler, 1.000 einem Goldtaler. Die Erweiterung vom 4. November ergänzt zehn Brautkleider für 100–20.000 KT, fünf Bräutigamsgarnituren für 175–19.000 KT sowie je fünf normale Damen- und Herrenmodelle für 25–12.750 beziehungsweise 35–11.800 KT. Die Farbpalette ergänzt unter anderem Flachs, Ocker, Apricot, Altrosé, Flieder, Champagner, Grau, Tabak und Schwarz.

Die vier bisherigen Spitzenmodelle kosten auf ausdrücklichen Nutzerwunsch jeweils höchstens 23.000 KT; alle vier wurden auf 23.000 KT gesetzt. Die ursprüngliche 26er-Fassung bleibt unter `sources/module-before-expansion-2026-11-04.json` erhalten. Alle anderen bisherigen Preise und die vorhandenen Bilder bleiben erhalten. Die Anzeige sortiert je Kategorie nach Preis und leitet Alltag, Maßarbeit und Preisbalken aus dem Warenpreis statt aus der Listenposition ab. Bestehender Besitz und alte Kaufbelege werden nicht umgeschrieben.

## Bilder

Alle 14 Porträts wurden nach der Nutzerkorrektur vom 16. Oktober neu erstellt: gespeicherter Aleria-Anime-Stil, stehende Oberkörperporträts, ruhige unterschiedliche Posen ohne gehaltene Gegenstände. Elternporträts dienten bei den Kindern als zusätzliche Identitätsreferenz. Wappen sind immer kreisrund. Die freigegebene Alphabereinigung verändert ausschließlich den Alphakanal, keine RGB-Werte.

Finale Bilder: `AleriaAlmanach/assets/goettliche-eleganz/` und die beiden Wappenpfade im Stammbaum-Verzeichnis. Prompts: `assets/goettliche-eleganz/image-prompts.json`. Erzeugung mit dem eingebauten Bildwerkzeug. Abgelehnte Varianten bleiben lokal erhalten und werden nicht veröffentlicht.

Die Kleidungsbilder liegen unter `assets/goettliche-eleganz/kleidung/`, ihr vollständiger Promptsatz in dessen `image-prompts.json`. Nutzeranweisung vom 16. Oktober: handgemalter Rüstungs-/Inventarstil, weiße kopflose Puppentorsi, Oberteil und Hosenansatz beziehungsweise oberer Rockansatz, keine Beine, Füße oder Schuhe. Die Rüstungen dienen ausschließlich als Malstilreferenz; die beiden ersten Kleidungsbilder bestimmen das gemeinsame Präsentationsformat. Keine echten Personen oder anatomischen Hände.

`eleganz-clothing-art.mjs` baut die gemeinsamen Bildaufträge für Generator und Einzelbilder. Die 25 neuen PNGs wurden mit dem eingebauten Bildwerkzeug erstellt. Exakte Aufträge, Referenzen, Originalpfade und lokale Prüfbelege stehen unter `diagnostics/eleganz-expansion-20261104/`. Diese Erweiterung bleibt zunächst lokal. Bei einer später freigegebenen Veröffentlichung die eingebauten Händlerquellen aus dem geprüften öffentlichen Commit über den bestehenden Mechanik-Sync neu erzeugen; die privaten Main-Quellen nicht als Abkürzung in den Händlergenerator aufnehmen.

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

Die Korrektur vom 16. Oktober ersetzt ausdrücklich nur Maelwens und Gwenoras vorhandene Profilporträts; andere Bilder werden nicht überschrieben. Maelwen erhält das orange Haar und die grünen Augen der Coeddu. Gwenoras Gedenkporträt zeigt sie mit 76 Jahren (1638–1714), grauem Haar und blauen Augen. Originalbilder bleiben erhalten; die genauen Bildwerkzeug-Aufträge stehen in `assets/goettliche-eleganz/portrait-corrections-2026-10-16.json`. Nach der statischen Veröffentlichung auch `node firebase/scripts/content/publish-krumme-kanne-characters.mjs --apply` ausführen, damit die alten Herkunftsverweise bei Styr, Heledd, Neifion und Eirlys verschwinden.
