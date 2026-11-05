"""Narrow, idempotent editorial updates; no corpus, graph or live-data writes."""
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
changes = []

def update(path, replacements):
    target = ROOT / path
    before = target.read_bytes()
    text = before.decode('utf-8')
    for label, old, new in replacements:
        if new in text and old not in text:
            continue
        count = text.count(old)
        if count != 1:
            raise ValueError(f'{path} / {label}: expected one old match, found {count}')
        text = text.replace(old, new, 1)
        changes.append({'path': path, 'field': label, 'before': old, 'after': new})
    after = text.encode('utf-8')
    if after != before:
        target.write_bytes(after)
        return {'path': path, 'beforeSha256': hashlib.sha256(before).hexdigest(),
                'afterSha256': hashlib.sha256(after).hexdigest()}
    return None

files = []
files.append(update('AleriaAlmanach/data/sections.js', [
    ('kanaanith.description.origin',
     'Die älteste Überlieferung führt Kana’anith auf das Ogham der Proto-Alben zurück. Als Tirnara durch die Kontinentaltrennung isoliert wurde, wandelten die Menschen des Südostens die vertikale Baum- und Kerbschrift in ein horizontales Abjad um. Die neue Schrift passte zu Stein, gebranntem Ton, Metall, Papyrus, Handelstafeln und den monumentalen Fassaden wachsender Städte.',
     'Die gesprochene Sprache gehört zur neuen sprachlichen Ordnung nach <strong>Orins Zungenverwirrung</strong>. Zarakhul hatte den von ihm unterjochten Völkern Tirnaras seine dunkle Sprache aufgezwungen; Orin verwirrte ihre Zungen und zerstreute diese Zwangssprache. Darin liegt der tiefe Bruch zu den älteren albischen und nordischen Sprachen.<br><br>Das Ogham-Erbe betrifft dagegen die Schrifttradition: Aus der älteren Baum- und Kerbschrift wurde im Südosten ein horizontales Abjad für Stein, Ton, Metall, Papyrus und Handelstafeln. Verwandte Zeichen bedeuten keine ungebrochen fortgeführte albische Sprache.'),
    ('kanaanith.stats.origin',
     '["Herkunft", "Tirnarischer Zweig des proto-albischen Ogham"]',
     '["Herkunft", "Sprachbruch nach Orin · Ogham-Erbe der Schrift"]'),
    ('kanaanith.language.family',
     'family: "Tirnarischer Zweig der proto-albischen Ogham-Tradition"',
     'family: "Eigenständige tirnarische Sprache nach Orins Zungenverwirrung · Schrift mit Ogham-Erbe"'),
    ('kanaanith.language.origin',
     'Kana’anith entwickelte sich aus dem <strong>Ogham der Proto-Alben</strong>, nachdem Tirnara durch die Kontinentaltrennung von den übrigen Landmassen isoliert worden war. Die Menschen des Südostens übernahmen nicht einfach die alte Baumordnung. Sie passten Schrift und Sprache an neue Materialien, Städte, Tempel, Handelswege und Flusskulturen an.<br><br>Aus vertikalen Kerblinien wurde eine horizontale Rechts-nach-links-Schrift. Die alten Naturbilder verwandelten sich in Zeichen einer urbanen und reisenden Welt: Beth wurde Haus und Besitz, Gimel Kamel und Karawane, Mem Wasser und Lebensstrom, Samekh Pfeiler und geordnete Institution.',
     'Zarakhul zwang seinen versklavten Völkern Tirnaras seine dunkle, infernale Sprache auf. <strong>Orin</strong> verwirrte die Zungen der Unterjochten und zerstreute die gemeinsame Zwangssprache. Die neuen tirnarischen Sprachräume unterschieden sich dadurch grundlegend von den älteren albischen und nordischen Sprachen. Zarakhuls spätere Niederlage stellte die frühere sprachliche Einheit nicht wieder her.<br><br>Die <strong>Schrift</strong> des Kana’anith bewahrt zugleich ein Erbe des proto-albischen Ogham. Aus vertikalen Kerblinien wurde eine horizontale Rechts-nach-links-Schrift. Die alten Naturbilder verwandelten sich in Zeichen einer urbanen und reisenden Welt: Beth wurde Haus und Besitz, Gimel Kamel und Karawane, Mem Wasser und Lebensstrom, Samekh Pfeiler und geordnete Institution. Diese Zeichenüberlieferung ist von der Geschichte der gesprochenen Sprache zu unterscheiden.'),
    ('infernal.language.tyranny',
     'title: "Sprache als wirkende Macht",',
     'title: "Zarakhuls Zwangssprache und Orins Eingriff",\n                  text: "Zarakhul zwang den von ihm unterjochten Völkern Tirnaras seine dunkle, infernale Sprache auf. Sie diente der Herrschaft über versklavte Menschen, die auch für seine Kriege kämpfen mussten. Der Gott <strong>Orin</strong> verwirrte die Zungen dieser Unterjochten und zerstreute die aufgezwungene Sprache. Dieser Bruch erklärt die tiefen Unterschiede der daraus hervorgegangenen tirnarischen Sprachen gegenüber den älteren albischen und nordischen Sprachen.<br><br>Orins Eingriff beendete die gemeinsame Zwangssprache der Versklavten; er löschte weder die überweltliche infernale Sprache noch sämtliche erhaltenen Inschriften aus. Nicht jedes Volk auf oder bei Tirnara wird damit zu einem ehemaligen Untertan Zarakhuls, und heutige tirnarische Sprachen sind keine bloßen infernalen Dialekte."\n                },\n                {\n                  title: "Sprache als wirkende Macht",')
]))

