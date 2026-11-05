"""Bounded editorial reconciliation of the 19 diagnostic source records."""
import json
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent
path = BASE / 'source-content.json'
document = json.loads(path.read_text(encoding='utf-8'))
assert document['status'] == 'pending-editorial-review'
houses = {row['slug']: row for row in document['houses']}
reviews = {}


def review(slug, overview, *decisions):
    house = houses[slug]
    house['safeCanonicalSummary'] = overview
    house['decisions'] = list(decisions)
    old = house['reviewedSections']['overview']
    house['reviewedSections']['overview'] = overview + ('\n\n' + old if old else '')
    reviews[slug] = {'safeCanonicalSummary': overview, 'decisions': list(decisions)}


def put(slug, key, value):
    houses[slug]['reviewedSections'][key] = value


def change(slug, key, old, new):
    value = houses[slug]['reviewedSections'][key]
    assert old in value, (slug, key, old[:50])
    put(slug, key, value.replace(old, new))


for house in houses.values():
    house['canonical']['sourceFiles'] = [name.replace('modules/kronental/', 'modules/heldenwacht/') for name in house['canonical']['sourceFiles']]
    if house['slug'] in ('grimr', 'skaife', 'holmr'):
        house['canonical']['historicalEra'] = 'historical-time-open'
    for key, value in house['reviewedSections'].items():
        value = value.replace('Kronental', 'Heldenwacht').replace('vor 20 Jahren', '')
        value = re.sub(r' {2,}', ' ', value)
        value = re.sub(r'\s+([,.;:!?])', r'\1', value)
        put(house['slug'], key, value)

review('vaeren', 'Clan Vaeren ist das Königshaus Aldrimars mit Sitz in Heldenwacht. Das gleichnamige königliche Jarltum wurde früher Kronental genannt. Seine Geschichte verbindet die Annäherung von Norrnaigh und Glaennath mit den dynastischen Konflikten des Prätendentenkriegs.',
       'Königshaus, kein untergeordnetes Lehnshaus. Aktueller territorialer Name Heldenwacht; bestehender Registerpfad und Profilwert Kronental bleiben unverändert.',
       'Die Vorlage ist weitgehend leer und bietet vor allem den Prätendentenkrieg. Bestehenden Gebiets- und Hauskontext ergänzen, ohne eine neue Gründerchronik oder aktuelle Ratsbesetzung zu erfinden.',
       'Historische Heiratsbündnisse bleiben Erzählung. Unbelegte negative Fruchtbarkeits- und Nachkommensbehauptungen nicht zur Ergänzung von Genealogien oder Personenakten verwenden.',
       'Im aktuellen Gebietstext sind König, delegierter Jarl, Thane und Hesir unterschiedliche Verantwortungen; die delegierten Ämter sind nicht automatisch erblich. Keine neue Ämtervergabe oder aktuelle Amtsträgerliste aus Altvorlagen.')
put('vaeren', 'history', 'In der Epoche der Seefahrer wurden Norrnaigh-Kämpfer im späteren Heldenwacht angesiedelt, um die örtlichen Glaennath gegen weitere Überfälle zu unterstützen. Zu ihnen gehörten auch die Vaeren. Aus engerem Zusammenleben und der Annäherung verschiedener Gemeinschaften erwuchs die aldrimarische Identität. Die Überwindung der Isvanyr gehört zu den prägenden Überlieferungen ihrer frühen Herrschaft.')
put('vaeren', 'holdings', 'Heldenwacht ist der Sitz des Königshauses. Das königliche Jarltum umfasst das Tal der Helden sowie verbundene Küsten-, Insel- und Grenzgebiete. Im Tal der Helden liegen das königliche Thanentum und der Bannkreis der Hauptstadt. Jarls-, Thanen- und Hesirenaufgaben können Angehörigen der Vaeren übertragen werden; diese Ämter fallen beim Tod ihrer Träger an den König zurück und werden von ihm neu vergeben.')
put('vaeren', 'cultureReligion', 'Das Haus steht im politischen und kulturellen Mittelpunkt Aldrimars. Im höfischen Heldenwacht begegnen sich nordische Clanbindung, städtisches Handwerk, Seefahrt und das gemeinsame Erbe von Norrnaigh und Glaennath.')
change('vaeren', 'conflictsAlliances', 'Trotz dieser Allianzen konnten keine Nachkommen gezeugt werden, was die Verbindungen letztlich schwächte.', 'Diese Ehen verbanden die rivalisierenden Thronansprüche mit weiteren einflussreichen Häusern.')
change('vaeren', 'conflictsAlliances', 'Allerdings brachte auch diese Bindung keine Nachkommen, da beide noch während ihrer Hochzeit ermordet wurden.', 'Die Verbindung endete tragisch, als beide noch während ihrer Hochzeit ermordet wurden.')

