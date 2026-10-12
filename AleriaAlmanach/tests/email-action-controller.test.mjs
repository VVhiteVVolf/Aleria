import assert from 'node:assert/strict';
import test from 'node:test';
import { createEmailActionController, emailActionErrorMessage } from '../modules/auth/email-action-controller.js';

function fixture(operation = 'VERIFY_EMAIL') {
  const calls = [];
  const controller = createEmailActionController({ auth: {},
    checkActionCode: async (_auth, code) => { calls.push(['check', code]); return { operation, data: { email: 'person@example.test' } }; },
    applyActionCode: async (_auth, code) => { calls.push(['apply', code]); },
    verifyPasswordResetCode: async (_auth, code) => { calls.push(['check-reset', code]); return 'person@example.test'; },
    confirmPasswordReset: async (_auth, code, password) => { calls.push(['reset', code, password]); }
  });
  return { calls, controller };
}

test('verification validates the code and only applies it after the explicit confirmation', async () => {
  const { calls, controller } = fixture();
  const action = await controller.prepare('verifyEmail', 'one-time-code');
  assert.equal(action.email, 'person@example.test');
  assert.deepEqual(calls, [['check', 'one-time-code']]);
  await action.complete();
  assert.deepEqual(calls.at(-1), ['apply', 'one-time-code']);
  await assert.rejects(action.complete(), /schon/);
});

test('password reset and recovery preserve the correct Firebase action', async () => {
  const { calls, controller } = fixture();
  const reset = await controller.prepare('resetPassword', 'reset-code');
  await reset.complete('new-test-password');
  assert.deepEqual(calls, [['check-reset', 'reset-code'], ['reset', 'reset-code', 'new-test-password']]);
  const recovery = fixture('RECOVER_EMAIL');
  await (await recovery.controller.prepare('recoverEmail', 'recover-code')).complete();
  assert.deepEqual(recovery.calls.at(-1), ['apply', 'recover-code']);
});

test('unknown, missing and mismatched action types cannot consume a code; errors expose no server details', async () => {
  const { calls, controller } = fixture('PASSWORD_RESET');
  await assert.rejects(controller.prepare('verifyEmail', 'reset-code'), { code: 'auth/invalid-action-code' });
  await assert.rejects(controller.prepare('verifyEmail', ''), { code: 'auth/invalid-action-code' });
  await assert.rejects(controller.prepare('signIn', 'code'), { code: 'auth/invalid-action-code' });
  assert.equal(calls.some(call => call[0] === 'apply'), false);
  assert.match(emailActionErrorMessage({ code: 'auth/invalid-action-code', message: 'secret-code' }), /abgelaufen/);
  assert.equal(emailActionErrorMessage({ message: 'secret-code' }).includes('secret-code'), false);
});
