# Kommentarverbindung

## Fremde Stimme innerhalb eines Beitrags

`comments-foreign-voice.js` besitzt den festen Silhouettenkatalog und die
Normalisierung von `foreignVoiceName` (optional, höchstens 80 Zeichen) und
`foreignVoiceAvatarId`. Der Katalog enthält 23 Silhouetten: je drei Jungen,
Mädchen, Frauen und Männer, zehn Rollen sowie eine neutrale Person. Die Rollen
sind Alte Frau, Alter Bürger, Dirne, Diener, Stadtwache, Ritter, Söldner,
Räuber, Ritter Variante und Söldner Variante. Die ursprünglichen IDs
`boy`, `girl`, `woman`, `man` behalten ihre Bilder; die zwei Varianten je Gruppe
tragen die Endungen `-2` und `-3`. `person` bleibt die letzte Auswahl und der
Standard für fehlende oder unbekannte IDs. Alle Namen und Bildpfade werden
aus diesem gemeinsamen Katalog abgeleitet.
Ein leerer Name erscheint als **Fremde/r**. `comments-foreign-voice-ui.js` liefert
die gemeinsamen Erstellen-/Bearbeiten-Steuerelemente; Eingaben laufen durch die
bestehende Abschnittsdelegation. Der State bleibt im jeweiligen Abschnitt.

Die Beitragsfigur bleibt Autorin des gesamten Posts. Ein Abschnitt der Art
`foreignvoice` ist eine beiläufige andere Stimme ohne eigene Figurenakte und
ohne Profil- oder Kampfzuordnung. Eigene Bildsets und Emotes stehen dort nicht
zur Auswahl. Speichern, Entwürfe und Bearbeiten erhalten nur die feste Auswahl;
die Anzeige leitet Bild und Namen immer aus diesen Feldern ab, auch bei älteren
oder von außen importierten abweichenden Portrait-/Identitätsfeldern.
Die Charakterauswahl sowie normale Nachbarabschnitte behalten ihre bisherige
Verantwortung. Die Aktivitätsvorschau verwendet dieselbe feste Darstellung.

Auch im Erzähler-Modus stehen `foreignvoice` und `secretaction` beim Erstellen
und Bearbeiten zur Verfügung. Der gesamte Beitrag bleibt ein Erzählerbeitrag;
die beiden Abschnittsarten behalten ihre eigene Darstellung und Links-/Rechtswahl.
Eine Erzähler-Geheimaktion trägt am Abschnitt `commentMode: 'narrator'` und
erscheint als **Unbekannte Gestalt** ohne Porträt- oder Profilzuordnung. Der
Renderer ignoriert geerbte Figurenfelder und Emotemarker in diesem Kontext.
Normale Handlungen und das bestehende Einfügen von Szenengegenständen bleiben
Erzählerabschnitte mit ihrem bisherigen Verhalten. Figuren-Geheimaktionen
verwenden weiterhin ihre bestehende Darstellung.

Die Fachregression liegt in `tests/comment-foreign-voice.test.mjs`.

## Verbindung und Wiederanbindung

`comments-backend.js` besitzt den lokalen Ersatzspeicher und die Wiederverbindung.
Ein Starttimeout sperrt den später verfügbaren Onlineadapter nicht. Wartende
Bereitschaftslistener und Timer werden nach ihrem Abschluss entfernt.

Offene Lesequellen werden getrennt als `comments`, `turn` und `sidebar` verfolgt;
`backend` bezeichnet andere vorübergehend auf lokale Bereitschaft angewiesene
Aufrufer. Ein erfolgreicher Redestab darf keine noch ausstehende Kommentarladung
quittieren. Die Leseaufrufe übergeben dafür `getCommentBackend({ source })`.

## Ereignisse und Verantwortung

- `aleria:comment-backend-reconnect` auf `document`, `detail.sources`: fordert nur
  die betroffenen Leser zur erneuten Anbindung auf. Mehrere `fb-ready`-/`online`-
  Impulse werden zusammengefasst.
- `aleria:comment-backend-connected`, `detail.source`: bestätigt einen tatsächlich
  erfolgreichen Lesevorgang des Firebase-Adapters. Die Existenz von `window._fb`
  genügt nicht; ein offline verfügbarer Cache hebt die Offlineanzeige nicht auf.