review('riesentod', 'Clan Riesentod ist ein Hesirenclan von Heldenwacht im Dienst des Königshauses Vaeren. Kraftvolle Krieger- und Seefahrertradition und die Sicherung des königlichen Hinterlands prägen seine Stellung.',
       'Rang Hesire, Sitz Heldenwacht und Dienst an Vaeren bleiben erhalten. Keine hypothetischen Adelsränge oder zusätzliche Stammsitze aus Bildern ableiten.',
       'Die Quelle bietet vor allem den Prätendentenkrieg. Bestehende Verteidigungsaufgaben im heutigen Gebiet ergänzen; keine erfundenen Familienbräuche.',
       'Zurin ist im aktuellen Personenbestand Zurik Eisenbieger. Persönliche Ehe- und Verwandtschaftsangaben bleiben historischer Text; keine Graphänderungen.',
       'Die alte Wertung, der Clan habe nach gescheiterter Hochzeit mittellos dagestanden, bezeichnet den politischen Rückschlag, nicht einen belegten vollständigen Vermögensverlust.')
put('riesentod', 'holdings', 'Der Familiensitz liegt in Heldenwacht. Eigene Wachorte und die Zusammenarbeit mit anderen Befestigungen sichern die Bergpässe und Handelsrouten des Hinterlands. Gemeinsam mit den Eisenbiegern bekämpfen die Riesentod Banditen in den westlichen Gebirgen; Rúnvakt bleibt dabei gesondert verwaltet.')
change('riesentod', 'conflictsAlliances', 'Zurin Eisenbieger', 'Zurik Eisenbieger')
change('riesentod', 'conflictsAlliances', 'stand der Clan mittellos da.', 'hatte der Clan seine erhoffte dynastische Verbindung verloren.')
change('riesentod', 'conflictsAlliances', 'Tonvar, der Oberhaupt des Clans,', 'Tonvar, das Oberhaupt des Clans,')

review('eisenbieger', 'Clan Eisenbieger ist ein Hesirenclan von Heldenwacht unter den Vaeren. Seine Geschichte ist eng mit der königlichen Familie und den politischen Erschütterungen des Prätendentenkriegs verbunden. Heute trägt er zur Sicherheit der Wege und Bergpässe im königlichen Hinterland bei.',
       'Sitz Heldenwacht, Rang Hesire und Dienst an Vaeren bleiben unverändert. Der Familienname allein ist kein Beleg für eine erfundene Schmiedegilde oder zusätzliche Betriebe.',
       'Zurin wird nach der bestehenden Identität zu Zurik korrigiert; seine relative Altersangabe wird ohne neues Bezugsjahr ausgelassen.',
       'Der Aufstand und die spätere Verbindung mit Riesentod bleiben historische Erzählung. Keine neuen Todesdaten, Elternkanten oder aktuellen Hofämter.',
       'Rúnvakt ist ein gesondert verwalteter Ort, kein allein aus Kooperation abgeleiteter Eisenbieger-Besitz.')
put('eisenbieger', 'holdings', 'Der Sitz des Clans liegt in Heldenwacht. Mit den Riesentod sichert er das Inland, insbesondere Bergpässe und Handelsrouten. Eigene Wachorte und die Zusammenarbeit mit weiteren Befestigungen dienen der Abwehr von Banditen; die örtliche Kooperation begründet keinen Besitz an allen beteiligten Burgen.')
for key in ('conflictsAlliances',):
    put('eisenbieger', key, houses['eisenbieger']['reviewedSections'][key].replace('Zurin', 'Zurik').replace('einer Mitglied', 'einem Mitglied').replace('hinrichtet wurde', 'hingerichtet wurde'))
change('eisenbieger', 'conflictsAlliances', 'der zu diesem Zeitpunkt etwa 30 Jahre alt war,', 'der nach dem Aufstand eine neue Stellung finden musste,')

review('sturmgeborener', 'Clan Sturmgeborene ist ein Hesirenclan von Heldenwacht und dient dem Königshaus Vaeren. Als einflussreiches höfisches Haus und erfahrener Seefahrerclan war er besonders eng mit der Grünen Fraktion des Prätendentenkriegs verbunden.',
       'Quellslug sturmgeborener bezeichnet die bestehende ID haus-sturmgeborene, keine neue Familie oder Namensänderung. Heutiger Sitz Heldenwacht, Rang Hesire.',
       'Sverre und Eola gehören zur historischen Erzählung; keine heutige Ratsbesetzung oder neue Amtseinsetzung daraus ableiten.',
       'Die gemeinsamen Gegenquellen erklären die gescheiterten Riesentod-/Eisenbieger-Ehen als Verbindungen zur königlichen Linie. Nicht behaupten, beide Häuser hätten um nicht belegte Sturmgeborene-Ehen geworben.',
       'Gulvig wird zum bestehenden Clan Gullvig korrigiert. Vorlagen- und Hoflisten bleiben ausgenommen; keine Militärstatistiken.')
