# Almanach-Ladebildschirm

Beim Öffnen des Almanachs wird eine von elf Szenen ausgelost. Im selben Tab
wechselt die Szene beim nächsten Laden. Ohne verfügbaren Sitzungsspeicher bleibt
die normale Zufallsauswahl aktiv.

- Oweta, Lefraye, Rianna und Caralyn stehen im Chibi-Stil im Innenhof von Castell Draig und planen ihren Besuch am Tirfelyn-Hof.
- Sir Duncan, Gawain, Ylva und Freki wandern durch Nadelwald und Gebirge am Wasserfall entlang.
- Idwal schlägt im Gartenbezirk auf die zerbrochene Teekanne. Talon versucht ihn zu beruhigen und Trevor lacht. Über „Spielen“ beginnt die Rosenflucht.
- Iestyn, Gareth, Trahern, Cadogan, Cadfan, Neala und Branwen reagieren in der Kammer des Herolds auf den Zwischenfall mit Cadogans Hut.
- Im abgetrennten Anproberaum von Göttliche Eleganz wartet Catrin besorgt vor der Kabine. Refri ringt mit der Rückenschnürung ihres tannengrünen Mondsilbers.
- Carys stellt sich mit Bogen und Köcher vor Einions Schmusedecke. Einion bittet sie, Lord Schmusedecke zu verschonen. Über „Spielen“ beginnt die Schießübung.
- Trahern malt ein Dorf im Tal. Das Licht unter dem Baum verändert sich leicht.
- Zwei Versunkene knien am Strand über einem Kadaver. Die Augen des aufblickenden Versunkenen glimmen kurz auf.
- Sir Steffan mustert die unbewaffneten Draig-Waffenknechte in Zweierreihen. Ein Lichtstreif wandert über das Banner.
- Am halb abgebauten Weglager schimpft Fenrir über die Schulter mit Freya, die wegschaut und ihre Augen verdeckt. Über der Feuerstelle steigt ein Hauch Rauch auf.
- Ein kleiner Junge bietet dem neugierigen Landtroll vor der Brücke einen Fisch an. Im Bach schimmert das Wasser.

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

`loading-screen-scenes.js` wählt die Szene und lädt ihr Bildmaterial.
Die Reise am Wolfshorn verwendet vier Laufposen pro Figur und ein Panorama,
dessen Ränder beim Durchlaufen weich ineinander übergehen.
`loading-screen-courtyard.js` setzt die vier Chibi-Figuren vor das feststehende
Innenhofmotiv. Jede Figur hat eine Ruhepose und zwei Sprechgesten. Das Motiv
lädt je nach Bildschirmbreite eine Bildfassung.
In der Heroldskammer bleibt die Kamera fest. Beim Sprechen wechselt die aktive
Figur zwischen drei Mund- und Handgesten. Cadogan hält den Hut in allen vier
Posen in der Hand.

`loading-screen-fitting-room.js` legt das bewegliche Türblatt und zwei
Türspalt-Posen passgenau über die feste Anprobeszene. Refris Schuhe bleiben
unter der Tür sichtbar. Das hölzerne Klappern folgt der Türbewegung und der
Tonwahl des Ladebildschirms. Sieben wörtliche Ausschnitte aus dem
Verkaufsraum-Thread bilden einen gekürzten Dialog vom Fluchen über die
Schnürung bis zur Ausrede mit dem Boden. Die Reihenfolge einiger Zeilen
und die Türgesten folgen der Inszenierung für das Ladebild. Auf schmalen
Geräten bleiben Catrin und die ganze Tür im Bild.

`loading-screen-vignettes.js` setzt für jede der fünf ruhigen Szenen ein Bild
ein. Die Animation liegt in `loading-screen-vignettes.css` und hält an, wenn die
Leser pausieren, den Tab wechseln oder den Almanach betreten. Die Kreaturen
folgen den Bildtafeln aus dem Bestiarium. [Versunkener](../../../Bestiarium/wesen/nekrophagen/versunkener/index.html), [Landtroll](../../../Bestiarium/wesen/trolle/landtroll/index.html).

`loading-screen-quotes.js` enthält die Dialoge von Owetas Quartett, der Reise,
der Rosenflucht, der Heroldskammer und Refris Anprobe. Owetas Quartett
verabredet sich am Osttor und bespricht die Rast vor dem Hof, die Unterlagen
und die Fragen an die Familie Tirfelyn. In der eigens geschriebenen Szene am
Wolfshorn warnt Sir Duncan vor den nächsten zwei Wochen. Freki dreht sich für
seine skeptische Antwort zu Ylva und geht danach weiter. Vor der Rosenflucht
schimpft Idwal über die Kanne, die ihn beinahe verbrüht hat. In der Kammer des Herolds fasst eine
kurze Einleitung die Handlung am Hut zusammen. Die Originalzeilen zeigen die
Reaktionen vom Witz über die Amtsenthebung bis zur Verabredung zum Mittagessen.
Zu jeder aus einem Beitrag übernommenen Zeile sind der Quellkommentar,
der Szenenthread und der zugehörige Abschnitt verzeichnet.
`loading-screen-banter.js` zeigt die Sprechblasen in Reihenfolge über der
zugehörigen Figur. Pausieren, ein unsichtbarer Tab und der Eintritt halten
Animation und Sprechblasen an. Bei reduzierter Bewegung startet jede Szene
statisch. Die manuelle Pausenwahl gilt auch nach einem Tabwechsel.

