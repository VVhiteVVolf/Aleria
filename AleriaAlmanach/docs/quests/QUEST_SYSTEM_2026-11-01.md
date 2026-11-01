# Quests & Abenteuer — Stand 1. November 2026

Ergänzender aktueller Ausbau: [Der Städter und sein Pferd](TROETZLI_QUEST_2026-11-01.md)
mit immersiver Buchgestaltung, Comicfiguren, vermessenen Reisewegen, Standortpflege
in Szenen und Belohnungen für das Konto der Gruppen-Landingpage.

## Präzisierter Arbeitsauftrag

Ein gemeinsames Abenteuerjournal verbindet öffentliche Questquellen, konkrete
Gruppendurchläufe und vorhandene Spielmechanik. Es bietet aktive Abenteuer,
Gruppen, datierte Abschlüsse, Karten-, Tafel-, Modul- und Szenenverweise sowie
nachvollziehbare Belohnungen. Dieselbe Questakte darf mehrere unabhängige
Durchläufe besitzen. Besitz, Geld, Kampf und Erholung bleiben in ihren bereits
zuständigen Systemen. Bestehende Figuren, Live-Ressourcen und Kampfbelege werden
nicht migriert oder neu ausgewertet. Eine vollständig isolierte Probe verwendet
eigene Testfiguren. Die allgemeine Landingpage-Vorlage erhält die Anbindung;
einzelne bestehende Inhaltsmodule werden nicht umgeschrieben.

## Fertige Oberfläche

- Neue Seite: [`quests.html`](../../quests.html).
- Neuer Eintrag **Quests & Abenteuer** in der linken Almanach-Sidebar.
- Fünf quadratische Bildicons in der neuen Seitenleiste. Almanach, Quests und
  Anzeigetafeln haben neue SVG-Motive im vorhandenen Pergamentstil; Karten und
  Kalender verwenden ihre bestehenden Registerbilder.
- Ansichten **Auf den Wegen**, **Gesuche & Aufträge**, **Die Chronik** und
  **Orte & Geschichten**, mit Suche nach Auftrag, Gruppe oder Person.
- Questakten zeigen Auftraggeber, Ziele, Gruppe, individuelle Zeit-/Ortsstände,
  besuchte Orte, Begegnungen, Szenenbelege und ausstehende/übergebene Belohnungen.
- Questakten anlegen/bearbeiten, Gruppen anmelden, Journaleinträge für ausgewählte
  Teilnehmer, Abschluss/Abbruch, bestätigte Belohnungsverteilung und Auszahlung.
- Der gemeinsame Item-Builder ist im Belohnungseditor erreichbar. Regeln bleiben
  versionierte Itemdefinitionen; die Quest speichert Referenzen und Mengen.
  Die Itemauswahl verwendet dasselbe Güterverzeichnis wie die Anzeigetafeln,
  einschließlich der Modulangebote. Neue eigene Definitionen erscheinen durch
  den bestehenden Definitionskanal, ohne eingegebene Belohnungswerte zu verlieren.

Der öffentliche Startkatalog enthält **15 Aufträge aus 3 registrierten Tafeln**,
**69 Karten** und **89 belegte Inhaltsmodule**. Reine `[PLATZHALTER]`-Module sind
keine auswählbaren Spielorte. Live-Module werden zusätzlich über den gemeinsamen
Firebase-Datenbestand berücksichtigt. Tafeln verwenden ihre veröffentlichte JSON-
Fassung; ein Firebase-Altstand wird ausschließlich ohne veröffentlichte Fassung
als unterstützter Fallback gelesen. Neue registrierte
Quellen werden mit `npm run build:quests` erfasst; der Produktionsbuild prüft die
Aktualität. Es existiert keine zweite handgepflegte Liste einzelner Questboards.

## Zuständigkeiten und Daten

| Bereich | Zuständige Quelle |
| --- | --- |
| Öffentliche Auftragsangebote | Tafelregister, Tafelzustand und additive Autorenaushänge; Questakten in Modulseiten |
| Bearbeitete Questakte | `quests/{id}` mit Revision und expliziten Verweisen |
| Eine konkrete Gruppe auf einer Quest | `quest_runs/{id}` mit Aktenversion, Teilnehmern und eigenen Zielen |
| Journal und Korrekturbelege | Append-only `quest_events`, mit Durchlaufkennung, Sequenz und Aleria-Zeit |
| Waffen, Rüstungen und andere Items | Bestehende immutable Itemdefinitionen und getrennte Inventarbesitze |
| Kampf, Beute, Rast, Itemnutzung, Handel | Bestehende serverbestätigte Szenenbelege; das Journal projiziert sie |
| Einmalige Gruppenbelohnung | `quest_reward_claims/{runId}` und Inventaränderungen in einer Transaktion |
| Wiederholte Requests | `quest_transactions` mit Akteur, Vorgangskennung und Payload-Fingerabdruck |

