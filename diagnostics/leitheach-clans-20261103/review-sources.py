"""Reconcile the bounded public Leitheach source batch without production writes."""
import json
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[1]
path = BASE / 'source-content.json'
document = json.loads(path.read_text(encoding='utf-8'))
assert document['status'] == 'pending-editorial-review'
houses = {h['id']: h for h in document['houses']}
pages = json.loads((ROOT / 'Kontinente/modules/leitheach/pages.source.json').read_text(encoding='utf-8'))['pages']
rank_names = {'ard-tiarna': 'Ard Tiarna', 'mor-tiarna': 'Mor Tiarna', 'dun-tiarna': 'Dún Tiarna', 'laird': 'Laird'}
historic = {'haus-suileach', 'haus-iomrach', 'haus-dal-t-saor'}


def put(ident, key, value):
    houses[ident]['reviewedSections'][key] = value


def change(ident, key, old, new):
    assert old in houses[ident]['reviewedSections'][key], (ident, key, old[:60])
    put(ident, key, houses[ident]['reviewedSections'][key].replace(old, new))


def decide(ident, *values):
    houses[ident]['decisions'].extend(values)


def owner_page(ident):
    candidates = [p for p in pages if any(f'family={ident}&' in r.get('href', '')
                  for box in p.get('infobox', []) for r in box.get('rows', [])
                  if r.get('label') == 'Herrschender Clan')]
    if ident == 'haus-mac-ard-cumhaill':
        return next(p for p in candidates if p['id'] == 'leitheach-tir-na-sleagh')
    return candidates[0] if candidates else None


for ident, h in houses.items():
    profile = h['canonical']['houseProfile']
    rank, title, seat = rank_names[profile['rankId']], h['canonical']['title'], profile['seat']
    land = profile['county']
    liege = profile.get('liegeHouseName', '')
    h['canonical']['rankLabel'] = rank
    h['canonical']['historicalClassification'] = ident in historic
    h['canonical']['historicalEra'] = 'historical-time-open' if ident == 'haus-suileach' else 'recently-extinct-administration' if ident in historic else 'active'
    h['canonical']['recentlyExtinct'] = ident in ('haus-iomrach', 'haus-dal-t-saor')
    context = owner_page(ident)
    if context:
        h['territorialContext'] = {'sourceFile': 'Kontinente/modules/leitheach/pages.source.json', 'pageId': context['id'], 'title': context['title'], 'status': 'current canonical territory'}
    h['decisions'] = [
        'Leitheach ist ein eigenständiges Fürstentum der Cruinach/Kronalben auf Estryll. Weder Aldrimar noch das untergegangene Ceitheach sind Namensaliase.',
        f'Bestehende Identität {ident}, Rang {rank}, Orts- und Dienstbindung haben Vorrang vor alten Infotabellen. Keine Orts- oder Graphänderungen.',
        'Gelieferte Genealogien, Hofnamenslisten und Militärstatistiken vollständig ausgeschlossen; ausschließlich vorhandene Familienakte als Iframe vorgesehen.'
    ]
    if not any(h['sections'].values()):
        decide(ident, 'Die Vorlage enthält keine ausgefüllten Erzählkapitel. Nur aktuelle belegte Profil- und Territorialdaten verwenden, keine persönlichen Gründungsdaten, Berufe oder Rituale erfinden.')
    if ident in historic:
        summary = f'{title} war ein Haus im Rang {rank} mit Bezug zu {seat} in {land}. Die frühere Hausverwaltung ist erloschen; der historische Rang bleibt Teil ihrer Stellung.'
    else:
        summary = f'{title} ist ein Haus im Rang {rank} mit Sitz in {seat} in {land}, Leitheach.'
        if liege: summary += f' Es dient {liege}.'
    h['safeCanonicalSummary'] = summary
    old = h['reviewedSections']['overview']
    put(ident, 'overview', summary + ('\n\n' + old if old else ''))
    if not h['reviewedSections']['holdings']:
        put(ident, 'holdings', f'{seat} ist der {"historische " if ident in historic else ""}Familiensitz in {land}.')
    if not h['reviewedSections']['conflictsAlliances'] and liege and ident not in historic:
        put(ident, 'conflictsAlliances', f'Die Dienstbindung des Hauses gilt {liege}.')
    if h['slug'] != ident.removeprefix('haus-'):
        decide(ident, f'Der Quellslug {h["slug"]} wird der bestehenden ID {ident} zugeordnet. Quellpräfixe und Schreibvarianten erzeugen keine zusätzliche Familie.')