put('sturmgeborener', 'holdings', 'Heldenwacht ist der Familiensitz. Gemeinsam mit anderen königlichen Vasallen sichern die Sturmgeborenen Seewege und Handelsschiffe. Stützpunkte wie Seewinkel und die Zusammenarbeit entlang der Küste ermöglichen Patrouillen und die Abwehr von Überfällen, ohne alle beteiligten Orte zu eigenen Clanburgen zu machen.')
change('sturmgeborener', 'conflictsAlliances', 'die um Ehen mit den Sturmgeborenen buhlten und in Ungnade fielen.', 'deren erhoffte Ehen mit der königlichen Linie scheiterten und die später in Ungnade fielen.')
change('sturmgeborener', 'conflictsAlliances', 'Triviale, aber erwähnenswerte positive Beziehungen', 'Weitere gute Beziehungen')
change('sturmgeborener', 'conflictsAlliances', 'Gulvig', 'Gullvig')

review('frostauge', 'Clan Frostauge ist ein Hesirenclan von Heldenwacht im Dienst der Vaeren und zählt zu den großen Seekriegergeschlechtern des königlichen Jarltums. Der heutige Hesir ist Aegir Frostauge. Die Fehde mit dem abtrünnigen Zweig Frostzorn belastet die Küsten bis heute.',
       'Heutiger Rang Hesire und Sitz Heldenwacht; Aegirs Amt und Inghards Hafenverwaltung sind im aktuellen Personenbestand belegt.',
       'Tötung Detlaffs: Frostauge-Alttext widerspricht Wellenschild und Schwarzblut, die Fenrir Wellenschild nennen. Die Frostauge-Passage wird ohne individuellen Täter neutral redigiert; keine neue Entscheidung zum Kriegsablauf.',
       'Njödr und Ygritte werden nach bestehenden Identitäten zu Njörd und Yrgitte korrigiert. Personentrivia wird sprachlich redigiert, nicht als neue Traits, Erbregel oder Beziehungen importiert.',
       'Hlérs und Gymirs Wettstreit um Gulla begründet keine gültige Erbregel; Gangrs kanonischer Erbenstatus bleibt erhalten.',
       'Gründer Vorn Frostauge ist von heutigem Vorn Frostzorn (geboren1697) zu trennen. Keine Genealogieübernahme und keine neue Amtszeit.')
put('frostauge', 'holdings', 'Der Sitz liegt in Heldenwacht. Inghard Frostauge verwaltet den Hafen der Hauptstadt. Die Seewege und die Küstenverteidigung verbinden den Clan mit anderen Seefahrerhäusern; gegenüber dem Piratengebiet der Sirenen-Zahn-Riff-Inseln arbeiten die Frostaugen mit den Wellenschilden zusammen.')
change('frostauge', 'conflictsAlliances', 'Die Frostaugen machten sich in den Konflikten auch Feinde, unter anderem durch das erschlagen von Individuen wie Dettlaf Schwarzblut und durch zahlreiche weitere Clansleute während des Krieges, die ihre Feindschaften vertieften.', 'Die Kriegshandlungen vertieften zugleich die Feindschaft mit gegnerischen Seefahrerclans, darunter den Schwarzblut.')
put('frostauge', 'conflictsAlliances', houses['frostauge']['reviewedSections']['conflictsAlliances'].replace('Njödr', 'Njörd').replace('Ygritte', 'Yrgitte'))
houses['frostauge']['reviewedTrivia'] = [
    'Yrgitte Frostauge gehörte zu Rag Blauzahns Gefährten und wurde später Erzpatriarchin Aldrimars.',
    'Aegir Frostauge ist der amtierende Hesir und gilt als geselliger, politisch gewandter Mann.',
    'Inghard verwaltet den Hafen von Heldenwacht und wacht über die Finanzen der Familie.',
    'Gangr ist Aegirs Sohn und Erbe des Hesirenamts; er genießt das gesellige Leben und seine Familie.',
    'Fjörgynn zieht Seefahrt und Kriegerleben dem Streit um den Hesirentitel vor.',
    'Hlér und Gymir wetteifern um Gulla Gullvigs Hand und verbinden damit eigenen Ehrgeiz auf den Titel; diese Hoffnungen stehen neben Gangrs Erbenstellung.',
    'Garm genießt die Freuden des Lebens und hält sich aus politischen Machtkämpfen weitgehend heraus.'
]

