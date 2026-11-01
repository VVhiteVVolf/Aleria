# Quests & Abenteuer

Die Seite `../../quests.html` und dieses Feature besitzen den zentralen
Questvertrag. Ausführlicher Stand, Schnittstellen, Rechte, Probe und Releasefolge:
[QUEST_SYSTEM_2026-11-01.md](../../docs/quests/QUEST_SYSTEM_2026-11-01.md).
Die erste bebilderte Quest, Reisevermessung, Szenenstandorte und das Gruppenkonto:
[TROETZLI_QUEST_2026-11-01.md](../../docs/quests/TROETZLI_QUEST_2026-11-01.md).

- `quest-model.js`: reiner, gemeinsam mit den Functions verwendeter Vertrag.
- `quest-sources.js` / `quest-catalog.json`: Projektion öffentlicher Quellen.
- `quest-board-availability.js`: datierte Sichtbarkeit der Tafelaushänge, aus der vorhandenen Tafelarchiv- und Kalenderlogik.
- `quest-firebase.js` / `quest-client.js`: gekapselte Firebase-Schnittstelle.
- `quest-store.js`: lokaler State, Quellenabgleich und Seitencursor.
- `quest-controller.js`: Seiten- und Dialoglebenszyklus, delegierte Aktionen.
- `quest-view.js`, `quest-forms.js`, `quest-reward-editor.js`: Darstellung und Eingabe.
- `quest-journal.js`: bestehende Mechanikbelege projizieren, keine Neuauflösung.
- `quest-context-bridge.js`: Rückwege und Deep Links für gemeinsame Karten/Tafeln.
- `quest-backup-client.js`: Abschnitt der vollständigen Almanachsicherung.
- `quest-dossier-model.js`, `quest-authored-dossiers.js`: optionale redaktionelle Vorbereitung.
- `quest-dossier-view.js`, `quest-book.css`, `quest-story.css`: bebildertes Abenteuerbuch.
- `quest-scene-tracker.js`: gekapselte Standortpflege innerhalb verknüpfter Szenen.
- `quest-route-map.js`: explizite Reisevorschau ohne automatische Veröffentlichung.

Die allgemeine Landingpage-Anbindung liegt unter `../landing/landing-quest-*`.
Servervorgänge liegen unter `firebase/functions/src/quests`. Kein UI-Bereich
schreibt direkt in Quest-, Inventar-, Geld- oder Kampfdokumente.

Katalog erzeugen: `npm run build:quests`. Prüfen: `npm run check:quests` und
`npm run test:quests`. Nach Änderungen am reinen Vertrag den bestehenden
Functions-Mechaniksync ausführen. Weder Tests noch Kataloggenerator benötigen
Produktionszugang oder private Charakterdossiers.

## Datierte Aushänge

Der Quellenkatalog bewahrt das Erscheinungsdatum und die Archivintervalle jedes
öffentlichen Blatts. Er legt keinen heutigen Abschlussstatus zur Bauzeit fest.
Katalog und Online-Tafelabgleich spielen redaktionelle Archivvorlagen durch
denselben reinen Tafelarchiv-Abgleich ein; spätere Rückholungen, Änderungen und
bewusste Löschungen bleiben erhalten.

Die Auswahl „Der nächste Aufbruch“ und ihr Startknopf folgen dem gemeinsamen
Weltdatum (`almanach_settings/current-date`). Vor dem Erscheinen und während
eines Archivintervalls wird ein Aushang dort nicht als neuer Auftrag angeboten.
Seine Akte bleibt über bestehende Verweise lesbar; die Landingpage kennzeichnet
abgelegte oder noch nicht ausgehängte Quellen. Nach einer Rückholung ist der
Auftrag ab dem Rückholdatum wieder verfügbar. Manuelle und modulgebundene
Quests sowie bereits laufende oder abgeschlossene Gruppendurchläufe werden
davon nicht umgeschrieben. Dies ist eine Angebotsprojektion, keine zusätzliche
serverseitige Beitrags- oder Queststart-Sperre.

## Begrenzte Kontextansichten

Landingpages und Szenentracker lesen eigene Vorschaufenster je verknüpftem
Modul, Szenenthread oder Teilnehmer-Batch: bis zu 50 aktive Durchläufe nach
`updatedAt` und unabhängig davon bis zu 50 abgeschlossene/abgebrochene nach
`endedKey`, jeweils absteigend. Ein großes Archiv verdrängt damit keine aktive
Quest. Die Landingpage zeigt daraus höchstens zwölf Karten je Reiter; ihre
Chronik sortiert nach dem Aleria-Abschlussdatum. Eine spätere Auszahlung ändert
diese Reihenfolge nicht. Weitere Einträge bleiben über die vorhandene
Seitennavigation im vollständigen Abenteuerjournal erreichbar.

Ein Kontext berücksichtigt höchstens zwölf unterschiedliche Szenenthreads und
180 unterschiedliche Teilnehmerschlüssel. Die Schlüssel werden in 15er-Batches
abgefragt: Die beiden Archivstatus ergeben damit höchstens 30 Disjunktionen
zusammen mit `array-contains-any`, entsprechend den
[Firestore-Abfragegrenzen](https://firebase.google.com/docs/firestore/query-data/queries#query_limitations).
Treffer aus mehreren Kontexten werden nach Kennung zusammengeführt; die
Gesamtmenge kann deshalb größer als ein einzelnes 50er-Fenster sein. Ausdrücklich
eingetragene Quest- und Durchlaufkennungen werden zusätzlich direkt gelesen
(Konfiguration jeweils auf 40 begrenzt). Die Modulprojektion von Questakten bleibt
auf 50 Treffer begrenzt. Diese Kontextansichten ersetzen keine vollständige
Registerzählung oder eigene Archivpagination.

Die sechs kombinierten Indizes für `quest_runs` aus
`firebase/firestore.indexes.json` (Module/Szenen/Teilnehmer × aktiv/Archiv) müssen
vor beziehungsweise mit der Oberfläche bereitgestellt und fertig aufgebaut
sein. Die lokale Regression prüft ihre Abdeckung, ersetzt aber keinen
Produktiv-Indexaufbau. Es wurde hier kein Index deployt.
