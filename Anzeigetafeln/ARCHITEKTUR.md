# Anzeigetafeln-Architektur

Anzeigetafeln sind ein eigenständiges Feature und keine Sonderform einer Karte. Die gemeinsame Shell lädt anhand der Tafel-ID ausschließlich die passende Konfiguration und den Registry-Eintrag.

## Verantwortlichkeiten

```txt
Anzeigetafeln/
  tafel.html                         # einzige UI-Shell
  tafeln.registry.js                # IDs, Hierarchie, Bild- und Datenpfade
  assets/
    css/
      tafel.css                     # bestehende Grund- und Editorstile
      notice-board.css              # Ein-Ebenen-Tafel und Aushangdesigns
      notice-documents.css          # inhaltsabhängige Vorlagen und Faktenblöcke
      notice-media.css              # Bildplätze und gemeinsame Bildauswahl
      notice-theme.css              # Tafelshell, Editor und Kommentare
    js/
      tafel-app.js                  # kleine Runtime-Brücke und Initialisierung
      tafel-storage.js              # lokaler Entwurf, Laden, GitHub-Veröffentlichung
      core/
        tafel-state.js              # gekapselter Zustand und lokale Sicherungen
        tafel-actions.js            # zentrale Event-Delegation
        tafel-publish-ui.js         # bewusster Online-Publish
        tafel-bootstrap.js          # Startpunkt
      board/
        notice-board.js             # Tafelbild, Pan/Zoom, Platzierung
      data/
        authored-notices.js         # additive, im Repository gepflegte Aushänge
        notice-data-manager.js      # JSON-Import und -Export der Aushänge
      editor/
        notice-editor.js            # Bearbeitungsmodus und Editor-Shell
      notes/
        zettel-config.js            # Aushangtypen und neue Entwürfe
        zettel-board.js             # Aushänge auf dem Tafelbild
        zettel-editor.js            # Formulare für Aushänge
        zettel-scroll-views.js      # mittelalterliche Detailansichten
        zettel-document-views.js    # Mitteilungen, Vermisst, Zeitung, Steckbrief,
                                   # Ankündigung, Handel, Erlass und Einladung
        notice-stacks.js           # reine Gruppierung, Reihenfolge und Position
        notice-reader.js           # Lesedialog, Stapelwechsel, Personenblätter
        notice-text-layout.js      # gemessene Textgrenzen und Scrollhinweise
        zettel-comments.js          # Kommentare
      rewards/
        notice-rewards-model.mjs    # Geldparser und Güterreferenzen
        notice-rewards.js           # Auswahl, Münzicons und Belohnungsdialog
      media/
        notice-media-model.js       # Bildquellen, Platzhalter, Charakterlinks
        notice-media-picker.js      # ein Dialog für sämtliche Bildplätze
        notice-media-upload.js      # lokale Bildverkleinerung und Einbettung
        notice-character-catalog.mjs # lesender Zugriff auf Stammbaumregister
```

## Zustandsmodell

Der Zustand der zweiten Schema-Version enthält nur Tafeldaten:

```js
{
  schemaVersion: 2,
  zettel: [],
  regionIcon: "",
  regionTitle: "Anzeigetafel",
  boardImages: { board: "..." },
  cardWidth: 1100
}
```

Alte Felder wie `pins`, `cats`, `markerCatalog`, Minimap- oder Routendaten werden beim Laden bewusst nicht in den aktiven Zustand übernommen.

## Datenfluss

1. Registry und Tafelkonfiguration bestimmen Identität, Hierarchie und Pfade.
2. Der veröffentlichte JSON-Stand wird geladen.
3. Ein vorhandener lokaler Entwurf darf diesen Stand für denselben Browser ergänzen.
4. Bearbeitungen sichern automatisch nur lokal.
5. `Auf GitHub veröffentlichen` sendet einen erwarteten Revisionsstand an den zentralen Publisher.
6. Bei einer abweichenden Online-Revision wird die Veröffentlichung abgebrochen statt fremde Änderungen zu überschreiben.

Damit bleiben Tafeln voneinander getrennt und alle Bedienlogik liegt in featurebezogenen Modulen.

