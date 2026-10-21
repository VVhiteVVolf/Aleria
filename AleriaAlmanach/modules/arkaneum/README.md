# Lothaires Arkaneum

Lokales Ortsmodul direkt unter `Gwynthor-Stadt`, ohne eigene Unterkategorie.
Der Bauplan enthält 15 Seiten, davon vier Güterseiten und fünf interaktive Räume.
Die Kalkulation ist ausdrücklich zurückgestellt; `economyCalculationDeferred`
bleibt bei Import und Bearbeitung erhalten und wird durch die gemeinsame
Wirtschaftsprüfung respektiert.

## Zuständigkeiten

- `arkaneum-people.mjs`: gemeinsame Personenquelle für Hausakte und Ortsmodul.
- `arkaneum-biography.mjs`, `arkaneum-hierarchy.mjs`, `arkaneum-rooms.mjs` und
  `arkaneum-services.mjs`: die jeweiligen Inhalte, mit bestehenden Seitentemplates.
- `arkaneum-standard-selection.mjs`: ausdrückliche Auswahl gewöhnlicher Waren.
  Preise und Einheiten stammen aus den Marktquellen und dem generierten Register.
- `arkaneum-specials.mjs`: fünf besondere alchemistische und sechs arkane Angebote.
  Vorhandene Registeridentitäten bleiben erhalten, insbesondere beim einzeln
  angebotenen ersten Band der Magie-Grundlagen. Die Splitterbombe ist ein eigenes
  Werkstück und ersetzt die bestehende Tenebrium-Bombe nicht.
- `arkaneum-goods.mjs`: Projektion beider Sortimente in das Gütertemplate.
- `arkaneum-module.mjs`: Seitenfolge, stabile Szenenschlüssel und Ortszuordnung.

Neue gewöhnliche Waren stehen in `Markt/Alchemist/data/alchemy-data.js` bzw.
`Markt/Arkanist/data/arcane-data.js`. Die beiden generierten Registerkopien niemals
von Hand bearbeiten. Eigene Verzauberungen sind als Warenwirkungen beschrieben;
es werden keine neuen automatischen Kampfregeln oder Schadenswürfel erfunden.

Der Kalzinator ist nach Nutzerkorrektur ein handgroßes Reisegerät, etwa 10 × 8 cm,
mit keramischer Kammer. Sein altes Ofenbild ist nur als verworfene Bildvariante
erhalten. Die 20 Edel- und Schmucksteine werden jeweils einzeln und unverzaubert
angeboten; Gewichts- und Preisangaben beziehen sich auf kleine Handelsqualität.

## Familie und Bilder

`Stammbäume/assets/js/data/house-lothaire-family.js` nutzt dieselben Personen-IDs.
Unbekannte Gründer → Hausknoten → ein Zeitsprung → Herluin. Seine Verbindung mit
Helygyn führt über einen motivlosen Bastardknoten zu Rhydian; dessen Ehe mit der
verstorbenen Perdella hat ausschließlich Maelwyn hervorgebracht. Maelwyn ist
ehelich geboren, gehört aber zur nicht legitimierten O’Cenyr-Linie.

Die Bilder liegen in `assets/herluin-lothaire/`. Prompts, Originalpfade und
SHA-256-Nachweise stehen neben den jeweiligen Bildern. Sämtliche Bilder wurden
mit dem eingebauten ImageGen erstellt. Für Wappen und Ladenschild wurde die
ausdrücklich genehmigte Alpha-/Randkorrektur vorgenommen, ohne RGB-Werte zu ändern.
Die Item-Alphakanäle bleiben unverändert.

## Lokale Prüfung

```powershell
node AleriaAlmanach/scripts/build-item-register.mjs
node AleriaAlmanach/scripts/build-arkaneum.mjs
node AleriaAlmanach/scripts/build-economy-price-reference.mjs
node AleriaAlmanach/scripts/build-economy-price-review.mjs
node AleriaAlmanach/scripts/build-economy-calculator.mjs
node firebase/functions/scripts/sync-almanach-mechanics.mjs
node --test --experimental-test-isolation=none AleriaAlmanach/tests/arkaneum.test.mjs
node AleriaAlmanach/tests/arkaneum.browser.mjs
node Stammbäume/tools/check-chart-geometry.mjs --families=haus-lothaire --report=.tmp/arkaneum/family-geometry.json
```

Die Browserprüfung verwendet nur eine lokale Vorschau und blockiert externe
Schreibzugriffe. Build und lokale Familiensnapshots veröffentlichen keine Inhalte
auf Firebase oder Netlify. Push und Deployment sind in diesem Auftrag ausgesetzt.
