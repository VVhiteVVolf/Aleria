# Szenenwechsel

`scene-transition-state.js` normalisiert gespeicherte Ereignisse und stellt den
Szenenkatalog bereit. Der Katalog verwendet `getValidSections()`, die aktuellen
Modulfassungen und das gemeinsame Kommentarrouting. Nur tatsächlich interaktive
Szenen sind Ziele; bestehende Threadkennungen bleiben erhalten. Bereich, Modul
und Seite sind reine Navigationsmetadaten und werden nicht in Belege kopiert.

`scene-transition-target-picker.js` projiziert diesen Katalog auf dasselbe
`buildArchiveHierarchyModel()` wie der Almanach. Damit folgen auch Wohntrakte,
Flügel und Gemächer automatisch Verschiebungen oder Umbenennungen. Ordner lassen
sich per Tastatur aufklappen. Die Suche berücksichtigt sämtliche Pfadteile,
Modul- und Szenennamen; nach dem Leeren stellt sie die vorherige Ordneransicht
wieder her. Der ausgewählte Thread steht ausschließlich im Dialogfeld; es gibt
keinen zusätzlichen globalen Auswahlzustand.

`scene-transition-ui.js` rendert Ereigniskarte und Dialog;
`scene-transition-events.js` besitzt die delegierten Dialogaktionen, Vorschau
und Speicherung. Reiseart und Figuren sind kompakt aufklappbar. Die Speicherung
erhält den bestehenden gemeinsamen Vorgang für Quell- und Zielszene.

`styles/scene-transition.css` kapselt beide Darstellungen. Ereigniskarten sind
nicht schrumpfende Flexelemente: `.comments-scroll` ist eine Flexspalte und
`.comment-unit` verwendet `display: contents`. Ohne `flex: 0 0 auto` kann eine
volle Kommentarseite die Karte bei `overflow: hidden` bis auf ihre Rahmenlinie
zusammendrücken, obwohl Text und Verknüpfungen vorhanden sind.

Gezielte Prüfungen vom Repositorywurzelverzeichnis:

```text
node --test --experimental-test-isolation=none AleriaAlmanach/tests/scene-transition-rendering.test.mjs AleriaAlmanach/tests/scene-transition-target-picker.test.mjs
node AleriaAlmanach/tests/scene-transition-layout.browser.mjs
node AleriaAlmanach/tests/scene-transition-picker.browser.mjs
```

Die Browserprüfungen verwenden lokale Testdaten, vorhandenes Chrome und die
vorhandene Playwright-Installation der Stammbäume. Externe Netzwerkzugriffe
sind gesperrt; produktive Szenen werden nicht verändert. Prüfbelege liegen
unter `diagnostics/scene-transition-20261104/`.
