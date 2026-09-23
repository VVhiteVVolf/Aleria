# Luchd-Glèidhidh an Uisge Bheatha

**Die Hüter des Wassers des Lebens** liegen unmittelbar unter **Völker & Kulturen → Alben → Fianna**. Stabile Modul-ID: `uisge-beatha-hueter`.

## Inhalt

Die neue Hüter-Vorlage vom 23. September 2026 ist vollständig auf zehn Story-Seiten verteilt. Alle 159 nichtleeren Absätze einschließlich Titel und Zwischenüberschriften bleiben erhalten; der Titel steht im Modulkopf. Leere Absätze und eingefügte Schriftgrößen wurden entfernt, der offensichtliche Schreibfehler „Gäst“ zu „Gäste“ berichtigt.

Der ebenfalls angehängte Comann-Braich-Alba-Text ist nach vollständigem Vergleich identisch mit der vorigen Vorlage. Er bleibt im bestehenden Malzbund-Modul und wird hier nicht nochmals vervielfältigt. Der Zusammenhang beider Gemeinschaften wird im neuen Kapitel VI erläutert.

| Seite | Kapitel | Eigenes Szenenbild |
| --- | --- | --- |
| I | Die Hüter & ihr Erbe | Meurig und Maredudd teilen die Quaich |
| II | Verdienst & Berufung | Meurig bei einer Beratung über handwerkliche Verdienste |
| III | Tartan & Nadel | Die persönlichen Ehrenzeichen als Stillleben |
| IV | Aufnahme & die Quaich | Meurig befestigt nach dem gemeinsamen Trunk seine Nadel |
| V | Begegnung & Austausch | Meurig und Maredudd im lebhaften fachlichen Gespräch |
| VI | Comann, Hüter & Fianna | Hochlandhalle, Brennerei und schützende Burg |
| VII | Meurig & die Venalys-Fässer | Meurig bei der Ankunft geschlossener Fässer in Cenyr |
| VIII | Maredudd & die gerettete Geschichte | Maredudd trägt Aufzeichnungen und Erinnerungsstücke aus der brennenden Brennerei |
| IX | Alawyn & die Spuren im Ährental | Aufzeichnungen, Ehrenzeichen und Bogen als Erinnerungsstücke |
| X | Gedenken & was bleibt | Der leere Platz und die gemeinsam gefüllte Quaich |

Mitgliedschaft und Tragerecht sind persönlich und nicht erblich. Alawyns eigene Verdienste und ihre frühere Aufnahme bleiben ausdrücklich erhalten. In den Rettungsszenen tragen Meurig und Maredudd noch keine eigenen Hüter-Ehrenzeichen; Maredudd trägt den geretteten Tartan als gefaltetes Erinnerungsstück. Beider lebender Status wird nicht durch die Gedenkillustration verändert.

## Bildreferenzen

Die Originalporträts aus den veröffentlichten Stammbäumen wurden vor der Generierung angesehen und als direkte Referenzbilder übergeben:

- **Meurig Draig**, Charakter-ID `E8HXkgi2kdkXaqkxrnRo`, Weltperson `person--haus-draig--meurig-draig`: [Originalporträt](../../../Stammbäume/assets/images/portraits/haus-draig/meurig-draig.jpg). Kürzeres weißes Haar, spitzer Bart und vernarbtes geschlossenes linkes Auge.
- **Maredudd Draig**, Charakter-ID `ZGiDqxIwkkvOHzpnKmyk`, Weltperson `person--haus-draig--maredudd-draig`: [Originalporträt](../../../Stammbäume/assets/images/portraits/haus-draig/maredudd-draig.jpg). Zurückgestrichenes längeres weißes Haar, voller Bart, beide Augen offen, dunkle Rüstung und roter Mantel.

Die gemeinsamen Treffen und die unbenannten Nebenfiguren veranschaulichen die beschriebenen Bräuche. Sie ergänzen keine datierten Ereignisse, Ämter oder Stammbäume. Die grün-blau-bernsteinfarbene Darstellung des Tartans ist eine einheitliche bildliche Auslegung; die Vorlage legt keine verbindlichen Farben fest. Alawyns Seite verwendet ein Stillleben, kein erfundenes Personenporträt.

Alle zehn Bilder sind eigenständige Szenen im Format **2:3**, mit der integrierten Bildgenerierung im gewünschten Frieren-/Tales-of-Symphonia-Anime-Stil erstellt. Die [Bilddateien](../../public/assets/uisge-beatha-hueter/) und das [Manifest mit Prompts und Referenzen](../../public/assets/uisge-beatha-hueter/image-prompts.json) gehören zum Projekt.

## Einbindung

`uisge-beatha-hueter-data.js` enthält ausschließlich die gekapselte Registrierung und die redaktionellen Seitendaten. Der bestehende Archivbaum, das Story-Template sowie Navigation, Kommentare und Editor bleiben zuständig. Die zehn Seiten erhalten jeweils ihr eigenes Bild ohne Beschnitt (`imageFit: 'contain'`); eine zusätzliche Kommentarabschlussseite wird nicht erzeugt.

Es werden keine neuen globalen Zustände, Listener, Styles oder Firebase-Zugriffe eingeführt. Charakterdatensätze, Porträts und Stammbäume bleiben unverändert.

## Prüfung am 23. September 2026

- Vollständiger Abgleich der 159 nichtleeren Absätze, Titel und Zwischenüberschriften sowie Identitätsvergleich des erneut angehängten Malzbund-Textes.
- `npm run check:templates`: gemeinsame Asset- und Template-Verträge sowie JSON-Import bestanden.
- 20 lokale Browseransichten: alle zehn Seiten bei 1440 und 390 Pixeln; keine JavaScript-Fehler, fehlenden lokalen Ressourcen oder horizontalen Textüberläufe.
- Die effektive Archivzuordnung ist `Völker & Kulturen` mit dem Pfad `Alben → Fianna`. Eine bereits vorhandene Fianna-Kategorie wird verwendet; wiederholtes Laden erzeugt keine doppelten Einträge.
- JSON-Import und vollständige Editorform behalten alle zehn Texte, Bildpfade und Kapitelüberschriften. Keine zusätzliche Abschlussseite.
- Zehn unterschiedliche PNG-Dateien mit jeweils 1024 × 1536 Pixeln; alle Bildkompositionen werden ohne Beschnitt angezeigt.

Die Browserprüfung lief in einem frischen lokalen Kontext mit blockierter Firebase-Verbindung und ohne Speichern in Online-Daten.
