# Standardsiegel für Aushänge

`notice-seals-model.mjs` hält die vier Siegel und die reine Auswahlregel.
`notice-seals.js` verbindet sie mit dem vorhandenen Bildmodell und dem
delegierten Editor. Keine eigenen Speicher- oder Firebase-Zugriffe.

Eigene gültige `siegel`-Bilder haben immer Vorrang. Bei leerem Bild ist
`sealPreset` optional: `auto` (auch ohne Feld), `none`, `baeurlich`,
`buergerlich`, `federkiel` oder `wolken-der-daemmerung`.
Das Rendern ergänzt keine Felder und schreibt keine Bildpfade in alte Anzeigen.
Ein expliziter Wechsel auf einen Standard entfernt nur das bisherige Siegel
und dessen Bildmetadaten. „Ohne Siegel“ und das Leeren des Bildplatzes bleiben
auch nach Speichern und Neuladen leer.

Automatisch verwendet ein Hilfsgesuch das einfache Ährensiegel, ein anderer
gewöhnlicher Aushang das bürgerliche Knotensiegel. Die Zuordnung ist im Editor
änderbar. Offizielle Erlasse und Steckbriefe unbekannter Aussteller erhalten
kein erfundenes Amtssiegel. Vorhandene Platzhalter bleiben dort erhalten.
Nur ausdrücklich gesetzte `issuerGuildId` und `writerGuildId` können automatisch
ein Gildensiegel zuordnen: ausstellende Wolken der Dämmerung haben Vorrang,
danach ausstellender oder schreibender Federkiel. Ein gewöhnlicher Gildenaufruf
ist keine Veröffentlichung der Aufsehergilde; Texte werden nicht durchsucht.

Originale PNGs, vollständige Imagegen-Prompts und Erzeugungsnachweise liegen in
`../../images/seals/defaults/`. Die beiden Gildenmotive stammen aus den
tatsächlich vorhandenen Emblemen in `Fraktionen/assets/emblems/gilden/`.
Die erzeugten Alphakanäle wurden unverändert übernommen.

Prüfungen: `node --test Anzeigetafeln/tests/notice-seals.test.mjs` und
`Anzeigetafeln/tests/notice-seals.browser.mjs` mit lokalem Testserver.
