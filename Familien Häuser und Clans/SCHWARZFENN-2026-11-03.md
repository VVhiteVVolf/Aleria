# Wolfsklamms Clans im Jarltum Schwarzfenn

Die elf gelieferten Vorlagen decken alle vorhandenen öffentlichen Schwarzfenn-Akten ab: Ragnulf, Helgr, Kummerherz, Todbrand, Eisbrand, Graumähne, Schmetterschild, Hrafn, Arnvild, Svartholmr und Mac Bronaigh. Der Jarltumsname Schwarzfenn und der Hauptsitz Wolfsklamm im Wolfsfenn bleiben unterschiedliche Ebenen. Es werden weder zusätzliche Ortsregister noch Familien aus bloßen Dienst- oder Herkunftsbindungen erzeugt.

Jede Familie erhält Hausseite und Hausbio mit ihrer bestehenden Familienakte als Iframe. Die vollständigen redigierten Seiten verwenden die große Vorlage, damit auch ihre Kriegerkapitel sichtbar bleiben. Die kurzen Hausbios verlinken die ausführlichen Seiten. Graphen, Personen, Profile, Titel, Wappen, IDs und Ortsordner bleiben unverändert. Die kanonische ID Graumähnes lautet `haus-graumahne`.

Alle elf Originaldarstellungen wurden unverändert lokal gesichert. Eisbrands Gruppenbild und die Reiter von Graumähne und Schmetterschild bleiben vollständig erhalten. Svartholmrs abweichende Originalmaße 409 × 610 Pixel werden nicht normiert. Es gibt keine Bildlücken und keine Neugenerierungen in diesem Auftrag.

Arnvild bleibt ein jüngst erloschener Clan im Hesirenrang. Svartholmr und Mac Bronaigh gehören zur antiken Überlieferung und erhalten keinen erfundenen Rang. Historische Sitzangaben stammen aus vorhandenen Ortsbezügen; „Antike Crannath Clans“ ist eine Kulturkategorie. Mac Bronaighs Kapitel heißt Kriegskunst. Eisbrand wird als nicht anerkanntes Bastard- und Banditenhaus geführt; sein nichtadeliger Stand und die fehlende Lehnsherrschaft bleiben erhalten. Unterschiedliche Berichte über Arnvilds Vernichtung werden ohne neu erfundenen Befehlgeber oder Fraktionszuweisung redigiert.

Die redaktionellen Quellen liegen pro Familie unter `Estryll/Aldrimar/Schwarzfenn/`. Der bestehende Adapter `modules/house-content/reviewed-aldrimar-house-content.mjs` verbindet die geprüften Kapitel mit kanonischen Metadaten und Personenlinks. Die begrenzten Generatoren werden ausschließlich für die elf Haus-IDs ausgeführt. Gelieferte Stammbaumtabellen und Militärstatistiken werden vollständig aus der Übernahme ausgeschlossen.

Roharchive, Quellenentscheidungen, Vorher-Sicherung und Bildprüfungen liegen unter `diagnostics/wolfsklamm-clans-20261103/`. Gezielte Prüfung: `node "Familien Häuser und Clans/tests/schwarzfenn-house-pages.test.mjs"`.

Der Auftrag wird lokal umgesetzt; Commit, Push und Deploy sind kein Bestandteil dieser Übernahme.
