# Roriksheim

`pages.source.json` enthält die ins aktuelle System übertragenen Absätze,
Ratsämter, Infoboxen und örtlichen Clangruppen. Die zwölf originalen Artikel
und ihre Prüfsummen bleiben unter `Karten/Aldrimar/roriksheim/sources/` erhalten.
Neue Lage und Ortsart haben gemäß Nutzerauftrag Vorrang vor alten Angaben.

`territory-page.mjs` verbindet diese Artikel mit dem gemeinsamen
Herrschaftsmodell. `places.mjs` verwendet denselben Ortskatalog wie die Karte;
positionierte Einträge führen direkt zur jeweiligen Kartenkarte.

Die Jarltumsübersicht zeigt die eigenen Gebiete von Varulv (Rorikstal),
Schwarzdorn, Kampfgeborenen, Freiwinter (Winterfänge), Brathfengr (Klangheim),
Vangandr (Dämmergrund) und Skaal (Schwerthohn) mit ihren ausgeführten Ortsregistern.
`domainReferences` verweist auf das eigene Register der jeweiligen Gebietsseite;
deren Ortsauswahl wird an einer Stelle gepflegt. Die Hauptseite zeigt 108
unterschiedliche Orte. Darunterliegende Herrschaften bleiben verschachtelt.
Schwerthohn führt zu Schwarzacker, Dämmergrund zu Dämmertal, Klangheim zu
Sterkr, Skald und Sökeren. Hornhall steht nur im Ortsregister Dämmergrund.
Die Schwarzdorn-Exklaven erscheinen sowohl beim Clan als auch in ihrem
geografischen Gastgebiet, ausdrücklich als Exklaven. Alfarsborg bleibt als
Besitz der Skjegg im geografischen Schwerthohn erhalten.

`node Kontinente/scripts/build-roriksheim.mjs` erzeugt die 15 kleinen
HTML-/Daten-Einstiege und ausschließlich den markierten Roriksheim-Block im
Kontinente-Register. `--check` prüft die erzeugten Dateien ohne Änderungen.

Kein Push, Deployment oder Schreiben bestehender Online-Daten.
