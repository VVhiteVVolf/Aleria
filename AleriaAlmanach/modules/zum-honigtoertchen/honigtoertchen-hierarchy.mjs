import { HONIGTOERTCHEN_ART, MELOG_EMBLEM } from './honigtoertchen-profile.mjs';
import { melogPerson } from './honigtoertchen-people.mjs';

const member = name => {
  const person = melogPerson(name);
  return { id: `honigtoertchen-${person.id}`, title: person.name, subtitle: person.role,
    portrait: person.portrait, text: `<p>${person.role}</p>` };
};
const level = (label, names) => ({ label, nodes: names.map(member) });
const silhouetteRoot = '../Stammbäume/assets/images/placeholders/';
const vacancy = (id, role, silhouette = 'unknown.png') => Object.freeze({
  id: `honigtoertchen-frei-${id}`, title: role, subtitle: 'Unbesetzt · später ausfüllbar',
  portrait: `${silhouetteRoot}${silhouette}`,
  text: '<p>Noch zu besetzen · später ausfüllbar.</p><p>Dieser freie Platz kann später eine eigene Nebenfigur erhalten.</p>'
});
export const HONIGTOERTCHEN_VACANCIES = Object.freeze([
  vacancy('baeckergeselle', 'Bäckergeselle', 'male.png'),
  vacancy('baeckergesellin', 'Bäckergesellin', 'female.png'),
  vacancy('konditoreihilfe', 'Konditoreihilfe'),
  vacancy('baeckerlehrling', 'Bäckerlehrling'),
  vacancy('konditorlehrling', 'Konditorlehrling'),
  vacancy('backstubenhilfe', 'Backstubenhilfe'),
  vacancy('lieferhilfe', 'Lieferhilfe')
]);
const openLevel = (label, roles) => ({ label,
  nodes: roles.map(role => {
    const node = HONIGTOERTCHEN_VACANCIES.find(node => node.title === role);
    if (!node) throw new Error(`Unbekannter freier Bäckereiplatz: ${role}`);
    return { ...node };
  })
});

export function buildHonigtoertchenHierarchy() {
  return {
    organizationTitle: 'Die Familie hinter der Auslage', eyebrow: 'Zum Honigtörtchen',
    subtitle: 'Backstube, Verkauf und die verlässlichen Wege dazwischen', centerLabel: 'Haus Melog',
    emblem: MELOG_EMBLEM, sideImage: `${HONIGTOERTCHEN_ART}/scenes/backstube.png`,
    description: '<p>Tewdwr führt als Konditor- und Bäckermeister das Haus, Morfudd hält Buchhaltung und Finanzen zusammen. Anest und Guto stehen für das Backhandwerk; Afanen leitet den Verkauf. Einkauf, Verpackung, Lieferungen und Gästebetreuung haben ihre eigenen zuständigen Hände.</p>',
    detailsTitle: 'Die Aufgaben im Haus', details: [
      { label: 'Leitung', value: 'Tewdwr' }, { label: 'Finanzen', value: 'Morfudd' },
      { label: 'Meisterin', value: 'Anest' }, { label: 'Verkaufsleitung', value: 'Afanen' },
      { label: 'Einkauf & Wege', value: 'Eiffion und Mabli' }, { label: 'Gäste', value: 'Llywarch' }
    ],
    chartTitle: 'Vom Ofen bis zur Übergabe', chartIntro: 'Drei Arbeitsbereiche eines gemeinsamen Familienbetriebs. Sieben unbesetzte Plätze stehen für später ausgearbeitete Nebenrollen bereit.',
    treeDisplayMode: 'tabs', portraitScale: 100, cardFontScale: 90,
    trees: [
      { id: 'leitung', label: 'Leitung & Auftragsbuch', parentTreeId: '',
        levels: [level('Das Haus führen', ['Tewdwr']), level('Rechnungen und Absprachen', ['Morfudd'])] },
      { id: 'backstube', label: 'Backstube & Konditorei', parentTreeId: 'leitung',
        levels: [level('Das Handwerk', ['Anest', 'Guto']), level('Die jüngere Konditorin', ['Nerys']),
          openLevel('Weitere Bäcker · freie Plätze', ['Bäckergeselle', 'Bäckergesellin']),
          openLevel('Helfende Hände · freie Plätze', ['Konditoreihilfe', 'Backstubenhilfe']),
          openLevel('Lehrstellen · noch zu besetzen', ['Bäckerlehrling', 'Konditorlehrling'])] },
      { id: 'verkauf', label: 'Verkauf & Lieferungen', parentTreeId: 'leitung',
        levels: [level('Die Auslage', ['Afanen']), level('Im Laden und unterwegs', ['Llywarch', 'Eiffion', 'Mabli']),
          openLevel('Lieferwege · freier Platz', ['Lieferhilfe'])] }
    ],
    levels: [], footerNote: 'Silhouetten kennzeichnen unbesetzte, später ausfüllbare Nebenrollen. Die übrigen Angehörigen werden auf der Familienseite und im Stammbaum vorgestellt.'
  };
}
