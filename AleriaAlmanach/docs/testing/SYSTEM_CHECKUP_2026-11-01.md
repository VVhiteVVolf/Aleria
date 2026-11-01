# Systemcheck: Kampf, Items und Abenteuer — 1. November 2026

## Einschätzung

Die gemeinsame Grundlage ist tragfähig: Gegenstandsdefinition und tatsächlicher
Besitz sind getrennt, Browser und Functions verwenden dieselben Regelmodelle,
wirtschaftliche Vorgänge laufen transaktional, und das Questjournal liest
gespeicherte Ereignisse statt vergangene Kämpfe erneut auszuwürfeln. Die geprüfte
Testquest verbindet diese Bereiche tatsächlich miteinander.

Der Stand ist dennoch kein abgeschlossenes Gesamtsystem. Besonders die
Wiederherstellung zusammenhängender Daten und die Regeln für gemeinschaftliche
Figurensteuerung brauchen noch einen ausdrücklichen Vertrag. Kontrollierte
Übergaben zwischen Gruppenvermögen und Figuren sind inzwischen implementiert;
der [Gruppenabschlussbericht](GROUP_SYSTEMS_2026-11-01.md) ergänzt diesen ersten
Check. Die verbleibenden Lücken werden nicht durch zusätzliche Pflichtfelder
für normale Rollenspielbeiträge gelöst.

Dieser Check umfasst öffentliche Repositoryquellen, lokale Bestandsprojektionen,
Unitprüfungen, Produktionsbuild und isolierte Firestore-Emulatorprojekte.
Er ist kein Zensus produktiver Inventare. Private Dossiers, Browserentwürfe,
Onlinefiguren, historische Würfe und produktive Konten wurden nicht verändert.
Es gab keinen Push, Deploy oder produktiven Migrationslauf.

## Geprüfte Verbindungen

| Verbindung | Befund |
| --- | --- |
| Standardware / Modulware → Inventar → Ausrüstung → Kampf | Gemeinsame Definition mit Versionsverweis; unabhängige Besitzkennungen. Keine dreißig persönlichen Statblöcke für dieselbe Standardrüstung erforderlich. |
| Echte Unikate | Eigene Definition und globale Instanzbindung; konkurrierende Zuteilungen werden geprüft. Manueller Lebenszyklus und Rückkauf sind noch unvollständig. |
| Szenenplatzierung → Aufnahme → Übergabe | Vorhanden; in der Testquest eine kanonische Kiste aufgenommen und bis zur Auftraggeberin weitergegeben. Entwaffnungs-Drops sind ebenfalls vorhanden. |
| Kauf / Verkauf → Geld → Händlergegenkonto | Atomare Buchung mit Herkunft und Beleg; fehlerhaftes Gegenkonto bei Modulrückverkauf behoben. |
| Verbrauch / Ladungen → Rast → Rücknahme | Echte Nutzung und Regeneration geprüft; spätere Gegenstände und Geld dürfen nicht durch ältere Szenensnapshots verschwinden. |
| Quest → Szene → Kampf / Reise / Ort | Vorhandene Belege und manuell gepflegte Questereignisse; fehlerhafte Reihenfolge sowie importierte/fremde Belege im Journal korrigiert. |
| Quest → Tafel / Modul / Karte / Landingpage | Kontextverweise vorhanden. Aktive Durchläufe und Archive getrennt abgefragt; Kontextansichten bleiben begrenzte Vorschaufenster. |
| Questabschluss → Einzelpersonen / Gruppe | Wiederholsichere, atomare Auszahlung geprüft. Gruppenkonto kann empfangen; kontrollierte Einlagen und Übergaben an Charakter-/Kreaturinventare sind anschließend umgesetzt und im Browser sowie Emulator geprüft. Direkter Einkauf aus dem Gruppenvermögen bleibt ein separater Ausbau. |
| Backup → alle beteiligten Bestände | Abschnitte vorhanden, aber noch keine gemeinsame zeitpunktkonsistente Rücksetzung. Siehe höchste Priorität unten. |

Gemeinsame Definitionen sind bewusst versioniert. Eine neue Regelversion darf
vorhandene Kämpfe nicht rückwirkend verändern. Ein späterer Regelabgleich muss
deshalb ausgewählte aktuelle Besitzverweise ausdrücklich aktualisieren und
gespeicherte Auswertungen erhalten. Namensgleichheit allein genügt weder zur
Zusammenführung noch zur Erkennung eines Unikats.

## Konkrete Korrekturen dieses Checks

- **Rast und Besitz:** Ladungsregeneration verwendet das aktuell gelesene
  Inventar. Ein historischer Kampfsnapshot konnte zuvor spätere Käufe,
  Übergaben oder den aktuellen Geldstand überschreiben.
