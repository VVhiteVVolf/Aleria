import { HOUSE_SCHWARZDORN_FAMILY as family } from '../../../Stammbäume/assets/js/data/house-schwarzdorn-family.js';
import { HOUSE_FREIWINTER_FAMILY as freiwinter } from '../../../Stammbäume/assets/js/data/house-freiwinter-family.js';
import { buildDrinkPricing } from '../trade-catalog/drink-catalog-model.mjs';
import { ASSETS, paragraph as p, sourceCopy as copy, familyPortrait, familyCrest, storyPage, cataloguePage, hierarchyPage, finishBreweryModule } from './brewery-pages.mjs';

const mark = `${ASSETS}/schwarzdorn-brauzeichen.png`;
const portrait = id => familyPortrait(family, id);
const origin = 'Schwarzdorn Brauerei · Westen Aldrimars';
const connection = (id, detail) => ({ name: family.persons.find(person => person.id === id).name, image: portrait(id), imageFormat: 'portrait', detail });

export function buildSchwarzdorn(source) {
  const drinks = [
    { id: 'met-schwarzdorn', name: 'Schwarzdorn Met', kind: 'mead', subtitle: 'Preisgekrönter Met · West-Aldrimar', servingCopper: 7, badge: 'Spitzenabfüllung', tags: ['Honig', 'Waldbeeren', 'Geheime Kräuter'], description: copy(source, 71, 75), occasions: ['Ruhiger Abend', 'Festtafel'] },
    { id: 'met-stachelkrone', name: 'Stachelkrone', kind: 'mead', subtitle: 'Leichter Hausmet · Schwarzdorn', servingCopper: 2, tags: ['Leichter Honig', 'Mild', 'Langer Abend'], description: copy(source, 79, 81) },
    { id: 'bier-schwarzflut', name: 'Schwarzflut', subtitle: 'Dunkles Kräuterbier · Schwarzdorn', servingCopper: 1.5, tags: ['Röstmalz', 'Waldkräuter', 'Erdig'], description: copy(source, 91, 93), occasions: ['Regentag', 'Herzhafte Speisen'] },
    { id: 'bier-dornblut', name: 'Dornblut', subtitle: 'Einfaches, herbes Hausbier · Schwarzdorn', servingCopper: 0.5, tags: ['Rotbraun', 'Herb', 'Bodenständig'], description: copy(source, 97, 99), occasions: ['Feierabend', 'Taverne'] }
  ];
  const partners = [{ id: 'bier-frostkamm', name: 'Frostkamm', subtitle: 'Helles Clanbier · Freiwinter', servingCopper: 4, badge: 'Partnerprodukt', tags: ['Schneebeere', 'Helles Malz', 'Kühler Nachklang'], description: copy(source, 85, 87),
    origin: 'Clan Freiwinter · Vertrieb durch die Schwarzdorn Brauerei', conditions: 'Eigenmarke des Clans Freiwinter nach dessen altem Rezept; Schwarzdorn übernimmt den Vertrieb. Die Clanherkunft bleibt erhalten.' }];
  const guild = { pageTitle: 'Maven und die Familie hinter der Brauerei', guildPage: true, image: portrait('maven-schwarzdorn'), imageFit: 'contain',
    quote: family.document.motto,
    stats: [['Sitz des Clans', 'Rorikshall · Roriksheim'], ['Brauereileitung', 'Maven Schwarzdorn'], ['Clanoberhaupt', 'Tormund Schwarzdorn'], ['Mitgliederstärke', 'Hoch'], ['Marktgebiet', 'Westen Aldrimars']],
    guild: { crestImage: familyCrest(family), portraitFormat: 'portrait', sideWidth: 100, connectionPortraitHeight: 100,
      biographyTitle: 'Brauerei, Clan und wirtschaftliche Macht', biographyText: copy(source, 4) + p('Maven führt die Brauerei. Die heutige Clanführung liegt bei Tormund Schwarzdorn, Hesir seit 1721. Wirtschaftliche Leitung und Clanoberhaupt sind getrennte Rollen; die Formulierung der Goldenglanz-Überlieferung über Mavens Aufstieg an die Clanspitze wird vor diesem Hintergrund gelesen.'),
      abilitiesTitle: 'Die Handschrift der Schwarzdorn', abilities: [
        { title: 'Die gesamte Versorgungskette', detail: 'Gerstenhöfe, Imkereien, Brauhäuser, Lager und Tavernen bilden ein gemeinsames Wirtschaftsnetz.', icon: mark },
        { title: 'Met als Aushängeschild', detail: 'Schwarzdorn Met und Stachelkrone stehen neben den Hausbieren Schwarzflut und Dornblut.', icon: `${ASSETS}/met-schwarzdorn.png` },
        { title: 'Verdeckter Einfluss', detail: 'Die Nachtfalter stützen die Interessen des Hauses außerhalb der handwerklichen Rangordnung.', icon: '../IconOrdner/Organisationsicons/Spionage.png' }
      ],
      historyTitle: 'Geirmundrs Erbe', historyText: p('Geirmundr gilt als Gründer der Brauerei und des Clans. Die ursprüngliche Zusammenarbeit mit den Kampfgeborenen wurde durch Übernahmen und Verdrängung zur dauerhaften Feindschaft.'),
      worksTitle: 'Handwerk und Leistungen', works: ['Bier- und Metherstellung, Handel und Tavernenbetrieb', 'Gerstenbau, Imkerei und Wildfruchtversorgung', 'Fassmacherei, Alchemie, Schriftführung und Logistik'],
      triviaTitle: 'Herkunft bleibt erkennbar', trivia: ['Frostkamm bleibt ein Freiwinter-Bier im Schwarzdorn-Vertrieb.', 'Die Vorlage nennt keine Patrongötter oder persönlichen Inhaber der handwerklichen Ämter.'],
      connectionsTitle: 'Personen der Brauerei', connections: [
        connection('maven-schwarzdorn', 'Geboren 1693 · Leiterin der Schwarzdorn-Brauerei und Gildenoberhaupt laut Vorlage.'),
        connection('modolf-schwarzdorn', 'Geboren 1697 · Mitglied des Brauereivorstands.'),
        connection('thrand-schwarzdorn', 'Geboren 1695 · Mitglied des überlieferten Vorstands.'),
        { name: 'Fridthjof Freiwinter', image: familyPortrait(freiwinter, 'fridthjof-freiwinter'), imageFormat: 'portrait', detail: 'Hesir der Freiwinter seit 1701 · In der Brauereivorlage als Fridthjolf und als Vorstandsmitglied geführt.' }
      ],
      contractsTitle: 'Partner und Rivalen', contracts: [
        { title: 'Freiwinter', text: 'Teilhaber, westlicher Verbündeter und Herkunft des Frostkamm-Biers.', icon: familyCrest(freiwinter) },
        { title: 'Skogg und Feuerhaar', text: 'Agrargüter, Honig und Wildfrüchte; Pachten und familiäre Verbindungen.', icon: mark },
        { title: 'Nachtfalter', text: 'Verbündete Diebesbande; keine Stufe der Brauerausbildung.', icon: '../IconOrdner/Organisationsicons/Spionage.png' }
      ],
      documentsTitle: 'Familienbücher', documents: [{ title: 'Clan Schwarzdorn', text: 'Familienrollen, Originalporträts und Verbindungen.', icon: familyCrest(family), link: '../Stammbäume/Stammbaum.html?family=haus-schwarzdorn&mode=view' }],
      footer: family.document.motto
    }
  };
  const officer = (name, image, text) => ({ title: name, subtitle: 'Vorstandsmitglied', portrait: image, text });
  const hierarchy = hierarchyPage({ title: 'Schwarzdorn Brauerei', family, motto: family.document.motto,
    description: p('Die Vorlage benennt Maven als Gildenoberhaupt und vier Personen im Vorstand. Die unteren Handwerksränge sind überliefert, ihre Amtsinhaber jedoch offen. Gwelda wird in der Vorlage „Gwelda Schwarzdorn“ genannt; der Stammbaum führt eine Gwelda ohne gesicherten Herkunftsnamen oder eigenes Porträt.'),
    levels: [
      { label: 'Gildenoberhaupt', nodes: [{ title: 'Gildenoberhaupt', subtitle: 'Maven Schwarzdorn', portrait: portrait('maven-schwarzdorn'), text: 'Führt die Brauerei und ihre wirtschaftlichen Interessen.' }] },
      { label: 'Vorstand', nodes: [officer('Gwelda · Herkunft offen', mark, 'Als Gwelda Schwarzdorn in der Brauereivorlage genannt; die genaue Familienzuordnung ist nicht gesichert.'), officer('Modolf Schwarzdorn', portrait('modolf-schwarzdorn'), 'Überliefertes Vorstandsmitglied.'), officer('Thrand Schwarzdorn', portrait('thrand-schwarzdorn'), 'Überliefertes Vorstandsmitglied.'), officer('Fridthjof Freiwinter', familyPortrait(freiwinter, 'fridthjof-freiwinter'), 'Vertreter des beteiligten Clans Freiwinter; die Vorlage schreibt Fridthjolf.')] },
      ...['Brauermeister', 'Brauer Knecht', 'Brauer Geselle', 'Brauer Lehrling', 'Handlanger'].map(title => ({ label: title, nodes: [{ title, subtitle: 'Amtsinhaber nicht benannt', portrait: mark, text: 'Überlieferter Handwerksrang der Schwarzdorn Brauerei.' }] }))
    ], footer: 'Clanführung, Brauereivorstand und Handwerksausbildung besitzen eigene Verantwortlichkeiten.'
  });
  const network = { pageTitle: 'Höfe, Imkereien und Tavernen im Westen', organizationNetworkPage: true, organizationNetwork: {
    title: 'Vom Pachtland bis zum Schanktisch', introduction: copy(source, 16, 19), reach: 'Westen Aldrimars · Schwerpunkt Roriksheim',
    model: 'Pachtbetriebe liefern Rohstoffe, zentrale Brauereien verarbeiten sie und Tavernen verteilen die Getränke.',
    note: 'Die fünf benannten Pachtstandorte stehen in der Vorlage unter Rorikheim; die heutige regionale Schreibweise lautet Roriksheim. Genaue Betriebsgrößen werden nicht genannt. Export über Grindel ist bisher begrenzt und soll ausgebaut werden.',
    sites: ['Schwarzhof', 'Maltvik', 'Svartstedt', 'Rosenheim', 'Dornenfeld'].map(name => ({ name, region: 'Roriksheim · Aldrimar', kind: 'workshop', image: mark, description: 'Benannter Standort auf gepachtetem Land im westlichen Versorgungsnetz.' })),
    footer: 'In Kronental sind beide Brauereien auf jeweils einen Standort in Heldenwacht beschränkt; weitere Niederlassungen sind dort untersagt.'
  } };
  return finishBreweryModule({ id: 'schwarzdorn-brauerei', title: 'Die Schwarzdorn Brauerei', subtitle: 'Maven Schwarzdorn · Met, Markt und Macht im Westen', family,
    pages: [
      storyPage('Geirmundrs Anfang und der Bruch mit den Kampfgeborenen', 'schwarzdorn-aufstieg', copy(source, 4) + copy(source, 6, 9)), guild, hierarchy,
      storyPage('Die Macht über Ernte, Fass und Ausschank', 'schwarzdorn-handwerk', copy(source, 10, 15)), network,
      cataloguePage('Das Stammsortiment · Met und Hausbiere', drinks, { mark, origin, priceBuilder: buildDrinkPricing, categories: [{ id: 'mead', label: 'Met · Getränke' }, { id: 'beer', label: 'Bier · Getränke' }], subtitle: 'Schwarzdorn Met, Stachelkrone, Schwarzflut und Dornblut · Fünf freie Plätze' }),
      cataloguePage('Partnerbrauereien · Frostkamm der Freiwinter', partners, { mark, origin, partner: true, priceBuilder: buildDrinkPricing, subtitle: 'Eigenständige Clanherkunft im Schwarzdorn-Vertrieb' }),
      storyPage('Westliche Bündnisse und der Brauerkrieg', 'schwarzdorn-buendnisse', copy(source, 122, 127) + copy(source, 128, 131))
    ]
  });
}
