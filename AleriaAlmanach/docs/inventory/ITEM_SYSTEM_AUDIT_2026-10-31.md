# Itemsystem: Bestandsprüfung und Zielarchitektur

**Ausgangsaudit vor der anschließenden Umsetzung.** Der aktuelle Implementierungsstand,
die Bedienwege, Prüfbelege und verbleibenden Grenzen stehen in
[ITEM_SYSTEM_IMPLEMENTATION_2026-10-31.md](ITEM_SYSTEM_IMPLEMENTATION_2026-10-31.md).
Die nachfolgenden Aussagen über fehlende Funktionen dokumentieren den damaligen Befund.

Stand: 31. Oktober 2026. Lokale Analyse und gezielte Fehlerkorrekturen, keine
Veröffentlichung und keine Änderungen an produktiven Firebase-Daten.

## Präzisierter Arbeitsauftrag

Alle Itemquellen und ihre Verbindungen zu Handel, Szenen, Anzeigetafeln,
Inventaren, Charakter- und Kreaturbögen sowie Kampf und Verbrauch prüfen.
Gemeinsame Itemdefinitionen mit verbindlichen Regeln von einzelnen Besitzstücken
mit Menge, Zustand und Besitzer trennen. Standardwaren und Hausausrüstung teilen
ihre Werte; echte Unikate besitzen eigene Definitionen. Platzhalter und andere
Anzeigenamen begründen keine neuen Itemtypen.

Käufe, Übergaben und Verbrauch auf vollständige, wiederholungssichere Buchungen
prüfen. Fehlende Werte ausdrücklich vorläufig und bearbeitbar halten. Bestehende
Aleria-Regeln, IDs, Besitzstände, Ressourcen und historische Belege erhalten.
Bewährte Modelle recherchieren, Lücken am Code belegen und bestätigte Fehler mit
Regressionstests beheben. Einen gemeinsamen Item-Builder bewerten. Unfertige
Itemdaten dürfen gewöhnliche Rollenspielbeiträge nicht pauschal blockieren.

## Ergebnis

Die technische Grundlage ist brauchbar und deutlich weiter als eine Sammlung
unverbundener Inventarlisten. Registervorlagen, serverseitiger Handel,
Besitzinstanzen, Szenenfunde und Ausrüstungsadapter existieren bereits.
**Ein durchgängig verbindlicher gemeinsamer Statblock je Itemtyp existiert aber
noch nicht.** `templateId` ist bisher vor allem Herkunft; `combatDefinition` wird
in Besitz und Bogen kopiert und kann dort unabhängig bearbeitet werden.

Das Ziel lässt sich innerhalb der bestehenden Architektur erreichen. Ein neuer
Framework- oder Datenbankwechsel ist dafür nicht erforderlich. Die Arbeit in
diesem Audit behebt konkrete Fehler und ergänzt Grundwerte; sie ist keine
vollständige Migration auf das unten beschriebene Zielmodell und enthält noch
keinen neuen gemeinsamen Builder.

## Prüfumfang und belastbare Zahlen

Die Zählung verwendet die öffentlichen Repositoryquellen, den vorhandenen
lokalen Charakterexport und die bestehenden Quelladapter. Sie ist **keine
aktuelle Vollabfrage des produktiven Firebase-Bestands**. Eigene Online-Module,
Angebotsdokumente, Online-Kreaturen und laufende Szenen können zusätzlichen
Bestand enthalten. Private Dossiers, Browserentwürfe und IndexedDB wurden nicht
gelesen oder übernommen. Alte Szenenereignisse wurden nicht als neuer Besitz
gezählt.

