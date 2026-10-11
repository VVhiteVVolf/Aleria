import { createHouseholdCompanion } from './household-companion-profiles.js?v=20261011-household-v1';

const OWNERS = {
  galahad: ['person--haus-draig--galahad-draig', 'Galahad Draig'],
  tegan: ['fklEm9zDR9y1LuCaXeeb', 'Tegan Draig'],
  gwendolyn: ['15ml9RhSvJPXof7z4qY3', 'Gwendolyn Draig'],
  maredudd: ['ZGiDqxIwkkvOHzpnKmyk', 'Maredudd Draig'],
  tudwal: ['fcNfoBWpVNvK3ORQUJwX', 'Tudwal Draig'],
  cadfan: ['hTN74LdJjXUFz7X7ReRr', 'Cadfan Draig'],
  meurig: ['E8HXkgi2kdkXaqkxrnRo', 'Meurig Draig'],
  heledd: ['J4wpNQON98GsdPzsaIUk', 'Heledd (Geb. Gwyvern) Draig'],
  einion: ['27fN2uvUpVVNICNc4vQU', 'Einion Draig'],
  steffan: ['93PwKnPytHr0sOc9mNHi', 'Steffan Draig'],
  rhiannon: ['y7MBxDiAaesbWHBtmw5Q', 'Rhiannon Draig'],
  mair: ['avZbi5bD7DFcx6XtefJ4', 'Mair Draig'],
  oweta: ['vk0xAa3ZcEhVvGC1CzNq', 'Oweta Draig'],
  guinevere: ['person--haus-neidr--guinevere-neidr', 'Guinevere Neidr']
};

