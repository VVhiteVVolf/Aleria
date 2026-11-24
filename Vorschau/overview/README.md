# Gemeinsame Vorbereitungsübersicht

`Vorschau/index.html` zeigt offene Länder- und Provinzvorbereitungen sowie die
[Herrschaftswerkstatt von Cenyr](../Herrschaftsverwaltung/Cenyr/). Die drei
Argentum-Provinzen besitzen eine eigene Gruppe. Der Einstieg „Verwaltung und
Ratsämter“ führt zur königlichen Übersicht und zu den neun Grafschaften.
Die Direkteinstiege für Celtigerns Wacht und seine Baronien bleiben darunter.
Die sichtbare Bezeichnung Vardentia verwendet weiterhin den bestehenden Pfad
`Sylvarant/` und die stabile Entwurfskennung.
Die Adharath werden als nomadisches Volk mit dem Erbe Dúinreachs vorbereitet,
ohne daraus einen heutigen Territorialstaat abzuleiten.

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
