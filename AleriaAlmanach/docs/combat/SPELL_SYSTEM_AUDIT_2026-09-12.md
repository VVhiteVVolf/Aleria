# Prüfung des Zaubersystems vom 12. September 2026

Geprüft wurden Katalog, Charakterbogen-Archiv, gespeicherte Profilwerte, Zauberkarten, gewählte Wirkungsgrade, Szenenzustände und die serverseitige Neuberechnung. Der gleichzeitig in einem anderen Chat überarbeitete Elemente-Katalog wurde als Eingabe geprüft; seine Inhalte wurden durch diesen Audit nicht umgestaltet.

## Umfang

| Grundlage | Zauber | Zusätzliche Formen | Geprüfte Grund- und höhere Formen |
| --- | ---: | ---: | ---: |
| Elementarismus, erhaltene Revision 1 | 72 | 120 | 192 |
| Elemente, Revision 2 | 120 | 162 | 282 |
| Zusammen | 192 Fassungen | 282 | **474** |

Jede der 474 Formen durchläuft Archivnormalisierung, Kopie mit eigener Instanz-ID, JSON-Rundlauf, Profilauflösung, Schadensvorschau und tatsächliches Wirken. Geprüft werden Referenz und Revision, Würfelformeln, Schadensarten, Reichweite, Aktionspaket, Manakosten, Gradfreigaben und Nichtverbrauch der Gradressourcen. Ein getrennter Serverdurchlauf berechnet dieselben Formen aus den Einzelwürfeln erneut; manipulierte übermittelte Schadenssummen werden nicht übernommen.

Zusätzlich wurden alle **31 persönlichen Zauber von Rhiannon und Freya** nach Archivübernahme mit ihren normalisierten Originalregeln verglichen. Die vorhandenen Tests prüfen Rhiannons INT-Bezug, manuelle Attributsmodifikatoren, Hochwirken, Krits, erfolgreiche Rettungen, Schutzzauber und fehlende Teilressourcen. Die neuen Katalogdurchläufe verwenden bewusst WE beziehungsweise CHA einschließlich manuellem Attributsmodifikator, damit kein persönlicher INT-Schadensbonus in allgemeine Vorlagen gelangt.

## Gefundene und behobene Abweichungen

1. **Waffenwürfel in Zauberkarten:** Die Charakterbogen-Vorschau besaß keinen eindeutigen magischen Handlungskontext. Ein reiner Waffen-Zusatzwürfel konnte deshalb in einer Zauberkarte erscheinen. Sie verwendet jetzt ausdrücklich denselben Zauberkontext wie der Kampf.
2. **Geltungsbereich temporärer Schadensboni:** Szenenzustände addierten jeden festen Schadensbonus auch auf Zauber. Bei magischen Handlungen werden jetzt ausschließlich ausdrücklich allgemeine Boni (`damageScope: all-effects`) übernommen. Waffenangriffe behalten ihre vorgesehenen Boni.
3. **Allgemeiner Angriff unterschiedlich ausgewertet:** Der vorhandene Szenenvertrag erlaubt allgemeine Angriffsmodifikatoren für Waffen und Zauber. Statische Profilzustände ließen den allgemeinen Anteil beim Zauberangriff hingegen weg. Profil, Szenenwert und KI-Snapshot berücksichtigen ihn jetzt gleich; ein spezieller Zauberangriffsbonus bleibt auf Magie begrenzt. Absolute manuelle Zauberwert-Overrides bleiben erhalten.
4. **Alte persönliche Regeln beim Archivkopieren:** Vor Vergabe der neuen Instanz-ID wurde kein vollständiger Zauberabgleich vorgenommen. Ältere Rhiannon-Einträge konnten dadurch veraltete Kosten oder fehlenden INT-Bezug behalten. Das Archiv verwendet jetzt die gemeinsame Zaubernormalisierung vor dem Kopieren. Bekannte Katalogreferenzen behalten ihre konkrete Revision; ihre kanonischen Namen und Wirkungen haben Vorrang vor alten Anzeige-Snapshots. Andere Archivmetadaten bleiben erhalten.
5. **Veraltete Kostenangaben im Editor:** Der Editor behauptete noch, Zaubertricks kosteten kein Mana, und bot verbrauchte Zauberplätze sowie editierbare, später überschriebene Manakosten an. Mana wird jetzt aus dem Grad angezeigt, Gradfreigaben werden als nicht verbrauchbar erklärt und die Kostenliste zeigt ausschließlich die zusätzlich editierbaren Ressourcen. Die tatsächlichen Indizes der Kostenzeilen bleiben beim Ausblenden der Mana-Zeile erhalten.
6. **Veralteter Schaden nach Attributsänderung:** Die abgeleiteten Hauptwerte aktualisierten sich, geöffnete Zauberkarten jedoch nicht. Das eigene Modul `modules/characters/character-spell-view.js` aktualisiert die betreffenden Texte innerhalb des übergebenen Bogenbereichs, ohne Fokus oder geöffnete Karten zu verlieren.
7. **Doppelte Eingabewege für Schadenswürfel:** Bei strukturierten Effekten war zusätzlich eine Hauptformel editierbar, die von den tatsächlichen Effekten überstimmt wurde. In diesem Fall verweist der Editor jetzt auf die maßgeblichen Effektfelder. Der Browsercheck ändert eine Effektformel und prüft ihre tatsächliche Verwendung im Kampf.
8. **Zielgrenze eigener Katalogableitungen:** Beim Ablösen der Katalogreferenz ging eine ausdrücklich angegebene maximale Zielzahl in der Normalisierung verloren. Eigene Fassungen behalten sie jetzt durch Profil und serverseitige Handlungsauflösung hindurch.

