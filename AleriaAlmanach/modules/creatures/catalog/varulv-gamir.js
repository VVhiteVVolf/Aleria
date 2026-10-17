import { createHouseholdCompanion } from './household-companion-profiles.js?v=20261017-varulv-v1';

export const SLEIPNIR_VARULV_ID = 'person--haus-varulv--sleipnir-varulv';
const PORTRAITS = '/AleriaAlmanach/assets/companions/haus-varulv/';
const DOGS = [
  { slug: 'trygg', name: 'Trygg', sex: 'Rüde', age: 11, level: 4,
    personality: 'Ruhig, erfahren, durchsetzungsfähig und loyal.',
    appearance: 'Großer, kräftiger Gamir mit dichtem schwarzgrauem Fell, cremefarbenen Abzeichen, bernsteinfarbenem Blick und buschig gerollter Rute. Eine alte verheilte Narbe zieht sich über ein Auge.' },
  { slug: 'yr', name: 'Yr', sex: 'Hündin', age: 3, level: 2,
    personality: 'Wachsam, aufmerksam und ruhig.',
    appearance: 'Schlanke schwarzgraue Gamir-Hündin mit heller Schnauze und Brust, bernsteinfarbenen Augen und aufrechten Ohren. Geschlossener Fang und ruhiger, wachsamer Blick.' },
  { slug: 'skar', name: 'Skar', sex: 'Rüde', age: 4, level: 3,
    personality: 'Selbstbewusst, durchsetzungsfähig und mutig.',
    appearance: 'Kräftiger schwarzgrauer Gamir-Rüde mit breiten cremefarbenen Wangen, hellen Brauen und bernsteinfarbenen Augen. Aufrechte Ohren und ein selbstsicherer, offener Ausdruck.' },
  { slug: 'fenja', name: 'Fenja', sex: 'Hündin', age: 4, level: 3,
    personality: 'Schnell, fokussiert und jagdeifrig.',
    appearance: 'Schlanke, langbeinige schwarzgraue Gamir-Hündin mit schmaler heller Schnauze, heller Kehle und Brust. Aufrechte Ohren und konzentrierter bernsteinfarbener Blick.' },
  { slug: 'bjoern', name: 'Björn', sex: 'Rüde', age: 5, level: 3,
    personality: 'Kräftig, gelassen und zuverlässig.',
    appearance: 'Breit gebauter, dicht behaarter Gamir-Rüde mit dunklem Rücken und Kopf, cremefarbenen Wangen und kräftiger heller Brust. Breiter Fang, bernsteinfarbene Augen und gelassene Haltung.' },
  { slug: 'ljosa', name: 'Ljósa', sex: 'Hündin', age: 3, level: 2,
    personality: 'Aufmerksam, anhänglich und freundlich zu Vertrauten.',
    appearance: 'Heller gezeichnete Gamir-Hündin mit graubraunem Rücken, breiter cremefarbener Gesichtszeichnung, heller Brust und buschiger Rute. Warme bernsteinfarbene Augen und freundlicher offener Fang.' },
  { slug: 'hroth', name: 'Hroth', sex: 'Rüde', age: 2, level: 2,
    personality: 'Ehrgeizig, temperamentvoll und lernbegierig.',
    appearance: 'Junger schwarzgrauer Gamir-Rüde mit markanter dunkler Gesichtsmaske, hellen Brauen, Wangen und Brust. Lebhafter bernsteinfarbener Blick und temperamentvoller offener Fang.' },
  { slug: 'skadi', name: 'Skadi', sex: 'Hündin', age: 2, level: 2,
    personality: 'Wendig, neugierig und mutig.',
    appearance: 'Junge, wendige Gamir-Hündin mit heller cremefarbener Gesichtszeichnung, graubrauner Kopfkappe und dunklerem Rücken. Große aufrechte Ohren, bernsteinfarbene Augen und neugieriger offener Ausdruck.' },
  { slug: 'njoer', name: 'Njör', sex: 'Rüde', age: 1, level: 1,
    personality: 'Noch jung und verspielt; lernt von den Älteren.',
    appearance: 'Junger Gamir-Rüde mit weichem graubraunem Fell, cremefarbenen Wangen und Brust sowie bernsteinfarbenen Augen. Große aufrechte Ohren, noch jugendlicher Körperbau und fröhlich geöffneter Fang.' },
  { slug: 'varga', name: 'Varga', sex: 'Hündin', age: 1, level: 1,
    personality: 'Aufmerksam und vorsichtig; bindet sich schnell.',
    appearance: 'Junge dunkelgraue Gamir-Hündin mit schmaler heller Zeichnung auf der Stirn, cremefarbener Schnauze und Brust, bernsteinfarbenen Augen und großen aufrechten Ohren. Vorsichtiger geschlossener Fang.' }
];

function createVarulvGamir(spec) {
  const assigned = spec.slug === 'trygg';
  const assignment = assigned
    ? 'Sleipnir Varulvs ständiger Begleiter und Vater der übrigen neun Gamir.'
    : 'Haustier und Begleiter des Clans Varulv, ein Nachkomme Tryggs. Die persönliche Zuordnung zu den Varulv-Kindern erfolgt später.';
  const description = `${spec.name} ist ein ${spec.age} Jahre alter Gamir (${spec.sex}). ${spec.personality} ${assignment}`;
  const creature = createHouseholdCompanion({
    profile: 'dog', slug: spec.slug, name: spec.name, ownerSlug: assigned ? 'sleipnir' : 'varulv',
    ownerId: assigned ? SLEIPNIR_VARULV_ID : '', ownerName: assigned ? 'Sleipnir Varulv' : 'Clan Varulv',
    species: 'Gamir', level: spec.level, location: 'Rorikshall', house: 'Clan Varulv',
    habitat: 'Rorikshall, Rorikstal, Roriksheim, Aldrimar',
    portrait: `${PORTRAITS}${spec.slug}.png`, description, bonds: assignment
  });
  return {
    ...creature,
    // Clan membership is not personal inventory ownership. Assignment stays open.
    itemOrigin: assigned ? creature.itemOrigin : null,
    bestiaryReference: { id: 'tiere/vieh/haustiere/hunde/gamir' },
    portraitCaption: `${spec.name} · Gamir · Clan Varulv`,
    biography: {
      ...creature.biography, appearance: spec.appearance, personality: spec.personality,
      history: assigned ? 'Vater von Yr, Skar, Fenja, Björn, Ljósa, Hroth, Skadi, Njör und Varga.' : `Trygg ist ${spec.name}s Vater.`,
      facts: [...creature.biography.facts,
        { label: 'Rasse', value: 'Gamir' }, { label: 'Geschlecht', value: spec.sex },
        { label: 'Alter', value: `${spec.age} Jahre` }, { label: 'Clan', value: 'Clan Varulv' },
        { label: 'Persönliche Zuordnung', value: assigned ? 'Sleipnir Varulv' : 'Noch offen; später zu den Varulv-Kindern' }],
      connections: assigned
        ? [{ type: 'connection', name: 'Sleipnir Varulv', image: '/Stammbäume/assets/images/portraits/haus-varulv/sleipnir-varulv.png', detail: 'Besitzer und ständiger Gefährte.' }]
        : [{ type: 'connection', name: 'Trygg', image: `${PORTRAITS}trygg.png`, detail: 'Vater; ständiger Begleiter von Sleipnir Varulv.' }]
    }
  };
}

export const VARULV_GAMIR = Object.freeze(DOGS.map(createVarulvGamir));
