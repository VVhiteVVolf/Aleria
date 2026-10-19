# Klaueninsel – lokale Übernahme vom 19. Oktober 2026

**Ausschließlich lokal vorbereitet. Kein Commit, Push oder Deployment.**

## Verwendete Quellen

Die World-Anvil-Grafschaftskarte
`058271b1-8cb9-4584-8eb7-2b413e39b9ad` wurde direkt über die verbundene
Chrome-Erweiterung gelesen. Die vollständige Markierungsliste umfasst
46 Marker. Für jeden Marker wurden die exakten Koordinaten und der
vollständige öffentliche Beschreibungstext aus der Bearbeitungsansicht
übernommen. Zusätzliche Ortskarten oder Artikeltexte sind keine Importquelle.

Die drei Karten stammen ausschließlich aus dem gelieferten Ordner
`C:\Users\fhg_r\Downloads\Klaueninsel`: `Klauninseln Normal.png`,
`Klaueninseln zonen.png` und `Marker Klaueninseln.png`. Alle haben
4096 × 2936 Pixel. Die lokalen WebP-Fassungen sind verlustfrei und pixelgleich.
Originalnamen, Auflösung und SHA-256 stehen in
`Karten/Cenyr/klaueninseln/images.source.json`.

Die 14 gelieferten HTML-Dokumente bleiben unverändert in `sources/`
archiviert. `sources.json` belegt ihre Prüfsummen. Unter `worldanvil/`
liegen die ursprüngliche Markerliste, alle gelesenen Markerfelder sowie
die DOM-Belege für Bildgröße und dargestellte Positionen; ein eigenes
Quellenmanifest enthält ihre vier Prüfsummen.

## Gemeinsame Daten und Darstellung

`Karten/Cenyr/klaueninseln/{markers,places,territories}.source.json` speist
Karte und Ortsverzeichnisse gemeinsam. Die 46 Marker behalten ihre
World-Anvil-UUID im eigenen stabilen Schlüssel und zusätzlich in `sourceRef`
mit Karten-ID, Originaltitel, Originalkoordinaten und Quellenadresse.
Ein geänderter Anzeigename erzeugt dadurch keine neue Markeridentität.

Die Koordinaten haben den Ursprung links unten. Aleria verwendet
`x / 4096` und `1 - y / 2936`. Diese Umrechnung wurde für alle 46 Marker
unabhängig mit den tatsächlich dargestellten World-Anvil-Positionen geprüft.

`node Karten/tools/import-klaueninseln.mjs` prüft den vorbereiteten Snapshot.
Der schreibende Import verweigert das Überschreiben bereits bearbeiteter
Kartendaten. Die vorhandene modulare Import-, Vorlagen- und Registerlogik
wird wiederverwendet. Individuelle Karteneinstellungen bleiben erhalten;
die gemeinsamen Standardgrößen sind Dot 80 / Schrift 50.

Die Grafschaft und ihre 13 gelieferten Unterseiten verwenden die bestehenden
Seiten-, Rats-, Verwaltungs-, Haus- und Ortskomponenten. Die Grafschaft zeigt
36 lokale Hausakten, einschließlich der getrennten Blodyn-Zweige von
Talgarth und Aberdail. Auswärtige Herkunftshäuser werden nicht als örtliche
Häuser ergänzt. Fünf örtliche Häuser ohne belegten Rang bleiben ausdrücklich
unter „Rang offen“. Auf Unterseiten stehen die jeweils zugehörigen Häuser.

Orte sind nach Herrschaft und Ortsart gegliedert. Vollständige Beschreibungen
öffnen sich innerhalb der kompakten Einträge. Karten, Hausakten und
Herrschaftsseiten sind lokal verknüpft. Hauswappen und territoriale Banner
bleiben getrennte Bildtypen. Sieben bisher fehlende Banner wurden aus den
Original-URLs der gelieferten HTML-Dokumente lokal archiviert; Herkunft und
Prüfsummen sind dokumentiert. Es wurden keine neuen Bilder generiert.

## Quellenabgleich und offene Angaben

- Leere und generische Markertitel wurden ausschließlich aus ihrem eigenen
  Beschreibungstext aufgelöst. Originaltitel und Auflösungsbeleg bleiben
  gespeichert. Dazu gehören Talgarth, Llanvyr, die Burgen und die Tavernen.
  Die Markertexte bestimmen auch die Schreibweisen Tewdar und Môrfael.
- Tirwen gehört gemäß eigenem Markertext nach der Übertragung von Pawen zu
  Diafol. Die Taverne „Zum Wandernden Bär“ gehört zur Baronie Talklaue.
  Wiederaufbaupläne werden nicht als bereits fertige Siedlungen ausgegeben.
- Die strukturierten Oberhauptangaben folgen den bestehenden lokalen Akten.
  Tryffin Diafols Sitz wird mit Talgarth geführt. Die kopierte Pawen-Hauszeile
  bei Crafanc und der fremde Tredegar-Verweis bei Diafol wurden bereinigt.
  In Blutklaues Infobox waren Flora und Fauna vertauscht; ihre Werte stehen
  jetzt unter den passenden Bezeichnungen.
- Alle **331 ursprünglichen Erzählabsätze** der 14 Seiten bleiben erhalten,
  einschließlich Banditentum und der einzelnen Flora-/Fauna-Unterkapitel.
  Historische Erzählungen und bestehende Genealogien wurden nicht umgeschrieben.
- **Donnergroll, Kargsschlund, Schattenschlund, Frostkluft, Tiefenschlund,
  Steinherzhöhle und Dunkelsturz** haben keinen eigenen Marker, keine belegten
  Koordinaten und keinen eigenen Beschreibungstext. Sie bleiben nur im
  Ortsregister unter „Position noch offen“. Es wurden keine Positionen oder
  Beschreibungen erfunden.
- Insgesamt enthält das Ortsregister somit 53 Orte; die Karte enthält 46 Pins.

## Prüfung

- 59 gezielte automatisierte Prüfungen bestehen, einschließlich der zuvor
  bearbeiteten Grafschaften, Verwaltungsabgrenzung, Vorlagen, Mediathek und
  Standardgrößen. Die sieben neuen Klaueninsel-Prüfungen kontrollieren unter
  anderem Quellenprüfsummen, Original-IDs, vollständige Texte, unabhängige
  Koordinatenumrechnung, Hauszuordnung und Überschreibschutz.
- Der Quellenvergleich bestätigt 331 unveränderte Erzählabsätze und drei
  pixelgleiche Kartenbilder.
- Direkte Chrome-Prüfung aller 14 Seiten bei 1440, 1024, 768 und 390 Pixeln:
  korrekte Hauszahlen, gleich hohe Hauskarten und keine seitlichen Überläufe.
  Beschreibungen und Verwaltungsdialoge funktionieren auf allen 14 Seiten.
- Die lokale Kartenansicht zeigt 46 Marker, alle drei Ebenen in voller
  Auflösung und die Standardgrößen 80/50. Talgarth, Mynyth und die Taverne
  wurden einschließlich Beschreibung, Wappen und Herrschaftsbanner geprüft.
  Die Ortskarte hat auch bei 390 Pixeln keinen inneren seitlichen Überlauf.
- `tests/klaueninseln.browser.mjs` stellt den gemeinsamen Browserprüflauf
  zusätzlich für spätere lokale Wiederholungen bereit. Die aktuelle visuelle
  Prüfung erfolgte über die Chrome-Erweiterung.
