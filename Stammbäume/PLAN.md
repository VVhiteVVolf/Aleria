# Neuaufbau der Aleria-Stammbäume

## Ausgangslage

Die bisherige Referenz `Animexx Seiten - Temporär/Stammbaum.html` bündelt auf rund 90 KB Markup, Gestaltung, Datenhaltung, Generator, Editor, Import/Export und ein eigenes Baum-Layout in einer Datei. Sie enthält nützliche Produktideen, verletzt aber die langfristigen Projektregeln durch globalen State, Inline-Handler, direkte DOM-Manipulation, redundante Beziehungsfelder und eine enge Kopplung von Datenmodell und Rendering.

Die Referenz bleibt unverändert. Die neue Anwendung entsteht eigenständig in `Stammbäume/`.

## Fachliche Leitentscheidung

Der Aleria-Datensatz ist die Quelle der Wahrheit. Family Chart 0.9.0 wird ausschließlich als austauschbare Darstellungs-Engine hinter einem Adapter verwendet.

`index.html` besitzt die Verantwortung einer Werkstatt und Navigation. Eine geladene Familie ist die aktuell geöffnete Akte, nicht die Identität der Seite selbst.

```text
UI / Workbench
    ↓ Events
Family Store
    ↓
Genealogy Graph + Validation
    ↓
Family Chart Adapter
    ↓
Family Chart 0.9.0 + D3 7.9.0
```

Personen speichern keine abgeleiteten Felder wie `uncle`, `grandmother` oder `cousin`. Solche Aussagen entstehen immer durch Traversierung von Partnerschaften und Abstammungsgruppen.

## Datenmodell

- `persons`: Identität, Lebensdaten, Portrait, Titel, Haus und Darstellungsrolle.
- `partnerships`: Beteiligte, Art und Status einer Verbindung.
- `parentages`: Kind, Eltern, Abstammungsart, Legitimität, Gewissheit und Sichtbarkeit.
- `houses`: Häuser/Dynastien mit Wappen, Motto und optionaler Akzentfarbe.
- `lineage`: Gründerpaar, Stammwappen und optionaler Zeitsprung in der Überlieferung.
- `cadetBranches`: Wappen-Knoten unter einem Paar mit Verweis auf eine eigene Familienakte.
- `timeJumps`: frei platzierbare Überlieferungslücken zwischen einem Paar und später belegten Nachkommen.
- `presentation`: konfigurierbare Farben der Partnerschafts- und Abstammungslinien.
- `document`: Titel, Hauswort und Metadaten des konkreten Stammbaums.
- `view`: Fokusperson und Ausrichtung; keine fachlichen Beziehungen.

Mehrere Partnerschaften, Adoption, Pflege, magische oder umstrittene Abstammung werden als eigenständige Records abgebildet. Alternative Abstammungen bleiben im Domänenmodell erhalten, auch wenn Family Chart für das Layout nur eine Elternkonstellation darstellen kann.

## Verbindliches Farbsystem

Das Farbsystem der alten Seite wird als semantische Darstellungsrolle erhalten:

| Rolle | Farbe | Bedeutung |
| --- | --- | --- |
| `core` | Rot | Kern- und Blutlinie |
| `married` | Grün | Eingeheiratete Person |
| `bastard` | Grau | Uneheliche/legitimierte Nebenlinie |
| `affair` | Violett | Affären- oder geheime Verbindung |
| `forced` | Beige | Erzwungene/politisch belastete Verbindung |
| `ward` | Blau | Als Mündel in das Haus aufgenommen |
| `ward-away` | Hellblau | Als Mündel an ein anderes Haus fortgegeben |
| `adopted` | Orange | Rechtlich oder familiär in die Linie aufgenommen |

Die Rolle beeinflusst die Personenkarte. Abstammungsart und Legitimität bleiben getrennte fachliche Eigenschaften und werden nicht aus einer Farbe zurückgerechnet.

## Modulaufteilung

