import { ZITTERAALE_ART, ZITTERAALE_LEADERS } from './zitteraale-people.mjs';
import { moneyState } from '../item-register/item-register-money.js';
export const ZUNDER_CREATURE_ID = 'companion-zitteraal-zunder';
const chiefId = ZITTERAALE_LEADERS[0].characterId;
const ownedItem = (id, name, category, description, extra = {}) => ({ id: `zitteraal-${id}`, instanceId: `zitteraal-${id}`, name, category,
  type: category === 'weapon' ? 'Morgenstern' : category === 'armor' ? 'Plattenpanzer' : 'Rhyfel-Hengst', quantity: '1', description,
  image: `${ZITTERAALE_ART}/items/${id}.png`, imageFormat: 'square', imageFit: 'contain', imagePosition: 'center',
  ownerCharacterId: chiefId, ownerCharacterName: ZITTERAALE_LEADERS[0].name, itemStorageMode: 'character', equipped: category !== 'companion',
  templateId: '', itemDbKey: '', attributes: [], infoRows: [], ...extra });

export function buildZitteraalInventory() {
  const mount = { id: ZUNDER_CREATURE_ID, creatureId: ZUNDER_CREATURE_ID, inventoryItemId: 'zitteraal-zunder', name: 'Zunder', species: 'Rhyfel-Hengst',
    role: 'Reittier', image: `${ZITTERAALE_ART}/zunder.png`, imageFormat: 'portrait', imageFit: 'contain', imagePosition: 'center',
    summary: 'Breitschultriger dunkelbrauner Rhyfel-Hengst mit schwarzer Mähne und dichtem Fesselbehang.',
    description: 'Das Reittier des Schwarzen Zitteraals. Kommt auf den gerufenen Namen Zunder; an Lärm und bewaffnete Reiter gewöhnt.', status: 'Gesund', attributes: [], infoRows: [] };
  return { title: 'Ausrüstung des Schwarzen Zitteraals', name: ZITTERAALE_LEADERS[0].name, portrait: ZITTERAALE_LEADERS[0].portrait,
    portraitFormat: 'portrait', portraitFit: 'cover', money: moneyState(0), moneyNotice: 'Kein frei verfügbarer Münzbestand festgelegt.',
    categories: [{ id: 'weapon', label: 'Waffen' }, { id: 'armor', label: 'Rüstungen' }, { id: 'companion', label: 'Reittier' }],
    items: [ownedItem('donnergrollen', 'Donnergrollen', 'weapon', 'Ein starrer dunkler Morgenstern mit schwerem Stachelkopf. Aus dem Besitz eines Illysywen-Ritters überliefert; Erzählungen über Funken belegen keine verlässliche Verzauberung.',
      { infoRows: [{ label: 'Herkunft', value: 'Illysywen · überlieferte Beutewaffe' }, { label: 'Magie', value: 'Nicht bestätigt' }, { label: 'Alter Schadensvermerk', value: '8' }] }),
      ownedItem('zitteraal-panzer', 'Zitteraal-Plattenpanzer', 'armor', 'Dunkler Plattenpanzer mit goldenen Kanten und Aalzeichen. Der behauptete Tenebrium-Anteil ist nicht belegt; daraus wird kein magischer Schutz abgeleitet.',
        { infoRows: [{ label: 'Material', value: 'Dunkle Legierung · Zusammensetzung unbestätigt' }, { label: 'Alter Schutzvermerk', value: '25' }] }),
      ownedItem('zunder', 'Zunder', 'companion', mount.description, { image: mount.image, imageFormat: 'portrait', creatureId: ZUNDER_CREATURE_ID, registerCategory: 'pferde' })], companions: [mount] };
}

export function buildZitteraaleCharacters() {
  return ZITTERAALE_LEADERS.map(person => ({ id: person.characterId, name: person.name, aliases: [], title: person.role, fraktion: 'Schwarze Zitteraale',
    portrait: person.portrait, bio: `${person.background}\n\n${person.character}\n\n${person.method}`, status: 'Gesucht',
    createdAt: '2026-10-21T00:00:00Z', updatedAt: '2026-10-21T00:00:00Z', archived: false,
    genealogy: { sex: person.id === 'nachtkieme' ? 'female' : 'male', birth: String(1740 - person.age), status: 'alive', relationships: { parents: [], partners: [], children: [] } },
    imageSets: [{ id: 'standard', name: 'Standard', portrait: person.portrait, emotes: [] }], activeImageSetId: 'standard', imageSetSchemaVersion: 1,
    ...(person.id === 'schwarzer-zitteraal' ? { inventory: buildZitteraalInventory() } : {}) }));
}
