# Dauerhafte Leiden und Rauschmittel

Das Feature trennt dauerhafte Merkmale, stoffabhängige Entzugsabzüge und
zeitgebundene Szenenzustände. Vollständiger Regel- und Umsetzungsplan:
[Leiden, Arkanistenfieber und Rauschmittel](../../docs/health/HEALTH_AND_SUBSTANCES_2026-11-02.md).

- `health-trait-catalog.js`: 30 dauerhafte Leiden, zehn Fieberoptionen,
  neun Abhängigkeitsstufen und drei Toleranzen.
- `health-trait-policy.js`: stärkste Ausprägung, gezielte Unterdrückung von
  Entzug und ausdrücklich benötigte Sinne beziehungsweise Hände.
- `substance-profiles.js`: tatsächliche Rauschboni und Nachteile, Stoffschema.
- `substance-item-catalog.js`: generierte Zuordnung veröffentlichter Items
  einschließlich Inhalt, Stärke und begründeter Spielvorgaben.
- `substance-item-effects.js`: ausschließlich feste Definitionen und bekannte
  Quellkennungen; keine aus frei geänderten Namen erfundenen Wirkungen.
- `substance-state.js`: Belastung, Rausch, Kater und idempotente Übergänge.
- `substance-preview.js`: dieselbe Wirkung im lokalen Beitragsentwurf.
- `health-development-ui.js`: Erklärungen und Filter beider Assistenten.
- `health-trait-icons.js`: eigene neue Comicicons dieses Auftrags.

Die gemeinsame Szenenuhr liegt in `scene-time/scene-condition-clock.js`.
Sie verwendet vertrauenswürdige Szenenanker und Abschnittsdauern. Sie verändert
weder den Playbeginn noch bestehende Erholungsschlüssel. Zeitgebundene
Zustände haben `durationModel.kind = "scene-time"`; eine Rast entfernt sie
nicht pauschal. Das Szenen-Replay arbeitet Zeitsprünge einschließlich des
gesamten Katers ab, ohne historische Inventarvorgänge neu auszuwerten.

Neue Rauschmittel im Item-Builder mit `useDefinition.substance` ausarbeiten.
Bei Alkohol Inhalt in ml und Alkoholgehalt speichern, bei Drogen die Zahl
der Wirkdosen je ganzem Exemplar. Toleranz, Rausch und Entzug werden getrennt
geführt. Heilung und Rast entfernen keine dauerhaften Leiden oder Abhängigkeiten.
Es findet keine automatische Diagnose bestehender Figuren statt.

Prüfungen:

```
npm run test:health
npm run test:development
node tests/health-substances.browser.mjs
```

Der zusätzliche lokale Firestore-Test
`firebase/functions/tests/integration/health-substances.integration.mjs`
benötigt ausschließlich das dort fest gesperrte Demo-Projekt auf 127.0.0.1:8182.
Serverkopien vor Tests einmal synchronisieren; der Synchronisationsbefehl
erzeugt das Zielverzeichnis neu und darf nicht parallel zu Tests laufen.
Ein Argument `--check` macht dieses ältere Synchronisationsskript nicht schreibfrei.
