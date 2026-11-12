import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { BIOGRAPHY_SCHEMA, parseBiographyImportPayload } from '../../../js/biography/biography-transfer.mjs';
import { normalizePersonBiographyModule } from '../../../Stammbäume/assets/js/modules/person-biography/person-biography-model.js';

export const BRONA_CHARACTER_ID = 'XTL39e7WjIwUtoT9Gxml';

const traitIcon = name => `/IconOrdner/Traits%20Icon/${name}.png`;

// Presentation only. These images grant no character traits or game modifiers.
export const BRONA_PERSONALITY_ICONS = Object.freeze({
  Bodenständig: traitIcon('Content'),
  Pflichtbewusst: traitIcon('Diligent'),
  Willensstark: traitIcon('Willful'),
  Pragmatisch: traitIcon('Administrator'),
  Geduldig: traitIcon('Patient'),
  Streng: traitIcon('Just'),
  Fürsorglich: traitIcon('Kind'),
  Direkt: traitIcon('Honest'),
  Gesellig: traitIcon('Gregarious'),
  Humorvoll: '/AleriaAlmanach/public/assets/biography-trait-icons/humorous-20261103.png',
  Loyal: traitIcon('Family_focus'),
  Stolz: traitIcon('Proud')
});

function comparableBiography(module) {
  const normalized = normalizePersonBiographyModule(module);
  // Portrait layout and icons may already have been edited online. Neither is
  // narrative evidence; all reviewed text and other layout fields must agree.
  normalized.biography.portrait = '';
  normalized.biography.abilities = normalized.biography.abilities.map(({ icon, ...ability }) => ability);
  return normalized;
}

export function decorateBronaBiography(current, source) {
  assert.equal(current?.id, BRONA_CHARACTER_ID, 'Die Onlineakte gehört nicht zu Brona Eisenherz.');
  assert.equal(source?.personId, BRONA_CHARACTER_ID, 'Die Biografiequelle gehört nicht zu Brona Eisenherz.');
  const authored = parseBiographyImportPayload(source);
  const biography = parseBiographyImportPayload({ schema: BIOGRAPHY_SCHEMA, biographyModule: current.biography });
  const titles = Object.keys(BRONA_PERSONALITY_ICONS);
  for (const [label, module] of [['Quelle', authored], ['Onlineakte', biography]]) {
    assert.deepEqual(module.biography.abilities?.map(ability => ability.title), titles,
      `${label}: Die zwölf geprüften Persönlichkeitseinträge fehlen oder wurden geändert.`);
  }
  assert(isDeepStrictEqual(comparableBiography(biography), comparableBiography(authored)),
    'Bronas Onlinebiografie weicht von der geprüften Quelle ab; kein Überschreiben aktueller Inhalte.');

  biography.biography.abilities = biography.biography.abilities.map((ability, index) => {
    const icon = BRONA_PERSONALITY_ICONS[ability.title];
    assert([authored.biography.abilities[index].icon, icon].includes(ability.icon),
      `Das Icon für ${ability.title} wurde online zwischenzeitlich geändert.`);
    return { ...ability, icon };
  });
  if (!String(biography.biography.portrait || '').trim()) {
    biography.biography.portrait = String(current.portrait || '').trim();
  }
  return biography;
}
