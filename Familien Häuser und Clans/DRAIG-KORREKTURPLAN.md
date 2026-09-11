# Haus Draig – Rückmeldung und Ausführungsplan

## Die fünf Fehler

1. Das Herrschaftsbanner füllt die breite Infobox aus und wirkt zu groß.
2. Die Tabelle „Historische Figuren“ hat eine begrenzte Breite, sitzt aber links statt mittig.
3. Die Familienwappen auf Herrschaftsseiten führen noch zum Stammbaum statt zu vorhandenen großen Hausseiten.
4. Unbekannte Hofämter wurden mit leeren Textflächen dargestellt. Die Silhouetten der Quelle müssen verwendet werden.
5. Die Stammbaum-Hausbio wiederholt zu viel von der großen Hausseite, insbesondere Hofämter und die vollständige Oberhauptfolge.

Nachtrag: Das **Herrschaftsbanner auf der Hausseite** soll zur zugehörigen Herrschaftsseite führen, bei Draig also nach Celtigerns Wacht.

## Ausführung

- [x] Banner auf ungefähr 240 Pixel begrenzen und innerhalb der Infobox zentrieren; auch auf kleinen Bildschirmen begrenzt halten.
- [x] Das Banner über `territoryHref` mit der zugehörigen Herrschaftsseite verbinden und den tatsächlichen Klick prüfen.
- [x] Historische Figurentabelle innerhalb ihres Abschnitts zentrieren und die vorhandene Breitenbegrenzung bewahren.
- [x] Die zuständige Darstellung der Herrschaftswappen an die bestehende Hausseitenregistrierung anbinden. Bereits vorhandene Hausseiten öffnen; Personenlinks im Stammbaum behalten ihre genealogische Aufgabe.
- [x] Die männlichen und weiblichen Silhouetten aus der Altvorlage passend zu den jeweiligen Hofämtern einsetzen. „Nicht benannt“ und die einheitlichen Kartengrößen beibehalten.
- [x] Eine kurze redaktionelle Hausbio mit Herkunft, Stellung, Werten, Sitz, aktuellem Oberhaupt und wichtigen Verbindungen erstellen. Ausführliche Chronik und Ämter verbleiben auf der großen Hausseite.
- [x] Den Übergang von der zuvor ausgelieferten langen Standardbio zur Kurzfassung berücksichtigen, ohne individuell bearbeitete Bios zu überschreiben.
- [x] Generierte Daten aktualisieren; Darstellung, Wappenlinks, Bio-Umfang und bestehende Speicherlogik gezielt prüfen.
- [x] Die dauerhafte Vorgehensdokumentation an diese Regeln anpassen und das Prüfergebnis festhalten.

## Regeln für die nächsten Häuser

Große Hausseite und kurze Stammbaum-Hausbio sind zwei Ansichten mit unterschiedlichem Umfang. Die große Seite ist über Wappen auf den Herrschaftsseiten erreichbar. Ihr Herrschaftsbanner verlinkt zurück auf die zugehörige Herrschaft. Die Bio dient der Orientierung im Stammbaum. Vorhandene Silhouetten sind gewollte Platzhalter und werden übernommen. Banner erhalten eine feste Obergrenze; schmalere Tabellen stehen mittig.

## Ergebnis

Alle fünf Korrekturen einschließlich des Bannerlink-Nachtrags sind umgesetzt. Im Browser bei 1.440, 768 und 390 Pixel Breite geprüft: Bannerbreite 240 Pixel, Figurentabelle mittig, kein horizontaler Überlauf und Silhouetten in allen elf unbenannten Hofämtern. Die Silhouetten-Dateien stimmen bytegenau mit den beiden Bildquellen der Altvorlage überein.

Der tatsächliche Klick auf das Draig-Wappen in Celtigerns Wacht öffnet die Hausseite; der Klick auf das Herrschaftsbanner führt zurück nach Celtigerns Wacht. Die kurze Hausbio enthält drei kurze Absätze und die wichtigsten Profildaten sowie Verbindungen. Die große Hausseite behält ihren ausführlichen Inhalt.

Erfolgreich: 8 gezielte Draig-Prüfungen, 1 Prüfung der Familienzuordnung von Celtigerns Wacht, 17 ergänzende Stammbaumtests und alle 1.246 bisherigen Stammbaumtests. Bestehende individuelle Bio-Texte, Bilder und Kommentare bleiben beim Upgrade erhalten.
