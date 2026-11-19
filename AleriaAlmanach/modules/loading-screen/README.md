# Almanach-Ladebildschirm

Beim Öffnen des Almanachs wird eine von vier Szenen ausgelost. Im selben Tab
wechselt die Szene beim nächsten Laden. Ohne verfügbaren Sitzungsspeicher bleibt
die normale Zufallsauswahl aktiv.

- Oweta, Lefraye, Rianna und Caralyn ziehen an Obstgärten, Flusswiesen und einem Dorf bei Gwynthor vorbei.
- Sir Duncan, Gawain, Ylva und Freki wandern durch Nadelwald und Gebirge am Wasserfall entlang.
- Idwal und Trevor gehen von den Küstenklippen zum Hafen.
- Iestyn, Gareth, Trahern, Cadogan, Cadfan, Neala und Branwen beraten in der Kammer des Herolds über Cadogans Hut.

Der Eintritt erfolgt per Klick oder Enter. Die Animation läuft unabhängig vom
Ladefortschritt.

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

`loading-screen-scenes.js` wählt die Szene und lädt ihr Hintergrundbild und
ihren Bilderbogen. Die drei Reisen verwenden je vier Laufposen pro Figur und
ein Panorama, dessen Ränder beim Durchlaufen weich ineinander übergehen.
In der Heroldskammer bleibt die Kamera fest. Beim Sprechen wechselt die aktive
Figur zwischen drei Mund- und Handgesten. Cadogan hält den Hut in allen vier
Posen in der Hand.

`loading-screen-quotes.js` enthält vier Gesprächsauszüge in ihrer ursprünglichen
Reihenfolge. Owetas Quartett plant den Aufbruch zum Tirfelyn-Hof. Gawain,
Duncan, Ylva und Freki sprechen nach dem Übungskampf. Idwal und Trevor
besprechen den Verlust ihres Navigators. In der Kammer des Herolds geht es um
Cadogans Hut. Zu jeder Zeile sind der Quellkommentar, der Szenenthread und der
zugehörige Abschnitt verzeichnet.
`loading-screen-banter.js` zeigt die Sprechblasen in Reihenfolge über der
zugehörigen Figur. Pausieren, ein unsichtbarer Tab und der Eintritt halten
Animation und Sprechblasen an. Bei reduzierter Bewegung startet jede Szene
statisch. Die manuelle Pausenwahl gilt auch nach einem Tabwechsel.

Die mit ImageGen erzeugten Originale liegen unter `assets/loading-screen/source/`.
Prompts und Referenzpfade stehen in `assets/loading-screen/journey-v6-prompts.json`.
`python AleriaAlmanach/modules/loading-screen/prepare-assets.py --journey-v6`
benötigt Pillow mit WebP- und AVIF-Unterstützung. Es erzeugt die aktiven Dateien
unter `public/assets/loading-screen/` und das Manifest mit Maßen und
SHA-256-Prüfsummen. Die Hintergründe haben AVIF-Fassungen für Desktop und
Mobilgeräte sowie einen WebP-Fallback.

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
Offlinebetrieb, Szenenauswahl, Bedienung, Sprechblasen, Ton, Assets und
Modulabgleich. Quellabgleich und Browseraufnahmen der aktuellen Fassung stehen
unter `diagnostics/startup-journeys-20261119/`.
