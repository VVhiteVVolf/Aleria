const skills = Object.freeze({
  persuasion: 'Du bringst jemanden mit glaubwürdigen Argumenten, Diplomatie oder einer Bitte auf deine Seite.',
  intimidation: 'Du setzt jemanden durch Drohungen, Entschlossenheit oder eine einschüchternde Präsenz unter Druck.',
  deception: 'Du verbirgst die Wahrheit, lügst glaubhaft oder täuschst eine Absicht vor.',
  performance: 'Du überzeugst durch Schauspiel, Musik, Tanz oder einen wirkungsvollen Auftritt.',
  perception: 'Du bemerkst sichtbare Details, Geräusche, Bewegungen oder andere unmittelbare Sinneseindrücke.',
  insight: 'Du deutest Absichten, Gefühle und mögliche Täuschungen aus Mimik, Stimme und Körpersprache.',
  'animal-handling': 'Du beruhigst Tiere, verstehst ihr Verhalten oder lenkst sie sicher.',
  medicine: 'Du beurteilst Verletzungen und Krankheiten, leistest Erste Hilfe oder erkennst medizinische Hinweise.',
  investigation: 'Du untersuchst Hinweise gezielt, verknüpfst Beobachtungen und ziehst daraus Schlussfolgerungen.',
  religion: 'Du erinnerst dich an Glaubenslehren, Rituale, Gottheiten und religiöse Zeichen.',
  'arcane-kunde': 'Du verstehst magische Zeichen, Zauberwirkungen und übernatürliche Zusammenhänge.',
  history: 'Du erinnerst dich an vergangene Ereignisse, alte Reiche, Personen und Überlieferungen.',
  nature: 'Du bestimmst Pflanzen und Tiere und verstehst Wetter, Landschaften und natürliche Vorgänge.',
  survival: 'Du liest Fährten, findest sichere Wege und versorgst dich in der Wildnis.',
  'sleight-of-hand': 'Du arbeitest mit präzisen, unauffälligen Handgriffen, etwa beim Verbergen oder Entwenden kleiner Dinge.',
  acrobatics: 'Du hältst das Gleichgewicht und meisterst bewegliche Manöver wie Balancieren, Rollen oder elegante Landungen.',
  stealth: 'Du schleichst leise, verbirgst dich und bewegst dich so, dass andere dich möglichst nicht bemerken.',
  athletics: 'Du bewältigst körperliche Anstrengung wie Klettern, Springen, Schwimmen oder kräftiges Ziehen.',
  seduction: 'Du suchst durch Charme, Nähe und romantische oder verführerische Signale Zugang zu jemandem.',
  'body-control': 'Du kontrollierst deinen Körper unter Belastung, hältst eine schwierige Haltung oder unterdrückst Zittern und Unruhe.'
});
const attributes = Object.freeze({
  strength: ['Rohe Muskelkraft, etwa zum Heben, Drücken oder Aufbrechen.', 'Du widerstehst einer Wirkung durch körperliche Kraft, etwa einem Wegstoßen.'],
  dexterity: ['Geschwindigkeit, Beweglichkeit und präzise Koordination.', 'Du weichst einer plötzlichen Gefahr aus, etwa einer Falle oder einem Flächenangriff.'],
  constitution: ['Widerstandsfähigkeit, Ausdauer und körperliche Belastbarkeit.', 'Du widerstehst körperlichen Belastungen wie Gift, Krankheit oder Erschöpfung.'],
  intelligence: ['Logisches Denken, Erinnerungsvermögen und geistige Analyse.', 'Du wehrst einen Angriff auf dein Denken oder deine geistige Ordnung ab.'],
  wisdom: ['Aufmerksamkeit, Intuition und besonnenes Urteilsvermögen.', 'Du behauptest deinen Willen gegen Beeinflussung, Täuschung oder Furcht.'],
  charisma: ['Ausstrahlung, Selbstsicherheit und die Stärke deiner Persönlichkeit.', 'Du bewahrst deine Identität und Präsenz gegen eine entsprechende übernatürliche Wirkung.']
});

export function getCheckDescription(check) {
  const id = typeof check === 'string' ? check : check?.id;
  if (skills[id]) return skills[id];
  const [type, key] = String(id || '').split(':');
  if (!attributes[key]) return '';
  return type === 'save' ? `${attributes[key][1]} Verwendet deine Rettungswurf-Ausbildung.`
    : type === 'attribute' ? `${attributes[key][0]} Verwendet den Attributsmodifikator ohne Übungsbonus.` : '';
}
