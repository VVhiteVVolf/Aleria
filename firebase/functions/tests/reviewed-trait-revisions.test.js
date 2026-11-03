import test from 'node:test';
import assert from 'node:assert/strict';
import { database } from './fixtures/combat-transaction-database.js';
import { commitItemRecordOperation } from '../src/items/commit-item-record.js';
import { planCharacterTraitPublication } from '../../../AleriaAlmanach/modules/character-trait-review/character-trait-publication-plan.mjs';
import { REVIEWED_CHARACTER_TRAITS } from '../../../AleriaAlmanach/modules/character-trait-review/reviewed-character-traits.js';
const auth={uid:'owner',token:{aleriaRole:'moderator'}};
test('The authoritative save rejects an old open sheet after the reviewed trait revision and permits an unrelated name edit',async()=>{
 const assignment=REVIEWED_CHARACTER_TRAITS.find(row=>row.name==='Gawain Draig');
 const before={id:assignment.onlineId,name:assignment.name,ownerUid:'owner',inventory:{items:[],revision:1},combatProfile:{revision:10,progression:{level:5},quirks:[{id:'old',name:'Alt'}],abilities:[{id:'gawain-muttersoehnchen',name:'Muttersöhnchen'}],conditions:[],hitPoints:{current:7},resources:[{id:'mana',current:1}]}};
 const plan=planCharacterTraitPublication({character:before,assignment,baseline:before,now:'2026-11-03T00:00:00.000Z'});
 const db=database({[`characters/${before.id}`]:plan.character}),snapshot=structuredClone([...db.data]);
 await assert.rejects(commitItemRecordOperation(db,auth,{id:before.id,operationId:'stale-editor',data:{combatProfile:before.combatProfile}}),error=>error.code==='aborted');
 assert.deepEqual([...db.data],snapshot);
 await commitItemRecordOperation(db,auth,{id:before.id,operationId:'rename-only',data:{name:'Gawain Draig'}});
 assert.deepEqual(db.data.get(`characters/${before.id}`).combatProfile,plan.character.combatProfile);
});
