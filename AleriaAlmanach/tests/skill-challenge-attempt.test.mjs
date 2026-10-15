import test from 'node:test';
import assert from 'node:assert/strict';
import { createContext, runInContext } from 'node:vm';
import { readFile } from 'node:fs/promises';
import { getChallengeAttemptChoices, getChallengeAttemptSettings } from '../modules/skill-checks/skill-challenge-attempt.js';
import { getSkillsForCommentKind } from '../modules/skill-checks/skill-check-model.js';

const skills = ['persuasion', 'intimidation', 'deception', 'performance', 'seduction'];
const challenge = { id: 'herausforderung:guard:entry', authorKey: 'herausforderung:guard', difficulty: 15, preferredSkills: skills };

test('five skills from four contribution kinds remain selectable for one challenge', () => {
  assert.deepEqual(getChallengeAttemptChoices(challenge).map(skill => skill.id), skills);
  for (const skillId of skills) {
    const settings = getChallengeAttemptSettings(challenge, skillId);
    assert.equal(settings.skillId, skillId);
    assert.equal(settings.skillTargetChallengeId, challenge.id);
    assert.equal(settings.skillDifficulty, 15);
    assert.ok(getSkillsForCommentKind(settings.kind).some(skill => skill.id === skillId));
  }
  assert.equal(getChallengeAttemptSettings(challenge, 'intimidation').kind, 'shout');
  assert.equal(getChallengeAttemptSettings(challenge, 'seduction').kind, 'flirt');
});

test('unknown, duplicate and no longer preferred skills cannot silently select a different ability', () => {
  assert.equal(getChallengeAttemptSettings(challenge, 'insight'), null);
  assert.equal(getChallengeAttemptSettings(challenge, 'missing'), null);
  assert.equal(getChallengeAttemptSettings({ ...challenge, preferredSkills: [] }), null);
  assert.equal(getChallengeAttemptSettings({ preferredSkills: skills }), null);
  assert.deepEqual(getChallengeAttemptChoices({ preferredSkills: ['missing', 'deception', 'deception'] }).map(skill => skill.id), ['deception']);
  assert.deepEqual(getChallengeAttemptChoices({ preferredSkills: 'deception' }), []);
});

test('existing callers without an explicit selection retain their original default', () => {
  assert.equal(getChallengeAttemptSettings(challenge).skillId, 'persuasion');
});

test('the real composer bridge preserves the selected skill and restored text, without rolling', async () => {
  let lookups = [], saves = 0;
  const context = createContext({ window: { AleriaSkillChecks: { getChallengeAttemptSettings: (target, id) => {
    lookups.push(id); return getChallengeAttemptSettings(target, id);
  } } }, challenge, _commentSegments: [{ kind: 'speech', text: 'Bestehender Entwurf', mechanicMode: 'normal' }],
    SCENE_TIME_DEFAULT_SEGMENT_SECONDS: 30, COMMENT_LANGUAGE_DEFAULT: 'common', setCommentMode() {}, persistCommentDraft() { saves++; },
    makeCommentSegment: (kind, text, emote, side, time, language, color, settings) => ({ kind, text, ...settings }) });
  runInContext(await readFile(new URL('../modules/comments/comments-form.js', import.meta.url), 'utf8'), context);
  runInContext("openCommentForm = () => {}; openCommentFormForSkillChallenge(challenge, 'seduction');", context);
  assert.equal(context._commentSegments.length, 2);
  assert.equal(context._commentSegments[0].text, 'Bestehender Entwurf');
  assert.equal(context._commentSegments[1].skillId, 'seduction');
  assert.equal(context._commentSegments[1].kind, 'flirt');
  assert.equal(saves, 1);
  runInContext("openCommentFormForSkillChallenge(challenge, 'insight');", context);
  assert.equal(context._commentSegments.length, 2);
  assert.equal(saves, 1);
  assert.deepEqual(lookups, ['seduction', 'insight']);
});