files.append(update('AleriaAlmanach/modules/language/language-reference-entries.js', [
    ('argenti.description.origin',
     'Ihre heutige Form entstand aus Kana’anith, Ogham, Stoicheia und der Gemeinen Zunge. Aus diesen älteren Systemen übernahm sie die Vorstellung, dass Zeichen Bedeutung tragen; zugleich verwandelte sie das konsonantengetragene Erbe in ein <strong>Vollalphabet aus 23 Litterae</strong>. Jedes Zeichen besitzt Lautwert, Nomen Litterae und eine Stellung in einem der drei Ordines.',
     'Ihre spätere Reichsnorm schöpft aus Kana’anith, Stoicheia, der Gemeinen Zunge und älteren Ogham-Zeichentraditionen. Diese gelehrte Zusammenführung folgt auf den großen Sprachbruch Tirnaras: <strong>Orin</strong> verwirrte die Zungen der von Zarakhul versklavten Völker und zerstreute die ihnen aufgezwungene dunkle Sprache. Aus dieser Geschichte gingen eigenständige Sprachräume hervor, die sich stark von den albischen und nordischen Sprachen unterschieden.<br><br>Die Übernahme älterer Zeichen und Bedeutungen hebt diesen Sprachbruch nicht auf. Die Grammatici schufen ein <strong>Vollalphabet aus 23 Litterae</strong>; jedes Zeichen besitzt Lautwert, Nomen Litterae und eine Stellung in einem der drei Ordines.'),
    ('argenti.language.family',
     "family: 'Tirnarisch-argentische Gelehrtensprache · Kana’anith, Ogham, Stoicheia und Gemeine Zunge'",
     "family: 'Normierte tirnarische Reichssprache · gelehrte Schrift- und Sprachkontakte nach Orins Sprachbruch'"),
    ('argenti.language.origin',
     'Die Lingua Argenti wurde nicht in einem einzigen Augenblick erfunden. Kana’anith lieferte die tirnarische Wurzeltradition, Ogham die Vorstellung bedeutungstragender Zeichen, Stoicheia die Verbindung von Schrift, Recht und politischer Wirkung. Die Gemeine Zunge gab schließlich den Lautkörper, aus dem die Grammatici eine reichsweit normierte Hochsprache formten.<br><br>Das Ergebnis ist bewusst administrativ: Ein Erlass aus der Hauptstadt soll in einer Grenzfestung ebenso gelesen werden wie an einer Akademie. Regionale Aussprache darf bestehen, die geschriebene Form jedoch nicht schwanken.',
     'Die Lingua Argenti wurde nicht in einem einzigen Augenblick erfunden. Ihre spätere Reichsnorm entstand nach der Zerschlagung der alten sprachlichen Einheit: Zarakhul hatte seinen unterjochten Völkern eine dunkle Zwangssprache auferlegt; <strong>Orin</strong> verwirrte ihre Zungen und zerstreute sie. Deshalb ist die spätere tirnarische Sprachwelt keine bloße Fortsetzung der albischen oder nordischen Sprachen.<br><br>Kana’anith lieferte eine tirnarische Wurzeltradition, Ogham das ältere Erbe bedeutungstragender <strong>Zeichen</strong>, Stoicheia die Verbindung von Schrift, Recht und politischer Wirkung. Mit der Gemeinen Zunge als weiterem Sprachkontakt formten die Grammatici daraus eine reichsweit normierte Hochsprache. Die gelehrte Übernahme ist von einer ungebrochenen genetischen Sprachabstammung zu unterscheiden.<br><br>Das Ergebnis ist bewusst administrativ: Ein Erlass aus der Hauptstadt soll in einer Grenzfestung ebenso gelesen werden wie an einer Akademie. Regionale Aussprache darf bestehen, die geschriebene Form jedoch nicht schwanken.'),
    ('stoicheia.description.origin',
     '<strong>Stoicheia</strong> ist die phalantische und klythesische Sprache und Schrift der südlichen Stadtstaaten. Ihre vierundzwanzig Zeichen sind aus dem Kana’anith Süd-Tirnaras hervorgegangen, wurden jedoch zu einem Vollalphabet erweitert und mit einer neuen politischen und sakralen Bedeutungslehre versehen.',
     '<strong>Stoicheia</strong> ist die gemeinsame phalantische und klythesische Sprache und Schrift. Die Vorfahren beider Kulturen waren die <strong>Aechanath</strong>, ein vom Norden in den Süden Tirnaras gewandertes albisches Volk des Fürstentums <strong>Aechneach</strong>. Zarakhul versklavte sie früh, zwang sie zum Kampf und legte ihnen seine dunkle Sprache auf. <strong>Orin</strong> verwirrte die Zungen der von Zarakhul unterjochten Völker und zerstreute diese Zwangssprache. Dieser Bruch erklärt die tiefe sprachliche Entfernung von den älteren albischen und nordischen Sprachen.<br><br>Die vierundzwanzig <strong>Schriftzeichen</strong> des Stoicheia gingen später aus dem Kana’anith Süd-Tirnaras hervor. Sie wurden zum Vollalphabet erweitert und mit einer neuen politischen und sakralen Bedeutungslehre versehen. Diese Schriftlinie ist keine ungebrochene Fortsetzung der alten albischen Sprache.'),
    ('stoicheia.description.shared-language',
     'Was einst Handel und Verträge trug, wurde in den Händen der Phalantier zum Werkzeug für Kriegsrecht, Namensbindung, Prophezeiung und Staatsordnung.',
     'Nach Zarakhuls Niederlage schufen Phalantias Begründer aus dem Stadtstaat eine männerdominierte Kriegerherrschaft. Nach Jahrhunderten und der Zeit als alerischer Grenzvasall lösten sich beim Reichszerfall die westlichen Städte unter Kyreon als Klythesia. Die gemeinsame Sprache blieb trotz der politischen und religiösen Trennung bestehen.<br><br>Was einst Handel und Verträge trug, wurde in den Händen der Phalantier zum Werkzeug für Kriegsrecht, Namensbindung, Prophezeiung und Staatsordnung.'),
    ('stoicheia.stats.origin',
     "['Herkunft', 'Vollalphabetischer Nachfolger des Kana’anith']",
     "['Herkunft', 'Sprachbruch nach Orin · Kana’anith-Erbe der Schrift']"),
    ('stoicheia.language.family',
     "family: 'Tirnarische Schriftfamilie · Kana’anith-Nachfolger mit Ogham-Ferneinflüssen'",
     "family: 'Gemeinsame phalantisch-klythesische Sprache nach Orins Sprachbruch · Schrift aus Kana’anith'"),
    ('stoicheia.language.script-origin',
     'Stoicheia gilt als direkte Nachfolgeschrift des Kana’anith, das seinerseits aus der proto-albischen Ogham-Tradition hervorging. Mit dem Aufstieg der südlichen Stadtstaaten genügte eine konsonantengetragene Handels- und Vertragsschrift nicht mehr. Die Phalantier ergänzten Vokalzeichen und ordneten das Alphabet neu.',
     'Die <strong>Schrift</strong> des Stoicheia ist eine direkte Nachfolgerin des Kana’anith und bewahrt darüber ältere Einflüsse der proto-albischen Ogham-Zeichentradition. Die gesprochene Sprache gehört dagegen zur neuen Ordnung nach <strong>Orins Zungenverwirrung</strong>. Schriftverwandtschaft und Sprachabstammung sind hier nicht gleichzusetzen.<br><br>Mit dem Aufstieg der südlichen Stadtstaaten genügte eine konsonantengetragene Handels- und Vertragsschrift nicht mehr. Die Phalantier ergänzten Vokalzeichen und ordneten das Alphabet neu.'),
    ('stoicheia.language.aechanath-history',
     "title: 'Athara & der erste Nomophylax',",
     "title: 'Aechanath, Aechneach und die zerstreuten Zungen',\n              text: 'Die <strong>Aechanath</strong> wanderten als albisches Volk vom Norden in den Süden Tirnaras und siedelten im Fürstentum <strong>Aechneach</strong>. Unter Zarakhul gehörten sie zu den früh Versklavten. Sie mussten seine Kriege führen und seine dunkle Sprache sprechen.<br><br>Der Gott <strong>Orin</strong> verwirrte die Zungen der unterjochten Völker und zerstreute die gemeinsame Zwangssprache. Nach Zarakhuls Niederlage wurden die alten Völker und Sprachen nicht einfach wiederhergestellt. Zerstreute Sippen und neue Kulturen formten die spätere Sprachwelt Tirnaras. Stoicheia steht in diesem Sprachbruch und ist keine albische oder nordische Mundart.'\n            },\n            {\n              title: 'Phalantia und Klythesia: getrennte Reiche, gemeinsame Sprache',\n              text: 'Phalantias Begründer schufen nach Zarakhuls Niederlage eine männerdominierte Kriegerkultur. Vom Stadtstaat aus unterwarfen sie weitere Städte, bis Leukonias Widerstand und die Wüste im Norden die Ausdehnung begrenzten. Nach Jahrhunderten wurden sie als widerspenstiger, häufig rebellierender Grenzvasall in das Alerische Kaiserreich eingegliedert.<br><br>Als das Reich zerfiel, führte Kyreon unterdrückte Frauen und Versklavte zur Rebellion. Die westlichen Städte wurden als Klythesia von Phalantia frei. Die amazonische, matriarchale Kriegergesellschaft dient Kyreon als Gottkönig; beide Länder verwenden weiterhin Stoicheia. Die politische und religiöse Trennung bedeutet keinen zweiten vollständigen Sprachbruch.'\n            },\n            {\n              title: 'Athara & der erste Nomophylax',")
]))

