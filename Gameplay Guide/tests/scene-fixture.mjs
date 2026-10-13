import { readFile } from 'node:fs/promises';
import { withEquippedCombatWeapon } from '../../AleriaAlmanach/modules/combat/combat-equipment-state.js';
import { resolveCombatProfile } from '../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { receipts } from '../../AleriaAlmanach/tests/fixtures/jungdrache-fixtures.mjs';
import { database } from '../../firebase/functions/tests/fixtures/combat-transaction-database.js';
import { commitCombatCommentOperation } from '../../firebase/functions/src/mechanics/commit-combat-comment.js';
import { prepareTestAction } from '../../firebase/functions/tests/integration/combat-test-actions.mjs';

const { characters } = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
const ylva = withEquippedCombatWeapon(characters.find(c => c.id === 'bSYZYAEOwiRgy44f6OmO'), 'ylva-speer', '');
const db = database({['characters/'+ylva.id]:ylva});
const prepared = await prepareTestAction({entryId:'local-guide-scene',actorRecord:ylva,targetRecords:[ylva],comments:[],actionId:'technique:ylva-aus-der-angriffslinie',dice:receipts()});
const committed = await commitCombatCommentOperation({auth:{uid:'local-test',token:{aleriaRole:'admin'}},data:prepared.payload},{database:db,nowClient:100});
const history = [{id:committed.id,...db.data.get('comments/'+committed.id)}];

export const sceneFixture = `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="styles/comments.css"><link rel="stylesheet" href="styles/comment-bubbles.css"><link rel="stylesheet" href="styles/comment-combat-mini-profile.css"><link rel="stylesheet" href="styles/combat-status.css"><link rel="stylesheet" href="styles/combat.css">
<style>body{margin:20px;background:#ecdcba;color:#382b20;font-family:Georgia}.comment-entry{display:flex;gap:18px}.comment-content{flex:1;min-width:0}#composer{max-width:900px;margin:30px auto}*{box-sizing:border-box}</style>
<body><main class="comments-scroll comment-tools-visible"><div class="comment-entry left" id="entry"></div></main><div id="composer"></div><script type="module">
import { resolveCombatProfile } from './modules/combat/combat-profile-resolver.js';
import { mountCombatComposer } from './modules/combat/ui/combat-ui.js';
let history=[]; const character=${JSON.stringify(ylva)}, threadId='local-guide-scene';
window.getAvailableCommentCharacters=()=>[character];
window.getAvailableCommentCharacterById=id=>id===character.id?character:null;
window.getCachedCommentsForThread=()=>history;
window.getCurrentCommentThread=()=>({kind:'session'});
window.getCurrentCommentThreadId=()=>threadId;
await import('./modules/combat/combat-controller.js');
await import('./modules/comments/comments-combat-mini-profile.js');
document.getElementById('entry').innerHTML=window.AleriaCommentCombatMiniProfile.renderPortrait({characterId:character.id,threadId,displayName:character.name,commentId:'visible',renderIndex:0,portraitMarkup:'<button>Ylva</button>'})+'<div class="comment-content"><h2>Ylva Wolfshorn</h2><p>Lokale Szenenprüfung</p></div>';
window.selectGuideAction=id=>{const actor=resolveCombatProfile(character,{actionId:'technique:'+id,includeAiSnapshot:false});mountCombatComposer({card:document.getElementById('composer'),segment:{id:'test',kind:'combat',combatActionId:actor.selectedAction.id},actor,actorReady:true,targets:[]});};
window.applyGuidePreparation=()=>{history=${JSON.stringify(history)};document.dispatchEvent(new CustomEvent('aleria:comments-updated',{detail:{threadId,comments:history}}));};
window.clearGuidePreparation=()=>{history.push({id:'expires',characterId:character.id,serverValidatedMechanics:true,combatStatus:{actorId:character.id,operation:'reset',after:{current:95,maximum:95,temporaryConditions:[]}}});document.dispatchEvent(new CustomEvent('aleria:comments-updated',{detail:{threadId,comments:history}}));};
window.selectGuideAction('ylva-schafthebel');window.guideSceneReady=true;
</script></html>`;
