import { RETINUE_PEOPLE, RETINUE_EMBLEM, retinuePerson } from './retinue-people.mjs';

const node = (person, role = person.role) => ({ title: role, subtitle: person.name, portrait: person.portrait,
  text: `<strong>${person.age} Jahre · ${person.division === 'Nachwuchs' ? person.role : person.division}</strong><br>${person.bio}<br><a href="${person.link}">Familienakte öffnen</a>` });
const vacancy = () => ({ title: 'Freier Platz', subtitle: '', portrait: '', text: '' });
const level = (label, nodes) => ({ label, nodes });
function fourRows(label, people) {
  const rows = [];
  for (let index = 0; index < people.length; index += 4) {
    const nodes = people.slice(index, index + 4).map(person => node(person));
    while (nodes.length < 4) nodes.push(vacancy());
    rows.push(level(index ? `${label} · Fortsetzung` : label, nodes));
  }
  rows.push(level(`${label} · offene Plätze`, Array.from({ length: 4 }, vacancy)));
  return rows;
}

export function buildRetinueHierarchy() {
  const trees = [
    { id: 'fuehrung', label: 'Führung & Verwaltung', parentTreeId: '', levels: [
      level('Anführerin', [node(retinuePerson('skalli-varulv'))]),
      level('Linke Hand · Rechte Hand', [node(retinuePerson('torben-rotstahl')), node(retinuePerson('ragna-baerenherz'))]),
      level('Waffen · Versorgung · Aufklärung · Skaldenkunst', [
        { title: 'Waffenmeister', subtitle: '', portrait: '', text: 'Offener Posten für Waffenübungen und Ausbildung.' },
        { title: 'Quartiermeister', subtitle: '', portrait: '', text: 'Offener Posten für Vorräte, Ausrüstung und Lagerordnung.' },
        node(retinuePerson('hakon-unholdbann')), node(retinuePerson('hvitserk-skald'))
      ])
    ] },
    { id: 'schar', label: 'Schar', parentTreeId: 'fuehrung', levels: [
      ...fourRows('Huskarle', RETINUE_PEOPLE.filter(person => person.division === 'Huskarl')),
      ...fourRows('Walküren', RETINUE_PEOPLE.filter(person => person.division === 'Walküre'))
    ] },
    { id: 'nachwuchs', label: 'Nachwüchsler', parentTreeId: 'fuehrung', levels: [
      level('Maer · weiblicher Nachwuchs', [node(retinuePerson('gundel-varulv')), node(retinuePerson('svala-baerenherz')), node(retinuePerson('embla-varulv')), vacancy()]),
      level('Drengr · männlicher Nachwuchs', [node(retinuePerson('kjell-rotstahl')), node(retinuePerson('hati-varulv')), vacancy(), vacancy()])
    ] },
    { id: 'tiere', label: 'Tiere', parentTreeId: 'fuehrung', levels: [
      level('Tiergefährten · vier offene Plätze', Array.from({ length: 4 }, vacancy))
    ] }
  ];
  return { layoutMode: 'vertical', treeDisplayMode: 'tabs', cardFontScale: 100, portraitScale: 60, chartScale: 90,
    eyebrow: 'Skallis Gefolge', subtitle: 'Kriegerschar von Roriksheim', centerLabel: 'Skallis Gefolge',
    emblem: RETINUE_EMBLEM, sideImage: RETINUE_EMBLEM, organizationTitle: 'Skallis Gefolge',
    motto: 'Gemeinsam dienen. Gemeinsam wachsen.',
    description: '<p>Die Schar untersteht dem Kriegsherrn von Roriksheim. Skalli führt sie mit dem Freiraum, dort einzugreifen, wo ihre Hilfe am dringendsten gebraucht wird. Ragna und Torben tragen die Führung mit; Fachaufgaben verteilen sich auf den erwachsenen Kriegerkreis.</p>',
    detailsTitle: 'Die Ordnung der Schar', details: [
      { icon: 'I', label: 'Führung', value: 'Skalli · Torben · Ragna · vier Fachaufgaben' },
      { icon: 'II', label: 'Schar', value: 'Huskarle und Walküren in Viererreihen' },
      { icon: 'III', label: 'Ausbildung', value: 'Unter 18: Maer und Drengr' }
    ], chartTitle: 'Gefährten und Verantwortung',
    chartIntro: 'Wähle einen Bereich. Führungsaufgaben und Zugehörigkeit zum Kriegerkreis werden getrennt gezeigt; ein Mitglied kann in beiden erscheinen.',
    trees, levels: trees[0].levels,
    footerNote: 'Maer bezeichnet den weiblichen, Drengr den männlichen Nachwuchs. Gundel und Svala lernen als persönliche Maer bei Skalli, Kjell als Drengr bei Torben. Vier Tierplätze sind unbesetzt.' };
}
