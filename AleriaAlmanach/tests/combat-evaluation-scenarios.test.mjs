import test from 'node:test';
import assert from 'node:assert/strict';
import { fourStrikes, selfCounter } from './fixtures/combat-evaluation-scenarios.mjs';
import { getEvaluationAttackRows, getEvaluationScenario, getRecordedEffectCards, getRecordedDamageInstances } from '../modules/combat/ui/combat-evaluation-model.js';
import { renderCombatEvaluation } from '../modules/combat/ui/combat-ui.js';
import { renderEvaluationStats } from '../modules/combat/ui/combat-evaluation-stats.js';
import { renderEvaluationLedger } from '../modules/combat/ui/combat-evaluation-ledger.js';

test('Vier Fänge zeigt alle vier gespeicherten Würfe und ordnet nur dem zweiten Treffer 8 roh / 6 angewandt zu', () => {
  const before=structuredClone(fourStrikes), rows=getEvaluationAttackRows(fourStrikes);
  assert.deepEqual(rows.map(r=>r.attack.total),[12,20,14,10]);
  assert.deepEqual(rows.map(r=>r.attack.hit),[false,true,false,false]);
  assert.equal(rows[0].fallbackDamage,null); assert.equal(rows[0].damage.length,0);
  assert.equal(rows[1].damage[0].raw,8); assert.equal(rows[1].damage[0].applied,6);
  const html=renderCombatEvaluation({resolution:fourStrikes});
  assert.match(html, /<span>Angriffsfolge<\/span><strong>1 \/ 4<\/strong>/);
  assert.match(html, /56 → 50/); assert.match(html,/1 von 4 Angriffen trifft Nudd/);
  assert.match(html,/Goldene Wacht/); assert.match(html,/−2/);
  assert.ok(html.indexOf('Folgeangriff 3')<html.indexOf('class="combat-evaluation-ledger"'));
  assert.match(html,/Gespeicherte Erzählung/); assert.deepEqual(fourStrikes,before);
});

test('Entwaffnende Klaue ist eine blaue Selbstvorbereitung ohne Dummy-W20 oder unveränderte TP', () => {
  const before=structuredClone(selfCounter), html=renderCombatEvaluation({resolution:selfCounter});
  assert.equal(getEvaluationScenario(selfCounter).state,'self');
  assert.match(html,/data-state="self"/); assert.match(html,/Selbstwirkung · Konter vorbereitet/);
  assert.match(html,/Bis zum Ende des nächsten eigenen Beitrags/);
  assert.match(html,/Rettung bei späterem Kontertreffer/); assert.match(html,/SG 13/);
  assert.doesNotMatch(html,/1d20\+5|Ziel-TP|50 → 50|<strong>Automatisch<\/strong>/);
  assert.ok(!getRecordedEffectCards(selfCounter).some(c=>c.role==='Entwaffnung'));
  assert.deepEqual(selfCounter,before,'Historische Kosten, Konter-SG und Beschreibungen bleiben unverändert');
});

test('Betäubung und tatsächlich erfolgte Entwaffnung zeigen Ziel, Wirkung und Dauer', () => {
  for(const condition of [{id:'stun',name:'Betäubt',blockedResource:'action',description:'Die Hauptaktion ist gesperrt.',duration:'Bis zum nächsten eigenen Beitrag'}, {id:'disarm',name:'Entwaffnet',disarm:true,description:'Der Dreizack liegt aufnehmbar in der Szene.',duration:'Bis zum Aufheben'}]) {
    const resolution={...fourStrikes,followUpAttacks:[],targetConditionSnapshot:{before:[],after:[condition],applied:condition},effectResults:[{effect:{type:'apply-condition'},condition,applied:true,recipient:'target'}]};
    const html=renderCombatEvaluation({resolution});
    assert.match(html,new RegExp(condition.name)); assert.match(html,new RegExp(condition.duration));
    assert.match(html,/Zustandsänderungen/);
  }
});

