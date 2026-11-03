// Einmalige redaktionelle Übernahme bereits vorhandener öffentlicher Registerfakten.
// Keine Familien werden erzeugt oder genealogische Daten verändert.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createPreparedHouseContent } from '../../Familien Häuser und Clans/modules/house-content/prepared-house-content.mjs';

const root = process.cwd();
const diag = 'diagnostics/klaueninsel-house-pages-20261103';
const records = JSON.parse(await fs.readFile(path.join(root,diag,'lower-houses.json'),'utf8'));
const images = JSON.parse(await fs.readFile(path.join(root,diag,'image-prompts.json'),'utf8'));
const { FAMILY_REGISTRY } = await import(pathToFileURL(path.join(root,'Stammbäume/assets/js/data/families.registry.js')));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const county = {
  id:'grafschaft-klaueninsel',name:'Klaueninsel',
  href:'../Kontinente/Estryll/Königreich Cenyr/Grafschaft Klaueninsel/Grafschaft Klaueninsel.html'
};
const cryftlawd = {
  id:'herrschaft-krallenspitze',name:'Krallenspitze · Caer Cryftlawd',
  href:'../Kontinente/Estryll/Königreich Cenyr/Grafschaft Klaueninsel/Herrschaft Krallenspitze/Herrschaft Krallenspitze.html'
};

