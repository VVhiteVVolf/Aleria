# Inventar und Itemkarten

Die Darstellung gilt für alle Charakterinventare. Die vorhandenen Editor-, Handels- und Kampfsysteme bleiben zuständig für Änderungen und Transaktionen.

## Zuständigkeiten

- `character-inventory-identity.js`: gemeinsame Leseprojektion aus Inventarinstanz, verknüpfter Ausrüstung, Registervorlage und Kreaturbogen. Individuelle Namen, Bilder, Mengen und Regeln bleiben erhalten. Diese Projektion wird nicht zurückgespeichert.
- `character-inventory-valuation.js`: Handelsschätzung separat vom tatsächlich bezahlten Kaufpreis. Reihenfolge: individuelle Bewertung, vorhandener Gegenstandswert, alte Preiszeile, Registerpreis. Fehlende Preise bleiben offen.
- `character-inventory-card-model.js` und `character-inventory-cards.js`: gemeinsame Vorschau und Karten für Waffen, Rüstungen, Verbrauchsgüter, Artefakte, Dokumente, Ausrüstung und Gefährten.
- Renderer, Ereignisse, Karteneditor und Ausrüstungsfragebogen liegen in getrennten Featuredateien. Der Integrationsadapter hält keinen zweiten Inventarzustand und verwendet die vorhandenen Register- und Kreaturereignisse.
- Geld wird in ganzen Eisenpfennigen gerechnet: 100 Pf = 1 KT, 100 KT = 1 ST, 10 ST = 1 GT. Ältere Bruchteile eines Kupfertalers bleiben erhalten.
- Archivzusammenführung verwendet stabile Rossmarkt-/Registerreferenzen. Individuelle Tiere und Händlerangebote bleiben eigene Einträge.

## Gawains Beispielausrüstung

| Gegenstand | Handelspreis je Stück | Grundlage |
| --- | --- | --- |
| Drachenzahn | 5 GT 5 ST | Ritterschwert: Registerspanne 2–5 GT; gute Ausführung mit 10 % Qualitätsaufschlag |
| Silberschuppe | 8 GT 8 ST | Ritterplatte: Registerspanne 5–40 GT; einfache Jungritterplatte 8 GT mit 10 % Qualitätsaufschlag |
| Draig-Dolch | 2 ST | Schätzung aus dem Preis einer einfachen Stahlwaffe |
| Draig-Rittersiegelring | 3 ST | Nichtmagische Metallarbeit mit Gravur; keine Übertragung von Rang oder Privilegien |
| Reisepaket mit gewachster Hülle | 13 KT 20 Pf | Registerpreis 12 KT mit 10 % Aufschlag für Wetterschutz |
| Wundverband | 27 KT 50 Pf | Registerpreis 25 KT mit 10 % Aufschlag für geschützte Verpackung |

Drachenzahn behält seine normalen Waffenwürfel und erhält +1 Schaden durch Verarbeitung. **Drachenkerbe** fügt bei einem kritischen Treffer mit genau dieser Waffe weitere 2 Schaden hinzu. Der feste Zusatz wird nicht verdoppelt; passende waffengebundene Techniken sind eingeschlossen.

Silberschuppe hat Basis-RK 16 ohne zusätzlichen RK-Bonus. Sie reduziert jede Hieb- oder Stich-Schadensinstanz um 2 (mindestens 0). Gildas' Gafyr-Plattenrüstung schützt entsprechend gegen alle Schadensarten außer Stich. Der gemeinsame typisierte Schadenspfad berücksichtigt den Schutz nach Rettungswurf und Affinitäten, auch bei Zaubern und Folgeangriffen. Abgelegte Ausrüstung wirkt nicht. `damageProtection` bleibt zwischen Inventar und Kampfprofil synchron; die Auswertung protokolliert die tatsächlich verhinderte Schadensmenge. Gildas' Pflichtschwur hat +1 Angriff und +1 Schaden, ohne Drachenkerbe; Drachenzahns kritischer +2-Zusatz bleibt unverändert.

Tanor ist mit `companion-tanor` verknüpft. Seine Karte zeigt aktuelle Kreaturwerte und eine Kurzbeschreibung auf Grundlage seines vorhandenen Kreaturbogens.

Die Beispieldaten liegen in `Charakter Archiv Exporte/gawain-draig.json` und der daraus synchronisierten Charakterdatenbank. Dies allein aktualisiert keine bereits gespeicherten Firestore-Datensätze.

## Eisenpfennig

Projektdatei: `public/assets/inventory/coins/eisenpfennig.png`. Erstellt mit dem integrierten Bildgenerator. Stilreferenzen: `Gilden/Abenteurer Gilden/Drachenritter/Bilder/coin_copper.png` und `coin_silver.png`.

Gestaltungsauftrag: Einzelner frontal dargestellter, mittelalterlicher Eisenpfennig; rund, gehämmertes dunkles Eisen, abgenutzter Rand, zentrales Loch und vier gravierte Sterne; passend zur vorhandenen Münzfamilie, ohne Schrift. Die finale Hintergrundkorrektur verwendet ein einheitliches dunkles Waldgrau `#202b28`, ohne Schachbrettmuster. Das Ergebnis besitzt einen deckenden Hintergrund und wird im Geldbeutel kreisförmig dargestellt.

## Prüfung

Gezielte Tests decken Bild- und Vorlagenabgleich, Gegenstandserhalt beim Speichern, getrennte Handels- und Kaufpreise, vier Münzsorten, Gefährtenverknüpfungen, Archivduplikate sowie Waffen- und Rüstungseffekte ab. Die Browserprüfung verwendet lokale Daten und blockiert externe Datenbankzugriffe.
