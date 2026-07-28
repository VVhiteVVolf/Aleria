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
- Mehrere sichtbare Karten derselben Person erzeugen weder eine zweite Person noch eine zweite Weltidentität. Sie sind ausschließlich Chart-Erscheinungen derselben fachlichen Person.
- Kinderüberschriften wie „X und Ys Kinder“ werden unabhängig vom Kartenlayout notiert.
- Pflege, Adoption, beanspruchte Abstammung und biologische Elternschaft bleiben verschiedene Typen.
- Anonyme leere Templatekarten werden nicht als reale Personen importiert.

### Sonderknoten

Zeitsprünge, gegründete Häuser, Wegverheiratungen und Linienenden werden in eigenen Listen erfasst. Ein kleines Herkunftswappen an einem eingeheirateten Partner ist noch kein Kadetten- oder Wegverheiratet-Knoten.

## 4. Weltidentitäten und Gegenakten

Eine reale Figur erhält hausübergreifend dieselbe `worldPersonId`. Wenn die Gegenakte bereits stabile Personen- und Partnerschafts-IDs verwendet, werden auch diese wiederverwendet.

Vor einer neuen Person sind mindestens Name, Lebensdaten, Haus und Partner gegen alle Familienakten abzugleichen. Namensgleichheit allein genügt nicht. `familyRole` darf je Akte verschieden sein, die Weltidentität jedoch nicht.

Geteilte Portraits werden aus dem vorhandenen Portraitmodul importiert. Sie werden weder erneut heruntergeladen noch unter einer zweiten Personen-ID kopiert.

## 5. Mehrfachkarten und innerfamiliäre Partnerschaften

Heiraten zwei Personen, die bereits an unterschiedlichen Stellen desselben Stammbaums als Nachkommen vorkommen, darf das fachliche Datenmodell nicht zur Lösung des Layoutproblems dupliziert werden. Verbindlich bleiben:

- genau ein Personendatensatz je realer Person;
- genau eine `worldPersonId` je realer Person;
- genau eine Partnerschaft für die Ehe, Verlobung oder Affäre;
- genau eine Elternschaft je Kind und Abstammungsvariante;
- genau ein fortsetzender Paarzweig, unter dem die gemeinsamen Kinder erscheinen.

Vor der Darstellung wird ausdrücklich bestimmt, welche Seite die Linie fortführt. Eine Benutzerkorrektur oder eindeutige Quelle hat Vorrang; das Geschlecht allein entscheidet diese Frage nicht. Die Person im fortsetzenden Herkunftszweig bleibt dort als reguläre Karte erhalten. Der Partner wird für diese eine Partnerschaft über `extensions.chartRepeatForPartnershipIds` als zusätzliche Kartenerscheinung an den fortsetzenden Zweig geführt.

Soll die Ehe zusätzlich am nicht fortsetzenden Herkunftszweig lesbar bleiben, erhält die fortsetzende Person dort über `extensions.chartPartnerMirrorForPartnershipIds` eine reine Partner-Spiegelkarte. Diese Spiegelkarte:

- besitzt keine eigenen Eltern im Chart;
- besitzt keine Kinder im Chart;
- erzeugt keine zweite Partnerschaft im Familienmodell;
- dient ausschließlich als sichtbarer Hinweis auf die bereits vorhandene Verbindung.

Die Kinder werden ausschließlich an das fortsetzende Paar geroutet. Am nicht fortsetzenden Paar dürfen weder Kinderkarten noch Eltern-Kind-Linien wiederholt werden. Wenn beide Herkunftszweige das Paar zeigen sollen, können deshalb beide realen Personen je zweimal als Karte sichtbar sein, während `family.persons`, `family.partnerships` und `family.parentages` unverändert eindeutig bleiben.

### Verbindlicher Referenzfall: Arawn und Mervyne Wylan

- Arawn ist Sohn von Iolyn Wylan und Gladys Grawn und führt den gemeinsamen Nachkommenzweig fort.
- An Arawns regulärer Karte erscheint eine Mervyne-Kartenerscheinung; nur unter diesem Paar stehen Neala, Liam und Majella.
- Mervyne bleibt als Tochter von Gendry Wylan und Arryn Blodyn in ihrem Herkunftszweig sichtbar.
- Dort erscheint Arawn nur als Partner-Spiegelkarte ohne Nachkommenlinie.
- Die fachliche Ehe `marriage-mervyne-arawn` sowie die drei Elternschaften existieren trotzdem jeweils nur einmal.