```text
Stammbäume/
├── index.html
├── register.html             verschachteltes Familienregister
├── assets/
│   ├── css/                 Grundlayout, Komponenten, Chart-Theme, Responsive
│   ├── images/              lokale Wappen, Fassungen und mitausgelieferte Silhouetten
│   └── js/
│       ├── adapters/        einzige Family-Chart-Abhängigkeit
│       ├── config/          Farbsystem und Labels
│       ├── data/            Beispieldatensätze und zentrale Familien-Registry
│       ├── domain/          Schema, Normalisierung, Validierung, Graph
│       ├── services/        Persistenz, Familienbibliothek, PNG- und JSON-Transfer
│       ├── state/           gekapselter Store mit Undo/Redo
│       └── ui/              Controller und kleine UI-Renderer/Dialoge
├── tests/                   ausführbare Modultests
└── vendor/                  fest versionierte MIT-Abhängigkeiten
```

## Umsetzungsschritte

1. Referenz analysieren und Migrationsgrenze festlegen.
2. Domänenschema und Normalisierung implementieren.
3. Graph-Service für dynamische Beziehungen und Suche implementieren.
4. Store mit Historie, Auswahl, Mutation und Validierung aufbauen.
5. Legacy-Import für `{ persons, couples }` und versionierten JSON-Export ergänzen.
6. Family-Chart-Adapter mit Diagnosen, Portraitkarten, Fokus und Ausrichtung integrieren.
7. Workbench mit Event Delegation, Inspector, Suche und Dialogen aufbauen.
8. Gründerwappen, Zeitsprung und verlinkte Kadettenhäuser als virtuelle Chart-Knoten ergänzen.
9. Familienregister mit verschachtelten Pfaden und adressierbaren Familien-URLs aufbauen.
10. Hochauflösenden PNG-Export lokal integrieren.
11. Unit-Tests, statische Prüfungen und Browserprüfung durchführen.
12. Atomaren Arbeitsgang für neue Person plus Partnerschaft/Abstammung ergänzen.
13. Stabile Gesamtansicht, expliziten Personenfokus und leeren Neustart bereitstellen.
14. Gegenwartsjahr 1740 und frei platzierbare Haus-/Zeitsprungknoten verankern.
15. Gründungsassistent für neue unabhängige Familien mit Ehepaar, Hauswappen und optionalem erstem Kind ergänzen.
16. Verlinkte Hausknoten als kompakte Siegel statt als breite Personenkarte darstellen.
17. Stammwappenknoten mit editierbarer Untertitelbox und direkter Nachkommenanlage ausstatten.
18. Die gelieferten Personen-, Wappen- und Zeitfassungen als gekapseltes Ebenensystem integrieren; Gold als Standard der gespeicherten Wappenrahmen festlegen.
19. Abweichende Wappenpositionen je Personenfassung kalibrieren, Zeitrahmen auf Von-/Bis-Jahre umstellen und Haus Arwydd als vollständige Registerfamilie erfassen.
20. Wappen und Fassungen unabhängig skalierbar machen, verlinkte Hausknoten zwischen den Generationen positionieren und die Registry um die leeren Gwynthor-Häuser ergänzen.
21. Firebase-Plattform, Repository-Grenze, Auth-Status und lokalen Rückfallpfad einführen.
22. Private Arbeitsfassungen in entitätsbezogene Subcollections zerlegen und revisionsgebundene Konflikterkennung ergänzen.
23. Rollenregeln, Emulator-Tests, öffentliche Releases, Registry-Synchronisierung und funktionsvermittelte Bild-Assets bereitstellen.
24. Wiederholbare Dry-Run-Migration für Haus Arwydd und die vier Gwynthor-Häuser vorbereiten.
25. Die Werkzeuge mit lokalen Aleria-Icons ausstatten, vorhandene Arwydd-Nebenwappen zuordnen und Generationsteilungen über einen gekapselten SVG-Linienrouter entzerren.

## Bewusst nicht Teil dieses ersten Fundaments

- Automatische Erbfolgeberechnung: Dafür fehlen noch projektspezifische Regeln.
- Automatischer Stammbaumgenerator: Das Datenmodell ist vorbereitet; Regeln für Struktur, Größe und Zufallsverteilung werden später separat definiert.
- Vollständiger Kinship-Text für beliebig entfernte Verwandtschaft: Der Graph stellt bereits die erforderlichen Traversierungsprimitiven bereit.
- Produktionsaktivierung von Firebase: Code, Rules, Functions und Migration sind vorbereitet; Datenbankregion, Firebase-Login, Auth-Benutzer, Staging-Projekt, App Check und Backup-Richtlinien benötigen noch die externen Projektentscheidungen.
