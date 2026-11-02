# Sieben Figuren aus Gwynthor

Autorenauftrag vom 2. November 2026: Rhosyn Awenydd, Briallen Awenor,
Rianna Wyrm, Evie Rhyddid, Lefraye Gafyr, Saerwyn Gwyllach und Caralyn Chwedonol.

Online wurden am Beginn ausschließlich Caralyn und Lefraye gefunden. Caralyn
behält `Eka4z7TWpzEgx8KjhIzy`, Lefraye ihre bestehende Weltpersonen-ID. Die
übrigen Figuren verwenden die vorhandenen Weltpersonen-IDs ihrer Stammbäume.
Alle bleiben auf Stufe 1 und beginnen ohne automatisch vergebene Techniken.
Briallens, Evies, Rhosyns und Saerwyns Klasse bleibt offen. Neutrale Bogenwerte
sind technische Startwerte; sie ergänzen keine behaupteten Lebensstationen.

Die Biografien verbinden ausschließlich die Personenakten, belegte Eltern und
Geschwister, die öffentlichen Hausakten und die vom Nutzer genannten Klassen.
Familienbesitz und Hausbindungen werden als Hauskontext benannt. Aus einer
Lehnsbindung wird kein zusätzlicher Ortsreiter. Porträts und Wappen bleiben
Originale. Lefrayes Geschlecht wurde entsprechend „sie ist eine Helwyr“ in der
Stammbaumquelle auf weiblich präzisiert.

`roster.mjs` benennt die Figuren, `character-content.mjs` besitzt die begrenzte
Profilprojektion, `equipment.mjs` die 24 gemeinsam versionierten Itemvorlagen
und exakten Besitzlisten. Die bereits vorhandenen Helwyr-Bogen- und Pfeilbilder
werden wiederverwendet. Zwei Kampfdolche und drei Harpunen sind getrennte
Besitzstücke. Bögen verbrauchen den verknüpften Standardpfeilstapel. Signal-
und Brandwirkungen bleiben entsprechend dem bestehenden Katalog situativ;
es wurden keine zusätzlichen Angriffe oder automatischen Sonderwirkungen
erfunden. Startplatten haben RK 15 ohne GES und Grundschutz −1 Hieb/Stich/Wucht.

Ergänzung für Oweta Draig vom 2. November 2026: Ihre ausdrücklich beauftragte
Besitzliste enthält „Draig - Jungritter Plattenrüstung“, „Draig Ritterschwert“
und „Draig Dolch“. Rüstung und Schwert sind angelegt, der Dolch bleibt im Gepäck.
Die Rüstung verwendet den vorhandenen Draig-Harnisch aus dem Hausregister;
der Dolch das vorhandene lokale Draig-Itembild. Das gewöhnliche Ritterschwert
verwendet das belegte Original `https://i.imgur.com/bthNwPb.png` aus Gethins
Zuordnungsexport vom 14. Oktober. Seine Waffenbasis ist 1W8 Hieb, vielseitig
1W10; der Dolch hat 1W4 Stich. Persönliche Boni oder Techniken werden nicht
übertragen. Die Zusatzliste ist unabhängig von der ursprünglichen
Sieben-Figuren-Profilprojektion und vergibt keine Klassen-Startpakete.

`CharakterDatenbank/scripts/sync-oweta-equipment.mjs` übernimmt diese Zusatzliste
gezielt in Owetas bereits bestehende lokale Akte und erstellt den öffentlichen
Teilexport `Charakter Archiv Exporte/oweta-draig-ausruestung-2026-11-02.json`.
Der wiederholbare Abgleich besitzt `--check`, entfernt nur erkannte
Editor-Platzhalter und erhält Heulwen, Geld, Biografie, Genealogie, lokale
Notizen sowie sämtliche anderen Figuren. `oweta-equipment-database.mjs`
besitzt diese begrenzte Projektion; sie ersetzt keine Online-Daten.

`scripts/build-authored-item-catalog.mjs` erstellt den getrennten redaktionellen
Katalog `item-definitions/authored-item-catalog.js`. Marktstandards und deren
Identitäten bleiben unverändert. Der Item-Builder verwendet diese Katalogköpfe
als Ausgangspunkt eigener Varianten; gebundene Versionen werden nicht verändert.

`scripts/build-gwynthor-seven.mjs` aktualisiert nur diese sieben Datenbankakten
und deren Registerprojektionen. Unveränderte Editor-Beispielkarten werden mit
dem bestehenden Platzhaltererkenner entfernt; realer Besitz bleibt erhalten.
Der interne vollständige Figurenplan liegt in `source/` und ist von der
statischen Auslieferung ausgeschlossen.
Öffentliche Einzelfigurenexporte liegen unter
`Charakter Archiv Exporte/Gwynthor Sieben/`. Der Builder ist wiederholbar und
besitzt `--check`; er schreibt keine Firestore-Laufzeitdaten.

Je drei 3×3-Sheets und 27 Einzelavatare für Caralyn, Rianna und Lefraye sind in
der AvatarWerkstatt gesichert. Der unveränderte V3-Splitter wurde mit 3×3,
Lücken 0/0 und ohne Autocrop verwendet. Alle fertigen Bilder einer Person
liegen unmittelbar in `AvatarWerkstatt/Output/<vollständiger Name>/`.
Die eingebundenen Kopien unter `assets/gwynthor-seven/avatars/` ergeben drei
eigene Bildsets pro Figur. Neue Ausrüstungsbilder liegen unter `items/`.

