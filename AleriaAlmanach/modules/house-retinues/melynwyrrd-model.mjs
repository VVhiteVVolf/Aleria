import { HOUSE_TEYRNGARCH_FAMILY as family } from '../../../Stammbäume/assets/js/data/house-teyrngarch-family.js';
import { ART, ICONS, p, copy, story, finishModule } from './retinue-pages.mjs';
import { melynwyrrdHierarchy } from './melynwyrrd-hierarchy.mjs';
const emblem = `${ART}/references/melynwyrrd-emblem.png`;
const houseCrest = `../Stammbäume/${family.document.emblem}`;
const portrait = id => `../Stammbäume/${family.persons.find(person => person.id === id).portrait}`;
const member = (id, detail) => ({ name: family.persons.find(person => person.id === id).name, image: portrait(id), imageFormat: 'portrait', detail });

export function buildMelynwyrrd(source) {
  const guild = { pageTitle: 'Das zweite Gesicht der Teyrngarch', guildPage: true, image: portrait('edlym-teyrngarch'), imageFit: 'contain',
    stats: [['Art', 'Diebesgilde · Bande'], ['Bindung', 'Haus Teyrngarch'], ['Hauptquartier', 'Zum Goldenen Kuss'], ['Region', 'Sonnenküste · Cenyr'], ['Anführer', 'Edlym Teyrngarch'], ['Stärke', 'Hoch · keine genaue Zahl überliefert']],
    guild: { crestImage: emblem, portraitFormat: 'portrait', sideWidth: 100, connectionPortraitHeight: 100,
      biographyTitle: 'Eine Gemeinschaft mit zwei Gesichtern',
      biographyText: p('Die Melynwyrrd sprechen gern von Ehre. Sie heben den Krug auf gegebene Worte, auf Mut und auf das Haus, dessen Farben sie tragen. In derselben Schenke kann ein Wirt erfahren, dass seine Ruhe künftig einen Preis hat. Diese beiden Stimmen gehören zur selben Gemeinschaft: zum Stolz ihrer Mitglieder und zur Erfahrung jener, die ihren Einfluss zu spüren bekommen.') +
        p('Unter Gelb und Grün finden Angehörige des Hauses, Knechte und Menschen von der Straße einen gemeinsamen Anspruch. Die Bande verspricht Zugehörigkeit und Aufstieg durch Bewährung. Zugleich bindet sie ihre Leute an den Wohlstand der Teyrngarch, dessen Schutz leicht zur Rechtfertigung jedes neuen Eingriffs werden kann.'),
      abilitiesTitle: 'Charakter, Anspruch & Widerspruch', abilities: [
        { title: 'Haustreue', detail: 'Der Wohlstand und das Ansehen der Teyrngarch bilden den gemeinsamen Bezugspunkt.', icon: houseCrest },
        { title: 'Ritterlicher Stolz', detail: 'Offene Herausforderung, Worttreue und Respekt gehören zu ihrem erklärten Selbstbild.', icon: ICONS.oath },
        { title: 'Gesellig', detail: 'Schenken, Gespräche und das gemeinsame Haus halten das Netz zusammen.', icon: ICONS.inn },
        { title: 'Ehrgeizig', detail: 'Die Bande verteidigt Einfluss und Gewinn auch mit Druck auf andere Betriebe.', icon: ICONS.office },
        { title: 'Vielschichtig', detail: 'Adlige, Gefolgsleute und ehemalige Straßenräuber bringen unterschiedliche Erwartungen mit.', icon: ICONS.diplomacy },
        { title: 'Widersprüchlich', detail: 'Der Schutz der Schwachen steht im Kodex; Erpressung und Sabotage stehen ebenfalls in ihrer Geschichte.', icon: ICONS.intelligence }
      ], historyTitle: 'Mit dem Haus gewachsen',
      historyText: p('Die frühere Straßenbande entstand, als die Teyrngarch noch um ihren Platz im Brauereigeschäft rangen. Mit jedem Gewinn wuchs die Möglichkeit, neue Anhänger zu binden. Als das Haus in den Adel aufstieg, verschwand diese Gefolgschaft nicht: Sie wurde zu einem dauerhaften, nach außen weniger sichtbaren Teil seines Einflusses.') +
        p('Der Konflikt mit der Klingenden Münze gab dem gemeinsamen Feindbild eine feste Gestalt. Wer den Aufstieg des Hauses bedrohte, konnte nun als Gegner der ganzen Gemeinschaft erscheinen. Aus Loyalität wurde eine Sprache, mit der sich sehr unterschiedliche Interessen unter demselben Zeichen sammeln ließen.'),
      worksTitle: 'Wo ihr Einfluss greift', works: ['Schutz und Durchsetzung von Teyrngarch-Interessen', 'Tavernen, Außenorte und Warenverbindungen', 'Beobachtung von Rivalen und wirtschaftlicher Druck', 'Gemeinschaft, Nachwuchs und eigener Ehrenkodex'],
      triviaTitle: 'Was Zugehörigkeit bedeutet', trivia: ['Nicht jedes Mitglied der Familie gehört der Bande an.', 'Der biertrinkende Recke ist ihr eigenes Zeichen; Hauswappen und Bandenzeichen bleiben unterscheidbar.', 'Der Goldene Kuss ist zugleich Taverne, Freudenhaus und Hauptquartier.', 'Die genaue Mitgliederzahl und ein Gründungsjahr sind nicht überliefert.'],
      connectionsTitle: 'Mitglieder aus dem Haus Teyrngarch', connections: [
        member('edlym-teyrngarch', 'Anführer der Bande. Bei ihm laufen die Interessen des Hauses und der Gefolgschaft zusammen.'),
        member('arfon-teyrngarch', 'Gehört zur Führungsriege und verbindet die Bande mit dem Haus Teyrngarch.'),
        member('olwen-teyrngarch', 'Angehörige des inneren Kreises; Familie und Bande treffen in dieser Gemeinschaft aufeinander.'),
        member('evrel-teyrngarch', 'Angehörige des inneren Kreises und der Teyrngarch-Familie.'),
        member('wendy-teyrngarch', 'Angehörige des inneren Kreises und der Teyrngarch-Familie.')
      ], contractsTitle: 'Bindungen und Gegenkräfte', contracts: [
        { title: 'Haus Teyrngarch', text: 'Trägerfamilie und Mittelpunkt der wirtschaftlichen Loyalität.', icon: houseCrest },
        { title: 'Klingende Münze', text: 'Kaufmannsgilde und überlieferte Gegnerin im Streit um das Brauereigeschäft.', icon: ICONS.diplomacy },
        { title: 'Der eigene Kodex', text: 'Verspricht Maß, Kameradschaft und Schutz Unbeteiligter – und liefert damit den Maßstab für die Widersprüche der Bande.', icon: ICONS.oath }
      ], documentsTitle: 'Das Familienbuch', documents: [{ title: 'Haus Teyrngarch', text: 'Stammbaum, Originalporträts und verwandtschaftliche Verbindungen.', icon: houseCrest, link: '../Stammbäume/Stammbaum.html?family=haus-teyrngarch&mode=view' }],
      footer: 'Der Krug im Zeichen feiert die Gemeinschaft. Über ihren Preis urteilen andere.' }
  };
  const site = (name, kind, index) => ({ name, kind, region: 'Sonnenküste · Königreich Cenyr', image: emblem, description: copy(source, index) });
  const network = { pageTitle: 'Ein Netz aus Schenken und Stützpunkten', organizationNetworkPage: true, commentSequence: [], organizationNetwork: {
    title: 'Die Wege des gelbgrünen Zeichens', introduction: copy(source, 63) + copy(source, 67) + copy(source, 71) + copy(source, 75),
    reach: 'Sonnenküste · Grenzverbindungen und Häfen', model: copy(source, 79) + copy(source, 81, 83),
    note: '„Zur Letzten Rast“ ist die nordöstliche Grenzschenke dieser Vorlage. Sie ist nicht mit „Celtigerns Letzte Rast“ in Gwynthor gleichzusetzen. Nutzung, Kontrolle und Eigentum eines Hauses sind unterschiedliche Beziehungen.',
    sites: [site('Zum Goldenen Kuss', 'headquarters', 65), site('Brynthpont', 'branch', 68), site('Garwlynn', 'branch', 69), site('Zur Letzten Rast', 'branch', 72), site('Zur Kühlen Furt', 'partner', 73), site('Traethwych', 'partner', 76), site('Morcarreg', 'branch', 77)],
    footer: 'Nicht jeder Ort trägt ein offenes Bandenzeichen; nicht jede genutzte Schenke gehört der Bande.'
  } };
  return finishModule({ id: 'melynwyrrd-bande', title: 'Melynwyrrd Bande', tab: 'Banden', emblem,
    subtitle: 'Gelb und Grün · Die Schattenseite der Teyrngarch · Sonnenküste', pages: [
      story('Gelb und Grün im Schatten der Ähre', 'melynwyrrd-goldener-kuss',
        p('Im Goldenen Kuss wird ein Krug auf den Tisch gestellt, bevor über Verpflichtungen gesprochen wird. Über der Bank hebt ein gepanzerter Recke im gelbgrünen Zeichen sein Bier. Das Bild ist fröhlicher als manche Abmachung, die darunter zustande kommt.') + copy(source, 4) + copy(source, 6, 12)),
      guild, ...melynwyrrdHierarchy(),
      story('Der ritterliche Anspruch', 'melynwyrrd-kodex', copy(source, 84, 100) +
        p('Der Kodex beschreibt, wie die Melynwyrrd gesehen werden möchten und woran sie einander messen. Er hebt ihre Taten nicht aus der gewöhnlichen Verantwortung heraus. Eine vorher ausgesprochene Drohung bleibt eine Drohung; ein höflich verlangtes Schutzgeld bleibt eine Belastung für denjenigen, der es zahlen soll.') +
        p('Gerade darin liegt die Spannung dieser Gemeinschaft. Ein Mitglied kann Kameradschaft ernst meinen und zugleich an einem Geschäft mitwirken, das anderen ihre Freiheit nimmt. Der erklärte Schutz der Schwachen stellt deshalb eine Frage an jede Forderung: Wer gilt im entscheidenden Augenblick noch als unbeteiligt, und wer wird kurzerhand zum Gegner erklärt?')),
      network,
      story('Gewinn, Druck und Gegenwehr', 'melynwyrrd-kassenbuch', copy(source, 13, 27) + copy(source, 101, 103) +
        p('Im Kassenbuch liegt kein Unterschied zwischen einer freundlich überreichten Münze und einer Zahlung aus Furcht. Im Gedächtnis des Zahlenden liegt er sehr wohl. Die Macht der Bande wächst nicht nur aus ihren Einnahmen, sondern auch aus der Erinnerung daran, wer Forderungen durchsetzen kann und wer sich ihnen beugen musste.') +
        p('Die Klingende Münze steht für einen Gegner, der ebenfalls über Geld, Beziehungen und Geduld verfügt. Dieser Streit endet nicht mit einer gelungenen Einschüchterung. Er prägt, wie die Bande Aufträge begründet, Verbündete bewertet und die Zukunft des Hauses wahrnimmt. Wer nur den nächsten Gewinn sieht, kann den länger währenden Preis für die Teyrngarch übersehen.')),
      story('Das Erscheinungsbild eines Melynwyrrd', 'melynwyrrd-dieb',
        p('Der gelbe Stoff fällt am Gürtel sofort ins Auge, das Grün des kurzen Mantels bindet ihn an das Haus und die Bande. Darunter liegt zweckmäßiges Leder statt eines vollständigen Harnischs. Ein Melynwyrrd muss sich zwischen Schankraum, Hof und Reise bewegen können; sein Auftreten darf selbstbewusst sein, ohne den ganzen Raum in ein Schlachtfeld zu verwandeln.') +
        p('Die Darstellung zeigt einen namenlosen, erwachsenen Angehörigen. Das schiefe Lächeln und die lockere Haltung erzählen von jemandem, der Gesellschaft gewohnt ist. Der gegürtete Stahl bleibt sichtbar, aber in der Scheide. Ein kleiner Beutel und das aufgenähte Bandenzeichen genügen, um Beruf, Zugehörigkeit und den Wunsch nach Anerkennung anzudeuten.') +
        p('Der biertrinkende Recke übernimmt die Rolle eines gemeinsamen Grußes. Er spricht von Kameradschaft, von den Brauereien hinter der Bande und von einer demonstrativen Ritterlichkeit. Der einzelne Träger muss diesen Anspruch erst mit seinem Verhalten füllen.') +
        p('Nicht jeder Angehörige trägt dieselbe Kleidung. Knechte, Raufbolde und adlige Verwandte bringen ihre Herkunft mit. Wiederkehrende Farben und das Zeichen schaffen Zusammenhang, ohne aus der Bande ein vollkommen gleichförmiges Heer zu machen.'),
        [['Farben', 'Gelb · Grün'], ['Zeichen', 'Biertrinkender Recke'], ['Figur', 'Namenloses erwachsenes Bandenmitglied']]),
      story('Familie, Zugehörigkeit und Grenzen', 'melynwyrrd-goldener-kuss', copy(source, 104, 108) +
        p('Edlym steht in der Überlieferung an der Spitze. Arfon, Olwen, Evrel und Wendy werden ebenfalls im Geflecht der Bande genannt. Die Rollenordnung der vorherigen Seiten bleibt bewusst davon getrennt: Sie erklärt, was eine Stelle leisten soll, und wird nicht durch jede erwähnte Verwandtschaft automatisch besetzt.') +
        p('Für einen neuen Streuner kann Zugehörigkeit eine Hoffnung sein: regelmäßiger Unterhalt, Kameraden und die Aussicht, ernst genommen zu werden. Für einen bereits einflussreichen Angehörigen kann dieselbe Gemeinschaft ein Mittel sein, den eigenen Anspruch zu vergrößern. Der Kodex soll diese ungleichen Ausgangspunkte an gemeinsame Regeln binden.') +
        p('Die Probe auf diesen Anspruch findet im Alltag statt. Sie zeigt sich daran, ob ein Lakei eine Beschwerde vorbringen darf, ob ein gebrochenes Wort auch einem Vorgesetzten vorgehalten wird und ob eine verweigerte Gefälligkeit sofort als Verrat gilt. Das Haus wird durch die Bande mächtiger. Ob es durch sie auch geachteter wird, bleibt eine andere Frage.'))
    ] });
}