- **Rücknahme und Besitz:** Neue Inventar-Nachherbelege schützen gegen spätere
  Besitzänderungen; geeignete alte Belege werden ohne Umschreiben ausgewertet.
  Mehrstufiges normales Undo bleibt trotz steigender Revisionen möglich.
- **Rast und Kampfbindung:** Persistente Figuren können während ihrer aktiven
  Kampfbindung nicht in einer anderen Szene geheilt und nachgeladen werden.
  Eine rückdatierte Rast wird hinter bereits ausgewertete Ereignisse geordnet.
- **Administrative Rücknahme:** Nur bestehende Moderator-/Adminrollen dürfen
  den ausdrücklich administrativen Force-Pfad verwenden. Normales gemeinsames
  Spiel erhält keine neue pauschale Besitzsperre.
- **Waffen und Klassen:** Ylvas Erstangriffe übernehmen den tatsächlichen
  Waffenschadenstyp, damit typgebundener Schutz greift. Die Rüstungsroutine
  erkennt auch die sieben Brevanor-Kämpferklassen aus dem gemeinsamen Katalog.
- **Speicherbare Zustandsaktionen:** Optionale Angaben im Zustandssnapshot
  werden ausdrücklich als `null` gespeichert. Ein `undefined`-Feld ließ zuvor
  23 echte Integrationstestfälle an der Firestore-Grenze scheitern. Die
  gemeinsame Testdatenbank lehnt solche Werte jetzt ebenfalls ab, statt sie
  durch JSON-Kopieren stillschweigend zu entfernen.
- **Modulhandel:** Der Rückverkauf verwendet die gespeicherte Modulherkunft für
  dasselbe Händlerkonto; ein Client-Modulname legt das Gegenkonto nicht fest.
- **Mengen und Ladungen:** Gemeinsame Mengenprüfung für Kauf, Zuteilung,
  Migration und Übergabe. Nicht stapelbare Ausrüstung und Gegenstände mit
  individuellen Ladungen werden nicht als teilbarer Besitzstapel erzeugt.
- **Katalogwachstum:** Neue registrierte Familien ohne Rüstungsillustration
  werden als fehlende Bildreferenz geführt, statt den gesamten Itemgenerator
  abzubrechen. Freigegebene Bildzuordnungen bleiben erhalten. Der Regionalkatalog
  folgt wieder der aktuellen Stammbaumordnung; Standardwerte und die
  Itemregisterversion bleiben unverändert.
- **Questprojektion:** Vertrauenswürdige Belege vor der Kampfprojektion
  chronologisch sortieren, Figurenart und Kennung gemeinsam vergleichen und
  importierte/zurückgenommene oder unverbundene Ereignisse ausschließen.
- **Questanzeige:** Abfragefehler zerstören den Tracker-Dialog nicht mehr.
  Aktive Quests werden nicht von alten Abschlüssen verdrängt. Das Archiv folgt
  dem Aleria-Abschlussdatum und springt bei späterer Auszahlung nicht nach oben.
- **Backuphistorie:** Auch importierte Kampfstart/-ende-, Status-, Beute-,
  Fertigkeits- und allgemeine Mechanikbelege verlieren ihre Live-Autorität.
  Eine unvollständige alte Klassifikation ließ bestimmte Ereignisse wieder als
  aktuelle Mechanik erscheinen. Klassifikation mit dem narrativen Serverpfad
  geteilt; Inhalt der historischen Belege bleibt erhalten.

Die Integration prüft zusätzlich die tatsächliche Firestore-Speicherbarkeit
zustandsverändernder Kampfaktionen: Nach der Korrektur bestehen alle 73 Fälle
des breiten Kampf-Integrationstestlaufs. Alte Auswertungen werden nicht verändert.

## Was wir als Nächstes unbedingt angehen sollten

