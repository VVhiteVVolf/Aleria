import { HOUSE_GOLDGLANZ_FAMILY as family } from '../../../Stammbäume/assets/js/data/house-goldglanz-family.js';
import { HOUSE_SCHATTENHERZ_FAMILY as schattenherz } from '../../../Stammbäume/assets/js/data/house-schattenherz-family.js';
import { buildDrinkPricing } from '../trade-catalog/drink-catalog-model.mjs';
import { ASSETS, paragraph as p, sourceCopy as copy, familyPortrait, familyCrest, storyPage, cataloguePage, hierarchyPage, finishBreweryModule } from './brewery-pages.mjs';

const mark = `${ASSETS}/goldenglanz-brauzeichen.png`;
const portrait = id => familyPortrait(family, id);
const origin = 'Goldenglanz Brauerei · Osten Aldrimars';
const connection = (id, detail) => ({ name: family.persons.find(person => person.id === id).name, image: portrait(id), imageFormat: 'portrait', detail });

export function buildGoldenglanz(source) {
  const drinks = [
    { id: 'met-honigbreu', name: 'Honigbreu Met', kind: 'mead', subtitle: 'Preisgekrönter Met · Ost-Aldrimar', servingCopper: 6, imageFormat: 'square', badge: 'Spitzenabfüllung', tags: ['Honig', 'Sommerkräuter', 'Vanille'], description: copy(source, 65, 69), occasions: ['Hochzeit', 'Festtafel', 'Friedensschluss'] },
    { id: 'met-lichtgold', name: 'Honigbreu · Lichtgold', kind: 'mead', subtitle: 'Leichter Hausmet · Goldenglanz', servingCopper: 3, tags: ['Frisch', 'Apfelartige Säure', 'Goldgelb'], description: copy(source, 73, 75), occasions: ['Sommer', 'Höfische Spiele'] },
    { id: 'bier-kranzgold', name: 'Kranzgold', subtitle: 'Helles Festbier · Goldenglanz', servingCopper: 2.5, tags: ['Feinperlig', 'Mildes Malz', 'Florale Note'], description: copy(source, 85, 87), occasions: ['Hochzeit', 'Ehrung'] },
    { id: 'bier-stillgold', name: 'Stillgold', subtitle: 'Einfaches helles Hausbier · Goldenglanz', servingCopper: 0.5, tags: ['Mild', 'Leicht', 'Durstlöscher'], description: copy(source, 91, 93), occasions: ['Feierabend', 'Taverne'] }
  ];
  const partners = [{ id: 'bier-hjerte', name: 'Hjerte', subtitle: 'Dunkles Clanbier · Schattenherz', servingCopper: 3.5, badge: 'Partnerprodukt', tags: ['Dunkles Malz', 'Rötlicher Schimmer', 'Schwerer Nachklang'], description: copy(source, 79, 81),
    origin: 'Clan Schattenherz · Sortiment der Goldenglanz Brauerei', conditions: 'Eigenmarke des Clans Schattenherz; Teil des gemeinsamen Handelsnetzes. Der seltene offene Ausschank und die eigene Clanherkunft bleiben erhalten.' }];
  const guild = { pageTitle: 'Die Goldglanz und ihr gemeinsamer Vorstand', guildPage: true, image: portrait('wulfgar-1668-goldglanz'), imageFit: 'contain',
    stats: [['Clansitz', 'Silberquell · Schimmerküste'], ['Gildenoberhaupt', 'Wulfgar Goldglanz'], ['Verbündeter Clan', 'Schattenherz'], ['Mitgliederstärke', 'Hoch'], ['Marktgebiet', 'Osten Aldrimars']],
    guild: { crestImage: familyCrest(family), portraitFormat: 'portrait', sideWidth: 100, connectionPortraitHeight: 100,
      biographyTitle: 'Goldglanz ist die Familie, Goldenglanz die Brauerei', biographyText: copy(source, 4) + p('Der Clan trägt den Namen Goldglanz; die Brauereivorlage führt das Unternehmen als Goldenglanz. Die ausführliche Hierarchie nennt Wulfgar als Gildenoberhaupt, auch wenn die Kurzangabe zur Leitung offen bleibt. Gemeint ist der heute lebende Wulfgar, geboren 1668, nicht sein gleichnamiger Vorfahr.'),
      abilitiesTitle: 'Die Handschrift der Goldenglanz', abilities: [
        { title: 'Honigbreu als Aushängeschild', detail: 'Der goldene Met und sein leichteres Lichtgold tragen den Ruf des Hauses.', icon: `${ASSETS}/met-honigbreu.png` },
        { title: 'Östliches Vertriebsnetz', detail: 'Brauersiedlungen, Flusswege, Stadtlager und Tavernen verbinden Produktion und Absatz.', icon: mark },
        { title: 'Gemeinsame Interessen', detail: 'Schattenherz stellt Standorte und Vorstandspersonen; das Syndikat führt den verdeckten Wettbewerb.', icon: familyCrest(schattenherz) }
      ],
      historyTitle: 'Aufstieg durch Handel und Braukunst', historyText: p('Die Überlieferung verbindet den Aufstieg der Brauerei mit König Galmars Förderung einheimischer Zünfte. Das politische Vakuum und die Schwäche der westlichen Konkurrenz öffneten dem Clan neue Märkte.'),
      worksTitle: 'Handwerk und Leistungen', works: ['Bier- und Metherstellung, Handel und Tavernenbetrieb', 'Vertrieb von Wein und Spirituosen ohne bislang benannte Einzelabfüllungen', 'Fassmacherei, Imkerei, Lagerhaltung und Schriftführung'],
      triviaTitle: 'Zwei Namen und eine Herkunft', trivia: ['Hjerte bleibt das dunkle Bier der Schattenherzen.', 'Ein Brauereimotto, Patrongötter und die persönlichen Handwerksmeister sind in der Vorlage offen.'],
      connectionsTitle: 'Personen des Vorstands', connections: [
        connection('wulfgar-1668-goldglanz', 'Geboren 1668 · Gildenoberhaupt laut ausführlicher Brauereihierarchie.'),
        connection('nvjar-goldglanz', 'Geboren 1677 · Benanntes Vorstandsmitglied.'),
        connection('tyrkir-goldglanz', 'Geboren 1688 · Mitglied des Brauereivorstands.'),
        connection('urdin-goldglanz', 'Geboren 1696 · Benanntes Vorstandsmitglied.'),
        { name: 'Ulfrik Schattenherz', image: familyPortrait(schattenherz, 'ulfrik-schattenherz'), imageFormat: 'portrait', detail: 'Thane der Schattenherzen seit 1711 · Mitglied des gemeinsamen Brauereivorstands.' },
        { name: 'Isbrand Schattenherz', image: familyPortrait(schattenherz, 'isbrand-schattenherz'), imageFormat: 'portrait', detail: 'Erster Erbe der Schattenherzen · Mitglied des gemeinsamen Brauereivorstands.' }
      ],
      contractsTitle: 'Bündnis und verdeckter Wettbewerb', contracts: [
        { title: 'Clan Schattenherz', text: 'Standorte, Land und exklusive Handelsverträge verbinden die beiden Clans.', icon: familyCrest(schattenherz) },
        { title: 'Goldenglanz Syndikat', text: 'Verdeckter wirtschaftlicher Arm im Brauerkrieg; außerhalb der handwerklichen Rangfolge.', icon: '../IconOrdner/Organisationsicons/Spionage.png' },
        { title: 'Kampfgeborene', text: 'Die Vorlage beschreibt geheime Unterstützung gegen Schwarzdorn, während Goldenglanz nach außen neutral bleibt.', icon: mark }
      ],
      documentsTitle: 'Familienbücher', documents: [{ title: 'Clan Goldglanz', text: 'Familienrollen, Originalporträts und Verbindungen.', icon: familyCrest(family), link: '../Stammbäume/Stammbaum.html?family=haus-goldglanz&mode=view' }, { title: 'Clan Schattenherz', text: 'Die östlichen Bündnispartner und ihre Erben.', icon: familyCrest(schattenherz), link: '../Stammbäume/Stammbaum.html?family=haus-schattenherz&mode=view' }],
      footer: 'Honigbreu, Handel und ein Bündnis im Osten.'
    }
  };
  const officer = (name, image) => ({ title: name, subtitle: 'Vorstandsmitglied', portrait: image, text: 'In der ausführlichen Brauereihierarchie als Vorstandsmitglied benannt.' });
  const hierarchy = hierarchyPage({ title: 'Goldenglanz Brauerei', family,
    description: p('Wulfgar führt die Zunft. Der Vorstand vereint Nvjar, Tyrkir und Urdin Goldglanz mit Ulfrik und Isbrand Schattenherz. Die folgenden handwerklichen Ränge besitzen keine überlieferten Amtsinhaber.'),
    levels: [
      { label: 'Gildenoberhaupt', nodes: [{ title: 'Gildenoberhaupt', subtitle: 'Wulfgar Goldglanz', portrait: portrait('wulfgar-1668-goldglanz'), text: 'In der ausführlichen Vorlage als Leiter genannt; geboren 1668.' }] },
      { label: 'Vorstand', nodes: [officer('Nvjar Goldglanz', portrait('nvjar-goldglanz')), officer('Tyrkir Goldglanz', portrait('tyrkir-goldglanz')), officer('Urdin Goldglanz', portrait('urdin-goldglanz')), officer('Ulfrik Schattenherz', familyPortrait(schattenherz, 'ulfrik-schattenherz')), officer('Isbrand Schattenherz', familyPortrait(schattenherz, 'isbrand-schattenherz'))] },
      ...['Brauermeister', 'Brauer Knecht', 'Brauer Geselle', 'Brauer Lehrling', 'Handlanger'].map(title => ({ label: title, nodes: [{ title, subtitle: 'Amtsinhaber nicht benannt', portrait: mark, text: 'Überlieferter Handwerksrang der Goldenglanz Brauerei.' }] }))
    ], footer: 'Die Familien- und Bündnisrollen begründen keinen automatisch erworbenen Handwerksrang.'
  });
  const workshops = [['Goldquell', 'Schwarzfenn'], ['Gildstatt', 'Schwarzfenn'], ['Goldenglanz', 'Krähenmoor'], ['Edelstatt', 'Krähenmoor'], ['Honigberg', 'Krähenmoor']];
  const taverns = [['Zur Goldenen Stute', 'Schwarzfenn'], ['Zum Goldenen Horn', 'Schwarzfenn'], ['Zum Glänzenden Kelch', 'Krähenmoor'], ['Zur Ewigen Münze', 'Krähenmoor']];
  const network = { pageTitle: 'Brauersiedlungen und Tavernen im Osten', organizationNetworkPage: true, organizationNetwork: {
    title: 'Brauorte, Flusswege und Schankstuben', introduction: copy(source, 53, 55), reach: 'Osten Aldrimars · Schwarzfenn und Krähenmoor',
    model: 'Gepachtete Brauersiedlungen und städtische Vertriebsstellen versorgen das Tavernenwesen.',
    note: 'Kronental bleibt neutral. Nur ein Brauereistandort pro Gilde in Heldenwacht ist zugelassen; dessen eigener Betriebsname fehlt. Weitere Tavernenplätze in Rabenfurt und Moortal sind unbenannt und werden nicht mit erfundenen Namen gefüllt.',
    sites: [...workshops.map(([name, region]) => ({ name, region: `${region} · Aldrimar`, kind: 'workshop', image: mark, description: 'Benannte Brauersiedlung des östlichen Produktionsnetzes.' })),
      { name: 'Heldenwacht · Betriebsname offen', region: 'Kronental · Aldrimar', kind: 'branch', image: mark, description: 'Die für die Gilde zugelassene Ausnahme in der neutralen Hauptstadt.' },
      ...taverns.map(([name, region]) => ({ name, region: `${region} · Aldrimar`, kind: 'branch', image: mark, description: 'Benannte Taverne im Vertriebsnetz der Goldenglanz Brauerei.' }))],
    footer: 'Land und Standorte der Schattenherzen ergänzen das eigene Netz.'
  } };
  return finishBreweryModule({ id: 'goldenglanz-brauerei', title: 'Die Goldenglanz Brauerei', subtitle: 'Clan Goldglanz · Honigbreu und Handelsmacht im Osten', family,
    pages: [
      storyPage('Der Aufstieg der östlichen Braumacht', 'goldenglanz-aufstieg', copy(source, 4) + copy(source, 6, 8)), guild, hierarchy,
      storyPage('Von Honigbreu und der Macht des Ausschanks', 'goldenglanz-handwerk', copy(source, 12, 14)), network,
      cataloguePage('Das Stammsortiment · Honigbreu und Hausbiere', drinks, { mark, origin, priceBuilder: buildDrinkPricing, categories: [{ id: 'mead', label: 'Met · Getränke' }, { id: 'beer', label: 'Bier · Getränke' }], subtitle: 'Honigbreu, Lichtgold, Kranzgold und Stillgold · Fünf freie Plätze' }),
      cataloguePage('Partnerbrauereien · Hjerte der Schattenherzen', partners, { mark, origin, partner: true, priceBuilder: buildDrinkPricing, subtitle: 'Eigenständige Clanherkunft im östlichen Bündnis' }),
      storyPage('Goldglanz, Schattenherz und der Brauerkrieg', 'goldenglanz-buendnisse', copy(source, 9, 11) + copy(source, 125, 128))
    ]
  });
}
