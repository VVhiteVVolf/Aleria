// Shared authored identity source for the named additions to the Draig guard.
// User screenshots and corrections, 12 November 2026. No inferred birth years.
const person = (id, name, house, sex, role, options = {}) => Object.freeze({
  id, name, familyId: `haus-${house}`, houseId: `house-${house}`, sex, role,
  worldPersonId: `person--haus-${house}--${id}`,
  portrait: `assets/images/portraits/haus-${house}/${id}.png`,
  ageEstimate: options.ageEstimate || '',
  aliases: Object.freeze(options.aliases || []),
  existingCharacterId: options.existingCharacterId || '',
  notes: options.notes || '',
  sourceNote: options.sourceNote || ''
});

export const DRAIG_GARDE_PEOPLE = Object.freeze([
  person('marared-curiad', 'Marared Curiad', 'curiad', 'male', 'Hauptmann der Leibgarde', { ageEstimate: 'etwa 60–70 Jahre' }),
  person('pellinard-brandyddyn', 'Pellinard Brândyddyn', 'brandyddyn', 'male', 'Leutnant der Leibgarde', {
    ageEstimate: 'etwa 45–55 Jahre',
    aliases: ['Pelinard Brandyddyn', 'Pellinard Brandyddyn'],
    notes: 'Vater Eurgains.',
    sourceNote: 'Die Schreibweise Pellinard Brândyddyn folgt der beschrifteten Gardeübersicht; im Nutzertext auch Pelinard und Brandyddyn.'
  }),
  person('ysabel-bronnor', 'Ysabel Bronnor', 'bronnor', 'female', 'Leutnant der Leibgarde', {
    ageEstimate: 'etwa 35–45 Jahre',
    aliases: ['Yabel Bronnor'],
    notes: 'Mitglied des Ritterhauses Bronnor aus dem Tal der Milane. Kindheitsfreundin der Gräfin Gwendolyn Aderyn. Mutter Eurgains.',
    sourceNote: 'Eine Ehe mit Pellinard ist nicht belegt; der Herkunftsname Bronnor bleibt ausdrücklich erhalten.'
  }),
  person('eurgain-brandyddyn', 'Eurgain Brândyddyn', 'brandyddyn', 'female', 'Ritter der Leibgarde', {
    ageEstimate: 'etwa 20–30 Jahre',
    aliases: ['Eurgain Brandyddyn'],
    notes: 'Tochter von Pellinard Brândyddyn und Ysabel Bronnor.',
    sourceNote: 'Elternschaft gemäß ausdrücklicher Nutzerangabe; Lebensdaten und Familienstand sind nicht bekannt.'
  }),
  person('urien-caelrith', 'Urien Caelrith', 'caelrith', 'male', 'Ritter der Leibgarde', { ageEstimate: 'etwa 30–40 Jahre' }),
  person('mathon-curiad', 'Mathon Curiad', 'curiad', 'male', 'Ritter der Leibgarde', {
    ageEstimate: 'etwa 30–40 Jahre',
    existingCharacterId: 'HWUuhs0eUIaWLQ5IwdE2',
    sourceNote: 'Bereits vorhandene Almanachfigur. Der neue Garderang ersetzt nur die überholte Rollenangabe als Waffenknecht; bestehende Aktenidentität und übrige persönliche Daten bleiben erhalten.'
  }),
  person('morcant-curiad', 'Morcant Curiad', 'curiad', 'male', 'Leibgardist', { ageEstimate: 'etwa 20–30 Jahre' }),
  person('lleucu-myrgath', 'Lleucu Myrgath', 'myrgath', 'female', 'Leibgardist', { ageEstimate: 'etwa 20–30 Jahre' }),
  person('angharad-aelgorn', 'Angharad Aelgorn', 'aelgorn', 'female', 'Leibgardist', { ageEstimate: 'etwa 25–35 Jahre' })
]);

export const DRAIG_GARDE_PEOPLE_BY_ID = Object.freeze(Object.fromEntries(
  DRAIG_GARDE_PEOPLE.map(record => [record.id, record])
));

// Parenthood is confirmed. A marriage, engagement or present union is not.
export const DRAIG_GARDE_EURGAIN_PARENTAGE = Object.freeze({
  childId: 'eurgain-brandyddyn',
  parentIds: Object.freeze(['pellinard-brandyddyn', 'ysabel-bronnor']),
  type: 'biological', legitimacy: 'unknown', certainty: 'confirmed',
  notes: 'Ausdrücklich bestätigte Elternschaft; Ehe, Verlobung und heutiger Beziehungsstatus der Eltern bleiben offen.'
});