Die mit ImageGen erzeugten Originale liegen unter `assets/loading-screen/source/`.
Prompts und Referenzpfade stehen in `assets/loading-screen/journey-v6-prompts.json`.
Der Innenhof mit Gesten, die beiden Teekannenbilder und die Rosenflucht sind in
`assets/loading-screen/rosenflucht-v10-prompts.json` und
`assets/loading-screen/rosenflucht-v11-prompts.json` belegt.
`python AleriaAlmanach/modules/loading-screen/prepare-assets.py --rose-chase`
erstellt die Bühnenbilder, Gartenkulisse und Posenatlanten sowie das Manifest.
`python AleriaAlmanach/modules/loading-screen/prepare-assets.py --journey-v6`
benötigt Pillow mit WebP- und AVIF-Unterstützung. Es erzeugt die aktiven Dateien
unter `public/assets/loading-screen/` und das Manifest mit Maßen und
SHA-256-Prüfsummen. Die Hintergründe haben AVIF-Fassungen für Desktop und
Mobilgeräte sowie einen WebP-Fallback.
Für die ruhigen Szenen liest `prepare-assets.py --vignettes` die ausgewählten
Fassungen aus `assets/loading-screen/ruhige-szenen-v1-prompts.json` und erstellt
`public/assets/loading-screen/ruhige-szenen-v1-manifest.json` sowie die zugehörigen
AVIF- und WebP-Dateien. Der Beleg enthält auch die Prompts und Referenzen der
früheren Fassungen.

`prepare-assets.py --fitting-room` erzeugt die Bildfassungen, Tür- und
Posenausschnitte, den Klapperton und `public/assets/loading-screen/refri-anprobe-v2-manifest.json`.
Die sechs ImageGen-Originale und die Raumkorrektur sind in
`assets/loading-screen/refri-anprobe-v2-prompts.json` belegt.

## Rosenflucht

Die Tiefenwyrm-Variante spielt Idwals Speerbewegung auf der Startseite ab.
„Spielen“ lädt die Jagd aus `rose-chase/` samt Bildern, Ton und Stylesheet.
Der Spielzustand läuft lokal. Das Beenden führt zum Vorspiel zurück.
„Aleria betreten“ bleibt erreichbar und räumt den Spielzustand auf.

Ziffernblock oder Pfeiltasten steuern Idwal. 4 / ← bewegt ihn zurück, 6 / →
nach vorn, 8 / ↑ springt und 2 / ↓ duckt oder verkürzt den Sprung. Auf
Touchgeräten stehen vier Tasten unter der Szene. Trevor übernimmt denselben
Sprung und dieselbe Sturzbewegung hinter Idwal.

Gwendolyns rote Sprechblase eröffnet jede Runde mit einem Trommelschlag.
Web Audio erzeugt die Sprung-, Glas- und Pickgeräusche.
Stöße gegen Hecken kosten jeweils eine Whiskyflasche. Beim Fangen pickt Pyderi
nach beiden Figuren, bevor „Game over“ erscheint. Die schmalen Hecken lassen
Raum für einen frühen Sprung. Pyderi bleibt beim normalen Laufen auf Abstand
und holt bei Stürzen oder längerem Zurücklaufen auf. Das Ende des Gartenwegs
oder ein Fang beendet die Runde.

## Carys’ Schießübung

In `blanket-archery/` zielt Carys durch das Burgzimmer auf die an der
Hinterwand hängende, gefütterte Decke. Einion springt weit hinten vor
der Wand und bittet in wechselnden Sprechblasen um Gnade. Drei Treffer
mit fünf Pfeilen gewinnen die Runde. Ein Treffer auf Einion beendet sie
sofort. Die Trefferprüfung liest seine sichtbare Pose am Durchflugpunkt,
auch während der hohen Sprünge.

Maus oder Pfeiltasten bewegen das Fadenkreuz. Gedrückte Maustaste,
Leertaste oder gezogener Finger spannen den Bogen. Loslassen schießt.
Mit steigender Zugkraft wächst das Wackeln. Kräftige Schüsse treffen den
angezeigten Punkt, schwächere senken sich bis zum Boden. Eingeschlagene
Pfeile zeigen die gezeichnete Befiederung aus der Rückansicht. Beim
Loslassen erscheint der fliegende Pfeil.

Gewinnt Carys, weint Einion. Bei einer Niederlage kommt ihre Mutter
Wynonna Fiachrach von rechts herein und schimpft per Sprechblase.
Beide Ausgänge haben eigene instrumentale Schlussmelodien. Bei
reduzierter Bewegung erscheinen die beiden Schlussposen ohne Übergang.

Die Schießübung und die Rosenflucht laden ihre Spielbilder erst über
„Spielen“. Dazu pausiert die Ladebildmusik. Beide verwenden dieselbe instrumentale Kampfmusik und
eigene synthetisierte Effekte. `games/loading-combat-music.js` enthält
die gemeinsame Komposition. Sprechblasen bleiben Text. Beim Ausblenden
des Tabs pausiert das Spiel. „Aleria betreten“ ist weiterhin erreichbar.

`python AleriaAlmanach/modules/loading-screen/prepare-assets.py --blanket-archery`
erzeugt die Bühnenbilder, zwei Atlanten mit je sechs Chibi-Posen, die
beiden Schlussposen, die Pfeile in Seiten- und Rückansicht und das
Auslieferungsmanifest.
Die ImageGen-Originale und Prompts liegen unter `assets/loading-screen/`.

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
Modulabgleich. Der aktuelle Abgleich für die Chibi-Szene und Heroldskammer
steht unter `diagnostics/loading-chibi-council-20261120/`. Die Reise- und
Ratsprüfung vom 19. November liegt unter `diagnostics/startup-journeys-20261119/`.
