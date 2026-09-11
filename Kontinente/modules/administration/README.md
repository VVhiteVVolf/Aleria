# Verwaltungsansichten

Diese Komponente gehört allen bestehenden und künftigen Herrschaftsseiten. Gestaltungs- und Zuordnungsregeln stehen in [HERRSCHAFTSSEITEN-VORGEHEN.md](../../HERRSCHAFTSSEITEN-VORGEHEN.md).

- `administration-content.js`: zentrale Bereiche, lokale Organisationsicons und ausdrückliche Zuordnung zu den Dokumenten einer Herrschaft. Kein Rückfall auf fremde Verwaltungsinhalte.
- `administration-dialog.js`: Kachel-Aktionen, Dialog, Fokus, Navigation und Laden. Ein verspätetes Ladeergebnis darf keinen neu geöffneten Bereich überschreiben. Fehlerhafte Anfragen sind erneut ladbar.
- `administration-renderer.mjs`: Darstellung der Quelldokumente, Bereinigung alter Formatierungen, kompakte Angaben und Textabschnitte. Bestehende Aufgaben-Tabellen bleiben erhalten.
- `administration-hierarchy.mjs`: Adapter für Titel-/Portrait-/Namenszeilen zum gemeinsamen `territory-directory/council-directory.mjs`. Berücksichtigt leere Abstandsspalten, zusätzliche Ortszeilen und verschachtelte Titel. Nicht erkannte Formen bleiben vollständig als Tabelle sichtbar.
- `administration.css`: ausschließlich die einzeilige Bereichsauswahl; importiert `administration-dialog.css` für das Fenster.

Die HTML-Dateien unter `content/` bleiben die redaktionellen Quellen. Keine Namen oder Zuständigkeiten aus Bilddateinamen ableiten. Die kleine Hausbio und Personenverlinkungen bleiben von diesem Darstellungsadapter unabhängig.

## Noch nicht lokal zugeordnete Portraitquellen

Die folgenden Quellen ließen sich nicht eindeutig einer lebenden Person der vorhandenen Stammbäume zuordnen. Ihre Original-URLs bleiben bestehen. Bei einem Ladefehler zeigt die Ratskarte eine lokale Silhouette:

- Nicht benannter Küstenkommandant: `dd04a4d24a9a2758282d8a89698f033585d264f1.pnj`
- Gwenydd Anghof: `yEiU1My.png`
- Jinell: `YdNY8rx.png`
- Ceridwen Lhuyd: `yTbQ4Mq.png`
- Gwydion Seon: `QrGSnzO.png`

Die zusätzlich gefundenen Portraits, der Lebensdatenabgleich und die Nutzerkorrekturen an der Marschallhierarchie und den Ritterfürsten sind in [PERSONAL-KORREKTUREN.md](PERSONAL-KORREKTUREN.md) dokumentiert.

## Prüfung

`node Kontinente/tests/administration-scope.test.mjs` prüft die getrennten Quellen und bereits festgelegte Amtsträger.

`node Kontinente/tests/administration-dialog.browser.mjs` prüft die 16 Ansichten gegen einen lokalen Server auf Port 5500. Playwright kann über `PLAYWRIGHT_MODULE` und `PLAYWRIGHT_EXECUTABLE` bereitgestellt werden. `ADMINISTRATION_TEST_ORIGIN` überschreibt die lokale Adresse, `ADMINISTRATION_SCREENSHOTS` aktiviert optionale Screenshots. Externe Bildanfragen werden in der Prüfung gesperrt, um die lokalen Bilder und Silhouetten zu überprüfen.
