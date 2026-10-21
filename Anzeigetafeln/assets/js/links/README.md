# Modulverweise in Gwynthorer Anzeigen

Der reine Katalog `notice-module-links-model.mjs` benennt tatsächlich vorhandene
Module und eindeutige Erwähnungen. Die DOM-Projektion in `notice-module-links.js`
ergänzt Verweise nur für Gwynthors Tafel. Sie bearbeitet Textknoten in einem
lokalen Fragment, erhält Wortlaut und Formatierungen und überspringt vorhandene
Links. Keine Änderungen an gespeicherten Anzeigen, keine Textmigration und
keine neuen Datenbankzugriffe. Faktenfelder verwenden denselben Projektor.

Unbenannte Verleiher und bloße Begriffe wie „Haus“ erhalten keine Zuordnung.
Das verhindert vorweggenommene Questauflösungen. Für Glannadeor oder Castell
Rhewglyn existiert derzeit kein entsprechendes Almanach-Modul; keine erfundenen
Ziele setzen. Bestehende Links bleiben erhalten, sofern sie auf einen lokalen
Almanach-Eintrag verweisen; andere URLs und Ereignisattribute werden bereinigt.

`AleriaAlmanach.html?entry=<stabile-ID>` öffnet über
`modules/archive/archive-entry-links.js` nach `almanach:app-ready` die vorhandene
Archivnavigation. Der Reader öffnet sie in einem neuen Tab, damit das Gesuch
offen bleibt. Kein zusätzlicher Navigations-State und keine Modul-Duplikate.

Prüfung: `notice-module-links.test.mjs` und `notice-module-links.browser.mjs`.
