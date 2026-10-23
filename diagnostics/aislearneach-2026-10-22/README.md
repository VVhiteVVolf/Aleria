# Abschlussprüfung – Aislearneach, Blaithneach, Ceitheach, Dunkelhain

Stand: 22. Oktober 2026. Quellen und offene Angaben stehen im
[Übernahmeprotokoll](../../Karten/Aislearneach/ABGLEICH.md).

- 110 Kartenprüfungen und 156 Kontinent-/Herrschaftsprüfungen erfolgreich.
- Neun neue Karten im Browser geöffnet: Bildgrößen, 360 Pins und 74 Grenzobjekte
  entsprechen dem Quellenabgleich (`browser-verification.json`, `verifiedMaps`).
- Alle 45 neuen Seiten im Browser geprüft: erwartete Clanregister, direkte
  Unterherrschaften, keine fehlgeschlagenen sichtbaren Bilder, kein horizontaler
  Überlauf. Alle 344 detaillierten Orte sind über die Seiten erreichbar.
- Hauptkarte → Geach-Detailkarte durchgeklickt. Bluthand-Text über Kartensuche
  geöffnet und vollständig angezeigt; Carraigreach im Dunkelhain geöffnet.
- Schmale Ansicht in echten eingebetteten Dokumenten mit 390 und 768 Pixeln
  Rahmenbreite geprüft. Die Dokumente nutzen nach Abzug der Scrollleisten
  375 bzw. 753 Pixel; kein horizontaler Überlauf, alle 13 bzw. 19 Familienkarten.
- Alle fünf Regionsbanner Aislearneachs im Browser geladen.
- 22 zusätzliche Ratsbilder visuell auf einer Kontaktübersicht geprüft.
- SHA-256-Vergleich: alle 39 zuvor vorhandenen Karten unverändert.
- Builder der zehn betroffenen Seitenmodule, Alben-Übersicht, neue Karten und
  bestehende Leitheach-Karten mit `--check` geprüft. `git diff --check` erfolgreich.

Die Mitschnitte enthalten einen Fehler einer fremden Chrome-Erweiterung beim
Import ihrer `main.tsx`-Datei. Er stammt nicht aus Aleria. Die geprüften Seiten
wurden vollständig geladen. Große lokale Belege wurden einzeln gespeichert,
nachdem die Browserverbindung bei einem gebündelten Formularinhalt abbrach.

Die Prüfdateien `karten-tests.tap`, `kontinente-tests.tap` und
`protected-maps.json` sichern die abschließenden Ergebnisse.

![Clanregister Aislearneach](aislearneach-clans.jpg)

![Regionsbanner und Unterherrschaften](aislearneach-banners.jpg)

![Schmale Registeransichten](mobile.jpg)

Kein Push und kein Deployment.