// Berufs- und Hausgeschichte wird bewusst redigiert, nicht aus Geburtsreihen oder
// technischen Notizen über die Erweiterung der Familiengraphen zusammengesetzt.
const lore = {
  'haus-llafnfor': {
    overview:'Haus Llafnfor ist eine Ritterherrenfamilie der Klaueninsel im Gefolge der Dyfrgi von Caer Cryftlawd. Ein eigener Familiensitz ist nicht belegt. Die Zuordnung zur Talklaue bezeichnet den Dienstherrn und dessen Herrschaft.',
    history:'Cynfarch Llafnfor ist als Kapitän und Retter Gwrgan Cochdons bekannt. Auf einer Patrouille unweit der Klaueninseln nahm er Gwrgan und zwölf weitere geflohene Thralls auf, vertrieb ihre Verfolger und sorgte für ihre fürsorgliche Heimführung.',
    character:'Die überlieferte Rettung verbindet Cynfarch mit verlässlicher Freundschaft zu Gwrgan. Weitergehende Hausbräuche werden daraus nicht abgeleitet.',
    customs:'Seefahrt ist durch Cynfarchs Kapitänsdienst belegt.',
    relations:'Cynfarch ist ein treuer Vasall der Dyfrgi. Weitere Angehörige und die frühe Hausgeschichte bleiben ausdrücklich offen.',
    profession:'Cynfarch dient als Ritterherr und Kapitän. Seine Rettungsfahrt ist die konkret überlieferte Tat des Hauses.',
    decision:'Der ausdrückliche Auftrag vom 30.10.2026, die weitere Familie nicht zu vervollständigen, bleibt gewahrt. Keine neuen Angehörigen, Gründer, Ehen, Erben oder eigener Sitz.'
  },
  'haus-beryn': {
    overview:'Haus Beryn ist ein kleines niederes Ritterherrenhaus aus Talgarth in der Sturmklaue und dient unmittelbar den Arth. Owain Beryn ist ausdrücklich als Oberhaupt und Ritterherr von Talgarth belegt. Angehörige des Hauses stehen in unterschiedlichen Aufgaben auf den Schiffen der Arth und ihrer Verbündeten.',
    history:'Caradog Beryn ist der älteste namentlich belegte Angehörige. Madog Beryn war bis 1725 Ritterherr von Talgarth. Unter seinen Söhnen Rhodri, Cadell und Brychan bestehen drei fortgeführte Linien. Die Hausüberlieferung reicht damit über mehrere Generationen; ein Gründungsjahr ist daraus nicht abzuleiten.',
    character:'Die belegten Angehörigen zeigen unterschiedliche Seiten des Dienstes zur See. Gwaeden ist diszipliniert und aufmerksam, Eira dagegen wild, frech und neugierig. Diese persönlichen Eigenschaften werden nicht zu einem einheitlichen Wesenszug der gesamten Familie erklärt.',
    customs:'Ifor Beryn wurde zusammen mit Rhy Dyger von Parzifal Arth in Idwal Draigs Mannschaft entsandt. Eira, Tochter Owains und Mareds und Ifors Nichte, steht noch am Anfang ihres Knappendienstes bei Lynne Arth. Brychan gehört als Ritter zu einer weiteren Linie. Sein Sohn Gwaeden ist Wachmeister auf dem Seebären und teilt die Wachen an Deck und im Hafen ein.',
    relations:'Das Haus ist mit den Arth durch ritterlichen und persönlichen Borddienst verbunden. Die bekannten Verwandtschaften zwischen Owain, Ifor, Eira, Brychan und Gwaeden bleiben erhalten. Eine festgelegte neue Erbfolge folgt aus diesen Verwandtschaftsangaben nicht.',
    profession:'Das Ritterhaus ist durch Knappendienst, ritterlichen Borddienst und die Wachführung auf See konkret belegt.',
    currentHead:'Owain Beryn',
    decision:'Owain wird nur deshalb als Oberhaupt genannt, weil sein bestehender Personentitel dies ausdrücklich belegt. Caradog wird als ältester belegter Angehöriger, nicht als erfundener Gründer geführt. Eira behält die stabile Personen-ID eirlys-beryn und ihren aktuellen Namen Eira.'
  },
  'haus-dyger': {
    overview:'Haus Dyger ist ein niederes Rittergeschlecht aus Talgarth in der Sturmklaue und ein direkter Vasall der Arth. Musik und Seefahrt prägen die Familie. Sie betreibt eine einfache Musikantenschule in Talgarth und ist auf mehreren Schiffen mit Musikern vertreten.',
    history:'Die Dyger verbinden ihren ritterlichen Dienst mit dem Beruf der Schiffsmusikanten. Ihre Musikantenschule ist weniger angesehen als die großen Bardenhäuser. Die Ceirwyn belächeln die Familie als Säufer und Tavernenschläger. Trotz dieser Geringschätzung besitzt sie eine eigenständige Rolle in der maritimen Kultur Talgarths. Eine datierte Gründung der Schule ist nicht überliefert.',
    character:'Lebenslust und Seemannsmusik sind konkret belegt. Der Ruf rauer Tavernengänger ist die Sicht angesehener Bardenhäuser, keine abschließende Beschreibung aller Angehörigen. Die Dyger bilden keine Barddwyr aus; musikalische Begabung und einfache Zaubertricks begründen keine solche Ausbildung.',
    customs:'Caedmon Dyger spielt auf der Dychwelyd. Sein Sohn Rhy dient als Morwyr und Schiffsmusikant auf der Tiefenwyrm. Parzifal entsandte ihn zusammen mit Ifor Beryn in Idwal Draigs Mannschaft und gab ihm den Rufnamen Rüdiger. Rhy beherrscht amateurhafte Zaubertricks, ist jedoch kein ausgebildeter Barddwyr. Seine Cousine Awen spielt Schifferklavier auf der Leeren Flasche. Ihr Bruder Iwrban begleitet den Arbeitstakt auf dem Seebären mit Fiedel und Seemannsliedern.',
    relations:'Die Bindung an die Arth ist durch das bestehende Lehensverhältnis und den Borddienst belegt. Awen und Iwrban sind Geschwister; Caedmon ist Rhys Vater. Eine namentlich gesicherte Hausführung ist nicht aus der Reihenfolge der Generationen abzuleiten.',
    holdings:'Die einfache Musikantenschule in Talgarth ist als Einrichtung des Hauses überliefert. Weitere konkrete Besitzungen sind nicht benannt.',
    profession:'Ritterlicher Dienst, Morwyr-Ausbildung und Schiffsmusik kommen bei den Dyger zusammen. Die Schule bildet Musikanten aus und ist keine Barddwyr-Schule.',
    decision:'Caedmon behält die bestehende Personen-ID tudur-dyger. Kein Datum aus dem genealogischen Familiengerüst wird zur Hausgründung. Keine Aufwertung der Musikanten zu Barddwyr.'
  },
  'haus-gwyllt': {
    overview:'Haus Gwyllt ist eine eigenständige Familie aus Talgarth in der Sturmklaue. Ihr Hausrang ist bislang offen. Deiniol Gwyllt dient als Schiffskaplan auf der Dychwelyd.',
    history:'Die konkrete Überlieferung der Familie verbindet sich mit Deiniols geistlichem Dienst an Bord. Er ist Streiter Baldrans und wird als ruhig, väterlich und trocken-humorig beschrieben.',
    character:'Die bekannten Charakterzüge gehören Deiniol persönlich. Ein zusätzlicher Hauskodex ist nicht überliefert.',
    relations:'Deiniols Borddienst verbindet die Familie mit Parzifal Arths Mannschaft. Eine Verwandtschaft mit der ebenfalls geistlich vertretenen Familie Prys ist nicht belegt.',
    profession:'Deiniols Amt ist das eines Schiffskaplans. Sein persönlicher geistlicher Rang legt den Stand der gesamten Familie nicht fest.',
    culture:'Deiniol dient Baldran, dem Streiter. Eine darüber hinausgehende religiöse Hausüberlieferung ist nicht ausgearbeitet.',
    decision:'Gwyllt bleibt ein eigenständiges Haus mit offenem Rang. Keine Verschmelzung mit Prys und keine pauschale Ritter- oder Bürgerwürde.'
  },
  'haus-mathgraig': {
    overview:'Haus Mathgraig ist eine bürgerliche Familie aus Talgarth mit engen Verbindungen zum Hafen. Mehrere Angehörige dienen auf den Schiffen der Arth als Steuerleute, Navigator oder Segelmeister.',
    history:'Die bekannte Familiengeschichte zeigt sich im gemeinsamen Seefahrtsberuf der Geschwister Uwchric, Seithen, Gereint und Nest. Ihre Aufgaben verteilen sich auf die Dychwelyd, den Seebären und die Leere Flasche.',
    character:'Nest und Uwchric sind erfahrene Steuerleute und bleiben auch bei schwerer See sicher am Ruder. Diese Kenntnisse sind als persönliche Fähigkeiten belegt.',
    customs:'Seithen beaufsichtigt die Segelführung und Takelage der Dychwelyd; Gereint ist dort Navigator. Nest führt das Ruder der Leeren Flasche, Uwchric das des Seebären.',
    relations:'Die vier namentlich belegten Geschwister verbinden das Haus mit den Mannschaften Parzifals, Rhydians und Lynnes. Eine eigene Werft oder ein anderer Familienbetrieb ist daraus nicht abzuleiten.',
    profession:'Seefahrt, Navigation, Steuerkunst und die Führung der Segel sind durch die bekannten Angehörigen belegt.'
  },
  'haus-prys': {
    overview:'Haus Prys ist eine bürgerliche Familie aus Talgarth und betreibt eine große Taverne. Daneben sind Angehörige als Geistliche Baldrans im Dienst der Arth-Schiffe bekannt.',
    history:'Bethan Prys wurde an Baldrans Kathedrale in Talgarth ausgebildet und dient als Schiffskaplanin der Leeren Flasche. Oenric Prys versieht den geistlichen Dienst auf dem Seebären.',
    character:'Bethan gilt als fröhlich und trinkfest; Oenric als kameradschaftlich und mit den Bräuchen der Seeleute vertraut. Die tavernennahe Lebenswelt und der geistliche Dienst gehören beide zum belegten Familienbild.',
    holdings:'Eine große Taverne in Talgarth ist der ausdrücklich überlieferte Familienbetrieb. Ihr Name und eine genaue Adresse sind nicht genannt.',
    culture:'Bethan und Oenric sind Geistliche Baldrans. Der konkrete persönliche Dienst ist belegt; eigene zusätzliche Hausrituale werden nicht ergänzt.',
    relations:'Borddienst verbindet die Familie mit Lynne und Rhydian Arth. Eine Verwandtschaft mit Deiniol Gwyllt folgt aus dem gemeinsamen Glauben nicht.',
    profession:'Tavernenbetrieb und geistlicher Dienst sind überliefert. Ein unbekannter Name des Familiengasthauses bleibt offen.'
  },
  'haus-morgwynt': {
    overview:'Haus Morgwynt ist ein niederes Ritterhaus aus Talgarth in der Sturmklaue. Bekannte Angehörige arbeiten in der Decksführung, als Ausguck, Wachmeister und im persönlichen Knappendienst der Arth.',
    history:'Edern Morgwynt dient als Ausguck und Späher auf der Dychwelyd; sein Sohn Helban ist Bootsmann des Seebären. Ederns jüngerer Bruder Cadell führt die Bordwachen der Dychwelyd und ist Vater von Mabli und Cadyn.',
    character:'Mabli wird als patent, seefest und energisch beschrieben. Helban führt das Deck mit rauem Ton und klaren Befehlen. Diese persönlichen Merkmale begleiten ihre konkreten Aufgaben an Bord.',
    customs:'Mabli ist Bootsfrau der Leeren Flasche, auf der auch ihre Knappin Una Dyfrgi dient. Mablis jüngerer Bruder Cadyn ist Rhydian Arths persönlicher Knappe zur See. Damit sind sowohl erfahrene Decksarbeit als auch ritterliche Ausbildung belegt.',
    relations:'Die Geschwister Mabli und Cadyn sowie die ältere Generation um Cadell und Edern verbinden das Haus mit mehreren Mannschaften der Arth. Ein bestimmtes Oberhaupt wird nicht aus Alter oder Bordrang abgeleitet.',
    profession:'Ritterlicher Knappendienst, Decksführung, Wachen und Aufklärung zur See sind konkret belegt.'
  },
  'haus-morglan': {
    overview:'Haus Morglan ist eine alte bürgerliche Fischerfamilie der Klaueninsel mit Sitzzuordnung Talgarth. Sie ist ein eigenständiges Haus und von der Seefahrerfamilie Morlan zu unterscheiden.',
    history:'Angharad Morglan hat bereits unter Run Arth gedient und ist heute Quartiermeisterin der Leeren Flasche. Ihr jüngerer Bruder Huw beaufsichtigt auf der Dychwelyd den Proviant. Huws Sohn Saithar ist Quartiermeister des Seebären.',
    character:'Die bekannten Aufgaben verbinden Fischerei und Seefahrt mit der Versorgung und Ordnung des Bordalltags. Angharads Rufname „Großmütterchen“ ist eine Gewohnheit ihrer Mannschaft, die sie selbst nicht schätzt.',
    customs:'Huw verwaltet Schiffsproviant und haltbare Vorräte. Saithar organisiert Stauplätze, Ausrüstung und die Ausgabe an die Mannschaft.',
    relations:'Die belegten Geschwister- und Vater-Sohn-Beziehungen bleiben erhalten. Die Namensähnlichkeit zu Morlan begründet keine gemeinsame Familie.',
    profession:'Fischerei ist als Familienberuf belegt; die Quartier- und Proviantmeisteraufgaben gehören den namentlich bekannten Angehörigen.'
  },
  'haus-bowen': {
    overview:'Haus Bowen ist eine bürgerliche Familie aus Talgarth in der Sturmklaue. Sie besitzt eine eigene Werft, in der die Leere Flasche gebaut wurde.',
    history:'Der Bau der Leeren Flasche ist das konkret überlieferte Werk der Familienwerft. Ffion Bowen stammt aus diesem Handwerksbetrieb und dient auf demselben Schiff als Schiffszimmerfrau.',
    character:'Ffion wird als patent und kräftig beschrieben und weiß sich auch in einer Prügelei zu behaupten. Diese persönlichen Eigenschaften ergänzen ihren handwerklichen Beruf.',
    holdings:'Die eigene Werft in Talgarth ist belegt. Ihr genauer Standort, weitere Betriebe und Besitzungen sind nicht genannt.',
    relations:'Ffions Arbeit verbindet die Familie mit Lynne Arths Mannschaft. Weitere Angehörige und ein eigenes Lehensverhältnis werden nicht ergänzt.',
    profession:'Schiffbau in der Familienwerft und Ffions Dienst als Schiffszimmerfrau sind die belegten handwerklichen Schwerpunkte.'
  },
  'haus-bevan': {
    overview:'Die Familie Bevan ist Talgarth in der Sturmklaue zugeordnet. Ihr Hausrang ist bislang offen. Nerys Bevan dient als Feldscherin auf der Leeren Flasche.',
    history:'Die konkrete Überlieferung betrifft Nerys’ Arbeit in Lynne Arths Mannschaft. Sie mischt Arzneien und führt ihre alkoholische „Medizin“ mit sich.',
    character:'Nerys’ Tätigkeit ist als persönliche Heilkunde belegt. Ein eigener Familienbetrieb oder eine gemeinsame Berufstradition aller Bevan ist nicht beschrieben.',
    relations:'Der Dienst auf der Leeren Flasche verbindet Nerys mit Lynne Arth. Weitere Familienverhältnisse und Lehensbindungen bleiben offen.',
    profession:'Nerys ist Feldscherin; daraus folgt kein Adelstitel und keine festgelegte Standeszuordnung der Familie.'
  },
  'haus-arian': {
    overview:'Die Familie Arian ist in Talgarth in der Sturmklaue verzeichnet. Ihr Hausrang ist offen. Lowri Arian dient als Schiffsmeierin auf der Leeren Flasche.',
    history:'Lowri verwaltet die Schiffskasse, den Sold und wertvolle Güter. Diese konkrete Verwaltungsaufgabe ist die überlieferte Verbindung der Familie zum Bordleben.',
    character:'Lowri gilt als kontrolliert und zuverlässig, bis Alkohol ins Spiel kommt. Diese persönliche Beschreibung wird nicht auf alle Angehörigen übertragen.',
    relations:'Ihr Dienst verbindet Lowri mit Lynne Arths Mannschaft. Ein eigenes Hausvermögen, weiterer Betrieb oder ein familiäres Lehensverhältnis sind nicht daraus abzuleiten.',
    profession:'Schiffsverwaltung und die Verantwortung für Geld und wertvolle Ladung sind Lowris belegte Aufgaben.'
  },
  'haus-hirschhorn': {
    overview:'Die Familie Hirschhorn ist Talgarth in der Sturmklaue zugeordnet. Sigrid Hirschhorn selbst stammt aus Ivarsheim. Ein Hausrang und eine gemeinsame Umsiedlungsgeschichte sind nicht belegt.',
    history:'Sigrid dient als Wachmeisterin der Leeren Flasche. Ihr Vater Halvard, Gemahl Ingas, ist Schiffskoch der Dychwelyd und Hirdmann. Die beiden verschiedenen Bordrollen sind als persönliche Aufgaben überliefert.',
    character:'Sigrid ist kräftig, wachsam und im Dienst diszipliniert; außerhalb des Dienstes trinkt sie gern. Halvard hält sich für einen ausgezeichneten Koch, während seine Kameraden über sein Fleischgericht spotten.',
    relations:'Die Vater-Tochter-Beziehung ist belegt. Sigrids Herkunft aus Ivarsheim bleibt neben der Talgarther Zuordnung der Familienakte bestehen.',
    profession:'Sigrids Wachführung und Halvards Arbeit in der Kombüse begründen weder einen Adelstitel noch einen einheitlichen Familienberuf.',
    decision:'Keine erfundene Wanderungs- oder Umsiedlungsgeschichte. Ivarsheim bleibt Sigrids persönlicher Herkunftsort; Talgarth die aktuelle Registerzuordnung. Halvards Hirdmannstellung begründet keinen Hausrang.'
  },
  'haus-penry': {
    overview:'Haus Penry ist eine bürgerliche Familie aus Talgarth mit belegtem Dienst in Verwaltung und Haushalt der Arth. Rhun Penry ist Vogt des Grafenhauses und Großvater Meleri Penrys.',
    history:'Meleri dient Lynne Arth als Schreiberin, Adjutantin und persönliche Zofe. Maelban unterstützt Rhydian als Schreiber und Adjutant. Rhuns jüngerer Bruder Iorwerth ist Quartiermeister der Dychwelyd und Großonkel von Meleri und Maelban.',
    character:'Meleri wird als höfisch, gut organisiert und trocken-humorig beschrieben. Ihr Dienst reicht von Schriftarbeit bis zur praktischen Ordnung von Lynnes Alltag.',
    customs:'Maelban führt Logbuch, Mannschaftslisten und Korrespondenz. Iorwerths Quartiermeisterdienst ergänzt die schriftlichen und häuslichen Aufgaben der jüngeren Angehörigen.',
    relations:'Die Ämter verbinden die Familie mit dem Grafenhof sowie den Mannschaften Parzifals, Lynnes und Rhydians. Rhuns Vogtamt ist ausdrücklich belegt; ein Oberhaupt der Familie wird damit nicht automatisch festgelegt.',
    profession:'Verwaltung, Schriftarbeit, Haushaltsdienst und Quartiermeisteraufgaben sind durch konkrete Angehörige belegt.',
    decision:'Rhun Penrys Vogtamt stammt aus dem ausdrücklichen bestehenden Personentitel. Keine Ableitung einer familiären Führung aus Amt oder Alter.'
  },
  'haus-parry': {
    overview:'Die Familie Parry ist Talgarth in der Sturmklaue zugeordnet. Ihr Hausrang ist offen. Tesni Parry dient als Schiffsköchin der Leeren Flasche.',
    history:'Tesni ist die Tochter der Köchin des Hauses Arth. Der Name ihrer Mutter ist nicht belegt. Die beiden bekannten Küchenaufgaben verbinden die Familie mit Hof und Schiff.',
    character:'Tesni gilt als hervorragende Köchin, frech, kokett und selbstbewusst. Diese Beschreibung gehört zu ihrer Person.',
    relations:'Tesnis Borddienst gilt Lynne Arths Mannschaft, ihre Mutter arbeitet für das Haus Arth. Weitere Verwandte oder ein gesamtes familiäres Lehensverhältnis werden daraus nicht ergänzt.',
    profession:'Kochkunst ist bei Tesni und ihrer Mutter ausdrücklich belegt. Ein eigener Gasthof oder anderer Familienbetrieb ist nicht genannt.',
    decision:'Die namentlich unbekannte Mutter erhält keine erfundene Identität oder neue Personenakte. Der offene Hausrang wird beibehalten.'
  },
  'haus-gwernhelyd': {
    overview:'Haus Gwernhelyd ist eine bürgerliche Familie aus Talgarth in der Sturmklaue. Ihre überlieferte Berufstradition ist die Lotserei.',
    history:'Das Handwerk der Gwernhelyd besteht in der sicheren Führung von Schiffen durch Untiefen und Hafeneinfahrten. Die Kenntnis örtlicher Fahrwasser ist der konkret belegte Schwerpunkt.',
    character:'Ein eigener Hauskodex und besondere Bräuche sind noch nicht beschrieben. Aus dem Lotsenberuf werden keine zusätzlichen Tugenden oder Ämter erfunden.',
    relations:'Ein namentliches Oberhaupt und weitere Angehörige sind noch offen. Unbestätigte Mannschaftskandidaten gehören nicht zur ausgearbeiteten Familie.',
    profession:'Lotsen und Fahrwasserkenner begleiten die sichere Ein- und Ausfahrt von Schiffen.',
    decision:'Die frühere Kandidatenliste zur Mannschaftsplanung bleibt Entwurf. Keine neuen Personen oder Verwandtschaften übernommen.'
  },
  'haus-cledrann': {
    overview:'Haus Cledrann ist ein niederes Ritterhaus aus Talgarth in der Sturmklaue. Seine bekannte Tradition betrifft den Küstenwachtdienst und die Waffenpflege an Bord.',
    history:'Küstenwache und die Pflege der Bordwaffen bilden die bislang überlieferten Aufgaben des Hauses. Eine datierte Gründung oder besondere frühere Tat ist nicht benannt.',
    character:'Aus der Diensttradition werden kein neuer Hauskodex und keine zusätzlichen Sonderrechte abgeleitet.',
    relations:'Das Oberhaupt, konkrete Besitzungen und ein familiäres Lehensverhältnis sind noch offen. Unbestätigte Mannschaftskandidaten werden nicht als Angehörige geführt.',
    profession:'Der Ritterstand ist belegt. Die bekannten praktischen Aufgaben sind Wachdienst an der Küste und Waffenpflege auf See.',
    decision:'Ritterstand aus dem aktuellen Profil beibehalten; die konkrete Lehensbindung bleibt trotz örtlicher Nähe zu Arth offen. Keine Kandidaten aus dem Planungsentwurf übernommen.'
  },
  'haus-halenwych': {
    overview:'Haus Halenwych ist eine bürgerliche Familie aus Talgarth in der Sturmklaue. Sie ist auf Salzhandel, Vorratslagerung und haltbaren Schiffsproviant spezialisiert.',
    history:'Die bekannte Berufstradition verbindet Salz und Lagerwirtschaft mit der Versorgung von Schiffen. Eine darüber hinausgehende datierte Hauschronik ist noch nicht ausgearbeitet.',
    character:'Ein eigener Hauskodex oder zusätzliche Bräuche sind nicht überliefert. Die berufliche Spezialisierung ist belegt, ein bestimmter benannter Betrieb dagegen noch nicht.',
    relations:'Namentliche Angehörige und ein Oberhaupt bleiben offen. Die Familienvorbereitung umfasst keine unbestätigten Mannschaftskandidaten.',
    profession:'Salzhandel, sachgerechte Lagerung und haltbarer Proviant sind die ausdrücklich genannten Tätigkeiten.',
    decision:'Berufliche Spezialisierung aus der Beschreibung erhalten. Keine Kandidatenpersonen aus dem früheren Mannschaftsentwurf und kein unbelegtes eigenes Lagergebäude ergänzt.'
  },
  'haus-torawg': {
    overview:'Haus Torawg ist eine bürgerliche Seefahrerfamilie aus Talgarth in der Sturmklaue. Erfahrung auf See und die Vorliebe für schwierige Fahrwasser sind als Familientradition überliefert.',
    history:'Gwenfron Torawg dient als Steuerfrau der Dychwelyd. Sie wird als erfahrene Seefahrerin beschrieben und hat ausdrücklich Freude an schwerer See.',
    character:'Die überlieferte Vorliebe für anspruchsvolle Gewässer zeigt sich konkret in Gwenfrons Dienst. Weitere besondere Hausrituale werden nicht ergänzt.',
    relations:'Gwenfrons Arbeit verbindet die Familie mit Parzifal Arths Mannschaft. Ein bestimmtes Oberhaupt ist nicht aus den vorhandenen Generationen abzuleiten.',
    profession:'Seefahrt und die Steuerführung bei schwerer See sind die belegten Schwerpunkte.',
    decision:'Torawg ist der bestätigte Name. Die versehentliche frühere Schreibweise Tonfawr wird nicht als zweite Familie fortgeführt.'
  },
  'haus-ddraenen': {
    overview:'Haus Ddraenen ist eine bürgerliche Familie aus Talgarth in der Sturmklaue. Ihr Angehöriger Iestyn Ddraenen besitzt eine persönliche Ritterwürde, die keinen Adelstitel für die gesamte Familie begründet.',
    history:'Iestyn war Parzifal Arths Knappe und dient ihm heute als Ritter zur See und persönlicher Leibwächter. Das Familiensymbol des Dornzweigs mit roter Blüte ist von seiner Rüstung überliefert.',
    character:'Der konkrete persönliche Dienst verbindet Iestyn mit dem Grafen. Ein zusätzlicher Hauskodex und besondere erbliche Rechte sind nicht belegt.',
    relations:'Iestyns Bindung an Parzifal reicht vom früheren Knappendienst bis zum heutigen Leibwächteramt. Ein familiäres Lehensverhältnis wird daraus nicht automatisch abgeleitet.',
    profession:'Iestyn ist als Sir, Ritter zur See und Leibwächter belegt. Der bürgerliche Stand des Hauses bleibt dabei erhalten.',
    decision:'Persönliche Ritterwürde und Hausstand ausdrücklich getrennt. Keine neue Adelung der Familie und kein Hausoberhaupt aus dem bekannten Bordamt abgeleitet.'
  },
  'haus-pluen': {
    overview:'Haus Pluen ist eine bürgerliche Schreiberfamilie aus Talgarth in der Sturmklaue. Korrespondenz, Register und sorgfältige Buchführung sind als ihr Handwerk belegt.',
    history:'Enid Pluen dient als Schreiberin und Adjutantin auf der Dychwelyd. Parzifals Gemahlin wählte sie für den Dienst an Bord aus.',
    character:'Enids Arbeit umfasst die Organisation von Korrespondenz, Befehlen und Verwaltung. Diese konkreten Aufgaben ergänzen die bekannte Schreibertradition der Familie.',
    relations:'Enids Borddienst verbindet die Pluen mit Parzifal Arths Mannschaft. Ein namentliches Hausoberhaupt und eine bestimmte eigene Schreibstube werden daraus nicht abgeleitet.',
    profession:'Schriftführung, Registerarbeit und Buchhaltung bilden den belegten familiären Schwerpunkt. Enid übt diese Kenntnisse im Borddienst aus.'
  },
  'haus-morlan': {
    overview:'Haus Morlan ist eine eigenständige bürgerliche Familie aus Talgarth mit langer Seefahrertradition. Sie ist von der Fischerfamilie Morglan zu unterscheiden.',
    history:'Tudur Morlan ist als Altmatrose der Dychwelyd bekannt. Er war bereits an Bord, als Parzifal Arth im Alter von achtzehn Jahren erstmals das Schiff betrat.',
    character:'Die lange gemeinsame Zeit erklärt, weshalb Tudur den Grafen gelegentlich noch „Junge“ nennt. Diese persönliche Vertrautheit ist überliefert und begründet kein eigenes Hausamt.',
    relations:'Tudurs Dienst verbindet die Familie seit langer Zeit mit Parzifal und dessen Schiff. Eine Verwandtschaft mit Morglan folgt aus der Namensähnlichkeit nicht.',
    profession:'Die Seefahrertradition ist sowohl in der Hausbeschreibung als auch durch Tudurs langjährigen Matrosendienst belegt.',
    decision:'Morlan und Morglan bleiben getrennte Familien. Aus dem genealogischen Gerüst werden keine Gründungsdaten oder Wanderungsgeschichte abgeleitet.'
  }
};

