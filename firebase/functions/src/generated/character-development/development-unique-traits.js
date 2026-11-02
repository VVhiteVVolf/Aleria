// Personal habits and unusual experiences; no item, language or class grants.
const skill = (name, bonus) => ({ name, bonus });
const save = (attributeKey, bonus) => ({ attributeKey, bonus });
const weaponRule = (id, phase, recipient, attackRange, effects) => ({
  id, phase, recipient, sourceRelation: 'self', activation: 'passive',
  frequency: 'always', condition: 'always', actionKinds: ['weapon', 'technique'],
  weaponAttackOnly: true, attackRange, effects
});
const magicalSaveRules = (id, bonus) => ['pre-roll', 'pre-secondary-save'].map(phase => ({
  id: `${id}-${phase}`, phase, recipient: 'target', sourceRelation: 'self',
  activation: 'passive', frequency: 'always', condition: 'always',
  actionKinds: ['spell', 'prayer', 'song'],
  saveAttributes: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'],
  effects: { savingThrowModifier: bonus }
}));

export const UNIQUE_TRAIT_DEFINITIONS = [
  ['ordnungszwang', 'Ordnungszwang', 'Du erkennst Unstimmigkeiten, verlierst aber Zeit mit Einzelheiten: +2 auf Nachforschungen, −1 Initiative.', { skillModifiers: [skill('Nachforschungen', 2)], initiative: -1 }, 0],
  ['namenhueter', 'Namenhüter', 'Namen und Lebensgeschichten bleiben dir im Gedächtnis: +2 auf Geschichte und +1 auf Überzeugen, −1 auf Wahrnehmung.', { skillModifiers: [skill('Geschichte', 2), skill('Überzeugen', 1), skill('Wahrnehmung', -1)] }, 1],
  ['unverbesserlicher-optimist', 'Unverbesserlicher Optimist', 'Du erwartest stets das Beste: +2 auf Rettungswürfe gegen Furcht und +1 auf Überzeugen, −2 auf Motiv erkennen.', { saveModifiers: [{ kind: 'fear', bonus: 2 }], skillModifiers: [skill('Überzeugen', 1), skill('Motiv erkennen', -2)] }, 1],
  ['schwarzseher', 'Schwarzseher', 'Du rechnest mit Schwierigkeiten und wirkst entsprechend düster: +1 Initiative und +1 auf Motiv erkennen, −2 auf Überzeugen.', { initiative: 1, skillModifiers: [skill('Motiv erkennen', 1), skill('Überzeugen', -2)] }, 0],
  ['schweigegeluebde', 'Schweigegelübde', 'Du setzt auf Beobachtung und Zurückhaltung: +2 auf Heimlichkeit und Motiv erkennen, −3 auf Überzeugen und −2 auf Auftreten. Die Abzüge gelten allgemein, auch bei nonverbalen Versuchen.', { skillModifiers: [skill('Heimlichkeit', 2), skill('Motiv erkennen', 2), skill('Überzeugen', -3), skill('Auftreten', -2)] }, -1],
  ['eigensinn', 'Eigensinn', 'Dein Selbstbild lässt sich schwer erschüttern; Kompromisse fallen dir schwer: +2 auf CHA-Rettungswürfe, −2 auf Überzeugen.', { saveAttributeModifiers: [save('charisma', 2)], skillModifiers: [skill('Überzeugen', -2)] }, 1],
  ['ritualgebunden', 'Ritualgebunden', 'Überlieferte Abläufe geben dir Halt, spontanes Handeln weniger: +2 auf Religion, −1 Initiative.', { skillModifiers: [skill('Religion', 2)], initiative: -1 }, 0],
  ['neugier-vor-vorsicht', 'Neugier vor Vorsicht', 'Du untersuchst selbst das verdächtigste Rätsel aus nächster Nähe: +3 auf Nachforschungen, −2 auf GES-Rettungswürfe.', { skillModifiers: [skill('Nachforschungen', 3)], saveAttributeModifiers: [save('dexterity', -2)] }, -1],
  ['uebervorsichtig', 'Übervorsichtig', 'Du suchst zuerst einen sicheren Ausweg: +2 auf GES-Rettungswürfe, −2 Initiative.', { saveAttributeModifiers: [save('dexterity', 2)], initiative: -2 }, 0],
  ['wanderlust', 'Wanderlust', 'Du bleibst lieber unterwegs, als dich lange an einer Stelle aufzuhalten: +1 m Bewegung und +1 auf Überleben, −2 auf Nachforschungen.', { movement: 1, skillModifiers: [skill('Überleben', 1), skill('Nachforschungen', -2)] }, 0],
  ['totengraeberhumor', 'Totengräberhumor', 'Du kennst Bestattungsbräuche und begegnest dem Unheimlichen mit unpassenden Scherzen: +2 auf Religion und +1 auf Rettungswürfe gegen Furcht, −2 auf Auftreten.', { skillModifiers: [skill('Religion', 2), skill('Auftreten', -2)], saveModifiers: [{ kind: 'fear', bonus: 1 }] }, 1],
  ['stille-zeugin', 'Stille Zeugin', 'Du beobachtest lieber vom Rand aus: +2 passive Wahrnehmung, −2 auf Auftreten. Der Bonus verändert keine aktiven Wahrnehmungsproben.', { passivePerception: 2, skillModifiers: [skill('Auftreten', -2)] }, 0],
  ['fremde-erinnerungen', 'Fremde Erinnerungen', 'Bruchstücke fremder Geschichten und Runen drängen sich in deinen Geist: +2 auf Geschichte und Arkane Kunde, −2 auf WEI-Rettungswürfe.', { skillModifiers: [skill('Geschichte', 2), skill('Arkane Kunde', 2)], saveAttributeModifiers: [save('wisdom', -2)] }, 0],
  ['schatten-von-morgen', 'Schatten von Morgen', 'Unbestimmte Vorahnungen treiben dich an, erschweren aber klare Gedanken: +2 Initiative, −2 auf INT-Rettungswürfe.', { initiative: 2, saveAttributeModifiers: [save('intelligence', -2)] }, 0],
  ['schuldengewissen', 'Schuldengewissen', 'Versprechen und offene Gefallen beschäftigen dich: +2 auf Motiv erkennen, −2 auf Täuschen.', { skillModifiers: [skill('Motiv erkennen', 2), skill('Täuschen', -2)] }, 0],
  ['pazifistische-ader', 'Pazifistische Ader', 'Du suchst eher Versöhnung als Verletzung: +2 auf Heilkunde und Überzeugen, −1 Waffenschaden. Zauberschaden bleibt unverändert.', { skillModifiers: [skill('Heilkunde', 2), skill('Überzeugen', 2)], damage: -1 }, 0],
  ['ehrenhafter-zweikampf', 'Ehrenhafter Zweikampf', 'Du bevorzugst die direkte Begegnung: +1 auf Nahkampf-Waffenangriffe, −1 auf Fernkampf-Waffenangriffe. Das gilt auch für entsprechende Techniken, nicht für Zauber.', {}, 1, { triggerRules: [
    weaponRule('zweikampf-nah', 'pre-roll', 'actor', 'melee', { attackModifier: 1 }),
    weaponRule('zweikampf-fern', 'pre-roll', 'actor', 'ranged', { attackModifier: -1 })
  ] }],
  ['deckungssucher', 'Deckungssucher', 'Du bewegst dich bedächtig und schützt dich vor Beschuss: −1 m Bewegung; eingehender Fernkampf-Waffenschaden wird um 1 reduziert. Keine Wirkung gegen Nahkampf oder Zauber.', { movement: -1 }, 1, { triggerRules: [
    weaponRule('deckung-beschuss', 'pre-damage', 'target', 'ranged', { damageReduction: 1 })
  ] }],
  ['magische-wetterfuehligkeit', 'Magische Wetterfühligkeit', 'Magische Spannungen machen dich unruhig: +1 auf Rettungswürfe gegen Zauber, Gebete und magische Lieder, −1 Initiative.', { initiative: -1 }, 1, { triggerRules: magicalSaveRules('wetterfuehlig', 1) }],
  ['aberglaeubisch', 'Abergläubisch', 'Du kennst viele Omen und deutest Magie schnell als schlechtes Zeichen: +2 auf Religion, −1 auf Rettungswürfe gegen Zauber, Gebete und magische Lieder.', { skillModifiers: [skill('Religion', 2)] }, -1, { triggerRules: magicalSaveRules('aberglaube', -1) }]
];