review('wellenschild', 'Clan Wellenschild ist ein Hesirenclan von Wellenruh auf den Klageschild-Inseln und dient den Vaeren. Seine Gründungserzählung führt auf Thord Wellenschild zurück, der Wellenruh von Piraten befreit haben soll. Seefahrt, Schwimmprüfungen und verlässliche Gemeinschaft prägen das Haus.',
       'Wellenruh/Klageschild-Inseln ist der heutige Sitz; kein neuer Clan aus der Mehrzahl Wellenschilde. Der Huskarlclan Eibenschild sitzt gesondert in Vagaborg und dient Wellenschild.',
       'Thords Schwimmen und seine überhöhten Taten bleiben ausdrücklich Gründungslegende, keine automatische körperliche Fähigkeit aller Angehörigen. Begleitboote und Rettung Erschöpfter bleiben bei der Mutprobe genannt.',
       'Vågaborg wird zur heutigen Ortsform Vagaborg berichtigt. Sundkrone und Lothirblick gehören gesonderten unbenannten Clans; keine Namensvergabe oder Zuschreibung an Eibenschild.',
       'Dettlaff wird zur aktuellen Quellform Detlaff berichtigt. Militärstatistiken und Hof-/Genealogietabellen bleiben ausgenommen.')
change('wellenschild', 'holdings', 'Vågaborg', 'Vagaborg')
put('wellenschild', 'holdings', houses['wellenschild']['reviewedSections']['holdings'] + '\n\nWellenruh bleibt der Sitz der Wellenschilde. In Vagaborg dienen ihnen die Eibenschild als gesonderter Huskarlclan.')
change('wellenschild', 'conflictsAlliances', 'Dettlaff', 'Detlaff')
change('wellenschild', 'conflictsAlliances', 'wurde der Clan zunächst von den Heckenrittern erobert', 'wurde sein Herrschaftsgebiet zunächst von den Heckenrittern erobert')
change('wellenschild', 'knighthood', 'Wurfaxten', 'Wurfäxten')
change('wellenschild', 'conflictsAlliances', 'doch Nachtragend', 'doch nachtragend')

review('gullvig', 'Clan Gullvig ist ein Hesirenclan von Kastav im Hesirentum Möwenfels unter den Vaeren. Handel, Diplomatie und anpassungsfähige Seefahrt bestimmen seine Stellung. Sten „die Möwe“ sicherte Kastav durch Verhandlungen und einen Bund mit den Küstenkriegern.',
       'Kastav/Möwenfels, Rang Hesire und heutige Dienstbindung Vaeren bleiben maßgeblich.',
       'Die Quelle lässt Sten in Krähenmoor mit Vaeren verhandeln, während der gesamte Handlungszusammenhang und der aktuelle Gebietskontext die Varangr meinen. Dieser erkennbare Namensfehler wird berichtigt.',
       'Küstenkrieger und politische Ehe bleiben historische Prosa. Keine neuen Familien-, Ehe- oder Mündelschaftskanten importieren.',
       'Aegyra/Seemaid und die Nimue-/Njama-Anrufung bleiben Glaubenspraxis des Clans, keine neue religionsweite Identitätsentscheidung.',
       'Die politische Annäherung an die Roten ist keine vollständige Tilgung der Kriegserinnerung. Spannungen mit Schwarzblut werden als allmählich abklingend beschrieben.')
change('gullvig', 'history', 'um mit den Vaeren zu verhandeln.', 'um mit den Varangr zu verhandeln.')
change('gullvig', 'traditions', 'Göttin der der Meere', 'Göttin des Meeres')
change('gullvig', 'traditions', 'bekannt als Njama in der Sprache des Nordens', 'die sie in nordischer Anrufung als Njama ehren')

review('wellensaenger', 'Clan Wellensänger ist ein Hesirenclan von Burg Amol in Wellenklang und dient weiterhin den Vaeren. Er verbindet aldrimarische Seekriegertradition mit vennyrischer Ritterlichkeit. Nimue und Tethyra, Pilgerfahrten und die Erkundung der See prägen seine Kultur.',
       'Das Wort einst unter Vaeren bedeutet keinen heutigen Austritt aus der Lehnsherrschaft. Rang Hesire, Amol/Wellenklang und Vaeren bleiben unverändert.',
       'Vennyrische Kulturprägung ist keine Verlegung des heutigen Familiensitzes oder eigene Exilakte.',
       'Relative Datierung von Vennyrs Fall vor zwanzig Jahren auslassen; kein neues Ereignisjahr errechnen. Llanforwyn-Pilgerfahrt als gelieferte Kulturtradition erhalten, ohne neue Personen oder Klassen anzulegen.',
       'Schwarzblut, Silberblut und Blutstahl stehen historisch auf der gegnerischen Seite; die wertende Behauptung falsche Seite wird neutralisiert. Keine Militärstatistiken.')
change('wellensaenger', 'overview', 'der einst unter den Vaeren diente', 'der den Vaeren dient')
change('wellensaenger', 'history', 'der einst unter den Vaeren von Heldenwacht diente', 'der im Dienst der Vaeren von Heldenwacht stand und steht')
change('wellensaenger', 'conflictsAlliances', 'da sie auf der falschen Seite des Konflikts standen.', 'da sie auf der gegnerischen Seite des Konflikts gestanden hatten.')
change('wellensaenger', 'traditions', 'heiligtüm', 'Heiligtum')