tiarna_ideal = 'Der Tiarna verkörpert im albischen Kriegertum Ehre, Tapferkeit und die Pflicht, andere zu schützen. Neben dem ritterlichen Dienst bleiben ältere Clanideale lebendig. Die Fianna gelten als herausragende Helden und Vorbilder, an deren Mut und Verantwortung sich ein Tiarna messen soll.'
for ident in ('haus-ua-eirce', 'haus-fiachrach', 'haus-ruin-ua-laoch'):
    put(ident, 'knighthood', tiarna_ideal)
    decide(ident, 'Die allgemeine Tiarna-Passage wird als kulturelles Ideal erhalten. Daraus folgen keine automatisch vergebenen Klassen, Fianna-Ränge oder neuen Fähigkeiten einzelner Personen.')

ident = 'haus-mac-ard-cumhaill'
for key in houses[ident]['reviewedSections']:
    put(ident, key, houses[ident]['reviewedSections'][key].replace('Mac Cumhaill', 'Mac Ard Cumhaill'))
change(ident, 'knighthood', 'Der Tiarna von heute ist, das albenische Gegenstück zum Ritter, jedoch mit einem tieferen spirituellen Kern.', 'Der Tiarna ist das albenische Gegenstück zum Ritter und verbindet seinen Dienst mit einer ausgeprägten geistlichen Verantwortung.')
change(ident, 'knighthood', 'Jeder Tiarna gilt als eine Vorstufe zum Fianna, den größten Helden des albenischen Volkes, und trägt die Verantwortung, sich als würdig für diese höchste Ehre zu erweisen.', 'Die Fianna, die herausragenden Helden des albenischen Volkes, gelten ihm als Vorbilder, an deren Verantwortung und Tapferkeit er sich messen soll.')
decide(ident, 'Mac Cumhaill bezeichnet im gelieferten Text den Fürstenclan Mac Ard Cumhaill. Kurzform wird eindeutig zugeordnet; keine zusätzliche Akte und kein neuer Rang.',
       'Fürstenwürde und Landesherrschaft begründen kein persönliches Eigentum an allen Vasallenorten. Besitztext unterscheidet eigene Wirtschaftsgrundlage und abhängige Verwaltungen.',
       'Vater und Streiter bleiben die überlieferten religiösen Anrufungen. Keine neuen Götteridentitäten oder Namensgleichsetzungen aus unterschiedlichen regionalen Formen.')

ident = 'haus-ua-eirce'
change(ident, 'overview', 'gegründet vor rund 450 Jahren.', 'dessen Ursprung mehrere Jahrhunderte zurückliegt.')
decide(ident, 'Relative Altersangabe etwa450Jahre nicht zu einem neuen Gründungsdatum verrechnen. Der belegte heutige Sitz Senanbail hat Vorrang vor pauschaler Südzuordnung.',
       'Mormaer werden als bevorzugte berittene Kriegerkultur beschrieben, nicht als nordischer Hausrang oder neu zugewiesene Personenklasse.')
ident = 'haus-fiachrach'
change(ident, 'history', 'Seamir Fiachrach', 'Seamair Fiachrach')
decide(ident, 'Der bestehende Gründer heißt Seamair Fiachrach, nicht Seamir. Gegenwärtiger Hausname Uí Fiachrach/ID haus-fiachrach hat Vorrang vor Na-Fiachrach-Vorlage.',
       'Glück, Omen und der Ruf des Gründers bleiben kulturelle Deutung; keine automatische göttliche Gabe oder neuen Glücksmechaniken.')
