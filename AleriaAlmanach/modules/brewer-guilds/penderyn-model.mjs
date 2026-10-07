import { HOUSE_PENDERYN_FAMILY as family } from '../../../Stammbäume/assets/js/data/house-penderyn-family.js';
import { ASSETS, paragraph as p, sourceCopy as copy, familyPortrait, familyCrest, storyPage, cataloguePage, hierarchyPage, finishBreweryModule } from './brewery-pages.mjs';

const mark = `${ASSETS}/penderyn-brennzeichen.png`;
const portrait = id => familyPortrait(family, id);
const connection = (id, detail) => ({ name: family.persons.find(person => person.id === id).name, image: portrait(id), imageFormat: 'portrait', detail });

export function buildPenderyn(source) {
  const whiskies = [
    { id: 'whisky-penderyn', name: 'Penderyn Whiskey', subtitle: 'Das Aushängeschild des Hauses', servingCopper: 8,
      tags: ['Apfel & Birne', 'Schneebeere', 'Edler Rauch'], description: copy(source, 72, 76), badge: 'Hausabfüllung', occasions: ['Festtafel', 'Ruhiger Abend'] },
    { id: 'whisky-rhagorol', name: 'Rhagorol Whiskey', subtitle: 'Frucht, Säure & rauchiger Nachklang', servingCopper: 5,
      tags: ['Apfel', 'Stachelbeere', 'Rauch'], description: copy(source, 80, 84), badge: 'Hausabfüllung', occasions: ['Später Abend', 'Würzige Speisen'] }
  ];
  const guild = { pageTitle: 'Die Familie am Brennhaus', guildPage: true, image: portrait('talfryn-penderyn'), imageFit: 'contain',
    stats: [['Hauptsitz', 'Drakenburg · Vortigerns Ruh'], ['Produktion', 'Mathragon & Gwynthor'], ['Träger', 'Haus Penderyn'], ['Hausoberhaupt', 'Talfryn Penderyn'], ['Mitglieder', '100–200']],
    guild: { crestImage: familyCrest(family), portraitFormat: 'portrait', sideWidth: 100, connectionPortraitHeight: 100,
      biographyTitle: 'Aus einem Handwerk wurde ein Haus', biographyText: copy(source, 4) + p('Die Brauer- und Destillierzunft führt die Überlieferung der Penderyn-Destillerie fort. Ihr bekanntes Stammsortiment besteht aus Whisky; Biere der verbündeten Teyrngarch behalten ihre eigene Herkunft und werden nicht zu Penderyn-Eigenmarken erklärt.'),
      abilitiesTitle: 'Wofür die Penderyn stehen', abilities: [
        { title: 'Sorgfalt bis zur Abfüllung', detail: 'Zutatenwahl, Destillation und Fassreife werden als zusammengehörendes Handwerk überwacht.', icon: mark },
        { title: 'Der Familienname als Herkunft', detail: 'Penderyn bezeichnet die Familie und die historisch gewachsene Brenntradition. Der Comann Braich Alba führt sie als Beispiel eines geschützten Hausnamens.', icon: familyCrest(family) },
        { title: 'Bewachte Wege', detail: 'Die Drakenschluck Söldner schützen Brennhäuser, Reifekeller und Transporte.', icon: '../IconOrdner/Organisationsicons/Militär.png' }
      ],
      historyTitle: 'Islwyns Erbe', historyText: p('Islwyn Penderyn gründete die erste kleine Destillerie; Caoimhe Haeghra steht als Mitgründerin an seiner Seite in der Familienüberlieferung. Zwischen ihnen und den später datierten Generationen liegen nicht einzeln benannte Vorfahren.') + copy(source, 6, 9),
      worksTitle: 'Handwerk & Leistungen', works: ['Penderyn Whiskey und Rhagorol Whiskey', 'Destillation, Fassherstellung und Reifekeller', 'Handel innerhalb Cenyrs und darüber hinaus'],
      triviaTitle: 'Eine Familie mit weitem Netz', trivia: ['Talfryn steht dem Haus seit 1724 vor. Seine Mutter Mairwen entstammt dem Haus Teyrngarch.', 'Aneurin ist der erste Erbe des Hauses. Daraus folgt kein automatisch erworbener Meisterrang.'],
      connectionsTitle: 'Die heutige Familie', connections: [
        connection('talfryn-penderyn', 'Geboren 1670 · Ritterfürst und Hausoberhaupt seit 1724; Sohn Gareths und Mairwen Teyrngarchs.'),
        connection('osian-penderyn', 'Geboren 1675 · Talfryns Bruder; Vater Steffans und Gethins. Sein Porträt begleitet die Überlieferung der älteren Familie.'),
        connection('aneurin-penderyn', 'Geboren 1698 · Erster Erbe, Sohn Talfryns und Bethanias. Vater von Rhon, Revelyn, Dwnn und Jinell.')
      ],
      contractsTitle: 'Verbündete & Schutz', contracts: [
        { title: 'Teyrngarch Brauerzunft', text: 'Bier und Whisky ergänzen sich im Handel. Ehen und die Verlobung Dwnns mit Elinor Teyrngarch verbinden beide Häuser.', icon: `${ASSETS}/teyrngarch-brauzeichen.png` },
        { title: 'Drakenschluck Söldner', text: 'Hauseigene Schutzgilde mit eigenem militärischem Auftrag; kein handwerklicher Rang im Brennhaus.', icon: '../IconOrdner/Organisationsicons/Militär.png' }
      ],
      documentsTitle: 'Familienbuch & Häuser', documents: [{ title: "Haus Penderyn O’Mathragon", text: 'Stammbaum, Originalporträts und überlieferte Verbindungen.', icon: familyCrest(family), link: '../Stammbäume/Stammbaum.html?family=haus-penderyn&mode=view' }],
      footer: 'Familienname, Brennkunst und Geduld im Fass.'
    }
  };
  const role = (title, subtitle, text, image = mark) => ({ label: title, nodes: [{ title, subtitle, text, portrait: image }] });
  const hierarchy = hierarchyPage({ title: 'Penderyn Brauer- & Destillierzunft', family,
    description: p('Haus Penderyn trägt und beaufsichtigt die Zunft. Talfryn ist als Hausoberhaupt belegt; ein persönlicher Inhaber des Gildenführer- oder Destilleriemeisteramts ist nicht überliefert. Die folgenden Zuständigkeiten erläutern die genannten Handwerksränge, ohne Verwandten zusätzliche Ämter zuzuschreiben.'),
    levels: [
      role('Trägerschaft · Haus Penderyn', 'Talfryn Penderyn', 'Hausoberhaupt seit 1724; trägt die familiäre Verantwortung für Besitz und Fortbestand.', portrait('talfryn-penderyn')),
      role('Gildenführer', 'Amtsinhaber nicht benannt', 'Koordiniert die Zunft, ihre Standorte und die Abstimmung mit dem Haus.'),
      role('Destilleriemeister', 'Leitung der Brennkunst', 'Verantwortet fachlich den Brennbetrieb, die Ausbildung und die Güte des Destillats.'),
      role('Fassmeister', 'Fasswirtschaft & Reife', 'Wacht über Herstellung, Auswahl, Zustand und Belegung der Fässer.'),
      role('Fassbrenner', 'Ausführung am Fass', 'Bereitet die Fässer unter fachlicher Aufsicht vor und bearbeitet ihre Innenseiten mit Feuer.'),
      role('Fassknecht', 'Pflege, Transport & Hilfsarbeiten', 'Unterstützt die Fasswerkstatt und die Arbeit im Lager.')
    ], footer: 'Die fünf Zunftränge sind überliefert; ihre Zuständigkeiten sind hier ausgearbeitet. Die Drakenschluck Söldner stehen außerhalb dieser handwerklichen Rangfolge.'
  });
  const network = { pageTitle: 'Drakenburg, Mathragon & Gwynthor', organizationNetworkPage: true, organizationNetwork: {
    title: 'Drei Orte, ein Familienname', introduction: copy(source, 17), reach: 'Cenyr · Export über die Landesgrenzen hinaus',
    model: 'Verwaltung und Lager in der Drakenburg; Produktion in Mathragon und Gwynthor.',
    note: 'Weitere Standorte in allen Grafschaften sind ein Vorhaben des Hauses. Sie werden nicht als bereits eröffnete Niederlassungen geführt.',
    sites: [
      { name: 'Drakenburg', region: 'Vortigerns Ruh', kind: 'headquarters', image: familyCrest(family), description: 'Hauptsitz, Lagerhallen und Reifekeller neben den Drakenschluck Söldnern.' },
      { name: 'Mathragon', region: 'Königreich Cenyr', kind: 'workshop', image: mark, description: 'Historischer Ursprung der Destillerie und einer der beiden Produktionsstandorte.' },
      { name: 'Gwynthor', region: 'Königreich Cenyr', kind: 'workshop', image: mark, description: 'Zweiter Produktionsstandort; gemeinsam mit Mathragon trägt er den gegenwärtigen Bedarf.' }
    ], footer: 'Die geplante Expansion beginnt bei den bestehenden Brennhäusern.'
  } };
  return finishBreweryModule({ id: 'penderyn-brauer-destillierzunft', title: 'Die Penderyn Brauer- & Destillierzunft', subtitle: 'Die Penderyn-Destillerie · Familienname und Brennkunst', family,
    pages: [
      storyPage('Ein Brennhaus wird zum Familienerbe', 'penderyn-erbe', copy(source, 4) + copy(source, 6, 9)), guild, hierarchy,
      storyPage('Die Kunst zwischen Feuer und Fass', 'penderyn-handwerk', copy(source, 10, 13) + copy(source, 15)), network,
      cataloguePage('Das Stammsortiment · Zwei Whiskys', whiskies, { mark, origin: 'Penderyn · Mathragon & Gwynthor · Königreich Cenyr', kind: 'whisky', subtitle: 'Penderyn & Rhagorol · Fünf Plätze für künftige Abfüllungen' }),
      storyPage('Verbündete, Schutz & Familienbande', 'penderyn-buendnisse', copy(source, 13, 15) + p('Mairwen Teyrngarch war mit Gareth Penderyn verheiratet; ihr Sohn Talfryn führt heute das Haus. In der jüngeren Generation ist Dwnn Penderyn mit Elinor Teyrngarch verlobt. Die beiden Handwerke behalten dabei ihre eigenen Namen: Goldhaube bleibt ein Teyrngarch-Bier, Penderyn und Rhagorol bleiben Abfüllungen des Brennhauses.'))
    ]
  });
}