review('spindelschlag', 'Haus Spindelschlag ist ein wohlhabender Bürgerclan und Thengr von Spindelheim unter dem Königshaus Vaeren. Schneiderkunst, Pelzverarbeitung und die Gilde Gerdurs Meisterstich tragen seinen Einfluss. Die Familie besitzt bis heute keinen Adelsbrief.',
       'Rang commoner bleibt erhalten. Thengr und königliche Privilegien bedeuten keine Erhebung zum Hesirenhaus.',
       'Moderne main-Vorlage mit Einführung und abweichender Nummerierung vollständig gelesen; Beispieldialog, Titel hier einfügen und sonstige Platzhalter ausgeschlossen.',
       'Die überlieferte Verbindung Gerdurs mit Galmar bleibt Hausgeschichte. Kein Nachimport von Hof-/Genealogietabellen.',
       'Torrenheim war laut aktuellem Gebietstext nur eine erwogene künftige Belohnung. Keine aktuelle Vergabe oder Sitzverlegung: Spindelheim bleibt belegt, Torrenwacht vakant.')
houses['spindelschlag']['warriorSectionTitle'] = 'Hausleben'
change('spindelschlag', 'values', 'mit Worte, Gold', 'mit Worten, Gold')

review('suedstahl', 'Clan Südstahl ist ein junger Huskarlclan von Heldenwacht unter den Vaeren. Salah aus Istharan und Gormlaith Frisealach gründeten ihn 1691. Südliche Schwertkunst, Seefahrt und Gelehrsamkeit verbinden sich mit albischem Erbe und dem Wahlspruch „Loyalität vor Blut“.',
       'Die einmalige Quellform Südwind widerspricht Überschrift, Chronik und bestehender Akte; sichtbar Südstahl verwenden, keine zusätzliche Familie.',
       'Heutiger Huskarlrang, Sitz Heldenwacht, Gründung1691 und Vaeren-Bindung bleiben maßgeblich. 1689/1690/1691 sind ausdrücklich erzählte Chronikdaten, keine neuen Amtszeiten für heutige Nachkommen.',
       'Die widersprüchliche pauschale Blutbehauptung weder Glaennath noch Norrnaigh wird nicht übernommen; südliche Herkunft und Gormlaiths belegtes albisches Erbe neutral verbinden.',
       'Universität und Schwertschule sind ausdrücklich gelieferte Einrichtungen, keine zusätzlichen Registersitze. Markt der Fortuna ist die bestehende Kaufmannsgilde; keine neue Gildenakte.',
       'Modernes main-Format vollständig erfasst; keine Beispieldialoge, Hof- oder Stammbaumdaten importiert.')
change('suedstahl', 'overview', 'Clan Südwind', 'Clan Südstahl')
put('suedstahl', 'cultureReligion', 'Südstahl verbindet die südliche Herkunft Salahs und das albische Erbe Gormlaiths mit einer nordischen Wahlheimat. In Heldenwacht nahm das Haus aldrimarische Sitten an, ohne den Respekt vor seinen Gründern und deren Herkunft aufzugeben.\n\nSeine südlichen Bräuche gelten als Teil eines gemeinsamen Weges. Die Verbindung verschiedener Überlieferungen prägt einen Clan, der Wissen, Seefahrt und Loyalität höher schätzt als den Anspruch auf eine einzige Abstammung.')
change('suedstahl', 'holdings', 'und Verkaufen', 'und verkaufen')

review('albholz', 'Clan Albholz ist ein junger Huskarlclan von Heldenwacht unter den Vaeren. Albhric „Alberick“ gründete ihn 1691. Kräuterkunde, Wachsamkeit und das Erbe des Druidenhains verbinden sich mit nordischer Bodenständigkeit und der Erinnerung an Rag Blauzahns Wintersonne.',
       'Sitz Heldenwacht und Huskarlrang bleiben erhalten; der Druidenhain ist Herkunftskontext, kein neuer heutiger Registerort.',
       'Albhric/Alberick bezeichnet dieselbe bestehende Identität. Historische Verbindung zu Liorain Grünhand nur als Text; keine neue Genealogie oder aktuelle Amtsbesetzung.',
       'Kräuterwissen, Wurzelprüfung und Schattenwege sind gelieferte öffentliche Hauskultur. Keine privaten Dossiers oder Fleischsammler-Quellen verwendet; keine neuen Traits, Spionagepersonen oder Geheimnetz-Datensätze.',
       'Tavernen und Geschäfte bleiben unbenannte betriebliche Besitzungen; keine neuen Orts- oder Gildenakten erfinden.')
