# Reise-Ladebildschirm

Gawain führt die Reisegruppe auf einer Hochlandstraße an. Freya, Guinevere und
Fenrir folgen. Die Figuren bewegen sich unabhängig vom Ladefortschritt.
Der Eintritt erfolgt per Klick oder Enter.

## Start und Freigabe

`loading-screen.js` startet vor den Anwendungsskripten. Es verwaltet den Dialog,
die Startschritte, den Fokus und die Pausenwahl. Der Almanach liegt in einem
`display: contents`-Container mit `inert` während der Ladeanzeige. Beim
Verlassen stellt der Dialog Sichtbarkeit, ARIA-Attribute und Fokus wieder her.
Ohne das Ladeskript bleibt der zunächst verborgene Dialog geschlossen.

Der Fortschritt zählt zwei bestätigte Schritte. `almanach:app-ready` meldet das
gerenderte Archiv. `almanach:initial-modules-settled` meldet den ersten
Modulabgleich oder die verfügbare Offline-Fassung. Bestätigte Bootstrap-Fehler
und ein bekannter Offlinezustand beenden die Verbindungswartefrist sofort.
Bestätigte Online-Daten gehen bei ihrer Ankunft durch den regulären Abgleich.
Die lokale Fassung ist ausdrücklich gekennzeichnet. Nach 15 Sekunden können
Leser das bereits gerenderte Archiv per Weiter-Schaltfläche betreten.
Bei einem Startfehler ist Neuladen möglich.

`window.load`, Bilder, Sprechblasen, Musik und die Figurenregister haben
keinen Einfluss auf die Eintrittsfreigabe. Die Anzeige hat keine künstliche
Mindestwartezeit.

## Illustration und Bewegung

Die Hochlandstraße hat AVIF-Fassungen für Desktop und Mobilgeräte sowie einen
WebP-Fallback. Eine transparente WebP-Datei enthält je vier vollständige
Laufposen von Gawain, Freya, Guinevere und Fenrir. CSS schaltet die Posen in
unterschiedlichem Takt um. Dadurch genügt ein gemeinsamer Abruf der Figuren.

`loading-screen-banter.js` zeigt gelegentlich eine Sprechblase zu einer Figur.
Die Zeilen orientieren sich an den Figurenquellen. Pausieren, ein unsichtbarer
Tab und der Eintritt beenden den laufenden Sprechblasen-Timer. Bei reduzierter
Bewegung bleibt die Reise zunächst statisch. Die manuelle Pausenwahl gilt
auch nach einem Tabwechsel.

Die mit dem eingebauten ImageGen erzeugten Originale liegen unter
`assets/loading-screen/source/`. Tatsächliche Prompts und Referenzpfade stehen
in `assets/loading-screen/journey-v5-prompts.json`.
`python modules/loading-screen/prepare-assets.py --journey-v5` benötigt Pillow
mit WebP- und AVIF-Unterstützung. Es erzeugt die aktiven Dateien unter
`public/assets/loading-screen/`, ein separates Vorschau-GIF und das Manifest
mit Maßen und SHA-256-Prüfsummen. Die früheren Landschaften und Puppenfassungen
sind als Quellen für ältere Versionen erhalten.

## Musik und Bedienung

`loading-screen-sound.js` lädt erst beim Öffnen des Dialogs. Es besitzt ein
eigenes Audioelement ohne vorgeladene Quelle. Der nutzerseitig bereitgestellte
Titel läuft als `ladebild-musik-v1.mp3` mit 219 Sekunden Spielzeit.
Bei erlaubtem Autoplay startet er automatisch. Andernfalls kann eine
Interaktion im Ladebildschirm die Wiedergabe starten. Der Musikschalter ist
auch per Tastatur erreichbar.

Der Ton blendet beim Start über sechs Sekunden und beim Betreten über
1800 Millisekunden. Nach dem Ausblenden werden Quelle und Listener freigegeben.
Ein Timer beendet das Ausblenden auch in Hintergrundtabs. `pagehide` gibt die
Wiedergabe sofort frei. Ein verspätetes Tonmodul startet außerhalb des
Ladebildschirms keine Musik. Tab und Umschalt-Tab bleiben im geöffneten Dialog.

## Prüfung

`npm --prefix AleriaAlmanach run test:startup` prüft Startsignale, Zeitüberschreitung,
Offlinebetrieb, Bedienung, Sprechblasen, Ton, Assets und den Modulabgleich.
Die Messungen und Browseraufnahmen stehen unter
`diagnostics/startup-journey-20261118/`.
