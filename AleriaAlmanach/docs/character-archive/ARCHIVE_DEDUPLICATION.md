# Eindeutige Archivvorlagen

Das Archiv liest Regelkataloge, öffentliche Figuren, Warenregister und gespeicherte Fassungen. Diese Quellen sind keine unabhängigen Vorlagen nur deshalb, weil ihre Kopien unterschiedliche IDs tragen.

## Drei getrennte Identitäten

- **Gespeicherter Datensatz:** Die tatsächliche Dokument-ID bezeichnet einen veränderbaren Snapshot. Ein Update ersetzt diesen Snapshot; ein neuerer lokaler Entwurf übersteht einen älteren Remote-Snapshot.
- **Regelvorlage:** `character-archive-entry-equivalence.js` vergleicht normalisierte Regeln und Beschreibung. Transport-IDs, Provenienz, verbrauchte Nutzungen und aktive Zustände erzeugen keine neue Vorlage. Formen, Editionen, persönliche Bindungen und unbekannte Regeln bleiben relevant.
- **Darstellung:** `character-archive-view-projection.js` vergibt bei historischen ID-Kollisionen getrennte Aktionskennungen. Gleichnamige echte Fassungen sind aufklappbar; Speicherung verwendet weiterhin die ursprüngliche Dokument-ID.

## Quellen und Varianten

Identische Vorlagen sammeln ihre Quellen. Eine manuelle Bildwahl bleibt erhalten. Eine minimale Referenz darf keine manuelle Variante oder die persönliche Fähigkeit eines anderen Besitzers übernehmen. Mehrdeutige Referenzen werden nicht aufgefüllt.

Die Registerprojektion bündelt nur belegte, unveränderte Definitionen derselben Revision. Preise, Bestand, Besitz und Originalkennungen bleiben in den zugrunde liegenden Zeilen erhalten. Standardwaffen teilen sich mit ihrer passenden Registervorlage eine Karte; Picker bekommen den passenden ursprünglichen Datenvertrag.

Normales Speichern einer Figur erzeugt keine zusätzlichen Archivdokumente. Explizites Archivieren bleibt möglich. Bestehende Daten werden durch die Ansicht weder gelöscht noch in Charakterbögen zurückgeschrieben. Eigene Zauberbilder ändern keine Katalogbindung und keine höheren Zauberformen; eine echte Regeländerung wird als eigene Fassung abgetrennt.

Bekannte Fertigkeiten erscheinen als neutrale Regeldefinitionen. Persönliche Ausbildungsboni und automatisch übernommene Trainingsnotizen gehören zum jeweiligen Bogen; die Archivprojektion ändert diesen Bogen nicht. Ausdrückliche eigene Regeln bleiben gesonderte Fassungen.

## Prüfung

Die Fachprüfung `character-reference-catalogs` enthält die Archivregressionen für Alt-Kopien, Formen, Besitzer, Kosten, Bilder, Snapshotupdates, Pferde und beide Waffen-Picker. Die unveränderliche Release-Momentaufnahme wird anschließend über den bestehenden lokalen Releaseweg veröffentlicht.