ident = 'haus-ruin-ua-laoch'
for key in ('overview', 'history'):
    put(ident, key, houses[ident]['reviewedSections'][key].replace('Senan „Laoch“ Mac Cumhaill', 'Senán „Laoch“ Cumhail').replace('Senans', 'Senáns').replace('Senan', 'Senán'))
change(ident, 'history', 'dort, wo heute die Festung Broch an Abhainn steht', 'am Ort des heutigen Broch an Abhainn')
change(ident, 'history', 'und sein Nachkommen', 'und seine Nachkommen')
change(ident, 'values', 'Sei wie Senan.', 'Sei wie Senán.')
decide(ident, 'Bestehender Gründer Senán Cumhail (senan-ancient-cumhail) bleibt identisch; Laoch ist der gelieferte Heldenbeiname, keine zusätzliche Personenakte.',
       'Die Bestienjagd bleibt Gründungsüberlieferung; keine neue Kreaturen-, Trophäen- oder Inventarakte. Zum Broch werden keine widersprüchlichen neuen Bauphasen festgelegt.',
       'Heutiger Lairdrang und Sitz Broch an Abhainn bleiben erhalten, auch wenn die Quelle von älteren Gütern bei der Fürstenstadt erzählt.')

# Five major houses have empty house narratives, but substantial current territorial prose.
put('haus-ua-gaelach', 'holdings', 'Nossail liegt im bewaldeten Tir na Sinsear, dem Land der Ahnen. Holzverarbeitung, Forstwirtschaft und Jagdhandwerk tragen die Wirtschaft des Gebiets. Schnitzereien, Möbel, Waffen und Hausgeräte gelangen von hier über die Grenzen Leitheachs hinaus. Im südlichen Teil der Oberherrschaft sind Ackerbau und Viehzucht stärker vertreten; entlang der Flüsse liegen Fischersiedlungen und Räuchereien.')
put('haus-ua-gaelach', 'cultureReligion', 'Tir na Sinsear gilt als eine der alten Ursprungsregionen der Cruinach-Traditionen. Die Fir Sinnsear bewahren Ahnengesänge, Naturverbundenheit und die geistliche Überlieferung der Druiden. Viele leben in kleinen Wald- und Flusssiedlungen. Die ältere norrnaighische Einwanderung der Gallchobhair hinterließ eigene Spuren in Sprache, Riten und Symbolen, ohne die albische Identität der Region aufzuheben.')
put('haus-ua-gaelach', 'conflictsAlliances', 'Ua’Gaelach dient Mac Ard Cumhaill. Die Oberherrschaft steht unter zunehmendem Druck des Dunkelhains, dessen Ausläufer nördliche Siedlungen bedrohen. Schmuggler des Syndikats der Ertrunkenen und gewöhnliche Wegelagerer gefährden außerdem Flusshandel und Straßen. Tiarna und Druiden gehören zu den Trägern der örtlichen Abwehr.')
put('haus-dal-cruthin', 'holdings', 'Dál’Cruthin herrscht von Lochansail über Tir na Gortanna, die Kornkammer Leitheachs. Getreide, Gemüse, Obst und Viehhaltung bilden die Grundlage. Käse, Bier und Leder werden von gut organisierten Handwerkern und Zünften verarbeitet. Die zentrale Lage verbindet das Gebiet mit vielen Handelswegen des Fürstentums.')
put('haus-dal-cruthin', 'cultureReligion', 'In Tir na Gortanna leben die Treabhaire, das Ackervolk. Gemeinschaftsfeste, Erntedank und religiöse Feiern gliedern den Jahreslauf. Gastfreundschaft und beständige Arbeit prägen die offenen Dörfer und Märkte; die Versorgung des Fürstentums ist ein wesentlicher Teil des regionalen Stolzes.')
put('haus-dal-cruthin', 'history', 'Dál’Cruthin trug zur Niederlage der rivalisierenden Mac Suileach bei und festigte damit die Stellung Mac Ard Cumhaills. Als Belohnung erhielt das Haus die Herrschaft über Lochansail. Die frühere Mor-Tiarna-Stellung der Suileach ging verloren; ihr historischer Rang wird dadurch nicht aus der Überlieferung gelöscht.')
put('haus-dal-cruthin', 'knighthood', 'Die offene Landschaft Tir na Gortannas bietet wenig natürlichen Schutz. Wachposten, Hirtenpatrouillen und rasche Nachrichten zwischen den Dörfern dienen der Abwehr von Banditen. Tiarna in befestigten Gütern und örtliche Kerns unterstützen die Dorfgemeinschaften, deren Schwerpunkt im Alltag auf Landwirtschaft und Versorgung liegt.')
put('haus-fir-an-tarvo', 'holdings', 'Fir An’Tarvo führt die Oberherrschaft Tir na Tonn von Dun Rothar aus. Fischerei, Salzgewinnung, Schiffbau und Küstenhandel prägen die Wirtschaft. Robuste, bewegliche Küstenschiffe verbinden die Hafenorte mit anderen Teilen Leitheachs und mit fernen Küsten. Die rauen Gewässer und Klippen verlangen erfahrene Seeleute.')
put('haus-fir-an-tarvo', 'cultureReligion', 'Die Tonnaithe verbinden albische Überlieferung mit dem Erbe der zugewanderten Tarvo. Direkte Rede, Worttreue, Arbeitskraft und Seefahrertraditionen bestimmen die regionale Kultur. Raue Lieder und Geschichten werden in Tavernen weitergegeben. Trotz der vielfältigen Herkunft bleibt Tir na Tonn in der albenischen Kultur verwurzelt.')
put('haus-fir-an-tarvo', 'knighthood', 'Küstentürme und Signalfeuer unterstützen die Abwehr von Überfällen. Schnelle Boote können bei Angriffen auslaufen, während die Bevölkerung an Stürme und die Gefahren der See gewöhnt ist. Piraten und Seeungeheuer gehören zu den Bedrohungen; auch das Schmugglersyndikat der Ertrunkenen nutzt verborgene Buchten und unterwandert Hafenabläufe.')
put('haus-mac-airt', 'holdings', 'Mac Airt herrscht von Sruthlann über Tir an Comhchuibhis. Die alten Wälder liefern Heilkräuter, Holz und Materialien für feines Kunsthandwerk. Bienenzucht, Pilzanbau, Salben und gefärbte Stoffe ergänzen die Wirtschaft. In den offeneren südlichen und westlichen Gebieten bestehen außerdem Viehhaltung, Rosshöfe, Landwirtschaft, Brauereien, Destillerien und Böttcherzünfte.')
put('haus-mac-airt', 'cultureReligion', 'Die Tuatha Coilltean, das Waldvolk von Tir an Comhchuibhis, gelten als zurückhaltend und auf inneres Gleichgewicht bedacht. Waldmessen, Naturzyklen, geistige Disziplin und heilende Kräuterkunde prägen die Region. Schlichte Lieder und Chroniken sowie feine Holz- und Naturfarbenarbeiten bewahren ihre Überlieferung.')
put('haus-mac-airt', 'knighthood', 'Der wachsende Dunkelhain bedroht die nördlichen Ränder der Oberherrschaft. Druiden setzen Schutzriten und geweihte Ahnenbäume ein, um das Land zu bewahren. Dennoch dringen Infernale und andere Schattenwesen in die Grenzwälder vor. Die frühere Sicherheit der Region ist dadurch erschüttert.')
put('haus-tir-an-cuinn', 'holdings', 'Tir An’Cuinn führt die Oberherrschaft Tir na Sruth von Ceanntire aus. Fischerei, Flusshandel, Bootsbau und Warenumschlag verbinden ihre Uferorte. Gesalzener Fisch, Aal, Bauholz, Schiffe, Seile und Harze gehören zu den Handelsgütern. Fährhäfen und Flusshöfe bieten Arbeit für Seiler, Windenbauer, Frachtlader und Zollverwalter.')
put('haus-tir-an-cuinn', 'cultureReligion', 'Die Sruthaire leben mit den Strömungen. Pfahlhäuser und schwimmende Bauten gehören zu ihrer Heimat; ihre Kultur ist rau, solidarisch und von trockenem Humor geprägt. Seemannskunst, Loyalität und die genaue Kenntnis der Flüsse genießen hohes Ansehen. Ahnen und Flussgeister werden respektiert, ohne dass Religion den gesamten Alltag bestimmt.')
put('haus-tir-an-cuinn', 'conflictsAlliances', 'Tir An’Cuinn dient Mac Ard Cumhaill. Die größte Unruhe im Flussland entsteht durch das Syndikat der Ertrunkenen, Schmuggel, Zollflucht und rivalisierende Händler. Manche Ufergemeinschaften halten zum Fürstenhaus, andere geraten unter den Einfluss des Syndikats. Die Ua’Amhran sind ein anerkannter Kadettenclan der Cuinn.')
for ident in ('haus-ua-gaelach', 'haus-dal-cruthin', 'haus-fir-an-tarvo', 'haus-mac-airt', 'haus-tir-an-cuinn'):
    decide(ident, 'Die individuelle Hausvorlage ist leer. Ergänzte Prosa beschreibt ausschließlich die eigene, ausdrücklich belegte Oberherrschaft aus aktuellen Territorialquellen; regionale Kultur und Wirtschaft nicht als neue persönliche Clanrituale oder Eigentum an jedem Ort ausgeben.')
