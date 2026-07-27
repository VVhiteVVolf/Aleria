# Verbindlicher Arbeitsablauf für Stammbaum-Datenpflege

Dieses Dokument ist die operative Qualitätsrichtlinie für neue oder korrigierte Familienakten unter `Stammbäume/`. Die Architekturgrenzen stehen ergänzend in [PLAN.md](PLAN.md); Bedienung und Speicherung sind in [README.md](README.md) beschrieben.

## 1. Quellenhierarchie

Bei widersprüchlichen Angaben gilt folgende Reihenfolge:

1. ausdrückliche Korrektur des Benutzers;
2. genealogische Tabelle oder beschriftete Stammbaumgrafik der gelieferten Quelle;
3. bereits kanonisch registrierte Weltperson oder Gegenbeziehung in einer ausgearbeiteten Familienakte;
4. erzählerischer Begleittext;
5. reine Nähe, Spaltenposition, Farbe oder ein Nachname im Quelllayout.

Eine niedrigere Quelle darf eine höhere nicht still überschreiben. Widersprüche werden in `notes` oder `extensions.sourceNote` festgehalten. Unbekannte Eltern, Häuser, Namen oder Jahreszahlen bleiben unbekannt; sie werden nicht aus dem Layout erfunden.

## 2. Bestandsaufnahme vor jeder Änderung

Vor dem Schreiben von Daten:

- Haus-ID, Familien-ID, Rang, Ortsprofil, Sitz, Wappen und vorhandene Leerakte bestimmen.
- Projektweit nach Hausname, allen markanten Personennamen und bekannten Beziehungen suchen.
- Vorhandene Personen-, Weltpersonen-, Partnerschafts- und Portrait-IDs notieren.
- Prüfen, ob das Zielhaus bereits in `assets/js/data/families.registry.js` oder einem Familienaggregat registriert ist.
- Aktuelle `extensions.sourceRevision` und vorhandene Migrationstests erfassen.
- Den bestehenden Arbeitsbaum nicht durch eine neue parallele Datei oder neue IDs duplizieren.

## 3. Quelle zuerst als Inventar erfassen

Das Quelllayout wird nicht direkt in Code übersetzt. Zuerst entstehen getrennte Inventare:

### Personen

Für jede benannte Person werden festgehalten:

- Quellenreihenfolge;
- eindeutige Arbeits-ID;
- vollständiger Name und belegte Schreibvarianten;
- Geschlecht nur, wenn belegt oder im Projekt bereits kanonisch;
- Geburt, Tod und ausdrücklich unbekannte Werte;
- Titel, Haus, Familienrolle und Linienrolle;
- echte Portraitquelle oder bewusst verwendeter Platzhalter;
- Unsicherheiten und Gegenquellen.

`????–????` ist nicht automatisch ein Lebensstatus. Ein Kreuz oder ein kanonisches Todesdatum belegt den Tod; ein bloß unbekanntes Endjahr darf nicht als Todesjahr gespeichert werden.

### Beziehungen und Abstammungen

- Jede ausdrücklich genannte Ehe, Verlobung, Affäre oder erzwungene Verbindung wird genau einmal erfasst.
- Doppelte Darstellung desselben Paares in zwei Tabellenspalten erzeugt keine zweite Partnerschaft.
- Kinderüberschriften wie „X und Ys Kinder“ werden unabhängig vom Kartenlayout notiert.
- Pflege, Adoption, beanspruchte Abstammung und biologische Elternschaft bleiben verschiedene Typen.
- Anonyme leere Templatekarten werden nicht als reale Personen importiert.

### Sonderknoten

Zeitsprünge, gegründete Häuser, Wegverheiratungen und Linienenden werden in eigenen Listen erfasst. Ein kleines Herkunftswappen an einem eingeheirateten Partner ist noch kein Kadetten- oder Wegverheiratet-Knoten.

## 4. Weltidentitäten und Gegenakten