Eine Tafel kann über `storage.authoredNoticesPath` eine zusätzliche Aushangliste
`{ schemaVersion: 2, zettel: [...], updates: [...] }` laden; Version 1 bleibt gültig.
`authored-notices.js` ergänzt sie am
Speicher-Laderand sowohl zum veröffentlichten Stand als auch zu lokalen oder
migrierten Entwürfen. Bestehende IDs, Kommentare und Bearbeitungen haben Vorrang.
Das optionale Zustandsfeld `appliedAuthoredNoticeIds` merkt sich über Import,
Export und Veröffentlichung hinweg bereits übernommene IDs, damit im Editor
gelöschte Aushänge beim nächsten Öffnen nicht erneut erscheinen. Tafeln ohne
Zusatzliste behalten ihren bisherigen Datenfluss. Ein fehlgeschlagener Abruf
verändert vorhandene Daten nicht und meldet die fehlenden zusätzlichen Aushänge.
Explizite `updates` enthalten pro ID ausgewählte alte und neue Standardwerte.
Nur exakt unveränderte alte Werte werden ersetzt; eigene Texte, Bilder, Titel,
Positionen und Antworten bleiben erhalten. `appliedAuthoredUpdateIds` verhindert
eine erneute Anwendung nach späteren bewussten Bearbeitungen oder dem Loslösen
eines Beiblatts. Diese Metadaten gehören zu Snapshot, Entwurf und Export.

Gwynthors Quest „Angestellte Vermisst!“ wird mit
`node Anzeigetafeln/tools/build-gwynthor-quest-notices.mjs` zusammen mit den beiden
Familiengesuchen erzeugt (`--check` prüft den Stand). Getrennte Feature-Builder
lesen die kanonischen Personen; nur der gemeinsame Paket-Writer schreibt die Datei.
Der Vermisst-Nagel sitzt bei
2883/1509 auf dem 4096×3072 großen Originalbild: links oben am vorgemalten
Vermisst-Zettel. Der alte `data.json`-Stand bleibt erhalten; die Ergänzung
schreibt weder nach Firebase noch selbständig in den Online-Publisher.

## Vorlagen und Bilder

### Handschriften und Sprachschriften

Das optionale Aushangfeld `typography` speichert ausschließlich geprüfte Kennungen:
`{font:'caveat', heading:'dancingscript', script:'common'}`. `template` erhält die
jeweilige Vorlagenschrift, `heading:'inherit'` übernimmt die Textschrift.
Unbekannte Kennungen fallen auf diese Vorgaben zurück. Bestehende Aushänge ohne
Typografieangabe behalten ihre Darstellung. Die Auswahl gilt je Blatt im Stapel.

`typography/notice-font-catalog.mjs` verbindet sieben lokale Handschriften mit
den zwölf vorhandenen Sprachschriften. Die vorhandene Dokumentenwerkstatt ist
die Quelle der bereits registrierten Projektfont-URLs. Die Zeichenzuordnungen
liegen gemeinsam mit den Szenenkommentaren in
`AleriaAlmanach/modules/language/language-script-registry.js`. Die bisherigen
Kommentar-APIs und ihre Normalisierung bleiben erhalten. Laerelis-, Rheunwaith-
und Karnrith-Hilfen sowie die eigentliche Fontdatei werden nur bei Bedarf geladen.

`notice-typography.js` besitzt Schriftprobe und Darstellung im jeweiligen
Leser-/Vorschaubereich. Es verändert nur Textknoten und Schriftstile innerhalb
dieses Bereichs; gespeicherter Wortlaut, Formatierung, Signaturbilder und
Kommentare bleiben erhalten. Die Buttons **Übersetzen** und **Lesbar anzeigen**
zeigen den hinterlegten lesbaren Wortlaut und erlauben die Rückkehr zur
Originalschrift. Dieser Ansichtszustand wird nicht gespeichert. Asynchrone
Ladevorgänge prüfen ihre Zugehörigkeit zur aktuellen Ansicht; beim Blattwechsel
werden alte Darstellungscontroller aufgeräumt. Bei einer fehlenden Schrift bleibt
der Aushang in lesbarer Schrift verfügbar.

