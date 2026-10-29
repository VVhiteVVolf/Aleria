# Gemeinsamer Kontinentatlas

Der neue Atlasentwurf vom 29. Oktober 2026 gilt ausschließlich für das
Kontinentregister sowie Estryll, Lothir und Aldervan. Länder-, Herrschafts-,
Orts- und Hausseiten verwenden weiterhin ihre eigenen Oberflächen.

Alle vier Übersichten teilen sich den Dokumentkopf, die Kontinentnavigation,
Schrift, Papierfläche, Lesebreite und den Abschluss. Detailübersichten verwenden
denselben Titel-/Bannerkopf und dieselbe Kapitelnavigation. Länderwappen haben
gleiche Flächen; frühere Sondergrößen für große Reiche und hervorgehobene
Einträge entfallen. Bei 1440 Pixeln sind Länderwappen 88 Pixel breit und die
Karten mindestens 176 Pixel hoch. Tablet- und Mobilregeln gelten gemeinsam.

- `page-shell.mjs`: reine Vorlage zur Buildzeit, keine Laufzeit-DOM-Verwaltung.
- `continents.source.json`: acht Kontinente, vorhandene Ziele und stabile Bildkeys.
- `estryll-body.source.html`: bestehende Estryll-Kapitel und Länderinhalte.
- `estryll-image-keys.source.json`: unveränderte ursprüngliche Bildreihenfolge.
- `atlas-foundation.css`: Farben, Papier und grundlegende Lesbarkeit.
- `atlas-navigation.css`: Kopf, Kontinentwahl und Kapitel.
- `atlas-cards.css`: gemeinsame Kontinent- und Länderkarten.

Lothir und Aldervan beziehen ihre Länderauswahl weiterhin aus den bestätigten
Länderquellen. `shared/accepted-realms/scripts/atlas-pages.mjs` verwendet dafür
dieselbe Schale. Die Kurzbeschreibungen auf den Karten ersetzen keine Ländertexte.
Fehlende Landeszeichen erhalten einen gekennzeichneten Platzhalter.

```text
node Kontinente/scripts/build-continent-overviews.mjs
node Kontinente/scripts/build-continent-overviews.mjs --check
node --test --experimental-test-isolation=none Kontinente/tests/continent-overviews.test.mjs Kontinente/tests/estryll-navigation.test.mjs
```

Die vorhandenen Estryll-Bildkeys, Kapitelanker, verlinkten Banner und ihre
Bildreihenfolge bleiben erhalten. Neue Kontinente werden erst verlinkt, sobald
ihre tatsächliche Übersichtsseite vorhanden ist. Der Releaseprüfplan prüft die
erzeugten Übersichten zusammen mit den übrigen Kontinentinhalten.
