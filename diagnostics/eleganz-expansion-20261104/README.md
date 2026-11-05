# Göttliche Eleganz · Sortimentserweiterung vom 4. November 2026

Nutzerauftrag: zehn weitere Brautkleider für 100–20.000 Kupfer, fünf weitere
Bräutigamsgarnituren und je fünf normale Damen- und Herrenmodelle für
20–13.000 Kupfer; bisherige Spitzenkleidung auf höchstens 23.000 Kupfer senken.
Mehr Farbvielfalt im bestehenden Inventarstil. Dieser neue Auftrag bleibt lokal.

Umgesetzt: 25 neue Waren mit 25 eigenständigen PNGs, insgesamt 51 Angebote.
Die Kategorien enthalten 15 Damen-, 15 Herren-, 13 Braut- und acht
Bräutigamsmodelle. Neue Damenmode: 25–12.750 KT; neue Herrenmode: 35–11.800 KT;
neue Brautkleider: 100–20.000 KT; neue Bräutigamsmode: 175–19.000 KT.
Die bisherigen Spitzenmodelle Die Weiße, Der Dunkle, Braut der zwei Heimaten
und Der Helle Bund wurden von 48.000/52.000/65.000/68.000 auf je 23.000 KT
gesenkt. Andere bisherige Warenpreise und ursprüngliche Bilder bleiben erhalten.

Die neuen Farben reichen von Naturleinen, Ocker und Tabak über Apricot,
Altrosé und Flieder bis zu Perlgrau, Champagner, Safrangold und Schwarz.
Weiße kopflose Puppentorsi, hüftlange Darstellung und echter PNG-Alphakanal
folgen den vorhandenen Kleidungsbildern. Erzeugung ausschließlich mit dem
eingebauten Bildwerkzeug. Originale und verworfene Varianten bleiben erhalten.

Bilddateien: `AleriaAlmanach/assets/goettliche-eleganz/kleidung/<id>.png`.
Der vollständige reproduzierbare Grundpromptsatz steht dort in
`image-prompts.json`; die tatsächlichen Aufträge mit Originalpfaden und
gegebenenfalls gezielten Wiederholungen stehen hier in `womens-art.json`,
`mens-art.json`, `bridal-art.json` und `root-bridal-art.json`.
`kollektion-uebersicht.jpg` zeigt die 25 Ergänzungen gemeinsam.

Die bestehenden Sammlungsquellen bleiben zuständig. Neue Entwürfe sind in
drei eigenen Kleidungsmodulen gekapselt. Die Kataloganzeige sortiert eine
Kopie der Warenliste nach Preis; Auszeichnung, Fertigungshinweis und
Preisfüllung hängen nicht mehr von der Listenposition ab. Der Bildgenerator
und die Einzelaufträge teilen `eleganz-clothing-art.mjs`. Die ursprüngliche
26er-Fassung ist separat erhalten, einschließlich der sicheren Annahme dieser
Fassung durch den späteren Publisher. Der Wirtschaftsbericht und das
Wirtschaftsbundle sind aus den aktuellen Quellen neu erzeugt.

Bestanden: 43 Node-Fachtests (8 Sortiment/Familien und 35 Wirtschaft), alle
51 serverseitigen Angebotsauflösungen mit einem reinen In-Memory-Leser,
51 gleichwertige Angebote in der eingebauten Händlerprojektion, 25
RGBA-/Alphaprüfungen und die vollständige bestehende Chrome-Prüfung mit sechs
Seiten, vier Desktop- und vier Mobilkategorien, Suche, 14 Figuren sowie
Haus-/Stadtverknüpfungen. Alle externen Browseranfragen waren gesperrt;
der sichtbare Offlinehinweis in den Screenshots ist deshalb erwartet.
Der Browser-Test berücksichtigt jetzt den vorhandenen Fortuna-Handelshof
und den bedarfsabhängigen Aufbau des Charakterarchivs.

Prüfbelege: `verification.json`, `alpha-review.json`, `node-tests.txt` und
`browser/report.json` samt Screenshots. `verify.mjs` und `inspect-art.py`
erhalten die Methoden. Kleinste Exportrandwerte bis Alpha 2 werden wie bei
den bestehenden freigegebenen PNGs toleriert; sichtbare Schleier werden
abgelehnt. Bildpixel wurden nicht nachträglich verändert.

Keine Käufe, Inventaränderungen oder produktiven Firebase-Schreibzugriffe.
Kein Commit, Push oder Deploy. Bei einer später ausdrücklich freigegebenen
Veröffentlichung den etablierten öffentlichen Releaseweg einschließlich
Mechanik-Sync für die eingebauten Händlerquellen verwenden. Dieser Generator
liest absichtlich ausschließlich committed öffentliche Browserquellen und
wurde hier nicht durch einen Zugriff auf die vollständigen privaten
Arbeitsquellen umgangen.