change('albholz', 'overview', 'Mut und Schmutz im Herzen, um einen zu verdienen.', 'Mut und Beharrlichkeit, um sich einen eigenen Namen zu verdienen.')
change('albholz', 'overview', 'einer fernen Welt', 'einer fernen Heimat')
change('albholz', 'holdings', 'Geschäfte die', 'Geschäfte, die')

for slug, title in (('wellenkrone', 'Wellenkrone'), ('daemmerrufer', 'Dämmerrufer')):
    review(slug, f'Clan {title} ist ein Huskarlclan von Heldenwacht im Tal der Helden und dient dem Königshaus Vaeren.',
           'Die moderne Vorlage enthält ausschließlich Platzhalter und keinen individuellen Erzähltext. Nur die aktuelle Rang-, Sitz- und Dienstbindung übernehmen.',
           'Kein Motto, Gründungsdatum, Beruf, Ritual, eigener Hof oder Clanführer aus dem Namen oder der Darstellung erfinden.',
           'Beispieldialog, Titelplatzhalter und leere Hof-/Genealogietabellen vollständig ausgeschlossen. Keine Militärstatistiken.')
    put(slug, 'holdings', 'Der belegte Familiensitz liegt in Heldenwacht im Tal der Helden.')

review('frostzorn', 'Clan Frostzorn ist ein fortlebender, abtrünniger Zweig der Frostaugen auf den Sirenen-Zahn-Riff-Inseln. Sein heutiger Sitz ist Vintrefjord; das Oberhaupt heißt Vorn Frostzorn. Das Haus besitzt keinen anerkannten Adelsrang und untersteht keinem Lehnsherrn.',
       'Aktiv und abtrünnig, nicht ausgestorben. Rang unknown ist kein anerkannter Adel; keine neue Vasallenstellung.',
       'Vorn Frostauge(1620–1673), Gründer, ist eine andere Generation als Vorn Frostzorn, geboren1697 und heutiges Oberhaupt.1697 ist keine Amtsantrittsjahreszahl; Arvid nicht als Oberhaupt übernehmen.',
       'Leifrics verweigertes Lösegeld ist Teil der parteilichen Gründungserzählung; keine neue persönliche Schuld- oder genealogische Entscheidung. Benjens Gefangenschaft und Hinrichtung sowie Gründers Holmgang sind aktuell belegt.',
       'Vintrefjord war ein aufgegebener Wellensänger-Ort und ist heute besetzter Ruinenhort/Lager, kein neu anerkanntes Lehen. Die Gruppenkategorie Abtrünnige Clans ist keine territoriale Baronie.',
       'Piraterie und Konflikt mit Frostauge folgen dem aktuellen Gebietstext; keine Militärstatistiken oder Hoflisten.')
for key in houses['frostzorn']['reviewedSections']:
    put('frostzorn', key, houses['frostzorn']['reviewedSections'][key].replace('Sirenenzahn Riff-Inseln', 'Sirenen-Zahn-Riff-Inseln'))
change('frostzorn', 'history', 'Stattdessen ließ er seinen Vetter in der Fremde verrotten und trat selbst an die Spitze des Clans, gestützt durch das Chaos des Krieges und die Notwendigkeit einer starken Führung.', 'In der Überlieferung der Frostzorn gilt diese Weigerung als Verrat an Benjen. Leifric trat während des Krieges selbst an die Spitze der Frostaugen, während Benjen in Gefangenschaft starb.')
put('frostzorn', 'holdings', 'Die Sirenen-Zahn-Riff-Inseln bieten kaum fruchtbares Land, aber schwer zugängliche Buchten und Verstecke. Vintrefjord, einst von den Wellensängern genutzt und später aufgegeben, dient den Frostzorn heute als besetzter Ruinenhort und Lager. Von der Inselgruppe aus überfallen sie Küstenorte und Handelsschiffe. Die tatsächliche Kontrolle begründet keine anerkannte Herrschaft oder Adelsstellung.')

review('grimr', 'Clan Grimr war ein Norrnaigh-Haus mit letztem überliefertem Sitz in Torrenheim. Nach seiner Verbannung aus Skymar und Myrhamn endete die Herrschaft in einer gewaltsamen Unterwerfung. Das Haus ist erloschen; sein genauer Rang bleibt offen.',
       'Torrenheim ist ein realer historischer Sitz, kein Kulturordner. Bestehender Rang unknown bleibt erhalten.',
       'Vorlage ist inhaltlich leer. Verwendete Chronik stammt ausschließlich aus der aktuellen Torrenwacht-Gebietsseite, nicht aus den gelieferten Hof-/Stammbaumtabellen.',
       'Grimr folgte in Torrenheim auf Holmr und Skaife. Keine pauschale antike Einstufung: Skaife bestand noch im Prätendentenkrieg; genaue Erlöschensdaten bleiben offen.',
       'Schrecken Torrenheims durch Blutbund-Kopfgeldjäger auf Kronenauftrag ist ausdrücklicher heutiger öffentlicher Gebietstext. Keine privaten Dossiers benutzt. Torrenwacht bleibt vakant, kein Nachfolger eingesetzt.')
