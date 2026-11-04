import { readFile, writeFile } from 'node:fs/promises';
import { HOUSES } from '../../../Vorschau/Calidaria/house-data.mjs';
import { WARRIORS } from '../../../Vorschau/Calidaria/warrior-data.mjs';
import { renderHouseGallery } from '../../../Vorschau/Calidaria/art-view.mjs';
import { renderHouseCard } from '../../../Vorschau/Leukonia/house-placement-render.mjs';
import { REALM_CONTEXT } from '../../../Vorschau/Calidaria/realm-context.mjs';

const assignments = JSON.parse(await readFile(new URL('../../../Vorschau/Calidaria/sources/house-name-assignments.json', import.meta.url), 'utf8'));
const gallery = renderHouseGallery(HOUSES, WARRIORS);
const pool = HOUSES.filter(house => !house.sourceSeat).map(house => renderHouseCard(house, null)).join('');
const rows = HOUSES.map(house => ({
  id: house.id,
  name: house.name,
  culture: house.culture,
  assignmentMatches: house.id === 'house-mede' ? house.name === 'Haus Mede' : assignments.entries.some(entry => entry.houseId === house.id && `Haus ${entry.name}` === house.name),
  galleryHeadingPresent: gallery.includes(`<h3>${house.name}</h3>`),
  freePoolLabelPresent: house.sourceSeat ? null : pool.includes(`<strong>${house.name}</strong>`),
  warrior: WARRIORS.filter(warrior => warrior.houseId === house.id).map(warrior => ({ id: warrior.id, ready: warrior.ready, image: warrior.image, fullsize: warrior.fullsize })),
}));
const report = {
  checkedAt: new Date().toISOString(),
  status: 'blocked-browser-control-static-render-review-only',
  requestedScope: 'New house names, Nuatlapa/Tavarua context, gallery pairs and all 29 house dossiers on desktop/mobile; existing draft preserved.',
  browser: {
    verifiedNewViews: 0,
    oldTabId: '1982820840',
    oldTabClaim: 'Rejected: already bound to earlier session.',
    newEmptyTabIds: ['1982820857', '1982820860'],
    failedDocumentedMethods: ['tab.goto', 'tab.getAXState', 'tab.playwright.domSnapshot', 'cua.createBrowserTab'],
    error: "Cannot read properties of undefined (reading 'timeoutMs')",
    nativeFallback: 'Unavailable native pipe, as reported by cua.getState.',
    settingsOrBrowserDataChanged: false,
    draftOrSeatInteractions: false,
    viewportOverrideApplied: false,
  },
  staticRenderReview: {
    houses: HOUSES.length,
    readyWarriors: WARRIORS.filter(item => item.ready).length,
    galleryCards: (gallery.match(/class="house-art-card"/g) || []).length,
    galleryPairs: (gallery.match(/class="house-art-pair"/g) || []).length,
    freePoolCards: (pool.match(/class="house-card/g) || []).length,
    allAssignmentsMatch: rows.every(row => row.assignmentMatches),
    allGalleryHeadingsPresent: rows.every(row => row.galleryHeadingPresent),
    allFreePoolNamesPresent: rows.every(row => row.freePoolLabelPresent !== false),
    languageText: REALM_CONTEXT.culture.find(item => item.text.includes('Tavarua'))?.text,
    initialSeatMetadata: HOUSES.filter(item => item.sourceSeat).map(item => ({ houseId: item.id, seatId: item.sourceSeat })),
    rows,
  },
  notVerified: [
    'Current rendered select options and preservation of live browser draft after reload.',
    'Actual current gallery layout and absence of overflow on desktop/mobile.',
    'Actual current preview decoding/loading and full figure containment in all 29 dossiers.',
  ],
  priorScreenshots: 'Existing ui-qa.json and screenshots predate these new house names and 28 house figures; they are not evidence for this follow-up.',
  sourceChangesByQaAgent: false,
};
await writeFile(new URL('./house-warriors-ui-qa.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({status: report.status, ...report.staticRenderReview, rows: undefined, languageText: undefined}, null, 2));
