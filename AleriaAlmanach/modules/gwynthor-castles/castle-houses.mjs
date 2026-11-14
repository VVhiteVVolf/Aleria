import { GWYNTHOR_CITY_PATH } from '../gwynthor-geography/gwynthor-section-layout.mjs';

export const CASTLE_ASSET_ROOT = './assets/gwynthor-castles/2026-11-14';
const crest = house => `../Stammbäume/assets/images/houses/Llamreis Ankunft/haus-${house}.png`;
export const CASTLE_HOUSES = Object.freeze([
  { id: 'gafyr', title: 'Castell Gafyr', houseId: 'haus-gafyr', symbol: crest('gafyr'),
    location: 'Ebener Stadtgrund in Gwynthor, mit dem Rücken zum Gebirge',
    character: 'Bodenständige Stadtburg · Treue, Wald und Erz',
    palette: 'Schwarz und Gold · zwei einander zugewandte gehörnte Ziegen',
    architecture: 'A broad grounded medieval Cenyrian castle on FLAT terrain inside the city of Gwynthor. Grey mountains rise BEHIND the rear curtain wall, but the castle itself is NOT on a hill, cliff or mountain. Warm grey dressed stone, broad low courtyard ranges, dark oak, modest gold knotwork. A sturdy square keep rises within the walls. Practical dignified architecture, not a royal palace.',
    heraldry: 'GAFYR: black banners with TWO mirrored golden horned goats facing inward, as in reference image 2, gold knotwork edging. Black and gold textiles. The paired goats are the actual crest; a horned helmet is only a secondary historical decorative motif. No dragon emblem.',
    source: 'Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gafyr/haus.content.mjs' },
  { id: 'saethwyr', title: 'Castell Saethwyr', houseId: 'haus-saethwyr', symbol: crest('saethwyr'),
    location: 'Unmittelbar am Hafen Gwynthors, mit eigenem Burghafen',
    character: 'Hafenburg · Seefahrt, Werften und Küstenschutz',
    palette: 'Goldgelb und Schwarz · schwarzer Drache über hellen Wellen',
    architecture: 'A compact medieval Cenyrian waterfront castle immediately beside the working harbor of Gwynthor. Pale salt-weathered limestone, dark timber, low slate roofs, strong square keep. Its OWN small sheltered harbor basin and stone quay are enclosed beside the seaward wall, directly connected to a water gate. Harbor masts and the sea beyond, not an isolated island or a mountain fortress.',
    heraldry: 'SAETHWYR: golden yellow banners carrying a BLACK winged sea-dragon above pale silver/ivory stylized WAVES, matching reference image 2. Black and golden-yellow textiles with subtle wave borders. Maritime details may use timber, rope and weathered metal; do not substitute a blue nautical crest, an anchor or a trident for the actual dragon-and-waves emblem.',
    source: 'Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Saethwyr/haus.content.mjs' },
  { id: 'wyrm', title: 'Castell Wyrm', houseId: 'haus-wyrm', symbol: crest('wyrm'),
    location: 'Am Südufer des Flusses durch Gwynthor, über eine Zugbrücke erreichbar',
    character: 'Flussburg · Reitkunst und höfische Rittertradition',
    palette: 'Rot, Gold und Schwarz · schwarzer geflügelter Wyrm',
    architecture: 'A medieval Cenyrian river castle on the SOUTH BANK of the river running through the city of Gwynthor. The city lies across the water to the north. The main approach crosses a stone river bridge whose FINAL SHORT SPAN is a working timber DRAWBRIDGE at the castle gate, with real chains and overhead lifting beams. River water beside the castle walls. Pale grey stone, dark carved oak, slate roofs, a tall square keep and elegant restrained courtly details. Not a sea fortress or a castle on an isolated island.',
    heraldry: 'WYRM: a BLACK winged long-necked dragon/wyrm on a GOLD central field flanked by RED vertical fields, matching reference image 2. Red-and-gold cloth, black carved details and restrained gold borders. Preserve all three house colors; no blue nautical motifs and no goats.',
    source: 'Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Wyrm/haus.content.mjs' }
].map(house => Object.freeze({ ...house, path: Object.freeze([...GWYNTHOR_CITY_PATH, house.title]) })));

export const CASTLE_AREAS = Object.freeze([
  { id: 'innenhof', title: 'Innenhof & Anlagen', subtitle: 'Burghof, Stallungen, Garten und Übungsplatz' },
  { id: 'ratskammern', title: 'Ratskammern', subtitle: 'Gemeinsamer Ratssaal und Amtskammer' },
  { id: 'bergfried', title: 'Bergfried', subtitle: 'Wachhalle, Thronsaal und gemeinsamer Esssaal' },
  { id: 'burghafen', title: 'Eigener Burghafen', subtitle: 'Wassertor, Kai und geschütztes Hafenbecken' }
]);
