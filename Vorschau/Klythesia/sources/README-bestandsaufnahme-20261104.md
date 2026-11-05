# Klythesia · lokale Bestandsaufnahme

Diese Seite sammelt ausschließlich vorhandenes Wissen. Grundlage sind die
Religionsarchive zum Zirkel des Ewigen Waldes und zum Phalantischen Bund,
Stoicheia-Sprachquellen, pferdekundliche Querverweise und die sieben gelieferten
PNG-Dateien aus `C:/Users/fhg_r/Downloads/Länder/Klythesia`.

Es wurden keine Häuser, Namen, weltlichen Ränge, Staatsverfassung, Grenzen,
Kriegerklassen oder neuen Bilder erfunden. Die fünf Motivwappen bleiben ohne
Haus- oder Regionszuordnung. Kallisteia ist ein hervorgehobener Kartenort;
die Hauptstadtfestlegung bleibt offen. Die sieben benannten Orte sind keine
vollständige Städtezählung des Landes.

## Daten und Zuständigkeiten

| Datei | Aufgabe |
| --- | --- |
| `sources/religion-evidence.json` | 35 Religions-/Kulturangaben, 14 Katalogeinträge, zwölf Tempelbezeichnungen, acht Fragen/Abweichungen; Quellenhashes und Pointer |
| `sources/cross-source-evidence.json` | 16 Angaben zu Sprache, Namensvorrat, regionaler Einordnung und Xanathos; drei Quellenabweichungen, fünf offene Fragen |
| `sources/map-evidence.json` | Sieben abgelesene Ortsnamen, geprüfte Bildanker, Landschafts- und Wappenbeobachtungen, fünf offene Kartenfragen |
| `source-import.json` / `assets.source.json` | Expliziter Importplan und SHA-256-/Maßinventar der unveränderten Originale |
| `evidence-data.mjs`, `map-data.mjs`, `art-data.mjs` | Aus den geprüften Berichten erzeugte, rein lesende Darstellungskataloge |
| `evidence-view.mjs` | Belegkarten, Perspektiven, religiöse Kataloge, Quellen und offene Fragen |
| `proposal-render.mjs` | Seitenstruktur, Karte und gelieferte Motivgalerie |
| `proposal-app.mjs` / `art-dialogs.mjs` | Gekapselter Einstieg und dünne Anbindung gemeinsamer Karten-/Bildfenster |
| `klythesia-evidence.css`, `klythesia-map-art.css` | Lokale, nach Verantwortung getrennte Darstellung |

Die Kartenansicht verwendet `Vorschau/shared/clan-map.mjs` mit leerer Hausliste.
Es gibt keine Platzhalterhäuser, Sitzzuordnung, Entwurfspeicherung oder
Kopien gemeinsamer Zoom-/Pan-Logik. Bildfenster verwenden die gemeinsame
`createArtDialogSession`. Alle sechs Zeichen und die Originalkarte sind in
Großansicht zugänglich. Die WebP-Vorschaubilder ändern keine Originaldateien
und verwenden keine Alpha-Korrektur.

## Quellengrenzen

Glaubensüberlieferung, Quellenaussage, Phalantias religiöse Fremdsicht und
Kartenbeobachtung sind getrennt gekennzeichnet. Gottkönigtum und weibliche
Clanführung sind eine offene institutionelle Frage. Der Unterschied zwischen
sieben genannten Göttinnen und neun Nebengöttern bleibt ein Quellenkonflikt.
Die zwölf religiösen Bezeichnungen werden nicht als weltliche Kasten behandelt.
Aurion und Noxus bilden einen gemeinsamen Katalogeintrag; die Zahl 14 bezeichnet
Einträge, keine abschließend behauptete Göttergesamtzahl.

Überlieferte Tötungs- und Sexualrituale sind quellengerecht und ohne erfundenes
heutiges Recht zusammengefasst. Athara/Logara und Grammateis/Grammatici werden
nicht gleichgesetzt. Sprachbeispiele sind keine historischen Personen oder
Häuser. Kolonien sind im Spracharchiv unspezifisch erwähnt, aber nicht benannt
oder datiert. Xanathos-Verbreitung beweist weder Grenzen noch das Klima des
ganzen Landes. Pferdepreise legen keine Landeswährung fest.

## Reproduzierbare Aufbereitung und Prüfung

```powershell
& 'C:/Users/fhg_r/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' -X utf8 'Vorschau/Klythesia/scripts/prepare-sources.py'
node 'Vorschau/Klythesia/scripts/build-catalogues.mjs'
node 'Vorschau/Klythesia/scripts/klythesia.test.mjs'
node 'diagnostics/klythesia/browser-review.mjs'
```

Die Browserprüfung benötigt den lokalen Projektserver auf Port 8897 sowie
das vorhandene Playwright und Chrome. Sie verwendet ausschließlich frische
isolierte Browserkontexte. Belege liegen unter `diagnostics/klythesia/`.
Die Karte wurde zuvor einschließlich aller sieben Ortsanker tatsächlich
angesehen: `diagnostics/klythesia/map/town-anchor-review.jpg`.

Die Seite ist `noindex,nofollow`. Autorenberichte, Importpläne und Methoden
bleiben durch die bestehende Publikationsrichtlinie vom Webpaket getrennt.
Diese Vorbereitung ändert keine kanonischen Religionstexte, Stammbäume,
Register oder Firebase-Daten. Kein Push, Deploy oder Herunterfahren gehört
zu diesem lokalen Auftrag.

## Prüfstand vom 4. November 2026

Elf gezielte Fachprüfungen bestanden. Desktop (1440 × 1000) und Mobil
(390 × 844) bestanden: alle sechs Bildfenster, sieben Originalabrufe,
Kartenvergrößerung und Verschieben, Rücksetzen auf Gesamtansicht, Schließen
und Fokusrückgabe, Fundstellenlinks und vollständig aufgeklappte Quellenkarten.
Kein horizontaler Seitenüberlauf, keine JavaScript- oder HTTP-Fehler.
Hero, Galerie, Bildfenster und mobile Zoomkarte wurden zusätzlich tatsächlich
am Screenshot angesehen. Zusammenfassung: `diagnostics/klythesia/verification.json`;
Browserdetails: `diagnostics/klythesia/browser/browser-review.json`.
