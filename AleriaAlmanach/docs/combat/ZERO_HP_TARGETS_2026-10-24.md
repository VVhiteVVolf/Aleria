# Weitere Angriffe auf Ziele bei 0 TP

Ab dem 24. Oktober 2026 dürfen Angriffe auch dann vollständig ausgewürfelt und
abgeschickt werden, wenn das Ziel bereits 0 TP hat. Das gilt für Übungskämpfe,
Duelle und reguläre Kämpfe sowie für weitere Angriffe innerhalb desselben
Beitrags und in späteren Beiträgen.

Der vollständige Schaden bleibt im Würfelbeleg erhalten. Die verbleibenden TP
werden weiterhin bei 0 begrenzt; überschüssiger Schaden erzeugt keine negativen
TP und keine erneut ausgelöste Niederlage. Die erzählerische Einordnung bleibt
bei den Beteiligten.

Die frühere Zielsperre wurde aus dem gemeinsamen `CombatResolutionService`
entfernt. Browser und generierte Servermechanik verwenden
`combat-evaluation-12`. Aktionskosten, Würfelvalidierung, Ausrüstung, Zustände
und die Voraussetzungen der handelnden Figur gelten weiterhin.

Es ist kein Datenabgleich nötig. Die Änderung wertet vorhandene Beiträge nicht
neu aus und verändert keine gespeicherten Würfe oder Live-Ressourcen. Der Server
verwendet auch beim Absenden weiterer Angriffe die eingereichten Würfelbelege.

Regressionen sind in `tests/combat-resolution-completeness.test.mjs` und
`firebase/functions/tests/critical-scene-items.test.js` abgedeckt: Ziele bei 0 TP,
vollständige Viererfolgen, mehrere Angriffssegmente über die 0-TP-Grenze,
Folgebeiträge, unveränderte Würfelwerte, Ressourcenverbrauch und unveränderte
historische Beiträge.
