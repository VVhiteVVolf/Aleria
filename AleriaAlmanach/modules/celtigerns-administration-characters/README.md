# Fehlende Verwaltungsfiguren Celtigerns Wacht

`administration-roster.json` begrenzt diesen Autorenbestand auf 19 vor dem
Abgleich fehlende Onlinefiguren der acht bestehenden Bereichsquellen. Brenric
Coeddu besitzt einen eigenen Autorenexport. Die 49 bereits vorhandenen Personen
werden nicht erneut exportiert. Vasallenräte und territoriale Kontaktkarten
sind kein zusätzlicher Importumfang dieses Bestands.

`administration-characters.mjs` verwendet die kanonischen Familienkandidaten,
vorhandene vollständige Biografien, bekannte Personennotizen und die bestehenden
Amtsbeschreibungen und Aufgabenprofile. Es ergänzt keine Ereignisse, Ämter,
Besitzstücke oder Kampfwerte. Überlieferte, wahrscheinliche und adoptive
Abstammung werden nicht zu bestätigter biologischer Elternschaft umgedeutet.
Unbenannte Personen bleiben unbenannt. Gwenydd Anghof und der Vikar Torri
erhalten eigenständige Amtsidentitäten ohne erfundene Stammbaumfamilie.

Euddogwys vollständige lokale Akte gehört weiterhin zum Feature
`gwynthor-formlingssache`. Sie wird beim begrenzten Import bytegleich erhalten;
seine vorhandene Biografie wird für die fehlende Onlineakte wiederverwendet.
Die übrigen 18 Autorenakten werden bei jedem Lauf aus ihren kanonischen Quellen
neu aufgebaut. Nur diese 18 werden lokal über den vorhandenen
`importAuthoredCharacters` importiert. Ffraid Awenors männliche Amtsbezeichnung
folgt seiner bestehenden Familienidentität als Ritterherr.

`administration-artwork.json` enthält die bestätigten öffentlichen Medien.
Meredydd Gwyllach erhält seine drei vorhandenen 9er-Sets; die anderen Personen
besitzen ihr vorhandenes Standardporträt. Die Bildbibliothek wird mit dem
nativen Image-Set-Modell serialisiert. Feste Autorenzeitstempel machen den
Export wiederholungsfest.

```powershell
node AleriaAlmanach/scripts/build-celtigerns-administration-characters.mjs --plan
node AleriaAlmanach/scripts/build-celtigerns-administration-characters.mjs --write
node AleriaAlmanach/scripts/build-celtigerns-administration-characters.mjs --check
```

Der Plan bindet den Schreibvorgang an die drei aktuellen Datenbankprojektionen
und die konkreten Quellenhashes. Der Import prüft alle fremden Aktenbytes vor
und nach dem Schreiben. `administration-sources.json` benennt die 19 nativen
Einzelexporte mit Weltidentitäten, bekannten Namensvarianten und Dateihashes.
Der Builder führt keine Firebase-, Git- oder Deploymentoperation aus.

Identitätsaudit und unabhängige Fachprüfung liegen unter
`diagnostics/brenric-kriegswart-20261107/`; die Bildaufnahme ist unter
`diagnostics/celtigerns-administration-20261107/artwork/` belegt.
