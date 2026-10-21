// Compatibility CLI and exports. Feature data and shared pack writing have
// separate ownership; either CLI checks/writes the complete Gwynthor pack.
export { HERLUIN_MISSING_NOTICE_ID, buildHerluinMissingNotice, buildHerluinMissingNotices } from './quests/herluin-missing.mjs';
import { writeGwynthorQuestPack } from './build-gwynthor-quest-notices.mjs';

if (process.argv[1]?.endsWith('build-herluin-missing-quest.mjs')) {
  await writeGwynthorQuestPack({ check: process.argv.includes('--check') });
}
