# Skallis Gefolge

Gruppen → Aldrimar → Roriksheim → Haus Varulv → Skallis Gefolge.

Das Modul verwendet die bestehenden Story-, Biografie-, Hierarchie-, Gruppenübersichts- und Sitzungsvorlagen. Die 19 Personen werden aus ihren vorhandenen Stammbaumidentitäten abgeleitet. Die Gruppenübersicht übernimmt die Hierarchie und führt mehrfach gezeigte Mitglieder einmal auf.

Skalli führt, Torben ist ihre linke und Ragna ihre rechte Hand. Hvitserk ist Erster Skalde, Hakon Kundschafterführer. Waffenmeister und Quartiermeister bleiben unbesetzt. Unter 18 werden die Mitglieder als Maer beziehungsweise Drengr im Nachwuchs geführt. Die vier Tierplätze enthalten keine Personen und erzeugen keine Kreaturen.

`retinue-people.mjs` verantwortet Auswahl und Beschreibungen, `retinue-hierarchy.mjs` die vier Bäume, `retinue-module.mjs` die Seiten. `skalli-biography-source.json` enthält die übernommenen Auszüge der bestehenden Bio. `retinue-characters.mjs` plant die Figurenübernahme; `retinue-publication.mjs` die begrenzte Konfigurations- und Biografieergänzung.

`node AleriaAlmanach/scripts/build-skalli-retinue.mjs` erzeugt die Browserregistrierung und das importierbare Modulpaket. Mit `--check` wird nur die Aktualität geprüft. Die vollständigen Bildprompts und Korrekturen stehen in `image-prompts.json`; die Bilder entstanden mit dem eingebauten ImageGen-Werkzeug. Verwendet werden die korrigierten v2-Dateien für Aslaug, Svala, Dreierbild und Lagerfeuer. Frühere Fassungen bleiben erhalten.

`firebase/scripts/content/publish-skalli-retinue.mjs` arbeitet zunächst als Vorschau; `--apply` veröffentlicht nach Bildprüfung mit verschlüsselter Sicherung und Versionsvorbedingungen. Es erhält vorhandene Online-IDs und sämtliche nicht beauftragten Profilfelder. Fenrirs ältere Online-ID wird ausdrücklich weiterverwendet. Die drei Arth-Mannschaftsmodule werden bei der Kategoriekorrektur ausschließlich über ihre Gruppenpfade verschoben und anschließend auf unveränderten Inhalt geprüft.

Das bestehende Varulv-Wappen dient zunächst als Clanzeichen. Ein eigenständiges Gefolgewappen wird nach gemeinsamer Motivwahl ergänzt.