| Bestand | Befund |
| --- | --- |
| Registervorlagen | 455: 269 allgemeine Güter und 186 Hausrüstungsvarianten |
| Waffen / Rüstungen und Schilde | 18 / 205; vorher nur eine Waffe mit Kampfdefinition, nach Ergänzung alle mit Grundwerten |
| Vorläufige neue Kampfdefinitionen | 222; die bestehende Saex-Definition bleibt erhalten |
| Modulquellen im vorhandenen öffentlichen Adapter | 27 Module, daraus 655 Angebote bei 20 Anbietern |
| Modulangebote mit Standardverknüpfung | 303; übrige Angebote besitzen noch keine solche Verbindung |
| Fehlende Kampfdefinitionen in Modulangeboten | 35 als Waffe oder Rüstung eingeordnete Angebote, überwiegend eigene Gofrann-Waren; darunter auch fachlich als Kleidung zu prüfende Wappenröcke |
| Lokaler Charakterexport | 255 Figuren, 1.139 Inventarzeilen |
| Exakt erkannte unveränderte Editorbeispiele | 1.021; verbleibend 118 andere Inventarzeilen, keine Aussage über deren vollständige Regelfertigstellung |
| Besitzzeilen mit Vorlagenreferenz | 14, im geprüften lokalen Register alle auflösbar |
| Ausrüstung im lokalen Bogenbestand | 62 Einträge; davon 20 virtuelle waffenlose Angriffe und 18 weitere Einträge ohne `inventoryItemId` |
| Anzeigetafel-Belohnungskatalog | 1.110 referenzierbare Katalogzeilen; Darstellung ohne eigene Auszahlungsbuchung |

Die 18 nicht verknüpften Bogeneinträge sind Prüfaufträge, keine Aufforderung zur
blinden Neuanlage: Ein Schildstoß kann eine Angriffsansicht desselben Schildes
sein. Waffenloser Nahkampf ist überhaupt kein besitzbarer Gegenstand.

Reproduzierbare Zählung:

```powershell
node AleriaAlmanach/scripts/audit-item-system.mjs
node AleriaAlmanach/scripts/audit-item-system.mjs --output diagnostics/item-system-2026-10-31/after-defaults.json
```

Die JSON-Berichte enthalten Quellhash, Registerversion, offene Referenzen und
konkrete Modulangebote. `before-defaults.json` dokumentiert den Stand vor der
Grundwerte-Ergänzung; die Platzhalterprüfung war zu diesem Zeitpunkt bereits
eingebaut. Die Ausgabe ist kein Migrationsskript.

## Welche Bereiche bereits miteinander kommunizieren

