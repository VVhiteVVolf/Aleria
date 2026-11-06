# Familie Pert

`haus.content.mjs` ist die gemeinsame redaktionelle Quelle für die ausführliche
Hausseite und die kurze Stammbaum-Hausbio. Der gelieferte HTML-Text und die
vollständige Familienakte bleiben in `animexx-original.html` und
`pert-original.json` bytegleich erhalten. Herkunft, Hashes, Quellenabdeckung
und Entscheidungen stehen in `source-manifest.json`.

Die Seite stellt den Burgzweig auf Castell Draig und den landwirtschaftlichen
Zweig auf Hof Maesglas gemeinsam dar. Alle 17 benannten Angehörigen sind mit
ihren gelieferten Portraits und echten Personenlinks eingebunden. Zwei unbekannte
Gründer bleiben ausschließlich Platzhalter im Stammbaum. Die Überlieferungslücke,
Goronvy/Goronwy, Rhiains belegte Geschlechtsergänzung und Roísins einzelne
Elternzuordnung sind dokumentiert. Die vorhandene ältere Kevan-Charakterakte wird
nicht durch den Quellenimport verändert.

Die neue Bauerndarstellung zeigt Geraint nach seinem gelieferten Portrait.
Der kompakte eingebettete Stammbaum und die bestehende mobile Stapeldarstellung
der Angehörigentafel werden unverändert wiederverwendet. Es entsteht kein Shop
und kein Almanach-Modul.

Vom Projektstamm:

```powershell
node "Familien Häuser und Clans/scripts/build-house-content.mjs" --houses=pert
node "Familien Häuser und Clans/scripts/build-house-content.mjs" --houses=pert --check
node --test --experimental-test-isolation=none "Familien Häuser und Clans/tests/pert-house-page.test.mjs"
```

Belege des lokalen Auftrags: `diagnostics/pert-20261106/house/`.
Kein Push, Deploy oder produktiver Schreibzugriff.
