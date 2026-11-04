"""Apply the bounded manual editorial review to the diagnostic extraction."""
import json
import re
from pathlib import Path

DEST = Path(__file__).resolve().parent
path = DEST / 'source-content.json'
document = json.loads(path.read_text(encoding='utf-8'))
if document['status'] != 'pending-editorial-review':
    raise RuntimeError('Review requires a fresh diagnostic extraction.')
reviews = json.loads((DEST / 'source-review-decisions.json').read_text(encoding='utf-8'))
houses = {house['slug']: house for house in document['houses']}


def replace(slug, key, old, new):
    value = houses[slug]['reviewedSections'][key]
    if old not in value:
        raise RuntimeError(f'Missing review target: {slug}/{key}/{old[:70]}')
    houses[slug]['reviewedSections'][key] = value.replace(old, new)


def section(slug, key, value):
    houses[slug]['reviewedSections'][key] = value


for house in houses.values():
    historical = 'Ausgestorbene Clans' in house['canonical']['folderPath']
    house['canonical']['historicalClassification'] = historical
    house['canonical']['recentlyExtinct'] = False
    house['canonical']['historicalEra'] = (
        'historical-time-open' if house['slug'] in ('hjerte', 'jarnblod') else
        'ancient' if historical else 'active')
    for key, value in house['reviewedSections'].items():
        value = value.replace('vor 100 Jahren', '').replace('vor 20 Jahren', '')
        value = re.sub(r' +([,.;:!?])', r'\1', re.sub(r' {2,}', ' ', value))
        value = value.replace('sehenn', 'sehen').replace('Sprosslinge', 'Sprösslinge')
        house['reviewedSections'][key] = value

prefixes = {
    'blutstahl': 'Clan Blutstahl ist ein Thanenclan von Silberquell im Thanentum Schimmerküste und dient den Varangr.',
    'silberblut': 'Clan Silberblut ist ein Thanenclan von Silberquell im Thanentum Schimmerküste und dient den Varangr.',
    'varangr': 'Clan Varangr ist der Jarlsclan von Krähenmoor mit Sitz in Moortal in Nebelmoor und dient dem Königshaus Vaeren.',
    'kaltherz': 'Clan Kaltherz ist ein Hesirenclan von Moortal in Nebelmoor und dient den Varangr.',
    'feuerherz': 'Clan Feuerherz ist ein Hesirenclan von Moortal in Nebelmoor und dient den Varangr.',
    'vragi': 'Clan Vragi ist ein Hesirenclan von Rabenhain im Rabenforst und dient den Schattenherzen von Rabenweide.',
    'schwarzblut': 'Clan Schwarzblut ist der Hesirenclan von Nebelwacht im Schwarzfjord und dient den Varangr.',
    'goldglanz': 'Clan Goldglanz ist ein Hesirenclan von Silberquell in der Schimmerküste und dient gemeinsam den Blutstahl und Silberblut.',
    'hjerte': 'Clan Hjerte war ein Norrnaigh-Thanenclan im Gebiet des späteren Krähenmoors. Der Stammclan ist erloschen; sein Erbe lebt in Kummerherz, Schattenherz, Feuerherz und Kaltherz fort.',
    'jarnblod': 'Clan Järnblod, auch Eisenblut genannt, war ein Norrnaigh-Thanenclan von Krähenmoors Küsten mit Bezug zu Silberquell. Der Stammclan ist erloschen; Schwarzblut, Blutstahl und Silberblut führen sein Erbe weiter.',
    'kaldhrafn': 'Die Kaldhrafn waren eine historische Norrnaigh-Gemeinschaft in Krähenmoor. Ihr genauer Hausrang ist nicht überliefert.'
}
for slug, prefix in prefixes.items():
    section(slug, 'overview', prefix + '\n\n' + houses[slug]['reviewedSections']['overview'])

section('schattenherz', 'overview', reviews['schattenherz']['safeCanonicalSummary'])
section('schattenherz', 'holdings', 'Rabenfurt ist der Sitz der Schattenherzen im Thanentum Rabenweide. Die Brücke der Stadt ist für die Verbindung durch das Gebiet von entscheidender Bedeutung. Im bewaldeten Rabenforst dienen ihnen die Vragi von Rabenhain.')
replace('schattenherz', 'conflictsAlliances', 'den Roten Fraktionen', 'der Roten Fraktion')
replace('schattenherz', 'conflictsAlliances', 'Nach den Konflikten kühlten ihre Beziehungen zum Jarltum Rorikshall drastisch ab.', 'Nach dem Krieg blieben ihre Beziehungen zum Jarltum Roriksheim, insbesondere zu Rorikshall, stark belastet.')