files.append(update('AleriaAlmanach/modules/language/ishtaran/ishtaran-entry.js', [
    ('tirghan.description.origin',
     'Zarakhul unterwarf Tirnaras Völker unter seiner infernalen Sprache; <strong>Orin</strong> störte die Tyrannei durch Sprachverwirrung.',
     'Zarakhul zwang den von ihm unterjochten Völkern Tirnaras seine dunkle, infernale Sprache auf. Der Gott <strong>Orin</strong> verwirrte die Zungen dieser Versklavten und zerstreute die Zwangssprache; darin liegt der tiefe Unterschied der daraus entstandenen tirnarischen Sprachen zu den älteren albischen und nordischen Sprachen.'),
    ('tirghan.language.origin',
     'Orins Sprachverwirrung durchbrach die gemeinsame infernale Sprache der Unterworfenen. Das moderne Tirghan steht damit für eine andere sprachliche Ordnung als die einstige Tyrannei.',
     '<strong>Orin</strong> verwirrte die Zungen der von Zarakhul versklavten Völker und zerstreute ihre aufgezwungene gemeinsame Sprache. Dieser Eingriff erklärt den tiefen Abstand der daraus hervorgegangenen tirnarischen Sprachen zu den älteren albischen und nordischen Sprachen. Das moderne Tirghan steht damit für eine andere sprachliche Ordnung als die einstige Tyrannei. Das betrifft die unterjochten Völker; nicht jede Kultur auf oder bei Tirnara wird dadurch zu einem ehemaligen Untertan Zarakhuls.')
]))