Herkunft und Lizenzen der lokalen Handschriften: `Fonts/Handwriting/manifest.json`.
`tools/vendor-notice-handwriting.mjs --check` prüft ihre Originalprüfsummen offline;
das Herunterladen erfolgt nur bei bewusstem Aufruf ohne `--check`.

Die 16 Vorlagen umfassen zusätzlich das handschriftliche kleine Hilfsgesuch,
den Turnieraushang im Bannerstil und den nummerierten Auktionszettel. Ihre
Vorschaukarten sind im vorhandenen CSS-System gestaltet, ohne fehlende Bilddateien.

`notice-text-layout.js` begrenzt lange Wortlaute anhand der tatsächlichen
Infotabellen-/Dossierhöhe plus 64 Pixeln (mindestens 220 Pixel, höchstens 600
Pixel beziehungsweise 62 % Fensterhöhe). Auf schmalen Ansichten gilt ein
eigenständiger, begrenzter Lesebereich. Kurze Texte bleiben kurz. Größenänderungen,
nachgeladene Bilder und Schriften werden berücksichtigt. Der Leser und die
Editorvorschau besitzen jeweils ihren eigenen Observer mit Aufräumfunktion.

### Aushangstapel

Jedes Blatt bleibt ein eigenständiger Eintrag in `zettel`, einschließlich Vorlage,
Text, Bildauswahl, Belohnungen und Kommentaren. `stackId` und `stackOrder` verbinden
beliebige Vorlagen an einem Nagel. Auch unabhängige Aufträge dürfen einen Stapel
bilden. Eine alte Hauptanzeige ohne `stackId` kann zusätzliche Blätter erhalten,
die auf ihre ID verweisen; bestehende lokale Texte werden dafür nicht überschrieben.
Es gibt keine verschachtelten Stapel. Der reine Stapel-Datenbaustein kümmert sich
um Gruppierung, Umordnen, Loslösen und gemeinsames Verschieben; der Reader und
der Stapel-Editor verwalten ihre jeweilige Oberfläche. Beim Loslösen eines
ursprünglichen Ankers erhalten die übrigen Blätter einen neuen Gruppenanker.
Öffentliche Gruppen werden vor der Gruppierung von geheimen Blättern bereinigt,
damit weder Titel noch Zähler versteckte Inhalte verraten.

`noticeGroupId` verbindet ausdrücklich zusammengehörige Blätter innerhalb eines
Stapels zu einem logischen Aushang. Eine alte Stapelzuordnung allein impliziert
keine inhaltliche Zusammengehörigkeit. `publications` und `publication` im selben
reinen Datenbaustein liefern die Projektion für Register, Nagelvorschau, Leser
und Editor. Das Register zeigt einen Treffer je Aushang, durchsucht aber alle
seine Blätter und öffnet ein passendes Beiblatt direkt. Die Vorschau zeigt jeden
unabhängigen Aushang am Nagel; der Leser bietet getrennte Gesuchstitel und eine
eigene Blattauswahl innerhalb des gewählten Gesuchs. Ein geheimer Hauptzettel
wird durch das erste öffentliche Beiblatt vertreten. Die alten Einzelblatt-
Operationen bleiben erhalten; Gruppenoperationen bewegen alle zugehörigen Blätter.

### Belohnungen

Das optionale Feld `rewards` enthält Geld `{kind:'money', currency:'silver', amount:5}`
oder Güter `{kind:'item', itemId, quantity, title, image, description, details}`.
Beide Arten erlauben ein optionales `condition` für bedingte Zusagen. Das
Familienamulett verwendet die echte Standard-Amulett-ID als Grundvorlage und
einen eigenen dauerhaften Namens-, Bild- und Beschreibungssnapshot als Erbstück.
Güter behalten ihre echte Register-ID und einen Bild-/Text-Snapshot für die
spätere Anzeige. Bestehende eindeutige Geldangaben in Tabellen werden nur beim
Rendern erkannt; freie oder mehrdeutige Zusagen bleiben unverändert als Text.
Geldparsing verwendet die vorhandene Güterregister-Geldlogik. Ein einzelner
Geldbetrag zeigt Zahl und vorhandenes Münzicon; mehrere Belohnungen oder ein
Gegenstand öffnen einen eigenen Detaildialog. Die strukturierte Belohnung ist
nach der Bearbeitung die Quelle; die entsprechende Tabellenzeile wird daraus
angezeigt und im Editor über den Belohnungsabschnitt geändert.

