# Drachentanz (Volkstanz)

Neunseitiger Almanach-Eintrag unter
**Völker & Kulturen → Cenyr → Bräuche und Riten → Drachentanz (Volkstanz)**.
Die Inhaltsdatei wird nach `data/sections.js` geladen und registriert nur diesen
Eintrag. Sie verwendet das vorhandene Standardtemplate, dessen Seitenwechsel,
Kommentarblöcke und Moduleditoren. Alle Absätze und zehn Wissenswertes-Punkte
der Textvorlage sind enthalten; längere Kapitel sind auf zwei Seiten aufgeteilt.

Heledd ist über `J4wpNQON98GsdPzsaIUk` als vorhandene Figur zugeordnet.
Die Kommentarblöcke verwenden ihren exakten Archivnamen für die Figurenauswahl.
Ihre beiden neuen Porträts gehören zum Modul; bestehende Charakterdokumente und
Emote-Sets werden nicht überschrieben. Sir Morgans Zitat und die überlieferte
Ermahnung bleiben mit ihrer ursprünglichen Zuschreibung erhalten.

## Seiten

1. Eine lebendige Tradition
2. Gemeinsam in Bewegung
3. Schritte und Figuren
4. Musik und Rhythmus
5. Ein Tanz für das ganze Fest
6. Die erste Lehrmeisterin
7. Vom Tanz zur Kampfkunst
8. Eine Grundlage, viele Künste
9. Wissenswertes am Rande

## Bilder

Vier Szenen und zwei Heledd-Porträts liegen unter
`../../public/assets/drachentanz-volkstanz/`. Die vollständigen Prompts stehen in
`image-prompts.json`. Generiert mit dem eingebauten `image_gen`-Werkzeug.
Referenz: `../../../Stammbäume/assets/images/portraits/haus-draig/heledd-gwyvern.jpg`,
identisch mit dem vom Nutzer vorgegebenen Tumblr-Porträt. Die Bilder werden
vollständig angezeigt (`imageFit: contain`). Der bestehende Build kopiert
`public/assets` und das Featureverzeichnis mit.

Es handelt sich um einen lokalen, mit dem Projekt ausgelieferten Moduleintrag;
eine Firebase-Migration oder ein separater Import ist nicht erforderlich.

## Prüfung am 08.09.2026

Im lokalen Almanach mit einem frischen Headless-Edge-Profil geprüft: alle neun
Seiten über die Archivkarte und Kapitelreiter erreichbar; alle sechs Bilder
geladen; 64 Inhaltsblöcke einschließlich der Zitate mit der Vorlage abgeglichen;
Modulnormalisierung bei wiederholtem Editor-Durchlauf stabil. Stichproben der
Seiten 1, 6 und 9 bei 390 und 320 Pixeln ohne horizontalen Inhaltsüberlauf.
Keine JavaScript-Seitenfehler oder fehlenden lokalen Ressourcen. Externe
Dienste waren für den Test gesperrt; Firebase-Speicherung wurde nicht getestet.