| Bereich | Bestehender Weg | Noch fehlende Verbindung |
| --- | --- | --- |
| Hauptwarenregister / Marktordner | `build-item-register.mjs` erzeugt identische Vorlagen für Browser und Functions | Verbindliche Definitionauflösung für jede spätere Regeländerung statt unabhängiger Instanzkopien |
| Waren- und Handelsgutverzeichnisse | `item-register-module-catalog.js` projiziert Sortimente; Server liest das Modul bei einem Kauf erneut | Eigene Waren benötigen echte Definitionen; Angebots-ID hängt derzeit auch von Preis und Einheit ab |
| Interaktive Szenen: Gegenstand einfügen | `scene-item-definition.js`, `commit-scene-item.js`, Aufnahme über den bestehenden Mechanikpfad | Änderungen im Szeneneditor unterscheiden noch nicht verbindlich zwischen Serienvariante und Unikat |
| Registerkauf | `commit-item-register.js`: Preis, Vermögen, Bestand, Revision und Vorgangsbeleg in einer Transaktion | Kein allgemeiner Dialog-Handelsvertrag mit Verkäufergeldbeutel und gemeinsamem Szenenbeleg |
| Manuelle Inventar-/Geldübergabe | Gemeinsames Übertragungsmodell, serverseitige Buchung beider Figuren und Szenenbeitrag | Gegenstand und Gegenleistung sind weiterhin getrennte Vorgänge; das ist noch kein atomarer Kauf zwischen Figuren |
| Freie Registerzuteilung | Server löst die Vorlage auf, übernimmt Werte, erzeugt Besitz und Bogenansicht | Kein neuer Definition-Editor an dieser Stelle |
| Charakterinventar und Kampfbogen | `character-equipment-sync.js` verknüpft Besitz und Ausrüstungsansicht bidirektional | Gleiche Standardausrüstung kann weiterhin verschiedene kopierte Werte erhalten |
| Nur im Bogen gespeicherte Ausrüstung | Bestehender Synchronisationsadapter kann Besitz und Verknüpfung ergänzen | Bestehende Online-Bestände brauchen einen geprüften Abgleich; virtuelle Angriffe ausnehmen |
| Kreaturen und Begleiter | `itemOrigin`, Bestiarium-Verweise und Besitzeradapter bestehen; Verbrauch unterstützt auch Szenenakteure | Neuer Item-Definitionsvertrag muss auch Kreaturen-Ausrüstung und Beutetabellen bedienen, ohne Kreaturen-TP auf Items zu kopieren |
| Verbrauch / Konsumieren | Gemeinsames Mengenmodell und serverseitige Mechanik; besondere Effekte wie Zornkappe und Fähigkeitstrigger existieren | Kein allgemeiner deklarativer Effektvertrag für sämtliche Tränke, Speisen, Ladungen und arkanen Güter |
| Herausforderungen | Serverseitig geprüfte Registerbelohnungen mit Inventar- und Ausrüstungsübernahme | Belohnungen ebenfalls an verbindliche Definitionen binden |
| Kreaturenbeute | Serverseitig geprüfte Beutetabelle, Anspruch je besiegter Instanz und Inventarzugang | Beute enthält bisher hauptsächlich Name, Menge und Notiz; keine vollständige Definition-Verknüpfung |
| Anzeigetafeln | Belohnungen referenzieren Katalog-IDs und zeigen deren Angaben | Zusage, Freigabe, Empfänger und einmalige Auszahlung sind noch kein gemeinsamer Vorgang |
| Archiv / Charakterdatenbank / Gruppenseiten | Lesen bzw. sichern vorhandenen Besitz oder Registerprojektionen | Sicherung/Wiederherstellung muss künftig Definitionversionen und Idempotenzbelege gemeinsam berücksichtigen |

## Recherchiertes Vorbild und Ableitung für Aleria