Diese Festlegung ist als Regressionstest zu sichern. Der Test muss sowohl die fachlichen Eltern als auch die konkreten Chart-Erscheinungen und deren Kinderlisten prüfen. Eine bloße Zählung der sichtbaren Namenskarten genügt nicht.

## 6. Fachliche Datensätze

Verbindliche Bausteine sind:

- `createFamilyPerson` für Personen;
- `createMarriage` für Partnerschaften aller unterstützten Typen;
- `createParentages` für jede Eltern-Kind-Zuordnung;
- `createMarriedAwayBranch` für eine Person des dargestellten Hauses, die in ein anderes Haus heiratet;
- `createCadetHouseBranch` ausschließlich für ein ausdrücklich neu gegründetes Seitenhaus;
- `createWardAwayBranch` für ein Familienkind, das als Mündel, Page oder Knappe an ein anderes Haus vermittelt wurde;
- `createExtinctBranch` für ein belegtes Linienende.

Verwandtschaftsrollen wie Tante, Cousin oder Großmutter werden nicht gespeichert. Sie werden aus dem Graphen berechnet.

## 7. Hausknoten: direkte Paarbindung

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

## 8. Hardcore-Regel für Zeitsprünge

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

## 9. Portraitworkflow

Jede ausgearbeitete Familie besitzt:

- ein eigenes Mappingmodul `assets/js/data/house-<slug>-portraits.js`;
- lokale Bilder unter `assets/images/portraits/haus-<slug>/`;
- ein `portrait-sources.json` mit Personen-ID und ursprünglicher URL.

Wiederverwendete Standard-Silhouetten werden nicht als Einzelportraits heruntergeladen. Jede andere belegte Quellperson erhält entweder ein vorhandenes geteiltes Portrait oder eine lokale Datei. Manifest-Keys und lokale Mapping-Keys müssen übereinstimmen. Dateien werden auf Existenz, Mindestgröße und gültige Bildsignatur geprüft.

## 10. Registry, Revision und lokale Bestände

Eine ausgearbeitete Familie ersetzt ihre Factory-Leerakte im zuständigen Aggregat. `blankFamily` darf dann nicht mehr wahr sein.

- Neue Quellfassung: `extensions.sourceRevision: 1`.
- Korrektur einer ausgelieferten Fassung: Revision erhöhen.
- Bestehende IDs bleiben stabil, damit keine Alt- und Neufassung nebeneinander entstehen.
- `extensions.registryManagedFields` wird nur für kanonische Felder gesetzt, die eine ältere lokale Fassung zwingend korrigieren müssen.
- Lokale Ergänzungen, Löschmarker und nicht verwaltete Felder bleiben erhalten.

Für jede Revisionserhöhung ist ein Migrationstest erforderlich, der besonders auf doppelte Personen, Partnerschaften und Hausknoten prüft.

## 11. Pflichtprüfungen

Eine Familienakte ist erst fertig, wenn alle folgenden Punkte geprüft sind:

- `assertValidFamily` meldet keinen Fehler.
- Personen-, Partnerschafts-, Elternschafts-, Hausknoten- und Zeitsprunganzahl stimmen mit dem Quelleninventar überein.
- Keine benannte Quellperson fehlt; keine leere Templateperson wurde erfunden.
- Keine Person ist unbeabsichtigt isoliert.
- IDs, Weltpersonen-IDs und Chart-IDs sind eindeutig.
- Jede Partnerschaft und Elternschaft besitzt die erwarteten Teilnehmer.
- Bei mehrfach sichtbaren Personen bleibt die fachliche Person eindeutig; genau eine Paarerscheinung besitzt die gemeinsamen Kinder, alle reinen Partner-Spiegelkarten besitzen keine Kinder.
- Der fortsetzende Zweig einer innerfamiliären Partnerschaft entspricht der ausdrücklichen Quellen- oder Benutzerfestlegung und wird nicht vom Layoutalgorithmus vertauscht.
- Bastardgruppen mit verschiedenen Affären bleiben getrennt und ausdrücklich beschriftet.
- Jeder Hausknoten hängt im konvertierten Chart direkt an seinem `parentPartnershipId`-Paar; ein `ward-away`-Knoten hängt ausschließlich an seiner `parentPersonId`-Person.
- Kein Zeitsprung steht sichtbar parallel zu einem anderen Knoten; Gap-Kinder sind ausschließlich Personen.
- Kein Chartknoten besitzt mehr als zwei Eltern oder mehrere Hierarchiepfade.
- Geteilte Personen, Partnerschaften und Portraits stimmen mit den Gegenakten überein.
- Das Register lädt die ausgearbeitete Familie statt der Leerakte.
- Ein alter lokaler Stand wird ohne Duplikate aktualisiert.
- Alle Projekt- und Firebase-Validierungstests bestehen.
- Abschließend wird die Gesamtansicht im Browser auf Linienführung, Abstände, Bilder und Knotentexte geprüft.

