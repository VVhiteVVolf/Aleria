# Prüfbeleg · 29. Oktober 2026

## Ergebnis

- Sieben Länder: Aldingen, Goldmund, Weisenfluh, Moinneach, Iathneach,
  Deitheach als frühere Ordnung und Triarchie als Besatzungsmacht auf Lothir.
- 166 Herrschaftsseiten, 74 eindeutige Ortsakten, 119 Hausquellen mit Hausseite,
  Hausbio und Kriegerdarstellung; zusätzlich die bestehende Hochreuth-Seite
  mit Ministerialenrang und überlieferter Chronik abgeglichen.
- 117 neue Familienakten ohne erfundene Personen oder Ehen. Sonnenfels,
  Weinlaub und Hochreuth behalten sämtliche genealogischen Entitäten und IDs.
- 647 aufgenommene Bilddateien entsprechen ihren Quellenhashes. Zwei zusätzliche
  neue Hausritterbilder sind mit Generatororiginalen und Einschränkung belegt.
- Quellenexporte: unveränderte Bytes anhand der SHA-256-Belege geprüft;
  jede der sechs übergebenen Platzierungslisten vollständig abgeglichen.

## Automatische Prüfung

Der abschließende kombinierte Lauf umfasste 505 Tests für Länder, Karten,
Hausseiten, Vorschauwerkstätten, Familienzuordnungen und Releasepolitik.
500 bestanden direkt. Fünf lokale Release-Fixture-Tests konnten in der Sandbox
Git nicht starten; der separate Lauf mit vorhandenem Git im Suchpfad und
freigegebenem Prozessstart bestand anschließend vollständig (7/7).
Damit sind auch diese fünf Fälle geprüft. Kein Push und kein Deploy ausgeführt.

Belege: `diagnostics/country-promotion-20261028/final-tests.log` und
`release-fixtures.log`.

Die Generatorprüfungen für Herrschafts-/Orts-/Hausquellen, Karten,
Bildaufnahme, Hausseiten, Albenübersicht, Kriegergalerie und Kartenhaushalte
bestehen. `git diff --check` meldet keine Whitespace-Fehler.

Die historischen Familien-Hashbelege bleiben gültig. Nur die ausdrücklich
angenommenen Rang-/Lehnsskalare der drei bestehenden westlichen Häuser werden
vor dem historischen Vergleich anhand exakter Vorher-/Nachherwerte projiziert.
Kein Personen- oder Beziehungsfeld wird aus dem Schutzvergleich entfernt.

## Browserprüfung

Chrome über die vorhandene Computer-Use-Anbindung, lokaler Server Port 8882:

- Neue Landesseiten zeigen ihre richtigen Titel, Landeszeichen und direkten
  Haus-/Ortsziele. Mobile Ansichten auf 390 Pixeln ohne Seitenüberlauf.
- Lothirs neue Übersicht auf 1440 und 390 Pixeln ohne Seitenüberlauf; die
  bestehende Atlasgestaltung wird wiederverwendet.
- Weinlaub auf 390 Pixeln: Josiah und Elias vorhanden, alle 21 Hofämter sichtbar,
  Vogt-Dialog mit korrektem Ministerialenrang und Aufgaben erreichbar.
- Sonnenfels auf 390 Pixeln: Weislauf-Zugehörigkeit und Hausverweise vorhanden,
  kein Seitenüberlauf.
- Cethrenns personenlose Familienakte öffnet ihre Hausbio über das Stammwappen.
- Moinneachs Karte auf 768 Pixeln: Rowak in Tarvex, Cethrenn und Barrex gemeinsam
  in Gergonax. Die Rasterkarte trägt bereits Ortsnamen; zusätzliche Pintexte
  sind deshalb standardmäßig ausgeschaltet.
- Keine fehlenden tatsächlich verlinkten Wappen oder Abbildungen in den
  geprüften Ansichten. Ein fremder Chrome-Erweiterungsfehler gehört nicht zur
  Aleria-Anwendung.
- Temporäre Viewportvorgaben wurden zurückgesetzt. Die Länderübersicht bleibt
  als lokale Prüfansicht geöffnet.

Screenshots: `diagnostics/country-promotion-20261028/lothir-overview.jpg` und
`weinlaub-office-mobile.jpg`.

## Bekannte, abgegrenzte Restpunkte

Ein zusätzlicher breiter Lauf alter Ortstests fand sechs veraltete Erwartungen
in den vorhandenen Tests zu Gwynthors Etablissements, Llysfaens Anzeigetafel,
alten Cachekennungen von Militär-/Presse-Skripten sowie Wyrm-Ortsimportwerten.
Die zugehörigen bestehenden Ortsinhalte und Laufzeitdateien wurden in dieser
Übernahme nicht verändert. Diese Abweichungen stehen separat im ersten
`regression-tests.log`; sie betreffen nicht die neuen Ortsdatenadapter.

Die beiden neuen Sonnenfels-/Weinlaub-Hausritter haben noch einen schwachen
halbtransparenten Dunst. Die unveränderten Erstfassungen bleiben vorläufig;
die Generatororiginale sind archiviert. Exakte Detailkarten und bislang
unbenannte Amtsinhaber, Einkünfte, Truppenstärken oder Genealogien bleiben
ausdrücklich offen, statt aus den Illustrationen abgeleitet zu werden.