- `comments-thread.js` erneuert ausschließlich den aktuellen sichtbaren,
  gebundenen Thread. Ein gesunder Kommentarlistener wird weiterverwendet; ein
  allein gescheiterter Redestab erneuert nur seine eigene Bindung.
- `sidebar-feed.js` besitzt seinen eigenen Abruf. Veraltete Antworten und Fehler
  dürfen weder DOM noch Verbindungsstatus verändern. Sein Remoteabruf verwendet
  `loadRecentComments(limit, { throwOnError: true })`, damit ein Ladefehler nicht
  als erfolgreicher leerer Bestand erscheint. Andere Aufrufer behalten den
  bisherigen Fehlervertrag.

Temporäre Fehler erhalten höchstens fünf automatische Versuche mit wachsenden
Abständen. Offline wird nicht weiter abgefragt; ein späteres Online-/Ready-Ereignis
kann eine neue Episode starten. Berechtigungs-, Authentifizierungs- und andere
ausdrücklich terminale Fehler erzeugen keinen automatischen Wiederholungssturm.

Bereits geladene Beiträge bleiben während einer Unterbrechung sichtbar. Lokale
`localOnly`-Beiträge und Entwürfe werden weder gelöscht noch automatisch gesendet.
Die Wiederverbindung aktualisiert den Leserbereich, ohne das Kommentarformular
neu aufzubauen. Lade-/Abonnementgenerationen schützen Szenenwechsel, geschlossene
Dialoge und verspätete Rückrufe.

## Prüfungen

Die Regressionen liegen in `AleriaAlmanach/tests/comment-connection-recovery.test.mjs`
und sind in der bestehenden Prüfgruppe `almanach-runtime` eingebunden. Ergänzende
Prüfungen schützen Kommentartransaktionen, Abonnementwiederverwendung, die
Aktivitätsprojektion und den kompakten Synchronisationsstatus. Der lokale
Browserablauf samt synthetischen Daten und Sichtbelegen liegt für diesen Fix unter
`diagnostics/comments-loading-20261105/fix-browser/`.

## Fazit als Szenenbericht

`comments-fazit-render.js` normalisiert weiterhin das bestehende Fazitformat.
Alte Berichte bleiben ohne Migration les- und bearbeitbar. Gespeicherte Berichte
und die Vorschau verwenden denselben Renderer; nur die Vorschau bekommt
Bearbeitungssprünge. Die Berichtsgestaltung liegt in
`styles/comments-fazit-report.css`, die Werkbank in `styles/comments-fazit.css`.

Die Werkbank bietet Schreiben, Nebeneinander und Vorschau; auf kleinen
Bildschirmen Schreiben oder Vorschau. Ihre Ansicht bleibt am Dialog,
nicht in den Kommentardaten. Die vier Abschnittsvorlagen ergänzen jeweils eine
Überschrift und den passenden Inhalt als einen rückgängig machbaren Schritt.
Freie Absätze, Listen, Icons, Personen, Verbindungssymbole und vorhandene
Darstellungsoptionen bleiben verfügbar. Entwürfe, Verlauf, Verschieben und
Speicheradapter behalten ihre bisherigen Verantwortlichkeiten.
Das Menü zum Hinzufügen von Abschnitten startet mobil eingeklappt. Sein
Öffnungszustand bleibt bei den laufenden Editoraktualisierungen erhalten.

## Optionale gemalte Sprechblasen

Der persönliche Haken **Frames** sitzt direkt neben dem Würfel in interaktiven
Szenen und schaltet die experimentelle Darstellung sofort um. Er startet aus.
`comment-bubble-preference.js` kapselt den Zustand und speichert die Wahl unter
`aleria-comment-bubble-art-enabled-v1` im Browser; sie gilt auch beim Szenenwechsel
und wird zwischen Tabs synchronisiert. Ohne verfügbaren Speicher funktioniert
das Umschalten für die aktuelle Ansicht weiter. Derselbe persönliche Haken steht
zusätzlich in beiden Moduleditoren und in den Schreib-/Bearbeitungsdialogen.
`data-comment-bubble-control` markiert deren statische Einfügepunkte;
`data-comment-bubble-surface` markiert die synchronisierten Vorschauflächen.
Alte `sessionAnimatedBubbles`-Felder bleiben als Daten erhalten, steuern die
persönliche Ansicht aber nicht mehr. Keine dieser Auswahlen wird im Modul gespeichert.