`modules/quests` besitzt Modell, Quellenadapter, Repository, lokalen Ansichtsstate,
Formulare, Darstellung und Events. Firebase wird ausschließlich im Repository
angesprochen. `firebase/functions/src/quests` besitzt die serverseitigen
Geschäftsvorgänge. Das reine Modell wird mit dem bestehenden Mechaniksync in die
Functions übernommen.

Browserseitige Firestore-Schreibzugriffe auf diese neuen Sammlungen sind gesperrt.
Questakten bearbeitet Redaktion/Spielleitung. Spieler können eigene Figuren
anmelden und deren Journal ergänzen. Abschluss, Verteilungsbestätigung und
Auszahlung gehören der Spielleitung. Gewöhnliche Rollenspielbeiträge erhalten
keine neue Questprüfung und werden durch fehlende Questdaten nicht blockiert.

## Kommunikation mit den bestehenden Bereichen

**Tafeln:** Der gemeinsame Bootstrap ergänzt den Rückweg zum Journal. Jeder
öffentliche Aushang erhält im Leser einen direkten Questverweis. Mehrblättrige
Aushänge werden über ihre Veröffentlichungskennung zusammengefasst; Geheimzettel
werden nicht in den öffentlichen Questkatalog übernommen. Die bestehende additive
Merge-Logik erhält bewusste Löschungen und redaktionelle Korrekturen.
Beim Zurückkehren aus einer Tafel wird der öffentliche Stand erneut abgeglichen.
Lokale Browserentwürfe werden dabei nicht übernommen. Ein alter serialisierter
Firebase-Stand kann eine bereits veröffentlichte Tafel nicht verdrängen.

**Karten:** Der gemeinsame Karten-Bootstrap bietet Quests zur ausgewählten Karte.
Journalorte können Karte und Markierungskennung referenzieren. Ein solcher Link
fokussiert die vorhandene Markierung, sobald die Karte geladen ist. Questdaten
verschieben keine bestehenden Kartenmarker. Eine spätere Kartenebene mit
Gruppenpositionen wäre eine eigenständige Erweiterung.

**Module und Spielszenen:** Die allgemeine Modulnavigation verweist ins Journal.
Dabei wird die tatsächliche Kommentar-/Sitzungskennung mitgegeben, einschließlich
`::session:`- und `::page:`-Kennungen. Rückverweise öffnen das passende Modul und
die betreffende Seite. Figuren-/Kreaturverweise laden den vorhandenen Bogen.

**Inventar und Handel:** Belohnungen verwenden `prepareItemGrant`. Unterschiedliche
Empfänger besitzen unterschiedliche Inventarinstanzen mit derselben Regelreferenz.
Unikate können innerhalb einer Gruppenvergabe nicht dupliziert werden. Noch nicht
publizierte gemeinsame Definitionen werden bei Mehrfachempfang nur einmal in der
Transaktion vorbereitet. Inventarnutzung, Loot und Übergaben bleiben bei den
vorhandenen APIs. Eine Questbelohnung ist eine Vergabe; sie belastet nicht
automatisch ein Auftraggeberkonto. Bezahlte Käufe verwenden den vorhandenen
Handelsvorgang und dessen Geld-/Händlerbuchung.

## Allgemeine Landingpage-Vorlage

Das gilt für neue normale Landingpages und die gemeinsame Gruppenvariante.
Bestehende Seiteninhalte wurden nicht einzeln bearbeitet.

Der neue Bereich zeigt zentral verknüpfte Aufträge und Durchläufe mit **Unterwegs**
und **Chronik**, Gruppennamen, Teilnehmern, Datum und Belohnungsstatus. Die Auswahl
berücksichtigt das Modul, verknüpfte Sitzungen, optional die tatsächlichen
Charakterkennungen der Mitglieder und ausdrücklich angegebene Quest-/Durchlauf-IDs.
Die Abfragen sind auf diesen Kontext begrenzt. Weitere Durchläufe werden im
Hauptjournal aufgeschlagen. Vorschauen lösen keine Online-Anbindung aus.

Konfiguration in `landing.questJournal`:

```json
{
  "enabled": true,
  "includeMembers": true,
  "questIds": [],
  "runIds": []
}
```