## 12. Fehlerdiagnose

| Symptom | Wahrscheinliche Ursache | Verbindliche Prüfung und Behebung |
| --- | --- | --- |
| Baum erscheint doppelt, vierfach oder häufiger | Ein Chartknoten hat mehrere strukturelle Elternpfade; ein Gap wurde an mehrere Paare gehängt | Chart-IDs, Elternzahl, symmetrische Kanten und Pfadanzahl prüfen; Zeitsprung nur am seriellen Anker führen |
| Hausknoten steht bei der falschen Generation | Hausknoten wurde als normale Fortsetzung behandelt oder besitzt falsche `parentPartnershipId` | Linktyp und exaktes Paar prüfen; Knoten im Router als terminalen Anhang belassen |
| Falsches Hauswappen | Zielhaus wurde aus dem Namen des Ehepartners abgeleitet | `name`, `houseId`, `targetFamilyId`, `emblem` gegen die ausdrückliche Hausgründung oder Wegverheiratung prüfen |
| Beziehung oder Kind fehlt | Quelleninventar und Datensatz wurden nicht vollständig gegeneinander verglichen | Differenz aus Personen-, Partnerschafts- und Parentage-Inventar bilden; keine Layoutannahme verwenden |
| Gemeinsame Kinder erscheinen doppelt | Dieselbe Partnerschaft oder Elternschaft wurde für beide sichtbaren Paarstellen dupliziert; eine Spiegelkarte wurde als zweite fachliche Person behandelt | Fachlich nur eine Partnerschaft und eine Elternschaft je Kind behalten; genau einen fortsetzenden Paarzweig wählen; die zweite Paarstelle ausschließlich mit `chartPartnerMirrorForPartnershipIds` und leerer Kinderliste darstellen |
| Eine innerfamiliäre Ehe setzt den falschen Zweig fort | Der Zyklusrouter hat selbst einen Elternpfad abgetrennt oder die wiederholte Person wurde auf der falschen Seite konfiguriert | Fortsetzungsseite aus Quelle/Benutzerkorrektur festlegen; Partner am Fortsetzungszweig mit `chartRepeatForPartnershipIds` wiederholen; Gegenstelle nur spiegeln; Eltern- und Kinderpfade beider Erscheinungen im Adaptertest prüfen |
| Dieselbe Person wurde wegen einer zweiten Kartenposition doppelt angelegt | Sichtbare Chartkarte und fachliche Person wurden verwechselt | Doppelte Person, Weltidentität und Partnerschaft entfernen; stabile Original-ID behalten; zusätzliche Position ausschließlich über den Personen-Erscheinungsrouter erzeugen |
| Bastarde sind nicht einer Affäre zuzuordnen | Mehrere Kindergruppen teilen nur den Vater oder eine allgemeine Affärenfarbe | Eigene Partnership je Affäre, exakte Mutter in `parentIds`, explizite Kartenbezeichnung und Regressionstest ergänzen |
| Portrait fehlt oder ist falsch | Falsche Personen-ID, ausgelassenes Manifest oder getrennte Weltperson | Mapping, Manifest, lokale Datei und Gegenakte gemeinsam prüfen |
| Register zeigt nur eine leere Familie | Ausgearbeitete Akte ist nicht im Aggregat registriert oder eine veraltete Leerakte überdeckt sie | Import/Aggregat, `blankFamily`, `sourceRevision` und Registry-Priorität prüfen |
| Alte lokale Fehler bleiben sichtbar | Revision oder verwaltete Korrekturfelder fehlen | Revision erhöhen, nur notwendige `registryManagedFields` setzen und Migrationstest schreiben |
| Zeitsprung steht parallel | Mehrere Barrieren derselben Tiefe oder Hausknoten wurde in die Fortsetzung gezogen | Schema-Diagnosen, `family-chart-time-jump-router.js` und unsichtbare Layoutstufe prüfen |

## 13. Fehlerlösungsprotokoll

Wiederkehrende oder strukturell relevante Fehlerlösungen werden hier append-only festgehalten. Eine neue Lösung ersetzt nicht still eine frühere Regel; bei Widerspruch wird die alte Zeile ausdrücklich als überholt markiert.

