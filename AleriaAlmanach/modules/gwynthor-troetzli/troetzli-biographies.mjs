import { normalizePersonBiographyModule } from '../../../Stammbäume/assets/js/modules/person-biography/person-biography-model.js';
import { TROETZLI_PEOPLE } from './troetzli-household.mjs';

const traits = {
  cynddelw: [['Aufmerksamer Zuhörer', 'Sammelt Aussagen, Namen und offene Fragen in einem kleinen Lederbuch.'],
    ['Ehrlich trotz eigener Not', 'Verschweigt Kaufinteressenten Trötzlis Schwierigkeiten nicht.'],
    ['Besser mit Worten als mit Pferden', 'Hat mit dem vermeintlichen Schnäppchen seine Erfahrung überschätzt.']],
  esyllt: [['Mit dem Hof verbunden', 'Lebt in der Stadt und hält Kontakt zu Eltern und Geschwistern auf dem Penrudd-Hof.'],
    ['Praktische Unterstützung', 'Sucht mit ihrem Mann nach einer tragfähigen Lösung für das Pferd.']],
  eirlys: [['Ein eigener Name', 'Hat Trötzli wegen seines trotzigen Auftretens benannt.'],
    ['Malstift und Papier', 'Hält ihre Einfälle und Beobachtungen in Zeichnungen fest. Ihre Skizze begleitet Papas Gesuch.']],
};

export function buildTroetzliBiography(key) {
  const person = TROETZLI_PEOPLE[key];
  const family = key === 'esyllt' ? 'Penrudd' : 'Llythfor';
  return normalizePersonBiographyModule({
    stats: [['Vollständiger Name', person.name], ['Alter im Jahr 1740', `${person.age} Jahre`],
      ['Haus', family], ['Tätigkeit', person.role], ['Wohnsitz', 'Gwynthor'],
      ['Familienstand', key === 'eirlys' ? 'Kind' : 'Verheiratet']],
    biography: { portrait: person.portrait, biographyTitle: person.name,
      biographyText: `<p>${person.bio}</p>`,
      abilitiesTitle: 'Persönlichkeit', abilities: traits[key].map(([title, detail]) => ({ title, detail })),
      historyTitle: 'Erscheinung', historyText: `<p>${person.appearance}</p>`,
      connectionsTitle: 'Familie',
      connections: Object.entries(TROETZLI_PEOPLE).filter(([other]) => other !== key)
        .map(([, relative]) => ({ type: 'connection', name: relative.name, image: relative.portrait,
          detail: relative.role })),
      documentsTitle: 'Familienakten',
      documents: [{ title: 'Haus Llythfor', text: 'Cynddelw, Esyllt und Eirlys · Gwynthorer Haushalt',
        link: '/Stammbäume/Stammbaum.html?family=haus-llythfor&mode=view' },
      { title: 'Haus Penrudd', text: 'Esyllts Herkunft · Penrudd-Hof und Zum Roten Tor',
        link: '/Stammbäume/Stammbaum.html?family=haus-penrudd&mode=view' }],
      footer: `Personenakte · ${person.name}`,
    },
  });
}
