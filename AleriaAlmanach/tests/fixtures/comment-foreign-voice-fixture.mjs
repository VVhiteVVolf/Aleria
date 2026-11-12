import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parse, serialize } = require('../../node_modules/parse5');

const scripts = [
  'core/content-safety.js',
  'archive/archive-view.js',
  'app/dialog-manager.js',
  'image-library/image-library-model.js',
  'characters/character-image-sets.js',
  'characters/character-comment-picker.js',
  'language/language-script-registry.js',
  'scene-time/scene-time-state.js',
  'comments/comments-foreign-voice.js',
  'comments/comments-render.js',
  'comments/comments-markup.js',
  'comments/comments-spell-fonts.js',
  'comments/comments-form-state.js',
  'comments/comments-toolbar.js',
  'comments/comments-segment-base.js',
  'comments/comments-foreign-voice-ui.js',
  'comments/comments-segments.js',
  'comments/comments-draft.js',
  'comments/comments-preview.js',
  'comments/comments-richtext.js',
  'comments/comments-form.js',
  'comments/comments-submit.js',
  'comments/comments-edit-state.js',
  'comments/comments-edit-segments.js',
  'comments/comments-edit-preview.js',
  'comments/comments-edit.js',
  'comments/comments-edit-character-picker.js',
  'comments/comments-edit-submit.js',
  'comments/comments-segment-events.js',
  'comments/comments-action-events.js',
  'comments/comments-input-events.js',
  'comments/comments-overlay-events.js'
];

export const FOREIGN_VOICE_FIXTURE_SOURCES = [
  'AleriaAlmanach.html', 'styles.css', 'styles/modal.css', 'styles/comments.css',
  'styles/comment-bubbles.css', 'styles/comment-character-picker.css',
  'styles/comment-composer.css', 'styles/comments-foreign-voice.css',
  'modules/comments/comments-mechanical-request.js',
  ...scripts.map(path => `modules/${path}`)
];

function findById(node, id) {
  if (node.attrs?.some(attribute => attribute.name === 'id' && attribute.value === id)) return node;
  for (const child of node.childNodes || []) {
    const found = findById(child, id);
    if (found) return found;
  }
  return null;
}

export async function buildForeignVoiceFixture() {
  const source = await readFile(new URL('../../AleriaAlmanach.html', import.meta.url), 'utf8');
  const document = parse(source);
  const overlays = ['comment-form-overlay', 'edit-comment-overlay'].map(id => {
    const node = findById(document, id);
    if (!node) throw new Error(`Missing production form: ${id}`);
    return serialize({ nodeName: '#document-fragment', childNodes: [node] });
  });
  const foreignStyles = source.match(/<link[^>]+href="([^"]*foreign[^\"]*\.css[^\"]*)"[^>]*>/g) || [];
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <base href="/AleriaAlmanach/">
    <title>Fremde Stimme · isolierte Browserprüfung</title>
    <link rel="stylesheet" href="./styles.css"><link rel="stylesheet" href="./styles/modal.css">
    <link rel="stylesheet" href="./styles/comments.css"><link rel="stylesheet" href="./styles/comment-bubbles.css">
    <link rel="stylesheet" href="./styles/comment-character-picker.css"><link rel="stylesheet" href="./styles/comment-composer.css">
    ${foreignStyles.join('\n')}
    <style>body{margin:0;background:#f4eedf}#fixture-controls,#fixture-feed{max-width:1080px;margin:20px auto;padding:16px}#fixture-feed{background:#f8f4e9}#fixture-controls button{padding:10px 16px}</style>
    </head><body><div id="fixture-controls"><button data-action="open-comment-form">Beitrag verfassen</button></div><main id="fixture-feed"></main>
    ${overlays.join('\n')}
    <script>
      // This adapter replaces external actor loading and persistence only.
      // All segment, form, draft, preview, rendering and delegated UI logic below
      // is loaded from the current production sources without rewriting it.
      const fixtureCharacter = {
        id:'foreign-voice-test-main',name:'Mara Beispiel',title:'Reisende',entityType:'character',
        portrait:'./public/assets/comment-icons/performance.png',
        emotes:[{label:'Lächeln',img:'./public/assets/comment-icons/interact.png'}],
        imageSets:[{id:'standard',name:'Standard',portrait:'./public/assets/comment-icons/performance.png',
          emotes:[{label:'Lächeln',img:'./public/assets/comment-icons/interact.png'}]},
          {id:'travel',name:'Unterwegs',portrait:'./public/assets/comment-icons/consume.png',
          emotes:[{label:'Winken',img:'./public/assets/comment-icons/performance-button.png'}]}],
        activeImageSetId:'standard'
      };
      window.fixtureSaved=JSON.parse(localStorage.getItem('foreign-voice-fixture-saved')||'[]');
      window.fixtureStatuses=[];
      function getAvailableCommentCharacters(){return [fixtureCharacter]}
      function getAvailableCommentCharacterById(id){return id===fixtureCharacter.id?fixtureCharacter:null}
      function getAvailableCommentCharacterByName(name){return name===fixtureCharacter.name?fixtureCharacter:null}
      function normalizeCharacterPlayerOwner(){return ''}
      function getCharacterPlayerOwnerLabel(){return ''}
      function isCharacterCommentedInCurrentModule(){return false}
      function getCurrentCommentThreadId(){return 'isolated-foreign-voice-browser'}
      function getCurrentCommentThread(){return {threadId:getCurrentCommentThreadId(),formTitle:'Fremde Stimme · Szenenbeitrag'}}
      async function loadSceneActorData(){}
      function getNextCommentOrderKey(){return fixtureSaved.length+1}
      function getCommentShowcaseItem(){return null}
      function getCommentFazitItem(){return null}
      function getCommentModuleInsertItem(){return null}
      function getCommentAttachmentItem(){return null}
      function loadSidebarFeed(){}
      function requestCommentAutoScroll(){}
      function showAppStatus(...args){fixtureStatuses.push(args)}
      function getFriendlyErrorMessage(error){return error.message}
      function fixturePersist(){localStorage.setItem('foreign-voice-fixture-saved',JSON.stringify(fixtureSaved))}
      async function loadCommentsIntoPage(){document.getElementById('fixture-feed').innerHTML=fixtureSaved.map((comment,index)=>renderCommentBubble(comment,index)).join('')}
      async function getCommentBackend(){return {
        async addComment(entryId,charName,charTitle,portrait,text,code,narrator,metadata){
          const record=structuredClone({id:'fixture-comment-'+(fixtureSaved.length+1),entryId,charName,charTitle,portrait,text,narrator,...metadata});
          fixtureSaved.push(record);fixturePersist();return {id:record.id};
        },
        async verifyCommentCode(id,code){if(code!=='7777')throw Error('Falscher Code');const record=fixtureSaved.find(value=>value.id===id);if(!record)throw Error('Nicht gefunden');return structuredClone(record)},
        async updateComment(id,updates){const index=fixtureSaved.findIndex(value=>value.id===id);if(index<0)throw Error('Nicht gefunden');fixtureSaved[index]={...fixtureSaved[index],...structuredClone(updates)};fixturePersist()}
      }}
    </script>
    ${scripts.map(path => `<script src="./modules/${path}"></script>`).join('\n')}
    <script>loadCommentsIntoPage();window.fixtureReady=true;</script></body></html>`;
}
