# Freya Skald · Biografie vom 17. Oktober 2026

Die Biografie gehört zur bestehenden Figur `ksJQe8Ai4KbRE9jOAvb7` und verknüpft sie mit dem Stammbaumeintrag `person--haus-skald--freya-skald`. Die redaktionellen Inhalte folgen den Angaben des Nutzers; Familiennamen, Lebensdaten und Verwandtschaftswege stammen aus dem vollständigen Familienregister.

## Bildauswahl

- Standard: vorhandenes, unverändertes Porträt in `references/freya-standard.png`.
- `freya-schildmaid-eldfaxi.png`: Freya in voller Rüstung mit der Hest-Mix-Stute Eldfaxi.
- `freya-15.png`: junge Bardin mit 15 Jahren, 1735.
- `freya-06-fenrir-08.png`: Freya mit sechs und Fenrir mit acht Jahren, 1726.

Das gemeinsame Erwachsenenbild wurde auf ausdrücklichen Wunsch gestrichen. Das gemeinsame Kinderbild bleibt erhalten. Die drei neuen Bilder wurden mit dem integrierten ImageGen und dem gespeicherten Anime-Szenenstil erstellt. Vollständige Prompts und Motivquellen stehen in `image-prompts.json`.

## Inhalt und Quellen

- Fenrir wird als bester Freund und Love Interest besonders hervorgehoben. Unterschiedliche Wünsche zu Freiheit, Ehe und Familie bleiben offen; es wird keine Verlobung oder Ehe erfunden.
- Zwölf Persönlichkeitseinträge verwenden vorhandene, kontrollierte Traits-Symbole.
- 53 Familienverbindungen umfassen Eltern, sechs Geschwister, Großeltern, Tanten, Onkel, Cousinen und Cousins sowie Fenrirs engere Familie. Akademie und Eldfaxi ergänzen sie zu 55 Verbindungskarten.
- `family-context.json` dokumentiert die geprüften Verwandtschaftswege und 84 belegte Vorfahren. Weiter entfernte Vorfahren stehen in dieser Quellenübersicht, ohne die persönliche Nähe zu Freya zu behaupten. Antje und Antke Skald bleiben zwei unterschiedliche Personen. Wo kein Personenporträt vorliegt, erscheint das vorhandene zugehörige Familienwappen.
- Die Skaldenakademie von Klangheim ist unter `/Fraktionen/index.html#fraktion-skaldenakademie-klangheim` als Institut für musikalische und magische Ausbildung registriert.
- Eldfaxi ist bereits als Kreatur und Begleiterin angelegt. Ihre bestehende ID, ihr Bogen und Freyas Inventar werden unverändert weiterverwendet.

## Veröffentlichung und Prüfung

Bildbereitstellung: `node firebase/scripts/content/publish-freya-artwork.mjs`.

Überprüfbarer Entwurf: `node firebase/scripts/content/publish-freya-biography.mjs`. Speicherung des vorbereiteten Entwurfs: derselbe Aufruf mit `--apply`.

Der Speichervorgang prüft zwischenzeitliche Änderungen, sichert den vorherigen Stand verschlüsselt und aktualisiert ausschließlich Biografie, Stammbaumidentität, Genealogie und Änderungszeitpunkt. Kampfdaten, Live-Ressourcen, bestehende Bildsets, Emotes, Inventar und Kreaturendaten gehören nicht zum Schreibumfang.

`asset-publication.json` enthält die unveränderlichen Bildadressen mit Prüfsummen. `prepared.json` hält den konkreten Schreibumfang fest. `publication-verification.json` und die Browser-Prüfberichte dokumentieren die abgeschlossene Übernahme und Darstellung.

Tests: `node firebase/tests/freya-biography.test.mjs`, zusätzlich die vorhandenen Neala- und Sleipnir-Biografietests für den gemeinsamen Veröffentlichungsablauf.
