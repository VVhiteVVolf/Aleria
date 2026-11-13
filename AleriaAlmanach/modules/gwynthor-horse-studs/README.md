# Gwynthorer Gestüte

Lokal ausgearbeiteter Stand vom 13. November 2026. Zwei eigenständige Module unter
Gwynthor-Stadt, direkt neben den übrigen Stadtmodulen: **Zum Silberhalm** der Familie Halenrhyd und
**Rhosmeres Rösser – Gwynthor**. Die anschließend beauftragte günstige Alternative
**Zum Schiefen Nagel** liegt im eigenen Feature `../gwynthor-horse-resale/`.

Beide Module besitzen zehn Seiten: Einführung, Betriebsbio, Leitungsbio,
Rollenhierarchie, Pferderegister, zehn Sattlerwaren, drei interaktive Räume und
Kalkulation. Zehn Fachabteilungen werden in den acht vom vorhandenen
Hierarchietemplate unterstützten Reitern dargestellt. Rollenbeschreibungen und
Stellenzahlen bleiben einzeln erhalten; nur Leitung und Finanzverwaltung sind
mit Porträts verknüpft. Die übrigen Stellen sind Silhouettenplätze.

Gorweth Halenrhyd (49) und Eirfena (47) führen den Stadtbetrieb. Bryndors Haushalt
betreibt die Landzucht am bislang freien Kartenort `gwynthor-marking-063`,
Odrigs Haushalt den eigenen Futter- und Viehhof am freien Ort `gwynthor-marking-066`.
Der Stammbaum enthält 25 namentliche Angehörige und zwei unbekannte historische
Gründer mit Überlieferungslücke. Die übrigen 168 Pins und Hoheitsflächen bleiben
bei der begrenzten Kartenprojektion unverändert.

Maelrig Caeffyn (62) ist ein kräftiger, grauhaariger Geschäftsmann aus dem
Ährental und angestellter Standortleiter der Gilde. Kyria Aurdden (19) ist seine
Frau und Finanzverwalterin. Ihr bisheriger Bankkorrespondenzplatz wird durch
eine unbesetzte Rolle ersetzt. Weltidentität und Aurdden-Eltern bleiben erhalten;
beide Familienakten zeigen dieselbe Ehe. Der Caeffyn-Baum umfasst nur das Paar.
Die Gilde besitzt ihren Betrieb; Partnerschaftsbauer und Lehnsherr bleiben
eigene Vertragsparteien. Wyrms Marchwern-Abgaben und Mitspracherechte sind in der
Betriebsbio ausdrücklich berücksichtigt. Beteiligungsquoten bleiben offen.

## Zuständigkeiten

| Quelle | Verantwortung |
| --- | --- |
| `Stammbäume/assets/js/data/gwynthor-horse-studs/` | Personen, Verwandtschaft und Familien |
| `Stammbäume/assets/js/data/caeffyn-aurdden-marriage.js` | Gegenseitige Ehe und begrenzte Aurdden-Revision |
| `stud-module.mjs`, `stud-places.mjs` | Bestehende Seitentemplates und Stadtregistrierung |
| `stud-hierarchy.mjs`, `stud-economy.mjs` | Rollenmodell und nachvollziehbare Modellrechnung |
| `stud-pricing.mjs`, `stud-horses.mjs`, `stud-catalog.mjs` | Preise, einzelne Pferde und Waren |
| `stud-characters.mjs`, `stud-house-content.mjs` | Adapter für Figurenarchiv und Hausseiten |
| `Karten/.../gwynthor-bannkreis/halenrhyd.source.json` | Genau zwei Landstandorte |

Rhyfel, Ceffyl, Hest und Tirashan bleiben nachlieferbare Rasseangebote mit den
vorhandenen Handelsregisterbildern. Je Betrieb sind zusätzlich zwei belegte
Kreuzungszuchten, zwei Mischlinge unbekannter Abstammung und zwei reinrassige
Exemplare als explizite Unikate angelegt. Alle zwölf besitzen Namen, Wesen,
Vorgeschichte und eigene Bilder ohne Ausrüstung. Register und vorhandener
Nachzuchtrechner liefern die Preisgrundlage; die Gilde bietet die höhere
Auswahlstufe. Unikate erzeugen keinen wiederkehrenden Wochenabsatz.