`comments-page.js` setzt die Eigenschaft am lokalen Szenencontainer;
`styles/comment-bubble-art.css` besitzt die davon abhängigen Regeln.
Zwölf transparente Rasterrahmen decken sämtliche normalen Kommentarblasen ab:
Rede (auch Fremdsprache/Fremde Stimme), Gedanken, Flüstern, Rufen, Schauspiel,
Handlungen (auch Geheim-/Kampfhandlungen und kompakte Interaktionen), Flirt,
Gebet, Gesang, Tiersprache, Telepathie/Zauberformeln und Wahnsinn.
Die gemeinsame Basis besitzt einen neutralen Redeframe; neue Arten bekommen
dadurch ebenfalls eine neue Kontur. Erzähler und strukturierte Ereigniskarten
behalten ihre eigene Lesedarstellung. Inhalt und Beschriftung
bleiben HTML. Die Animation betrifft nur das dekorative Leuchten; reduzierte
Bewegung wird berücksichtigt. Quellen und Bildmanifest liegen unter
`assets/speech-frame-lab`, Prompts unter `docs/art/speech-frame-lab`.

## Benannte Kommentarseiten

Unter jedem normalen Szenenkommentar steht „Kommentare davor bündeln“.
Der Dialog nennt die Anzahl und bündelt standardmäßig die noch ungebündelten
Kommentare vor dieser Grenze. Der Grenzkommentar und frühere benannte Seiten
können ausdrücklich mit einbezogen werden. Eine benannte Seite unterliegt
nicht der normalen 75-Kommentare-Aufteilung. Umbenennen und Auflösen stehen
an der Seitennavigation sowie in der Seitenverwaltung; Kommentare werden dabei
weder verschoben noch gekürzt oder gelöscht.

`comment-page-bundles-model.mjs` besitzt Grenzauflösung und Mutation, der
Controller die lokale Ansicht und Abonnements, `comment-page-bundles-ui.mjs`
ausschließlich den Dialog und `comment-page-bundles-firebase.mjs` den Adapter.
Der vorhandene Paginator verwendet diese Gruppen und behält außerhalb davon
seine bisherigen Tagesgrenzen und Seitengröße. IDs sind primäre Anker;
gespeicherte Reihenfolge/Zeit dienen bei gelöschten Grenzen als Rückfall.
Unauflösbare importierte Grenzen bleiben in der Verwaltung bearbeitbar,
während ihre Kommentare normal angezeigt werden.

Die gemeinsame Darstellung liegt ausschließlich unter
`comment_turns/<threadId>.commentPageBundles`. Bestehende Szenensicherungen
und deren Import erhalten dieses Metadatenfeld. Der authentifizierte Callable
`commitCommentPageBundle` schreibt nur dieses Feld, auch nach Sitzungsende;
Redestab, Sicherungen, Kommentare und Spielwerte bleiben unverändert. Er verlangt
keine Admin- oder Besitzerrolle. Eigene Revision und Auftragskennung mit
Inhaltshash verhindern doppelte Bestätigungen und das Überschreiben einer
gleichzeitigen Änderung. Fehler lassen den eingegebenen Titel im Dialog stehen;
„Einteilung aktualisieren“ lädt die aktuelle Fassung vor einem neuen Versuch.
Es gibt keine stille rein lokale Speicherung und keine Lockerung der Regeln.

Fachprüfungen: `comment-page-bundles.test.mjs` und das gleichnamige Backendtest,
ergänzt um die isolierte Firestore-/Zweibrowser-Integration unter
`diagnostics/frame-fit-comment-bundles-20261113/`. Die Quellenprüfung läuft in
`scene-presentation`, das Backend im regulären Functions-Predeploy.

Die Seitenverwaltung stellt die Zahl der Kommentare pro regulärer Seite für
die jeweilige Szene ein (1–1000, Standard 75). Reguläre Seiten lassen sich
benennen. „Neue Seite“ legt eine dauerhafte Grenze nach dem letzten Kommentar
an; beim Bündeln kann dieselbe Folgeseite atomar mit angelegt werden. Sie bleibt
auch leer erreichbar und nimmt nachfolgende Kommentare auf. Seitengrenzen
lassen sich aufheben, ohne Kommentare zu löschen. Namen und Seitengrenzen
bleiben auch bei einer späteren Änderung der regulären Seitengröße erhalten.