| Fall | Fehlerbild | Verbindliche Lösung | Abzusichernde Invarianten |
| --- | --- | --- | --- |
| Arawn/Mervyne Wylan | Der Layoutzyklus führte zunächst Mervynes Zweig fort beziehungsweise drohte die gemeinsamen Kinder an beiden sichtbaren Paarstellen zu zeigen | Arawn bleibt unter Iolyn/Gladys der fortsetzende Partner; Mervyne wird dort für die Ehe wiederholt. Unter Gendry/Arryn bleibt Mervyne mit einer kinderlosen Arawn-Spiegelkarte sichtbar | Eine Person und eine Ehe je Identität; Arawn-Eltern Iolyn/Gladys; Mervyne-Eltern Gendry/Arryn; Neala/Liam/Majella nur unter Arawns Paar; Spiegelpaar ohne Kinder; keine zusätzliche Parentage-Linie |
| Yvain/Bronwen Blodyn | Eine ausdrücklich verlangte Teilakte drohte Yvains Kinder zugleich in der Lyndor-Hauptakte und in der Aberdail-Akte fortzuführen | Die Lyndor-Akte enthält Yvain und Bronwen nur bis zum direkt unter ihrem Paar hängenden Aberdail-Hausknoten. Dalvin und Erec werden ausschließlich in `haus-blodyn-aberdail` als Nachkommen geführt | Identische Weltpersonen und Ehe für das Gründerpaar in beiden Akten; genau zwei Elternschaften nur in Aberdail; keine Kinder unter Yvains Paar in Lyndor; Hausknoten verlinkt die Teilakte |
| Wolfshorn/Bleiddorn | Eine auswandernde Teilgruppe sollte als neues Haus erscheinen, ohne aus der vollständigen Herkunftsgenealogie zu verschwinden oder dort wie ein weiteres Kind des Gründerpaares zu wirken | Die Bleiddorn-Akte übernimmt ausschließlich die ausdrücklich ausgewählten Weltpersonen und ihre bestehenden Beziehungen. Ein vorgelagerter Wolfshorn-Knoten ersetzt das Kopieren nicht mitgewanderter Vorfahren; in der Wolfshorn-Akte verweist ein personengebundener `migration-offshoot` seitlich an Hrolf auf Bleiddorn | Identische Weltpersonen, Ehe und Elternschaften in beiden Akten; exakt fünf Personen in Bleiddorn; Hrolf/Halvar direkt unter dem Herkunftsknoten; ausschließlich Ylva/Asgeir unter dem Bleiddorn-Wappen; keine Entfernung aus Wolfshorn; der Rückverweis steht in keiner Kinderliste und verändert keine Generationstiefe |
| Sept Dubhan/Haus Dubhan | Breccans kleine Auswandererfamilie sollte als neues Gwynthor-Haus erscheinen, während die vollständige Sept-Genealogie in Faelaorn erhalten bleibt | Die neue Akte `haus-dubhan-gwynthor` übernimmt ausschließlich Breccan, Eithne, Rogaire und Alpin über den gemeinsamen Migrationsteilakten-Builder. Der Herkunftsknoten verlinkt zur Sept; dort sitzt der Gegenverweis als personengebundener `migration-offshoot` seitlich an Breccan | Identische Weltpersonen, Ehe und Elternschaften; exakt vier Personen in Gwynthor; ausschließlich Rogaire/Alpin unter dem neuen Hauswappen; keine Entfernung aus der Sept-Akte; der Rückverweis steht in keiner Kinderliste und verändert keine Generationstiefe |
| Ruprecht/Otto von Hochreuth (überholt) | Die erste Umsetzung stellte Ruprecht und Otto als zwei ursprünglich gleichwertige Erbanwärter dar | Diese Auslegung ist durch die nachfolgende Benutzerkorrektur ausdrücklich überholt. Sie darf weder wiederhergestellt noch aus alten lokalen Daten zurückgemischt werden | Keine Seniorerben- oder Vormundschaftserzählung für Otto; die alten Personen Arnulf, Dietrich und Hildebrand sowie ihre Beziehungen werden bei Revision 2 entfernt |
| Ruprecht/Otto von Hochreuth (Erbfolge gültig, Darstellungsnamen überholt) | Die erste Rekonstruktion gab Otto fälschlich einen ursprünglichen Senioranspruch und erzeugte damit eine genealogische Grauzone, obwohl Ruprecht regulär geerbt hatte | Unter dem Stammwappen stehen drei Brüder und die wegverheiratete Schwester. Linie A fällt 1699 durch den Tod Albrechts und seiner drei Söhne beim Jagdunglück aus; danach erben Wilhelm und Ruprecht aus Linie B. Otto stammt aus Linie C und wird erst 1736 durch Haus Roden eingesetzt, weil seine Mutter eine Roden ist und Ruprechts Linie politisch für verwirkt erklärt wird. `extensions.successionConflict` trennt die rechtmäßige Erbfolge ausdrücklich von der späteren Lehensentscheidung. Die Buchstabenbezeichnungen sind durch die nächste Korrektur für jede sichtbare Darstellung überholt | Exakt vier Geschwisterzweige direkt unter dem Wappen; Ruprecht ist Wilhelms Sohn und rechtmäßiger Herr 1708–1736; Otto ist Leopolds Sohn und vor 1736 kein gleichrangiger Erbe; alle vier männlichen Opfer sterben 1699; Ruprechts beide Söhne werden gemeinsam mit ihm enterbt; Dorothea besitzt einen direkten Wegverheiratet-Knoten; Angeheiratete tragen keine erfundenen Nachnamen |
| Hochreuth: neutrale Karten, Roden-Wappen und weitere Beziehungen | Sichtbare Buchstabenlinien und ruprechtbezogene Verwandtschaftstitel machten Ruprecht unnötig zum Betrachtungsfokus; Luise und Friederike fehlten als Wegverheiratete, Friedrichs Verlobung und Charlottes Roden-Wappen waren nicht dargestellt | Karten benennen nur unmittelbare oder dynastische Tatsachen. Luise, Friederike und Dorothea besitzen jeweils eine Ehe und einen direkt daran gebundenen Knoten zum unbekannten Haus. Friedrich und Ottilie erhalten eine beendete Verlobung. Charlotte heißt als ausdrückliche Ausnahme `Charlotte Roden`, gehört fachlich zu `house-roden` und verwendet das lokal gespeicherte Roden-Wappen | Kein `Linie A–D`, `Brüderlinie` oder ruprechtbezogener Großonkel-/Onkeltext in den sichtbaren Familiendaten; exakt drei `married-away`-Knoten; Friedrich/Ottilie als Verlobung ohne Kinder; alle vier Jagdopfer mit dem exakten Kartentext `Tod beim Jagdausflug`; Roden-Wappen lokal auslieferbar; Revision 3 ergänzt alle Entitäten in älteren lokalen Ständen ohne Dopplung |

