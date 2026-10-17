import assert from 'node:assert/strict';
import { SLEIPNIR_VARULV_ID } from '../../../AleriaAlmanach/modules/creatures/catalog/varulv-gamir.js';
import { sanitizeCharacterBiographyForFirestore, stampFreshRevisions } from '../../../AleriaAlmanach/modules/characters/character-save-guard.js';

export { SLEIPNIR_VARULV_ID };
export const SLEIPNIR_TRAIT_ICONS = {
  'Ruhig und besonnen': 'Temperate', 'Ernst und wortkarg': 'Brooding', 'Undurchdringlich': 'Intrigue_focus',
  'Unnahbar': 'Shy', 'Beobachtend und analytisch': 'Shrewd', 'Sachlich und respektvoll': 'Just',
  'Trocken humorvoll': 'Trickster', 'Geduldig': 'Patient', 'Beherrscht': 'Unyielding_leader',
  'Zurückhaltend in Gefühlsdingen': 'Family_focus'
};
const PORTRAITS = {
  '† Sigfast Varulv †': 'haus-varulv/sigfast-varulv.png',
  'Rekka Varulv (geb. Kampfgeborene)': 'haus-varulv/rekka-kampfgeborene.png',
  'Gleipnir Varulv': 'haus-varulv/gleipnir-varulv.png', 'Freyrs Varulv': 'haus-varulv/freyrs-varulv.png',
  'Skalli Varulv': 'haus-draig/skalli-varulv.jpg', 'Fenrir Varulv': 'haus-varulv/fenrir-varulv.png',
  'Hati Varulv': 'haus-varulv/hati-varulv.png', 'Svantje Varulv (geb. Skaal)': 'haus-varulv/svantje-skaal.png',
  'Geri Varulv': 'haus-varulv/geri-varulv.jpeg', 'Freki Varulv': 'haus-varulv/freki-varulv.png',
  'Floki Varulv': 'haus-varulv/floki-varulv.png', 'Skadi Varulv': 'haus-varulv/skadi-varulv.png',
  'Antke Varulv (geb. Skald)': 'haus-varulv/antke-skald-varulv.png', 'Ketill Wargh': 'haus-varulv/ketill-wargh.png',
  'Sigurd Vaeren': 'haus-vaeren/sigurd-vaeren.png', 'Torvard Nachtjäger': 'haus-varulv/torvard-nachtjaeger.png',
  'Galahad Draig': 'haus-draig/galahad-draig.jpg'
};
const WORD_REPAIRS = ['gegen-über', 'be-reits', 'scherz-haft', 'er-freut', 'Zu-rückhaltung', 'Höflich-keit',
  'ge-nommen', 'kei-nen', 'Zunei-gung', 'Ver-lässlichkeit', 'Hu-mor', 'Ver-wechslung', 'Sta-tuen', 'fra-gen', 'Beglei-ter'];
const COMPANION_DETAILS = { Trygg: 'Gamir · treuer Jagdgefährte und Vater der übrigen Gamir des Clans.',
  Kappi: 'Hest-Hengst · persönliches Reitpferd.', Skuggi: 'Habicht · Begleiter bei der Beizjagd.' };
function cleanText(value) {
  let text = String(value || '');
  for (const word of WORD_REPAIRS) text = text.replaceAll(word, word.replace('-', ''));
  return text.replaceAll('Ceny rs', 'Cenyrs').replace(/(?<!<br>)<br>(?!<br>)/gi, ' ');
}

export function planSleipnirBiography(character, assets, now = new Date().toISOString()) {
  assert.equal(character.id, SLEIPNIR_VARULV_ID);
  const biography = structuredClone(character.biography), bio = biography.biography;
  assert.equal(bio.abilities.length, 10, 'Die vorhandenen Eigenschaften müssen vor der Übernahme geprüft werden.');
  bio.biographyTitle = 'Sleipnir Varulv – Thane von Roriksheim';
  bio.portrait = bio.portrait || character.portrait;
  bio.portraitFit = 'contain';
  bio.portraitStages = [assets.bow.url, assets.age22.url, assets.age12.url, assets.child.url];
  bio.portraitCaptions = ['Sleipnir Varulv · 1740.', 'Mit Bogen und Trygg · 1740.',
    'Mit 22 Jahren · 1718.', 'Mit 12 Jahren · 1708.', 'Als frecher Bub mit 7 Jahren · 1703.'];
  for (const key of ['biographyText', 'historyText']) bio[key] = cleanText(bio[key]);
  for (const key of ['works', 'trivia']) bio[key] = bio[key].map(cleanText);
  bio.works = bio.works.map(text => text.replace('Welche Gestalt dieser Begleiter besitzt, ist bislang nicht näher festgelegt.',
    'Sein treuer Gamir Trygg begleitet ihn bei der Jagd und der Fährtenarbeit.'));
  bio.extraSections = bio.extraSections.map(section => ({ ...section, title: cleanText(section.title), text: cleanText(section.text) }));
  bio.abilities = bio.abilities.map(ability => {
    const icon = SLEIPNIR_TRAIT_ICONS[ability.title];
    assert(icon && assets[`trait${icon}`], `Kein geprüftes Symbol für ${ability.title}`);
    return { ...ability, detail: cleanText(ability.detail), icon: assets[`trait${icon}`].url };
  });
  const companions = character.inventory?.companions || [];
  assert.equal(companions.filter(card => Object.hasOwn(COMPANION_DETAILS, card.name)).length, 3);
  const companionConnection = name => ({ type: 'connection', name, detail: COMPANION_DETAILS[name],
    image: companions.find(card => card.name === name).image, imageFormat: 'portrait' });
  bio.connections = bio.connections.map(connection => {
    if (connection.type === 'heading') return connection;
    const name = connection.name.trim().replace(/\s+/g, ' '), file = PORTRAITS[name];
    if (Object.hasOwn(COMPANION_DETAILS, name)) return { ...connection, ...companionConnection(name) };
    assert(file, `Kein belegtes Porträt für ${name}`);
    let detail = cleanText(connection.detail);
    if (name === 'Galahad Draig' && !detail) detail = 'Graf von Celtigerns Wacht und Marschall von Cenyr. Bekannt aus dem Krieg gegen Ceitheach; heute brieflicher Austausch über die Zusammenarbeit zwischen Cenyr und Aldrimar.';
    if (name === 'Ketill Wargh') detail = 'Schwager, enger Freund und Jarl von Ivarsheim.';
    return { ...connection, name, image: `/Stammbäume/assets/images/portraits/${file}`, detail };
  });
  if (!bio.connections.some(connection => connection.type === 'heading' && connection.title === 'Tierische Begleiter')) {
    bio.connections.push({ type: 'heading', title: 'Tierische Begleiter', detail: '' });
  }
  for (const name of ['Trygg', 'Kappi', 'Skuggi']) {
    if (!bio.connections.some(connection => connection.name === name)) bio.connections.push(companionConnection(name));
  }
  const revision = Math.max(Date.parse(now), Number(character.biography?.revision || 0) + 1);
  const patch = sanitizeCharacterBiographyForFirestore(stampFreshRevisions({ biography, updatedAt: now }, ['biography'], revision));
  return { id: character.id, patch, creatures: [] };
}
