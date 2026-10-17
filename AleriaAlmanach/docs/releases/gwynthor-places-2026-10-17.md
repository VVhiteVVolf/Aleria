# Gwynthor · Erweiterung vom 17. Oktober 2026

Zur Veröffentlichung auf `master` freigegeben: Kampfarena, Große Kathedrale der Neun, Badehaus der Fontani, Zum Kleinen Durst und Zum Vollen Korb. Die bestehenden Vann-, Nixe-, Eleganz-, Schmiede- und Theatermodule bleiben eigenständige Einträge.

Die fünf neuen Module ergänzen 39 Inhaltsseiten und jeweils eine automatisch erzeugte Kommentarseite. Die Arena, Kathedrale und die kleinen Betriebe verwenden die vorhandenen Story-, Biografie-, Hierarchie-, Güter- und Szenenvorlagen. Fontani und Rhwyd sind im Familienregister enthalten; Cadwgans eigener ältester Pendrwn-Zweig führt den Vollen Korb mit Idwal. Meilyrs und Gweniths Linien erhalten fehlende Porträts und keine Ladenposten.

## Gemeinsame UI

- Szeneneinleitungen lassen sich einklappen, um mehr Platz für Beiträge zu schaffen.
- Hierarchieebenen unterstützen bis zu zwölf gleichrangige Plätze; Renderer und beide Editoren verwenden dieselbe Grenze.
- Attributdiagramme belegen keinen Platz mehr in Güterlisten. Das Itembild öffnet eine kompakte native Dialogkarte mit Bild, Preis und vorhandenen Attributen. Escape, Schließknopf oder Außenklick schließen nur diese Karte; der Tastaturfokus kehrt zum Itembild zurück. Ohne Attribute zeigt die Karte Beschreibung und Merkmale.

## Prüfung

Die fünf Generatoren bestehen `--check`. Arena und Kathedrale wurden im Browser geprüft; die vollständigen lokalen Prüfberichte der Betriebe liegen bei den jeweiligen Bildern. `tests/trade-item-card.browser.mjs` prüft das neue Verhalten auf Desktop sowie 430 und 320 Pixel breiten Ansichten, die Werteübernahme, Tastaturbedienung, Außenklick und den Fall ohne Attribute. Netlifys Abhängigkeitsprüfung enthält die gemeinsamen Familiendaten der drei neuen Händlerhäuser.

Die Veröffentlichung verwendet den vorhandenen Git-/Netlify-Weg. Es werden keine laufenden Firebase-Daten, Kampfauswertungen, Ressourcen oder Kommentare importiert oder überschrieben. Erzeugungsprotokolle mit der Angabe `local-only` dokumentieren den ursprünglichen lokalen Entwurfs- und Prüfzeitpunkt; sie steuern keine Laufzeitsperre.
