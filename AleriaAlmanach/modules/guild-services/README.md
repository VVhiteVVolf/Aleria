# Aufgabenbereich & Service

Wiederverwendbare Modulvorlage `guild-services`, registriert als **Service-Template**.
Sie zeigt eine Einleitung, bebilderte Dienstkarten, Auftragsablauf, Bedingungen und
eine Fußzeile. Eine Karte besitzt `title`, `icon`, `description`, `clients`, `scope`
und `terms`. Es gibt keine Preisberechnung oder Kopplung an Inventar und Kampf.

`guild-services-data.js` normalisiert Daten und stellt die Defaultseite bereit.
`guild-services-renderer.js` verwendet die gemeinsame Inhalts- und URL-Sanitierung.
`guild-services-editor.js` verwendet dieselbe Zeilenschema-Engine in beiden
Editoren; skalare Felder aktualisieren ausschließlich den aktiven Seitenentwurf.
`guild-services.css` gehört nur zu dieser Vorlage und bricht auch in einer
schmalen Vorschau auf eine Spalte um.

Der zentrale Seiten-Sanitizer erhält `guildServicesPage` und `guildServices`.
Template-Registry, Import/Export, Vorschau, Icon-Wähler und Assetvalidierung sind
über die vorhandenen Schnittstellen angebunden. Die Windreiter liefern den
ersten ausgearbeiteten Anwendungsfall mit fünf lokal generierten Icons.