Gwyllach: Rhovan bleibt Jahrgang 1659. Saerwyn ist nun Jahrgang 1721, also etwa
19 im Weltjahr 1740. Nach Porträtprüfung sind die jüngeren Generationen wie
folgt eingeordnet: Efael 42, Talaneth 49, Meredydd 45, Drystan 46, Anelen 44;
Meirawen/Morwella 19, Talyfer 22, Meirion 24, Olyndor 19, Rhufaed 15,
Eryndor 12 und Liora 9. Die namenlose Zwillingsmutter ist etwa 40. Eltern waren
bei der Geburt ihrer Kinder jeweils mindestens 18. Diese Jahre sind explizit
redaktionelle Alterskorrekturen, keine neu aufgefundenen Geburtsurkunden.

Quellen, Bildprompts, Originalpfade, Hashes, Sichtprüfungen und Testprotokolle:
`diagnostics/gwynthor-seven-20261102/`. Bilder wurden mit dem eingebauten
Imagegen erzeugt. Kein API-Schlüssel wurde verwendet.

## Rianna und Lefraye: Biografien und Begleiter

Der weitere Autorenauftrag vom 2. November 2026 ist getrennt in
`biography-content.mjs` (Erzähltexte und Motive), `biography-enrichment.mjs`
(begrenzte Biografie- und Inventarergänzung) und `biography-companions.mjs`
(vier Kreaturen) gekapselt. Der bestehende Figurenbuilder und der gemeinsame
öffentliche Biografiekatalog verwenden dieselbe Fassung. Ritterväter und
Rittermutter besitzen die vorhandenen Personenporträts; Erzählmerkmale vergeben
keine mechanischen Traits, Techniken oder Attributsboni.

Sir Fressbert und Goldlöckchen gehören zu Rianna, Agravaine und Thalena zu
Lefraye. Alle vier besitzen Kreaturbögen, Inventarinstanzen, Gefährtenkarten
und tatsächliche Bestiarium-Verweise. Farnschritt ist im gemeinsamen Zuchtbuch
als Tirashan–Rhyfel benannt; die Mwyalchen-Drossel besitzt ein eigenes Artprofil.
Sir Fressberts Cenyric-Zuordnung und die nicht vorgegebenen Fellfarben sind
redaktionelle Bildgestaltungen. Tieralter bleiben offen. Der Singvogel verwendet
ein eigenes Haushaltsprofil ohne Greifvogelangriff.

Je zwei zusätzliche Biobilder (Hauskleid und Rüstung mit beiden Begleitern)
sowie vier Einzelbilder liegen unter `assets/biographies/rianna-lefraye/2026-11-02/`.
Prompts, Originalquellen, Prüfsummen, vorheriger Besitz und Prüfbelege liegen in
`diagnostics/rianna-lefraye-biographies-20261102/`. Diese Arbeit erzeugt lokale
Quellen und Exporte; sie schreibt keine Firestore-Laufzeitdaten.

## Bestätigte Inventarveröffentlichung und persönlicher Startbesitz

Der Folgeauftrag vom 2. November hat Caralyns, Riannas, Lefrayes und Owetas
Ausrüstung tatsächlich in Firestore veröffentlicht. Riannas fehlende Online-Akte
wurde unter ihrer Weltpersonen-ID ergänzt und dem bestehenden Gwynthor-Reiter
zugeordnet. Die übrigen Online-IDs bleiben erhalten. `knight-equipment-plan.mjs`
besitzt den reinen Ergänzungsplan; `firebase/scripts/content/publish-knight-equipment.mjs`
die gesicherte, atomare Übernahme einschließlich unveränderlicher Itemversionen.
`equipment-artwork.mjs` verzeichnet öffentlich geprüfte Originale in Storage;
lokale Bildoriginale bleiben erhalten. Die Vorlage umfasst nun 24 Ausrüstungen
und einen zusätzlichen gewöhnlichen Zinnritter aus `starting-possessions.mjs`.

Der zusätzliche Startbesitz umfasst je drei Kleinigkeiten und eine einmalige
persönliche Barschaft: Caralyn 680, Rianna 1.840, Lefraye 760, Oweta 1.250
Kupfertaler. Das sind redaktionelle Startbeträge, keine historischen Zahlungen
oder Hausvermögen. Vorhandenes Geld wird additiv erhalten. Der vorhandene
`item_award_claims`-Beleg verhindert eine weitere Auszahlung oder Auffüllung
nach Verkauf und Verbrauch. `starting-possessions-plan.mjs` verwendet dafür
dieselbe Item- und Währungslogik wie Register und Inventare.

`CharakterDatenbank/scripts/sync-knight-starting-possessions.mjs --check` prüft die
vier bestätigten Projektionen. Seine Teilexporte unter
`Charakter Archiv Exporte/Startbesitz 2026-11-02/` besitzen die spätere Inventar-
und Geldprojektion. Der ursprüngliche Sieben-Figuren-Builder prüft und erzeugt
weiterhin seine Basisexporte, Biografien und Quellpläne; sobald dieser spätere
Import vollständig registriert ist, ersetzt er keine Datenbankakte mehr aus
seiner historischen Erstellungsbasis. Der Releaseweg führt beide Prüfungen aus.
Unvollständige spätere Zuordnungen werden abgewiesen. Lokale zusätzliche
Begleiterentwürfe bleiben erhalten und werden dabei nicht mit veröffentlicht.

Öffentliche Bestände, Transaktionsbelege und Prüfungen stehen unter
`diagnostics/knight-equipment-20261102/`. Ursprüngliche Online-Dokumente wurden
vor jeder Übernahme verschlüsselt unter `.private-backups/` gesichert. Kampfsperren
und `updateTime`-Voraussetzungen schützen die Übernahme vor Paralleländerungen.
