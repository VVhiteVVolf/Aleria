# Netzwerk-Template

Eigenständige, wiederverwendbare Vorlage für Organisationen mit mehreren Häusern oder Wirkungsorten. Keine Abhängigkeit von Zeitungsgilden oder deren Daten.

- `organization-network-data.js`: normalisiert `page.organizationNetwork`; erhält bewusst geleerte Felder und Standortlisten.
- `organization-network-renderer.js`: Leseseite mit Einleitung, Wirkungsgebiet, Zusammenarbeit, Einordnung und Standortkarten. Standortfilter arbeiten ausschließlich im jeweiligen Seiten-DOM, auch bei mehreren Vorschauen.
- `organization-network-editor.js`: gemeinsame Felder für beide Editoren. Standortzeilen verwenden den vorhandenen Row-Schema- und Icon-Wähler; keine zusätzliche Picker-Verwaltung.
- `organization-network.css`: lokale Darstellung mit gemeinsamen Modulfarben und responsiven Containergrenzen.

Der Typ ist als `organization-network` mit dem Marker `organizationNetworkPage` in der zentralen Template-Registry registriert. JSON-Import, Seitenwechsel, Vorschau und Speicherung folgen dem bestehenden Modulsystem. Der Renderer verwendet die gemeinsamen Sicherheitsfunktionen für Texte, Bilder und Links sowie die bestehende Seitenkommentarfunktion.

Ein Standort enthält `name`, `region`, `kind`, `image`, `description`, `href` und `publicationHref`. Unbekannte Standortarten werden als `branch` übernommen. Leere Zeilen ohne Name und Beschreibung entfallen. Orts- und Publikationslinks sind optional; fehlende Links erzeugen keine Schaltflächen.

Der gemeinsame Schema-Icon-Wähler adressiert sein eigenes Feld über `data-role="schema-icon-field"`. Dadurch funktioniert er unabhängig von den CSS-Klassen einer konkreten Vorlage.
