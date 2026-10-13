import { createHouseholdCompanion } from './household-companion-profiles.js?v=20261012-ship-cats-v1';

export const TREVOR_CHARACTER_ID = '0Sku8euk5jhlWebdsskI';
const ART = '/AleriaAlmanach/assets/ship-crews/idwals-schiffsmannschaft/companions';
const owner = {
  ownerSlug: 'trevor', ownerId: TREVOR_CHARACTER_ID, ownerName: 'Trevor Gwyvern',
  profile: 'cat', species: 'Cenyric-Kater', level: 2,
  location: 'Tiefenwyrm', habitat: 'An Bord der Tiefenwyrm'
};

const cats = [
  {
    slug: 'bwmbo', name: 'Bwmbo', portrait: `${ART}/bwmbo.png`,
    description: 'Trevors frecher Cenyric-Schiffskater: orange getigert mit weißem Bauch, mächtigem Backenbart und zerzaustem Stirnschopf. Er ruht gelassen auf einer Kiste, bleibt dabei wachsam und selbstbewusst.',
    appearance: 'Kräftiges orangefarbenes Tigerfell; weißer Bauch, Brust und Pfoten. Blaue Augen, breite weiße Backenbüschel, orangefarbener Kinnbart und ein auffälliger zerzauster Stirnschopf.',
    personality: 'Frech, eigenwillig und selbstsicher. Rustikal und etwas zerzaust; auch in einer gelassenen Ruhepose aufmerksam und jederzeit munter.',
    history: 'Bwmbo gehört Sir Trevor Gwyvern und lebt mit ihm an Bord der Tiefenwyrm.',
    traits: [
      { title: 'Frecher Blick', detail: 'Begegnet seiner Umgebung mit wachem, selbstbewusstem Blick.' },
      { title: 'Backenbart & Stirnschopf', detail: 'Seine breiten weißen Backenbüschel und der zerzauste Schopf machen ihn unverwechselbar.' }
    ]
  },
  {
    slug: 'uffel', name: 'Uffel', portrait: `${ART}/uffel.png`,
    description: 'Alter, zäher Cenyric-Schiffskater mit verblasstem orangefarbenem Tigerfell, weißem Bauch und ausgeprägter Mähne. Ein Auge ist trüb. Uffel war schon an Bord, als Idwals Mannschaft die Tiefenwyrm übernahm, und ist einfach geblieben. Er ist der Bordkater der gesamten Mannschaft und gehört niemandem persönlich.',
    scores: [3, 14, 12, 3, 14, 10],
    appearance: 'Verblasstes orangefarbenes Tigerfell mit weißen Partien an Bauch, Brust und Pfoten. Kantiges Gesicht, breite helle Mähne und aufrechter, stolzer Stand. Sein rechtes Auge ist milchig-trüb, das linke bernsteinfarben.',
    personality: 'Alt, zäh, abgesotten und stoisch. Bleibt gelassen und steht stolz; ein vertrauter Bewohner des Schiffes mit eigenem Willen.',
    history: 'Uffel lebte bereits auf der Tiefenwyrm, als Idwal und seine Mannschaft das Schiff bekamen. Er blieb einfach an Bord und ist heute der Bordkater der gesamten Mannschaft. Er hat keinen persönlichen Besitzer.',
    traits: [
      { title: 'Abgesottener Bordveteran', detail: 'Ein alter, stolzer Kater, der sich vom Leben auf See nicht leicht beeindrucken lässt.' },
      { title: 'Trübes Auge & Mähne', detail: 'Das milchig-trübe Auge und die ausgeprägte helle Mähne sind seine auffälligsten Merkmale.' }
    ]
  }
];

export const IDWAL_SHIP_CATS = cats.map(spec => {
  const creature = createHouseholdCompanion({ ...owner, ...spec });
  const isCrewCat = spec.slug === 'uffel';
  if (isCrewCat) creature.itemOrigin = null;
  creature.portraitCaption = `${spec.name} · Schiffskater der Tiefenwyrm`;
  creature.biography = {
    ...creature.biography,
    appearance: spec.appearance, personality: spec.personality, history: spec.history,
    bonds: isCrewCat ? 'Bordkater der gesamten Mannschaft der Tiefenwyrm. Kein persönlicher Besitzer.' : 'Herrchen: Sir Trevor Gwyvern. Gehört zu den Schiffskatzen von Idwals Mannschaft auf der Tiefenwyrm.',
    habits: 'Lebt an Bord der Tiefenwyrm. Als Cenyric-Schiffskatze jagt er Mäuse und anderes Ungeziefer und sucht vertraute Ruheplätze an Deck.',
    facts: [
      { label: 'Rasse', value: 'Cenyric' }, { label: 'Geschlecht', value: 'Kater' },
      { label: 'Rolle', value: 'Schiffskatze' }, { label: isCrewCat ? 'Zugehörigkeit' : 'Herrchen', value: isCrewCat ? 'Gesamte Mannschaft; kein persönlicher Besitzer' : 'Sir Trevor Gwyvern' },
      { label: 'Heimat', value: 'Tiefenwyrm' }
    ],
    traits: spec.traits,
    connections: [{ type: 'connection', name: isCrewCat ? 'Mannschaft der Tiefenwyrm' : 'Sir Trevor Gwyvern', detail: isCrewCat ? 'Vertraute Schiffsgemeinschaft; Uffel gehört niemandem persönlich.' : 'Herrchen · Erster Maat der Tiefenwyrm' }]
  };
  return creature;
});