const ANIMALS = [
  { owner: 'galahad', slug: 'sturmwind', name: 'Sturmwind', species: 'Drake-Pferd', profile: 'horse', level: 3, portrait: 'https://dieweltvonaleria.netlify.app/AleriaAlmanach/public/assets/companions/sturmwind-galahad.png', scores: [18, 16, 16, 3, 13, 12], description: 'Ein Drake aus Baldreska. Galahad hat ihn auf seinen Reisen als Ritter der Tafelrunde erstanden, nachdem sein erstes Pferd gestorben war.' },
  { owner: 'tegan', slug: 'alaw', name: 'Alaw', species: 'Rhyfel-Pferd', profile: 'horse', level: 2, image: 'Frc3apc.jpeg', description: 'Tegans Rhyfel.' },
  { owner: 'tegan', slug: 'twm', name: 'Twm', species: 'Brodgi-Haushund', profile: 'lapdog', level: 1, image: 'QzubwXw.jpeg', description: 'Der Brodgi von Tegan Draig. Er liebt Musik.' },
  { owner: 'gwendolyn', slug: 'olwen', name: 'Olwen', species: 'Rotmilan', profile: 'kite', level: 1, image: '4CNNfEa.png', scores: [3, 12, 8, 2, 16, 8], movement: 12, description: 'Der erste Rotmilan von Gwendolyn. Mittlerweile ziemlich alt und kurz vor dem Ende. Sie fliegt kaum noch. Aber wenn, dann zeigt sie, was sie noch drauf hat. Sie sitzt meistens auf dem Balkon von Gwendolyn und Galahad.', bonds: 'Gwendolyns erster Rotmilan; Mutter von Alwen.' },
  { owner: 'gwendolyn', slug: 'alwen', name: 'Alwen', species: 'Rotmilan', profile: 'kite', level: 2, image: 'ISKbqc2.png', description: 'Gwendolyns zweiter Milan. Tochter ihres ersten Milans, Olwen. Noch voller Energie; fliegt den halben Tag über der Burg herum.', bonds: 'Gwendolyns Rotmilan; Tochter von Olwen.' },
  { owner: 'gwendolyn', slug: 'flam', name: 'Flam', species: 'Ceffyl-Pferd', profile: 'horse', level: 3, image: '55FbPYH.jpeg', description: 'Das Ceffyl von Gwendolyn Draig. Ein herrisches Pferd. War schon bei den Rittern der Tafelrunde dabei.' },
  { owner: 'maredudd', slug: 'cadarn', name: 'Cadarn', species: 'Ceffyl-Pferd', profile: 'horse', level: 3, image: 'A9eCwvp.jpeg', description: 'Das Ceffyl von Sir Maredudd. Ein treuer Begleiter seit über 40 Jahren.' },
  { owner: 'maredudd', slug: 'hari', name: 'Hari', species: 'Wachhund', profile: 'dog', level: 3, image: 'asGrolJ.png', scores: [14, 12, 14, 3, 14, 8], description: 'Sir Maredudds Hund. Er liegt meistens in seinem Gemach und lässt niemanden bewaffnet dort herein. Nicht einmal Maredudd.', abilities: [['Wachsamer Türhüter', 'Bewacht Maredudds Gemach und meldet bewaffnete Besucher mit Knurren und Bellen.']] },
  { owner: 'tudwal', slug: 'ceiniog', name: 'Ceiniog', species: 'Rhyfel-Pferd', profile: 'horse', level: 2, image: 'hjWBWQN.jpeg', description: 'Tudwals Rhyfel. Ein gutes und loyales Pferd.' },
  { owner: 'tudwal', slug: 'pryderi', name: 'Pryderi', species: 'Pfau', profile: 'peacock', level: 1, image: 'HhtmeUx.jpeg', habitat: 'Garten der Draigs, Celtigerns Wacht', description: 'Ein Pfau, den Tudwal eigentlich seiner zukünftigen Frau zur Verlobung geschenkt hat. Diese hat ihn allerdings im Garten der Draigs gelassen für „Später“. Pryderi sorgt ständig für Tudwals Kopfschmerzen.', bonds: 'Tudwal kümmert sich im Garten der Draigs um das Verlobungsgeschenk für seine zukünftige Frau.' },
  { owner: 'cadfan', slug: 'ciaran', name: 'Cíaran', species: 'Hund', profile: 'dog', level: 2, image: 'TZK9oBa.png', description: 'Cadfans Hund. Ein Geschenk der Familie seiner Frau.' },
  { owner: 'cadfan', slug: 'donn', name: 'Donn', species: 'Tirashan-Pferd', profile: 'horse', level: 3, image: 'EDPyiua.jpeg', scores: [16, 14, 16, 2, 14, 10], description: 'Cadfans zweites Pferd. Ebenfalls ein Geschenk der Familie seiner Frau. Ein Tirashan.' },
  { owner: 'meurig', slug: 'emrys', name: 'Emrys', species: 'Ceffyl-Pferd', profile: 'horse', level: 1, image: 'DVqEI6P.jpeg', scores: [12, 10, 10, 2, 14, 12], movement: 12, description: 'Sir Meurigs Ceffyl. Ein altes Pferd in seinen letzten Jahren.' },
  { owner: 'heledd', slug: 'mabli', name: 'Mabli', species: 'Skjarn-Katze', profile: 'cat', level: 2, image: 'twMU1E2.png', description: 'Die Katze von Sir Meurigs Frau Heledd. Eine Skjarn. Sie terrorisiert Meurig regelmäßig.', bonds: 'Gehört Heledd (geb. Gwyvern) Draig, der Ehefrau von Sir Meurig Draig.' },
  { owner: 'einion', slug: 'greif', name: 'Greif', species: 'Rhyfel-Pferd', profile: 'horse', level: 2, image: 'wisnmUi.jpeg', description: 'Das Rhyfel von Einion. Er ist oft genervt von Einion und lässt es ihn spüren.' },
  { owner: 'steffan', slug: 'guto', name: 'Guto', species: 'Ponter-Wachhund', profile: 'dog', level: 3, image: 'oVaZlbK.jpeg', description: 'Steffans Ponter.', abilities: [['Wachhund', 'Achtet auf unbekannte Geräusche und Annäherungen und warnt durch Bellen.']] },
  { owner: 'steffan', slug: 'uther', name: 'Uther', species: 'Ceffyl-Pferd', profile: 'horse', level: 3, image: 'oS0eJUM.jpeg', description: 'Steffans Pferd. Ein Geschenk der Familie seiner Frau. Ein besonderes Ceffyl.' },
  { owner: 'rhiannon', slug: 'mel', name: 'Mél', species: 'Rhyfel-Pferd', profile: 'horse', level: 2, image: 'VpNVrlU.jpeg', description: 'Rhiannons Rhyfel.' },
  { owner: 'mair', slug: 'nia', name: 'Nia', species: 'Bugail-Hund', profile: 'dog', level: 2, image: '8zwFlVG.png', description: 'Der Bugail von Mair Draig. Immer an ihrer Seite.' },
  { owner: 'mair', slug: 'tiwlip', name: 'Tiwlip', species: 'Ceffyl-Pferd', profile: 'horse', level: 2, image: 'DoJ1txs.jpeg', description: 'Eigentlich das Ceffyl von Rhonwen Draig, der Mutter von Mair. Tiwlip steht für die Liebe der Mutter zu Tulpen und Blumen im Allgemeinen. Sie akzeptiert Mair nicht nur. Sie bestand darauf, ihr Pferd zu werden.', bonds: 'Früher Rhonwen Draigs Ceffyl; hat sich selbst Mair als neue Reiterin gewählt.' },
  { owner: 'oweta', slug: 'heulwen', name: 'Heulwen', species: 'Rhyfel-Pferd', profile: 'horse', level: 2, image: 'IQPGIq7.jpeg', description: 'Das Rhyfel von Oweta.' },
  { owner: 'guinevere', slug: 'scath', name: 'Scath', species: 'Tryw-Jagdhündin', profile: 'dog', level: 3, image: 'oofN4OQ.jpeg', description: 'Guineveres Tryw-Jagdhündin. Benannt nach Scathach.', abilities: [['Jagdbegleiterin', 'Folgt Wildfährten und arbeitet bei der Jagd mit ihrer vertrauten Führerin zusammen.']] }
];

export const DRAIG_HOUSEHOLD_COMPANIONS = ANIMALS.map(spec => createHouseholdCompanion({ ...spec, ownerSlug: spec.owner, ownerId: OWNERS[spec.owner][0], ownerName: OWNERS[spec.owner][1] }));
