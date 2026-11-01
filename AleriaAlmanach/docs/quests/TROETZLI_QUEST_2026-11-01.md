# Der Städter und sein Pferd – erste ausgearbeitete Quest

Die bestehende Veröffentlichung bleibt die Quelle: `gwynthor-der-staedter-und-sein-pferd`
auf Gwynthors Anzeigetafel. Es entsteht kein zweiter Auftrag und kein zweiter
Auszahlungsanspruch. Die gemeinsame Questkennung lautet weiterhin
`notice:cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel:gwynthor-der-staedter-und-sein-pferd`.

Die Quest kann ohne angemeldete Abenteuergruppe aufgeschlagen werden. Cynddelw,
Trötzli, Tudur, Esyllt und Eirlys erscheinen mit ihren belegten Rollen und
Verweisen auf die bestehenden öffentlichen Figuren. Nach der letzten
Nutzerkorrektur erscheinen ihre vorhandenen Porträts als kreisrunde Ausschnitte
mit verzierten Rahmen. Die zuvor erzeugten Comicfassungen bleiben als Quellen
erhalten. Originalporträts, Bögen und Eigentumsverhältnisse bleiben unverändert.
Eirlys bleibt zehn Jahre alt. Trötzli wird geführt, nicht zugeritten.

## Reisevorbereitung

Die Kartenbreite beträgt nach Nutzerangabe **30 km**, bezogen auf die volle
horizontale Breite des Originalrasters **8192 × 6300 Pixel**. Die Höhe wird
nicht ebenfalls als 30 km behandelt. Die Kalibrierung beträgt `30 / 8192 km/px`.
Die gemeinsame Kartenvorlage erhält diesen Vorgabewert für unkalibrierte Entwürfe.

Die Straße wurde anhand des vorhandenen Rasters und der tatsächlichen Pins
vorbereitet. `build-troetzli-quest.mjs` verwendet dafür unverändert die echten
Funktionen aus `KartoLsbConfig` und `KartoLsbCalculations`.

| Vorbereitete Route | Entfernung | Gehzeit | Stopps und Übergabe | Gesamt ab Nordtor |
| --- | ---: | ---: | ---: | ---: |
| Direkter Nordweg | 6,55 km | 1 Std. 52 Min. | 45 Min. | 2 Std. 37 Min. |
| Über Owains Pferdehof | 7,33 km | 2 Std. 6 Min. | 60 Min. | 3 Std. 6 Min. |

Abholung, Vorbereitung und der nicht genauer verortete Stadtweg werden separat
mit etwa 30 Minuten angesetzt. Für Schreckreaktionen sind weitere 30–60 Minuten
Reserve sinnvoll. Rückweg und Belohnungsabholung sind nicht in der einfachen
Hinfahrt enthalten. Das ist der kürzeste der vorbereiteten Straßenwege, keine
behauptete globale Optimierung eines nicht vorhandenen vollständigen Wegenetzes.

Der Reiseplan lässt sich mit `questRoute=troetzli-nordweg` beziehungsweise
`questRoute=troetzli-owain` im bestehenden Reisetool ansehen. Die Vorschau klont
den Reisestate; sie veröffentlicht nichts und verschiebt keine echten Figuren.
Bestehende Reisegruppen bleiben erhalten. Eine anschließende bewusste Bearbeitung
benutzt die normale Speicherfunktion des Kartentools.

Zum Roten Tor, Afelwyn-Obstplantage, Gwerfil-Hof und Owains Pferdehof verweisen auf
echte Kartenmarkierungen. Räuber und Wölfe sind erzählerische Möglichkeiten,
keine kanonisch platzierten Gegner oder automatisch angelegten Kämpfe.

## Fortschritt und Schnittstellen

Die Questvorbereitung ist ein optionales, normalisiertes `dossier` an der
gemeinsamen Questdefinition. Quellprojektion, Bearbeitung und neue Durchläufe
erhalten dieses Feld. Die ursprüngliche Tafel bleibt direkt erreichbar.

Beim Aufbruch kann eine Gruppen-Landingpage und können Spielszenen verknüpft
werden. In verknüpften Szenen zeigt ein eigenes Custom Element die Quests und
den Standort jedes Mitglieds. Das normale Journalformular kann dort unmittelbar
geöffnet werden. Vorgegebene Kartenorte füllen Name, Karte und Pin gemeinsam aus;
freie Einträge bleiben möglich. Nur die ausgewählten Figuren werden bewegt und
zeitlich fortgeschrieben. Gewöhnliche Rollenspielbeiträge werden nicht gesperrt
oder nachträglich als Bewegung interpretiert. Kämpfe, Rast und Itemaktionen werden
weiterhin aus den bestehenden serverbestätigten Szenenbelegen gelesen.

Das Element beendet seine Listener beim Entfernen aus dem DOM. Ein erneuter
Szenenstand ersetzt einen gerade geöffneten Dialog nicht. Die bestehende
Modalspeicherung, historische Würfe und Live-Ressourcen werden nicht verändert.

