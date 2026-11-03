import { EMBLEMS } from './heraldry-data.mjs';
import { WARRIORS } from './warrior-data.mjs';
import { EMBLEM_WARRIOR_DESIGNS } from './emblem-warrior-designs.mjs';

// Art directions only: these associations do not create houses, ranks or seats.
const designsByEmblem = new Map(EMBLEM_WARRIOR_DESIGNS.map(item => [item.id, item]));

export const EMBLEM_WARRIORS = Object.freeze(EMBLEMS.map(emblem => {
  const design = designsByEmblem.get(emblem.id);
  if (!design) throw Error(`Bildbeschreibung fehlt: ${emblem.id}.`);
  const paths = {
    id: emblem.id,
    emblemId: emblem.id,
    image: `assets/warriors/previews/${emblem.id}.webp`,
    original: `assets/warriors/production/${emblem.id}.png`,
    status: 'proposal',
    helmet: design.helmet,
    armor: design.armor,
    pose: design.pose,
    ageSpec: design.ageSpec ? Object.freeze({ ...design.ageSpec }) : null,
    designRevision: design.revision,
  };
  if (emblem.id === 'maghneach') return Object.freeze({
    ...paths,
    classId: null,
    className: 'Antiker Maghath-Speerkrieger',
    name: 'Antiker Maghath-Speerkrieger · Maghneach',
    role: 'Historischer Bildentwurf',
    historical: true,
    description: 'Antiker Maghath-Krieger mit Schild und Speer in den blau-weißen Farben Maghneachs. Die galatisch inspirierte Darstellung gehört zum frühen Fürstentum und behauptet keine gegenwärtige ishtaranische Klasse.',
    equipment: design.equipment,
    href: null,
    mount: null,
  });
  const classId = design.classId;
  const base = WARRIORS.find(warrior => warrior.id === classId);
  if (!base) throw Error(`Keine belegte Bildklasse für ${emblem.id}.`);
  const specialHouse = emblem.id === 'source-03';
  return Object.freeze({
    ...paths,
    classId,
    className: base.name,
    name: `${base.name} · ${emblem.name}`,
    description: specialHouse
      ? 'Besonderer Derwisch-Entwurf für Dahakid: ein schwerer zweihändiger Krummsäbel, ritterliche Brust- und Armplatten sowie ein spitzer kumanisch-persischer Helm mit geschlossenem Drachenvisier. Goldene Flügel- und Schuppenformen an den Schultern, ein höfischer Purpurmantel und eine blaue Schärpe greifen die außergewöhnliche Prägung des Hauses auf.'
      : `${base.description} ${design.revision === 3 ? 'Ein eigenständiger Bildentwurf mit traditioneller kultureller Kopfbedeckung.' : 'Ein eigenständiger Bildentwurf zum Wappen.'} Farben, Stoffe und Rüstung greifen das Wappen „${emblem.name}“ auf.`,
    role: specialHouse ? 'Derwisch mit ritterlichen Elementen' : base.role,
    equipment: design.equipment,
    href: base.href,
    mount: design.mount ? Object.freeze({ ...design.mount }) : base.mount,
  });
}));
