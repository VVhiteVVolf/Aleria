# Tierische Begleiter des Hauses Draig

Am 11. Oktober 2026 wurden die 22 Tiere der Nutzervorlage als persönliche Kreaturen angelegt und mit 14 bereits vorhandenen, über den Stammbaum zugeordneten Figuren verknüpft. Zusätzlich wurden Tanor und Uath mit ihren vorhandenen Inventarkarten verbunden; einschließlich Gawain betrifft die Übernahme 15 Inventare. Es mussten keine neuen Personen oder Ersatz-IDs angelegt werden.

| Figur | Tiere (Stufe) |
| --- | --- |
| Galahad Draig | Sturmwind, Drake-Pferd (3) |
| Tegan Draig | Alaw, Rhyfel (2); Twm, Brodgi (1) |
| Gwendolyn Draig | Olwen, Rotmilan (1); Alwen, Rotmilan (2); Flam, Ceffyl (3) |
| Maredudd Draig | Cadarn, Ceffyl (3); Hari, Wachhund (3) |
| Tudwal Draig | Ceiniog, Rhyfel (2); Pryderi, Pfau (1) |
| Cadfan Draig | Cíaran, Hund (2); Donn, Tirashan (3) |
| Meurig Draig | Emrys, Ceffyl (1) |
| Heledd (geb. Gwyvern) Draig | Mabli, Skjarn-Katze (2) |
| Einion Draig | Greif, Rhyfel (2) |
| Steffan Draig | Guto, Ponter (3); Uther, Ceffyl (3) |
| Rhiannon Draig | Mél, Rhyfel (2) |
| Mair Draig | Nia, Bugail (2); Tiwlip, Ceffyl (2) |
| Oweta Draig | Heulwen, Rhyfel (2) |
| Guinevere Neidr | Scath, Tryw-Jagdhündin (3); vorhandene Uath (2) |
| Gawain Draig | vorhandener Tanor (1) |

Mabli gehört laut Vorlage Meurigs Frau: Der Stammbaum bestätigt Heledd Gwyvern als seine Ehefrau. Tiwlip gehört heute zu Mair; die Herkunft von ihrer verstorbenen Mutter Rhonwen bleibt im Text erhalten. Pryderi bleibt in Tudwals Obhut im Garten der Draigs; die Geschichte des Verlobungsgeschenks bleibt erhalten. Greif ist ein Pferd namens Greif, Sturmwinds Drake eine Pferderasse aus Baldreska.

Sturmwinds neues Bild wurde unverändert aus `C:\Users\fhg_r\Downloads\Galahads Drake.png` übernommen und liegt unter `public/assets/companions/sturmwind-galahad.png`. Die anderen 21 Bilder stammen aus der Nutzervorlage. Texte wurden inhaltlich erhalten und nur in offensichtlicher Rechtschreibung geglättet.

## Werte und Verknüpfung

Pferde bleiben höchstens Stufe 3, Hunde höchstens Stufe 4, die übrigen neuen Tiere unter Stufe 3. Die bisher auf Stufe 4 geführten Pferde Merfyn und Gaul wurden ebenfalls auf Stufe 3 begrenzt. Ihre bestehenden Trefferpunkte und Ressourcen wurden nicht verändert. Frekis gesondert freigegebenes Wolfsprofil bleibt erhalten.

`catalog/draig-household-companions.js` enthält die individuellen Angaben; `catalog/household-companion-profiles.js` kapselt die Gattungsprofile. Die Trefferpunkte der neuen Tiere werden einmal aus dem gemeinsamen Trefferwürfel-/KON-Modell samt Vitalitätszuschlag berechnet und als Endwert gespeichert. Alte Tiere erhalten geringere Werte. Naturangriffe verwenden die normale Aktionslogik; beschreibende Eigenschaften gewähren keine zusätzlichen Angriffe.

Die gemeinsame Verknüpfung in `creature-companion-link.js` verwendet `creatureId`, `inventoryItemId` und `instanceId`. Sie ergänzt individuelle Inventareinträge und ersetzt ausschließlich unbenutzte Standardkarten. Vorhandene benannte Begleiterkarten, Ausrüstung und Geld bleiben erhalten. Wiederholtes Verknüpfen erzeugt keine weiteren Karten.

## Registerordnung

Die optionale `classification` enthält `genus`, `location` und `house`. Der beschreibende Lebensraum (`habitat`) bleibt unabhängig davon erhalten. Menschen werden als **Menschen → Ort → Haus → Kreatur** angezeigt, Tiere als **Gattung → Ort → Kreatur**. Unbekannte Orte werden ausdrücklich als „Ohne Ortszuordnung“ geführt. Gattungen und Orte sind aufklappbar; Suche berücksichtigt Ort, Haus und Besitzer. Ein Besitzer-Tag öffnet die verknüpfte Figur.

`creature-classification.js` besitzt die reine Gruppierungslogik, `creature-library-view.js` die Darstellung. Die Zuordnung kann im bestehenden Kreatureditor geändert werden und übersteht Import, Export und Duplizieren.

## Sicherung und Prüfung

Die Übernahme schrieb atomar neue Tiere, Besitzerverknüpfungen und Registerzuordnungen mit Aktualisierungszeit-Vorbedingungen. Alte Kampfprofile und vorhandene Inventargegenstände wurden anschließend gegen die Sicherung verglichen. Die Stufenkorrekturen betreffen ausschließlich die Stufe; gespeicherte Kampfbeiträge wurden nicht neu ausgewertet oder verändert.

Portable Kreaturexporte liegen in `Charakter Archiv Exporte/gefaehrten/draig-haushalt-2026-10-11/`. Die 15 Charakterexporte `*-tierbegleiter-2026-10-11.json` enthalten nur bestätigtes Inventar, Identität und Änderungszeit und werden beim regulären Datenbankabgleich als gezielte Overlays verarbeitet. Online-Inventare haben weiterhin Vorrang vor älteren lokalen Snapshots. Technische Firebase-Sicherungen liegen ausschließlich im ignorierten Arbeitsverzeichnis `.codex-temp`.