Optional tragen reguläre Seitengrenzen ein Aleria-Datum mit Uhrzeit. Der Adapter
`comment-page-time.mjs` bindet dies in die bestehende Szenenuhr ein, einschließlich
der zunächst leeren Folgeseite. Ohne Zeitanker läuft die vorherige Zeit weiter.
Es entstehen weder künstliche Kommentare noch Regenerations-/Kampftransaktionen.
Metadatenschema 2 liest Schema 1 vollständig; alte Clients können Schema 2 nicht
bearbeiten und dadurch dessen neue Felder nicht versehentlich verwerfen.

## Kompakte Szenenbedienung

`styles/session-controls-compact.css` besitzt die kleinere Szenennavigation,
Uhr-/Werkzeugbuttons, Suche, Redestab- und Einfügeleisten. Die Einleitung startet
eingeklappt. Auf schmalen Ansichten wird das Szenenbild als kleinerer Streifen
gezeigt. Die bisherige Mindesthöhe des Kommentarbereichs wird innerhalb einer
Szene aufgehoben, damit Header und Footer im verfügbaren Raum bleiben.
Schrift- und Avatarregler behalten ihre Bedeutung; Dialogtexte werden
dadurch nicht verkleinert. Andere Modulseiten sind nicht betroffen.

Fachprüfungen: `fazit-block-editor.test.mjs`, `scene-presentation.test.mjs` und
`comments-controls.test.mjs`, gemeinsam in der nativen Gruppe
`scene-presentation`. Der lokale Browserbeleg für diesen Ausbau liegt unter
`diagnostics/fazit-redesign-20261112/`.

## Begrenzte Optimierung der Szenendarstellung

Die Ungelesen-Zusammenfassung wird in `scene-read-state.js` einmal je
Kommentar-Render aus dem aktuellen sichtbaren Bestand berechnet. Der Renderer
reicht sie an die einzelnen Beitragszeilen weiter. Es gibt keinen dauerhaften
Historiencache; Bearbeitung, Löschung, neue Beiträge und Szenenwechsel werden
weiterhin unmittelbar aus dem aktuellen Bestand ausgewertet. Technische
Regenerationsereignisse bleiben aus der sichtbaren Ungelesen-Anzeige entfernt.

`comments-pagination.js` verwendet die bereits ermittelte Seiteneinteilung zur
Auswahl der aktuellen Seite. Sie wird nicht ein zweites Mal berechnet. Die
Seitengrenzen, Megaseiten, leeren Folgeseiten, Namen, Zeitanker und Größen bleiben
unverändert.

`character-data.js` trennt die bestehende Cast-Reihenfolge der Charakterakten
von der Ergänzung des Kreaturenkatalogs. Eine direkte Charakter-ID kann so aus
derselben bisherigen Charakterprojektion aufgelöst werden, ohne sämtliche
Kreaturen aufzubereiten. Vollständige Auswahl und Kreaturen-/Aliasauflösung
verwenden weiterhin den vollständigen bisherigen Weg. Es gibt keinen neuen
dauerhaften Figuren- oder Inventarcache.

Regression: `tests/comment-render-performance.test.mjs` prüft lineare Arbeit bei
langen Megaseiten, aktuelle Ungelesen-Werte, einmalige Seiteneinteilung,
Cast-Reihenfolge, Namens-/ID-Abgrenzung, Kreaturen und aktualisierte/archivierte
Figuren. Der Fall ist in der bestehenden nativen Gruppe `scene-presentation`
enthalten. Messung und echte Browserprüfung mit synthetischen Daten:
`diagnostics/scene-performance-20261113/`.

## Persönliche Avatargrößen im Editor

`comment-editor-appearance.js` kapselt zwei lokale Größenregler für Vorschau und
Abschnittsauswahl. Beide Dialoge verwenden dieselben Browserpräferenzen; Standard
sind 120 px und 80 px. Die Wahl wird unter
`aleria-comment-editor-avatar-sizes-v1` gespeichert und zwischen Tabs abgeglichen.
Die Vorschau behält die Porträt-/Textanordnung der Szenen; schmale Spalten begrenzen
das Porträt auf 40 % ihrer Breite. Maximieren gibt großen Porträts mehr Raum.
Größen bleiben außerhalb von Entwürfen, Kommentaren und Modulakten.
