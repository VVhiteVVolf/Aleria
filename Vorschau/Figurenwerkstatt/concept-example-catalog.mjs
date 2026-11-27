const revisedImages = new Set([
  'mared-reisekleidung', 'mared-heroldstracht', 'mared-nachtbotin',
  'celynbarth-wappen', 'celynbarth-gelynwacht', 'celynbarth-familie', 'kiesel-begleithund'
]);

export function exampleArt(filename, version = revisedImages.has(filename) ? 2 : 1) {
  return `./assets/examples/${filename}-v${version}.webp`;
}

export const exampleArtUpdates = new Map([...revisedImages].map(name => [exampleArt(name, 1), exampleArt(name)]));

function example(id, name, filename, width) {
  return { reference: Object.freeze({ type: 'draft', id, name }), image: exampleArt(filename), width };
}

export const CONCEPT_EXAMPLES = {
  character: example('muster-mared-celynbarth', 'Mared Celynbarth', 'mared-reisekleidung', 28),
  house: example('muster-haus-celynbarth', 'Haus Celynbarth', 'celynbarth-wappen', 42),
  place: example('muster-gelynwacht', 'Gelynwacht', 'celynbarth-gelynwacht', 63),
  faction: example('muster-bund-der-uferlaternen', 'Bund der Uferlaternen', 'uferlaternen-rundsiegel', 42),
  creature: example('muster-kiesel', 'Kiesel', 'kiesel-begleithund', 28),
  item: example('muster-faehrlicht-gelynwacht', 'Fährlicht von Gelynwacht', 'faehrlicht-messing', 42)
};

export const CAER_YSGELLFOR_PITCH = example(
  'pitch-caer-ysgellfor', 'Caer Ysgellfor', 'caer-ysgellfor-strassenfestung', 63
);
