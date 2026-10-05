# Rhydians Schiffsmannschaft – Vorlage

Das Modul `rhydians-schiffsmannschaft` liegt unter **Gruppen → Klaueninseln → Haus Arth**. Es bereitet auf Nutzerwunsch vom 5. Oktober 2026 eine Kriegskogge mit **60–70 Mann** vor. Schiffsname, Heimathafen, Ausstattung und weitere Personen sind noch nicht festgelegt.

## Aufbau und Besetzung

Vier Inhaltsseiten entsprechen Idwals bestehendem Mannschaftsmodul: Übersicht, Kapitänsbiografie, Hierarchie und Schiff als offene Szenenseite. Die Kommentarseite wird automatisch angehängt. Die Hierarchie verwendet die Register Führung, Kämpfer und Besatzung und enthält sämtliche Rollen aus Idwals am 5. Oktober 2026 gelesener Online-Hierarchie.

| Register | Stellen | Aufteilung |
| --- | ---: | --- |
| Führung | 16 | Kapitän, Erster und Zweiter Maat, Steuermann, Schiffskaplan, Bootsmann, Navigator, Quartiermeister, Waffenmeister, Schiffszimmermann, Feldscher, Schiffsmeier, Schiffsbarde, Ausguck, Segelmeister, Wachmeister |
| Kämpfer | 21 | 5 Ritter, 8 Waffenknechte, 4 Knappen und 4 Pagen zur See |
| Besatzung | 29 | Schreiber/Adjutant, Schiffskoch, Proviantmeister, 4 Seiler/Handwerker, 3 Gehilfen, 4 Altmatrosen, 10 Matrosen und 5 Schiffsjungen |

Die **66 Einzelstellen** sind ein vorläufiger Planungswert innerhalb der gewünschten Stärke. Gegenüber Idwals 54 Stellen kommen ein Ritter, vier Waffenknechte und sieben Stellen bei Handwerk und Decksbesatzung hinzu. Die anfängliche Vorlage mit 65 Stellen wurde für die fünf vom Nutzer benannten Ritter um eine Ritterstelle erweitert. Größere Gruppen werden auf mehrere Reihen verteilt, damit die bestehenden Grenzen von sechs Karten je Reihe und zwölf Reihen je Register eingehalten werden. `hierarchy.levels` entspricht exakt dem Führungsregister.

Acht Stellen sind benannt:

- **Rhydian Arth**, Kapitän, geboren 1718, Zwillingsbruder Lady Lynne Arths und erster Erbe des Hauses Arth.
- **Ianto Pawen (1717)**, Erster Maat.
- **Gwylim Arth**, Zweiter Maat, Sohn von Gwrhyr Arth und Findabair Mata. Auf Nutzerwunsch vom Ersten auf den Zweiten Maat verschoben.
- **Llew Dyfrgi (1722)**, Ritter zur See.
- **Unig Unigol (1718)**, Ritter zur See.
- **Padrig Eirth (1722)**, Ritter zur See.
- **Barry Dianc (1722)**, Ritter zur See.
- **Clinoch Cwingod (1722)**, Ritter zur See.

Die übrigen **58 Stellen** besitzen nur ihren Rollentitel; Name, Porträt und Beschreibung sind leere Felder. Es werden keine zusätzlichen Stammbaumpersonen, Klassen, Kampfwerte oder Lebensgeschichten angelegt. Die Schreibweise aller Namen und die Geburtsjahre folgen der Nutzervorgabe; unbekannte Sterbejahre werden nicht als Todesfälle interpretiert.

## Vorhandene Personen und Bilder

Identität und Porträts werden aus `Stammbäume/assets/data/published-families/haus-arth.json` übernommen. Rhydian (`rhydian-arth`) und Gwylim (`gwylim-arth`) bestehen bereits; Gwylims Elternverbindung ist dort vorhanden. Der Stammbaum benötigt keine Änderung.

Rhydians vorhandenes Porträt dient als Modulbild und auf den ersten drei Seiten. Gwylims und Iantos vorhandene Porträts stehen bei ihren Hierarchieposten und ihren Verbindungen auf der Kapitänsseite. Die Schiffsseite verwendet vorläufig das bestehende Arth-Wappen, bis ein Schiffsbild ausgearbeitet ist.

Die fünf weiteren belegten Personen und ihre Geburtsjahre sind mit dem bestehenden Familienregister abgeglichen. Ihre vorhandenen Porträts werden direkt wiederverwendet:

| Person | Bestehende Familienakte | Personen-ID |
| --- | --- | --- |
| Llew Dyfrgi | `haus-dyfrgi-caer-cryftlawd` | `llew-dyfrgi` |
| Unig Unigol | `haus-unigol` | `unig-unigol` |
| Padrig Eirth | `haus-eirth` | `padrig-eirth` |
| Ianto Pawen | `haus-pawen` | `ianto-pawen` |
| Barry Dianc | `haus-dianc-aberdail` | `barry-dianc` |

**Clinoch Cwingod** ist im geprüften lokalen Bestand und in den 44 zum Abgleich gelesenen Online-Almanachmodulen nicht belegt. Sein Name und Geburtsjahr werden unverändert nach Nutzervorgabe geführt; das Porträtfeld bleibt leer. Die in anderen Hausquellen verwendete Schreibweise Cwningod führt hier zu keiner stillen Umbenennung. Der ältere Clinoch Crafanc (1637–1698) ist eine andere Person und wird nicht übernommen. Clinochs Abstammung wird nicht erfunden.

Importierbares Paket: [rhydians-schiffsmannschaft-modulpaket-2026-10-05.json](../../../Charakter%20Archiv%20Exporte/Biographien/rhydians-schiffsmannschaft-modulpaket-2026-10-05.json).

## Prüfung und Veröffentlichung

Die vorhandene Modulimport- und Seitenlogik wird wiederverwendet. Im Browser geprüft: alle vier Seiten, drei Hierarchieregister, 66 erhaltene Karten, genau acht benannte und 58 leere Stellen, die Rollenverteilung der Maate, fünf Ritter, Bildverfügbarkeit und Gruppenzuordnung. Bei 390 Pixeln entsteht auf keiner Seite horizontaler Überlauf. Die bestehende `check:templates`-Prüfung der Erstvorlage bestand für alle 31 Modulvorlagen einschließlich Import-Roundtrip; die Besetzung verändert ausschließlich Moduldaten.

Die Erstveröffentlichung legte das neue Modul samt Zuordnung im Arth-Verzeichnis an und übernahm Lynnes ausgewähltes Gruppenbild. Die anschließende Besetzung aktualisiert ausschließlich Rhydians Modul und die Verzeichniszeit. Die Speicherung erfolgt atomar mit Versionsvorbedingungen und lokalem Backup; Lynnes und Idwals Module bleiben dabei unverändert. Szenendaten, Kommentare, Charakterbögen und Live-Ressourcen werden nicht geschrieben. Die Schiffsseite enthält kein festgelegtes Weltdatum.
