import { createFamilyPerson, createMarriage, createParentages } from '../family-record-builders.js';

// Explicit, bounded additions to the existing households. No portraits are made.
function household(slug, man, woman, children) {
  const houseId = `house-${slug}`;
  const person = ([id, name, birth, sex, title], married = false) => createFamilyPerson({ id, name, birth, sex, title,
    houseId: married ? '' : houseId, familyRole: married ? 'married' : 'core', portrait: '',
    notes: `${1740 - Number(birth)} Jahre. Gehört zum gemeinsamen ${['bragwen', 'eiddfer'].includes(slug) ? 'Brauerhof' : 'Landhaushalt'} und trägt dort die altersgemäßen Aufgaben mit.${married ? ' Die Herkunftsfamilie ist nicht benannt.' : ''}`,
    extensions: { authoredSource: 'fleischsammler-familien-20261114' } });
  const marriage = createMarriage(`marriage-${man[0]}-${woman[0]}`, man[0], woman[0], {
    extensions: children.length === 1 ? { chartAlignParentPairOverChildPersonId: children[0][0] } : { chartAlignChildGroupBelowParentPair: true }
  });
  return { people: [person(man), person(woman, true), ...children.map(child => person(child))],
    partnerships: [marriage], parentages: createParentages(children.map(child => child[0]), marriage.participantIds, marriage.id), rootId: man[0] };
}
const dolweth = household('dolweth',
  ['arwel-dolweth', 'Arwel Dolweth', '1702', 'male', 'Kleinbauer und Bruder Aleds'],
  ['meirwen-spouse-dolweth', 'Meirwen', '1704', 'female', 'Bäuerin für Garten und Kleinvieh'], [
    ['cynan-dolweth', 'Cynan Dolweth', '1723', 'male', 'Acker- und Fuhrhelfer'],
    ['lowri-dolweth', 'Lowri Dolweth', '1725', 'female', 'Junge Gartenhelferin'],
    ['gwion-dolweth', 'Gwion Dolweth', '1729', 'male', 'Hofkind'],
    ['elin-dolweth', 'Elin Dolweth', '1733', 'female', 'Hofkind']
  ]);
const brynial = household('brynial',
  ['blethyn-brynial', 'Blethyn Brynial', '1700', 'male', 'Kleinbauer und älterer Bruder Rhydderchs'],
  ['gwenora-spouse-brynial', 'Gwenora', '1702', 'female', 'Bäuerin und Haushaltshelferin'], [
    ['emrys-brynial', 'Emrys Brynial', '1721', 'male', 'Ackerbauer und Viehhelfer'],
    ['sian-brynial', 'Sian Brynial', '1724', 'female', 'Junge Garten- und Vorratshelferin'],
    ['talwyn-brynial', 'Talwyn Brynial', '1728', 'male', 'Hofkind'],
    ['nesta-brynial', 'Nesta Brynial', '1732', 'female', 'Hofkind']
  ]);
const bragwen = household('bragwen',
  ['hywel-bragwen', 'Hywel Bragwen', '1694', 'male', 'Brauer und jüngerer Bruder Owains'],
  ['gwenfara-spouse-bragwen', 'Gwenfara', '1697', 'female', 'Brauerin für Gärung und Lagerung'], [
    ['aneurin-bragwen', 'Aneurin Bragwen', '1717', 'male', 'Brauer und Mälzer'],
    ['ceryn-bragwen', 'Ceryn Bragwen', '1720', 'female', 'Brauerin und Vorratsverwalterin'],
    ['meurig-bragwen', 'Meurig Bragwen', '1722', 'male', 'Fass- und Fuhrhelfer'],
    ['edwen-bragwen', 'Edwen Bragwen', '1725', 'female', 'Lehrling der Brauwirtschaft'],
    ['rhunor-bragwen', 'Rhunor Bragwen', '1729', 'male', 'Hofkind'],
    ['eilwen-bragwen', 'Eilwen Bragwen', '1733', 'female', 'Hofkind']
  ]);
const eiddfer = household('eiddfer',
  ['gwyndor-eiddfer', 'Gwyndor Eiddfer', '1695', 'male', 'Brauer und jüngerer Bruder Cadells'],
  ['elenna-spouse-eiddfer', 'Elenna', '1698', 'female', 'Brauerin für Vorräte und Haushaltsführung'], [
    ['mabon-eiddfer', 'Mabon Eiddfer', '1718', 'male', 'Brauer und Mälzer'],
    ['gwennor-eiddfer', 'Gwennor Eiddfer', '1721', 'female', 'Brauerin und Lieferungshelferin'],
    ['cadwyn-eiddfer', 'Cadwyn Eiddfer', '1725', 'male', 'Lehrling für Lager und Fuhrarbeit'],
    ['luned-eiddfer', 'Luned Eiddfer', '1730', 'female', 'Hofkind']
  ]);
const morwen = createFamilyPerson({ id: 'morwen-eiddfer', name: 'Morwen Eiddfer', sex: 'female', birth: '1717', death: '1740', houseId: 'house-eiddfer',
  title: 'Verstorbene Brauerin', portrait: '', notes: '23 Jahre. Tochter Cadells und Ffions, Schwester Rhiains und Tegids. Half bei Brauarbeit und Lieferungen. Ihr Tod durch den Fleischsammler trifft den Eiddfer-Haushalt als eigener Verlust.', extensions: { authoredSource: 'fleischsammler-familien-20261114' } });

export const RURAL_HOUSEHOLD_EXTENSIONS = Object.freeze({
  dolweth: { ...dolweth, lineageChildIds: ['aled-dolweth', dolweth.rootId] },
  brynial: { ...brynial, lineageChildIds: ['rhydderch-brynial', brynial.rootId] },
  bragwen: { ...bragwen, lineageChildIds: ['owain-bragwen', bragwen.rootId] },
  eiddfer: { ...eiddfer, people: [...eiddfer.people, morwen],
    parentages: [...eiddfer.parentages, ...createParentages([morwen.id], ['cadell-eiddfer', 'ffion-spouse-eiddfer'], 'marriage-cadell-ffion-eiddfer')],
    lineageChildIds: ['cadell-eiddfer', eiddfer.rootId] }
});
