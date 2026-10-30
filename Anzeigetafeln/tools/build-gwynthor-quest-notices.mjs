import { readFile, writeFile } from 'node:fs/promises';
import { buildHerluinMissingNotices } from './quests/herluin-missing.mjs';
import { buildHouseholdQuestNotices } from './build-household-quests.mjs';
import { buildZitteraaleWantedNotices } from './quests/zitteraale-wanted.mjs';
import { buildFleischsammlerNotices, FLEISCHSAMMLER_BOARD_BINDING } from './quests/fleischsammler-wanted.mjs';
import { buildNoticeSignoffUpdates } from './issuers/notice-signoffs.mjs';
import { buildGwrganLleucuNotices, COURT_BOARD_BINDING } from './notices/gwrgan-gegen-lleucu.mjs';

export async function buildGwynthorQuestPack() {
  const herluin = buildHerluinMissingNotices();
  const baseline = JSON.parse(await readFile(new URL('./data/herluin-notice-v1.json', import.meta.url), 'utf8'));
  const updates = baseline.notices.map(old => {
    const current = herluin.find(notice => notice.id === old.id);
    return { id: `${old.id}:20261021-search-return-sketch-group`, noticeId: old.id, fields: [
      ...Object.entries(old.fields).map(([field, from]) => ({ field, from, to: current[field] })),
      { field: 'noticeGroupId', missing: true, to: current.noticeGroupId },
    ] };
  });
  const art = JSON.parse(await readFile(new URL('../assets/data/board-art-catalog.json', import.meta.url), 'utf8'));
  const courtAsset = art.posters.find(asset => asset.id === COURT_BOARD_BINDING.assetId);
  if (!courtAsset) throw new Error('Gerichtsplakat fehlt im Bildkatalog.');
  const notices = [...herluin, ...buildHouseholdQuestNotices(), ...buildZitteraaleWantedNotices(), ...await buildFleischsammlerNotices(), ...buildGwrganLleucuNotices(courtAsset)];
  const voiceBaseline = JSON.parse(await readFile(new URL('./data/gwynthor-notice-voice-v1.json', import.meta.url), 'utf8'));
  for (const old of voiceBaseline.notices) {
    const current = notices.find(notice => notice.id === old.id);
    if (!current) throw new Error(`Aushang für Sprachüberarbeitung fehlt: ${old.id}`);
    updates.push({ id: `${old.id}:20261021-personal-voice`, noticeId: old.id,
      fields: [{ field: 'text', from: old.fields.text, to: current.text }] });
  }
  const herluinVoiceBaseline = JSON.parse(await readFile(new URL('./data/herluin-notice-voice-v2.json', import.meta.url), 'utf8'));
  for (const old of herluinVoiceBaseline.notices) {
    const current = herluin.find(notice => notice.id === old.id);
    if (!current) throw new Error(`Herluins Aushang für Sprachüberarbeitung fehlt: ${old.id}`);
    updates.push({ id: `${old.id}:20261021-academic-ihr-voice`, noticeId: old.id,
      fields: [{ field: 'text', from: old.fields.text, to: current.text }] });
  }
  const mediaBaseline = JSON.parse(await readFile(new URL('./data/zitteraale-notice-media-v1.json', import.meta.url), 'utf8'));
  for (const old of mediaBaseline.notices) {
    const current = notices.find(notice => notice.id === old.id);
    if (!current) throw new Error(`Fahndungsblatt für Medienkorrektur fehlt: ${old.id}`);
    const fields = ['verfasser', 'portrait', 'emblem', 'unterschrift', 'siegel'].flatMap(field => {
      if (current[field] === undefined || current[field] === old.fields[field]) return [];
      return [{ field, ...(Object.hasOwn(old.fields, field) ? { from: old.fields[field] } : { missing: true }), to: current[field] }];
    });
    for (const [slot, to] of Object.entries(current.media || {})) fields.push({ field: `media.${slot}`, missing: true, to });
    updates.push({ id: `${old.id}:20261021-egon-issuer-media`, noticeId: old.id, fields });
  }
  updates.push(...buildNoticeSignoffUpdates(notices.map(notice => notice.id)));
  return { schemaVersion: 2, zettel: notices, updates, boardBindings: [FLEISCHSAMMLER_BOARD_BINDING, COURT_BOARD_BINDING] };
}

export async function writeGwynthorQuestPack({ check = false } = {}) {
  const target = new URL('../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor/authored-notices.json', import.meta.url);
  const content = JSON.stringify(await buildGwynthorQuestPack(), null, 2) + '\n';
  if (check) {
    if (await readFile(target, 'utf8') !== content) throw new Error('Gwynthors Quest-Aushänge müssen neu erzeugt werden.');
  } else {
    await writeFile(target, content);
    console.log('Gwynthor: sechs Aushänge mit insgesamt zweiundzwanzig Blättern · Celynfor bleibt offen.');
  }
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/build-gwynthor-quest-notices.mjs')) {
  await writeGwynthorQuestPack({ check: process.argv.includes('--check') });
}
