# Sonnenküste – Hausseiten und Hausbios vom 3. November 2026

Lokal fertiggestellt, weder gepusht noch veröffentlicht. Der aktuelle Deploy-Stopp
bleibt gültig.

## Umfang

28 Hausseiten mit eigener Hausbio und kanonischem Stammbaum-Iframe: acht
gelieferte Hausquellen, 16 knappe Gersteküsten-Vorbereitungen sowie die vier
Jungferntal-Ritterhäuser Rhelian, Aelryn, Caerwen und Nerwynn. Die beiden
genealogischen Morforwyn-Nebenlinien bleiben eigenständige verknüpfte Akten und
erhalten keine doppelten großen Hausseiten.

Illewod, Teyrngarch, Blach, Llwynog, Illwath, Morforwyn, Grianlaoch und Nic
Ríordáin wurden anhand der gelieferten Quellen ausgearbeitet. Die Originale
liegen unverändert in ihren fachlichen Hausordnern. Aktuelle Strukturen, Ränge,
Orte und Personenidentitäten haben Vorrang; Militärstatistiken wurden weder aus
Tabellen noch aus Fließtext übernommen. Die alten Stammbaumabschnitte wurden
vollständig von der Übernahme ausgeschlossen.

## Jungferntal

Die beiden gelieferten Dreizackwappen waren bereits als Rhelian und Aelryn
registriert. Namen, stabile IDs, Wappen und ihre unbekannten Gründer bleiben
erhalten. Die neue Nutzerfestlegung ordnet sie dem unmittelbaren Dienst unter
Morforwyn zu. Ihre genealogischen Sammlungen wurden nicht verändert.

- **Caerwen:** silberner Dreizack mit Erlenblatt auf Waldgrün; „Fest verwurzelt,
  wach am Wasser.“ Geraint gründete den Ritterhaushalt 1698. Rhydian führt ihn,
  Celyn ist erster Erbe. Zehn Angehörige in drei Generationen.
- **Nerwynn:** goldener Dreizack über drei hellen Flusssteinen auf Indigo; „Wir
  halten den Übergang.“ Aneurin gründete das Haus 1706. Cadell führt es, Owein
  ist erster Erbe. Acht Angehörige in drei Generationen.

Die beiden neuen Häuser sind ausdrücklich beauftragte Neuschöpfungen. Sie sind
in `Stammbäume/assets/js/data/jungferntal-knight-houses.js` gekapselt. Ihre
Familien, Profile, Wappen, Hausseiten und Bios sind unter denselben stabilen IDs
verbunden. Alle vier Ritterhäuser wohnen in Carngol/Jungferntal, dienen Morforwyn
und stehen ausschließlich im örtlichen Jungferntal-Register.

## Bilder und Quellenentscheidungen

Nach Wiederfund des passenden Grianlaoch-Originals sind acht vorhandene
Krieger-/Clanfiguren unverändert aktiv. Die frühere Einstufung dieses Ritters als
Musterszene war falsch. Seine zwischenzeitlich erzeugte Ergänzung bleibt als
Quellarchiv erhalten. Insgesamt entstanden 21 neue Figuren; aktiv sind jetzt
20 Ergänzungen: 15 Ritter und fünf Bürgerliche.
Rüstungen, Helme und Kleidung folgen Wappen, Herkunft, Hafen- und Küstenlage oder
den bewaldeten Flusstälern. Elf der 15 aktiven neuen Ritter tragen keinen Schild.
Ritterdarstellungen sind repräsentative Hausfiguren, keine neu behaupteten
Personenportraits oder mechanischen Ausrüstungsdatensätze.

Built-in ImageGen wurde mit der freigegebenen Figurenreferenz und den jeweiligen
Wappen verwendet. Die zwei neuen kreisrunden Wappen folgen der vorhandenen
Jungferntal-Heraldik. Produktions-PNGs behalten ihren ursprünglichen Alphakanal.
Rhavorns erste neue Figur hatte eine fehlerhafte Gesichtsöffnung; die gezielt
korrigierte V2 ist aktiv, die erste Fassung bleibt als Quellarchiv erhalten und
wird nicht statisch ausgeliefert.

Wichtige redaktionelle Entscheidungen sind je Haus in `REDAKTION.md` oder
`SOURCE_DECISIONS.md` belegt: Illewod ist Grafenhaus von Aberon/Gersteküste,
Blachs Befreiung erfolgt von den Norrnaigh, Llwynogs Rhedwyr folgen dem aktuellen
Einzeldossier, Grianlaoch behält Aberon und den Zweitsitz Gallchofaen. Nic
Ríordáins kanonischer Rang Dún-Tiarna hat Vorrang vor dem kopierten Mor-Tiarna;
historische Namen ohne eindeutig identifizierbare Akten bleiben unverlinkt.
Einmalige Hausgeschichte bleibt erhalten, offene Datierungen bleiben offen.

## Integration und Prüfung

Der vorhandene Hauscontent-Build erzeugt alle Seiten und Bios. Die gemeinsame
Vorbereitungsfabrik wird unverändert wiederverwendet. Die Galerie wird nur für
die 28 ausdrücklich ausgewählten Häuser aktualisiert. Der begrenzte Merge kann
jetzt neue IDs aufnehmen, wenn sie im kanonischen Collector als registrierte
Häuser vorliegen; fremde Einträge und CSV-Zeilen bleiben erhalten. Parallele
Arbeiten an Weidebucht und anderen Regionen werden nicht zurückgesetzt.

34 direkte Hausseitenlinks in den sechs Gebietsdaten; die zwei neuen
Jungferntal-Karten ergänzen die dortige Rittersektion. Import- und Einstiegspfade
der betroffenen Stammbaummodule sind versioniert, damit bestehende Browsercaches
die neuen Familien nicht durch eine alte Standardakte ersetzen.

52 gezielte Tests bestanden: elf Sonnenküsten-Hausprüfungen, zwölf Galerie-
Regressionsprüfungen, sechs Sonnenküsten-Gebietsprüfungen, acht Silberinsel-,
sieben Milane- und acht Veröffentlichungsgrenzen-Prüfungen. Alle 28 zuvor
gesicherten Familiengraphen einschließlich der beiden Morforwyn-Nebenlinien
bleiben unverändert. Die beiden neuen Graphen sind gültig und enthalten keine
Platzhalterpersonen. Eigene Biografien, explizite Löschungen und Personenänderungen
bleiben bei einem Standardupgrade erhalten. Bildpfade, Iframes, echte
Personenlinks und das Weglassen der Militärstatistiken sind geprüft.

Browserprüfung: Illewods Originalfigur und vorhandener Stammbaum laden;
Jungferntal zeigt Morforwyn und genau die vier örtlichen Ritterhäuser. Neue
Hausseiten und Bio-Dialoge werden zusätzlich in breiter und schmaler Ansicht
kontrolliert. Keine Bildausfälle oder seitlicher Seitenüberlauf.

Die vollständigen Lieferpfade, ausgewählten Bildprompts, Transparenzbelege und
Kontaktblätter stehen unter `diagnostics/sonnenkueste-house-pages-20261103/`.
Quellenarchive und Diagnosematerial sind von der statischen Auslieferung getrennt;
aktive Bilder, Daten und Hausbios bleiben auslieferbar.
