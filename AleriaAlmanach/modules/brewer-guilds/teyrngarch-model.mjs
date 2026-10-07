import { HOUSE_TEYRNGARCH_FAMILY as family } from '../../../Stammbäume/assets/js/data/house-teyrngarch-family.js';
import { ASSETS, paragraph as p, sourceCopy as copy, familyPortrait, familyCrest, storyPage, cataloguePage, hierarchyPage, finishBreweryModule } from './brewery-pages.mjs';

const mark = `${ASSETS}/teyrngarch-brauzeichen.png`;
const origin = 'Aberon · Sonnenküste · Königreich Cenyr';
const portrait = id => familyPortrait(family, id);
const connection = (id, detail) => ({ name: family.persons.find(person => person.id === id).name, image: portrait(id), imageFormat: 'portrait', detail });

export function buildTeyrngarch(source) {
  const beers = [
    { id: 'bier-goldhaube', name: 'Goldhaube', subtitle: 'Preisgekröntes Nationalbier Cenyrs', servingCopper: 5, badge: 'Nationalbier', tags: ['Malz', 'Sommerblumen', 'Honig'], description: copy(source, 68, 72), occasions: ['Festtafel', 'Brot & Käse'] },
    { id: 'bier-hellwacht', name: 'Hellwacht', subtitle: 'Helles Hausbier · Teyrngarcher Eigenmarke', servingCopper: 2, tags: ['Mildes Malz', 'Golden', 'Dezente Bittere'], description: copy(source, 76, 78) },
    { id: 'bier-daemmerkrone', name: 'Dämmerkrone', subtitle: 'Dunkles Röstbier · Teyrngarcher Eigenmarke', servingCopper: 1.5, tags: ['Röstmalz', 'Dunkles Brot', 'Rauch'], description: copy(source, 82, 84), occasions: ['Abend', 'Herzhafte Speisen'] },
    { id: 'bier-hopfgold', name: 'Hopfgold', subtitle: 'Leichtes helles Bier · Teyrngarcher Eigenmarke', servingCopper: 1, tags: ['Strohgold', 'Frisch', 'Milder Hopfen'], description: copy(source, 88, 90), occasions: ['Taverne', 'Wurst & Brot'] },
    { id: 'bier-sonnenglanz', name: 'Sonnenglanz', subtitle: 'Helles Kräuterbier · Teyrngarcher Eigenmarke', servingCopper: 0.5, tags: ['Kräuter', 'Blütenhonig', 'Leicht'], description: copy(source, 94, 96), occasions: ['Frühmarkt', 'Brotzeit'] }
  ];
  const partners = [{ id: 'bier-hakenbraeu', name: 'Hakenbräu', subtitle: 'Partnerbier · Rostiger Haken', servingCopper: 1, badge: 'Partnerprodukt',
    tags: ['Dunkel', 'Herb', 'Malz & Rauch'], description: copy(source, 109, 112), origin: 'Die Hausbrauerei des Rostigen Hakens',
    conditions: 'Eigenständiges Hausbier des Rostigen Hakens; nur dort gebraut und ausgeschenkt. Flaschen- und Fasswerte gelten als Gebindereferenz vor Ort, nicht als überregionales Lieferangebot.' }];
  const guild = { pageTitle: 'Das Haus hinter der Zunft', guildPage: true, image: portrait('lugh-teyrngrach'), imageFit: 'contain',
    quote: 'Mit Ähre gebraut, mit Ehre genossen!',
    stats: [['Sitz', 'Aberon'], ['Hausoberhaupt', 'Lugh Teyrngarch'], ['Leitender Familienbrauer', 'Gaenor Teyrngarch'], ['Mitgliederstärke', 'Hoch'], ['Ruf', 'Expansionistisch · marktbeherrschend']],
    guild: { crestImage: familyCrest(family), portraitFormat: 'portrait', sideWidth: 100, connectionPortraitHeight: 100,
      biographyTitle: 'Familie, Handwerk & Macht', biographyText: copy(source, 4) + p('Taredd der Braumeister und Sulwen stehen am Anfang der Hausüberlieferung. Heute trägt Lugh Teyrngarch seit 1725 die Verantwortung für das Haus. Sein Sohn Gaenor verbindet die Stellung des ersten Erben mit dem Rang eines Teyrngarch Brauers; dessen Sohn Gandwy arbeitet als Brauer Geselle.'),
      abilitiesTitle: 'Die Handschrift der Teyrngarch', abilities: [
        { title: 'Vom Feld bis zur Schankstube', detail: 'Gerstenbauern, Mühlen, Fassbinder, Braumeister und Wirte bilden eine zusammenhängende Wirtschaft.', icon: mark },
        { title: 'Goldhaube als Versprechen', detail: 'Das Nationalbier Cenyrs trägt den Ruf der Zunft über die Sonnenküste hinaus.', icon: mark },
        { title: 'Unnachgiebiger Wettbewerb', detail: 'Ehen, Übernahmen und nötigenfalls die verborgene Diebesgilde sichern den Einfluss des Hauses.', icon: '../IconOrdner/Organisationsicons/Spionage.png' }
      ],
      historyTitle: 'Aus Bürgern wurden Ritterfürsten', historyText: copy(source, 6, 8),
      worksTitle: 'Leistungen der Zunft', works: ['Bierherstellung und Qualitätssicherung', 'Tavernenbetrieb und Handel', 'Gersten- und Hopfenanbau auf eigenen und gepachteten Flächen', 'Fassbinderei, Mühlen und Versorgung der Brauhäuser'],
      triviaTitle: 'Gesichter und Verbindungen', trivia: ['Gaenors Rang als Familienbrauer ist eine fachliche Stellung; die oberste Leitung liegt bei Lugh.', 'Die Goldhaube ist das Feierbier des Hauses; Sonnenglanz begleitet den Frühmarkt.'],
      connectionsTitle: 'Drei Generationen am Brauhaus', connections: [
        connection('lugh-teyrngrach', 'Geboren 1669 · Haus- und Gildenoberhaupt seit 1725.'),
        connection('gaenor-teyrngarch', 'Geboren 1694 · Erster Erbe und Teyrngarch Brauer; Sohn Lughs und Cariads.'),
        connection('gandwy-teyrngarch', 'Geboren 1720 · Brauer Geselle; Sohn Gaenors und Elens, Enkel Lughs.')
      ],
      contractsTitle: 'Bündnisse & Konkurrenz', contracts: [
        { title: 'Haus Penderyn', text: 'Eine über mehrere Generationen erneuerte Familien- und Handelspartnerschaft verbindet Bier und Whisky.', icon: `${ASSETS}/penderyn-brennzeichen.png` },
        { title: 'Aldrimarer Brauereizünfte', text: 'Wirtschaftliche Konkurrenz; Heiratsverbindungen können den Wettbewerb begrenzen.', icon: '../IconOrdner/Organisationsicons/Diplomatie.png' }
      ],
      documentsTitle: 'Familienbuch & Betriebsnetz', documents: [{ title: "Haus Teyrngarch O’Aberon", text: 'Stammbaum, Originalporträts und Familienverbindungen.', icon: familyCrest(family), link: '../Stammbäume/Stammbaum.html?family=haus-teyrngarch&mode=view' }],
      footer: 'Mit Ähre gebraut, mit Ehre genossen!'
    }
  };
  const roles = [
    ['Gildenoberhaupt', 'Lugh Teyrngarch', 'lugh-teyrngrach', 136],
    ['Teyrngarch Brauer', 'Gaenor Teyrngarch', 'gaenor-teyrngarch', 139],
    ['Brauer Zünftling', 'Standortleitung', null, 141],
    ['Brauer Knecht', 'Voll ausgebildeter Brauer · Stellvertretung', null, 143],
    ['Brauer Geselle', 'Gandwy Teyrngarch', 'gandwy-teyrngarch', 146],
    ['Brauer Lehrling', 'Ausbildung unter Aufsicht', null, 148],
    ['Handlanger', 'Hilfsdienste & Versorgung', null, 150]
  ];
  const hierarchy = hierarchyPage({ title: 'Teyrngarch Brauerzunft', family, motto: 'Mit Ähre gebraut, mit Ehre genossen!',
    description: p('Das Haus bestimmt die Richtung; die Meister tragen die Verantwortung für ihr Handwerk. Die besondere Würde eines Teyrngarch Brauers setzt Geburt oder Einheirat in die Familie voraus.'),
    levels: roles.map(([title, subtitle, person, index]) => ({ label: title, nodes: [{ title, subtitle, portrait: person ? portrait(person) : mark, text: copy(source, index) }] })),
    footer: 'Hausoberhaupt: Lugh · leitender Familienbrauer: Gaenor · Geselle: Gandwy. Die genaue Hierarchie folgt der ausführlichen Zunftordnung der Vorlage.'
  });
  const locations = [
    ['Trefbrewyn', 'Ährental'], ['Bragdyddolwyn', 'Ährental'], ['Bragdyddol', 'Graue Weite'],
    ['Bragfonnor', 'Weidebucht'], ['Gwellbrwyd', 'Weidebucht'], ['Bragmellyn', 'Sonnenküste'],
    ['Bragwaul', 'Sonnenküste'], ['Bragwynfa', 'Sonnenküste'], ['Baglydd', 'Sonnenküste']
  ];
  const network = { pageTitle: 'Herrschaften, Pachten & Brauorte', organizationNetworkPage: true, organizationNetwork: {
    title: 'Von Aberon in die Grafschaften', introduction: copy(source, 54, 58) + copy(source, 152), reach: 'Königreich Cenyr · Ursprung an der Sonnenküste',
    model: 'Eigene Herrschaften und gepachtete Standorte werden durch die Zunftleitung verbunden.',
    note: 'Die Überlieferung nennt die Orte und Regionen, ordnet jedoch nicht jeden Ort eindeutig Eigenbesitz oder Pacht zu.',
    sites: [{ name: 'Aberon', region: 'Sonnenküste', kind: 'headquarters', image: familyCrest(family), description: 'Ursprung und zentraler Sitz der Teyrngarch Brauerzunft.' },
      ...locations.map(([name, region]) => ({ name, region, kind: 'branch', image: mark, description: 'Überlieferter Standort im Brau- und Versorgungsnetz der Teyrngarch.' }))],
    footer: 'Aus eigenem Grund und fremden Pachten wächst ein zusammenhängendes Brauereinetz.'
  } };
  return finishBreweryModule({ id: 'teyrngarch-brauerzunft', title: 'Die Teyrngarch Brauerzunft', subtitle: 'Mit Ähre gebraut, mit Ehre genossen!', family,
    pages: [
      storyPage('Von der Ähre zum Adel', 'teyrngarch-aufstieg', copy(source, 4) + copy(source, 6, 8)), guild, hierarchy,
      storyPage('Vom Gerstenfeld zum Schanktisch', 'teyrngarch-handwerk', copy(source, 9, 15)), network,
      cataloguePage('Das Stammsortiment · Fünf Eigenbiere', beers, { mark, origin, subtitle: 'Goldhaube, Hellwacht, Dämmerkrone, Hopfgold & Sonnenglanz' }),
      cataloguePage('Partnerbrauereien · Eigene Herkunft', partners, { mark, origin, partner: true, subtitle: 'Kooperationsprodukte außerhalb des Teyrngarch-Stammsortiments' }),
      storyPage('Bündnisse, Märkte & Schatten', 'teyrngarch-buendnisse', copy(source, 128, 133) + p('Die Verbindung zu Penderyn trägt auch familiäre Gesichter: Mairwen Teyrngarch heiratete Gareth Penderyn, während Gwastad Teyrngarch mit Eilonwy Penderyn verbunden war. In der heutigen Generation erneuert die Verlobung Elinor Teyrngarchs mit Dwnn Penderyn diese Nähe.'))
    ]
  });
}
