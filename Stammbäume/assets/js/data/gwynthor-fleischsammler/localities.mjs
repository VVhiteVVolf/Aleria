// Public geography and trades only. Family histories own personal circumstances.
export const FLEISCHSAMMLER_MAP_ID = 'cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis';
const crestRoot = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/fleischsammler';

const localities = [
  { id: 'caer-ysgellfor', pinId: 'gwynthor-marking-091', placeName: 'Caer Ysgellfor', families: [['ysgellfor', 'Ysgellfor']],
    description: 'Kleine Straßenfestung und Sammelstelle für Getreide und Vorräte auf dem Weg nach Gwynthor; schützt die umliegenden Höfe.' },
  { id: 'jagdhaus-helfaen', pinId: 'gwynthor-marking-115', placeName: 'Jagdhaus Helfaen', families: [['helfaen', 'Helfaen']],
    description: 'Kleines Jagdhaus einer Familie, die vor allem Kleinwild erlegt und für den örtlichen Bedarf verarbeitet.' },
  { id: 'marchwern-gestuet', pinId: 'gwynthor-marking-092', placeName: 'Marchwern-Gestüt', families: [['marchwern', 'Marchwern']],
    description: 'Wichtige Rosszucht für Gwynthor. Die Betreiber dienen unmittelbar Haus Wyrm und stellen gute Reitpferde bereit, darunter Ceffyl und Rhyfel.' },
  { id: 'tirfelyn-hof', pinId: 'gwynthor-marking-107', placeName: 'Tirfelyn-Hof', families: [['tirfelyn', 'Tirfelyn']],
    description: 'Bedeutender familiengeführter Versorger Gwynthors mit Vieh, Getreide und Gemüse.' },
  { id: 'dolweth-kate', pinId: 'gwynthor-marking-118', placeName: 'Dolweth-Kate', families: [['dolweth', 'Dolweth']],
    description: 'Kleine ländliche Kate mit wenigen eigenen Viehbeständen; der bescheidene Haushalt trägt zur örtlichen Versorgung bei.' },
  { id: 'brynial-kate', pinId: 'gwynthor-marking-086', placeName: 'Brynial-Kate', families: [['brynial', 'Brynial']],
    description: 'Unscheinbarer Landhaushalt mit etwas Ackerbau und wenigen Tieren im östlichen Umland Gwynthors.' },
  { id: 'brauerhof-bragwen-eiddfer', pinId: 'gwynthor-marking-074', placeName: 'Brauerhof Bragwen & Eiddfer', families: [['bragwen', 'Bragwen'], ['eiddfer', 'Eiddfer']],
    description: 'Gemeinsamer Brauerhof zweier verschwägerter Familien, die mit der Teyrngarch Brauerzunft zusammenarbeiten und Gwynthor mit deren Bier versorgen.' }
];

export const FLEISCHSAMMLER_FAMILIES_INDEX = Object.freeze(localities.flatMap(place => place.families.map(([slug, surname]) => Object.freeze({
  slug, familyId: `haus-${slug}`, surname, emblem: `${crestRoot}/haus-${slug}.png`,
  pinId: place.pinId, placeName: place.placeName, description: place.description
}))));

export const FLEISCHSAMMLER_LOCALITIES = Object.freeze(localities.map(({ families, ...place }) => Object.freeze({
  ...place, familyIds: Object.freeze(families.map(([slug]) => `haus-${slug}`))
})));

export function fleischsammlerFamilyLocality(slug) {
  const entry = FLEISCHSAMMLER_FAMILIES_INDEX.find(family => family.slug === slug);
  if (!entry) throw new Error(`Unbekannte Gwynthorer Familie: ${slug}`);
  return entry;
}
