# Rats- und Hofämter von Celtigerns Wacht

Die Werkstatt steht unter „Verwaltung und Ratsämter“ in der
[Vorbereitungsübersicht](../index.html). Die Baronien Arthus Streben und
Gwendolyns Ufer sowie das Ritterfürstentum Rhonwens Tränen haben eigene
Direkteinstiege. Die Auswahl umfasst außerdem Draig, Saethwyr, Gafyr und Wyrm.
Die regulären Rats- und Hofansichten nutzen dieselben Amtspläne. Über
„Besetzung in der Werkstatt bearbeiten“ gelangt man vom offiziellen Amtsfenster
direkt zur bearbeitbaren Stelle. Die Vikariate sind vom Patriarchat aus erreichbar.

## Besetzung und Entwurf

- Rats- und Hofämter öffnen jeweils ihre eigene Hierarchie. Die Amtsleitung
  lässt sich ebenso besetzen wie ein Unterposten. Figuren können per Maus
  oder Touch am Griff gezogen oder anschließend auf einen Posten gewählt
  werden. Eine Versetzung gibt die bisherigen Stellen frei. Gemeinsam
  belegte Doppelämter wie Odyars Kämmerei und Schatzmeisteramt können als
  Quellenbesetzung erhalten bleiben.
- Die Kandidatenliste zeigt den direkten Dienstkreis. Freie Bürgerliche sind
  optional. Unter „+ Aus Stammbäumen“ kann jede erfasste lebende Figur anhand
  von Name, Familie und Region gesucht und der gerade gewählten Herrschaft
  hinzugefügt werden. Suchbegriffe, Geschlecht, Familienstand, Alter und
  Besetzungsstatus lassen sich in der Bewerberliste kombinieren.
- Wiederholbare Dienste haben ihre eigene Gruppe und die Schaltfläche
  „+ Weitere Posten“. Je Vorgang können bis zu 1.000 Stellen angelegt werden.
  Weitere Vorgänge ergänzen die Gruppe. Jeder wiederholbare Posten lässt
  sich einzeln entfernen. Ein Dienstort ordnet die Stelle dem zuständigen
  örtlichen Amt zu. Eigene Titel und Aufgaben sind ebenfalls möglich.
- Die Werkstatt speichert browserlokal unter `aleria.herrschaftsverwaltung.v1`.
  Der JSON-Gesamtentwurf enthält alle sieben Verwaltungen, Umbesetzungen,
  entfernte und neue Stellen und ergänzte Bewerber. Der Import akzeptiert
  auch frühere Versionen. Eine damals ausdrücklich geplante Umbesetzung hat
  beim Einlesen Vorrang vor neu erfassten Ausgangsbesetzungen. Eine bekannte
  Stammbaumfigur aus einem inzwischen korrigierten Dienstkreis erscheint in so
  einem Entwurf als hinzugefügter Bewerber. Bei älteren Militärentwürfen
  werden Hausmacht-Besetzungen mit ihren Standorten übernommen.
  Eine Besetzung des aufgehobenen Amts Wachtmarschall wird freigegeben. Import,
  Zurücksetzen und einzelne Änderungen lassen sich rückgängig machen.

## Aufbau und Quellen

- **Räte und Kandidaten.** `scripts/build-roster.mjs` projiziert die
  Amtsinhaber aus den bestehenden Rats-, Familien- und Hausquellen.
  `scripts/roster-sources.mjs` belegt persönlichen Dienst und Ausnahmen.
  Der Stammbaumindex führt Weltpersonen zusammen, die in mehreren
  Familienakten vorkommen. Die Suche erhält diese Akten als Suchwege.
  Für jeden Eintrag enthält der Index Name, Porträt, Alter, öffentlich
  belegten Familienstand und die vorhandene Stammbaumverknüpfung. Arawn,
  Tegyr und Torri sind als Amtsfiguren belegt. Ihre Familienzuordnung
  bleibt offen.
- **Grafschaft.** `shared/cenyr-administration/county-reference.mjs` bindet die acht redaktionellen
  Quellen aus `Kontinente/modules/administration/data/celtigerns-*.mjs` ein.
  Der Identitätsabgleich vom 7. November 2026 steht unter
  `diagnostics/brenric-kriegswart-20261107/administration-identity-audit.json`.
  `county-office-plans.mjs` übernimmt die neun Prälaten und die
  persönlichen Stäbe aus der Hierarchie der Gwynthorer Kathedrale.
  In Gwynthor selbst liegt die örtliche geistliche Leitung beim Patriarchen.
  Direkt verwaltete Orte folgen dem Kartenregister. Ruinen, Höhlen,
  Tavernen und Wracks erhalten keine örtlichen Amtsvorsteher.
- **Zusätzliche Besetzungen aus dem Almanach.** `scripts/almanac-appointments.mjs`
  weist 26 aktuelle Dienste für Draig anhand der Figurenkennungen aus. Die
  vier persönlichen Zofen und drei Kammerdiener stehen unter dem Vogt.
  Die elf belegten aktiven Gardefiguren folgen der bestehenden Gardeübersicht
  und dem gemeinsamen Personenregister unter
  `Stammbäume/assets/js/data/draig-garde-people.js`. Eine belegte Garde-
  besetzung ohne Einzelakte verweist auf die öffentliche Gardeübersicht.
  Brona ist zusätzlich als
  Hofdame belegt. Gwerfyl leitet die Hofküche, Rhiain Pert die Brotvorräte.
  Kevan Pert dient in der Hausmacht auf Castell Draig, Cai Taflu direkt im
  Gefolge des Marschalls. Rhydric und Perwyn Argall bilden die belegte Wache
  von Caer Ysgellfor. Glendower gehört als Paladin zum persönlichen Stab des
  Patriarchen. Für Llysfaen, Gwaulhir, Morcarryn und Traethgwen sind die
  jeweiligen Diakone belegt. Llewarch Tonnarth ist Quartiermeister der
  Tiefenwyrm. Unbenannte Almanach-Rollenvorlagen bleiben freie Stellen.