### 13.1 Auswanderungszweig ist kein Nachkomme

- Ein in einer Herkunftsakte verbleibender Rückverweis auf ein neu aufgeblühtes Haus verwendet `linkType: 'migration-offshoot'`.
- Der Zweig hängt mit `parentPersonId` an der auswandernden Gründerperson, niemals mit `parentPartnershipId` am Paar.
- Der Adapter hält diesen Typ vollständig aus `rels.parents` und `rels.children` heraus. Er wird als kleines, klickbares Wappen seitlich an der Personenkarte gerendert.
- Echte Kadettenhausgründungen, Wegverheiratet-Knoten und Linienenden bleiben genealogische Knoten unter dem maßgeblichen Paar. `migration-offshoot` darf für diese Fälle nicht als Ersatz verwendet werden.
- Bei einer Umstellung bereits lokal gespeicherter Akten müssen `linkType`, beide Ankerfelder und der Untertitel als `registryManagedFields` geführt und die `sourceRevision` erhöht werden.

## 14. Abschlussprotokoll

Jede neue oder korrigierte Familie wird mit folgendem Kurzprotokoll abgeschlossen:

- Quelle und maßgebliche Benutzerkorrekturen;
- Anzahl Personen, Partnerschaften, Elternschaften, Hausknoten und Zeitsprünge;
- wiederverwendete Weltpersonen und Gegenbeziehungen;
- bewusst nicht übernommene Platzhalter;
- dokumentierte Widersprüche und verbleibende Unsicherheiten;
- verwendete Mehrfachkarten, festgelegter Fortsetzungszweig und ausdrücklich kinderlose Spiegelpaare;
- neu erkannte Fehlerklasse und Eintrag im Fehlerlösungsprotokoll;
- `sourceRevision`;
- Ergebnis der Tests und Browserprüfung.

Die zentralen technischen Normanker sind `assets/js/data/family-record-builders.js`, `assets/js/domain/family-schema.js`, `assets/js/adapters/family-chart-person-appearance-router.js`, `assets/js/adapters/family-chart-time-jump-router.js`, `assets/js/services/family-registry-upgrade.js` und `assets/js/data/families.registry.js`.
