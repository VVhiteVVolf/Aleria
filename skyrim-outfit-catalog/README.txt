DEIN SKYRIM-OUTFITARSENAL

Öffnen: index.html doppelt anklicken. Kein Server, Internet oder Login nötig.
Modseiten und deren Vorschaubilder benötigen Internet. Der Katalog enthält
keine kopierten Fotos und lädt selbst keine externen Ressourcen.

Umfang: Ausrüstungsgegenstände aus ALLEN aktiven Plugins des ausgewählten
MO2-Profils, gruppiert nach Ursprungsplugin. Grundspiel/Creation Club ist
enthalten, in der Standardansicht aber ausgeblendet. Nicht aktivierte Mods,
gelöschte/nicht spielbare Objekte und erkennbare technische Körperobjekte
werden ausgeschlossen. Einzelteile, Verzauberungen und Farbvarianten zählen
getrennt; die Zahl der Gegenstände ist nicht die Zahl vollständiger Sets.
Das Save-Inventar wird nicht ausgelesen. Installiert bedeutet im Profil
verfügbar, nicht zwangsläufig bereits gefunden oder überall kaufbar.

Filter: Klasse, Gildenstil, Rüstungstyp, Männer-/Frauen-Modelleinträge,
Rumpf, zuletzt installierte Pakete, Grundspiel und eigene Merkliste.
Klassen/Gilden sind thematische Empfehlungen aus Namen und Keywords.
Sie verändern weder Voraussetzungen noch Verteilung im Spiel. Gemischte
Pakete werden pro Gegenstand gefiltert. Nicht eindeutig zuordenbare Dinge
erhalten einen allgemeinen Stil statt einer erfundenen Gildenzugehörigkeit.

Modelleinträge stammen aus effektiven ARMA-Datensätzen. Auch identische
Modelle oder Autor-Fallbacks können dort für beide Geschlechter stehen.
Die Angabe ist keine Prüfung der Passform, Hauttexturen oder BodySlide-
Ausgaben. Fehlende/ungültige Verweise ergeben keine Geschlechtszusage.
Aktive Optik- und Konvertierungspakete werden separat aufgelistet; ihre
Auswahl ist nach Namen vorgenommen und kein vollständiges Asset-Audit.

Outfitpaket aufklappen: Gegenstandsnamen, Slots, Ursprung und lokales ID-
Suffix. Die Konsolensuche lässt sich kopieren: help "Gegenstandsname" 4.
Die volle Laufzeit-FormID hängt von deiner aktuellen Ladereihenfolge ab,
deshalb werden keine möglicherweise falschen player.additem-IDs erzeugt.

Sterne merken Pakete nur lokal in diesem Browser. Wenn Dateiseiten keinen
Speicherzugriff haben, bleibt die Merkliste nur während dieser Sitzung.
CSV: data/outfits.csv, UTF-8 mit BOM und Semikolon für Excel.
JSON: data/catalog.json. Warnungen: data/scan-warnings.json.

Aktualisieren: katalog_aktualisieren.bat, nach Speichern der MO2-Änderungen.
Der vorhandene Python-Befehl verwendet scripts/build_catalog.py.
Für einen anderen Installationspfad:
python scripts\build_catalog.py --instance "E:\Nolvus\Instances\Nolvus Awakening"
Die BSA-Lesehilfe wird aus dem bestehenden lokalen BodySlide-Audit unter
E:\Aleria\diagnostics\obody-bodyslide-audit-20261006 wiederverwendet.
Die Betrachtung des fertigen Katalogs benötigt diese Lesehilfe nicht.

Der Generator liest Profillisten, aktive Plugins, Metadaten und englische
Namensstrings. Er schreibt ausschließlich in diesen Katalogordner und
verändert keine Mods, Saves, Ladereihenfolge oder Profildateien.