replace('blutstahl', 'knighthood', 'Während die Silberblut lieber ihre vielen Männer vorschicken und auf Disziplin und Formation setzen,', 'Während die Silberblut auf Disziplin und Formation setzen,')
replace('blutstahl', 'conflictsAlliances', 'Bekannte Figuren dieser Zeit waren der Hesir Raveld Blutstahl, auch bekannt als „Der Blutegel“, und seine Tochter Sigrun Blutstahl.', 'Zu den bekannten Figuren dieser Zeit gehörten Raveld Blutstahl, genannt „Der Blutegel“, und seine Tochter Sigrun Blutstahl.')
replace('blutstahl', 'conflictsAlliances', 'Bei der ersten Seeschlacht bei Wellenruh fielen alle volljährigen Mitglieder des Clans, die auf der Seite der Roten standen, einschließlich des Thane Raveld Blutstahl.', 'Die erste Seeschlacht bei Wellenruh forderte unter den Blutstahl auf Seiten der Roten schwere Verluste; auch Raveld fiel.')
replace('blutstahl', 'conflictsAlliances', 'Nach dem Krieg erbte Sigrun Blutstahl, die Tochter Ravelds, die Führung des Clans und setzte den Kampf unter den Banner der Roten fort. Da nach dem Krieg kein Blutstahl am Leben war oder alt genug, um den Titel des Thanen von Silberquell zu beanspruchen,', 'Nach diesen Verlusten übernahm Sigrun Blutstahl die Führung und setzte den Kampf unter dem Banner der Roten fort. Als nach dem Krieg kein geeigneter Blutstahl den Thanentitel beanspruchen konnte,')
replace('blutstahl', 'holdings', 'Der Blutstahl-Clan kontrolliert die Küstenregionen von Schimmerküste und hat Zugriff auf wichtige Hafenstädte wie Svarthamn und Erynes, die als Seefestungen und Handelsstädte dienen.', 'Der Blutstahl-Clan verwaltet den östlichen Ortsverband der Schimmerküste. Dazu gehören Eisenbruch, Rabenstollen, Silbertal und Eyrstatt sowie die Küstenorte Roknes, Svarthamn und Erynes. Häfen, Werften und Außenposten dienen dem Handel und der maritimen Sicherung.')

section('silberblut', 'holdings', 'Der Silberbergbau trägt den Wohlstand der Schimmerküste. Die Silberblut verwalten den westlichen Ortsverband um Kvallstatt, Myrkheim, Tjarnborg, Schatztal, Blutstein Kloster, Grimmstad, Einhjersdorf und den Hafen Dunkelblickwark. In Silberquell werden die Erzeugnisse des Hinterlands verarbeitet und gehandelt. Landwirtschaft im fruchtbaren Umland und maritime Wirtschaft ergänzen die Einnahmen.\n\nDer östliche Ortsverband mit Eisenbruch, Rabenstollen und Silbertal liegt dagegen bei den Blutstahl; Ehrenberg gehört zur Eigenverwaltung der Varangr. Trotz ihrer Rivalität wirken Silberblut und Blutstahl am Wohlstand des gemeinsamen Thanentums mit. Die Silberblut gelten dabei als besonders geschickte Kaufleute und Verwalter.')
replace('silberblut', 'conflictsAlliances', 'Als Kadettenhäuser des früheren Verwandten Clans, der sich in Blutstahl und Silberblut aufteilte,', 'Als Nachfolgehäuser des Järnblod-Clans')