| Priorität | Lücke und konkrete Folge | Empfohlener nächster Schritt |
| --- | --- | --- |
| **P1** | **Gemeinsamer Wiederherstellungsvertrag.** Der Vollbackup-Export liest Bereiche parallel, ohne gemeinsamen Snapshotzeitpunkt. Der Import überschreibt Figuren und Kommentare, ergänzt Item-/Questbelege, Händlerkonten und Gruppenkonten jedoch nur fehlend. Ein altes Figureninventar kann dadurch neben einer neueren Kauf- oder Belohnungsquittung stehen. | Zwei ausdrückliche Verfahren: fehlende Datensätze ergänzen und vollständige, koordinierte Wiederherstellung. Vor jeder Änderung Vorschau mit Versions-/Belegabgleich; zusammengehörige Daten unter einer Wiederherstellungskennung prüfen. Kein produktiver Altbackup-Rollback als bloßer Gesamtimport. Die bestehende konsistente Szenensicherung ist ein brauchbares Vorbild, ersetzt aber keinen Gesamtsnapshot. |
| **P2, verbleibender Ausbau** | **Direkter gemeinsamer Einkauf.** Autoritative Einlagen, Auszahlungen und Warenübergaben zwischen Gruppenkonto und Figuren sind inzwischen umgesetzt, einschließlich Rollen, Revisionen, Transaktion und wiederholsicherem Beleg. Direkter Händlerkauf zulasten der Gruppenkasse fehlt weiterhin. | Gruppen- und Händlergegenkonto in denselben Kaufvorgang einbeziehen. Das redaktionelle Kassenbuch bleibt eine eigene Aufzeichnung. |
| **P1** | **Figurensteuerung ist uneinheitlich.** Kampf/Rast erlauben gemeinschaftliche angemeldete Steuerung; Itemübergaben besitzen strengere Eigentumsprüfungen. Viele Alt-NPCs haben keinen `ownerUid`. | Explizite Steuerungsfreigaben für Personen, Gruppen, NPCs und Spielleitung definieren. Keine pauschale Besitzerpflicht für Rollenspiel oder alte Figuren nachrüsten. |
| **P1 vor breiter Bestandsübernahme** | **Produktive Altbestände sind noch nicht abgeglichen.** Platzhalter, persönliche Ausnahmen und Stapel alter Ausrüstung lassen sich nicht zuverlässig nur anhand des Namens migrieren. | Zuerst schreibfreie Vorschau mit Sicherung und Zuordnungsliste, dann geprüfte kleine Chargen. Besitz, IDs, aktuelle Ressourcen und alte Kampfbelege erhalten. |
| **P2** | **Bezahlter Handel zwischen zwei Spielerinventaren** ist noch kein einzelner beidseitig bestätigter Vorgang. Zwei Schenkungen können auseinanderfallen. | Ein gemeinsamer Tauschauftrag für Ware und Geld mit Bestätigung, Transaktion und Vorgangskennung. |
| **P2** | **Lebenszyklus einzelner Items.** Szenenaufnahme/Ablegen existieren; allgemeines manuelles Vernichten/Entfernen und Rückkauf derselben Händlerinstanz sind nicht vollständig modelliert. | Ausdrückliche Ereignisse für Besitzwechsel und endgültiges Entfernen. Unikatbindung, echtes Händlerlager und Rücknahme gemeinsam behandeln. |
| **P2** | **Szenenabschluss ist kein einheitlicher Mechanikzustand.** Redaktioneller Szenenstatus und Redestab-Ende haben noch keinen durchgängigen serverseitigen Vertrag. | Schließen, Wiederöffnen und Folgeszene gemeinsam modellieren. Archivnotizen und normale Texte weiter ermöglichen; mechanische Änderungen gezielt behandeln. |
| **P2** | **Tageserholung verwendet szenenbezogene Schlüssel.** Ein Szenenwechsel am selben Welttag kann einen anderen Erholungsschlüssel ergeben. Rast besitzt zudem noch keine dauerhafte Vorgangsquittung wie neue Wirtschaftsvorgänge. | Weltzeit und Szenenzeit ausdrücklich zuordnen; eine künftige Version der Erholung ergänzen und alte Schlüssel erhalten. Wiederholte Rastanfragen sollen denselben Beleg zurückgeben. |
| **P2, abhängig vom gewünschten Vertrauensmodell** | **Würfelwerte kommen aus dem Browser.** Der Server prüft Grenzen und berechnet Wirkung neu; das ist keine unveränderbare serverseitige Würfelziehung. | Für manipulationsgeschützte mechanische Belohnungen einen einmal verwendbaren Serverwurfbeleg vorsehen. Das kooperative Würfelmodell nicht stillschweigend umstellen. |
| **P2/P3** | **Effizienz großer Inventare.** Maximal 80 Besitzzeilen; wiederholte kompatible Käufe erzeugen weitere Zeilen. | Zusammenfassen nur bei gleicher Definitionversion, gleichem Zustand/Gebinde und erhaltener Herkunft. Erst anschließend einen größeren Instanzspeicher einschließlich Ausrüstung und Backup planen. |
| **P3** | **Itembuilder und Wirkungen.** Stapelbarkeit ist im Datenvertrag, aber noch kein eigenes Builderfeld. Automatische Itemnutzung ist auf feste Eigenheilung, temporäre TP und Ressourcen begrenzt. | Explizite Felder und typisierte Wirkungsbausteine ergänzen. Vorläufige Standardwerte sind eine bearbeitbare Ausgangslage, kein abgeschlossenes Balancing aller Alchemie-/Arkanwaren. |

