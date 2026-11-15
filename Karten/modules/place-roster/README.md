# Personen und Wappen an Kartenorten

Diese Darstellung gehört zum Kartenbrowser. Sie kennt Gruppen aus `pin` und
`members`, setzt Porträtknöpfe mit Verbindungslinien in Bildschirmpixeln und zeigt
eine zugängliche, scrollbar begrenzte Ortsliste. Quellenauflösung, Rechte,
Katalogladen und Ansichtseinstellungen gehören den aufrufenden Features.

- `place-roster-layout.mjs`: Platzierung und Popup-Geometrie; keine DOM-Zugriffe.
- `place-roster-members.mjs`: sichere Porträt- und Listenelemente aus vorhandenen
  Namen, Rollen, Bildpfaden und Links; keine HTML-Inhalte aus Datensätzen.
- `place-roster-layer.mjs`: eigene DOM-Verwaltung, delegierte Maus-/Tastaturereignisse,
  Fokuswiederherstellung und kontrolliertes verzögertes Schließen.
- `place-roster.css`: gemeinsame Darstellung; optionale Porträtanpassung für Menschen.

`createPlaceRosterLayer(map, runtime, presentation)` erhält einen Namensraum,
Beschriftungsfunktionen und Renderer für Porträt/Liste. Optionale Zusatzinhalte
und Zähler dienen dem bestehenden regionalen Wappenverzeichnis. `maxPortraits`
begrenzt die sichtbaren Miniaturen; die Liste enthält weiterhin alle Mitglieder.
Die Personenanzeige öffnet per Klick oder Tastatur, die bisherige Wappenanzeige
behält ihre Vorschau bei Mausberührung und Fokus.

Die Adapter unter `../households/` erhalten ihre bisherigen Klassen und
`data-household-*`-Attribute. Die Personenebene liegt unter `../people/`.
Es gibt keinen gemeinsamen fachlichen Personen-/Familienzustand und keinen
Firebase-Zugriff in dieser Darstellung.

Ein geöffnetes oder geschlossenes Fenster meldet
`aleria:karto:popover-visibility` mit `{ id, open }`. Der Pinrenderer hört darauf
und verwaltet die Unterdrückung seiner Vorschau selbst. Das Popup kennt den
Pinrenderer nicht. Verzögerte Schließaufrufe werden zusammengeführt und prüfen
vor Ausführung erneut, ob die Liste inzwischen fest geöffnet ist.