function cleanRole(title) {
  return String(title || 'Angehörige Person').replace(/\s*·\s*\d+(?:[–-]\d+)? Jahre.*$/,'').trim();
}
function cleanDetail(notes) {
  return String(notes || '')
    .replace(/^\d+(?:[–-]\d+)? Jahre(?: im (?:Jahr|Bezugsjahr) 1740)?\.\s*/,'')
    .replace(/Auf Nutzerwunsch heißt diese bestehende Person seit 06\.10\.2026 Caedmon\.\s*/,'')
    .replace(/Die früher vergebenen Personen-IDs bleiben erhalten\.\s*/,'')
    .replace(/Neu aufgenommenes Mannschaftsmitglied(?: nach Nutzervorlage)?\.\s*/,'')
    .replace(/Die versehentliche Schreibweise Tonfawr ist berichtigt\.\s*/,'')
    .trim();
}
const delivery = [];
function canonicalSourceFiles(id) {
  const sourceBase='Stammbäume/assets/js/data/';
  if(id==='haus-llafnfor') return [sourceBase+'gwynthor-erbstreit/llafnfor-family.js'];
  if(['haus-beryn','haus-dyger'].includes(id)) return [sourceBase+`house-${id.slice(5)}-family.js`,sourceBase+`parzifal-crew-families/${id.slice(5)}.js`];
  if(id==='haus-gwyllt') return [sourceBase+'house-gwyllt-family.js'];
  if(['haus-gwernhelyd','haus-cledrann','haus-halenwych'].includes(id)) return [sourceBase+'rhydian-crew-house-families.js'];
  if(['haus-torawg','haus-ddraenen','haus-pluen','haus-morlan'].includes(id)) return [sourceBase+'parzifal-crew-house-families.js',sourceBase+`parzifal-crew-families/${id.slice(5)}.js`];
  return [sourceBase+'lynne-crew-house-families.js',sourceBase+'lynne-crew-family-members.js'];
}
for (const record of records) {
  const image = images.find(entry=>entry.id===record.id);
  if (!image || !lore[record.id]) throw new Error(`Fehlende redaktionelle Zuordnung: ${record.id}`);
  const file = path.join(root,image.folder,'haus.content.mjs');
  try { await fs.access(file); throw new Error(`Bestehende Quelle wird nicht überschrieben: ${file}`); }
  catch(error) { if(error.code!=='ENOENT') throw error; }
}
for (const record of records) {
  const artwork = images.find(entry=>entry.id===record.id), text=lore[record.id];
  const territory=record.id==='haus-llafnfor'?cryftlawd:county;
  const content=createPreparedHouseContent({record,territory,image:artwork.image.replace('Familien Häuser und Clans/',''),emblemDescription:artwork.emblemDescription,contentVersion:'20261103-klaueninsel-v1'});
  const canonical=FAMILY_REGISTRY.find(entry=>entry.id===record.id)?.family;
  if(!canonical) throw new Error(`Fehlende reale Familienakte: ${record.id}`);
  content.biographySummary = {
    overview:text.overview,history:text.history,character:text.character,
    ...(text.customs?{customs:text.customs}:{}),
    ...(text.holdings?{holdings:text.holdings}:{}),
    ...(text.culture?{culture:text.culture}:{}),relations:text.relations
  };
  content.sections = {
    overview:text.overview, history:text.history,
    traditions:text.customs || text.profession,
    knighthood:text.profession,
    holdings:text.holdings || 'Konkrete eigene Besitzungen sind bislang nicht näher beschrieben.',
    cultureReligion:text.culture || 'Eine besondere religiöse Hausüberlieferung ist bislang nicht beschrieben.',
    conflictsAlliances:text.relations,
    values:text.character,
    succession:'Eine bestimmte Erbfolge ist bislang nicht belegt.',
    court:'Die folgenden Personen sind mit ihren tatsächlich überlieferten Aufgaben aufgeführt. Bordämter bezeichnen ihren Dienst auf dem jeweiligen Schiff.',
    familyTree:'Die bereits ausgearbeitete Familienakte ist hier eingebettet. Das Hauswappen im Stammbaum öffnet die Hausbiografie.',
    historicalFigures:'Eine gesonderte historische Gründerfolge ist nicht überliefert.'
  };
  if(record.id==='haus-beryn') content.sections.historicalFigures='Caradog Beryn ist der älteste namentlich belegte Angehörige; Madog Beryn war bis 1725 Ritterherr von Talgarth. Eine datierte Hausgründung ist nicht überliefert.';
  if(record.id==='haus-llafnfor') content.sections.holdings='Ein eigener Familiensitz ist nicht belegt. Die örtliche Zuordnung folgt den Dyfrgi von Caer Cryftlawd, denen Cynfarch dient.';
  content.images.banner = '../Stammbäume/assets/images/regions/klaueninsel.png';
  content.officesTitle = 'Belegte Angehörige und Aufgaben';
  content.headsTitle = 'Ausdrücklich belegte Hausführung';
  content.currentHead = text.currentHead || '';
  content.offices = record.people.filter(p=>p.portrait && !/^\?+$/.test(p.name)).map(p=>{
    const actual=canonical.persons.find(person=>person.id===p.id);
    if(!actual || actual.name!==p.name || actual.portrait!==p.portrait) throw new Error(`Person stimmt nicht mit dem aktuellen Register überein: ${record.id}/${p.id}`);
    return {id:p.id,familyId:record.id,name:p.name,role:cleanRole(p.title),detail:cleanDetail(p.notes),image:`../Stammbäume/${p.portrait}`,silhouette:p.sex==='female'?'female':'male'};
  });
  if(record.id==='haus-penry') content.sections.court='Rhun Penry ist ausdrücklich als Vogt der Arth belegt. Die übrigen aufgeführten Tätigkeiten bezeichnen den persönlichen Dienst auf den genannten Schiffen.';
  if(record.id==='haus-beryn') content.sections.court='Owain Beryn ist ausdrücklich als Oberhaupt belegt. Die folgenden Angehörigen sind mit ihren persönlichen Aufgaben aufgeführt; daraus wird keine neue Erbfolge abgeleitet.';
  if(!content.offices.length) content.sections.court='Namentlich ausgearbeitete Angehörige und eigene Amtsbesetzungen liegen bislang nicht vor.';
  const target=path.join(root,artwork.folder);
  await fs.mkdir(target,{recursive:true});
  await fs.writeFile(path.join(target,'haus.content.mjs'),'// Gemeinsame redaktionelle Quelle aus belegten öffentlichen Registerfakten.\n// Keine genealogischen Änderungen; Belege und Entscheidungen: source-manifest.json.\nexport const HOUSE_CONTENT = '+JSON.stringify(content,null,2)+';\n',{flag:'wx'});
  const canonicalFactBytes=Buffer.from(JSON.stringify(record));
  const manifest={
    houseId:record.id,kind:'canonical-register-preparation',date:'2026-11-03',
    canonicalRegistrySource:'Stammbäume/assets/js/data/families.registry.js',
    canonicalSources:[
      'Stammbäume/assets/js/data/families.registry.js',
      ...canonicalSourceFiles(record.id),
      `${diag}/lower-houses.json`
    ],
    canonicalSnapshot:{file:`${diag}/lower-houses.json`,recordId:record.id,recordJsonSha256:hash(canonicalFactBytes),sourceRevision:record.sourceRevision},
    genealogy:{existingFamilyId:record.id,graphChanged:false,suppliedTreeImported:false},
    militaryStatisticsIgnored:true,
    image:{file:'assets/hausdarstellung-2026-11-03.png',promptManifest:`${diag}/image-prompts.json`,metadata:'assets/image-generation.json',preserveExistingImages:true},
    decisions:[
      'Nur vorhandene öffentliche Registerfakten, Beschreibungen, Personen und deren belegte Aufgaben redigiert. Keine zusätzliche Familie oder Verwandtschaft angelegt.',
      'Datierte genealogische Gerüste sind keine Hauschronik: keine daraus abgeleiteten Gründungsjahre, Wanderungen, Amtsfolgen oder Oberhäupter.',
      'Nur reale Personen mit vorhandenem individuellem Portrait erhalten Angehörigenkarten. Namen und Portraitpfade stammen unverändert aus der bestehenden Akte.',
      'Sämtliche Militärstatistiken ausgelassen. Persönliche Bordaufgaben bleiben von Hausämtern und Hausrang getrennt.',
      ...(text.decision?[text.decision]:[])
    ]
  };
  await fs.writeFile(path.join(target,'source-manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
  const row={id:record.id,folder:artwork.folder,content:artwork.folder+'/haus.content.mjs',rankId:record.profile.rankId,biographySourceRevision:content.biographySourceRevision,biographyWords:Object.values(content.biographySummary).join(' ').split(/\s+/).length,personCards:content.offices.length,image:artwork.image};
  delivery.push(row);console.log(JSON.stringify(row));
}
await fs.writeFile(path.join(root,diag,'prepared-delivery.json'),JSON.stringify(delivery,null,2)+'\n',{flag:'wx'});