- **Ritterfürsten.** Module für die Fächer, den persönlichen Vikariatsstab und
  die örtlichen Stellen stehen in `office-plans.mjs`, `vicariate-plan.mjs` und
  `local-offices.mjs`. Gafyr hat fünf Diakone. Saethwyr und Wyrm haben
  jeweils vier Diakone, da ihre fünften Orte als Türme geführt werden.
  Landrichter, Rentmeister und Zellenführer haben einen Sitz je Ort.
  Die Vikariate erhalten einen Dechanten, einen kleinen Schutzdienst mit
  Schwurrittern und Schwurknechten sowie persönliche Büßer unter
  unmittelbarer geistlicher Leitung.
- **Weitere Herrschaften.** Die Baronien Arthus Streben unter Haus Gwefrydd
  und Gwendolyns Ufer unter Haus Gwyvern führen die Titel „des Barons“.
  Rhonwens Tränen unter Haus Arwydd führt „des Ritterfürsten“. Die Rats-,
  Lehens- und Ortsakten liefern 13, 14 beziehungsweise 15 örtliche
  Vorsteherstellen mit 11, 11 beziehungsweise 9 Diakonen. Rhosmere,
  Abergwint und Castellbryn sind als Hauptorte einbezogen. Die
  ältere Verwaltung von Gwendolyns Ufer bleibt als Amtstafel im regulären
  Fenster zugänglich. Cadfan Trydar ist für Tŵr Morlan belegt.
- **Hofämter.** `court-plan.mjs` und `court-departments.mjs` verwenden
  dieselben Hofdefinitionen für alle sieben Häuser. Vogt, Schatzmeister und
  Kommandant der Hausmacht stehen zuoberst. Der Hofmeister vermittelt
  zwischen Zöglingen und Fachlehrern. Zofen und Kammerdiener stehen unter
  dem Vogt. Gafyr beginnt mit acht Zofenstellen. Unter dem Kommandanten
  stehen sein persönlicher Adjutant, der Hauptmann der Leibgarde und die
  Hauptleute der Hausmacht. Hauptleute führen Abteilungen ihres Adelshauses.
  Für Hausmacht-Posten kann ein Standort eingetragen werden. Die Hauptleute
  der Ortswachen stehen beim zuständigen Marschall.
- **Ergänzende Ämterquelle.** Redaktionelle Überlieferung „Ämter in Cenyr“.
  Übernommen wurden Amtszeichen, ergänzende Aufgaben und Unterrollen,
  die königlichen und magischen Titeltraditionen,
  Ratskanzler, Regentschaft sowie die seltenen Hofämter. Die jüngeren
  Festlegungen zu Vikariat, Hofmeister, Vogt und Hausmacht bestimmen die
  Struktur. Für die militärischen Dienstwege gilt die Nutzerkorrektur
  vom 24. November 2026.

Die gemeinsame Ordnung der fünf Streitkräfte steht in
`shared/cenyr-administration/military-organization.mjs`. Der Marschall
befehligt die Wachen seiner Herrschaft und führt das Heer mit den ihm nach
Lehnsrang unterstellten Hausmachtkommandanten. Bei Banneraufgeboten stellen
die Vasallen eigene Hausmächte. Kirchliche und externe Aufgebote folgen
ihrer jeweiligen kirchlichen oder vertraglichen Leitung.

Die Amtsmodelle, Ränge und Hofpläne liegen unter `shared/cenyr-administration/`.
`official-office-model.mjs` führt sie mit vorhandenen Amtsprofilen und
Hausseiteneinträgen zusammen. `office-plan-assembly.mjs` baut die gemeinsame
Struktur. `office-roles.mjs` verwaltet die wiederholbaren Rollen.
`assembly-state.mjs` speichert und prüft den Entwurf.
`office-dialog.mjs` steuert die Amtsfenster und verwendet die gemeinsame
Maus- und Touchbedienung aus `Vorschau/shared/placement-drag.mjs`.

### Aktualisieren und prüfen

```powershell
node Vorschau/Herrschaftsverwaltung/scripts/build-roster.mjs
node Vorschau/Herrschaftsverwaltung/scripts/build-roster.mjs --check
node --test --experimental-test-isolation=none Vorschau/tests/herrschaftsverwaltung.test.mjs Vorschau/tests/preparation-overview.test.mjs Vorschau/tests/placement-controls.test.mjs
node Vorschau/tests/herrschaftsverwaltung.browser.mjs
```

Der Generator schreibt `roster.generated.json` für die Werkstatt und
`shared/cenyr-administration/office-cast.generated.mjs` für die regulären
Amtsseiten. Die Amtsprojektion enthält nur die relevanten Namen, Porträts
und Verweise. Die Generatorquellen bleiben im Repository, die Oberflächen
verwenden ihre erzeugten Projektionen. Der Browserlauf
verwendet einen eigenen Loopback-Server und erstellt Aufnahmen und
Bericht in einem neuen Verzeichnis unter `diagnostics/`.
