# Händler und Etablissements

Alle Ortsseiten und die Großstadtvorlage verwenden dieselbe kompakte Übersicht.
`assets/js/orte-place-merchants.js` bindet Ortsdaten an den Container
`[data-orte-merchants]`; `merchant-directory.mjs` besitzt die Darstellung.
Die bisherigen acht Tabellenspalten und statischen Musterzeilen sind entfernt.

Jeder Eintrag zeigt geschlossen ein 48-Pixel-Symbol, Name und Gewerbe. Vorschauwerte
bleiben einzeilig; lange Angaben werden mit Auslassungspunkten dargestellt und sind
im geöffneten Eintrag vollständig lesbar. Native `details`/`summary` übernehmen
Aufklappen, Tastaturbedienung und den zugänglichen Öffnungszustand. Besitzer,
Gewerbe, Wohlstand, Ruf, Einfluss und Beschreibung bleiben vollständig erhalten.
Bewertungen verwenden weiterhin `merchant-ratings.mjs` einschließlich der alten
Fünferskalen und ausdrücklich überlieferter Textbewertungen.

Die Hauptart gehört als `category` in den jeweiligen Händlerdatensatz:

| Kennung | Zwischenüberschrift |
| --- | --- |
| `handel` | Handel, Kontore & Lagerhäuser |
| `handwerk` | Läden & Handwerk |
| `gastwirtschaft` | Tavernen, Schänken & Gasthäuser |
| `freudenhaus` | Freudenhäuser & Gesellschaft |
| `badehaus` | Badehäuser & Bader |
| `kultur` | Theater & Kultur |
| `landwirtschaft` | Höfe & Landwirtschaft |
| `tierzucht` | Gestüte & Tierzucht |
| `sonstige` | Weitere Gewerbe & Orte |

`merchant-groups.mjs` bestimmt Gruppenreihenfolge und deutsche alphabetische
Sortierung. Die Quelle selbst wird nicht sortiert oder verändert. Leere Gruppen
entfallen; unbekannte und fehlende Kategorien landen vollständig unter „Weitere
Gewerbe & Orte“. Gemischte Betriebe erhalten eine belegte Hauptart, während das
gesamte Gewerbeangebot im Detail stehen bleibt. Bei Änderungen an den Ortsdaten
deren Cacheversion und die verantwortlichen Register-/Seiteneinbindungen anheben.

Gwynthor enthält 14 Einträge in sechs Gruppen, Llysfaen sechs in drei Gruppen und
Craithglyn einen Handelsbetrieb. Der bereits vorhandene Gwynthorer Theater-Datensatz
war durch eine falsch geschlossene `Object.freeze`-Klammer als zweites Funktions-
argument statt als Listeneintrag gespeichert. Die Struktur ist berichtigt; der
überlieferte Theatertext bleibt unverändert. Die übrigen Angaben und Bildquellen
wurden bei der Gestaltung nicht umgeschrieben.

Bei Datenaktualisierungen bleiben aufgeklappte Einträge und der Tastaturfokus
innerhalb des Registers erhalten. Es entstehen keine globalen Händlerzustände und
keine eigenen Dialog- oder Klick-Handler. Die Gestaltung liegt ausschließlich in
`assets/css/orte-place-merchants.css` und verwendet begrenzte Feature-Selektoren.

Prüfung: `tests/merchant-groups.test.mjs`, `tests/merchant-directory.browser.mjs`
und die bestehende `tests/place-layout.browser.mjs`. Browserprüfung bei 1440,
1024, 768 und 390 Pixeln: vollständige Angaben, Gruppen, kompakte Zeilen, Symbole,
Tastatur, Datenaktualisierungen sowie leere Ortsregister.