`tools/build-notice-reward-catalog.mjs` projiziert Standardgüter und öffentliche
Modulangebote mit den bestehenden Register-Konvertern in eine lesende JSON-Liste.
Die Liste wird erst beim Öffnen der Güterauswahl geladen. Der Netlify-Build hält
sie bei Änderungen an den Quellen aktuell. Die Anzeige führt keine Käufe,
Bestandsänderungen, Inventarvergaben oder Firebase-Schreibvorgänge aus.

Quest/Auftrag behält sein Pergamentlayout. Die übrigen Vorlagen verwenden Faktenblöcke mit natürlicher Höhe statt über die gesamte Texthöhe gestreckter Infospalten. Nicht ausgefüllte Fakten bleiben im Editor erhalten und werden in der Leseansicht ausgelassen. Die Detailansichten verändern keine gespeicherten Daten. Bestehende Steckbriefe ohne `personen` werden beim Öffnen des Editors in dessen Personenformular übernommen.

Alle Bildplätze verwenden denselben Dialog: Iconverzeichnis (bestehendes `ALERIA_ICON_DIRECTORY` und Karten-Medienregister), alphabetische Charakterliste mit Namens-/Familienfilter, Upload und Bildlink einschließlich Imgur-Einzelbildern. Auch Kommentare und das Tafelsymbol verwenden diesen Dialog. Charakterdaten werden erst bei Bedarf über das bestehende Stammbaumregister und dessen veröffentlichte Familien geladen; Namensbildung, Registerabgleich und Publikations-Repository werden wiederverwendet. Hier gibt es keine eigenen Firebase-Zugriffe.

Die alten Bildfelder `bild`, `portrait` und `verfasser` bleiben Zeichenketten. `emblem`, `siegel` und `unterschrift` ergänzen die Plätze. Optionale Metadaten liegen in `media[field]`; Charakterreferenzen enthalten `familyId`, `personId`, `name` und das zugehörige Bild. Links werden daraus ausschließlich zur Stammbaumansicht erzeugt. Ein manuell ersetztes Bild verliert eine nicht mehr passende Charakterverknüpfung. Alle Plätze haben einen Platzhalter, auch bei Ladefehlern.

Bildmetadaten können `fit` (`contain`/`cover`) und `position`
(`top`/`center`/`bottom`) pro Bildplatz vorgeben. Ohne diese Angaben gelten die
Vorlagen- und Aushangvorgaben unverändert. So kann etwa eine waagerechte
Unterschrift in einer quadratischen transparenten Quelldatei lesbar dargestellt
werden, ohne das Originalbild oder seinen Alphakanal zu verändern. Die Angaben
gelten nur, solange die Bildquelle zur gespeicherten Auswahl passt.

Uploads werden im Browser auf maximal 1200 Pixel verkleinert und als WebP im bestehenden JSON-Entwurf eingebettet (maximal 12 MB Quelldatei und 600.000 Zeichen nach Umwandlung). Es gibt keinen zusätzlichen Upload-Dienst. GIFs werden als Standbild übernommen; Imgur-Alben erfordern einen Einzelbildlink. Bei ausgeschöpftem lokalem Speicher meldet der gemeinsame Speicherweg einen Fehler und der Editor bleibt geöffnet. Import, Export und bewusste Veröffentlichung verwenden unverändert denselben Zustand einschließlich Bildmetadaten und Kommentaren.

Prüfungen: `node Anzeigetafeln/tests/notice-documents.test.mjs`, die vorhandenen Tafeltests sowie `node Anzeigetafeln/tools/validate-tafeln-structure.mjs`. Browserprüfung mit isolierten lokalen Beispieldaten: neun Vorlagen, Desktop/768/390 Pixel, Icons, Stammbaumverknüpfung, Upload, Imgur, Platzhalter, Kommentare, Speichern/Neuladen und voller Speicher.
