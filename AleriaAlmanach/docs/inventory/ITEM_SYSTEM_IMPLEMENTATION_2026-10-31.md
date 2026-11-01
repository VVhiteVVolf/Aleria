# Gemeinsames Itemsystem: Umsetzung vom 31. Oktober 2026

Die Implementierung liegt lokal vor. Produktive Firebase-Daten, laufende Kämpfe,
historische Ergebnisse und private Dossiers wurden nicht verändert. Es wurde
nichts gepusht oder veröffentlicht. Grundlage und präzisierter Arbeitsauftrag:
[Ausgangsaudit](ITEM_SYSTEM_AUDIT_2026-10-31.md).

## Definition und Besitz

Ein Seriengegenstand besitzt eine gemeinsame Definition mit ID und unveränderlicher
Version. Jeder Besitzdatensatz verweist über `definitionRef` darauf und führt nur
seine Instanz, Menge, persönlichen Namen, Darstellung, Herkunft, Zustand und Ladungen.
Zwei normale Schwerter oder zwei Draig-Harnische derselben Ausführung beziehen ihre
Regeln aus derselben Definitionversion. Umbenennen erzeugt keine neue Regelvariante.

Die Kampfprofile enthalten aus Kompatibilitätsgründen weiterhin abgeleitete
Ausrüstungsansichten. Sie sind bei verknüpften Gegenständen keine unabhängige
Regelquelle: Auflösung und serverseitiges Speichern stellen die gebundenen Werte
wieder her. Waffenwahl, persönliche Ausbildung und aktuelle Ressourcen bleiben
eigene Zustände. Leere Regelwerte entfernen frühere Sonderwerte ausdrücklich.
Persönliche Rüstungsnamen verändern weder die gemeinsame Kategorie noch den Rang.

Ein echtes Unikat besitzt eine eigene Definition. Eine serverseitige Bindung sichert
sowohl seine Instanz als auch genau einen Besitzplatz. Das verhindert auch Kopien
mit derselben Instanz-ID in einem zweiten Bogen. Übergabe, Szenenaufnahme, Verbrauch
und unterstützte Rücknahme verändern diese Bindung zusammen mit dem Inventar.
Mechanische Aktionen prüfen den Besitzplatz beim Laden erneut; ein in alten
freien Datensätzen eingeschleuster Verweis wird dadurch nicht kampfwirksam.

Bestehende Exemplare bleiben an ihre bisherige Version gebunden. Neue Versionen
ersetzen keine laufenden Kämpfe oder historischen Würfe. Eine neue Regelversion
wird am Besitz bewusst ausgewählt. Statische Standardversionen bleiben einschließlich
der archivierten Fassungen im Repository; eigene Versionen liegen in
`item_definitions` und `item_definition_versions`. Hausausrüstung verschiedener
Ränge bleibt eine jeweils eigene Serienausführung.

## Verbundene Bereiche und Bedienwege