[Epic beschreibt für Lyra getrennte Itemdefinitionen und Iteminstanzen sowie
komponierbare Aspekte für Ausrüstung und Darstellung.](https://dev.epicgames.com/documentation/unreal-engine/lyra-inventory-and-equipment-in-unreal-engine)
Das passende Prinzip für Aleria ist die Trennung gemeinsamer Regeln vom
veränderlichen Exemplar. Die Engine-spezifische Umsetzung wird nicht übernommen.

[Firestore-Transaktionen lesen die maßgeblichen Dokumente und schreiben alle
Änderungen atomar; bei Konflikten können sie erneut ausgeführt werden.](https://firebase.google.com/docs/firestore/manage-data/transactions)
Daraus folgt für Aleria: Geld, Bestand, Besitz, Ausrüstungsverknüpfung und Beleg
eines Kaufes gehören in denselben Vorgang. Eine stabile Vorgangs-ID ist zusätzlich
nötig, damit ein erneuter HTTP-/Callable-Aufruf keinen zweiten Kauf erzeugt.

[Die offiziellen D&D-Ausrüstungstabellen liefern brauchbare Ausgangswerte für
Waffenwürfel.](https://www.dndbeyond.com/sources/dnd/br-2024/equipment)
Alerias bestehende Regeln haben Vorrang: insbesondere mittlere Rüstung,
Jungritterrüstung, Grundschutz, Schild-/Waffenkosten und die vorhandene Lanze mit
1W12. Es wurden keine D&D-Meisterschaften, Preise, Aktionsökonomie oder pauschalen
Verbrauchsgutwirkungen importiert.

## Zielmodell: vier getrennte Datensätze, abgeleitete Bogenansichten

| Datensatz | Enthält | Enthält ausdrücklich nicht |
| --- | --- | --- |
| Itemdefinition | Stabile ID, freigegebene Version, Art, gemeinsamer Statblock, Basissymbol und -beschreibung, Verwendungsregeln | Besitzer, Restmenge, individuellen Zustand oder bezahlten Kaufpreis |
| Angebot | Definitionreferenz, Anbieter, Preis, Einheit/Gebinde, Bestand, Revision und Bedingungen | Eigenständige abweichende Regeln für ein eigentlich unverändertes Standarditem |
| Besitzstück / Stapel | Instanz-ID, Definitionreferenz und Version, Besitzer/Ort, Menge, Zustand, Ladungen, optionale persönliche Darstellung, Erwerb | Ungekennzeichnete zweite Wahrheit über den gemeinsamen Statblock |
| Transaktionsbeleg | Vorgangs-ID, Akteur, Quell-/Zielreferenzen, Mengen- und Geldänderungen, gebundene Regelversion, Szenenverweis und Zeitpunkt | Einen unbeschränkt wachsenden vollständigen Charakterbogen |

Der Kampfbogen bleibt eine aus Besitz, Definition und Charakterausbildung
abgeleitete Ausrüstungsansicht. Er erhält keinen eigenen widersprechenden
Standard-Statblock. Persönliche Fertigkeiten, Attributsboni und Ausbildung sind
weiterhin Eigenschaften der Figur.

Beispiel: 30 Ritter besitzen 30 Rüstungen. Alle 30 Besitznachweise verweisen auf
dieselbe Definition `draig-platte-ritter` mit derselben freigegebenen Version.
Rangvarianten dürfen eigene Definitionen besitzen. Gawains Drachenzahn erhält
eine eigene Unikatdefinition mit Verweis auf die Schwertbasis und seinen
ausdrücklichen Sonderregeln. Ein anderer Besitzername allein erzeugt weder eine
Variante noch ein Unikat. Falls ein Unikat nur einmal existieren darf, muss der
Server diese Eigenschaft bei jeder Erzeugung/Teilung prüfen; die bisherige
Beschreibung oder ein eindeutiger Name garantiert das noch nicht.

Bei Stapeln müssen neben Definition und Version auch Zustand, Ladungen,
Qualität, Gebinde und relevante Herkunft/Preisgrundlagen kompatibel sein.
Gleichnamigkeit reicht nie. Die Anzahl der Besitzstücke darf steigen, ohne dass
dadurch weitere unabhängige Statblöcke entstehen.

## Effizienz und bestehende Grenzen

Die größte fachliche Einsparung entsteht durch gemeinsame Definitionen und die
Trennung vom Besitz, nicht durch das Löschen notwendiger Besitznachweise.
Definitionen sollten nach ID und Regelversion indiziert und zwischengespeichert
werden. Geschützte Git-Vorlagen und dynamische eigene Definitionen benötigen
denselben Resolver; Angebote und Bogenansichten lesen dessen Ergebnis.

Der Registerstore berechnet seine Projektionen derzeit bei vielen Änderungen
erneut und bezieht ganze Charakterdatensätze. Nach der Vereinheitlichung sind
gezielte Aktualisierungen betroffener Besitzer und Definitionen sinnvoll.
Inventare liegen als Array im Charakterdokument und sind aktuell auf 80 Zeilen
begrenzt. Das ist eine weitere bestehende Grenze für große Lager und viele
Einzelkäufe. Eine spätere Auslagerung in besitzerbezogene Instanzdokumente muss
Transaktionen, Sicherungen und vorhandene Bogenverknüpfungen gemeinsam erhalten.
Sie sollte nicht nebenbei mit der Definitionsmigration vermischt werden.

Ein Builder sollte seine erweiterten Ansichten erst bei Bedarf laden und die
bestehenden Vorlagenpicker wiederverwenden. Verbrauchbare Waren können als
kompatible Stapel geführt werden; unterschiedliche Erwerbsbelege und Zustände
dürfen dabei nicht verloren gehen.

## Parameter für vollständige Kommunikation

Der folgende Vertrag ist der nächste Ausbauschritt, nicht bereits vollständig
implementiertes Laufzeitverhalten:

| Gruppe | Benötigte Felder / Verhalten |
| --- | --- |
| Gemeinsam | ID, Schema-/Regelversion, Definitionart `shared` oder `unique`, Titel, Icon, Beschreibung, Kategorie, Tags, Quellen, Regelstatus `provisional` / `defined` / `narrative` |
| Physische Angaben | Gewicht und Einheit; unbekannt als unbekannt statt fiktivem Nullgewicht; Stapelbarkeit, Gebinde, Trag-/Ausrüstungsslots |
| Waffe | Waffenart und -profil, Basis-/Zweihandwürfel, Schadensart, Handbedarf, Reichweite, Munition und Itemboni; Attribut und Ausbildung getrennt auflösen |
| Rüstung / Schild | Körperrüstung oder Schild, Kategorie, Basis-RK, Schildbonus, GES-Regel, Schadensschutz und Voraussetzungen |
| Verbrauch | Verbrauchsmenge und -einheit, Zielart, Kosten, strukturierte Effekte, Dauer und belegter Verbrauch |
| Arkanes | Ladungsmaximum und Erholung in der Definition, aktuelle Ladungen am Exemplar; aktiv/passiv/angelegt; vorhandene Zauber und Effekte referenzieren |
| Nahrung / Zutaten / Werkzeuge | Verbrauch oder wiederverwendbar explizit; keine erfundene Heilung bei bloßem Essen; Zutatenmengen und Geräte auseinanderhalten |
| Handel | Preis beim Angebot, tatsächlich bezahlter Preis beim Erwerb; Belohnung/Fund ist kein Kauf; unbekannter Preis verhindert nur die konkrete preisabhängige Buchung |
| Tiere | Bestehendes Rasse-/Zuchtprofil und Kreatur-ID; aktuelle TP, Ressourcen und Kampfzustände bleiben im Kreaturprofil |

Offene Wirkungen dürfen zunächst `effects: []` und einen ausdrücklich narrativen
Regelstatus haben. Ein Heiltrank ohne definierte Heilwirkung ist damit vorhanden,
handelbar und mengenmäßig verbrauchbar, aber noch keine automatische Heilung.
Eine willkürliche Wirkung aus Beschreibungstext zu erraten wäre eine weitere
inkonsistente Regelquelle.

## Gemeinsamer Item-Builder

Der vorhandene Szeneneditor und Vorlagenpicker sind ein brauchbarer Ausgangspunkt.
Der Builder sollte als eigenes Feature mit Modell/Validierung, Definition-Adapter,
lokalem Entwurf und UI aufgebaut werden. Kein zweites Inventar und keine weitere
Kopie der Handelslogik.

Er bietet drei Entscheidungen:

1. Vorhandene Definition verwenden: nur Exemplar, Menge, Zustand und Darstellung
   ändern. Die Grundwerte bleiben gemeinsam.
2. Wiederverwendbare Variante anlegen: beispielsweise eine neue Hausrüstung mit
   eigener gemeinsam genutzter Definition.
3. Echtes Unikat anlegen: beispielsweise Drachenzahn mit eigener Regeldefinition.

Danach folgen passende Felder für Waffe, Rüstung, Verbrauchsgut, Artefakt,
Werkzeug, Dokument oder Kreaturverweis. Erweiterte Felder bleiben aufklappbar.
Ungewisse Werte sind als vorläufig speicherbar. Derselbe Builder wird von Szene,
Inventar, Angebot, Warenzeile, Beute und Anzeigetafel aufgerufen und gibt eine
Definitionreferenz zurück. Ein Händler ändert seinen Preis im Angebot; er
verändert dadurch keine Itemdefinition.

Das Popup sollte beim Erstellen eines Gegenstands bzw. bei ausdrücklich
gewählter Regelerweiterung erscheinen. Normales Rollenspiel oder bloßes Erwähnen
eines Schwertes löst keine Pflichtprüfung und keinen blockierenden Dialog aus.

## Handel im Dialog oder in einer Szene

Ein Rollenspieltext allein ist keine verlässliche Kaufabsicht. Ein expliziter
Handelsauftrag im bestehenden Interaktionsablauf muss Angebot, Käufer,
Verkäufer/Verkaufskonto, Menge und vereinbarten Preis referenzieren. Der Server
prüft Berechtigung, Revision, Bestand, Mittel und Voraussetzungen und bucht mit
derselben Vorgangs-ID:

```text
Dialog / Szene → bestätigter Handelsauftrag → serverseitige Transaktion
  → Käufergeld − Preis, Verkäufergeld + Preis bzw. benanntes Händlerkonto
  → Bestand/Quellbesitz − Menge, Zielbesitz + Menge
  → vorhandene Definition + Bogenansicht + gemeinsamer Szenen-/Handelsbeleg
```

Bestehende Registerkäufe ziehen bereits Geld ab und buchen Besitz/Bestand atomar.
Ein Verkäufergeldbeutel und der gemeinsame Dialog-Szenenbeleg sind dort bisher
nicht Teil der Transaktion. Eine Geldübergabe gefolgt von einer Itemübergabe ist
kein gleichwertiger Ersatz für einen atomaren Kauf zwischen Figuren.

Nur der fehlerhafte mechanische Vorgang wird abgewiesen. Gewöhnliche Beiträge
dürfen weder am fehlenden Statblock eines erwähnten Gegenstands noch am
unfertigen Händlerangebot scheitern. Bestehende Belegschutz- und Kampfsperren
wurden in diesem Audit nicht pauschal verschärft oder aufgehoben.

## Lokal behobene Fehler und ergänzte Grundwerte

- Unveränderte Editorbeispiele erscheinen nicht mehr als echter Besitz im
  Güterregister. Originale werden nicht gelöscht. Neue Charakterinventare starten
  ohne fiktive Beispielitems oder Beispielgefährten.
- Der klassische Inventareditor erhält Waffenprofil-ID, Rüstungskategorie,
  strukturierte Rüstungswirkungen, Regelstatus und Erwerbsmetadaten.
- Standardwaffen, Schilde und Rüstungen haben gemeinsame Ausgangswerte im
  versionierten Generator. Hausrüstungen verwenden vorläufig RK 15/17/18 nach
  Rang, schwere Jungritterrüstung den bestehenden Grundschutz. Vorhandene
  Sonderdefinitionen und bestehende Online-Exemplare werden nicht überschrieben.
- Neue Registerbesitzstücke erhalten eine eigene Kopie der Vorlagenwerte ohne
  versehentliche gemeinsame JavaScript-Objektreferenz. Das behebt Mutation im
  Arbeitsspeicher; es ersetzt noch nicht die verbindliche Definitionauflösung.
- Speisen/Getränke, verbrauchbare Rollen und Laborgeräte behalten den passenden
  Verwendungsmodus durch Kauf, Szene und Registerprojektion. Automatische Heil-,
  Mana- oder Zauberwirkungen wurden nicht erfunden.
- Registerübernahmen in Waren- und Handelsguteditoren bewahren ihre
  `canonicalKey`-Referenz auch bei geändertem Anzeigenamen. Explizite Alt-Aliase
  werden aufgelöst.
- Übergabevorschau und Server verwenden dasselbe Modell. Gleichnamige Altstücke
  mit anderen Werten werden nicht vermischt. Teilmengen erhalten eine neue
  Instanz, ID-Kollisionen werden berücksichtigt, Pfennigbeträge ganzzahlig
  gerechnet und Überläufe abgefangen.
- Übergaben erhalten einen atomaren Wiederholungsbeleg. Nach verlorener Antwort
  wird im offenen Dialog derselbe Auftrag erneut gesendet; ein Wiederaufruf
  liefert aktuellen Besitz und stellt keinen alten Inventarstand wieder her.
  Ein späterer Darstellungsfehler wird nicht als fehlgeschlagene Buchung gemeldet.
- Freie Registerzuteilungen lesen Vorlage und Werte auf dem Server, erzeugen
  Besitz und Bogenansicht zusammen und erfinden keinen Kaufbeleg.
- Fehlende optionale Werte einer neuen Ausrüstungsansicht werden nicht als
  `undefined` an Firestore gegeben. Der Fehler wurde im Emulator reproduziert
  und im gemeinsamen Ausrüstungsadapter behoben.
- Kreaturenbeute mit Bestand null erzeugt keinen Gegenstand mehr. Gleichnamige
  Beute erhöht nicht versehentlich den Bestand einer vorhandenen besonderen Waffe.
- Neue Herausforderungsbelohnungen erhalten keinen fiktiven bezahlten Kaufpreis.
  Alte als Belohnung markierte Belege liefern ebenfalls keinen automatisch daraus
  berechneten Ankaufspreis; ein ausdrücklich festgelegter Händlerankauf bleibt
  möglich.

## Sichere weitere Umsetzung

1. Gemeinsamen Definitionvertrag und serverseitigen Resolver ergänzen. Bisherige
   IDs über Alias-/Zuordnungstabellen erhalten. Gleichnamigkeit nur als Hinweis,
   niemals als automatische Zusammenführungsfreigabe verwenden.
2. Einen rein lesenden Migrationsplan für öffentliche Live-Daten erstellen:
   Standardkopien, Serienvarianten, Unikate, geänderte Altstücke, Platzhalter und
   rein virtuelle Angriffe unterscheiden. Unklare Fälle bleiben zur Prüfung offen.
3. Standardbesitz zuerst unter Erhalt aller Instanz-IDs, Käufe, Besitzer,
   Ausrüstungslinks und Ressourcen auf Definitionreferenzen umstellen. Quellen
   und Sicherungen behalten; keine historischen Kampfbelege neu auswerten.
4. Regelerneuerungen versionieren. Aktive Kämpfe behalten ihre gültige
   Regelmomentaufnahme bis zur bestehenden ausdrücklich kontrollierten
   Releasegrenze. Eine neue Definitionversion darf kein laufendes Duell still
   verändern.
5. Builder an die vorhandenen Einstiege anschließen. Anschließend atomaren
   Dialoghandel und einmalige Anzeigetafel-Auszahlungen ergänzen.
6. Beute, Kreaturen-Ausrüstung, Verbrauchseffekte, Ladungen und
   Sicherung/Wiederherstellung über denselben Vertrag anbinden. Wiederholungsbelege
   einschließlich `inventory_transfer_transactions` bei Sicherung und Restore
   mitdenken; ohne Belege können alte Aufträge nach Restore erneut buchbar sein.

Diese Schritte sind eine begründete Reihenfolge für den eigentlichen Umbau.
Ein Komplettumbau aller Live-Bestände wurde im Rahmen dieses Audits nicht
ausgeführt.

## Prüfung und Veröffentlichung

Die Prüfnachweise liegen unter `diagnostics/item-system-2026-10-31/`:
145 gezielte Frontend-/Modellregressionen, alle 249 serverseitigen Unitprüfungen,
vier echte Firestore-Übertragungstests und drei bestehende Szenenitem-Integrationstests
bestanden. Die Emulatorprüfungen verwenden ausschließlich
`demo-aleria-item-duels` auf `127.0.0.1:8182`; sie testen keine produktiven
Login-/Security-Rules-Konfigurationen. Der Vite-Produktionsbuild wurde ausgeführt;
die vorhandenen Hinweise zu klassischen Skripten und großen Bundles bleiben.

Der Registergenerator hält Browser-/Servervorlagen und Versionsmanifest
identisch. Functions werden über `sync-almanach-mechanics.mjs` aus denselben
Featuremodulen erzeugt. Eine spätere Veröffentlichung muss Functions, Vorlagen
und Frontend gemeinsam umfassen. Neue Arbeiten dieses Audits sind nicht von
früheren Freigaben für den damaligen lokalen Gesamtstand erfasst. Kein Push,
kein Deploy und keine produktive Migration wurden durchgeführt.