put('grimr', 'history', 'Die Grimr verwalteten früher Skymar und Myrhamn vor Heldenwachts Küste. Ein König entzog ihnen diese Verantwortung und verbannte sie nach Torrenheim, wo zuvor Holmr und später Skaife regiert hatten.\n\nDie Armut des neuen Gebiets führte zu Piraterie und Banditentum. Zur Unterwerfung der rebellischen Grimr wurden Kopfgeldjäger des Blutbundes eingesetzt. Der Kronenauftrag eskalierte zur Auslöschung des Hauses, die als Schrecken Torrenheims in Erinnerung blieb.')
put('grimr', 'holdings', 'Skymar und Myrhamn gehörten zu ihren früheren Verwaltungsgebieten. Torrenheim war ihr letzter Sitz. Heute liegen Stadt und Festung in Trümmern; Banditen und Piraten nutzen die Ruinen. Torrenwacht ist vakant, und die Krone hat keinen neuen regierenden Clan eingesetzt.')
review('skaife', 'Clan Skaife war ein Norrnaigh-Haus von Torrenheim in Torrenwacht. Es regierte nach den Holmr und noch zur Zeit des Prätendentenkriegs. Nach seinem Erlöschen folgten die Grimr. Sein genauer Hausrang bleibt offen.',
       'Die persönliche Bezeichnung Thaldric als Hesir in der Altquelle überschreibt das heutige offene Rangfeld des Hauses nicht.',
       'Skaife ist historisch erloschen, aber im Prätendentenkrieg noch tätig; keine pauschale antike Einstufung oder erfundenes Erlöschensdatum.',
       'Aktuelle Torrenwacht-Geschichte hat Vorrang: Holmr→Skaife→Grimr, heute vakant. Keine Wiederbelebung oder heutige Vergabe.',
       'Wertende Floskeln unbedeutend und leider werden sachlich redigiert; Schutz der Stadt und der Handelswege erhalten. Militärstatistiken und Tabellen ausgeschlossen.')
put('skaife', 'history', 'Die Skaife herrschten in Torrenheim und sicherten den Zugang zum damaligen Vennyr. Die Stadt war ein Durchgangs- und Anlaufpunkt für Reisende und Händler, wurde aber häufig von Piraten und nordischen Plünderern angegriffen.\n\nWährend des Prätendentenkriegs konzentrierte sich Thaldric Skaife vor allem auf den Schutz der Stadt und ihrer Handelswege. Das Haus beteiligte sich an der Seeverteidigung, stand jedoch nicht im Mittelpunkt der großen Feldzüge. Anhaltende Überfälle und spätere feindliche Übernahmen schwächten die Herrschaft, bis sie schließlich unterging. Nach dem Erlöschen der Skaife übernahmen die Grimr Torrenheim.')
put('skaife', 'holdings', 'Torrenheim war ihr Sitz im nördlichen Torrenwacht. Die Ruinen gehören heute zu einer vakanten Pufferzone gegen Fjordheim, das frühere Vennyr. Eine neue Herrschaft über das gesamte Gebiet wurde noch nicht vergeben.')
review('holmr', 'Clan Holmr war ein Norrnaigh-Haus und gehörte zu den Gründerherren Torrenheims. Nach dem Erlöschen des Hauses ging die Herrschaft an die Skaife und später an die Grimr über. Ein genauer Hausrang und ein Erlöschensdatum sind nicht überliefert.',
       'Die Vorlage ist vollständig leer. Nur Gründungsstellung und Herrschaftsabfolge aus dem aktuellen Torrenwacht-Text sowie bestehenden Sitz Torrenheim verwenden.',
       'Torrenheim ist der historische Sitz; keine fiktive aktuelle Herrschaft, kein neuer Nachfolger und keine pauschale antike Datierung.',
       'Rang unknown unverändert. Keine Namen, Ehen, Todesjahre oder Traditionen aus Hof-/Stammbaumtabellen übernehmen.')
put('holmr', 'holdings', 'Torrenheim war der langjährige Herrschaftssitz der Holmr. Heute ist die Stadt verfallen und Torrenwacht vakant. Die alte Holmr-Herrschaft besteht nicht fort.')
review('isvanyr', 'Die Isvanyr waren ein historischer Norrnaigh-Clan von Piraten und Plünderern im Gebiet des späteren Heldenwacht. Ihre Angriffe brachen die Herrschaft Mac Mamhars. Erst die Vaeren bezwangen sie. Das Haus ist erloschen; sein genauer Rang und Stammsitz bleiben offen.',
       'Kanonische historische Kultur Norrnaigh hat Vorrang vor der Quellbehauptung unbekannten Volks. Die genaue Herkunft innerhalb der nördlichen Überlieferung bleibt offen.',
       'Die Quelle ordnet den Untergang in die Epoche der Seefahrer ein. Keine heutige Belebung oder Erhebung zum anerkannten Clanrang.',
       'Der Sieg der Vaeren wird als Teil ihrer frühen Herrschaftsüberlieferung erzählt, nicht als objektiver Alleinbeweis ihres Königsrechts gegenüber Varulv/Wargh.',
       'Norrnaigh ist eine Kulturkategorie, kein Sitz. Keine erfundenen Herkunftsorte, Lebensdaten oder Hofpersonen; keine Militärstatistiken.')
