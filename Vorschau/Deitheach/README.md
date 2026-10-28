# Das gefallene Fürstentum Deitheach

Lokale Vorbereitungs- und Besprechungsseite unter `Vorschau/Deitheach/`.
Frische Vorschau: `http://127.0.0.1:8882/Vorschau/Deitheach/`.
Zwölf Clans, neun Orte, vier Mor Tiarnatümer und neun verschiedene Regionalbanner.
Die frühere Ordnung wird historisch beschrieben; der heutige Status gegenüber
der Triarchie bleibt für jeden Clan offen. Geographischer Rahmen: Aldervan.

Die sieben gelieferten Clans sind als bearbeitbare Ausgangsvorschläge verteilt.
Fünf neue Clans bleiben ohne Sitz. Neue Orts- und Gebietsnamen wurden gegen
aktive und veröffentlichte Familienregister sowie die anderen Vorschauseiten
geprüft; Beleg: `diagnostics/deitheach/name-audit.json`.

Die gemeinsame Länderwerkstatt besitzt Darstellung und Zuordnungslogik. Diese
Seite besitzt nur Inhalte, Daten, Farbe und Aufbereitungsbelege. Mor-Gebiet und
eigene Dun-Herrschaft verweisen auf dieselbe Bilddatei; keine doppelte Produktion.

## Quellen und Bilder

`assets.source.json` enthält unveränderte Originale mit SHA-256. Große
Kartenoriginale liegen privat unter `diagnostics/deitheach/source-originals`.
Aktive Originalwappen und kompakte Webkarten liegen unter `assets/`.
`generation-receipts.json`, `art-prompts.json` und `assets/warriors/prompts.json`
bewahren vollständige Prompts, Referenzen und Generatorprovenienz.

```text
python -B Vorschau/shared/prepare-country-sources.py Vorschau/Deitheach/source-import.json
node Vorschau/shared/build-country-art.mjs Deitheach
python -B Vorschau/shared/prepare-country-art.py Deitheach --qa-dir diagnostics/deitheach
python -B Vorschau/shared/prepare-country-art.py Deitheach --audit --qa-dir diagnostics/deitheach
python -B Vorschau/Deitheach/prepare-warriors.py build
python -B Vorschau/Deitheach/prepare-warriors.py audit --expected-count 12
python -B Vorschau/Deitheach/prepare-warriors.py contact
node Vorschau/Deitheach/collect-receipts.mjs
node diagnostics/deitheach/audit-names.mjs
node --test --experimental-test-isolation=none Vorschau/tests/deitheach.test.mjs
```

Produktionsbilder ändern nur den genehmigten Alphakanal; Generatororiginale und
RGB bleiben erhalten. Die Webvorschauen sind getrennte Dateien. Der bestehende
Netlify-Workflow wird bei einer späteren Veröffentlichungsfreigabe verwendet.

Die Korrektur des Kreuzschnabels ist in `generation-receipts.json` als
`beak-v2` dokumentiert. Die verworfene Eingabefassung bleibt im Generatorarchiv.