replace('varangr', 'history', 'um die Glaennath zu vernichten und das Land zu unterwerfen.', 'um die Herrschaft der örtlichen Glaennath-Clans zu brechen und das Land zu unterwerfen.')
replace('varangr', 'conflictsAlliances', 'im Jarltum von Moortal', 'im Jarltum Krähenmoor')
replace('varangr', 'conflictsAlliances', 'Ein markantes Ereignis war die Ermordung des späteren Königs, die den Varangr die Gelegenheit bot, das Machtvakuum zu nutzen, um ihren eigenen Sohn als König zu etablieren.', 'Der Tod des Königs eröffnete den Varangr die Gelegenheit, den Anspruch des Prinzen Sinding auf die Krone zu unterstützen und ihren Einfluss am Hof zu festigen.')
replace('varangr', 'conflictsAlliances', 'Trotz ihrer Verantwortung für das Leid und die Feindschaften, die sie durch die Verlängerung des Krieges schürten,', 'Trotz des Leids und der Feindschaften, mit denen ihr Anteil am Krieg verbunden blieb,')
for key in ('traditions', 'conflictsAlliances', 'values'):
    house = houses['varangr']['reviewedSections'][key]
    house = house.replace('paranoid', 'misstrauisch').replace('Paranoia', 'Wachsamkeit')
    section('varangr', key, house)
replace('varangr', 'holdings', 'da sie paranoid und eifersüchtig über ihren Reichtum und Einfluss wachen.', 'da sie misstrauisch und eifersüchtig über ihren Reichtum und Einfluss wachen.')
replace('varangr', 'holdings', 'Ihre Paranoia und Eifersucht', 'Ihr Misstrauen und ihre Eifersucht')

replace('kaltherz', 'knighthood', 'in den Sümpfen im Norden Mortals (Krähenmoors)', 'in den Sümpfen nördlich von Moortal')
replace('kaltherz', 'conflictsAlliances', 'Abgesehen von dieser strategischen Unterstützung blieben sie jedoch ansonsten ein eher irrelevanter Clan.', 'Ihr Beitrag lag vor allem in solchen begrenzten Verteidigungs- und Verzögerungsaktionen, weniger in großen offenen Schlachten.')
replace('feuerherz', 'conflictsAlliances', 'und beide Clans stritten sich erneut wie Kinder.', 'und beide Clans nahmen ihren Streit um das Hjerte-Erbe erneut auf.')
replace('feuerherz', 'values', 'und würden niemals lügen oder betrügen, da sie Stärke und Stolz aus ihrer offenen und direkten Art ziehen.', 'und betrachten Lüge und Betrug als Verrat an ihrem Ideal einer offenen und direkten Lebensweise.')
replace('vragi', 'history', 'der ihnen regelmäßig ein Orakelkind schenkte.', 'dem sie die Geburt des Orakelkinds zuschrieben.')
replace('vragi', 'holdings', 'Ihre Isolation und Genügsamkeit machen sie unabhängig von weltlichen Interessen, während sie ihre spirituelle Autorität in Aldrimar bewahren.', 'Ihre Isolation und Genügsamkeit halten weltliche Interessen im Hintergrund. Als Hesirenclan bleiben sie den Schattenherzen unterstellt, während sie ihre geistliche Eigenständigkeit bewahren.')
replace('vragi', 'conflictsAlliances', 'Der Clan der Vragi war während des Krieges der Prätendenten ein unbedeutender Teilnehmer.', 'Der Clan Vragi griff während des Krieges der Prätendenten kaum in die offenen Kämpfe ein.')

replace('schwarzblut', 'history', 'der Küsten und Berge im Osten Krähenmoors', 'der Küsten und Berge des nordöstlichen Schwarzfjords')
replace('schwarzblut', 'holdings', 'Der Schwarzblut-Clan herrscht über die Küsten und Bergregionen im Osten Krähenmoors,', 'Der Schwarzblut-Clan herrscht über die Küsten und Bergregionen im nordöstlichen Schwarzfjord,')
replace('schwarzblut', 'holdings', 'die über die Küsten von Krähenmoor herrschen.', 'deren Einfluss von Nebelwacht über die Küsten des Schwarzfjords reicht.')
replace('schwarzblut', 'holdings', 'und sie gelten als unangefochtene Meister der Küsten und Meere.', 'und sie beanspruchen eine führende Stellung auf den heimischen Seewegen.')
replace('schwarzblut', 'knighthood', 'als unerreichte Meister der Seeschlacht', 'als erfahrene Meister der Seeschlacht')
replace('schwarzblut', 'knighthood', 'Ehre und Stolz bedeutet für sie, furchtlos und unbesiegbar auf See und an Land zu kämpfen.', 'Ehre und Stolz bedeuten für sie, auf See und an Land furchtlos zu kämpfen und selbst unter schwerem Druck nicht nachzugeben.')
replace('schwarzblut', 'conflictsAlliances', 'Besonders mit den Nordclans wie den Varangr und Eisenblut haben sie durch Eheschließungen und Blutsbünde enge Beziehungen geknüpft.', 'Ehen und Blutsbünde hatten schon ihren Ursprung im Järnblod-Erbe und in der Verbindung zu den Varangr geprägt. Auch bei der späteren Annäherung an einstige Gegner suchten sie nach verwandtschaftlichen und politischen Bindungen.')
replace('schwarzblut', 'conflictsAlliances', 'Diese strategischen Verbindungen haben nicht nur Konflikte entschärft, sondern auch ihren Einfluss und ihre Macht gefestigt.', 'Solche Verbindungen konnten Konflikte entschärfen und Einfluss sichern, beseitigten das aus dem Krieg erwachsene Misstrauen aber nicht vollständig.')
replace('schwarzblut', 'conflictsAlliances', 'Durch diese kluge Politik konnten die Schwarzblut alte Feinde zu Verbündeten machen,', 'Durch diese Politik suchten die Schwarzblut den Ausgleich mit alten Feinden,')

