# Haus-Siegelringe und persönliche Ergänzungen

Nutzerauftrag vom 2. November 2026: Angehörige ritterlicher Häuser und Clans ab
Ritterherrenrang erhalten einen Siegelring ihres eigenen Hauses, sofern bereits
ein ausgearbeitetes Inventar besteht. Unveränderte Editor-Beispielkarten zählen
nicht als Besitz. Bestehende benannte Begleiterkarten zählen als ausgearbeitete
Inventarstücke. Maßgeblich sind kanonischer Hausrang und belegte Hauszugehörigkeit;
Dienst- und Lehnsbindungen vergeben kein fremdes Siegel.

Die 18 Hausvorlagen heißen beispielsweise `Wyrm-Siegelring`; persönliche Instanzen
heißen `Gais Siegelring`. Ihre Bilder tragen die tatsächlich vorhandenen Hauswappen.
Gildas erhält sein Gafyr-Siegel unter seiner vorhandenen stabilen Besitz-ID. Sein
bereits bestehender persönlicher Überzeugen-Bonus bleibt erhalten. Die übrigen
Ringe vergeben keine zusätzlichen Boni. Der vorhandene Draig-Ring wurde unverändert
wiederverwendet; für die übrigen 17 Häuser wurden passende Itembilder erzeugt.
Eine gesondert gesicherte Nachkorrektur entfernt bei Gildas auch den alten
Draig-Verweis im historischen `icon`-Feld. Der ursprüngliche Vergabebeleg bleibt
unverändert; `gildas-icon-correction.json` dokumentiert die begrenzte Korrektur.

Der Auftrag ergänzt außerdem Owetas Silberhirsch und Owetas Draig Speer. Der
Silberhirsch ist Armels antike Silbermünze mit Hirschprägung, Tenebritspuren und
kurzem Knistern beim Draufbeißen. Seine unveränderliche Definition besitzt eine
mitgeführte passive Reduktion von magischem Schaden um 1. Dieselbe Definition
wird in Browser und Server aufgelöst; veränderbare Inventartexte vergeben keine
Regeln. Mehrere Münzen stapeln den Schutz nicht; Rüstungsschutz bleibt unabhängig.
Die gemeinsame Browser-/Serveränderung ist geprüft; die Firebase-Funktionen
sind veröffentlicht. Der gemeinsame Frontendrelease enthält dieselbe Mechanik.

Die spätere ausdrückliche Eigentumskorrektur ist online und lokal verifiziert:
Nur Oweta Draig besitzt den Silberhirsch, erhalten von Armel Balchder. Die
ursprüngliche Instanz wurde verschoben, kein zweites Exemplar vergeben.
`silberhirsch-owner-correction.mjs` kapselt den wiederholbar sicheren Abgleich;
der Beleg liegt unter `diagnostics/combat-sheets-20261102/`.

`house-ring-membership.mjs` und `house-ring-targets.mjs` bestimmen die Empfänger.
`house-ring-catalog.mjs` besitzt die versionierten Vorlagen; `house-ring-houses.mjs`
die geprüften Haus- und Bildzuordnungen. `house-ring-grant-plan.mjs` plant die
einmalige begrenzte Ergänzung ohne Firebase-Zugriff. Die Publisher unter
`firebase/scripts/content/publish-house-signets*.mjs` übernehmen Bilder und Daten.
Originale werden vor der atomaren Transaktion verschlüsselt gesichert. Kampfsperren,
Dokumentrevisionen und Vergabebelege verhindern paralleles Überschreiben und
wiederholte Auszahlungen oder Auffüllungen. Geld, vorhandener Besitz, Live-Ressourcen
und historische Kampfbelege bleiben erhalten.

Bestätigtes Ergebnis: 49 Online-Profile geändert und erneut ohne weitere Vergabe
verifiziert. Rhosyn Awenydd, Briallen Awenor und Evie Rhyddid wurden ausschließlich
lokal ergänzt. Sleipnir Varulv gehört zu den 49 Online-Profilen; für ihn existiert
keine lokale Datenbankakte. Der lokale Abgleich aktualisiert deshalb genau 51
vorhandene Akten und erfindet keinen neuen Sleipnir-Datensatz.

`CharakterDatenbank/scripts/sync-house-signets.mjs --check` prüft die begrenzten
lokalen Projektionen und Teilexporte unter
`Charakter Archiv Exporte/Haus-Siegelringe 2026-11-02/`. Nur tatsächlich bestätigte
neue oder korrigierte Besitz-IDs werden übernommen; andere lokale Entwürfe bleiben
erhalten. Ältere bestätigte Inventarimporte erkennen vollständig registrierte
neuere Quellen und setzen deren Besitz oder Herkunft nicht zurück.

Quellen, Prompts, erzeugte Originalpfade, Alphaprüfungen, Bildhashes und
Transaktionsprüfungen liegen unter `diagnostics/house-knight-rings-20261102/` sowie
`diagnostics/rianna-silberhirsch-20261102/`. Alle 20 aktiven Itembilder liegen in
`assets/house-knight-rings/` und `assets/gwynthor-seven/items/`; ihre veröffentlichten
Originalkopien sind byteweise geprüft. Kein API-Schlüssel wurde verwendet.
