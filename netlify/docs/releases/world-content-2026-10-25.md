# Gesamtveröffentlichung vom 25. Oktober 2026

Der Nutzer hat nach Erstellung der temporären Weisenfluh-Vorschlagsseite
ausdrücklich Push und Deploy sämtlicher lokaler Neuerungen beauftragt und damit
die Sperre vom Vortag für diesen Stand aufgehoben.

## Weisenfluh und Bànneach

Die eigenständige Seite `/Vorschau/Weisenfluh/` übernimmt die gelieferten
Hausordner, die Regionskarte und die neue Beschreibung des kulturellen Wandels
vom albischen Bànneach zum weisenfluhischen Erlenkönigreich. Fünf Provinzen,
acht benannte Landmannssitze und das eigenständige verpachtete Ährensass werden
ausdrücklich unterschieden. Sieben albische Clans bleiben anfangs unzugeordnet.

31 Wappen lassen sich per Ziehen, Karten-Zielauswahl oder Haus-/Ortsauswahl
versetzen. Browserentwurf, Rücknahme, Ausgangsstand und validierte JSON-Dateien
gehören ausschließlich zur Vorschlagsseite. Die gemeinsame Kartenansicht wird
wiederverwendet. Bestehende Welt- und Familienregister werden nicht geändert.

Alle 33 gelieferten PNGs bleiben bytegleich erhalten; getrennte WebP-Dateien
begrenzen die initiale Bildmenge auf rund 5 MB. Das antike Bànneach-Wappen zeigt
nach ausdrücklicher Motivkorrektur einen weißen Stier. Imagegen-Prompt,
angesehene Referenzwappen und Alphakanalprüfung liegen neben der Seite.

## Weitere lokale Neuerungen

- Vortigerns Ruh: vorbereitete Hausseiten, Biografien und Kriegergalerie.
- Stammbaum: gezielte Zweigkompaktierung, Lága-Familienansicht und zugehörige
  Prüfungen sowie bereits vorbereitete Aktualisierungen der Familieneinbindung.
- Küstenchroniken: Leitheach-Raubzug und Vennyr-Invasion, Ereignisse, 21
  Piratenbandenakten und Fraktionsseiten, Almanach-Einstiege und Quellen.
- Lokale Wappenentwürfe einschließlich Rothirsch, Wildschwein und Wildkatze.
- Notwendiger Folgeabgleich: Gwynthors neue Hausseitenziele bei unveränderten
  Kartenpunkt-IDs und Positionen. 14 inzwischen registrierte Bürgerfamilien
  werden als bildlose Metadaten in den Hausrüstungskatalog aufgenommen; es
  entstehen keine Rüstungsbilder, Ausrüstung oder Kampfwerte.

Die vollständige bestehende Release-Prüfung und der Almanach-Build werden vor
dem Push ausgeführt. Aufgetretene veraltete Folge-Dateien werden aus ihren
vorhandenen Quellen abgeglichen. Prüfprotokolle und Produktionsnachweise liegen
lokal unter `.tmp/weisenfluh-20261025/`.

Die Folgeabgleiche betreffen zusätzlich den erzeugten Preisprüfbericht und das
Karten-Wappenregister. Der VM-Rundlauftest lädt die neue Piraterie-Abhängigkeit
vor `data/sections.js`, entsprechend der echten Seite. Der historische
Familienbeleg wurde mit Git-HEAD verglichen: Ausschließlich die bereits lokal
vorbereiteten Lága-Gegenstellen in Gallchobhair, Chulainn und Durthacht ändern
ihre geprüften Felder. Der Beleg enthält alten Hash, neue Einzel-Hashes und die
vollständige Feldliste; Personenanzahl, Personen-IDs, Elternschaft und Ehen
bleiben unverändert. Es wurden keine Prüfungen abgeschaltet.

Browserprüfung: Haus-/Ortsauswahl, echtes Ziehen in der Kartengroßansicht,
Speichern über Neuladen hinweg, Wiederherstellen des Ausgangsstands sowie
mobile Seitenbreite. Keine defekten Bildverweise. Die gezielten Prüfungen der
zusätzlich lokalen Stammbaum-/Hausänderungen und der Rüstungslogik umfassen
50 erfolgreiche Tests; die Stammbaum-Geometrie prüft 526 Akten ohne Fehler.

Alle 29 bestehenden Release-Prüfgruppen wurden erfolgreich abgeschlossen;
die nach Folgeabgleichen wiederholten Gruppen sind separat protokolliert.
Der vollständige Almanach-Build ist ebenfalls erfolgreich.

Der erste Netlify-Lauf deckte eine fehlende Archivregel auf: Git normalisierte
die Zeilenenden der fünf Fraktions-Quellregister auf Linux, obwohl deren
Importmanifest die unveränderten Originalbytes prüft. Die vorhandene
`-text`-Archivregel wurde gezielt auf `Fraktionen/docs/sources/*.html`
erweitert. Die Originaldateien und ihre Prüfsummen bleiben unverändert;
die Registerprüfung bleibt strikt und aktiv.

Firebase-Daten, Live-Ressourcen, Online-IDs und bisherige Kampfverläufe werden
nicht migriert oder neu ausgewertet. Die Veröffentlichung folgt dem bestehenden
GitHub-/Netlify-Ablauf auf `master`.
