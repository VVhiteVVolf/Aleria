# Coeddu und Craigddu · Kriegerhäuser und Familienergänzung

## Hausinhalte und Bilder

Nach Benutzervorgaben vom 28. September 2026 dienen beide Bürgerhäuser Haus Draig seit Generationen und stellen Wachen, Waffenknechte sowie einzelne Ritter. Die Coeddu besitzen eine beliebte Waffenschmiede in Gwynthor. Die Craigddu gingen aus einer Baumeisterfamilie hervor und bleiben in Gwynthors örtlicher Baumeistergilde vertreten.

Die jeweiligen `haus.content.mjs` bleiben die redaktionelle Quelle für Hausseite und Hausbiografie am Stammbaumwappen. Erzeugte Dateien wurden mit `Familien Häuser und Clans/scripts/build-house-content.mjs` aktualisiert. Frühere ausgelieferte Hausbiografien sind über ihre Fingerprints für die Aktualisierung erfasst; eigene Texte und ausdrücklich entfernte Biografien bleiben erhalten.

Die vom Nutzer bereitgestellten Bilder wurden unverändert lokal übernommen:

| Haus | Bildquelle | Datei im jeweiligen Hausverzeichnis |
| --- | --- | --- |
| Coeddu | https://i.imgur.com/BdD1qhJ.png | `assets/coeddu-krieger.png` |
| Craigddu | https://i.imgur.com/naKsXuw.png | `assets/craigddu-krieger.png` |

Die Verzeichnisse liegen unter `Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/`. Die Bilder erscheinen auf den Hausseiten und in den Hausbiografien. Vorhandene Personenporträts und persönliche Biografien bleiben erhalten.

## Craigddu-Stammbaum

Die historischen Kennungen `craigddu-gruender` und `craigddu-gruenderin` bleiben bei Iestyn (1680) und Mared (1683), den Eltern Hywels und Catrins. Ihre frühere Gründerbezeichnung wird korrigiert. Ein neues unbekanntes Gründerpaar steht vor dem Hauswappen und einem seriellen Zeitsprung zur Generation Iestyns und seiner beiden Brüder. Diese Verbindung bezeichnet keine unmittelbare Elternschaft des Gründerpaares.

Die folgenden Namen, Lebensjahre und konkreten Berufszuordnungen sind erzählerische Ergänzungen im ausdrücklich beauftragten Umfang. Namen folgen den Lautbausteinen des Rheunwaith-Namensarchivs (`AleriaAlmanach/modules/name-list/name-list-data.js`).

| Familienzweig | Ehepaar | Kinder |
| --- | --- | --- |
| Älterer Onkel | Brenwyn Craigddu (1676), Baumeister der Gilde, und Helyga (1680) | Rhydric (1702), Maelor (1706) |
| Jüngerer Onkel | Cyran Craigddu (1683), Waffenknecht, und Lleira (1685) | Thalwyn (1709) |
| Erster Vetter | Rhydric Craigddu (1702), Baumeister der Gilde, und Maelena (1705) | Ellor (1729), Sairwen (1734) |
| Zweiter Vetter | Maelor Craigddu (1706), Wache, und Avelia (1709) | Perian (1732) |
| Dritter Vetter | Thalwyn Craigddu (1709), Waffenknecht, und Nerwen (1711) | Gwenella (1736) |

Craigddu wächst von 13 auf 29 Personen. Alle bisherigen Personen- und Weltpersonen-IDs, bekannten Lebensjahre, Partnerschaften, Elternbeziehungen und Löschmarkierungen bleiben erhalten. Hywels sieben Töchter und die gespiegelte Verbindung Catrin–Llywelyn bleiben unverändert. Coeddu bleibt bei zehn Personen.

Veröffentlichte Fassungen: Coeddu Revision 3 und Craigddu Revision 4, jeweils mit unveränderlicher Revisionskopie. Die lokale Ausgangsfassung wurde vor der Ergänzung gegen die veröffentlichte Online-Akte geprüft. Es sind keine Änderungen an Firestore-Personenprofilen oder Kampfdaten erforderlich.

## Prüfung

- 26 Familien- und Hausseitentests bestanden, einschließlich Identitätserhalt, Eheverknüpfung, Überlieferungslücke, Altersabständen und Aktualisierung gespeicherter Hausbiografien.
- Hausinhalte erfolgreich neu erzeugt und anschließend mit `--check` geprüft.
- Charakterdatenbank über den bestehenden Archivabgleich geprüft; keine Änderungen an archivierten Personeninhalten.
- Browserprüfung bei 1440 und 390 Pixeln: beide Kriegerbilder auf Hausseiten und in Wappenbiografien geladen, kein horizontaler Seitenüberlauf. Alle 29 Craigddu-Personen sichtbar; Gründerpaar, Wappen, Zeitsprung und Brüdergeneration stehen in serieller Reihenfolge.