## Belohnung und Gruppenkonto

Die Zusage bleibt **50 Kupferstücke, ein Notizbuch und Schreibutensilien**.
Das endgültige neu erzeugte Kupferbild ist ein schlichter Kupfertaler **ohne
Zahl**. Der tatsächliche Betrag steht daneben als Text. Änderungen am Betrag
ändern deshalb unmittelbar die Anzeige; bei anderen Währungen wird das Kupferbild
nicht irreführend verwendet. Das Bild ändert keine Währungsregeln.

Die bestätigte Verteilung kann einzelne Mitglieder, mehrere Mitglieder oder das
Konto der verknüpften Gruppen-Landingpage begünstigen. „Geld auf alle aufteilen“
rechnet in ganzen Pfennigen, erhält die Gesamtsumme, ist wiederholbar ohne
Vermehrung und dupliziert keine Gegenstände. „Alles zuweisen“ setzt Geld und
Gegenstände auf einen gewählten Empfänger oder die Gruppe.

Gruppen erhalten ein autoritatives `group_quest_accounts/{moduleId}` mit dem
gleichen Besitz-/Definitionsvertrag wie die persönlichen Belohnungen. Der Server
prüft die tatsächlich vorhandene Gruppen-Landingpage. Geld, Items, Unikatbelege,
Questquittung und der vorhandene tafelseitige Vergabeanspruch werden in derselben
Transaktion gebucht. Fehlt ein Empfänger, wird niemand teilweise ausgezahlt.
Ein erneuter Klick oder eine neue Vorgangskennung kann die Auszahlung nicht
wiederholen. Browser dürfen dieses Konto auch als GM nicht direkt verändern.

Die allgemeine Gruppen-Vorlage zeigt das Konto unter „Güter & Kasse“ und die
zugehörigen Abenteuerquittungen. Das bisherige manuelle Kassenbuch und die
redaktionelle Bestandsplanung werden nicht überschrieben oder fälschlich als
serverbestätigtes Guthaben zusammengezählt. Ausgaben und Weitergabe **aus** dem
neuen Gruppenbesitz sind eine separate künftige Erweiterung; die Auszahlung an
persönliche Inventare ist bereits voll verfügbar. Vollbackups schließen die
Gruppenkonten ein.

## Gestaltung und Bildquellen

Die Übersicht und die Questdarstellung wurden nach der Nutzerkorrektur als
illustriertes Abenteuerbuch gestaltet: Küstenpanorama, Pergament, Gesuchsbrief,
gerahmte Porträtmedaillons, gefalteter Reiseplan und Belohnungsillustrationen. Redaktion
und technische Verbindungshinweise stehen in der Schreibstube. Die Texte der
Questbeschreibung sprechen aus der Spielwelt.

Das breite Hauptbanner zeigt Gawain, Freya, Guinevere und Fenrir vor Gwynthors
Küste. Die vorhandenen Identitätsporträts und die echte Gwynthor-Karte wurden
angesehen und als Referenzen verwendet. Die zusätzliche Trötzli-Illustration
gehört ausschließlich zur eigenen Quest. Alle Bilder wurden mit dem eingebauten
Imagegen erzeugt; Prompts und Quellpfade stehen in
`assets/quests/art-manifest.json` und
`assets/gwynthor-troetzli/chibi/manifest.json`.

## Prüfung und Veröffentlichungsstand

Die isolierte Emulatorquest „Die verlorene Mühlenkiste“ prüft Reise, geteilte
Gruppe, einen echten kurzen Kampf, Beute, Itemaufnahme, Verbrauch, Rast,
Itemtransfers, Handel mit echtem Verkäuferguthaben, Abschluss und einmalige
Belohnung. Eine zusätzliche Probe zahlt 50 Kupfer und ein kanonisches Notizbuch
in das gemeinsame Gruppenkonto ein und erhält das manuelle Kassenbuch.

Browserproben prüfen den Reiseplan im tatsächlichen Kartentool, die Comicbilder
einschließlich Esyllt, die Standortpflege nur für ein ausgewähltes Mitglied,
Gruppenzuweisung und die Belohnungsübergabe. Aktuelle Ergebnisse stehen unter
`diagnostics/quest-system-2026-11-01/verification.json`.

Nur lokal umgesetzt und geprüft. Keine Live-Quest gestartet, kein echtes Pferd
übergeben, keine kanonische Belohnung vergeben und kein Push oder Deploy erfolgt.
Bei einer späteren Veröffentlichung gehören Functions, Regeln und Indizes zum
gleichen Release wie die Oberfläche.

Der lokale Releaseplan besitzt eine eigene Questprüfung. Der Katalog benennt
seine tatsächlich gelesenen Quelldateien; Änderungen an diesen Dateien, an
Reiseberechnung, Gruppen-Vorlage oder Questtransaktionen verwerfen den passenden
Prüfbeleg. Unabhängige Almanach-Oberflächen lösen die Questprüfung nicht unnötig
erneut aus. Der bestehende Veröffentlichungsweg bleibt erhalten.