decide('haus-dal-cruthin', 'Der kopierte Territorialausdruck andereTeileAldrimars darf Leitheach nicht Aldrimar unterordnen. Handelskontakte sind außenpolitisch, keine Landeszuordnung.')

put('haus-iomrach', 'overview', 'An’Iomrach war ein Lairdhaus von Broch an Clais in Tir na Gortanna. Seine Herrschaft wurde 1733 durch Schwarzblut-Marodeure vernichtet. Das Ende der Hausverwaltung bedeutete nicht den Tod aller Angehörigen: Cónán überlebte als auswärtiges Mündel.')
put('haus-iomrach', 'history', 'Die Überlieferung führt das Haus auf die Erbauer von Broch an Clais zurück, die später in den Adel aufstiegen. Bereits im Krieg wurde die Familie schwer geschwächt. Der Angriff der Schwarzblut-Marodeure von 1733 beendete ihre Herrschaft. Die Ruinen gingen später an die Sidhe Somhairle, die dort heute die örtliche Verwaltung führen.\n\nYbhna und Cónán gehören zu den Überlebenden außerhalb des vernichteten Herrschaftszusammenhangs. Cónán blieb als auswärtiges Mündel und Erbe erhalten; daraus entsteht keine heutige Wiederherstellung der alten Iomrach-Verwaltung.')
put('haus-iomrach', 'holdings', 'Broch an Clais war der Stammsitz des Hauses. Heute verwalten die Sidhe Somhairle den Ort und die Überreste der alten Burg. Der historische Lairdrang der Iomrach bleibt Teil ihrer Überlieferung.')
decide('haus-iomrach', '1733 bezeichnet das administrative Ende der Herrschaft. Überlebende Ybhna und Cónán nicht töten oder aus ihren bestehenden Akten löschen; auswärtiger Mündel-/Erbenstatus Cónáns bleibt erhalten.',
       'Aktuelle Verwaltung Somhairle nicht als neue Iomrach-Herrschaft oder genealogische Verschmelzung darstellen. Historischen Lairdrang erhalten, keine heutige Oberhauptreihe erfinden.')

