# Gemeinsame Länderwerkstatt

`Vorschau/index.html` zeigt ausschließlich Länder- und Provinzvorbereitungen,
deren Inhalte noch nicht als reguläre Landes- und Herrschaftsseiten übernommen
wurden. Der gepflegte Katalog enthält elf Werkstätten; die drei Argentum-Provinzen
besitzen eine eigene Gruppe und werden nicht zu unabhängigen Ländern erklärt.
Die sichtbare Bezeichnung Vardentia verwendet weiterhin den bestehenden Pfad
`Sylvarant/` und die stabile Entwurfskennung.

`preparation-catalog.mjs` besitzt die Übersichtsdaten, `overview-render.mjs` die
escaped Darstellung und `overview-app.mjs` ausschließlich Suche und lokale DOM-
Verwaltung. Die Gestaltung verwendet die bestehende Werkstattbasis. Die Übersicht
übernimmt keine Sitzentwürfe oder Kanondaten und liest keine Firebase-Daten.

Zehn Vorschauen sind bereits im Katalog `shared/accepted-realms/catalog.mjs`
übernommen. Uathneach besitzt einen älteren eigenen Übernahmeweg unter
`Kontinente/modules/uathneach/`. Diese elf Vorschauarchive bleiben erhalten und
werden hier nicht erneut als offene Landesvorbereitungen angezeigt.

Der Fachtest `Vorschau/tests/preparation-overview.test.mjs` gleicht die Liste
mit diesen beiden tatsächlichen Übernahmewegen, den vorhandenen Werkstätten
und sämtlichen lokalen Bild-/Seitenlinks ab. Neue Übernahmen müssen den Katalog
gezielt verkleinern; ein neu angelegtes offenes Land muss ihn ergänzen.
