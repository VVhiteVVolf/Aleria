# Integrierte Importquellen

Dieser Ordner entkoppelt das laufende Stammbaum-Register von manuellen Exportordnern.

- `Stammbäume Manuell exportiert/` enthält nur Arbeitsstände und Prototypen.
- Eine geprüfte Vorlage wird einmalig in einen regionsbezogenen Unterordner hier übernommen.
- Die eigentliche Registerfamilie wird anschließend durch ein zuständiges Datenmodul normalisiert und korrigiert.
- Bereits über GitHub veröffentlichte Fassungen werden vor der Übernahme semantisch abgeglichen. Personen und Beziehungen dürfen dabei nicht still überschrieben werden.
- Laufzeitcode darf niemals direkt aus dem manuellen Exportordner importieren.

Die Dateien unter `aeldrunmar/` sind die geprüften Rohquellen für die regulär registrierten Aeldrunmar-Häuser. Online gespeicherte GitHub-Revisionen bleiben davon getrennte Veröffentlichungen.

Die vier schon unter ihren alten Prototyp-IDs veröffentlichten Earltumshäuser wurden mit
`scripts/migrations/2026-08-18-promote-aeldrunmar-earltum-publications.mjs`
auf ihre kanonischen `haus-*`-IDs migriert. Die zuvor veröffentlichte Fassung wird dabei vor dem Umschreiben im jeweiligen Backupordner gesichert; alte geteilte Links bleiben über explizite ID-Aliase funktionsfähig.
