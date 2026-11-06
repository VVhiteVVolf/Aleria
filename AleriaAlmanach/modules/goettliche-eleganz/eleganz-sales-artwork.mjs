import '../image-library/image-library-model.js';

export const ELEGANZ_GENERAL_EMOTE_LABELS = Object.freeze(['Redend', 'Freundlich', 'Nachdenklich', 'Skeptisch', 'Überrascht', 'Genervt', 'Entschlossen', 'Verärgert', 'Unsicher']);
export const ELEGANZ_SALES_EMOTE_LABELS = Object.freeze(['Begrüßen', 'Zuhören', 'Beraten', 'Präsentieren', 'Abwägen', 'Beruhigen', 'Bestimmt', 'Anprobe', 'Verabschieden']);
export const ELEGANZ_HOUSE_SERVICE_EMOTE_LABELS = Object.freeze(['Dienstbereit', 'Aufmerksam', 'Hinweisend', 'Abstimmend', 'Prüfend', 'Beruhigend', 'Höflich bestimmt', 'Eilfertig', 'Zufrieden']);
export const ELEGANZ_SALES_SET_IDS = Object.freeze({ 'rhys-maerllys': 'verkaeufer-set-02', 'catrin-gwernant': 'verkaeuferin-set-02' });
export const ELEGANZ_EFA_AVATARS_AUTHORED_AT = '2026-11-06T20:19:13.000Z';
const roleSets = Object.freeze({
  'rhys-maerllys': Object.freeze({ id: 'verkaeufer-set-02', name: 'Verkäufer', labels: ELEGANZ_SALES_EMOTE_LABELS }),
  'catrin-gwernant': Object.freeze({ id: 'verkaeuferin-set-02', name: 'Verkäuferin', labels: ELEGANZ_SALES_EMOTE_LABELS }),
  'efa-gwernant': Object.freeze({ id: 'hausdienst-set-02', name: 'Hausdienst', labels: ELEGANZ_HOUSE_SERVICE_EMOTE_LABELS })
});
export function getEleganzStaffArtworkSets(personId) {
  if (!roleSets[personId]) throw Error(`Unbekannte Eleganz-Bildperson: ${personId}`);
  return [{ id: 'standard', name: 'Standard', labels: ELEGANZ_GENERAL_EMOTE_LABELS }, roleSets[personId]];
}
const model = globalThis.AleriaCharacterImageSets;
const require = (condition, message) => { if (!condition) throw Error(message); };

/** Validate the reviewed artwork contract before the shared library serializes it. */
export function buildEleganzStaffImageLibrary(person, artwork, authoredAt, { published = false } = {}) {
  const source = (artwork?.people || artwork)?.[person.worldPersonId];
  require(source, `Geprüfte Bildquelle fehlt: ${person.name}`);
  require(!source.name || source.name === person.name, `Bildquelle gehört zu einer anderen Person: ${person.name}`);
  const imageUrl = image => image?.url || (!published && image?.localPath && !image.localPath.includes('..')
    && !/^(?:[A-Za-z]:|\/)/.test(image.localPath)
    ? encodeURI(image.localPath.startsWith('AleriaAlmanach/') ? `./${image.localPath.slice('AleriaAlmanach/'.length)}` : `../${image.localPath}`) : null);
  const checkImage = (image, label) => {
    const url = imageUrl(image);
    require(typeof url === 'string' && url === model.normalizeImageUrl(url), `Ungültige Bildadresse: ${label}`);
    require(!published || url.startsWith('https://'), `Öffentliche Bildadresse fehlt: ${label}`);
    require(/^[a-f0-9]{64}$/.test(image.sha256 || ''), `Bildhash fehlt: ${label}`);
  };
  checkImage(source.portrait, person.name);
  const sets = Array.isArray(source.sets) ? source.sets : [];
  const expectedSets = getEleganzStaffArtworkSets(person.personId);
  require(sets.length === expectedSets.length, `Falsche Anzahl neuer Bildsets: ${person.name}`);
  const ids = new Set(), hashes = new Set(), urls = new Set();
  sets.forEach((set, index) => {
    const expectedId = expectedSets[index].id;
    require(set.id === expectedId && !ids.has(set.id), `Falsche oder doppelte Bildset-ID: ${person.name}`);
    ids.add(set.id);
    require(set.emotes?.length === 9, `Neun Emotes erwartet: ${person.name}/${set.id}`);
    set.emotes.forEach((emote, panel) => {
      checkImage(emote, `${person.name}/${set.id}/${panel + 1}`);
      require(emote.label === expectedSets[index].labels[panel] && emote.label === model.normalizeText(emote.label, 20), `Emotelabel oder Reihenfolge weicht ab: ${person.name}`);
      require(!hashes.has(emote.sha256) && !urls.has(imageUrl(emote)), `Doppeltes Emotebild: ${person.name}`);
      hashes.add(emote.sha256); urls.add(imageUrl(emote));
    });
  });
  const imageSets = sets.map((set, index) => ({
    id: set.id, name: expectedSets[index].name,
    portrait: imageUrl(source.portrait), emotes: set.emotes.map(emote => ({ img: imageUrl(emote), label: emote.label })),
    createdAt: set.createdAt || (person.personId === 'efa-gwernant' && index ? ELEGANZ_EFA_AVATARS_AUTHORED_AT : authoredAt),
    updatedAt: set.updatedAt || (person.personId === 'efa-gwernant' ? ELEGANZ_EFA_AVATARS_AUTHORED_AT : authoredAt)
  }));
  const storage = model.prepareStorage({ imageSets, activeImageSetId: 'standard' });
  require(storage.imageSets.length === imageSets.length && storage.imageSets.every((set, index) => set.emotes.length === imageSets[index].emotes.length), `Bildbibliothek würde Inhalte verändern: ${person.name}`);
  return storage;
}
