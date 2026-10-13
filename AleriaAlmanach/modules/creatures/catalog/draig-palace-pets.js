import { createHouseholdCompanion } from './household-companion-profiles.js?v=20261013-wolfshorn-v1';
import { DRAIG_RIDING_OWNER_IDS } from './draig-riding-horses.js?v=20261013-draig-horses-v2';

export const MYRDDIN_CAT_ID = 'TTi084whHoSwVfIO6lsa';
export const MYRDDIN_CHARACTER_ID = 'ujMjNxdOs1pnR2jGNus4';
export const PALACE_CAT_FEUD = 'Fürstin Pompösa von Samtpfote führt einen erbitterten Kleinkrieg gegen die vermeintliche Tyrannei von Bethy, auch Betty genannt, Myrddins Katze. Beide können sich auf Teufel komm raus nicht leiden; Begegnungen führen regelmäßig zu Fauchen, Revierstreit und Katzenkrieg.';

const pompoesa = createHouseholdCompanion({
  slug: 'pompoesa', name: 'Fürstin Pompösa von Samtpfote', ownerSlug: 'isobel',
  ownerId: DRAIG_RIDING_OWNER_IDS.isobel, ownerName: 'Isobel Draig',
  profile: 'cat', species: 'Lethin-Katze', level: 2, scores: [6, 14, 12, 3, 14, 16],
  house: 'Haus Draig', portrait: '/AleriaAlmanach/assets/companions/haus-draig/pompoesa.png',
  description: 'Isobels vollkommen verwöhnte Lethin-Katze: Fürstin Pompösa von Samtpfote. Langhaarig, dunkel und stattlich, mit goldenen Augen und einem kleinen Herzhalsband. Sie pflegt ihr Fell mit großer Hingabe auf ihrem Samtkissen. ' + PALACE_CAT_FEUD
});
pompoesa.size = 'Klein';
pompoesa.biography = {
  ...pompoesa.biography,
  appearance: 'Kräftiger, eleganter Körper mit tiefdunklem langem Fell, üppigem Halskragen und goldenen Augen. Weinrotes Halsbändchen mit kleinem herzförmigem Anhänger; ein weiches weinrotes Samtkissen ist ihr bevorzugter Ruheplatz.',
  personality: 'Maßlos verwöhnt, eitel und von der eigenen fürstlichen Würde überzeugt. Erwartet Ruhe, Komfort und Aufmerksamkeit zu ihren Bedingungen.',
  bonds: 'Besitzerin und vertraute Bezugsperson: Isobel Draig. Unversöhnliche Rivalin von Bethy, Myrddins Katze.',
  habits: 'Putzt sich ausgiebig auf ihrem Samtkissen und beansprucht die bequemsten Plätze. Mit Bethy gibt es ständig Krieg.',
  facts: [{ label: 'Rasse', value: 'Lethin' }, { label: 'Geschlecht', value: 'Katze' }, { label: 'Besitzerin', value: 'Isobel Draig' }],
  sections: [{ title: 'Krieg gegen Bethys Tyrannei', text: PALACE_CAT_FEUD }],
  connections: [
    { type: 'connection', name: 'Isobel Draig', detail: 'Besitzerin und vertraute Bezugsperson.' },
    { type: 'connection', name: 'Bethy (Betty)', image: 'https://i.imgur.com/0rL26lF.png', detail: 'Myrddins Katze und erklärte Erzfeindin. Beide können einander nicht ausstehen.' }
  ]
};

const roisin = createHouseholdCompanion({
  slug: 'roisin', name: 'Roisin', ownerSlug: 'carys', ownerId: DRAIG_RIDING_OWNER_IDS.carys, ownerName: 'Carys Draig',
  profile: 'dog', species: 'Trywydd–Rhedwyr-Mischling', level: 3, scores: [12, 16, 12, 3, 16, 10], movement: 15,
  house: 'Haus Draig', portrait: '/AleriaAlmanach/assets/companions/haus-draig/roisin.png',
  description: 'Roisin, gerufen Rosi, ist Carys Draigs aufmerksamer Jagdhund aus Trywydd und Rhedwyr. Rauhaarig, langbeinig und schlank, mit tiefer Brust und kräftigen Schultern. Benannt nach Carys’ Großmutter mütterlicherseits, Roisin Cumhail, der Mutter von Wynonna Fiachrach.',
  abilities: [['Auf Distanz geführt', 'Reagiert auf vertraute Ruf-, Pfeif- und Handzeichen von Carys. Sicht, Entfernung und Ablenkung beeinflussen die Verständigung; außergewöhnliche Situationen verlangen passende Proben.']]
});
roisin.bestiaryAncestry = {
  references: [{ id: 'tiere/vieh/haustiere/hunde/trywydd' }, { id: 'tiere/vieh/haustiere/hunde/rhedwyr' }],
  notes: 'Mischling aus Trywydd und Rhedwyr; keine eigenständige benannte Zuchtrasse.'
};
roisin.biography = {
  ...roisin.biography,
  appearance: 'Graubraunes raues Fell mit dunklerem Rücken und hellen Partien an Brust, Maul und Pfoten. Langer schmaler Fang, kleiner struppiger Bart, gekippte Ohren und bernsteinbraune Augen. Lange Beine, tiefe Brust, aufgezogener Bauch und kräftige Schultern. Schlichtes braunes Lederhalsband.',
  personality: 'Aufmerksam, klug und ausdauernd. Wartet konzentriert auf Carys’ Zeichen und bewahrt sich einen eigenständigen Jagdverstand.',
  history: 'Trywydd und Rhedwyr prägen Roisins Abstammung. Carys benannte ihren Jagdhund nach Roisin Cumhail, ihrer Großmutter mütterlicherseits: Roisin ist Wynonna Fiachrachs Mutter, Wynonna wiederum Carys’ Mutter.',
  bonds: 'Besitzerin und Jagdgefährtin: Carys Draig. Namenspatin: Roisin Cumhail.',
  facts: [{ label: 'Rufname', value: 'Rosi' }, { label: 'Abstammung', value: 'Trywydd × Rhedwyr' }, { label: 'Namenspatin', value: 'Roisin Cumhail, Carys’ Großmutter mütterlicherseits' }],
  connections: [{ type: 'connection', name: 'Carys Draig', detail: 'Besitzerin und vertraute Jagdgefährtin.' },
    { type: 'connection', name: 'Roisin Cumhail', detail: 'Namenspatin; Mutter von Wynonna Fiachrach und Großmutter von Carys.' }]
};

export const DRAIG_PALACE_PETS = Object.freeze([pompoesa, roisin]);
