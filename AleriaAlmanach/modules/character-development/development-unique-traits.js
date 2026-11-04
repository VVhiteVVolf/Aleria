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
  ['ordnungszwang', 'Ordnungszwang', 'Dein Blick für Abweichungen hilft ein wenig, Einzelheiten kosten Zeit: +1 auf Nachforschungen, −1 Initiative.', { skillModifiers: [skill('Nachforschungen', 1)], initiative: -1 }, 0],
  ['namenhueter', 'Namenhüter', 'Namen und gehörte Lebensgeschichten bleiben dir im Gedächtnis: +1 auf Geschichte und Überzeugen, −1 auf Wahrnehmung.', { skillModifiers: [skill('Geschichte', 1), skill('Überzeugen', 1), skill('Wahrnehmung', -1)] }, 1],
  ['unverbesserlicher-optimist', 'Unverbesserlicher Optimist', 'Du erwartest stets das Beste: +1 auf Rettungswürfe gegen Furcht und Überzeugen, −1 auf Motiv erkennen.', { saveModifiers: [{ kind: 'fear', bonus: 1 }], skillModifiers: [skill('Überzeugen', 1), skill('Motiv erkennen', -1)] }, 1],
  ['schwarzseher', 'Schwarzseher', 'Du rechnest mit Schwierigkeiten und wirkst entsprechend düster: +1 Initiative und +1 auf Motiv erkennen, −1 auf Überzeugen.', { initiative: 1, skillModifiers: [skill('Motiv erkennen', 1), skill('Überzeugen', -1)] }, 1],
  ['schweigegeluebde', 'Schweigegelübde', 'Du hörst eher zu und verzichtest auf deine Stimme: +1 auf Motiv erkennen, −1 auf Überzeugen und Auftreten. Die kleinen Abzüge bilden die eingeschränkte Ausdrucksweise allgemein ab; Schrift und Gebärden bleiben möglich.', { skillModifiers: [skill('Motiv erkennen', 1), skill('Überzeugen', -1), skill('Auftreten', -1)] }, -1],
  ['eigensinn', 'Eigensinn', 'Dein Selbstbild lässt sich schwer erschüttern; Kompromisse fallen dir schwer: +1 auf CHA-Rettungswürfe, −1 auf Überzeugen.', { saveAttributeModifiers: [save('charisma', 1)], skillModifiers: [skill('Überzeugen', -1)] }, 0],
  ['ritualgebunden', 'Ritualgebunden', 'Du kennst deine wiederkehrenden Riten, reagierst aber zögerlich auf Neues: +1 auf Religion, −1 Initiative.', { skillModifiers: [skill('Religion', 1)], initiative: -1 }, 0],
  ['neugier-vor-vorsicht', 'Neugier vor Vorsicht', 'Du schaust genauer hin, gehst dabei aber eher ein Risiko ein: +1 auf Nachforschungen, −1 auf GES-Rettungswürfe. Neugier ersetzt keine Ermittlerausbildung.', { skillModifiers: [skill('Nachforschungen', 1)], saveAttributeModifiers: [save('dexterity', -1)] }, 0],
  ['uebervorsichtig', 'Übervorsichtig', 'Du suchst zuerst einen sicheren Ausweg und zögerst dadurch: +1 auf GES-Rettungswürfe, −1 Initiative.', { saveAttributeModifiers: [save('dexterity', 1)], initiative: -1 }, 0],
  ['wanderlust', 'Wanderlust', 'Du bleibst lieber unterwegs, als dich lange an einer Stelle aufzuhalten: +1 m Bewegung und +1 auf Überleben, −1 auf Nachforschungen.', { movement: 1, skillModifiers: [skill('Überleben', 1), skill('Nachforschungen', -1)] }, 1],
  ['totengraeberhumor', 'Totengräberhumor', 'Mit Bestattungsbräuchen vertraut begegnest du dem Unheimlichen mit unpassenden Scherzen: +1 auf Religion und Rettungswürfe gegen Furcht, −1 auf Auftreten.', { skillModifiers: [skill('Religion', 1), skill('Auftreten', -1)], saveModifiers: [{ kind: 'fear', bonus: 1 }] }, 1],
  ['stille-zeugin', 'Stille Zeugin', 'Du beobachtest lieber vom Rand aus: +1 passive Wahrnehmung, −1 auf Auftreten. Der Bonus verändert keine aktiven Wahrnehmungsproben.', { passivePerception: 1, skillModifiers: [skill('Auftreten', -1)] }, 0],
  ['fremde-erinnerungen', 'Fremde Erinnerungen', 'Bruchstücke fremder Geschichten und Runen drängen sich in deinen Geist: +1 auf Geschichte und Arkane Kunde, −1 auf WEI-Rettungswürfe.', { skillModifiers: [skill('Geschichte', 1), skill('Arkane Kunde', 1)], saveAttributeModifiers: [save('wisdom', -1)] }, 1],
  ['schatten-von-morgen', 'Schatten von Morgen', 'Unbestimmte Vorahnungen treiben dich an, erschweren aber klare Gedanken: +1 Initiative, −1 auf INT-Rettungswürfe.', { initiative: 1, saveAttributeModifiers: [save('intelligence', -1)] }, 0],
  ['schuldengewissen', 'Schuldengewissen', 'Du gehst sorgsam mit Zusagen um und scheust Ausreden: +1 auf Überzeugen, −1 auf Täuschen. Ein schlechtes Gewissen verleiht keine Fähigkeit, andere zu durchschauen.', { skillModifiers: [skill('Überzeugen', 1), skill('Täuschen', -1)] }, 0],
  ['pazifistische-ader', 'Pazifistische Ader', 'Du suchst eher Versöhnung als Verletzung: +1 auf Überzeugen, −1 Waffenschaden. Pazifismus verleiht keine medizinische Ausbildung. Zauberschaden bleibt unverändert.', { skillModifiers: [skill('Überzeugen', 1)], damage: -1 }, 0],
  ['ehrenhafter-zweikampf', 'Ehrenhafter Zweikampf', 'Du bevorzugst die direkte Begegnung: +1 auf Nahkampf-Waffenangriffe, −1 auf Fernkampf-Waffenangriffe. Das gilt auch für entsprechende Techniken, nicht für Zauber.', {}, 1, { triggerRules: [
    weaponRule('zweikampf-nah', 'pre-roll', 'actor', 'melee', { attackModifier: 1 }),
    weaponRule('zweikampf-fern', 'pre-roll', 'actor', 'ranged', { attackModifier: -1 })
  ] }],
  ['deckungssucher', 'Deckungssucher', 'Du bewegst dich bedächtig und schützt dich vor Beschuss: −1 m Bewegung; eingehender Fernkampf-Waffenschaden wird um 1 reduziert. Keine Wirkung gegen Nahkampf oder Zauber.', { movement: -1 }, 1, { triggerRules: [
    weaponRule('deckung-beschuss', 'pre-damage', 'target', 'ranged', { damageReduction: 1 })
  ] }],
  ['magische-wetterfuehligkeit', 'Magische Wetterfühligkeit', 'Magische Spannungen machen dich unruhig: +1 auf Rettungswürfe gegen Zauber, Gebete und magische Lieder, −1 Initiative.', { initiative: -1 }, 1, { triggerRules: magicalSaveRules('wetterfuehlig', 1) }],
  ['aberglaeubisch', 'Abergläubisch', 'Du kennst viele Omen und deutest Magie schnell als schlechtes Zeichen: +1 auf Religion, −1 auf Rettungswürfe gegen Zauber, Gebete und magische Lieder.', { skillModifiers: [skill('Religion', 1)] }, -1, { triggerRules: magicalSaveRules('aberglaube', -1) }]
];
