import { initializeApp } from 'firebase-admin/app';
import { publishFamily } from './publishing/publish-family.js';
import { setFamilyMemberRole } from './access/set-family-member-role.js';
import { uploadFamilyAsset } from './assets/upload-family-asset.js';

initializeApp();

export { publishFamily, setFamilyMemberRole, uploadFamilyAsset };
