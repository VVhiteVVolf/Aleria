# Rhydians Schiffsmannschaft – Vorlage

Das Modul `rhydians-schiffsmannschaft` liegt unter **Gruppen → Klaueninseln → Haus Arth**. Es bereitet auf Nutzerwunsch vom 5. Oktober 2026 eine Kriegskogge mit **60–70 Mann** vor. Schiffsname, Heimathafen, Ausstattung und weitere Personen sind noch nicht festgelegt.

## Aufbau und Besetzung

Vier Inhaltsseiten entsprechen Idwals bestehendem Mannschaftsmodul: Übersicht, Kapitänsbiografie, Hierarchie und Schiff als offene Szenenseite. Die Kommentarseite wird automatisch angehängt. Die Hierarchie verwendet die Register Führung, Kämpfer und Besatzung und enthält sämtliche Rollen aus Idwals am 5. Oktober 2026 gelesener Online-Hierarchie.

| Register | Stellen | Aufteilung |
| --- | ---: | --- |
| Führung | 16 | Kapitän, Erster und Zweiter Maat, Steuermann, Schiffskaplan, Bootsmann, Navigator, Quartiermeister, Waffenmeister, Schiffszimmermann, Feldscher, Schiffsmeier, Schiffsbarde, Ausguck, Segelmeister, Wachmeister |
| Kämpfer | 20 | 4 Ritter, 8 Waffenknechte, 4 Knappen und 4 Pagen zur See |
| Besatzung | 29 | Schreiber/Adjutant, Schiffskoch, Proviantmeister, 4 Seiler/Handwerker, 3 Gehilfen, 4 Altmatrosen, 10 Matrosen und 5 Schiffsjungen |

Die **65 Einzelstellen** sind ein vorläufiger Planungswert innerhalb der gewünschten Stärke. Gegenüber Idwals 54 Stellen kommen vier Waffenknechte und sieben Stellen bei Handwerk und Decksbesatzung hinzu. Größere Gruppen werden auf mehrere Reihen verteilt, damit die bestehenden Grenzen von sechs Karten je Reihe und zwölf Reihen je Register eingehalten werden. `hierarchy.levels` entspricht exakt dem Führungsregister.

Nur zwei Stellen sind benannt:

- **Rhydian Arth**, Kapitän, geboren 1718, Zwillingsbruder Lady Lynne Arths und erster Erbe des Hauses Arth.
- **Gwylim Arth**, Erster Maat, Sohn von Gwrhyr Arth und Findabair Mata.

Die übrigen **63 Stellen** besitzen nur ihren Rollentitel; Name, Porträt und Beschreibung sind leere Felder. Es werden keine zusätzlichen Personen, Klassen, Kampfwerte oder Lebensgeschichten angelegt.

## Vorhandene Personen und Bilder

Identität und Porträts werden aus `Stammbäume/assets/data/published-families/haus-arth.json` übernommen. Rhydian (`rhydian-arth`) und Gwylim (`gwylim-arth`) bestehen bereits; Gwylims Elternverbindung ist dort vorhanden. Der Stammbaum benötigt keine Änderung.

Rhydians vorhandenes Porträt dient als Modulbild und auf den ersten drei Seiten. Gwylims vorhandenes Porträt steht bei seinem Hierarchieposten und seiner Verbindung auf der Kapitänsseite. Die Schiffsseite verwendet vorläufig das bestehende Arth-Wappen, bis ein Schiffsbild ausgearbeitet ist.

Importierbares Paket: [rhydians-schiffsmannschaft-modulpaket-2026-10-05.json](../../../Charakter%20Archiv%20Exporte/Biographien/rhydians-schiffsmannschaft-modulpaket-2026-10-05.json).

## Prüfung und Veröffentlichung

Die vorhandene Modulimport- und Seitenlogik wird wiederverwendet. Im Browser geprüft: alle vier Seiten, drei Hierarchieregister, 65 erhaltene Karten, genau zwei benannte und 63 leere Stellen, Bildverfügbarkeit und Gruppenzuordnung. Bei 390 Pixeln entsteht auf keiner Seite horizontaler Überlauf. `check:templates` besteht für alle 31 Modulvorlagen einschließlich Import-Roundtrip.

Die Veröffentlichung legt das neue Modul an und ergänzt dessen Zuordnung im vorhandenen Arth-Verzeichnis. Gleichzeitig übernimmt Lynnes Modul das ausgewählte Gruppenbild an den drei freigegebenen Stellen. Die Speicherung erfolgt atomar mit Versionsvorbedingungen und lokalem Backup; Idwals Modul bleibt unverändert. Szenendaten, Kommentare, Charakterbögen und Live-Ressourcen werden nicht geschrieben. Die neue Schiffsseite enthält kein festgelegtes Weltdatum.
