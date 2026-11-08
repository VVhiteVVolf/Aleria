# Gwniwr und Maerllys – Quellenübernahme vom 8. November 2026

Die ausdrückliche Nutzeranweisung beauftragt zwei gleich große Schneiderläden,
eigene bebilderte Sortimente, freie Personalplätze, Hausseiten und Hausbios,
Stammbäume sowie Figuren im Almanach und die anschließende Veröffentlichung.
Gwniwr bietet die günstigste schlichte bis gute Kleidung und eine begrenzte
Hochzeitslinie in walisisch-gälischer Formensprache. Maerllys fertigt Dienstkleidung
für Arbeitgeber und kooperiert mit der Göttlichen Eleganz. Der historische
Maerllys-Zweig spaltete sich schon vor dem Zeitsprung von Gwniwr ab.

## Originale und bestehende Kennungen

`gwniwr-original.json` und `gwniwr-original.html` sind die unveränderten gelieferten
Dateien. Ihre tatsächlichen Bytes und SHA-256 stehen in `inventory.json`.
Die JSON enthält zwölf Personen, davon zehn benannte und zwei unbekannte Gründer,
vier Ehen, sieben Elternschaften und einen Überlieferungssprung. Die bereits auf
GitHub vorhandene Gwniwr-Fassung Revision 1 wird unter derselben Familienkennung
fortgeführt. Alle lokalen Karten- und Beziehungskennungen bleiben erhalten.

Maerllys bleibt `haus-maerllys`. Die bestehende Familie enthält sechzehn benannte
Personen und drei unbekannte historische Figuren. Raves-, Vann-, Tonnarth-, Ysgrif-,
Swyll- und Falchdyn-Verbindungen bleiben erhalten. Der neue Ursprungshausknoten
und der Gwniwr-Kadettenknoten sind Hausverbindungen: Sie ergänzen keine biologischen
Ahnen und datieren die historische Abspaltung nicht genauer.

## Identitätsabgleich

Hywel Craigddu (1708), Gemahl Eleris (1708), ist dieselbe Person wie der im
Gwniwr-Export als „Hwyel Craigddu“ bezeichnete Mann. Das gelieferte Gwniwr-Porträt
ist byteidentisch mit dem schon bestehenden Craigddu-Porträt. Seine kanonische
Weltkennung und seine vorhandene Almanachakte bleiben erhalten. Eleris Herkunft
aus Gwniwr ist durch JSON und Hausprosa belegt. Die beiden alten Ehekennungen
werden über dieselbe hausübergreifende Linkkennung verbunden. Alle sieben Töchter
bleiben ausschließlich im fortgeführten Craigddu-Zweig. Die alten Weltkennungen
stehen in `extensions.legacyWorldPersonIds`; die genaue begrenzte Korrekturliste
mit Gegenpersonen, Quellenhash und Begründungen liegt in `identity-corrections.json`.

Nias vorhandener persönlicher Dienst als Zofe der Prinzessin Isobel Draig,
Rhys’ Verkaufstätigkeit bei der Göttlichen Eleganz und Elowens Leben und Arbeit
in der Letzten Rast bleiben erhalten. Sie werden nicht zu neuen Vollzeitstellen
im Familienladen umgeschrieben. Nias und Hywels zuvor sehr kurze beziehungsweise
fehlende Almanachbios werden ausführlich ergänzt. Rhys’ bestehende Bildsets und
die übrigen vorhandenen Profilfelder werden nicht ersetzt.

Die fünf im HTML benannten Gwniwr-Angestellten sind eigenständige Figuren:
Meirion Wym (62), Iwan Trevor (28), Briallen Wym (24), Nesta Ferchwyn (34) und
Osian (16, Lehrling). Gleicher Nachname belegt keine Verwandtschaft. Freie Stellen
und unbekannte Gründer werden nicht als benannte Almanachfiguren angelegt.

## Redaktion und Bilder

Der Profilteil nennt die Alerische Kirche, ein Fließtextsatz lässt die Religion
offen. Für Gwniwr bleibt die ausdrückliche Profilzuordnung erhalten; besondere
Patrone und Riten werden nicht ergänzt. Der beschriebene beschauliche Wohlstand
bleibt erhalten; genaue Vermögenssummen, Grundstücksflächen und Lieferverträge
werden nicht hinzuerfunden. Die Tätigkeiten der heutigen Maerllys-Werkstatt und
die detaillierten Produktlinien sind der ausdrücklich beauftragte neue Ausbau.

Zehn fehlende Maerllys-Porträts sind als individuelle ruhige Oberkörperporträts
ergänzt, alle aktiv 1024 × 1536 Pixel. Vorhandene Nia-, Rhys- und Elowen-Porträts
wurden tatsächlich angesehen und dienten für Haarfarben, Augenfarben und Stil.
Sechs schon vorhandene benannte Maerllys-/Eheporträts bleiben erhalten.
Generatororiginale, vollständige Prompts und zwei verworfene Formatvorversionen
bleiben lokal unter `diagnostics/gwniwr-maerllys-20261108/families/art/` erhalten.
Gelieferte Gwniwr-Porträts werden bytegleich verwendet. Alle aktiven Bildzuordnungen
und die tatsächlichen Quellenhashes stehen im Inventar.

Die bestehenden Familienzeichen sind nach Sichtprüfung außen transparent
aufbereitet. Das eingebaute Bildwerkzeug entfernt den äußeren Hintergrund;
die bestehende `heraldic_emblem_alpha.py`-Pipeline erhält RGB, macht die Innenseite
deckend und rahmt exakt kreisrund. Helle und dunkle Komposite wurden angesehen.
Rote RGB-Werte unter vollständig transparentem Alpha sind kein sichtbarer Saum;
die aktiven Dateien besitzen null sichtbare leuchtendrote Außenpixel.

## Zuständige Quellen und Prüfung

`import-source.mjs --emit` erzeugt ausschließlich die geprüfte Gwniwr-Familienquelle,
`--check` prüft sie lesend. Die gemeinsame Medien-/Herkunftsergänzung liegt in
`Stammbäume/assets/js/data/gwniwr-maerllys-links.js`. Hausseiten und Hausbios werden
aus den beiden `haus.content.mjs` mit dem bestehenden begrenzten Hausbuilder
erzeugt. Figurenquellen und begrenzter Datenbankprojektor liegen in
`AleriaAlmanach/modules/gwniwr-maerllys/`; `build-tailoring-characters.mjs` bietet
einen Plan, `--apply` und lesendes `--check`.

Die öffentliche Datenbankprojektion muss auf ihrer eigenen öffentlichen Basis
erzeugt werden; gemischte Main-Register sind keine öffentliche Kopiervorlage.
Methoden, lokale Importbelege, Bildaufträge und echte Browserbelege bleiben in
`diagnostics/gwniwr-maerllys-20261108/families/`. Der zentrale Releaseabschluss
dokumentiert die tatsächliche Veröffentlichung gesondert.