Die gemeinsamen geänderten Kampfmodule wurden in die generierte Servermechanik übernommen. Es wurden keine historischen Kampfbelege umgeschrieben.

## Prüfungen

| Abschlussprüfung | Ergebnis |
| --- | --- |
| Frontend-Gesamttests | 737 von 738 erfolgreich; verbleibender Fehler: Limita-Rüstungsroutine |
| Firebase-Functions-Gesamttests | 98 von 98 erfolgreich |
| Magietests | 9 von 9 erfolgreich |
| Lokale Browserprüfung | Erfolgreich bei 1280 und 390 Pixeln; keine JavaScript-Fehler |
| Produktionsbuild | Erfolgreich |
| Zauber-/Attackenbibliothek und Charakterdatenbank-Synchronität | Beide erfolgreich |

- Neue Frontend-Prüfung: `tests/spell-profile-consistency.test.mjs`.
- Neue Serverprüfung: `firebase/functions/tests/spell-profile-consistency.test.js`.
- Browser: echte Charakterbogen- und Editor-Module auf einem isolierten lokalen Server; Attributseingabe, Gradwechsel, Bearbeiten/Kopieren einer Katalogfassung und tatsächliche Verwendung der geänderten Schadensformel. Ansichten mit 1280 und 390 Pixeln. Keine JavaScript-Fehler in diesem Prüflauf.
- Datenabgleich: Zauber-/Attackenbibliothek mit 31 Zaubern und 34 Techniken/Fähigkeiten aktuell. Charakterdatenbank-Prüfung für 234 Figuren aus 266 Quelldokumenten erfolgreich.
- Beide Magieverzeichnisse und ihre Generatorprüfungen werden von den Magietests erfasst.
- Produktionsbuild mit Vite; die vorliegenden Quellen werden gebaut, ohne die parallel bearbeiteten Kataloge erneut zu erzeugen.

Lokale Protokolle, Browserprogramm und Screenshots liegen unter `.codex-temp/spell-system-audit/`. Die verwendeten Browserfälle verändern ausschließlich lokale Prüfdaten. Die Ergebnisse sind eine Prüfung des lokalen Quellstands, keine Bestätigung des derzeit veröffentlichten Frontends oder der produktiven Firebase-Funktionen.

## Abgrenzung

Ein davon unabhängiger Frontend-Bestandstest schlägt bei der Rüstungsroutine der Klasse **Limita** fehl. Der separate allgemeine Archivprüfer erwartet außerdem 34 Klassenicons, während das Register 39 liefert. Diese Befunde bleiben als gesonderte Klassen-/Registerabweichungen offen.

Die vorhandenen Grenzen der Automatisierung bleiben bestehen: Freitext, Gelände, weitere Zonenkontakte und bestimmte Kontrollwirkungen sind nicht allein aufgrund ihrer Beschreibung automatisch auswertbar. Der Audit bestätigt die geprüften strukturierten Werte und Abläufe; er ersetzt keine Bewertung der Kampfbalance einer langen Spielsitzung.

Für die Livewirkung müssen Frontend und aktualisierte Firebase-Funktionen gemeinsam veröffentlicht werden.