put('haus-suileach', 'overview', 'Mac Suileach war ein altes Mor-Tiarna-Haus der Kronalben in Tir na Gortanna. Die Rivalität mit Mac Ard Cumhaill endete mit dem Verlust seiner Herrschaft über Lochansail und der Verbannung. Als Mac Fáill’Suileach trägt das Haus in der Überlieferung das Stigma seines politischen Falls.')
put('haus-suileach', 'history', 'Die Mac Suileach gehörten zu den alten Adelsgeschlechtern der frühen Kronalben. Zeitweise beanspruchten sie eine Stellung, die derjenigen Mac Ard Cumhaills gleichkommen oder sie übertreffen sollte. Während des Konflikts um den Druiden- und Magierorden versuchten sie, die Schwäche ihrer Rivalen auszunutzen.\n\nDál’Cruthin trug maßgeblich zu ihrer Niederlage bei und erhielt als Belohnung Lochansail. Die Suileach wurden verbannt und verloren ihre frühere Verwaltung. Der spätere Fáill-Name erinnert an diesen Fall, ohne den überlieferten Mor-Tiarna-Rang auszulöschen.')
put('haus-suileach', 'holdings', 'Lochansail war mit der früheren Herrschaft des Hauses verbunden. Heute führt dort Dál’Cruthin die Oberherrschaft Tir na Gortanna. Die Suileach-Verwaltung besteht nicht fort; ein genaues Erlöschensdatum ist nicht überliefert.')
decide('haus-suileach', 'Bestehender historicalStatus extinct hat Vorrang; frühere Mor-Tiarna-Stellung erhalten. Verbannung und verlorene Herrschaft nicht als belegten Tod sämtlicher Nachkommen auslegen.',
       'Mac Faill Suileach ist die gelieferte Form der bestehenden Akte haus-suileach. Kein neuer Clan, keine neue Landeszuordnung oder aktueller Herrscher über Lochansail.')

