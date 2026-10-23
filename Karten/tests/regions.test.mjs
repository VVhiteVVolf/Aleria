import test from 'node:test';
import assert from 'node:assert/strict';
import { createRegionSession } from '../modules/regions/region-session.mjs';
import { validateRegion, validateRegions, regionPath, orderedRegions, nearestSegment } from '../modules/regions/region-model.mjs';

const area = () => ({ id:'coast',name:'Küstenmark',kind:'area',color:'#a74732',opacity:.25,parentId:'',paths:[[[0,0],[1,0],[1,1],[0,1]]],source:{markerId:'source-id'} });

test('region drafts isolate vertices and preserve source IDs until explicitly committed', () => {
  const original = area();
  const session = createRegionSession(original);
  session.select(0,1);session.beginMove();session.move([.7,.1]);
  assert.deepEqual(original.paths[0][1],[1,0]);
  assert.equal(session.dirty(),true);
  assert.equal(session.draft().source.markerId,'source-id');
  session.undo();
  assert.equal(session.dirty(),false);
  assert.deepEqual(session.draft(),original);
});

test('drawing requires a nonzero polygon or at least two boundary points', () => {
  const session = createRegionSession({...area(),paths:[[]]}, {isNew:true});
  session.add([0,0]);session.add([1,0]);
  assert.throws(()=>session.finish(),/mindestens 3/);
  session.add([1,1]);session.finish();
  assert.equal(session.drawing(),false);
  assert.doesNotThrow(()=>validateRegion({...area(),kind:'boundary',paths:[[[0,0],[1,0]]]}));
  assert.throws(()=>validateRegion({...area(),paths:[[[0,0],[.5,0],[1,0]]]}),/Ausdehnung/);
});

test('vertex insertion projects onto the nearest edge, while removal keeps a valid boundary', () => {
  const session = createRegionSession(area());
  session.startInsertion();session.insert([.6,.05]);
  assert.deepEqual(session.draft().paths[0][1],[.6,0]);
  session.remove();
  assert.equal(session.draft().paths[0].length,4);
  assert.deepEqual(nearestSegment([[[0,0],[1,0]]],[.4,.3],false).point,[.4,0]);
});

test('multiple outline parts stay separate and open borders do not become artificial filled territories', () => {
  const region={...area(),kind:'boundary',paths:[[[0,0],[1,0]],[[.5,.5],[1,1]]]};
  const path=regionPath(region,400,200);
  assert.equal(path,'M0 0L400 0M200 100L400 200');
  assert.doesNotMatch(path,/Z/);
  assert.equal(regionPath(area(),400,200),'M0 0L400 0L400 200L0 200Z');
});

test('parent validation prevents cycles, dangling parents and duplicate source entries', () => {
  const parent=area();const child={...area(),id:'harbor',parentId:'coast'};
  assert.doesNotThrow(()=>validateRegions([parent,child]));
  assert.throws(()=>validateRegions([{...parent,parentId:'harbor'},child]),/Kreis/);
  assert.throws(()=>validateRegions([{...child,parentId:'missing'}]),/nicht mehr/);
  assert.throws(()=>validateRegions([parent,parent]),/doppelte/);
  assert.deepEqual(orderedRegions([child,parent]).map(({region,depth})=>[region.id,depth]),[['coast',0],['harbor',1]]);
});

test('finite coordinates and opacity are checked before import without rounding existing vertices', () => {
  const region=area();region.paths[0][0]=[-.001234567,0];
  assert.equal(validateRegion(region).paths[0][0][0],-.001234567);
  assert.throws(()=>validateRegion({...area(),opacity:2}),/Deckkraft/);
  assert.throws(()=>validateRegion({...area(),paths:[[[0,0],[1,0],[NaN,1]]]}),/Koordinaten/);
});
