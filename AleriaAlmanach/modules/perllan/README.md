# Familie Perllan

Die 27 benannten Personen des gelieferten Perllan-Stammbaums erhalten eigene
Charakterakten und sachliche Biografien aus ihren belegten Lebensdaten und
Familienverbindungen. Alle 44 Personen einschließlich unbekannter Gründer und
Partner bleiben in der Familienakte erhalten. Unbekannte Platzhalter werden
nicht zu gleichnamigen Almanachfiguren vervielfacht.

Der Import erhält die Weltpersonenkennungen des Originals (`person--perllan--…`)
und verknüpft sie mit der Registerakte `perllan`. Die ursprüngliche
Dokumentkennung `perllan` bleibt als Herkunftsangabe im Einzelexport erhalten.
Porträts werden unverändert aus der lokal gesicherten Vorlage verwendet.
Lili besitzt in der Vorlage keine Hauskennung und behält deshalb ihren
überlieferten Einzelnamen. Die Weltpersonenverknüpfung ordnet ihre Akte eindeutig
dem Perllan-Stammbaum zu. Gleichnamige Angehörige anderer Familien werden nicht
zusammengeführt.

Die gemeinsamen Biografien werden zusätzlich als reine Datenprojektion unter
`Stammbäume/assets/js/data/perllan-person-biographies.generated.js` ausgegeben.
Der Stammbaum lädt diese Daten ohne Laufzeitabhängigkeit vom Almanach. Die
vermutete Gründerlinie bei Ywen bleibt ausdrücklich als Abstammungsverbindung
über einen Zeitsprung gekennzeichnet; daraus wird keine belegte direkte
biologische Elternschaft gemacht.

Vier Tiere sind auf den gelieferten Porträts sichtbar: Eichhörnchen und
Rotkehlchen bei Onn sowie Kaninchen und Blaumeise bei Lili. Sie stehen als
unbenannte Tierbegleiter in den Biografien und mit eindeutig verbundenen Karten
und Einzelstücken im Inventar. Die Originalporträts dienen als Bildbeleg. Namen,
Alter, Geschlecht, Ausbildung, Gesundheitszustand und Kampfwerte sind nicht
überliefert. Deshalb werden keine Kreaturen mit erfundenen Standardwerten
erzeugt. `pictured-companions.mjs` hält die Beobachtungen getrennt von Spielregeln.
Der gemeinsame Inventarsanitizer erhält ausdrücklich leere Attributlisten.
Dadurch ersetzen die Beispielwerte des Editors fehlende Angaben nicht beim
Anzeigen oder erneuten Speichern; nur fehlende oder ungültige Listen verwenden
weiterhin die bisherigen Editorvorgaben.

```powershell
node AleriaAlmanach/scripts/build-perllan-characters.mjs
node AleriaAlmanach/scripts/build-perllan-characters.mjs --check
node --test --experimental-test-isolation=none AleriaAlmanach/tests/perllan-characters.test.mjs
```

Der begrenzte Builder nutzt den bestehenden Charakterimport und schreibt nur die
Perllan-Akten, deren Einzelexporte sowie die drei gemeinsamen
Datenbankprojektionen. Fremde Figuren, Inventare und Laufzeitressourcen werden
nicht neu synchronisiert. Diese Arbeit bleibt lokal und schreibt nicht nach
Firestore.