for key in ('history',):
    put('haus-ruitheach', key, houses['haus-ruitheach']['reviewedSections'][key].replace('Ard Mac Cumhail', 'Mac Ard Cumhaill').replace('Tír na Tonn', 'Tir na Tonn'))
decide('haus-ruitheach', 'Abstammung von Mogh Ruith ist laut Quelle ausdrücklich unbestätigter Anspruch. Keine genealogische Verbindung, göttliche Abstammung oder neuen Elternkanten daraus ableiten.',
       'Heutiger Lairdrang, Sitz Broch an Iar und Dienst an Fir An’Tarvo haben Vorrang vor früherer Wanderschaft. Keine neue Herkunftsregion aus der Heldensage festlegen.')

put('haus-dal-t-saor', 'overview', 'Dál T’Saor war ein Lairdhaus mit Sitzbezug zu Sruthlann in Tir an Comhchuibhis. Die in seiner Stammburg verbliebene Hauslinie wurde 1735 durch ein Unheil aus dem Dunkelhain vernichtet. Quona und Junaid überlebten außerhalb der Burg.')
put('haus-dal-t-saor', 'history', '1735 fiel die Stammburg des Hauses einem finsteren Unheil aus dem Dunkelhain zum Opfer. Die innerhalb ihrer Mauern verbliebenen Angehörigen kamen um. Damit endete die dortige Hauptlinie und Hausverwaltung.\n\nQuona und Junaid hielten sich außerhalb der Burg auf und überlebten. Das Ende der örtlichen Linie bedeutet deshalb keine vollständige Auslöschung aller verwandten Personen.')
put('haus-dal-t-saor', 'holdings', 'Sruthlann bleibt der überlieferte Sitzbezug des Hauses. Die frühere Verwaltung ist erloschen; der historische Lairdrang bleibt erhalten.')
decide('haus-dal-t-saor', 'Kanonische ID haus-dal-t-saor und Name Dál T’Saor trotz Quellform Saoir erhalten.1735 ist das belegte Ende der Burg-/Hauptlinie, nicht Todesdatum aller Angehörigen.',
       'Quona und Junaid leben auswärts weiter. Keine neue aktuelle Herrschaft oder Amtsbesetzung aus ihrem Überleben ableiten; keine genealogische Mutation.')

