# Die Krumme Kanne

Die redaktionelle Grundausarbeitung liegt in `krumme-kanne-module.mjs`, Personal und Familien im Roster, Speisen und Zunftimporte in den Menü- und Katalogdateien. Die bestehenden Stammbäume und Charakteridentitäten bleiben maßgeblich.

## Services vom 16. Oktober 2026

`source/module-before-services.json` ist die schreibgeschützt erfasste, bereits veröffentlichte Fassung einschließlich aller früheren Korrekturen. `krumme-kanne-services.mjs` fügt ausschließlich eine Services-Seite hinter dem Güterregister ein. Alle ursprünglichen Seiten, Kommentare, Szenentermine und 44 Kaufangebote bleiben dabei exakt erhalten. Erneutes Anwenden erzeugt keine doppelte Seite.

Elf Dienste behandeln Bett, Einzelkammer, die Zwei-Bett-Kammer „Die Drei Eichen“, drei Langzeitvarianten, Hinterzimmer, Zuber, persönliche Wäsche, Gepäck und einen örtlichen Botengang. Sechs eigene Inventar-Icons liegen unter `assets/krumme-kanne/services/`.

Die Preise orientieren sich an der vorhandenen einfachen Hausküche (Frühstück 0,5 KT, Eintopf 0,5 KT, geröstetes Fleisch 4 KT) und bleiben unter den gehobenen Herbergstarifen der Lachenden Nixe. Ein Bett kostet 2 KT, eine eigene Kammer 3 KT und die ganze Zwei-Bett-Kammer 3,5 KT pro Nacht. Ein festes Bett mit Frühstück kostet für 36 Nächte 72 KT statt einzeln 90 KT. Die Monatskammern für eine bzw. zwei Personen kosten einschließlich Frühstück 100 bzw. 130 KT. Ein Hausmonat zählt 36 Nächte.

```powershell
node AleriaAlmanach/scripts/build-krumme-kanne.mjs
node AleriaAlmanach/scripts/build-krumme-kanne.mjs --check
node --test --experimental-test-isolation=none AleriaAlmanach/tests/krumme-kanne-services.test.mjs
```

Die Veröffentlichung verwendet `firebase/scripts/content/publish-krumme-kanne.mjs` und die gemeinsame, versionierte Inhaltsroutine. Für diese Ergänzung werden weder Charaktere noch Inventare oder Kampfdaten geschrieben. Der CLI-Aufruf ist ohne `--apply` schreibgeschützt; die Bilder müssen vor dem Online-Modul ausgeliefert sein.
