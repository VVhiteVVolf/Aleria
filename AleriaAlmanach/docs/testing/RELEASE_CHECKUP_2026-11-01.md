# Vertiefter Veröffentlichungscheck — 1. November 2026

Der Nutzer hat Push und Deployment des gesamten aktuellen öffentlichen lokalen
Stands nach einem vertieften Check freigegeben. Dieser Bericht ergänzt den
[Systemcheck](SYSTEM_CHECKUP_2026-11-01.md) und den
[Gruppenabschluss](GROUP_SYSTEMS_2026-11-01.md).

## Vor dem Release gefundene und korrigierte Fehler

- Normale Geld- und Warenübergaben konnten bei älteren widersprüchlichen
  Inventarflags eine gespeicherte Waffenwahl verändern. Gemeinsame selektive
  Bindungsprojektionen ändern ausschließlich tatsächlich betroffene Ausrüstung.
  Auch verbleibende ältere Ausrüstungsstapel behalten ihre bestehenden Slots.
- Einkauf, Verkauf, Zuteilungen und Belohnungen verwendeten ebenfalls eine
  vollständige Profilnormalisierung. Geld und Verbrauchsgüter schreiben jetzt
  keine unbeteiligten Kampfprofile oder deren Revisionen neu. Echte neue
  Ausrüstung wird weiterhin eingebunden; getragene Ausrüstung bleibt geschützt.
- Lesende Kampfauswertung bewahrt die gespeicherte Aufstellung und löst trotzdem
  die richtige gepinnte Itemversion auf. Eine Szenenaufnahme ergänzt nur die
  tatsächlichen neuen Ausrüstungsbindungen; unbeteiligte Rohdaten bleiben erhalten.
- Questangebote berücksichtigen nun den Aushangzeitraum und das Tafel-Papierarchiv
  auch ohne die auf Tafelseiten vorhandene globale Archivfassade. Historische
  Questakten, aktive Durchläufe und freie Rollenspielbeiträge bleiben erhalten.
- Drei tote Questlinks auf Karten und Tafeln führen zu den vorhandenen zentralen
  Einstiegen. Die Tafelbelohnungen verweisen wieder auf die aktuellen Versionen
  von Notizbuch und Schreibutensilien.
- Rohquellen der neuen Gruppenmodule, lokale Szenensicherungen und die
  Münzgenerierungsprotokolle bleiben im Quellrepository, gelangen jedoch nicht
  in das statische Webpaket. Aktive Bilder und Originaldateien bleiben erhalten.

Die vermutete doppelte Pferdequest-Auszahlung wurde anhand der tatsächlichen
Quellen widerlegt: Tafel und Quest benutzen denselben `notice:`-Schlüssel.
Zusätzliche Regressionen prüfen beide Auszahlungsreihenfolgen. Es wurde keine
pauschale Sperre für wiederholbare freie Quests eingeführt.

## Erhaltung und Prüfverfahren

Die Gegenproben verwenden synthetische Figuren beziehungsweise Kopien
öffentlicher Bestände in getrennten lokalen Firestore-Demoprojekten. Vorher rote
Regressionen belegen die tatsächlichen Fehler; anschließend werden echte
Transaktionen, Profilgleichheit, Waffenwahl, Besitz, Ressourcen, Quittungen und
alte Belege geprüft. Produktive Kampf-/Inventartransaktionen dienen nicht als
Deployment-Smoke-Test.

Die 255 öffentlichen Charakter-IDs sowie sämtliche Inventar- und
Kampfprofil-Hashes wurden unabhängig gegen den Vorherstand geprüft. Private
Dossiers und lokale Browserentwürfe bleiben außerhalb von Repository und
Webpaket. Es erfolgt keine pauschale Altbestandsmigration und kein Backup-Restore.

Aktuelle Logs und maschinenlesbare Ergebnisse liegen unter
`diagnostics/release-checkup-2026-11-01/`. Der konkrete Firebase-Vorherstand,
die begrenzten Befehle und der lesende Nachherprüfer sind in
`diagnostics/group-system-integration-2026-11-01/FIREBASE_RELEASE_READINESS.md`
dokumentiert. Abschlusszahlen und tatsächliche Deploymentbelege werden dort
beziehungsweise im vorhandenen Releasezustand festgehalten.

Der vollständige gemeinsame Vorlauf besteht mit nativem Exitcode 0: **39 von
39 Fachbereichen**, einschließlich der vollständigen Prüfung der 531
bereitgestellten Stammbaumansichten. Unabhängig davon bestehen **2.072
Frontendtests**, **330 Servertests** und **acht zusätzliche echte
Firestore-Integrationsfälle**. Verschiedene Läufe werden nicht zu einer
vermeintlichen Gesamttestzahl addiert. **237** geteilte Regelmodule sind in
Browser- und Serverkopie bytegleich.

Auch zuvor veraltete Ableitungen sind abgeglichen: Skallis Folio, Esyllts reine
Ortsmetadaten, Penrudds Ortsbezeichnung auf der Karte, das Wappenregister und
die Wirtschaftsreferenzen. Alle 170 Kartenpins bleiben vollständig erhalten;
bei den 269 Standardpreisreferenzen ändern sich ausschließlich die drei
freigegebenen Gegenstandsnamen, keine Preise. Twyllods Quellen- und
Auftragsnotiz bleibt bewahrt. Die historischen Familienprüfsummen bleiben
unverändert; eng validierte Prüfprojektionen berücksichtigen ausschließlich
Penrudds neue Orts-Revisionsmetadaten und Gawains freigegebene öffentliche
Biografie. Alle 538 geschützten historischen Familienakten stimmen danach
weiterhin mit dem alten Prüfbestand überein.

## Abgestimmte Veröffentlichung

Firebase und Netlify sind getrennte Veröffentlichungen. Die neun neuen und die
betroffenen bestehenden Functions müssen gemeinsam verfügbar sein; die zehn
Default-Indizes müssen aufgebaut und die Default-Regeln aktuell sein, bevor die
neue Oberfläche veröffentlicht wird. Die nicht vorhandene benannte
`family-trees`-Datenbank wird nicht angelegt. Die gleichnamige Functions-Codebase
ist ausdrücklich keine Datenbankauswahl.

Der Git-/Netlify-Release verwendet den bestehenden geprüften Weg mit
`[skip netlify]`, normalem Push ohne Force und unveränderlicher Momentaufnahme.
Aktiver Deploy, Dateihashes und Functions werden danach kontrolliert. Die
allgemeine Netlify-Automatik für Web-Publisher bleibt eingeschaltet.

Die im ursprünglichen Systemcheck benannten weiteren Ausbauarbeiten, insbesondere
der koordinierte Gesamtbackup-Restore, werden nicht durch einen produktiven
Datenimport als Nebenwirkung dieser Veröffentlichung ersetzt.