put('haus-amrhan', 'history', houses['haus-amrhan']['reviewedSections']['history'].replace("Tir an'Cuinn", 'Tir An’Cuinn').replace("Tir an Cuinn", 'Tir An’Cuinn').replace("Ua'Amhran", 'Ua’Amhran'))
change('haus-amrhan', 'history', 'da keinerlei Hoffnung auf Nachkommen bestand.', 'da man wegen des Alters der Bardin keine Nachkommen erwartete.')
change('haus-amrhan', 'history', 'Die Druiden und Fianna sahen dies als göttliches Zeichen', 'In der Überlieferung sahen Druiden und Fianna dies als göttliches Zeichen')
decide('haus-amrhan', 'Stabile ID haus-amrhan trotz sichtbarem Namen Ua’Amhran unverändert. Keine Korrektur der ID oder neue Familie.',
       'Die unerwarteten Nachkommen sind Gründungsüberlieferung und religiöse Deutung, kein neuer Fruchtbarkeitswert oder Beweis göttlichen Eingreifens. Unbenannte Gründer bleiben unbenannt; keine Daten aus Hof-/Stammbaumtabellen.',
       'Mutter und Maid als gelieferte Glaubensbindung erhalten. Musikalisches Erbe nicht in neue Personenklassen oder Zaubergaben übersetzen.')
put('haus-amrhan', 'cultureReligion', 'Ua’Amhran verehrt die Mutter als Göttin der Liebe und Barmherzigkeit sowie die Maid als Göttin der Musik und Kunst. Barden, Musiker und Geschichtenerzähler haben besonderes Ansehen. Das Haus deutet die eigene Gründungsüberlieferung als Zeichen dafür, dass Liebe und Gnade über gesellschaftliche Erwartungen hinausreichen können.')

decide('haus-nic-blar-leitheach', 'Die Leitheach-Akte haus-nic-blar-leitheach ist eigenständig und sitzt als Lairdhaus in Sruthlann. Die historische Ceitheach-Akte haus-nic-blar ist keine alternative ID, kein Umzug und keine Quelle für neue Leitheach-Genealogie.')
decide('haus-somhairle', 'Heutiger Rang Laird und Verwaltung Broch an Clais nach dem Untergang Iomrachs. Der alte Baronie-Vordruck begründet keine Aufwertung zum Dún Tiarna.')
decide('haus-na-mhuir', 'Tir na Fancha gehört nach aktueller Nutzerbestätigung zu Na’Mhuir. Kein kopierter Buarstrath-Kontext und keine andere Ortszuweisung.')
for ident in ('haus-cleir', 'haus-ghaiscioch', 'haus-dal-ceardaiocht'):
    decide(ident, 'Dienst an Gallchobhair innerhalb Tir na Coimhthiochs; unter Tir na Sinsear verschachtelt. Keine pauschale direkte Unterstellung unter Mac Ard Cumhaill aus der Länderübersicht.')
decide('haus-ard-trodach', 'Die alte kopierte Caoimhe-Herrscherangabe gehört nicht zu Trodach. Keine neue Amtsbesetzung aus Gebietsvorlagen; Caireall Trodach bleibt die bestehende kanonische Person.')

reviewed = {}
for ident, h in houses.items():
    h['safeCanonicalSummary'] = h['reviewedSections']['overview'].split('\n\n')[0]
    h['reviewStatus'] = 'editorially reviewed; canonical identities, historical status and territory have priority'
    h['quality'] = {'sourceWords': sum(len(' '.join(v).split()) for v in h['sections'].values()),
                    'reviewedWords': sum(len(v.split()) for v in h['reviewedSections'].values())}
    reviewed[h['slug']] = {'id': ident, 'safeCanonicalSummary': h['safeCanonicalSummary'], 'decisions': h['decisions']}
document['status'] = 'chapters-reviewed-biography-summaries-pending'
document['rules']['historicalGroups'] = 'Suileach: former Mor Tiarna, date open. Iomrach: administration ended1733, survivors. Dal T’Saor: castle/main line ended1735, survivors. No total death claim.'
path.write_text(json.dumps(document, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(BASE / 'source-review-decisions.json').write_text(json.dumps(reviewed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
for h in houses.values(): print(h['id'], h['quality'])