| Bereich | Umsetzung |
| --- | --- |
| Hauptregister und Hausausrüstung | Alle 455 Vorlagen tragen gemeinsame Definitionreferenzen. Alle 18 Waffen und 205 Rüstungen/Schilde besitzen Grundwerte. Alerias bestehendes Balancing hat Vorrang vor den D&D-Ausgangswürfeln. |
| Modul-Gütertabellen und Sortimente | Alle 655 vorhandenen Angebote erhalten einen gemeinsamen Verweis oder eine stabile eigene, vorläufige Definition. Preisänderungen erzeugen keine neue Itemidentität. Import/Export und Editoren erhalten die Referenz. |
| Manuelles Inventar | „+ Item“, Registerauswahl und „Regeln / Item-Builder“ führen zum gemeinsamen Builder. Persönliche Angaben bleiben am Exemplar. |
| Interaktive Szenen | Der Builder bietet vorhandene Definition, Serienvariante oder Unikat an. Platzierung und Aufnahme erhalten dieselbe Referenz. Kampf und Verbrauch laden die autoritative Version. |
| Handel in der Szene | „Inventar-Interaktion → Beim Anbieter kaufen“ bucht Ware, Käufergeld, Händlergegenkonto und Szenenbeleg atomar. Preis, Bestand und Revision werden auf dem Server geprüft. |
| Anbieter als Figur | Ein Sortiment kann ein vom Besitzer oder der Spielleitung freigegebenes Figurenkonto erhalten. Käufe schreiben diesem Konto Geld gut, Verkäufe belasten es. Ohne diese Zuordnung führt das Register ein eigenes Händlergegenkonto. |
| Anzeigetafeln | Registerauswahl und Builder verwenden dieselben Definitionen. Die Spielleitung bestätigt Bedingungen und Empfänger und vergibt ein Belohnungspaket einmalig pro Tafel/Aushanggruppe. Andere Vorgangskennungen oder Empfänger erlauben keine zweite Auszahlung. Ehrungen bleiben Zusagen. |
| Beute und Herausforderungen | Vergebene Gegenstände erhalten Definitionreferenz, eigene Besitzidentität und Herkunft. Gleichnamige Bestände werden nicht zusammengeführt. Echte Unikate werden zentral geprüft. |
| Kreaturbögen | Inventare bleiben beim Einlesen, Exportieren und Speichern erhalten. Ein Inventarreiter verwendet die gemeinsame Ansicht und bietet Zuteilung über den Builder. Gespeicherte Kreaturen können definierte Verbrauchsgüter verwenden. Beim Kopieren werden gemeinsame Besitzstücke neu identifiziert; Unikate werden nicht mitkopiert. |
| Bestehende reine Bogeneinträge | „Warenregister → Bestand prüfen → Im Builder zuordnen“ übernimmt einen geprüften Eintrag als verknüpften Besitz. Bogen-ID, Ressourcen und historische Ergebnisse bleiben erhalten. |
| Vollbackup | Eigene Definitionversionen, Bindungen, Angebote, Händlerkonten und Transaktionsbelege werden mitgesichert. Wiederherstellung ergänzt fehlende Itemsystem-Dokumente und überschreibt keine neueren Bindungen, Geldkonten oder Belege. Definitionen werden vor referenzierenden Inventaren importiert. |

Kostenlose Geld- und Gegenstandsübergaben bleiben eigene Vorgänge. Ein bezahlter
Kauf wird über ein bestätigtes Angebot abgewickelt. Zwei getrennte Übergaben
stellen keinen atomaren freien Tauschhandel zwischen Spielerinventaren dar.

## Builder und Verwendung

Der Builder trennt Auswahl, neue gemeinsame Variante, echtes Unikat und neue Version
einer eigenen Definition. Name, Bild, Kategorie, Gewicht, Waffenwürfel, Attribute,
Rüstung, Schutz, Eigenschaften und Regelhinweise sind bearbeitbar. Bestehende
strukturierte Effekte, Angriffskosten, Munition und Rüstungsmechaniken bleiben in
einer erweiterten Ansicht zugänglich. Standardquellen werden nicht aus dem Browser
überschrieben; Abweichungen werden Varianten.

Für Verwendung sind Verbrauchsmenge, Ladungen, Erholung und Aktions-/Ressourcenkosten
einstellbar. Automatische Eigenwirkungen unterstützen feste Heilung, temporäre
Trefferpunkte und Ressourcenauffüllung. Ladungen erholen sich gemäß Definition bei
Rast oder Tageswechsel. Weitere Wirkungen bleiben als beschriebene, vorläufige
Regel bearbeitbar; sie werden nicht aus Beschreibungstext in automatischen Schaden,
Heilung oder Zustände umgedeutet. Automatische fremdgerichtete oder gewürfelte
Verwendungswirkungen sind damit noch nicht allgemein modelliert.

Die Benutzeroberfläche kann keine Wirkungswerte für eine einzelne Verwendung
vorgeben. Der Server lädt die gebundene Version, prüft Besitz, Menge, Ladungen und
Kosten und schreibt Ergebnis sowie Zustand gemeinsam. Eine erneut gesendete,
unveränderte Eingabe verwendet denselben aufgelösten Auftrag und denselben Beleg;
sie würfelt und verbraucht nicht erneut. Ein zurückgenommener Auftrag kann nicht
durch einen alten Netzwerkversuch wieder ausgeführt werden.

Normale Rede- und Rollenspielbeiträge benötigen weder Statblock noch Definition
noch einen Builder. Prüfungen betreffen konkrete mechanische Aktionen und
Bestandsänderungen. Vorläufige Werte und erzählerische Gegenstände sind zulässig.

## Behutsame Bestandsübernahme

Die lokale Vorschau zählt 5 sicher zuordenbare Inventareinträge und 131 Einträge
zur Einzelprüfung, einschließlich der 18 bisher nicht verknüpften Bogeneinträge.
1.021 exakt erkannte, unveränderte Editorbeispiele bleiben erhalten und werden
nicht als Registerbesitz angeboten. Waffenloser Nahkampf wird nicht zum Item.
Diese Zahlen beschreiben den öffentlichen lokalen Export, keinen Live-Zensus.