Eine reale Figur erhält hausübergreifend dieselbe `worldPersonId`. Wenn die Gegenakte bereits stabile Personen- und Partnerschafts-IDs verwendet, werden auch diese wiederverwendet.

Vor einer neuen Person sind mindestens Name, Lebensdaten, Haus und Partner gegen alle Familienakten abzugleichen. Namensgleichheit allein genügt nicht. `familyRole` darf je Akte verschieden sein, die Weltidentität jedoch nicht.

Geteilte Portraits werden aus dem vorhandenen Portraitmodul importiert. Sie werden weder erneut heruntergeladen noch unter einer zweiten Personen-ID kopiert.

## 5. Fachliche Datensätze

Verbindliche Bausteine sind:

- `createFamilyPerson` für Personen;
- `createMarriage` für Partnerschaften aller unterstützten Typen;
- `createParentages` für jede Eltern-Kind-Zuordnung;
- `createMarriedAwayBranch` für eine Person des dargestellten Hauses, die in ein anderes Haus heiratet;
- `createCadetHouseBranch` ausschließlich für ein ausdrücklich neu gegründetes Seitenhaus;
- `createWardAwayBranch` für ein Familienkind, das als Mündel, Page oder Knappe an ein anderes Haus vermittelt wurde;
- `createExtinctBranch` für ein belegtes Linienende.

Verwandtschaftsrollen wie Tante, Cousin oder Großmutter werden nicht gespeichert. Sie werden aus dem Graphen berechnet.

## 6. Hausknoten: direkte Paarbindung

Für jeden Hausknoten gilt zwingend:

- `parentPartnershipId` bezeichnet exakt das Ehe- oder Gründerpaar, unter dem der Knoten sichtbar sein muss.
- Der konvertierte Knoten besitzt genau die beiden Teilnehmer dieses Paares als Eltern, beziehungsweise die eine ausdrücklich erlaubte Einzelperson.
- `name`, `houseId`, `targetFamilyId` und `emblem` beziehen sich auf das gegründete oder erreichte Zielhaus.
- Das Zielhaus darf nicht aus dem Geburtsnamen eines Partners abgeleitet werden. Beispiel: Morholt Pysgod und Caitrin Neidr gründen Haus Tiwna; der Knoten ist deshalb Tiwna, nicht Pysgod.
- Ein eingeheirateter Partner erzeugt im aktuellen Baum keinen Herkunfts-Hausknoten. Der reziproke Wegverheiratet-Knoten gehört in seine eigene Familienakte.
- Verlobungen erzeugen noch keinen Wegverheiratet-Knoten.
- Jede Person des dargestellten Hauses, die laut Quelle verheiratet wurde und deren Zielhaus nicht überliefert ist, erhält an genau dieser Ehe einen `married-away`-Knoten „Unbekanntes Haus“ (`targetFamilyId: haus-unbekannt`). Ein „???“-Ehepartner ist kein Grund, den Knoten wegzulassen.
- Jede als Mündel fortgegebene Person besitzt zusätzlich zu `familyRole: ward-away` genau einen `ward-away`-Hausknoten. Dieser hängt über `parentPersonId` unmittelbar unter der Person und nennt das Zielhaus; ist auch dieses unbekannt, wird „Unbekanntes Haus“ verwendet. Eine nicht belegte Vormundsperson oder Pflege-Elternschaft wird dabei nicht erfunden.
- Eine ausdrückliche Vermittlung als Page oder Knappe an eine Person eines anderen Hauses gilt in der Heimatakte ebenfalls als fortgegebenes Mündel. Die Person behält ihr Geburtshaus und ihre biologische Abstammung, erhält aber zwingend `familyRole: ward-away`, den dunkelblauen Mündelrahmen und genau einen direkten `ward-away`-Zielknoten zum Haus des Ritters oder Vormunds. Formulierungen wie „zu X gegeben“, „X angeboten“ oder „dient als Page/Knappe von X“ dürfen nicht als bloßer Titel ohne Vermittlungsknoten abgelegt werden.

