const goods = (...ids) => Object.freeze(ids.map(id => Object.freeze({
  templateId: `standard:gemischtwarenhandler:${id}`, quantity: 1
})));

// This bounded editorial amendment is separate from the historical knight grant.
export const DRAIG_STARTING_POSSESSIONS = Object.freeze([
  Object.freeze({ id: 'y7MBxDiAaesbWHBtmw5Q', key: 'rhiannon-draig', name: 'Rhiannon Draig',
    worldPersonId: 'person--haus-draig--rhiannon-draig', houseId: 'house-draig', moneyCopper: 12400,
    rationale: 'Standesgemäße persönliche Barschaft und wenige Schreibutensilien für Rhiannon.',
    items: goods('notizbuch', 'feder-tinte', 'kreide'), ringTemplateId: 'house-signet:haus-draig' }),
  Object.freeze({ id: 'wnS8JOFUR3oS1izRzObH', key: 'isobel-draig', name: 'Isobel Draig',
    worldPersonId: 'person--haus-draig--isobel-1719-draig', houseId: 'house-draig', moneyCopper: 34700,
    rationale: 'Isobel erhält die größte persönliche Barschaft der vier Figuren und wenige Pflegegegenstände.',
    items: goods('spiegel', 'holzkamm', 'kraeutersaeckchen'), ringTemplateId: 'house-signet:haus-draig' }),
  Object.freeze({ id: 'yg7RonBDX5ctbr7icLWe', key: 'refri-thornwick', name: 'Refri Thornwick',
    worldPersonId: 'person--haus-thornwick--refri-thornwick', houseId: 'house-thornwick', moneyCopper: 0.12,
    rationale: 'Die mittellose Ritterin des heimatlosen Hauses erhält nur zwölf Eisenpfennig und zwei praktische Kleinigkeiten.',
    items: goods('feuerstein-stahl', 'nadel-faden'), ringTemplateId: 'personal-signet:refri-thornwick' }),
  Object.freeze({ id: '7ghgdvubmimcJySSkrKH', key: 'meredith-swyll', name: 'Meredith Swyll',
    worldPersonId: 'person--haus-swyll--meredith-swyll', houseId: 'house-swyll', moneyCopper: 108,
    rationale: 'Kleine persönliche Barschaft und schlichte Pflege- und Nähutensilien für Meredith.',
    items: goods('nadel-faden', 'seife', 'holzkamm'), ringTemplateId: null })
]);

export const DRAIG_STARTING_TARGETS = Object.freeze(DRAIG_STARTING_POSSESSIONS.map(({ id, key, name, worldPersonId }) =>
  Object.freeze({ id, key, name, worldPersonId })));
