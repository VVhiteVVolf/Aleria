# Gawain & Duncan

Dieses Feature besitzt ausschließlich den öffentlichen biografischen Abgleich
Gawains und die redaktionelle Ausarbeitung der bestehenden Gruppe `gawain-duncan`.
Originalquellen und kommentargenaue Belege liegen getrennt unter `source/`.
Private Dossiers wurden weder gelesen noch herangezogen.

`withGawainDuncanContent(entry)` ist eine reine, einmalige Quellprojektion mit
Versionsmarker. Modul-ID, alle fünf Seiten und deren Threadkeys 0–4 bleiben
erhalten. Die Hierarchie enthält Duncan über Gawain. Ylva, Freki sowie die beiden
eigenen Reitpferde Tanor und Carreg stehen mit ihren tatsächlichen Charakter-
beziehungsweise Kreatur-IDs als Gäste außerhalb dieser Hierarchie. Version 2
ergänzt bei bereits ausgearbeiteten Seiten ausschließlich fehlende Pferdegäste;
angepasste vorhandene Gäste und alle übrigen Seitenfelder bleiben erhalten.
Die automatische Inventarprojektion führt keine doppelten Pferde hinzu. Ungebundene Platzhalter
begründen keinen zusätzlichen Tierbesitz. Vorhandene aktive Sitzungen, Kasse,
Bestände und eigenständige Notizen werden erhalten. Offenkundige leere
Vorlagenzeilen und der Vorlagenbetrag „12 GM“ werden nicht als Spielstand behandelt.
Nach der ersten Übernahme haben spätere Bearbeitungen Vorrang.

Die gemeinsame `AleriaGroupAdventures`-Fassade bindet die Projektion ein.
`gawain-public-biography.mjs` ist die gemeinsame Textquelle für Steckbrief,
Charakterdatenbank und Draig-Stammbaum. Die Laufzeitprojektion ersetzt nur den
bekannten alten Einzeiler, den alten Titel und eine inhaltlich leere Biografie.
Individuelle spätere Texte bleiben erhalten. Identität, Inventar, Kampfprofil,
Ressourcen und historische Kommentare werden dadurch niemals verändert.

`node AleriaAlmanach/scripts/build-gawain-duncan-content.mjs` erzeugt einen
prüfbaren Moduleinzelexport sowie einen partiellen Charakterexport, der nur
biografische Felder enthält. Die zentralen Charakter-/Familienprojektionen
werden anschließend im abgestimmten gemeinsamen Build aktualisiert. Dieser
Schritt ist kein Firebase-Schreibzugriff und keine Veröffentlichung.

Der gezielte öffentliche Abgleich verwendet anschließend diese beiden dauerhaft
prüfbaren Builder vom Repository-Stamm aus:

```powershell
node AleriaAlmanach/scripts/build-gawain-family-snapshot.mjs
node AleriaAlmanach/scripts/build-gawain-character-database.mjs
```

Beide unterstützen `--check`. Ihre reinen Projektionen liegen in
`gawain-family-snapshot.mjs` und `gawain-character-database.mjs`. Die gemeinsame
Textquelle bleibt `gawain-public-biography.mjs`; der Datenbank-Builder liest ihren
partiellen öffentlichen Charakterexport. Der Familien-Builder übernimmt nur
Gawains öffentliche Personenfelder samt deren registrierter Quellrevision, legt
alte und neue Fassung gemäß Familienpolicy ab und gleicht genau einen
Registereintrag ab. Die übrige Familie wird dabei nicht neu abgeglichen.

Der Datenbank-Builder verwendet `mergeCharacterRecordProjections` auf dem
vorhandenen Bestand. Er aktualisiert nur Gawains Biografiefelder und die
zugehörigen Herkunftsbelege. Alle übrigen Figuren, Ablagepfade, Klassifikationen,
lokalen Notizen, Inventare und Kampfprofile bleiben erhalten. Er ersetzt keinen
allgemeinen Archivimport. Für diesen Stand ist ein allgemeiner Sync absichtlich
nicht ausgeführt worden, weil er zusätzliche, unabhängige Familienzuordnungen
und damit Ablagewechsel vorbereiten würde.

Die Erhaltungsprüfung vom 1. November 2026 liegt unter
`diagnostics/group-system-integration-2026-11-01/gawain-preservation-result.json`:
255 unveränderte Figuren-IDs und unveränderte Inventar-/Kampfprofil-Hashes,
genau eine geänderte Personenakte sowie 176 unveränderte Familiennachbarn.
