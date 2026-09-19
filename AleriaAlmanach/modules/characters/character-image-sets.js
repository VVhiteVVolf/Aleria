// Classic-script compatibility for the shared image-library model.
const CHARACTER_IMAGE_SET_SCHEMA_VERSION = 1;
const CHARACTER_IMAGE_SET_DEFAULT_ID = 'standard';
const CHARACTER_IMAGE_SET_LIMIT = 20;
const CHARACTER_IMAGE_SET_NAME_LIMIT = 60;
const CHARACTER_IMAGE_SET_EMOTE_LIMIT = 80;

function normalizeCharacterImageSetText(...args) { return globalThis.AleriaCharacterImageSets.normalizeText(...args); }
function normalizeCharacterImageSetImageUrl(...args) { return globalThis.AleriaCharacterImageSets.normalizeImageUrl(...args); }
function normalizeCharacterImageSetId(...args) { return globalThis.AleriaCharacterImageSets.normalizeId(...args); }
function normalizeCharacterImageSetEmotes(...args) { return globalThis.AleriaCharacterImageSets.normalizeEmotes(...args); }
function createCharacterImageSetId(...args) { return globalThis.AleriaCharacterImageSets.createId(...args); }
function normalizeCharacterImageSetRecord(...args) { return globalThis.AleriaCharacterImageSets.normalizeRecord(...args); }
function normalizeCharacterImageSets(...args) { return globalThis.AleriaCharacterImageSets.normalize(...args); }
function getCharacterImageSet(...args) { return globalThis.AleriaCharacterImageSets.get(...args); }
function getCharacterImageSetPresentation(...args) { return globalThis.AleriaCharacterImageSets.getPresentation(...args); }
function applyCharacterImageSetPresentation(...args) { return globalThis.AleriaCharacterImageSets.applyPresentation(...args); }
function buildCharacterImageSetStorage(...args) { return globalThis.AleriaCharacterImageSets.buildStorage(...args); }
function buildCharacterImageLibraryStorage(...args) { return globalThis.AleriaCharacterImageSets.prepareStorage(...args); }
