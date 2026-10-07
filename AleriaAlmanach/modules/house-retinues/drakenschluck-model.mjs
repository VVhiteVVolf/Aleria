import { ART, ICONS, p, copy, story, finishModule } from './retinue-pages.mjs';
import { drakenschluckHierarchy } from './drakenschluck-hierarchy.mjs';
const emblem = `${ART}/references/drakenschluck-emblem.png`;
const penderyn = './public/assets/brewer-guilds/penderyn-brennzeichen.png';
const teyrngarch = './public/assets/brewer-guilds/teyrngarch-brauzeichen.png';

export function buildDrakenschluck(source) {
  const guild = { pageTitle: 'Eine Gilde für die langen Wachen', guildPage: true,
    image: `${ART}/references/drakenschluck-warrior.png`, imageFit: 'contain',
    stats: [['Art', 'Söldnergilde'], ['Träger', 'Haus Penderyn'], ['Hauptsitz', 'Drakenburg · Vortigerns Ruh'], ['Mitglieder', '100–200'], ['Ruf', 'Professionell · respektiert'], ['Leitung', 'Drakenführer · Personenbesetzung offen']],
    guild: { crestImage: emblem, portraitFormat: 'portrait', sideWidth: 100, connectionPortraitHeight: 100,
      biographyTitle: 'Der Wert eines unspektakulären Tages',
      biographyText: p('Wenn am Abend jedes Fass noch versiegelt, jeder Wagen angekommen und jeder Gast unversehrt ist, haben die Drakenschluck ihre Arbeit getan. Man schreibt selten Lieder über eine gelungene Ablösung. Die Penderyn wissen dennoch, was sie wert ist: In ihren Kellern lagern Jahre des Handwerks, und auf ihren Wegen reist das Einkommen des Hauses.') + p('Die Gilde besitzt den nüchternen Stolz einer Gemeinschaft, die das Gewöhnliche ernst nimmt. Ihre Leute lassen sich lange an einen Ort binden und lernen dessen Rhythmus kennen. Wer vor derselben Tür viele Nächte steht, soll nicht nachlässig werden, sondern den Unterschied zwischen vertrautem Alltag und einer wirklichen Unregelmäßigkeit erkennen.'),
      abilitiesTitle: 'Die Persönlichkeit der Gilde', abilities: [
        { title: 'Standhaft', detail: 'Die zugesagte Wache bleibt besetzt, auch wenn Ruhm und Abwechslung anderswo locken.', icon: emblem },
        { title: 'Berufsstolz', detail: 'Guter Schutz zeigt sich am verlässlichen Alltag des bewachten Betriebs.', icon: ICONS.command },
        { title: 'Verbindlich', detail: 'Dauer, Auftrag und Verantwortung werden vor der Anstellung geklärt.', icon: ICONS.diplomacy },
        { title: 'Betriebskundig', detail: 'Brennhaus, Reifekeller und Karawane haben unterschiedliche Bedürfnisse.', icon: penderyn },
        { title: 'Hausgebunden', detail: 'Die Interessen der Penderyn bleiben der Ausgangspunkt ihrer Verpflichtungen.', icon: ICONS.oath },
        { title: 'Pragmatisch', detail: 'Sie übernehmen gerade jene langen, alltäglichen Dienste, die anderen zu unscheinbar erscheinen.', icon: ICONS.office }
      ],
      historyTitle: 'Aus Knechtsdienst wurde ein Beruf',
      historyText: p('Am Anfang standen Ritter und Knechte der Familie vor Fässern und Lagerhäusern. Aus dem Unwillen über diese vermeintlich geringen Aufgaben entstand ein eigenständiger Verband, für den die dauerhafte Bewachung zum Handwerk wurde. Die Drakenschluck machten aus dem vernachlässigten Dienst ihren besonderen Wert.') + p('Mit dem Ruf der Penderyn wuchs auch der Bedarf an ihrer Schutzgilde. Fremde Betriebe kamen hinzu, ohne die ursprüngliche Hausbindung aufzulösen. So wurde aus einer Antwort auf ein Problem der Destillerie ein eigener Zweig des Familiengeschäfts.'),
      worksTitle: 'Ihr tägliches Werk', works: ['Wache an Brauerei und Destillerie', 'Begleitung von Handelskarawanen', 'Bewachung von Lagerhäusern und Produktionsstätten', 'Schutz und Begleitung wichtiger Persönlichkeiten'],
      triviaTitle: 'Gewohnheiten der Gemeinschaft', trivia: ['Eine lange Anstellung gilt nicht als verlorene Zeit, sondern als Ausdruck von Vertrauen.', 'Der berittene Drakensöldner auf dem Zeichen steht für die ganze Gilde; daraus folgt keine ausschließlich berittene Mannschaft.', 'Rang, Fachamt und Auftrag werden getrennt geführt.'],
      connectionsTitle: 'Häuser und Auftraggeber', connections: [
        { name: 'Haus Penderyn', image: penderyn, detail: 'Gründerfamilie, Trägerin und erster Auftraggeber der Schutzgilde.' },
        { name: 'Penderyn Destillerie', image: penderyn, detail: 'Mit der Gilde in der Drakenburg verbunden; Brennorte, Lager und Transporte bilden den Kern des Schutzauftrags.' },
        { name: 'Teyrngarch Brauerzunft', image: teyrngarch, detail: 'Verbündeter Handwerksverband; einige seiner Etablissements werden ebenfalls bewacht.' }
      ], contractsTitle: 'Was eine Zusage trägt', contracts: [
        { title: 'Der Auftrag braucht Grenzen', text: 'Ein Schutzvertrag bestimmt eine Aufgabe. Er macht die Mannschaft nicht zum beliebig einsetzbaren Privatheer.', icon: ICONS.diplomacy },
        { title: 'Die Wache braucht Ablösung', text: 'Sold, Versorgung, Ruhe und Ersatz gehören zur Verpflichtung der Führung.', icon: ICONS.office }
      ], documentsTitle: 'Verwandte Überlieferung', documents: [
        { title: 'Haus Penderyn', text: 'Familienbuch und Wappen der Trägerfamilie.', icon: penderyn, link: '../Stammbäume/Stammbaum.html?family=haus-penderyn&mode=view' }
      ], footer: 'Eine Tür, die geschlossen bleibt. Ein Wagen, der ankommt. Ein Wort, das gilt.' }
  };
  const network = { pageTitle: 'Drakenburg und die bewachten Betriebe', organizationNetworkPage: true, commentSequence: [], organizationNetwork: {
    title: 'Ein Hauptsitz, viele anvertraute Türen', introduction: copy(source, 15, 18),
    reach: 'Königreich Cenyr · Schwerpunkt bei Penderyn und verbundenen Betrieben',
    model: 'Die Drakenburg führt und versorgt die Gilde. Wachmannschaften werden an die jeweiligen Aufträge gebunden; sie sind nicht automatisch eigenständige Niederlassungen.',
    note: 'Außer Drakenburg und Mathragon sind keine weiteren großen Söldnerstützpunkte überliefert. Die Präsenz an einem Brennhaus bezeichnet einen Schutzdienst.',
    sites: [
      { name: 'Drakenburg', region: 'Vortigerns Ruh', kind: 'headquarters', image: emblem, description: p('Sitz der Gildenführung und gemeinsamer Hauptort mit der Penderyn-Destillerie. Hier treffen Vertragsfragen, Ausbildung, Vorräte und Berichte aus den Diensten zusammen.') },
      { name: 'Mathragon', region: 'Königreich Cenyr', kind: 'branch', image: emblem, description: p('Neben der Drakenburg der ausdrücklich genannte größere Standort. Die Nähe zum Ursprung der Penderyn verbindet die Wache mit dem gewachsenen Familienbetrieb.') },
      { name: 'Penderyn-Brennhäuser', region: 'Unter anderem Gwynthor', kind: 'partner', image: penderyn, description: p('Eingesetzte Wachmannschaften schützen die jeweiligen Produktions- und Lagerorte. Der Umfang richtet sich nach dem örtlichen Auftrag.') },
      { name: 'Anvertraute Teyrngarch-Etablissements', region: 'Verbindung nach Aberon und Sonnenküste', kind: 'partner', image: teyrngarch, description: p('Die Zusammenarbeit mit dem Haus Teyrngarch erweitert das Wirkungsfeld der Gilde. Einzelne bewachte Betriebe sind in dieser Überlieferung nicht namentlich aufgezählt.') }
    ], footer: 'Eine Präsenz vor Ort ist ein Dienstauftrag – Größe und Dauer hängen vom Bedarf ab.'
  } };
  return finishModule({ id: 'drakenschluck-soeldner', title: 'Drakenschluck Söldner', tab: 'Söldner', emblem,
    subtitle: 'Die Schutzgilde der Penderyn · Drakenburg · Cenyr', pages: [
      story('Die Wache vor dem Reifekeller', 'drakenschluck-torwache',
        p('Noch bevor im Brennhaus das erste Feuer geschürt wird, übernimmt am Tor eine neue Wache. Der Schild lehnt nicht mehr an der Bank; er sitzt am Arm. Hinter den verschlossenen Türen ruhen Fässer, deren Wert nicht in einer Nacht entstanden ist. Gerade deshalb darf eine einzige nachlässige Nacht nicht über sie entscheiden.') + copy(source, 4) + copy(source, 6) + p('Der Ursprung dieser Gilde liegt in einer unscheinbaren Frage: Wer ist bereit, jeden Tag dort zu stehen, wo andere nur im Augenblick der Gefahr erscheinen möchten? Die Drakenschluck geben ihre Antwort mit Anwesenheit. Ihr Ruf wächst aus wiederholter Arbeit, nicht aus der Behauptung, über ihr zu stehen.')),
      guild, ...drakenschluckHierarchy(),
      story('Auftrag, Ablösung und Verantwortung', 'drakenschluck-geleit', copy(source, 8, 14) +
        p('Am Anfang eines Dienstes steht eine verständliche Zusage: Was wird geschützt, für wen und wie lange? Der Hauptmann führt die Mannschaft; der Betrieb nennt seine Anforderungen. Wo beides auseinanderläuft, muss gesprochen werden. Eine stillschweigend vergrößerte Pflicht ist kein zusätzlicher Vertrag.') +
        p('Der einzelne Posten braucht keine Kenntnis jeder Familienverhandlung. Er braucht einen eindeutigen Auftrag, eine erreichbare Führung und die Gewissheit, dass seine Ablösung kommt. Umgekehrt schuldet er eine verlässliche Meldung. Wer Müdigkeit, beschädigtes Zeug oder eine versäumte Übergabe verschweigt, lässt den nächsten Kameraden mit einer Verantwortung zurück, die dieser nicht überblicken kann.')),
      network,
      story('Sold, Vorräte und Kameradschaft', 'drakenschluck-wachstube',
        p('In der Wachstube zeigt sich, ob die Gilde ihre eigenen Versprechen ernst nimmt. Ein leerer Vorratsschrank, ausbleibender Sold und ständig vertagte Ruhezeiten lassen sich nicht dauerhaft mit einem guten Wappen überdecken. Darum stehen Zahlmeister, Quartier und Werkstatt im selben Geflecht wie Hauptleute und Posten.') +
        p('Der Zeugmeister verantwortet ein brauchbares Schild, der Quartiermeister eine tragfähige Versorgung, der Lehrmeister eine Ausbildung, die über Härteproben hinausgeht. Keine dieser Aufgaben zieht für sich die ganze Gilde hinter sich her. Zusammengenommen entscheiden sie aber darüber, ob ein Auftrag nach Wochen noch ebenso gewissenhaft erfüllt wird wie am ersten Tag.') +
        p('Kameradschaft entsteht hier aus den kleinen Rücksichten: einer vollständigen Übergabe, einem rechtzeitig gemeldeten Ausfall, einem Teller für die verspätete Ablösung. Der erfahrene Drakensöldner erkennt im Drachling keinen bequemen Ersatz für alle ungeliebten Dienste. Er erkennt jemanden, dessen Verlässlichkeit später auch seine eigene Sicherheit tragen wird.') +
        p('Die Gilde zählt hundert bis zweihundert Mitglieder. Ihre Fachämter müssen deshalb sinnvoll zusammenarbeiten und können an kleinen Orten in einer Hand liegen. Die Namen der Aufgaben bleiben dennoch wichtig: Sie zeigen, wer antworten muss, wenn etwas fehlt.')),
      story('Wappenrock, Schild und geschlossener Helm', 'references/drakenschluck-warrior',
        p('Rot und helles Elfenbein teilen den Wappenrock. Darüber liegt das dunkle Bild eines berittenen Drakensöldners; auf dem Schild kehrt es wieder. Das Zeichen bindet den einzelnen Wachmann an eine erkennbare Gemeinschaft. Wer an einem fremden Tor dieselben Farben sieht, soll den gleichen verlässlichen Dienst erwarten dürfen.') +
        p('Die überlieferte Darstellung zeigt einen vollständig geschlossenen Helm, kräftiges Schutzzeug, Schwert und Schild. Sie steht für einen Angehörigen der Gilde, nicht für einen benannten Helden. Der Reiter im Wappen ist ebenfalls ein Zeichen der Gemeinschaft und keine Aussage darüber, dass jeder Posten zu Pferd dient.') +
        p('Für die Ausbildung zählt, dass das Zeug beherrscht und gepflegt wird. Glanz ersetzt weder Übung noch eine saubere Übergabe. Der geschlossene Helm nimmt der Figur ihr persönliches Gesicht; Haltung, Farben und Auftreten erzählen stattdessen, welcher Verpflichtung sie folgt.'),
        [['Farben', 'Rot · Elfenbein · dunkles Wappenbild'], ['Zeichen', 'Berittener Drakensöldner'], ['Darstellung', 'Unbenanntes Gildenmitglied']]),
      story('Hausinteressen und fremde Auftraggeber', 'drakenschluck-geleit',
        p('Die Drakenschluck sind dem Haus Penderyn eng verbunden. Das schafft Halt und begrenzt zugleich ihre Unabhängigkeit. Wer sie anwirbt, erhält eine erfahrene Schutzgilde, deren Ursprung und wichtigste Bindung offen erkennbar bleiben. Die Führung muss deshalb neue Dienste gegen bestehende Pflichten abwägen.') +
        p('Die Zusammenarbeit mit den Teyrngarch zeigt, wie aus dem Schutz einer Destillerie ein größerer Kreis von Auftraggebern erwächst. Brauer und Brenner erkennen ähnliche Bedürfnisse: bewachte Vorräte, ungestörte Arbeit und Transporte, die ihr Ziel erreichen. Daraus entsteht ein Geschäft, das mit dem Handwerk seiner Kunden vertraut ist.') +
        p('Zur Überlieferung gehört auch die Einschüchterung von Konkurrenten. Zwischen dem Schutz eines Brennhauses und der Durchsetzung wirtschaftlicher Interessen liegt eine Grenze, über die innerhalb der Gilde Rechenschaft abgelegt werden muss. Ihr professioneller Ruf beseitigt diesen Konflikt nicht. Er macht die Frage umso schärfer, wessen Zusage gerade geschützt wird.') +
        p('Windreiter und Blutbund dienen als Vergleich für andere Formen des Söldnerwesens. Die Drakenschluck suchen ihren Platz nicht in deren Größe, sondern in der dauerhaften Bindung an einen überschaubaren Auftrag. Sie bleiben dort, wo nach dem Abzug einer großen Kompanie noch immer jemand das Tor bewachen muss.'))
    ] });
}
