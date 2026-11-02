// Human inherited aptitude. These choices document ancestry, not acquired races.
const skill = (name, bonus) => ({ name, bonus });
export const BLOODLINE_TRAIT_DEFINITIONS = [
  ['bluttraeger-vampirspross', 'Blutträger (Vampirspross)', 'Angeborenes menschliches Erbe eines vampirischen Vorfahren: +1 Zauberangriff, +1 auf Arkane Kunde und KON-Rettungswürfe.', { spellAttack: 1, skillModifiers: [skill('Arkane Kunde', 1)], saveAttributeModifiers: [{ attributeKey: 'constitution', bonus: 1 }] }, 4],
  ['bluttraeger-formlingsspross', 'Blutträger (Formlingsspross)', 'Angeborenes menschliches Erbe eines Formlings oder Formwandlers: +1 Zauber-SG und +2 auf Täuschen. Die Anlage begünstigt Illusion und Verstellung.', { spellSaveDc: 1, skillModifiers: [skill('Täuschen', 2)] }, 4],
  ['bluttraeger-succubusspross', 'Blutträger (Succubusspross)', 'Angeborenes menschliches Erbe eines Sukkubus oder Inkubus: +1 Zauber-SG, +2 auf Flirten und +1 auf Motiv erkennen. Die Anlage begünstigt Traum- und Gefühlsmagie.', { spellSaveDc: 1, skillModifiers: [skill('Flirten', 2), skill('Motiv erkennen', 1)] }, 4],
  ['bluttraeger-satyrspross', 'Blutträger (Satyrspross)', 'Angeborenes menschliches Erbe eines Satyrs: +1 Zauberangriff, +2 auf Auftreten und +1 auf Akrobatik. Magische Begabung zeigt sich besonders in Klang und Rhythmus.', { spellAttack: 1, skillModifiers: [skill('Auftreten', 2), skill('Akrobatik', 1)] }, 4],
  ['bluttraeger-aelvarspross', 'Blutträger (Aelvarspross)', 'Angeborenes menschliches Erbe einer Aelvar: +1 Zauber-SG, +2 auf Heimlichkeit und +1 auf Religion. Die infernale Anlage ist von subtiler Magie und verborgenen Riten geprägt.', { spellSaveDc: 1, skillModifiers: [skill('Heimlichkeit', 2), skill('Religion', 1)] }, 4],
  ['bluttraeger-nymphenspross', 'Blutträger (Nymphenspross)', 'Angeborenes menschliches Erbe einer celestialen Nymphe: +1 Zauber-SG und jeweils +1 auf Naturkunde, Heilkunde und Mit Tieren umgehen. Die Anlage ist lebens- und naturverbunden.', { spellSaveDc: 1, skillModifiers: [skill('Naturkunde', 1), skill('Heilkunde', 1), skill('Mit Tieren umgehen', 1)] }, 4],
  ['bluttraeger-flammenspross', 'Blutträger (Flammenspross)', 'Angeborenes menschliches Erbe eines humanoiden Celestialen der Flamme: +1 Zauberangriff und Resistenz gegen Feuerschaden.', { spellAttack: 1 }, 5, { damageAffinities: [{ damageType: 'feuer', response: 'resistant' }] }],
  ['bluttraeger-windspross', 'Blutträger (Windspross)', 'Angeborenes menschliches Erbe eines humanoiden Celestialen der Winde: +1 Zauberangriff, +1 m Bewegung und +1 auf Akrobatik.', { spellAttack: 1, movement: 1, skillModifiers: [skill('Akrobatik', 1)] }, 4],
  ['bluttraeger-donnerspross', 'Blutträger (Donnerspross)', 'Angeborenes menschliches Erbe eines humanoiden Celestialen des Donners: +1 Zauberangriff und Resistenz gegen Blitzschaden.', { spellAttack: 1 }, 5, { damageAffinities: [{ damageType: 'blitz', response: 'resistant' }] }],
  ['bluttraeger-bergspross', 'Blutträger (Bergspross)', 'Angeborenes menschliches Erbe eines humanoiden Celestialen der Berge: +1 Zauber-SG, +2 maximale TP und +1 auf STÄ-Rettungswürfe. Aktuelle TP werden nicht aufgefüllt.', { spellSaveDc: 1, maximumHitPoints: 2, saveAttributeModifiers: [{ attributeKey: 'strength', bonus: 1 }] }, 4]
];

const infernal = (id, ancestor, path, examples = []) => ({
  id: `development-trait-bluttraeger-${id}`, kind: 'infernal', ancestor,
  referenceUrl: `/Bestiarium/wesen/${path}/index.html`,
  compatibilityUrl: '/Bestiarium/themen/dunkelalben/index.html', examples
});
const celestial = (id, ancestor) => ({
  id: `development-trait-bluttraeger-${id}`, kind: 'celestial', ancestor,
  referenceUrl: '/Bestiarium/themen/lichtalben/index.html',
  compatibilityUrl: '/Bestiarium/themen/lichtalben/index.html', examples: []
});
export const BLOODLINE_TRAIT_ORIGINS = Object.freeze([
  infernal('vampirspross', 'Vampirischer Vorfahr', 'gruppen/vampire', [
    { name: 'Aradin Hyrmgarthr', worldPersonId: 'person--haus-hyrmgardr--aradin-hyrmgardr', reason: 'Vampirischer Ursprung des Clans Hyrmgarthr; Autorenfestlegung vom 2. November 2026.' }
  ]),
  infernal('formlingsspross', 'Formling / Formwandler', 'inferniiden/formwandler'),
  infernal('succubusspross', 'Sukkubus / Inkubus', 'inferniiden/sukkubus-inkubus', [
    { name: 'Myriad Draig', worldPersonId: 'person--haus-draig--myriad-draig', reason: 'Mutter Afallith „Lilith“ Tanwyn ist ein Succubus; Autorenfestlegung vom 2. November 2026.' }
  ]),
  infernal('satyrspross', 'Satyr', 'inferniiden/satyr'),
  infernal('aelvarspross', 'Aelvar', 'gruppen/aelvar'),
  celestial('nymphenspross', 'Celestiale Nymphe'),
  celestial('flammenspross', 'Humanoider Celestialer der Flamme'),
  celestial('windspross', 'Humanoider Celestialer der Winde'),
  celestial('donnerspross', 'Humanoider Celestialer des Donners'),
  celestial('bergspross', 'Humanoider Celestialer der Berge')
]);

export function getBloodlineTraitOrigin(id) {
  return BLOODLINE_TRAIT_ORIGINS.find(origin => origin.id === id) || null;
}