Diese Felder sind im gemeinsamen Moduleditor und in den Landingpage-Einstellungen
bearbeitbar und bleiben beim Import/Export sowie bei Textänderungen erhalten.
Über „Auftrag auswählen / Gruppe anmelden“ gestartete Durchläufe erhalten die
Landingpage als Gruppenmodul-Verweis. Bestehende lokale Aufgaben bleiben
Planungsnotizen. Sie werden nicht stillschweigend in echte Durchläufe umgewandelt
und ihre lokalen Häkchen lösen keine Auszahlung aus.

## Zeit, Archiv und Wiederholbarkeit

- Der Aleria-Kalender bleibt maßgeblich: 36 Tage, 13 Monate; 9. Lichtkehr 1740
  bleibt Play-Tag 1. Questzeiten verändern weder Playbeginn noch globale Weltdaten.
- Zeitfortschritt wird pro ausgewähltem Gruppenmitglied geprüft. Ein Gespräch der
  zurückgebliebenen Figur kann zeitlich vor der Ankunft der anderen stattfinden.
- Mechanische Rast und Heilung laufen über die bestehende Szenenmechanik, nicht
  durch einen bloßen Journaleintrag.
- Beim Aufbruch werden Szenengrenzen gelesen; beim Abschluss wird das Ende des
  relevanten Szenenabschnitts eingefroren. Spätere Kämpfe oder Käufe im selben Raum
  tauchen nicht nachträglich im archivierten Abenteuer auf. Ausdrücklich bestätigte
  ältere Belege können referenziert werden.
- Aktive Durchläufe und Archive besitzen getrennte Echtzeitabfragen und eigene
  Seitencursor. Das Archiv sortiert nach dem Aleria-Abschlussdatum und der Uhrzeit.
- Ein Abschluss bleibt erhalten. Eine noch ausstehende Belohnungszuteilung kann
  die Spielleitung mit neuem Journalbeleg korrigieren. Eine erfolgte Auszahlung
  wird dadurch nicht erneut geöffnet.
- Die gesamte Verteilung wird gemeinsam vorbereitet und atomar vergeben. Fehlende
  Empfänger, Kampfbindungen, Inventarprobleme oder ungültige Unikate erzeugen keine
  Teilzahlung. Ein erneuter identischer Request liefert denselben Beleg; eine neue
  Vorgangskennung erzeugt keine zweite Questbelohnung.
- Bei einem ursprünglichen Tafelauftrag wird zusätzlich dessen bereits bestehender
  einmaliger Quellbeleg verwendet. Eine Auszahlung im Journal sperrt die zweite
  Vergabe über die Tafel und umgekehrt. Verweise auf Tafeln allein etablieren keine
  Identität: Maßgeblich bleibt die ausdrückliche Veröffentlichungskennung.

## Isolierte Probe: Die verlorene Mühlenkiste

Ausgeführt ausschließlich auf `127.0.0.1:8187` im Demo-Projekt
`demo-aleria-quests`. Der Test verweigert andere Emulatoradressen. Keine
Produktionsfiguren oder Live-Dokumente werden geladen oder beschrieben.

Mara Weglein, Jorin Feder und Hanno sind eigens angelegte Prüffiguren. Sie holen
eine versiegelte Kiste aus einem alten Lager und bringen sie zur Testmüllerin
Elske. Jorin erkundigt sich getrennt im Weggasthaus nach dem Weg. Mara überwältigt
einen Testdieb mit **einem** regulär ausgewerteten Angriff, birgt seine Beute und
nimmt die Kiste aus der interaktiven Szene auf. Eine Wanderflasche heilt und
verbraucht eine Ladung; eine echte kurze Rast mit Hanno stellt ihre konfigurierte
Ladung wieder her. Nach Zeitsprüngen trifft die Gruppe zusammen. Die Kiste wird
Mara → Jorin → Elske übergeben, mit identischer Definition und eindeutiger
Besitzfolge.

Beim Abschluss um **12:35 am 9. Lichtkehr 1740** erhalten Mara und Jorin jeweils
**12 Kupferstücke und einen Rattenprügel**. Die Waffen besitzen unterschiedliche
Besitzkennungen und dieselbe Regelversion. Gleichzeitige Wiederholungsanfragen
erzeugen genau einen Auszahlungsbeleg. Ein zusätzlicher Wiederholungsversuch mit
neuer Kennung wird abgewiesen. Anschließend werden ein bezahlter Proviantkauf
mit Händlergutschrift und ein Geldtransfer zwischen den Testfiguren geprüft.
Dieser spätere Kauf verändert das abgeschlossene Abenteuerarchiv nicht.
Der ursprüngliche Kampfbeleg bleibt inhaltlich unverändert.
Das Testmodul mit beiden Sitzungen wird im Emulator im echten Split-Modulformat
gespeichert und wieder gelesen. Der Proviantkauf prüft zusätzlich den gebundenen
Figurengeldbeutel der Testmüllerin und den um eins verminderten Händlerbestand.

