import test from 'node:test';
import assert from 'node:assert/strict';
import {createPlacementState} from '../shared/placement-state.mjs';

const configuration=()=>({
 realm:'goldmund',
 realmLabel:'Goldmund',
 houseIds:['goldveld','roden','lanette','hohenritt'],
 seatIds:['thronholt','weinau'],
 initialPlacements:{goldveld:null,roden:null,lanette:null,hohenritt:null},
 lockedPlacements:{goldveld:'thronholt',roden:'thronholt'}
});

test('fixed houses keep their supplied seat through moves, undo and reset',()=>{
 const state=createPlacementState(configuration());
 const baseline={goldveld:'thronholt',roden:'thronholt',lanette:null,hohenritt:null};
 assert.deepEqual(state.current(),baseline);
 assert.equal(state.canMove('goldveld'),false);
 assert.equal(state.canMove('roden'),false);
 assert.equal(state.canMove('lanette'),true);
 assert.equal(state.canMove('unknown'),false);
 assert.equal(state.move('goldveld','weinau'),false);
 assert.equal(state.move('roden',null),false);
 assert.equal(state.canUndo(),false);
 assert.equal(state.move('lanette','weinau'),true);
 assert.equal(state.move('hohenritt','thronholt'),true);
 assert.equal(state.undo(),true);
 assert.deepEqual(state.current(),{...baseline,lanette:'weinau'});
 assert.equal(state.reset(),true);
 assert.deepEqual(state.current(),baseline);
 assert.equal(state.undo(),true);
 assert.deepEqual(state.current(),{...baseline,lanette:'weinau'});
});

test('export and import preserve fixed seats and reject altered, missing or foreign assignments atomically',()=>{
 const first=createPlacementState(configuration()),second=createPlacementState(configuration());
 first.move('lanette','weinau');
 const valid=JSON.parse(first.serialize());
 second.restore(valid);
 assert.deepEqual(second.current(),first.current());
 assert.equal(valid.schemaVersion,1);
 assert.equal(valid.realm,'goldmund');
 const unchanged=second.current();
 const noHistory=createPlacementState(configuration());
 const invalid=[
  {...valid,realm:'weisenfluh'},
  {...valid,schemaVersion:2},
  {...valid,placements:{...valid.placements,goldveld:'weinau'}},
  {...valid,placements:{...valid.placements,roden:null}},
  {...valid,placements:{lanette:'weinau'}},
  {...valid,placements:{...valid.placements,lanette:'unknown'}},
  {...valid,placements:{...valid.placements,unknown:null}},
  {...valid,placements:[]}
 ];
 for(const value of invalid){
  assert.throws(()=>second.restore(value));
  assert.deepEqual(second.current(),unchanged);
  assert.throws(()=>noHistory.restore(value));
  assert.equal(noHistory.canUndo(),false);
 }
 assert.equal(second.undo(),true);
 assert.equal(second.current().lanette,null);
 assert.equal(second.canUndo(),false);
});

test('state isolates caller data, snapshots and imported objects',()=>{
 const config=configuration(),state=createPlacementState(config);
 config.lockedPlacements.roden='weinau';
 config.initialPlacements.lanette='weinau';
 config.houseIds.push('extra');
 config.seatIds.push('new-seat');
 const snapshot=state.current();
 snapshot.roden='weinau';
 assert.equal(state.current().roden,'thronholt');
 assert.equal(state.current().lanette,null);
 assert.throws(()=>state.move('extra','weinau'));
 assert.throws(()=>state.move('lanette','new-seat'));
 const value=JSON.parse(state.serialize());
 value.placements.lanette='weinau';
 state.restore(value);
 value.placements.lanette=null;
 assert.equal(state.current().lanette,'weinau');
 assert.equal(state.move('roden','weinau'),false);
});

test('bad initial or fixed-seat configuration fails before a draft can be used',()=>{
 assert.throws(()=>createPlacementState({...configuration(),houseIds:['roden','roden']}));
 assert.throws(()=>createPlacementState({...configuration(),initialPlacements:{roden:null}}));
 assert.throws(()=>createPlacementState({...configuration(),lockedPlacements:{roden:'unknown'}}));
 assert.throws(()=>createPlacementState({...configuration(),lockedPlacements:{unknown:'thronholt'}}));
});

test('a composed owner can disable the internal undo history and restore its own snapshots',()=>{
 const state=createPlacementState({...configuration(),trackHistory:false});
 const baseline=JSON.parse(state.serialize());
 assert.equal(state.move('lanette','weinau'),true);
 assert.equal(state.canUndo(),false);
 assert.equal(state.undo(),false);
 state.restore(baseline);
 assert.equal(state.current().lanette,null);
 assert.equal(state.move('lanette','weinau'),true);
 assert.equal(state.reset(),true);
 assert.equal(state.canUndo(),false);
 assert.deepEqual(state.current(),baseline.placements);
});
