# Belohnungen auf Aushängen

`notice-rewards-model.mjs` validiert drei Arten im Feld `notice.rewards`:

- `money`: `currency` (`gold`, `silver`, `copper`, `pfennig`) und positiver `amount`.
- `item`: Güterregister-`itemId`, positive ganzzahlige `quantity` und ein dauerhaft gespeicherter Anzeigesnapshot (`title`, `image`, `description`, `details`).
- `honor`: stabile `id`, nichtleerer `title`, `image`, optionale `description`. Für Ritterschlag, Privileg oder andere nichtmaterielle Zusagen; ohne Gegenstandsmenge.

Alle Arten erlauben eine lesbare `condition`. Eine einzelne Geldbelohnung
erscheint direkt mit Münzicon. Andere Zusammenstellungen öffnen die gemeinsame
Belohnungsübersicht; die kompakte Schaltfläche zeigt ausschließlich das bestehende
Geldbeutel-Icon. Anzahl, Namen und Bilder der Belohnungen werden erst im Dialog
sichtbar. Dieselbe Darstellung gilt für Infotabellen, Fußzeilen und Vorschauen.

`notice-rewards.js` besitzt Darstellung, Editor und Dialog. Delegierte Aktionen
laufen über `core/tafel-actions.js`. Bilder werden mit dem gemeinsamen
Medienmodell geprüft und gerendert. Keine Belohnung erzeugt automatisch
Inventargegenstände, Geldtransfers, Rangwechsel oder Fähigkeiten.