Quellbelege zur Wiederherstellung:
`modules/backup/almanach-backup.js` (`buildFullAlmanachBackupPayload`,
`applyFullAlmanachBackup`), `firebase/functions/src/items/item-backup.js`
(`restoreItemBackupRecords`), `firebase/functions/src/quests/quest-backup.js`
(`restoreQuestBackup`) und `firebase/functions/src/backup/scene-backup-snapshot.js`.
Ausführliche Combat- und Itembefunde enthalten die verknüpften Teilberichte.

Die Wiederherstellungslücke wurde zusätzlich mit den tatsächlichen privilegierten
Serveroperationen und ausschließlich synthetischen Daten reproduziert: altes
Figurengeld 100 ersetzte den aktuellen Stand 37, während der neuere Kaufbeleg,
der ausgezahlte Queststatus und die Gruppenkasse bei 50 erhalten blieben.
[`backup-mixed-restore-result.json`](../../../diagnostics/system-checkup-2026-11-01/backup-mixed-restore-result.json)
belegt diesen offenen Befund. Ein erfolgreicher Diagnosefall bedeutet hier
ausdrücklich, dass die Inkonsistenz nachgewiesen ist; sie ist damit nicht behoben.

## Veröffentlichung und Indizes

Die neuen Quest-Kontextabfragen benötigen sechs zusammengesetzte Indizes aus
`firebase/firestore.indexes.json`. Die Releaseprüfung berücksichtigt diese Datei
jetzt als Eingabe. Indizes müssen vor beziehungsweise mit der Oberfläche fertig
aufgebaut sein; ein Emulatorlauf belegt ihren produktiven Aufbau nicht.
Functions, Rules und Frontend sind bei der späteren Veröffentlichung aufeinander
abzustimmen. Ein reiner Netlify-Deploy veröffentlicht keine Firebase-Functions.

## Prüfstand

Die abschließende Prüfübersicht liegt in
[`verification.json`](../../../diagnostics/system-checkup-2026-11-01/verification.json).
Sie unterscheidet vollständige Testläufe, gezielte Regressionen und echte
Emulatorabläufe. Erste rote Läufe bleiben als Fehlernachweis erhalten.

| Prüfung | Abschließendes Ergebnis |
| --- | --- |
| Vollständige Frontend-/Modelltests | 1.963 bestanden |
| Vollständige Server-Unitprüfungen mit strikter Testdatenbank | 292 bestanden |
| Breiter echter Combat-Emulatorlauf | 73 bestanden |
| Firestore-Regeln, Default und Stammbaumdatenbank | 27 bestanden |
| Build-/Releasevertrag einschließlich Indexänderungen | 25 bestanden |
| Vollständige Testquest über tatsächliche Serveroperationen | Bestanden |
| Kampfstart → fremde Rast abweisen → Kampfende → Rast erlauben | Bestanden |
| Backup-Mischrestore als Diagnose | Offenen Befund reproduziert |
| Produktionsbuild und Item-/Quest-/Landing-/Belohnungskataloge | Erfolgreich |

Die Testquest verwendet ausschließlich Testfiguren in einem lokalen
Demo-Projekt über die tatsächlichen Serveroperationen: getrennte Szenen und
Uhren, Reise/Zeitsprung, ein kurzer Kampf,
Beute, Szenenaufnahme und zwei Übergaben, Ladungsverbrauch und Rast, Abschluss,
einmalige persönliche sowie gemeinsame Auszahlung, Einkauf mit
Verkäufergutschrift und Bestandsminderung, Geldtransfer und unveränderte
Archivgrenzen. Sie verändert die kanonische Pferdequest und deren Beteiligte
nicht.

Bekannte rote Altprüfungen wurden einzeln geklärt: bestehende Krit-/Budgetregeln,
gewachsene Register, Uffel als Mannschaftskater ohne persönlichen Besitzer,
zusätzlicher Hilfe-Aushang und Llinos' zentral abgeglichene Hauszugehörigkeit.
Tests wurden an belegte Verträge angepasst, Kanoninhalte nicht zurückgesetzt.
Die Modellprüfungen ersetzen keinen manuellen Durchgang sämtlicher Oberflächen
oder einen Lasttest. Der Produktionsbuild gelingt; größere JavaScript-Chunks
werden weiterhin vom Bundler gemeldet und sind eine spätere Ladezeitaufgabe.

Teilberichte:

- [Itemsystem](../inventory/ITEM_SYSTEM_CHECKUP_2026-11-01.md)
- [Combat und Rast](../../../diagnostics/system-checkup-2026-11-01/combat-findings.md)
- [Questvertrag und bisherige Grenzen](../quests/QUEST_SYSTEM_2026-11-01.md)
- [Quest-Kontextansichten und Releasebedarf](../../modules/quests/README.md)