Beim tatsächlichen Browserabgleich wurde außerdem ein Fehler im bisherigen
Belohnungskatalog korrigiert: 174 Standarddefinitionen enthielten unter ihren
unveränderten Versionskennungen abweichende Warentexte. Der Generator übernimmt
jetzt für bekannte Referenzen ausschließlich die kanonische Definition. Die
ausführliche Händlerbeschreibung bleibt am Warenangebot. Der gesamte Katalog
mit 807 Definitionen wird gegen das gemeinsame Register geprüft, bevor er
ausgeliefert wird; die Browserprüfung bestätigt die erfolgreiche Auswahl.

Der ausführbare Test liegt unter
[`quest-adventure.integration.mjs`](../../../firebase/functions/tests/integration/quest-adventure.integration.mjs).
Ergebnis und lokale Bedienproben liegen unter
[`diagnostics/quest-system-2026-11-01`](../../../diagnostics/quest-system-2026-11-01/adventure-result.json).
Diagnosen und Testfiguren gehören nicht in das statische Veröffentlichungspaket.

## Verifikation und verbleibende Altfehler

Die gezielten Frontend-/Modulstoreprüfungen, die gesamte Functions-Unit-Suite,
Firestore-Regelprüfungen und die echte Emulatorquest sind erfolgreich. Der
Vite-Produktionsbuild ist erfolgreich. Genaue Zählungen und Dateinamen stehen im
[`Prüfbeleg`](../../../diagnostics/quest-system-2026-11-01/verification.json).

Die zusätzliche Gesamtprüfung umfasst 1.941 Frontendfälle. Zwei VM-Testeinbindungen
wurden an den gemeinsam extrahierten Moduldecoder angepasst und mit allen 22
Modulstorefällen erneut erfolgreich geprüft. Die **15 übrigen Abweichungen sind
identisch mit dem bereits dokumentierten vorherigen Stand**: Kerant/Rüstung,
Carreg- und Begleiterzählungen, die Hilfe-Veröffentlichung, Schiffskatzen,
Kanne-Inhalte sowie Technik-/Ylva-Schadensfixtures. Sie wurden nicht durch dieses
Questfeature verändert. Vergleich: [vorheriger Item-Prüfstand](../../../diagnostics/item-system-2026-10-31/verification.json).
Die Gesamtprüfung wird deshalb nicht als vollständig grün bezeichnet.

Die Browserprüfung bestätigt Anlegen, Gruppenstart, Reiseeintrag, Abschluss,
Übergabe, Suche und Archiv. Die allgemeine Landingpage-Projektion zeigt den echten
Emulatorabschluss mit dem Status „Belohnung übergeben“. Alle fünf Sidebaricons
laden; die Seitenleiste erzeugt am geprüften normalen Browserfenster keine
zusätzlichen Scrollleisten.

## Veröffentlichung und Sicherung

**Lokal implementiert, nicht veröffentlicht.** Für den später freigegebenen Release
müssen neue Functions (`commitQuest`, `questBackup`), Regeln und Firestore-Indizes
gemeinsam mit der Oberfläche bereitgestellt werden. Die bestehenden
[Releaseanweisungen](../../../netlify/docs/LOCAL_RELEASES.md) bleiben maßgeblich.
Das Laden öffentlicher Quellen funktioniert unabhängig davon; die Oberfläche
meldet fehlende Journalberechtigungen oder Indizes und stellt keine erfolgreiche
Verbindung vor.

Vollständige Almanach-Sicherungen enthalten jetzt zusätzlich `questSystem` mit
Akten, Durchläufen, Journalereignissen, Auszahlungs- und Vorgangsbelegen. Die
Itemdefinitionen werden vor diesen Referenzen wiederhergestellt. Vorhandene
Online-Quests und spätere Auszahlungen werden durch das Auffüllen fehlender
Backupdatensätze nicht zurückgesetzt. Es gab keine Live-Migration.

Als spätere Erweiterungen bieten sich objektivbezogene automatische
Erfüllungsbedingungen, ein eigener Gruppenregisterdatensatz und eine sichtbare
Questebene auf Karten an. Der jetzige Vertrag lässt diese Ergänzungen zu, ohne
Rollenspieltexte, Inventarbesitze oder Kampfhistorien zu ersetzen.
