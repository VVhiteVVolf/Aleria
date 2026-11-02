import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../../', import.meta.url);
const html = await readFile(new URL('AleriaAlmanach/AleriaAlmanach.html', root), 'utf8');
const start = html.indexOf('    <!-- TAB 2: BILDER & EMOTES -->');
const end = html.indexOf('    <!-- TAB 3: INVENTAR -->', start);
const panel = html.slice(start, end).replace('class="char-tab-panel"', 'class="char-tab-panel active"');
const scripts = [
  'image-library/image-library-model', 'image-library/image-library-import',
  'characters/character-image-sets', 'characters/character-avatar-import',
  'characters/character-image-set-editor', 'characters/character-media-editor',
  'comments/comments-segment-base', 'characters/character-profile-events',
  'characters/character-image-set-sorting'
].map(file => `<script src="/AleriaAlmanach/modules/${file}.js"></script>`).join('\n');
await writeFile(new URL('./preview.html', import.meta.url), `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Avatar-Sets · lokale Layoutprüfung</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/AleriaAlmanach/styles.css">
<link rel="stylesheet" href="/AleriaAlmanach/styles/comments.css">
<link rel="stylesheet" href="/AleriaAlmanach/styles/comment-character-picker.css">
<link rel="stylesheet" href="/AleriaAlmanach/styles/characters.css">
<link rel="stylesheet" href="/AleriaAlmanach/styles/character-image-library.css">
<style>
body{margin:0;padding:20px;background:var(--parchment);color:var(--ink);font-family:'EB Garamond',serif}
.qa-shell{max-width:1360px;margin:auto}.qa-heading{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;padding:0 20px}
.qa-heading h1{font:600 1.2rem Cinzel,serif;margin:.5rem 0}.qa-heading p{font-size:.85rem}
#char-profile-overlay{display:block;position:static;background:transparent;backdrop-filter:none;padding:0}.qa-contribution{margin:0 20px 20px;padding:18px;border:1px solid var(--parchment-deeper);border-radius:6px}
.qa-contribution h2{font:600 .8rem Cinzel,serif;margin:0 0 12px}.qa-contribution p{font-size:.85rem;margin:8px 0}
@media(max-width:640px){body{padding:0}.qa-heading{padding:12px}.qa-contribution{margin:0 12px 12px}}
</style></head><body><main class="qa-shell">
<header class="qa-heading"><h1>Bilder &amp; Emotes · Rianna Wyrm</h1><p>Lokale Testansicht · keine Online-Speicherung</p></header>
<div id="char-profile-overlay"><input type="hidden" id="cp-name" value="Rianna Wyrm">${panel}</div>
<section class="qa-contribution"><h2>Vorschau im Beitragseditor</h2><div id="qa-contribution-picker"></div><p id="qa-saved"></p><button type="button" id="qa-reload" class="cp-portrait-upload-btn secondary">Gespeicherte Testdaten neu laden</button></section>
</main><script>
let _emoteSlots = [], _charPortraitUrl = null, _editingChar = 'qa-rianna';
const MAX_EMOTES = 80;
let _commentMode = 'charakter', _editMode = 'charakter', _selectedCharId = 'qa-rianna', _editSelectedCharId = 'qa-rianna';
let _selectedImageSetId = 'standard', _editSelectedImageSetId = 'standard';
let qaSaved = null;
const qaSegment = { id: 'qa-segment', kind: 'speech', imageSetId: 'standard' };
function normalizeSearchText(value) { return String(value).toLowerCase(); }
function escapeHtml(value) { return String(value || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'); }
function sanitizeImageSrc(value) { return escapeHtml(value); }
function normalizeImageUrlForStorage(value) { return AleriaCharacterImageSets.normalizeImageUrl(value); }
function normalizeCommentKind(value) { return value || 'speech'; }
function getAvailableCommentCharacterById() { return { ...qaSaved, name: 'Rianna Wyrm' }; }
function syncPortraitDisplay(src) {
  const image = document.getElementById('cp-portrait-thumb-img');
  image.style.display = src ? 'block' : 'none';
  if (src) image.src = src; else image.removeAttribute('src');
  document.getElementById('cp-portrait-thumb-ph').style.display = src ? 'none' : 'grid';
}
function qaUpdate() {
  qaSaved = collectCharacterImageSetEditorData();
  document.getElementById('qa-contribution-picker').innerHTML = getCommentSegmentImageSetPicker(qaSegment);
  document.getElementById('qa-saved').textContent = 'Gespeicherte Reihenfolge: ' + qaSaved.imageSets.map(set => set.name).join(' → ');
}
window.AleriaCharacterImageLibraryAutosave = { schedule: qaUpdate };
</script>${scripts}<script>
const qaAvatars = Array.from({length:9}, (_,index) => ({
  img: '/AleriaAlmanach/AvatarWerkstatt/Output/Rianna%20Wyrm/rianna-2026-11-02-set-01_Bild' + (index+1) + '.png',
  label: ['Aufmerksam','Freundlich','Nachdenklich','Überrascht','Skeptisch','Entschlossen','Besorgt','Heiter','Verärgert'][index]
}));
initCharacterImageSetEditor({imageSets:[
  {id:'standard',portrait:'/Stammbäume/assets/images/portraits/haus-wyrm/rianna-wyrm.jpg',emotes:qaAvatars},
  {id:'alltag',name:'Alltag und Gespräch',emotes:qaAvatars.slice(0,3)},
  {id:'ruestung',name:'In Rüstung mit Krähe',emotes:qaAvatars.slice(3,6)},
  {id:'gesten',name:'Eigenwillige Gesten',emotes:qaAvatars.slice(6)}
]});
qaUpdate();
document.getElementById('qa-reload').addEventListener('click', () => { initCharacterImageSetEditor(qaSaved); qaUpdate(); });
document.getElementById('qa-contribution-picker').addEventListener('click', event => {
  const button=event.target.closest('[data-image-set-id]');
  if(!button)return;qaSegment.imageSetId=button.dataset.imageSetId;qaUpdate();
});
</script></body></html>`, 'utf8');
