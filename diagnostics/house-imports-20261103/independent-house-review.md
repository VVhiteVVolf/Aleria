# Unabhängige Ährental-Prüfung, 3. November 2026

- Neue portable Suite: `Familien Häuser und Clans/tests/aehrental-house-pages.test.mjs`, 9/9 Prüfgruppen erfolgreich. Die Suite benötigt keine Diagnosearchive und erzwingt keine Mindestlänge kurzer Originalvorlagen.
- Eigene minimale Fixture: zwölf vorhandene Familien-IDs, anfängliche Graphprüfsummen und geprüfte kanonische Rang-/Orts-/Lehensmetadaten; keine Personen oder Verwandtschaftskopien. Die Prüfsummen dienen ausschließlich dem einmaligen Übernahmeaudit, nicht als dauerhafte Sperre gegen spätere erlaubte Stammbaumänderungen.
- Einmaliger aktueller Vollabgleich: alle zwölf bestehenden Graphen und kanonischen Profile unverändert. Beleg: `graph-preservation-one-time.json`.
- Tatsächlicher Bio-Upgradepfad auf Kopien geprüft: eigene Personenbearbeitung, eigene Hausprosa und explizite Löschung einer Biografie bleiben erhalten.
- Bestehende IDs und `mode=view`-Iframes stimmen. Die zwölf Hausseiten werden über die 21 vorhandenen Gebietskarten direkt mit dem richtigen registrierten Seitentyp geöffnet.
- Aktive Hausbilder, Wappen, Banner und Bio-Verweise sind lokal erreichbar. Original-HTML und Herkunftsmanifest sind nicht Teil der statischen Auslieferung; generierte aktive Seitendaten und Biografien bleiben auslieferbar.
- Keine übernommenen Quellenhierarchien/-stammbäume, Militärzahlen oder erfundenen Porträtpersonen aus leeren Feldern in der geprüften Projektion.
- Rollenregression gezielt abgedeckt: Morcanhucs aktueller Gründer und historische Gründerfigur ist Arthos; Charltons Titel „Vater der Gründergeneration“ begründet keine Gründerrolle.

## Zusätzlicher Quellenabgleich

Die ersten sechs Vorlagen wurden getrennt von Stammbäumen, Hierarchien und Militärstatistiken ausgewertet. Bereits geeignete Darstellungen wurden als Originale erhalten. Die 36 leeren generischen Personenbilder dieser Quellen wurden nicht als fehlende benannte Figuren interpretiert.

Stichproben der verfassten Inhalte bestätigen die bekannten Konfliktauflösungen: Morcanhucs Besitzabschnitt übernimmt nicht den kopierten Marchog-Namen; Ciaróg bleibt Ritterfürstenhaus von Caer Diwedd; Sgwarnogs religiöser Fließtext folgt Knecht/Hüter statt der widersprüchlichen Infotabelle und unterscheidet schlichten Fußkrieger von repräsentativer Ritterausrüstung. Baedds Riesenschwein-Reiter bleiben als umstrittene Legende kenntlich. Aroglyn bleibt ein bürgerliches Haus ohne erfundenen Erbberuf. Die kurzen Seiten von Gwythiad, Aroglyn und den beiden antiken Clans behaupten keine ausgedachte ausführliche Hauschronik.

Diese Prüfung umfasst Daten-/Quellkonsistenz und lokale Erreichbarkeit, keine zusätzliche visuelle Browserabnahme. Kein Push, Deploy oder Firebase-Schreibzugriff durchgeführt.