change('isvanyr', 'history', 'Woher die Isvanyr ursprünglich stammten oder welchem Volk sie entstiegen, ist bis heute ungeklärt.', 'Die genaue ursprüngliche Heimat der norrnaighischen Isvanyr bleibt ungeklärt.')
change('isvanyr', 'history', 'Zurecht gelten die Vaeren bis heute als das Königsgeschlecht Aldrimars – und nicht die Varulv oder die Wargh. Denn es waren die Vaeren, die die größte Gefahr jener Zeit überwanden: den Stamm der Isvanyr.', 'Der Sieg über die Isvanyr gehört zu den prägenden Überlieferungen der frühen Vaeren-Herrschaft. Er stärkte ihren Ruf als Beschützer der Region und blieb Teil der Erinnerung an ihren Aufstieg zum Königsgeschlecht.')
review('mamhar', 'Clan Mac Mamhar war ein Glaennath-Haus im Gebiet des späteren Heldendenwacht, das damals noch nicht von den heutigen aldrimarischen Clans beherrscht wurde. Die Isvanyr zerstörten seine Herrschaft in der Epoche der Seefahrer. Das Haus ist erloschen; Rang und genauer Stammsitz sind nicht überliefert.',
       'Quellslug mamhar bezeichnet haus-mac-mamhar. Der Glaennath-Kulturordner ist kein historischer Sitz; kein Ort aus Platzhaltern ergänzen.',
       'Knappes individuelles Untergangsmotiv erhalten. Der allgemeine Tiarnatum-Text beschreibt die ältere Kriegskultur der Glaennath, keine dokumentierte persönliche Ausrüstungsliste oder neuen Hausrang.',
       'Alte Kulturentwicklung vollständig sinnvoll erhalten und Kriegskunst überschreiben. Keine pauschale Ausrottung des gesamten Glaennath-Volkes aus dem Untergang eines Hauses ableiten.',
       'Hofnamenslisten, Genealogien und Militärstatistiken vollständig ausgeschlossen.')
change('mamhar', 'overview', 'Heldendenwacht', 'Heldenwacht')
reviews['mamhar']['safeCanonicalSummary'] = houses['mamhar']['safeCanonicalSummary'] = houses['mamhar']['safeCanonicalSummary'].replace('Heldendenwacht','Heldenwacht')
put('mamhar', 'overview', houses['mamhar']['safeCanonicalSummary'])
houses['mamhar']['warriorSectionTitle'] = 'Kriegskunst'
put('mamhar', 'knighthood', houses['mamhar']['reviewedSections']['knighthood'].replace('Einhejaren', 'Einherjer').replace('Glaennath -Alben', 'Glaennath-Alben').replace('beinahe gentlemanhaften Manier', 'beinahe rituell geregelten Weise'))
put('mamhar', 'history', 'Mac Mamhar beherrschte Teile jener Region, die später Kronental und heute Heldenwacht genannt wird. In der Epoche der Seefahrer fielen die Isvanyr über das Land her. Ihre Angriffe führten zum Untergang des Hauses, bevor die Vaeren die Isvanyr selbst bezwangen und ihre spätere Herrschaft festigten.')

for slug, house in houses.items():
    house['reviewStatus'] = 'editorially reviewed; current canonical hierarchy and territorial sources have priority'
    house['quality'] = {'sourceWords': sum(len(' '.join(v).split()) for v in house['sections'].values()), 'reviewedWords': sum(len(v.split()) for v in house['reviewedSections'].values())}
    assert house['safeCanonicalSummary'] and house['decisions']
document['status'] = 'chapters-reviewed-biography-summaries-pending'
document['rules']['territory'] = 'Current territorial name Jarltum Heldenwacht; older name Kronental remains the unchanged registry/profile label.'
document['rules']['historicalGroups'] = 'Grimr/Skaife/Holmr historical Torrenwacht sequence, extinction dates open; Isvanyr/Mac Mamhar ancient. Frostzorn active outlaw branch, current Vorn born1697, no accession date.'
path.write_text(json.dumps(document, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(BASE / 'source-review-decisions.json').write_text(json.dumps(reviews, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
for house in houses.values(): print(house['id'], house['quality'])
