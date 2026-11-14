# Szenenelemente

Die bestehende Erzählerwerkstatt bietet fünf Elementarten. Menü, Vorschau und
Szenenleiste verwenden dieselben eigenen roten/goldenen Medaillonicons.

| Art | Verhalten |
| --- | --- |
| Herausforderung | Vorhandene Proben, Ergebnisstaffeln und Wirkungspakete; bisherige Daten bleiben verwendbar. |
| Erzählelement | Titel, Bild und Flavortext ohne Probe, erforderliche Reaktion oder mechanische Folgen. |
| Gegenstand | Öffentliche Präsentation mit Proben und bewusster Interaktion; optional verzögert freigegebene Reaktion. Die Präsentation überträgt keinen Besitz. |
| Rätsel | Großes Fenster mit Bild/Text und mehreren erlaubten Fertigkeits-, Attributs- oder Rettungswürfen. Standardmäßig genügt ein erfolgreicher Lösungsweg. |
| Gefahr | Verdeckte Vorbereitung, Auslöser, Entdeckungsbeleg und eine einmalige Reaktion der gewählten Figur. |

## Bedienung

Im roten Dialog zunächst die Art wählen, dann sichtbaren Inhalt, Lösungswege und
gegebenenfalls „Auslösung & Entdeckung“ vorbereiten. „Versuchen“ öffnet die
bestehende Probenauswahl und übergibt die gewählte Probe an den Beitragseditor.
Erst „Eintragen“ führt den Versuch aus. Vorhandene Textentwürfe und die handelnden
Figuren bereits geschriebener Abschnitte bleiben erhalten. Für eine neue leere
Reaktion wird die betroffene Figur ausgewählt.

Die rechte Leiste zeigt Gegenstände, Rätsel und freigegebene Gefahren; ein
Häkchen kennzeichnet abgeschlossene Elemente. Der obere Pfeil klappt die Leiste
ein oder aus. Eingeklappt bleibt ein kleiner Knopf mit Anzahl sichtbar. Diese
persönliche Browserauswahl gilt auch nach Szenenwechsel/Neuladen und wird zwischen
Tabs synchronisiert. Sie schreibt keine Szenen- oder Spielfelder.
Ist der Kommentarbereich sehr niedrig, etwa auf einem kleinen Handy während
eines Kampfes, bleibt ein einzelner Griff sichtbar. Er öffnet eine große Auswahl
mit den öffentlichen Elementen. So verdeckt der Klappknopf keinen Eintrag;
reicht selbst dafür die Höhe nicht aus, sitzt er neben der Einleitung und hält
die Kommentarsuche frei. Bei mehr Platz gilt wieder die gespeicherte normale
Leistenansicht.

„Vorbereitungen verwalten“ zeigt die gemeinsame Autorenansicht: Bearbeiten,
Deaktivieren und erneut Scharfschalten. Erneutes Scharfschalten setzt Zähler und
gespeicherte Interaktionen zurück und prüft vorhandene passive Beobachter sofort.
Bereits ausgelöste Elemente lassen sich nicht erneut scharfschalten. Ihre
veröffentlichte Karte bleibt unter derselben Kommentar-ID bearbeitbar; gespeicherte
Auswertungen und bereits angewandte Folgen werden dabei nicht neu berechnet.

## Bedingungen und Entdeckung

- Bis zu sechs Bedingungen lassen sich mit **alle (UND)** oder **mindestens eine
  (ODER)** verknüpfen: neue Figurenbeiträge, ein passiver Fertigkeitswert oder eine
  ausdrückliche Interaktion mit diesem Element/einem vorhandenen Gegenstand/Rätsel.
- „Mindestens 21“ entspricht „über 20“. Wahrnehmung verwendet die echte passive
  Wahrnehmung einschließlich eigener passiver Boni; andere passive Fertigkeiten
  verwenden 10 + ihren tatsächlichen Probenwert. Sinnes- und Handlungssperren gelten.
- Gezählt werden neue, servergespeicherte Figurenkommentare seit Scharfschaltung,
  je Dokument einmal. Vorhandene Kommentare, Bearbeitungen, Imports, Erzählertexte,
  Systemkarten, Signale und Interaktionsquittungen zählen nicht. Eine verspätete
  Zustellung eines alten Interaktionsereignisses erfüllt keinen neuen Auslöser.
- „Jetzt interagieren“ ist eine ausdrückliche Handlung mit einer bereits in der
  Szene beteiligten Figur. Die Quittung wird auch ohne zugeordnete Falle gespeichert.
  Ein gewöhnlicher Lösungsversuch ist keine zusätzliche implizite Berührung.
- Die Zielwahl verwendet tatsächliche Beteiligte, fest oder zufällig. Bei zufälliger
  Wahl hat der passende gespeicherte Interaktor Vorrang. Auch eine gelatchte
  Interaktion bleibt erhalten, wenn ein späterer Beitrag erst die UND-Bedingung erfüllt.
- Eine erfüllte passive Bedingung entdeckt die Gefahr bereits und kann die Gruppe
  warnen. Andernfalls verwendet die optionale verdeckte Entdeckungsprobe den normalen
  Fertigkeitsdienst. Die veröffentlichte Karte enthält den gespeicherten Beleg und
  den vorbereiteten Text. Erkannt: Vorteil; unbemerkt: Nachteil auf die Reaktion.
  Weitere geltende Vor-/Nachteile werden nach den vorhandenen Regeln verrechnet.