test('Mehrere Schadensarten bleiben getrennt und verwenden ihre jeweiligen verbuchten Schutzwerte', () => {
  const effects=[['Stich',7,5],['Feuer',4,3]].map(([damageType,raw,incoming],i)=>({effect:{id:'part-'+i,type:'damage',damageType},roll:{notation:i?'1d4':'1d8',total:raw},applied:{incoming,rawIncoming:raw,hitPointDamage:incoming}}));
  const resolution={...fourStrikes,followUpAttacks:[],attack:{...fourStrikes.attack,hit:true},effectResults:effects,damage:{total:8,rawTotal:11}};
  const html=renderEvaluationStats(resolution);
  assert.match(html,/Gesamtschaden/); assert.match(html,/Schadensinstanzen & Abwehr/);
  assert.match(html,/1\. Stich/); assert.match(html,/2\. Feuer/);
  assert.deepEqual(getRecordedDamageInstances(resolution).map(d=>[d.damageType,d.raw,d.applied]),[['Stich',7,5],['Feuer',4,3]]);
});

test('Flächenwirkung benennt das konkrete Ziel und dessen eigene Rettung', () => {
  const resolution={...fourStrikes,targetName:'Ziel <Nord>',multiTargetCount:3,multiTargetIndex:1,followUpAttacks:[],attack:{...fourStrikes.attack,resolutionMode:'saving-throw',saveSucceeded:true,total:19,targetDefense:18}};
  const html=renderCombatEvaluation({resolution});
  assert.match(html,/Flächenwirkung · Ziel 2\/3 · Ziel &lt;Nord&gt;/);
  assert.match(html,/Rettungswurf: W20/); assert.match(html,/Rettung gelungen/);
});

test('Selbstheilung zeigt die tatsächlich geänderten eigenen TP statt eines unveränderten Ziel-Snapshots', () => {
  const resolution={...selfCounter,targetConditionSnapshot:null,effectResults:[{effect:{type:'healing'},applied:{restored:5},recipient:'actor'}],actorHitPointSnapshot:{before:{current:50,temporary:0},after:{current:55,temporary:0}}};
  const html=renderCombatEvaluation({resolution});
  assert.match(html,/Selbstheilung/); assert.match(html,/50 → 55/); assert.match(html,/\+5 TP/);
  assert.doesNotMatch(html,/50 → 50/);
});

test('Selbstschutz zeigt temporäre TP ohne einen erfundenen Trefferwurf oder HP-Verlust', () => {
  const resolution={...selfCounter,targetConditionSnapshot:null,effectResults:[{effect:{type:'temporary-hit-points'},applied:{granted:7},recipient:'actor'}],actorHitPointSnapshot:{before:{current:50,temporary:0},after:{current:50,temporary:7}}};
  const html=renderCombatEvaluation({resolution});
  assert.match(html,/Schutz gewährt/); assert.match(html,/0 → 7/);
  assert.doesNotMatch(html,/50 → 50|1d20\+5/);
});

test('Alte Folgen ohne Anwendungsbelege erfinden keine Schadensverteilung aus der Gesamtsumme', () => {
  const resolution={...fourStrikes,effectResults:[]};
  const rows=getEvaluationAttackRows(resolution);
  assert.equal(rows[0].fallbackDamage,null); assert.equal(rows[1].damage.length,0);
  assert.equal(rows[1].fallbackDamage.total,8);
  assert.match(renderEvaluationStats(resolution),/Kein eigener Anwendungsbeleg/);
});

test('Ein vorbereiteter Konter wird nicht durch bloßes Fortschreiben einer Zustandsdauer neu ausgelöst', () => {
  const condition=selfCounter.effectResults[0].condition;
  const resolution={actorId:'a',targetId:'b',attack:{hit:false},targetConditionSnapshot:{before:[condition],after:[{...condition,duration:'Ein weiterer Beitrag'}]}};
  const cards=getRecordedEffectCards(resolution);
  assert.equal(cards.length,1); assert.equal(cards[0].operation,'updated'); assert.ok(!cards[0].counter);
});