Hausknoten sind terminale Anhänge und bleiben direkt am maßgeblichen Paar beziehungsweise beim fortgegebenen Mündel direkt an der Person. Der Zeitsprung-Router darf sie niemals in die nächste Generation verschieben.

## 7. Hardcore-Regel für Zeitsprünge

Zeitsprünge sind absolute serielle Generationentrenner:

- niemals parallel zu einer Person, einem Paar, Hausknoten oder zweiten Zeitsprung;
- höchstens ein globaler Trenner je Generationstiefe;
- immer nach dem vorausgehenden Paar, einer Einzelperson oder dem Stammwappen;
- alle genealogischen Fortsetzungen dieser Ebene laufen durch den Trenner;
- `childIds` enthalten ausschließlich Personen;
- Haus- und Linienendknoten bleiben direkt an ihrem Paar;
- die unsichtbare `time-jump-stage` ist ausschließlich ein Adapterdetail und wird nicht in der Familienakte gespeichert.

Bei nicht belegten Zwischengenerationen wird die Abstammung als `claimed` mit passender `certainty` und `extensions.timeJumpId` modelliert. Sie darf nicht als direkte biologische Elternschaft ausgegeben werden.

Validierungsfehler wie `PARALLEL_TIME_JUMP_*` oder `DUPLICATE_LINEAGE_TIME_BARRIER` sind Blocker und dürfen nicht ignoriert werden.

## 8. Portraitworkflow

Jede ausgearbeitete Familie besitzt:

- ein eigenes Mappingmodul `assets/js/data/house-<slug>-portraits.js`;
- lokale Bilder unter `assets/images/portraits/haus-<slug>/`;
- ein `portrait-sources.json` mit Personen-ID und ursprünglicher URL.

Wiederverwendete Standard-Silhouetten werden nicht als Einzelportraits heruntergeladen. Jede andere belegte Quellperson erhält entweder ein vorhandenes geteiltes Portrait oder eine lokale Datei. Manifest-Keys und lokale Mapping-Keys müssen übereinstimmen. Dateien werden auf Existenz, Mindestgröße und gültige Bildsignatur geprüft.

## 9. Registry, Revision und lokale Bestände

Eine ausgearbeitete Familie ersetzt ihre Factory-Leerakte im zuständigen Aggregat. `blankFamily` darf dann nicht mehr wahr sein.

- Neue Quellfassung: `extensions.sourceRevision: 1`.
- Korrektur einer ausgelieferten Fassung: Revision erhöhen.
- Bestehende IDs bleiben stabil, damit keine Alt- und Neufassung nebeneinander entstehen.
- `extensions.registryManagedFields` wird nur für kanonische Felder gesetzt, die eine ältere lokale Fassung zwingend korrigieren müssen.
- Lokale Ergänzungen, Löschmarker und nicht verwaltete Felder bleiben erhalten.

Für jede Revisionserhöhung ist ein Migrationstest erforderlich, der besonders auf doppelte Personen, Partnerschaften und Hausknoten prüft.

## 10. Pflichtprüfungen

Eine Familienakte ist erst fertig, wenn alle folgenden Punkte geprüft sind:

- `assertValidFamily` meldet keinen Fehler.
- Personen-, Partnerschafts-, Elternschafts-, Hausknoten- und Zeitsprunganzahl stimmen mit dem Quelleninventar überein.
- Keine benannte Quellperson fehlt; keine leere Templateperson wurde erfunden.
- Keine Person ist unbeabsichtigt isoliert.
- IDs, Weltpersonen-IDs und Chart-IDs sind eindeutig.
- Jede Partnerschaft und Elternschaft besitzt die erwarteten Teilnehmer.
- Bastardgruppen mit verschiedenen Affären bleiben getrennt und ausdrücklich beschriftet.
- Jeder Hausknoten hängt im konvertierten Chart direkt an seinem `parentPartnershipId`-Paar; ein `ward-away`-Knoten hängt ausschließlich an seiner `parentPersonId`-Person.
- Kein Zeitsprung steht sichtbar parallel zu einem anderen Knoten; Gap-Kinder sind ausschließlich Personen.
- Kein Chartknoten besitzt mehr als zwei Eltern oder mehrere Hierarchiepfade.
- Geteilte Personen, Partnerschaften und Portraits stimmen mit den Gegenakten überein.
- Das Register lädt die ausgearbeitete Familie statt der Leerakte.
- Ein alter lokaler Stand wird ohne Duplikate aktualisiert.
- Alle Projekt- und Firebase-Validierungstests bestehen.
- Abschließend wird die Gesamtansicht im Browser auf Linienführung, Abstände, Bilder und Knotentexte geprüft.

