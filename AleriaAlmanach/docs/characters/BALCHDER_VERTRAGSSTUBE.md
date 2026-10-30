# Kamber, Blodwen und Rice Balchder · 29. Oktober 2026

Der Nutzer ordnet Blodwen als Schreibergehilfin und Rice als Laufburschen
unmittelbar ihrem Vater Kamber zu. Kamber ist bereits Vertragsmeister unter
Cadfan Draig. Die fünf gleichrangigen Kernämter bleiben bestehen; darunter
hat die Vertragsstube eine eigene Gruppe mit beiden Kindern, eigenen Aufgaben,
Porträts und einer eindeutigen Berichtslinie.

Die drei Biografien liegen gemeinsam unter
`Stammbäume/assets/js/data/person-biographies/balchder-vertragsstube.js`.
Kambers Einträge in Balchder und Gelyn verwenden dieselbe Biografie und dieselbe
Weltpersonen-ID. Blodwen (1722) und Rice (1728) erhalten ausschließlich die
belegten Familienangaben und die neu bestimmten Aufgaben. Ihnen werden keine
Persönlichkeitsmerkmale, Ausbildungen, Abenteuer oder Partnerschaften erfunden.

Kambers Biografie beschreibt sein akribisches, empirisch-pragmatisches Denken,
sein zwischenmenschliches Geschick, gutes Essen als Schwäche, seine geringere
Fitness und die Uchelwyr-Ausbildung. Frühere Kampfeinsätze bleiben ausdrücklich
ungewiss. Bestehende Personen, Lebensdaten, Beziehungen und Porträts bleiben
erhalten. Die Quellenrevisionen aktualisieren gezielt die neuen Metadaten;
bereits übernommene Nachbarpersonen und deren individuelle Notizen bleiben geschützt.

## Silberwind

- Kreaturen-ID: `companion-kamber-silberwind`.
- Besitzer: `person--haus-balchder--kamber-balchder`.
- Rasse: Rhyfel; Farbe: Schimmel. Geschlecht, Alter und Herkunft bleiben offen.
- Vorhandenes Rasseprofil: `/Bestiarium/tiere/pferde/rhyfel/index.html`.
- Katalog: `AleriaAlmanach/modules/creatures/catalog/balchder-companions.js`.
- Eigenes 2:3-Porträt: `AleriaAlmanach/assets/companions/haus-balchder/silberwind.png`.

Das Bild folgt dem gespeicherten Anime-Porträtstil. Originalpfad und Motiv sind
in `silberwind-source.json` dokumentiert. Die Besitzidentität verwendet die
bestehende gemeinsame Gefährtenlogik; wiederholtes Anhängen erzeugt kein zweites
Pferd und erhält vorhandenen Besitz.

## Wiederholbarer Export und Prüfung

```text
node AleriaAlmanach/scripts/build-balchder-vertragsstube.mjs
node AleriaAlmanach/scripts/build-balchder-vertragsstube.mjs --check
node --test --experimental-test-isolation=none AleriaAlmanach/tests/balchder-vertragsstube.test.mjs
```

Der Builder erzeugt drei importierbare Biografien, Silberwinds Kreaturenexport
und den additiven Zuordnungsplan unter
`Charakter Archiv Exporte/balchder-vertragsstube-2026-10-29/`. Die Figurenexporte
enthalten keine Inventare und keine Kampfprofile. Der Zuordnungsplan wird bei
einer späteren Datenübernahme mit `attachCreatureToInventory` auf den dann aktuellen
Besitzerstand angewandt; ein altes Komplettinventar wird nicht zurückgeschrieben.
Der Builder schreibt weder in Firebase noch in die Charakterdatenbank.

Der bestehende Gefährtenadapter reicht den bereits vorgesehenen Zeitparameter
nun bis zur Einzelstück-Zuordnung weiter. Ohne expliziten Parameter bleibt das
bisherige Verhalten erhalten; Exporte mit festgelegtem Quelldatum sind reproduzierbar.

80 Fachtests für Biografien, Familienübernahme, Verwaltung, Kreaturen, Bestiarium,
Inventarverknüpfung und den Netlify-Prüfplan sind erfolgreich. Alle drei Biografien
und Blodwens Amtsdetails wurden im Browser geprüft. Die Bilder und CK-Icons laden.
Belege: `diagnostics/balchder-vertragsstube/`; Testlauf:
`diagnostics/balchder-vertragsstube-tests.log`.

Die historische Familienprüfung projiziert nur die ausdrücklich freigegebenen
Metadaten dieser vier Personenpositionen zurück; ihre exakten neuen Werte werden
vorher gegen `balchder-person-review-20261029.json` geprüft. Identitäten, Porträts,
Lebensdaten und sämtliche Verwandtschaften bleiben Teil des ursprünglichen Hashs.

Dieser ursprüngliche Arbeitsstand vom 29. Oktober war lokal; damals wurde kein Publisher aufgerufen.

## Almanach-Charaktere · veröffentlicht am 30. Oktober 2026

Kamber, Blodwen und Rice sind jetzt in der Firestore-Collection `characters`
mit vollständigem Biografiemodul gespeichert. Kambers bestehende Dokument-ID
bleibt erhalten; Blodwen und Rice wurden unter ihren kanonischen Weltpersonen-IDs
neu angelegt. Alle drei stehen unter `Gwynthor` → `Gwynthor - Haus Balchder`.

`firebase/scripts/content/balchder-character-plan.mjs` verwendet den bestehenden
Familienimport für Identitäten und Gruppenzuordnung. Der Publisher ergänzt bei
vorhandenen Figuren nur Biografie, Amtstexte und Stammbaumquellen. Ein atomarer
Commit mit Versionsvorbedingungen schützt vor parallelen Änderungen. Inventar,
Kampfprofil, Eigentümerkennung, bestehende Bilder und sämtliche anderen Felder
werden beim Rücklesen einschließlich ihrer ursprünglichen Firestore-Typen geprüft.
Die vorherigen Dokumente liegen verschlüsselt im privaten Sicherungsbereich.

Die bestätigten Einzelfigurenexporte heißen
`Charakter Archiv Exporte/<person>-veroeffentlicht-2026-10-30.json`.
`node CharakterDatenbank/scripts/import-balchder-publication.mjs` übernimmt genau
diese drei Personen in Akten, Register und Snapshot; `--check` prüft ohne Änderungen.
Alle 243 anderen Snapshot-Charaktere und lokale Aktennotizen bleiben erhalten.
Prüfbeleg: `AleriaAlmanach/assets/biographies/balchder-vertragsstube/2026-10-30/publication-verification.json`.