path = 'Vorschau/Phalantia/realm-context.mjs'
before = (ROOT / path).read_bytes().decode('utf-8')
old = re.search(r'  history:\[\r?\n.*?\r?\n  \],', before, re.S).group()
new = """  history:[
    { title:'Aechanath und Aechneach',text:'Die Vorfahren Phalantias und Klythesias waren die Aechanath, ein antikes südliches Volk albischer Herkunft. Sie wanderten vom Norden in den Süden Tirnaras und siedelten im Fürstentum Aechneach.' },
    { title:'Zarakhuls Knechtschaft',text:'Die Aechanath gehörten zu den Völkern, die Zarakhul früh unterjochte. Über lange Zeit wurden sie versklavt, zum Kampf für den dunklen Untergott gezwungen und mussten seine dunkle Sprache annehmen.' },
    { title:'Orins Zungenverwirrung',text:'Der Gott Orin verwirrte die Zungen der von Zarakhul versklavten Völker und zerstreute die ihnen aufgezwungene Sprache. Darin liegt der tiefe Bruch der daraus entstandenen tirnarischen Sprachen mit den älteren albischen und nordischen Sprachen. Nach Zarakhuls Niederlage blieb Tirnara von zerstreuten Sippen, vermischten Bevölkerungen und neuen Machtbildungen geprägt; die alte Einheit kehrte nicht zurück.' },
    { title:'Vom Stadtstaat zur Kriegerherrschaft',text:'Im Gebiet des heutigen Phalantia und Klythesia schufen Phalantias Begründer eine männerdominierte Kriegerkultur. Vom Stadtstaat aus eroberten sie nach und nach weitere Städte. Leukonias Widerstand und die Wüste im Norden begrenzten ihre Ausdehnung. Die politische Herrschaft verband die Städte unter einer neuen Ordnung; die Religion beschreibt deren Krathos-Bund.' },
    { title:'Ein widerspenstiger Grenzvasall',text:'Diese Herrschaft bestand mehrere Jahrhunderte, bevor Phalantia in das Alerische Kaiserreich eingegliedert wurde. Als Grenzvasall blieb es widerspenstig und rebellierte häufig gegen die kaiserliche Herrschaft.' },
    { title:'Kyreon und der Verlust der westlichen Städte',text:'Als das Alerische Kaiserreich zerfiel, erhoben sich auch Phalantias Unterdrückte und Versklavte, insbesondere Frauen. Kyreon predigte ihnen eine neue Religion und erklärte sich zum fleischgewordenen Gott und Befreier. Er führte die Rebellion und zerschlug Phalantias Macht über die westlichen Städte. Seither ist Klythesia von Phalantia frei und dient Kyreon als Gottkönig in einer amazonischen, matriarchalen Kriegergesellschaft.' },
    { title:'Gemeinsame Sprache, getrennte Reiche',text:'Phalantia und Klythesia verwenden weiterhin Stoicheia. Das gemeinsame sprachliche Erbe hebt die politische und religiöse Trennung nicht auf. Die Schrift bewahrt über Kana’anith ältere Ogham-Einflüsse; diese Zeichenlinie ist von der Geschichte der gesprochenen Sprache nach Orins Eingriff zu unterscheiden.' },
    { title:'Hauptstadt und Nebenstädte',text:'Beide Königshäuser leben in Lysandreia, jeweils in einem eigenen Palast. Sieben große Nebenstädte und tausende kleine Siedlungen bilden das übrige Land. Die kleinen Siedlungen werden auf dieser Übersicht nicht einzeln erfunden oder verzeichnet.' },
  ],"""