## 11. Fehlerdiagnose

| Symptom | Wahrscheinliche Ursache | Verbindliche Prüfung und Behebung |
| --- | --- | --- |
| Baum erscheint doppelt, vierfach oder häufiger | Ein Chartknoten hat mehrere strukturelle Elternpfade; ein Gap wurde an mehrere Paare gehängt | Chart-IDs, Elternzahl, symmetrische Kanten und Pfadanzahl prüfen; Zeitsprung nur am seriellen Anker führen |
| Hausknoten steht bei der falschen Generation | Hausknoten wurde als normale Fortsetzung behandelt oder besitzt falsche `parentPartnershipId` | Linktyp und exaktes Paar prüfen; Knoten im Router als terminalen Anhang belassen |
| Falsches Hauswappen | Zielhaus wurde aus dem Namen des Ehepartners abgeleitet | `name`, `houseId`, `targetFamilyId`, `emblem` gegen die ausdrückliche Hausgründung oder Wegverheiratung prüfen |
| Beziehung oder Kind fehlt | Quelleninventar und Datensatz wurden nicht vollständig gegeneinander verglichen | Differenz aus Personen-, Partnerschafts- und Parentage-Inventar bilden; keine Layoutannahme verwenden |
| Bastarde sind nicht einer Affäre zuzuordnen | Mehrere Kindergruppen teilen nur den Vater oder eine allgemeine Affärenfarbe | Eigene Partnership je Affäre, exakte Mutter in `parentIds`, explizite Kartenbezeichnung und Regressionstest ergänzen |
| Portrait fehlt oder ist falsch | Falsche Personen-ID, ausgelassenes Manifest oder getrennte Weltperson | Mapping, Manifest, lokale Datei und Gegenakte gemeinsam prüfen |
| Register zeigt nur eine leere Familie | Ausgearbeitete Akte ist nicht im Aggregat registriert oder eine veraltete Leerakte überdeckt sie | Import/Aggregat, `blankFamily`, `sourceRevision` und Registry-Priorität prüfen |
| Alte lokale Fehler bleiben sichtbar | Revision oder verwaltete Korrekturfelder fehlen | Revision erhöhen, nur notwendige `registryManagedFields` setzen und Migrationstest schreiben |
| Zeitsprung steht parallel | Mehrere Barrieren derselben Tiefe oder Hausknoten wurde in die Fortsetzung gezogen | Schema-Diagnosen, `family-chart-time-jump-router.js` und unsichtbare Layoutstufe prüfen |

## 12. Abschlussprotokoll

Jede neue oder korrigierte Familie wird mit folgendem Kurzprotokoll abgeschlossen:

- Quelle und maßgebliche Benutzerkorrekturen;
- Anzahl Personen, Partnerschaften, Elternschaften, Hausknoten und Zeitsprünge;
- wiederverwendete Weltpersonen und Gegenbeziehungen;
- bewusst nicht übernommene Platzhalter;
- dokumentierte Widersprüche und verbleibende Unsicherheiten;
- `sourceRevision`;
- Ergebnis der Tests und Browserprüfung.

Die zentralen technischen Normanker sind `assets/js/data/family-record-builders.js`, `assets/js/domain/family-schema.js`, `assets/js/adapters/family-chart-time-jump-router.js`, `assets/js/services/family-registry-upgrade.js` und `assets/js/data/families.registry.js`.