replace('goldglanz', 'history', 'Obwohl sie keine militärische Macht darstellten,', 'Obwohl ihre damalige militärische Bedeutung gering war,')
replace('goldglanz', 'knighthood', 'eine große Anzahl von Waffenknechten und Hirdmännern', 'angeworbene Waffenknechte und Hirdmänner')
replace('goldglanz', 'conflictsAlliances', 'den Kampfgeborenen aus Rorikshall', 'den Kampfgeborenen aus dem Jarltum Roriksheim')

replace('hjerte', 'history', 'Am Ende waren die Glaennath-Alben besiegt, ihre Städte in Trümmern, ihre Magie verloschen.', 'Am Ende brach die Herrschaft der örtlichen Glaennath-Clans zusammen; ihre Städte lagen in Trümmern, und viele ihrer alten Machtzentren gingen verloren.')
replace('hjerte', 'holdings', 'Heute sind sie zerstritten und schwach, ihre einzige Verbindung ein gemeinsamer Name, der einst Größe bedeutete, nun aber nur noch Erinnerung und Tragödie in sich trägt.', 'Der Stammclan erlosch, während seine Nachfolgehäuser ein umstrittenes gemeinsames Erbe bewahren. Was einst als geschlossene Macht auftrat, lebt seither in getrennten, teils verfeindeten Linien weiter.')
replace('hjerte', 'history', 'Sie waren die Herrscher, die hätten sein können, die Jarle, die nie regierten,', 'Sie galten als verhinderte Anwärter auf die Vorherrschaft,')
replace('hjerte', 'knighthood', 'das nur die Hjerte in dieser Wildheit und Entschlossenheit schmieden konnten.', 'das die Hjerte als besonderen Ausdruck ihrer Wildheit und Entschlossenheit rühmten.')

replace('jarnblod', 'overview', 'doch politische Ehen und innere Zwistigkeiten führten zur Spaltung des Clans in Silberblut und Blutstahl,', 'doch politische Ehen und innere Zwistigkeiten ließen zunächst Schwarzblut und später Silberblut und Blutstahl aus ihrem Zusammenhang hervorgehen,')
replace('jarnblod', 'history', 'die Alben wurden besiegt und vertrieben.', 'die örtlichen Albenherrschaften wurden besiegt und zurückgedrängt.')
replace('jarnblod', 'history', 'Heute sind die Järnblod in zwei Linien gespalten, aber noch immer gefürchtet und respektiert. Sie bewahren ihre Tradition als Krieger und Söldner, kämpfen als Huskarle und Hirdmänner und halten an ihrer stolzen, eisenharten Mentalität fest. Ehre bedeutet ihnen nichts, solange Macht und Überleben gesichert sind, und sie glauben fest daran, dass Blut stärker ist als jede Allianz oder Freundschaft.', 'Der Järnblod-Stammclan erlosch als eigenständiges Haus. Sein Erbe führen Schwarzblut sowie die später getrennten Blutstahl und Silberblut weiter. In den Überlieferungen ihrer Nachfolger bleiben die Krieger- und Söldnertradition, der eiserne Überlebenswille und das Spannungsverhältnis zwischen Blutsbindung, Bündnistreue und Macht erhalten.')