if '\r\n' in old:
    new = new.replace('\n', '\r\n')
files.append(update(path, [
    ('history', old, new),
    ('culture.faith',
     'Der Krathos-Bund verbindet Krieg mit Gesetz, Familie, Gnade und geordneter Arbeit. Die bestehende Religionsseite bleibt für den Glauben maßgeblich; diese Vorbereitung ergänzt keinen neuen Götterkreis und keine abweichende Gründungslegende.',
     'Der Krathos-Bund verbindet Krieg mit Gesetz, Familie, Gnade und geordneter Arbeit. Phalantia und Klythesia teilen das Stoicheia, stehen einander religiös jedoch gegenüber. Der Phalantische Bund betrachtet Kyreons Zirkel als Ketzerei. Diese religiöse Gegnerschaft und der Verlust der westlichen Städte begründen keinen hier zusätzlich festgelegten heutigen Krieg.')
]))

if changes:
    manifest = {'schemaVersion': 1, 'date': '2026-11-04', 'authority': 'Nutzerfestlegung: Aechanath, Aechneach, Orins Zungenverwirrung und Kyreons Rebellion',
                'scope': 'Aktive Sprachlore und Phalantias Landesgeschichte; keine Corpus-, Identitäts-, Karten- oder Live-Datenänderungen',
                'files': [item for item in files if item], 'changes': changes,
                'preserved': ['Fonts-Originalpakete', 'Alphabete', 'Grammatik', 'Wortlisten', 'Namenlisten', 'Schriftregister', 'Phalantia-Häuser und IDs', 'Duo-Königtum und Geruso', 'Historische Evidenzinventare'],
                'push': False, 'deploy': False}
    (OUT / 'changes.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'changedFiles': len([item for item in files if item]), 'changedFields': len(changes)}))
