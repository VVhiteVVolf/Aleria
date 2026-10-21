# Die Schwarzen Zitteraale

Das Modul liegt unter **Kriminalität**, bestehende ID `schwarze-zitteraale`.
Die Autorenmodelle erzeugen neun Seiten: zwei Storyseiten, die Bandenordnung,
fünf Kopfgeldakten und eine interaktive Szene im verborgenen Hauptquartier.
Öffentliche Akten verraten dessen Lage nicht. Alle Namen sind Bandenbeinamen.

`zitteraale-people.mjs` hält die fünf Figuren und die Kopfgeldwerte gemeinsam
für Modul, Figurenexport und Egons Aushang. Die HTML-Anlagen und die belegten
Urteile werden in `source-notes.json` eingeordnet. Die ausgeschiedene Hofschar
wird zusätzlich zu den sechs aktiven Rudeln geführt, ohne eine noch unbelegte
Vollstreckung ihrer Urteile zu erfinden. Bestehende Szenen-IDs bleiben erhalten.

```powershell
node AleriaAlmanach/scripts/build-schwarze-zitteraale.mjs
node Anzeigetafeln/tools/build-gwynthor-quest-notices.mjs
node --test --experimental-test-isolation=none AleriaAlmanach/tests/schwarze-zitteraale.test.mjs AleriaAlmanach/tests/authored-character-import.test.mjs Anzeigetafeln/tests/zitteraale-wanted.test.mjs
```

Der Figurenimport ergänzt gezielt fünf neue Datensätze. Er überschreibt keine
fremden Figuren. Ausrüstung, Gefährten, Online-IDs und bestehende Kampfverläufe
der übrigen Figuren bleiben unverändert. Ein erneuter vollständiger Abgleich
aller Archivexporte ist dafür nicht nötig.

Die einmalige Modulmigration ersetzt den beauftragten Altbestand und erhält
die bestehende Modul-ID. Revision 2 entfernt auch die von Revision 1 versehentlich
angehängten Altseiten. Bearbeitungen der neun neuen, fest benannten Seiten bleiben
erhalten. Nach gesetzter Revision werden Editoränderungen nicht erneut durch den
Autorenstand ersetzt. Die Revision übersteht den Editorlauf.

Die 19 verwendeten Bilder liegen unter `assets/schwarze-zitteraale/`.
`generation.json` dokumentiert die vollständigen Prompts, Vorlagen und Originale
aus dem eingebauten Bildgenerator. Nur beim Bandenzeichen wurden Alpha und
transparenter Rand mit ausdrücklicher Nutzerfreigabe korrigiert; RGB blieb
unverändert. Der technische Beleg steht in `emblem-alpha-correction.json`.

Egons Fahndung ist **ein Aushang mit sieben Blättern** an einem Nagel. Der
Ritterschlag ist eine nichtmaterielle Belohnungszusage mit eigenem Icon, keine
automatisch vergebene Fähigkeit oder Inventarinstanz. Die Belohnungsanzeige
unterstützt solche Ehrungen auch im Editor.
