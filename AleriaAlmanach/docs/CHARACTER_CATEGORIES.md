# Kategorien im Personenregister

Die Übersicht zeigt kompakte Kategorienkarten mit Figurenzahl und Namensvorschau.
Die Kategoriearten können einzeln eingeblendet werden. Ein Klick öffnet die
Figuren; eigene Gruppen behalten ihre vorhandenen Untergruppen und Bearbeitung.
Stammbäume, Relevanz, Status, Ort und Fraktion bleiben alternative Ansichten.

## Automatische Einordnung

`modules/characters/character-categories.js` bildet eine reine Leseansicht:

1. Eine vorhandene eigene Gruppe hat Vorrang.
2. Sonst gilt das im Profil gespeicherte Haus. Ohne Hausangabe kann eine einzige
   eindeutige Stammbaumzugehörigkeit die Kategorie liefern.
3. Danach folgen die erste angegebene Fraktion beziehungsweise der Aufenthaltsort.
4. Fehlen eindeutige Angaben, bleibt die Figur unter **Noch zuordnen**.

Die automatische Einordnung wird aus dem jeweils geladenen Profil abgeleitet.
Sie schreibt weder `charTabs` noch Charakterdokumente und erfindet keine
Zugehörigkeiten aus Nachnamen. Neue oder online ergänzte Figuren verwenden
dieselben Regeln. Die Kategorie **Häuser & Familien** in der Übersicht enthält
die automatisch eingeordneten Figuren; die separate Ansicht **Stammbäume** zeigt
weiterhin alle Familienzugehörigkeiten, auch bei manuell gruppierten Figuren.
**Eigene Gruppen** bleibt die manuelle Ablage einschließlich ihres bisherigen
Unsortiert-Bereichs.

## Navigation und Schnellzugriffe

`character-category-browser.js` besitzt ausschließlich Kategorieauswahl und
Darstellung. Suche und Sortierung verbleiben in `character-register-views.js`,
die bestehenden Profil- und Gruppenaktionen in ihren bisherigen Modulen.

Die acht Dashboard-Kacheln sind native Buttons. Zeitfilter öffnen alle Figuren
mit bekanntem Datum in absteigender Reihenfolge statt nur zwölf Treffer in
eingeklappten Gruppen. Ein Schnellzugriff ersetzt eine vorherige Suche oder
Kategorieauswahl; eine anschließend eingegebene Suche grenzt die Treffer weiter
ein. Zur Übersicht löscht die lokalen Filter. Dashboard-Zahlen beziehen sich
immer auf das gesamte sichtbare Register. Archivierte und ausgeblendete Figuren
werden dabei wie bisher ausgeschlossen.

## Prüfung

- `node --test AleriaAlmanach/tests/character-*.test.mjs`
- Browserprüfung: Kategorien und Kategoriearten, Zeitfilter, leere Suche,
  Profilbuttons, Untergruppen, Ordnen, Tastaturbedienung, 390-Pixel-Ansicht.
- Vollständiger Almanach: lokaler Datenfallback, Register öffnen, Zeitfilter,
  keine JavaScript-Fehler.

Live-Ressourcen, Inventar, Online-IDs und historische Kampfauswertungen sind von
dieser Änderung nicht betroffen.
