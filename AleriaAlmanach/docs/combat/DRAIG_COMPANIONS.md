# Idwals und Anarauts Gefährten

Am 25. September 2026 online angelegt und mit den bestehenden Inventaren verknüpft.

| Besitzer | Gefährte | Art | Stufe | TP | RK | Kreatur-ID |
| --- | --- | --- | --- | --- | --- | --- |
| Idwal Draig | Distry | Rabe | 1 | 5 | 13 | `companion-idwal-distry` |
| Idwal Draig | Drecksack | Equo-Pferd | 2 | 25 | 12 | `companion-idwal-drecksack` |
| Anaraut Draig | Merfyn | Ceffyl-Hengst | 4 | 50 | 13 | `companion-anaraut-merfyn` |
| Anaraut Draig | Gwrgi | Pontar-Wachhund | 3 | 30 | 13 | `companion-anaraut-gwrgi` |

Idwals Charakter-ID bleibt `kJss0DGF1RLuVrrVCBQT`, Anarauts `fq586i4k2gj5Lg30dUwW`. Die vorhandene Schreibweise **Drecksack** bleibt erhalten. Die bestehenden Gefährtenkarten behalten ihre IDs, Beschreibungen, Bilder, Zustandsangaben und Eigenschaften. `creatureId` und `inventoryItemId` verbinden jede Karte mit genau einem Inventareintrag und Kreaturbogen. Die gemeinsame Inventarprojektion verhindert doppelte Karten.

Die ausführlichen Beschreibungen von Distry und Drecksack wurden vollständig als Wesen und Verhalten übernommen. Für Merfyn und Gwrgi lagen nur Kurzangaben und die bisherigen Eigenschaften vor; eine unbekannte Lebensgeschichte wurde nicht ergänzt. Die bisherigen Eigenschaften auf der 1–10-Skala stehen als beschreibende Steckbriefangaben neben den gesondert ausgearbeiteten Kampfwerten.

Die individuellen TP verwenden Trefferwürfel, KON und den gemeinsamen Vitalitätszuschlag von 25 %, aufgerundet: Distry 4 + 1, Drecksack 20 + 5, Merfyn 40 + 10, Gwrgi 24 + 6. Diese Endwerte sind feste Kreaturwerte; bei Importen keinen weiteren Zuschlag anwenden. Rüstungsklassen bleiben aus natürlichem Schutz und GES berechnet. Naturangriffe kosten jeweils eine Aktion. Beschreibende Eigenschaften gewähren keine kostenlosen Angriffe; Reiten verwendet die vorhandene gemeinsame Mechanik.

## Daten und Bearbeitung

- Versionierte Quelle: `modules/creatures/catalog/draig-companions.js`.
- Wiederverwendbare reine Verknüpfung: `modules/creatures/creature-companion-link.js`; sie ändert weder Charakterkampfprofil noch Geld oder vorhandene Gegenstände.
- Portable Kreaturexporte: `Charakter Archiv Exporte/gefaehrten/companion-*.json`.
- Die beiden Charakterexporte `gefaehrten/*-draig-gefaehrten-2026-09-25.json` enthalten ausschließlich ID, Name, bestätigtes Inventar und Änderungszeit. Sie dienen als portable Sicherung. Im laufenden Almanach hat das aktuelle Online-Inventar Vorrang vor dem älteren Charakterdatenbank-Snapshot; keine globale Neudatierung anderer Charakterakten.

Die Online-Übernahme schrieb atomar vier neue Kreaturen und die Inventare zweier bestehender Charaktere. Aktualisierungszeit-Vorbedingungen und geprüfte Kampfsperren schützten gegen gleichzeitige Änderungen. Nach dem Schreiben wurden alle übrigen Charakterfelder mit dem zuvor gesicherten Online-Stand verglichen: unverändert. Kampfbeiträge wurden weder gelesen zur Neubewertung noch verändert. Sicherungen mit technischen Online-Metadaten liegen ausschließlich im ignorierten Arbeitsverzeichnis `.codex-temp`.

## Allgemeine Kreaturbiographie

Der Reiter **Biographie** gilt für alle Kreaturen. Eigene Module unter `modules/creatures/creature-biography-*` trennen Daten, Darstellung und Editor. Der Steckbrief übernimmt Art, Stufe, Größe, Lebensraum und gegebenenfalls den zugeordneten Charakter. Frei bearbeitbar sind Kurzbeschreibung, Erscheinung, Wesen/Verhalten, Herkunft/Geschichte, Bindungen, Lebensweise sowie zusätzliche Steckbriefangaben und Abschnitte. Alle Felder sind optional und auch für Monster, Untote und Geister geeignet.

Die Biographie gehört zum Kreaturschema 5, übersteht Export, Import und Duplizieren und hat eine eigene Speicherrevision. Reine Biographieänderungen schreiben keine Kampfwerte, Beute oder Besitzerinventare mit. Der Editor verwendet Vorschau, delegierte Ereignisse und die vorhandene Schaltfläche „Online speichern“. Das Sammeln angezeigter Kampfwerte darf berechnete RK oder TP nicht unbemerkt in feste Überschreibungen umwandeln.

Prüfung: 34 Modell-, Inventar-, Speicher- und Regressionstests erfolgreich; Produktionsbuild erfolgreich. Zusätzlich lokaler Browsertest mit allen vier Bögen, Live-Vorschau, eigenen Steckbriefzeilen/Abschnitten, Reiterwechsel, wiederholtem Speichern, unverändertem Kampfprofil und Mobilansicht.
