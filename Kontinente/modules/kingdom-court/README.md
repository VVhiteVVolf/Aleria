# Gemeinsame Königreichs- und Hofseiten

`page-template.mjs` rendert die statische Seitenschale anhand einer regionalen
Konfiguration: Reichsname, Navigation, Stammbaumziel, Assets und Buildkennung.
`court.css` besitzt ausschließlich die gemeinsame Darstellung dieser Seiten.
`office-directory.mjs` besitzt Ämterkarten, Gruppen und Suchfeld;
`offices-filter.js` deren lokale, progressive Suche ohne Netzwerkanfragen.
`court-entry.css` gestaltet die zwei kompakten Einstiege auf den Königreichsseiten.
Die Hauptseiten selbst verwenden weiterhin `koenigreich.css` und `world-codex`.

Cenyr behält seine eigenen Amts- und Nachfolgedaten sowie seine Einstiegspfade
unter `modules/cenyr-court/`. Dortige CSS- und Suchdateien sind kompatible
Weiterleitungen auf die gemeinsame Implementierung. Aldrimars Einordnung und
Vorlagen liegen ausschließlich unter `modules/aldrimar/`.

Andere Reichsseiten können die Seitenschale mit eigener Konfiguration nutzen.
Keine Region wird zur Standardquelle einer anderen. Weder Renderer noch Suche
lesen oder schreiben Firebase-Daten.