Die zehn Zubehörmotive sind eigens erzeugte Warenbilder. Preise in KT bei
Halenrhyd / Gilde: Reitsattel 480/720, Packsattel 420/630, Zaumzeug 145/218,
Halfter 65/98, Sattelgurt 55/83, Steigbügel 140/210, Satteltaschen 190/285,
Wolldecke 95/143, Striegel und Bürste 38/57, Hufkratzer 18/27.
Diese vom Nutzer verlangte Verteuerung betrifft nur das örtliche Zubehör;
die globalen Handelsregisterpreise bleiben erhalten.

Die Kalkulation besetzt die geplanten Rollen rechnerisch, ohne Figuren oder
Arbeitsverträge anzulegen. Pacht, Löhne, Absatz und Beschaffung sind veränderbare
Modellannahmen. Noch offene Abgaben und Beteiligungen sind nicht als aufgehoben
zu verstehen; das angezeigte Ergebnis liegt vor diesen Ansprüchen.

36 aktive eigene Bilder: vier Personen, zwölf Pferde, sechs Räume, zwei
Ladenschilder, zwei ornamentierte runde Familienwappen und zehn einzelne
Sattlerwarenmotive. Die Zubehörbilder werden in beiden Betrieben verwendet.
42 Fassungen samt
Generatororiginalen, tatsächlichen Prompts und Referenzen bleiben erhalten.
Aktiv ist Maelrig v3 mit Geschäftsmannskleidung, prüfendem Blick und geschlossenem
Geschäftsbuch; beide Wappen verwenden v2. Das Artmanifest liegt unter
`assets/gwynthor-horse-studs/manifest.json`, die Originale und Belege unter
`docs/art/gwynthor-horse-studs-20261113/` und bleiben aus dem Websitepaket ausgenommen.

## Pflege und Prüfung

```powershell
node AleriaAlmanach/scripts/build-gwynthor-horse-studs.mjs --check
node AleriaAlmanach/scripts/admit-gwynthor-horse-art.mjs --check
node AleriaAlmanach/scripts/build-horse-stud-characters.mjs --check
node "Familien Häuser und Clans/scripts/build-house-content.mjs" --check --houses=haus-halenrhyd,haus-caeffyn,haus-aurdden
node Karten/tools/project-halenrhyd.mjs --check
```

Der Figurenprojektor hat 26 lokale Akten ergänzt und ausschließlich Kyria
gezielt aktualisiert. 456 fremde Akten sowie ihre bisherigen Spiel-, Besitzer-
und Inventarfelder sind geschützt. Sein Plan-/Schreibweg verwendet den lokalen
Autorzeitbeleg unter `diagnostics/horse-studs-20261113/characters/`.

87 gezielte gemeinsame Fach-, Nachbar-, Familien-, Handels- und Buildtests
für alle drei Betriebe bestanden. Die zwölf Angebote dieser beiden Betriebe
und die vier Ruddgraen-Unikate wurden im vorhandenen Transaktionskern mit
einer isolierten In-Memory-Datenbank je einmal gekauft; Zweitkäufe scheitern
atomar. Browserprüfungen verwenden die echte lokale Anwendung auf Desktop und
390 Pixel Mobilbreite, frische Kontexte und blockierte externe Schreibzugriffe.
Die Offline-Statusanzeige überlagert im Fixture den mobilen Kommentarbutton;
der Dialog ist dort per Tastatur geprüft. Große Stammbäume benötigen den
vorhandenen Zoom-/Scrollweg. Prüfmethoden, Bilder und Grenzen stehen im
Diagnoseordner.

Die zusätzliche Prüfung des committierten Server-Gesamtkatalogs meldet einen
veralteten Snapshot. Dieser Generator liest absichtlich Git-HEAD, daher kann er
die noch uncommittierten Module nicht veröffentlichungsfähig abgleichen.
Die lokale Projektion aller drei neuen Module wurde separat geprüft.
Für einen freigegebenen Release ist die neue native Gruppe
`gwynthor-horse-studs` registriert; Serverprojektion danach aus der kanonischen
committierten öffentlichen Quelle erzeugen. Kein Push, Deploy oder produktiver
Datenwrite wurde ausgeführt.
