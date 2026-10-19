# Zum Kleinen Durst · Haus Rhwyd

Lokaler Entwurf vom 17.10.2026, nicht gepusht oder veröffentlicht. Acht Inhaltsseiten plus Kommentare: Einordnung, Familiengeschichte/Biografie, Hausdienst, Güterkarte und vier interaktive Szenen (Kai, Schankstube, Küche, Vorratsverschlag/Hinterhof). Keine Zimmervermietung, Hauswache, große Verwaltung oder zusätzlichen unbesetzten Stellen.

## Gemeinsame Quellen

`durst-people.mjs` enthält die zehn benannten Familienangehörigen, Carys und Bram. Der Stammbaum in `Stammbäume/assets/js/data/house-rhwyd-family.js` übernimmt dieselben Personen-IDs, Texte und Bilder. Unbekanntes Gründerpaar → Hausknoten → ein serieller Überlieferungssprung → Gethin/Efa → sechs Kinder (fünf Söhne und Meleri) → Iorwerth/Nia → Dewi. Die vier älteren Söhne sterben 1720; Iorwerth ist damals 15 und heute 35. Gethin stirbt 1728 an den Folgen seines Trinkens. Meleri bleibt unverheiratet im Haus. Efas und Nias Herkunftshäuser bleiben unbekannt. Carys und Bram stehen außerhalb des Stammbaums.

`durst-hierarchy.mjs`, `durst-menu.mjs` und `durst-rooms.mjs` nutzen bestehende Vorlagen und die vorhandene Preisumrechnung. Die Speisekarte enthält genau fünf Gerichte (eines davon ein seltenes Monatsspezial), dazu vier gezielt ausgewählte einfache Getränke. Standardbilder und Vergleichspreise: `krumme-kanne/source/module-before-editorial.json`; kein vollständiges Standardsortiment wird kopiert. Bram ist ein alter Ponter und verweist auf dessen tatsächliches Bestiarium-Profil.

## Bauen und Bilder

`node AleriaAlmanach/scripts/build-kleiner-durst.mjs` erzeugt das lokale Datenscript und getrennte Modul-/Familienpakete unter `Charakter Archiv Exporte/Module/Zum Kleinen Durst`. `--check` prüft ohne Schreibzugriff. Stabile IDs verhindern eine zweite Moduleintragung; Bilder werden über die vorhandenen Vorlagen skaliert.

23 neue Bilder mit dem eingebauten ImageGen: Wappen, Geschäftsschild, vier Szenen, zehn Familienporträts zu Lebzeiten, Carys, Bram und fünf Speisen. Menschen stehen; Bram liegt am Kamin. Prompts, Referenzen, Iterationen und SHA-256-Belege: `assets/kleiner-durst/image-prompts.json` und `image-results.json`. Das Wappen liegt ausschließlich im Stammbaum-Bestand und wird von dort referenziert. Originale bleiben im ImageGen-Archiv erhalten.

Am 19.10.2026 wurden auf ausdrückliche Nutzerkorrektur alle fünf Speisenbilder
neu als quadratische, freigestellte Item-Icons nach `fantasy-inventory-item`
erstellt. Echter transparenter PNG-Alphakanal, vollständiger Teller beziehungsweise
vollständige Schüssel, keine Tische oder Szenenhintergründe. Die Güterkarte verwendet
dafür `imageFormat: square`. Preise, Portionen und Fischgerichte bleiben erhalten.
Die alten Szenenfassungen sind in den Prompt-Iterationen und verworfenen Ergebnissen
dokumentiert; die Originaldateien bleiben im ImageGen-Archiv. Reproduzierbare
Promptauswahl: `scripts/build-kleiner-durst-food-prompts.mjs`; derselbe Speisen-Prompt
wird für Zum Roten Tor verwendet. Es erfolgte keine Veröffentlichung.

Die erneute Browserprüfung bestand für beide Karten auf 1440-px-Desktop und
390-px-Mobilgerät: alle 13 Speisenbilder geladen, Filter, quadratische Maße und
anklickbare Item-Popups geprüft, kein Seitenüberlauf und keine JavaScript-Fehler.
Belege: `.tmp/penrudd-durst-food-icons/browser-1792433525921/report.json`.
Alle 23 Durst-Bildprüfsummen passen; der erzeugte Alphakanal blieb unverändert.

Das Rhwyd-Wappen wurde auf Nutzerwunsch am 17.10.2026 neu gestaltet: ein quer liegender Fisch auf einem diagonal durch seine Flanke führenden gebrochenen Speerrest, ohne die konzentrischen Ringe des ersten Entwurfs. Die alte Fassung bleibt unter `assets/kleiner-durst/references/rhwyd-wappen-v1.png` erhalten. Prompt und Ergebnisse sind als Revision 2 dokumentiert.

Mit der bereits erteilten ausdrücklichen Freigabe wurden beim neuen Wappen ausschließlich Alpha und transparenter Außenrand technisch bereinigt: innen Alpha 255, außen Alpha 0, exakter Kreis mittig mit rund 86 % Motivbreite. Alle RGB-Pixel der neuen Generierung sind ohne Neuberechnung erhalten; das Original bleibt im ImageGen-Archiv. Vorhandene Bereinigung aus `scripts/normalize-theater-signs-alpha.py` wiederverwendet; ihre Leinwand erhält nun auch bei bereits passenden Ausgangsrändern alle ursprünglichen RGB-Pixel. Freigabe, Größen, Versatz und Prüfsummen stehen in `assets/kleiner-durst/emblem-alpha-correction.json`; `image-results.json` und `image-validation.json` sind aktualisiert. Helle und dunkle Vorschau geprüft, alle 23 Bildprüfsummen passen.

## Prüfung

Lokale Browserprüfung bestanden: `.tmp/kleiner-durst/browser-1792209980600/report.json`. Alle neun angezeigten Seiten auf Desktop und Mobilgerät, sämtliche lokalen und Standard-Getränkebilder geladen, vier Warenfilter plus Suche geprüft. Genau fünf Speisen und vier Getränke; Preise und Artikel bleiben im echten Editor-Rundlauf erhalten. Drei Personalreiter mit insgesamt sechs Menschen und einem Hund. Familienakte tatsächlich geöffnet: zwölf Personen, vier 1720 gefallene Brüder, Iorwerth damals 15, serieller Zeitsprung ohne doppelte Elternkanten. Familienvalidierung ohne Diagnosen, alle 23 Bildprüfsummen passend. Externe Schreibzugriffe waren gesperrt. Keine Veröffentlichung und kein Firebase-Import erfolgt.