Sichere Zuordnung verlangt einen ausdrücklichen Vorlagenverweis und passende
Regeln. Namen allein begründen keine Zusammenführung. Unklare Sonderwaffen wie
persönliche Klingen werden im Builder geprüft und bei Bedarf als Unikat angelegt.
Laufende Kampfbögen bleiben für solche Übernahmen gesperrt. Eine ausdrückliche
Übernahme prüft Inventar- und gegebenenfalls Kampfbogenversion erneut.

Es gab keine automatische Massenmigration. Alte, noch nicht zugeordnete Daten
bleiben lesbar und regelwirksam. Ein alter manueller Bogeneintrag wird nicht ohne
Prüfung zum Seriengegenstand oder Unikat erklärt. Der bisherige allgemeine
Angriffseditor bleibt für Techniken, Körperwaffen und Altbestände erhalten.

## Prüfung und Veröffentlichungsgrenze

Prüfbelege liegen unter `diagnostics/item-system-2026-10-31/`:

Die abschließenden Gruppen umfassen insgesamt **470 bestandene Prüfungen**
(171 Frontend, 259 Server, 19 Zugriffsregeln, sieben Tafelprüfungen und
14 echte Firestore-Integrationsproben). `verification.json` fasst die Belege zusammen.

- `item-frontend-final.log`: 171 gezielte Inventar-, Register-, Ausrüstungs-,
  Kreatur-, Szenen-, Verwendungs- und Beitragsprüfungen bestanden.
- `server-final.log`: vollständige serverseitige Einheitstests; zusätzlich echte
  Firestore-Proben in `item-definitions-emulator-final.log`,
  `transfer-emulator-final.log` und `scene-items-final.log`.
- `firestore-rules-final.log`: 19 Zugriffsprüfungen bestanden. Öffentliche
  Definitionen bleiben lesbar; Browser können geschützte Regeln und Besitzstände
  nicht direkt überschreiben. Biographieänderungen bleiben möglich.
- `notice-rewards-final.log`: sieben Tafel-Belohnungsprüfungen bestanden.
- `build-final.log`: lokaler Vite-Produktionsbuild. Die vorhandenen Hinweise zu
  großen Ausgabepaketen bleiben eine getrennte Optimierungsaufgabe.
- `migration-plan.json` und `audit-final.json`: ausschließlich lesende Auswertung
  öffentlicher lokaler Quellen.
- `ui-harness.html`: Browserprüfung des echten Builders mit ausdrücklich lokalem
  Arbeitsspeicheradapter, ohne produktive Firebase-Schreibzugriffe.

Der breite Frontendlauf in `frontend-final.log` meldete 18 Fehler bei 1.920 Tests.
Drei betrafen den bisherigen VM-Testadapter für den neuen Modulimport im
Beitragsversand; sie wurden anschließend korrigiert und gezielt erneut geprüft.
15 weitere Abweichungen betreffen Klassen-/Waffenbalancing- und Inhaltsfixtures
(unter anderem Kerant, Ylvas Schadensformeln, Carreg, Schiffskatzen, veränderte
Familientexte und feste Registerzahlen). Sie bleiben sichtbar dokumentiert;
der globale Testlauf wird nicht als vollständig grün ausgegeben. Historische
Kampfergebnisse oder fremde Inhaltsänderungen wurden dafür nicht umgeschrieben.

Vor einer Veröffentlichung müssen die Firebase-Funktionen und Regeln gemeinsam
mit dem Frontendstand bereitgestellt werden. Neue Aufrufe benötigen die neuen
Serverfunktionen. Die vorhandene Versionsprüfung verhindert Käufe gegen veraltete
Registerdaten. Der freigegebene Releaseweg bleibt unverändert; diese neue Arbeit
ist noch nicht zur Veröffentlichung freigegeben.

## Verwendetes Architekturvorbild

Die Trennung von Definition und Instanz folgt dem etablierten Modell der
[Lyra-Inventare von Epic](https://dev.epicgames.com/documentation/en-us/unreal-engine/lyra-inventory-and-equipment-in-unreal-engine).
Gemeinsame Buchungen verwenden
[Firestore-Transaktionen](https://firebase.google.com/docs/firestore/manage-data/transactions).
Für anfängliche Waffenwerte dient die
[D&D-Ausrüstungsliste](https://www.dndbeyond.com/sources/dnd/free-rules/equipment)
als Ausgangspunkt; projektinterne Kampf- und Rüstungsregeln bleiben maßgeblich.
