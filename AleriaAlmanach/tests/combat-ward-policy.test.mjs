import test from 'node:test';
import assert from 'node:assert/strict';
import { getCombatWardDeflectionPolicy } from '../modules/combat/combat-ward-policy.js';
import { resolveCombatWard } from '../modules/combat/combat-ward-resolution.js';
import { describeCombatWardDeflection } from '../modules/combat/ui/combat-ward-presentation.js';
import { renderCombatCondition } from '../modules/combat-status/combat-status-view.js';

const cases = [[0, 0], [1, 1], [2, 1], [3, 1], [47, 9], [50, 10], [67, 13], [98, 20], [99, 20], [100, 20]];
const ward = chance => ({ id: 'ward', name: 'Abwehr', ward: { enabled: true, charges: 2, deflectChance: chance } });
const context = { actor: { name: 'Angreifer' }, target: { name: 'Ziel' } };

test('ward projections agree with all twenty outcomes, including rounded guarantees with a real roll', async () => {
  for (const [chance, threshold] of cases) {
    const policy = getCombatWardDeflectionPolicy(chance);
    assert.equal(policy.threshold, threshold, `${chance} % threshold`);
    assert.equal(policy.effectiveChance, threshold * 5);
    assert.equal(policy.requiresRoll, chance > 0 && chance < 100);
    assert.equal(policy.automaticDeflection, chance === 100);
    let deflections = 0;
    for (let natural = 1; natural <= 20; natural++) {
      const condition = ward(chance), original = structuredClone(condition);
      let calls = 0;
      const result = await resolveCombatWard({ ...context, attack: { hit: true }, conditions: [condition],
        dice: { async rollWardDeflection(request) { calls++; assert.equal(request.threshold, threshold); return { natural, id: `roll-${natural}` }; } } });
      deflections += Number(result.wardResolution.deflected);
      assert.equal(calls, Number(policy.requiresRoll), `${chance} % roll count`);
      assert.equal(result.wardResolution.roll?.threshold ?? null, policy.requiresRoll ? threshold : null);
      assert.equal(result.wardResolution.chargesAfter, 2 - Number(result.wardResolution.deflected));
      assert.deepEqual(condition, original, 'preview preserves the stored ward');
    }
    assert.equal(deflections, threshold, `${chance} % effective W20 outcomes`);
  }
});

test('ward cards communicate effective odds, configured differences and critical break independently', () => {
  assert.equal(describeCombatWardDeflection(ward(67).ward), 'Ablenkung 65 % (W20 ≤ 13; eingetragen 67 %)');
  assert.equal(describeCombatWardDeflection(ward(1).ward), 'Ablenkung 5 % (W20 ≤ 1; eingetragen 1 %)');
  assert.equal(describeCombatWardDeflection(ward(98).ward), 'Ablenkung 100 % (W20 ≤ 20; eingetragen 98 %)');
  assert.equal(describeCombatWardDeflection(ward(100).ward), 'Ablenkung 100 % (ohne Wurf)');
  assert.equal(describeCombatWardDeflection(ward(0).ward), 'Ablenkung 0 % (kein Ablenkungswurf)');
  const condition = ward(67);
  condition.ward.breaksOnCriticalHit = true;
  const html = renderCombatCondition(condition, { temporary: true });
  assert.match(html, /Ablenkung 65 % \(W20 ≤ 13; eingetragen 67 %\)/);
  assert.match(html, /2 Abwehrladungen/);
  assert.match(html, /Magische Abwehr zerbricht bei einem kritischen Treffer/);
  assert.ok(!renderCombatCondition({ ...condition, ward: { ...condition.ward, enabled: false } }).includes('Ablenkung'));
});

test('critical break precedes deflection even with a guaranteed ward and creates no roll', async () => {
  for (const chance of [0, 98, 100]) {
    const condition = ward(chance);
    condition.ward.breaksOnCriticalHit = true;
    const result = await resolveCombatWard({ ...context, attack: { hit: true, criticalSuccess: true }, conditions: [condition],
      dice: { rollWardDeflection() { throw new Error('Critical shattering must not roll deflection'); } } });
    assert.equal(result.attack.hit, true);
    assert.equal(result.wardResolution.shattered, true);
    assert.equal(result.wardResolution.roll, null);
    assert.deepEqual(result.conditions, []);
  }
});
