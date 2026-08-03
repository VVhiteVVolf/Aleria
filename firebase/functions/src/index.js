import { initializeApp } from 'firebase-admin/app';
import { publishFamily } from './publishing/publish-family.js';
import { setFamilyMemberRole } from './access/set-family-member-role.js';
import { setAleriaRole } from './access/set-aleria-role.js';
import { uploadFamilyAsset } from './assets/upload-family-asset.js';
import { commitCombatComment } from './mechanics/commit-combat-comment.js';
import { commitSkillComment } from './mechanics/commit-skill-comment.js';
import { commitSceneRest } from './mechanics/commit-scene-rest.js';
import { finalizeCombatNarration } from './mechanics/finalize-combat-narration.js';
import { importBackupRecords } from './backup/import-backup-records.js';
import { commitInventoryTransfer } from './mechanics/commit-inventory-transfer.js';
import { commitNarrativeComment } from './comments/commit-narrative-comment.js';

initializeApp();

export { commitCombatComment, commitInventoryTransfer, commitNarrativeComment, commitSceneRest, commitSkillComment, finalizeCombatNarration, importBackupRecords, publishFamily, setAleriaRole, setFamilyMemberRole, uploadFamilyAsset };
