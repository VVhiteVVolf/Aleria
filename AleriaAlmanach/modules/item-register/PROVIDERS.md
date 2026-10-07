# Anbieter nach Zunft und Region

Die Darstellung gehört zum Warenregister. `item-register-provider-directory.js`
führt die redaktionelle Zuordnung vorhandener Modul-IDs zu Gewerbe, Region und
Standort. `item-register-providers.js` verbindet diese Metadaten mit den aktuell
sichtbaren Angeboten und bildet die Gruppen. Ansicht und Gestaltung liegen in
`item-register-provider-view.js` und `item-register-providers.css`.

Die Gruppen bezeichnen Gewerbe, keine zusätzlich erfundenen Gildenmitgliedschaften.
Die regionale Zuordnung folgt dem Stammsitz, nicht den Absatzgebieten oder dem
Ursprung einzelner Produkte. Ein Anbieter erscheint genau einmal. Unbekannte
Anbieter bleiben unter „Weitere Sortimente / Ohne Ortszuordnung“ erreichbar.
Neue Zuordnungen werden anhand der stabilen Modul-ID im Verzeichnis ergänzt.
Angebots-IDs, Preise, Kaufbelege, Bestände und Warenrevisionen sind davon unabhängig.

Belegte Standorte:

- Gortach: Broch an Ear, Tír na Tonn, Fürstentum Leitheach; Brauereimodul.
- Teyrngarch: Aberon, Sonnenküste, Königreich Cenyr; Brauerzunft-Modul.
- Penderyn: Drakenburg, Vortigerns Ruh, Königreich Cenyr; Destillierzunft-Modul.
- Letzte Rast, Krumme Kanne, Lachende Nixe: Gwynthor, Celtigerns Wacht;
  Händlerverzeichnis in `Orte/.../Gwynthor/ort.data.js` und zugehörige Module.
- Roter Drache: Region Morddwr, Llamreis Ankunft, Celtigerns Wacht;
  Standortangabe des gespeicherten Tavernenmoduls.
- Owains Anwesen und zugehörige Herberge: Standortfelder bislang unausgefüllt;
  keine Region aus dem Namen oder der Familie ableiten.

Regionale Banner stammen aus `Stammbäume/assets/images/regions`, Gewerbezeichen
aus `IconOrdner` und dem Brauer-Modul. Bestehende Schilder werden weiterverwendet.
Bekannte Imgur-Originale werden auf bereits vorhandene lokale Kopien abgebildet;
ein im Modul neu gewähltes Zeichen hat weiter Vorrang. Das Schild des Roten
Drachen wurde unverändert von `https://i.imgur.com/MuwLhG4.png` lokal gesichert.
Das neue Schild von Owains Herberge einschließlich Prompt ist unter
`public/assets/item-register/providers` abgelegt.

Die Navigation startet eingeklappt. Ihr Zustand gehört zum lokalen Register-UI
und bleibt bei Suche, Sortierung und Datenabgleich erhalten. Es wird nichts
dazu in Firebase gespeichert. Persönliche Besitzlisten behalten ihre Darstellung.