replace('kaldhrafn', 'history', 'Nach der Auslöschung der Glaennath-Alben', 'Nach dem Zusammenbruch der örtlichen Glaennath-Herrschaften')
for key in ('holdings', 'conflictsAlliances'):
    section('kaldhrafn', key, houses['kaldhrafn']['reviewedSections'][key].replace('Rabensweide', 'Rabenweide'))
replace('kaldhrafn', 'holdings', 'Heute kontrollieren die Vragi als spirituelle Nachfolger und die Schattenherzen als politische Vasallen die Regionen von Rabenweide und Rabenhort.', 'Heute herrschen die Schattenherzen über Rabenweide. Die Vragi tragen in Rabenhain im Rabenforst das geistliche Erbe weiter und dienen den Schattenherzen.')
houses['kaldhrafn']['warriorSectionTitle'] = 'Kriegskunst'

ancient_warfare = (
    'In der älteren Kriegskultur der Glaennath-Alben nahmen die Tiarna eine zentrale Rolle ein. Diese angesehenen Krieger verteidigten ihre Gemeinschaften und wahrten die Ordnung, bevor das spätere Rittertum seine feste Gestalt erhielt. In den Überlieferungen über jene Zeit stehen begrenzte Kämpfe ausgewählter Krieger neben dem Bemühen, die übrige Bevölkerung zu schonen. Größere Heere und dauerhaft einberufene Milizen prägten dieses Ideal noch nicht.\n\n'
    'Die Tiarna vertrauten vor allem auf persönliche Fertigkeit. Schlichte Leder- und Pelzrüstungen sowie Waffen aus Bronze oder Kupfer gehörten zur älteren Ausrüstung. Rüstung zeigte dabei auch die Stellung des Trägers. In kleineren Fehden und bei der Abwehr von Banditen konnten das Ansehen und die Kampferfahrung solcher Krieger ausreichen, um die Ordnung einer Siedlung zu sichern.\n\n'
    'Mit dem Zeitalter der Seefahrer geriet diese Form der Kriegführung unter schweren Druck. Die einfallenden Norrnaigh brachten gut gerüstete und geübte Einherjer mit und waren kaum bereit, Angriffe auf vereinbarte Einzelkämpfe zu beschränken. Die Glaennath konnten sich nicht länger darauf verlassen, ihre Konflikte durch begrenzte Zweikämpfe oder ehrenhafte Absprachen zu entscheiden. Ihre Bauernmilizen waren auf solche Feldzüge schlecht vorbereitet, und die Tiarna konnten den Wandel nicht allein auffangen.\n\n'
    'In der weiteren Entwicklung gewann das von den Avallorniern geprägte Rittertum an Bedeutung. Bessere Waffen und Rüstungen, regelmäßige Ausbildung und größere Disziplin veränderten die Möglichkeiten der albenischen Verteidiger. Diese Entwicklung beschreibt den Wandel ihrer Kriegskultur; sie machte den Verlust alter Herrschaften jedoch nicht rückgängig. Das ältere Tiarnatum blieb als Erinnerung an eine Zeit bestehen, in der persönliches Können und das Ansehen einzelner Krieger einen anderen Platz in der Verteidigung der Gemeinschaft eingenommen hatten.'
)
for slug in ('morfhia', 'corcaigh'):
    section(slug, 'overview', reviews[slug]['safeCanonicalSummary'])
    section(slug, 'knighthood', ancient_warfare)
    houses[slug]['warriorSectionTitle'] = 'Kriegskunst'
    houses[slug]['canonical']['sourceFiles'].append('Kontinente/modules/kraehenmoor/pages.source.json')
