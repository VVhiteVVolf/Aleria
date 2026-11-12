import { DRAIG_GARDE_PEOPLE_BY_ID } from '../../../Stammbäume/assets/js/data/draig-garde-people.js';

const node = (title, subtitle, portrait = '', text = '') => ({ title, subtitle, portrait, text });
const vacant = count => Array.from({ length: count }, () => node('Freier Platz', ''));

export const DRAIG_GARDE_DEFAULT_PORTRAITS = Object.freeze({
  ...Object.fromEntries(Object.values(DRAIG_GARDE_PEOPLE_BY_ID).map(person => [person.id, `../Stammbäume/${person.portrait}`])),
  'steffan-draig': '../Stammbäume/assets/images/portraits/haus-draig/steffan-draig.jpg',
  'llywelyn-coeddu': '../Stammbäume/assets/images/portraits/haus-coeddu/llywelyn-coeddu.png',
  'hywel-craigddu': '../Stammbäume/assets/images/portraits/haus-craigddu/hywel-craigddu.png'
});

export const DRAIG_GARDE_DEFAULT_PLACEHOLDERS = Object.freeze({
  'garde-ritter': './public/assets/draig-leibgarde/garde-ritter-20261112.png',
  gardist: './public/assets/draig-leibgarde/gardist-20261112.png'
});

/** Authored names come from the shared identity source; this owns placement. */
export function buildDraigGardeActiveLevels({ portraitByPersonId = {}, placeholderByRole = {} } = {}) {
  const portraits = { ...DRAIG_GARDE_DEFAULT_PORTRAITS, ...portraitByPersonId };
  const placeholders = { ...DRAIG_GARDE_DEFAULT_PLACEHOLDERS, ...placeholderByRole };
  const named = (id, { knight = false, text = '' } = {}) => {
    const person = DRAIG_GARDE_PEOPLE_BY_ID[id];
    if (!person) throw new Error(`Unbekannte Gardeidentität: ${id}`);
    const title = knight ? `${person.sex === 'female' ? 'Lady' : 'Sir'} ${person.name}` : person.name;
    return node(title, person.role.replace('Leibgarde', 'Garde'), portraits[id], text);
  };
  return [
    { label: 'Kommandant der Hausmacht', nodes: [node('Steffan Draig', 'Kommandant der Hausmacht', portraits['steffan-draig'])] },
    { label: 'Hauptmann der Leibgarde', nodes: [named('marared-curiad', { knight: true })] },
    { label: 'Leutnante', nodes: [
      named('pellinard-brandyddyn', { knight: true }),
      named('ysabel-bronnor', { knight: true,
        text: 'Ysabel stammt aus dem Tal der Milane und ist ein Spross des Ritterhauses Bronnor. Kindheitsfreundin der Gräfin Gwendolyn Aderyn.' })
    ] },
    { label: 'Ritter der Leibgarde', nodes: [
      named('eurgain-brandyddyn', { knight: true }), named('urien-caelrith', { knight: true }), named('mathon-curiad', { knight: true }),
      // A blank subtitle is the existing roster contract for an unnamed role.
      // The visible description retains its rank without inventing a person.
      ...Array.from({ length: 2 }, () => node('Garde Ritter', '', placeholders['garde-ritter'], 'Ritter der Garde'))
    ] },
    { label: 'Gardisten', nodes: [
      node('Llywelyn Coeddu', 'Leibgardist', portraits['llywelyn-coeddu']),
      node('Hywel Craigddu', 'Leibgardist', portraits['hywel-craigddu']),
      named('morcant-curiad'), named('lleucu-myrgath'), named('angharad-aelgorn')
    ] },
    { label: 'Gardisten', nodes: Array.from({ length: 5 }, () => node('Gardist', '', placeholders.gardist)) },
    { label: 'Rekruten', nodes: vacant(5) },
    { label: 'Knappen', nodes: vacant(5) },
    { label: 'Pagen', nodes: vacant(5) }
  ];
}