- Unter „Ursache und Gefahr“ lassen sich die normalen Rettungswurfkontexte
  festlegen: Ursache, Schadensart und konkrete Gefahren wie Furcht, Vergiftung,
  Blutung, Zu-Boden-Werfen oder erzwungene Bewegung. Die Reaktion übernimmt diesen
  Kontext serverseitig; die reagierende Figur kann ihn nicht ersetzen.

## KI-Startpaket

„KI-Vorlage + Anleitung“ lädt ein kompaktes, eigenständiges Startpaket für eine
fremde KI herunter. `guide.copyPrompt` kann zusammen mit der eigenen Idee direkt
verwendet werden. Das Paket erklärt den Almanach, Szenen und Beitragsabschnitte,
alle fünf Elementarten, Proben und bedingte Figurenregeln, Auslöser, Entdeckung,
Belohnungen, Zustände, direkte Wirkungen und die Grenzen des Importformats.
Vollständige importierbare Beispiele helfen beim sofortigen Einstieg.

Die aktuelle Szeneneinleitung, öffentliche Interaktionsquellen und der vorhandene
Entwurf werden ergänzt. Figuren-/Warenreferenzen beschränken sich auf relevante
Teilnehmer, ausgewählte Ziele und im Entwurf verwendete Waren. Ganze Bögen,
Biografien und Kommentarverläufe sind nicht Bestandteil des Startpakets.
Eine KI darf fehlende IDs oder Lore nicht erfinden. Unter „Mehr KI-Details“ steht
optional die vollständige Referenz mit dem gesamten geladenen Warenkatalog und
Spezialsyntax, etwa Waffenmanövern, bereit.

Zunächst kann die KI eine Idee in normalem Text ausarbeiten. Auf „Import-JSON“
liefert sie genau ein Objekt mit `format`, `version` und `challenge`. Der vorhandene
JSON-Import prüft dieses Objekt und lädt einen lokalen Entwurf. Mehrere verbundene
Elemente werden nacheinander gespeichert; für Verknüpfungen wird anschließend die
tatsächliche `sourceId` des ersten Elements verwendet. Es gibt keine automatische
Kontaktaufnahme mit einer KI und keinen automatischen Veröffentlichungsschritt.

## Verantwortlichkeiten

`scene-element-model.js` normalisiert/validiert; `scene-element-conditions.js`
berechnet reine Bedingungen. Autorenfelder, öffentliche Darstellung,
Browserpräferenz und Dialogsteuerung liegen in getrennten Modulen. Die
Herausforderungs-, Fertigkeits-, Inventar- und Kampfmodule besitzen weiterhin
Proben, Ausbildung, Eigenschaften/Marotten, aktive Zustände, Ressourcen,
Wirkungspakete und atomare Belohnungen. Auch die Entdeckung nutzt diese Dienste;
ihre Quittung verbraucht keine zusätzliche Beitragsdauer oder Kampfaktion.

`firebase/functions/src/scene-elements/` besitzt private Vorbereitung,
Interaktionsquittung, Auswertung und Callable/Firestore-Trigger. Private Definition
und sichere öffentliche Signalkarte werden getrennt gespeichert. Direkte Clients
erhalten durch die bestehenden Regeln keinen Zugriff auf `scene_elements`.
Angemeldete gemeinsame Autoren dürfen die ausdrückliche Verwaltungsansicht
verwenden. Die vorhandene Rollenprüfung für mechanische Belohnungen bleibt bestehen.

Auslösung, Zielwahl, Würfelbeleg und veröffentlichte Karte werden je Element in
einer Firestore-Transaktion gespeichert. Deterministische Dokumentkennungen,
Vorgangskennungen, Revisionen und bestehende Anspruchsbelege verhindern doppelte
Auslösungen/Folgen bei Wiederholung oder Konkurrenz. Maximal 50 vorbereitete
Definitionen pro Szene. Bereits öffentlich freigegebene Herausforderungen behalten
das vorhandene Speicherformat ihrer Ergebnisdefinitionen; diese Erweiterung ist
keine neue Verschlüsselung veröffentlichter Ergebnistabellen.

## Prüfbelege und Veröffentlichung

Professionell überarbeiteter Auftrag, lokale Fachtests, Browserbilder,
Emulatortransaktionen und genaue Grenzen stehen unter
[`diagnostics/scene-elements-20261113`](../../../diagnostics/scene-elements-20261113/README.md).
Eigene Icons, erhaltene Originale und öffentliche Hashes stehen im
[`art-manifest.json`](../../assets/scene-elements/art-manifest.json);
vollständige tatsächliche Generatorprompts bleiben im Diagnoseordner.

Die Implementierung ist lokal. Ein späterer freigegebener Release muss Frontend,
gemeinsame Mechanikprojektion und die Backendexporte `commitSceneElement` sowie
`evaluateSceneElementComment` gemeinsam berücksichtigen. Es wurden keine
produktiven Szenen, Figuren oder Inventare verändert.