section('morfhia', 'history', 'Vor dem Zeitalter der Seefahrer war Tir na Taise, das Land der ewigen Sümpfe, ein abgeschiedener Teil des Fürstentums der Glaennath-Alben. Mac Môrfhia und Mac Corcaigh gehörten zu den Häusern, die seine Siedlungen, Wälder und heiligen Haine prägten.\n\nAls die Varangr flussaufwärts in das Land vordrangen, organisierten beide Clans den Widerstand. Sie wehrten die ersten Angriffe ab, errichteten befestigte Lager und nutzten ihre Kenntnis des unwegsamen Landes für Überfälle und verzögernde Kämpfe. Erst die Verstärkung der Varangr durch Järnblod, Kaldhrafn und Hjerte wendete den Krieg. Unter dem erneuten Ansturm fiel die Herrschaft Mac Môrfhias, und die Glaennath verloren ihre letzten Bastionen in der Region. Die Sieger gerieten anschließend selbst in Streit um das eroberte Tir na Taise.')
section('morfhia', 'holdings', 'Der historische Wirkungsraum Mac Môrfhias lag in Tir na Taise, dem späteren Krähenmoor. Mit Silberquell ist ein alter Ortsbezug erhalten. Die einstigen Herrschaftsgebiete gingen im Eroberungskrieg an die siegreichen Norrnaigh über.')
section('morfhia', 'cultureReligion', 'Die Glaennath von Tir na Taise verbanden ihre Lebensweise mit der Natur und den alten Geheimnissen der Sümpfe. Wälder und heilige Haine waren Teil ihrer Heimat; deren Verwüstung durch die Eindringlinge traf die Gemeinschaft auch in ihrem geistlichen Leben.')
section('morfhia', 'conflictsAlliances', 'Mac Corcaigh stand im Widerstand gegen die Varangr an der Seite Mac Môrfhias. Mit der Ankunft von Järnblod, Kaldhrafn und Hjerte verstärkte sich der Druck der Norrnaigh, bis die örtliche Glaennath-Herrschaft zusammenbrach.')
section('corcaigh', 'history', 'Mac Corcaigh gehörte gemeinsam mit Mac Môrfhia zu den alten Glaennath-Häusern von Tir na Taise. Die abgeschiedenen Sümpfe und Wälder wurden mit dem Beginn des Zeitalters der Seefahrer zum Ziel der Varangr, die Dörfer plünderten und heilige Haine verbrannten.\n\nDie beiden Clans wehrten die ersten Angriffe ab und organisierten die Verteidigung in befestigten Lagern. Mit Überfällen aus dem schwierigen Gelände setzten sie den Eindringlingen zu. Daraufhin riefen die Varangr Verstärkung aus ihrer Heimat; Järnblod, Kaldhrafn und Hjerte schlossen sich dem Feldzug an. Die erneute Offensive brach die letzten Bastionen der Glaennath. Aus dem eroberten Tir na Taise entwickelte sich später das Jarltum Krähenmoor. Mac Corcaigh zählt zu den erloschenen Häusern dieser älteren Zeit.')
section('corcaigh', 'holdings', 'Der alte Herrschaftsraum Mac Corcaighs lag in Tir na Taise. Mit Moortal ist ein historischer Ortsbezug erhalten. Die spätere politische Ordnung Krähenmoors entstand nach der Eroberung der Glaennath-Gebiete durch die Norrnaigh.')
section('corcaigh', 'cultureReligion', 'Die alte Glaennath-Gemeinschaft von Tir na Taise lebte eng mit den Wäldern und Sümpfen ihrer Heimat. Ihr Respekt vor der Natur und den heiligen Hainen prägte das Land, das die einfallenden Norrnaigh zu unterwerfen suchten.')
section('corcaigh', 'conflictsAlliances', 'Mac Corcaigh und Mac Môrfhia führten gemeinsam den Widerstand gegen die Varangr. Der Ankunft weiterer Norrnaigh-Clans konnten ihre befestigten Lager und ihre Geländeüberfälle auf Dauer nicht standhalten.')

for slug, house in houses.items():
    house['safeCanonicalSummary'] = reviews[slug]['safeCanonicalSummary']
    house['decisions'] = reviews[slug]['decisions']
    house['reviewStatus'] = 'editorially reviewed; current canonical hierarchy has priority'
    house['quality'] = {
        'sourceWords': sum(len(' '.join(value).split()) for value in house['sections'].values()),
        'reviewedWords': sum(len(value.split()) for value in house['reviewedSections'].values())}
document['status'] = 'editorially-reviewed-ready'
document['rules']['historicalGroups'] = 'Hjerte and Järnblod: extinct parent houses, Thane rank retained, extinction date open; Kaldhrafn and both Mac houses: ancient, rank unknown. Cultural categories are not seats.'
path.write_text(json.dumps(document, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
for house in houses.values():
    print(house['id'], house['quality'])
