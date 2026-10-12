import { randomUUID } from 'node:crypto';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { defineSecret, defineString } from 'firebase-functions/params';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { sceneBackupDirectory, validateSceneModule } from './scene-backup-format.js';
import { createSceneBackupGitHub } from './scene-backup-github.js';
import { getFrozenSceneBackup } from './scene-backup-snapshot.js';

const githubToken = defineSecret('ALERIA_SCENE_BACKUP_GITHUB_TOKEN');
const githubRepository = defineString('ALERIA_SCENE_BACKUP_GITHUB_REPOSITORY', { default: 'VVhiteVVolf/Aleria' });
const githubBranch = defineString('ALERIA_SCENE_BACKUP_GITHUB_BRANCH', { default: 'master' });
const JOB_COLLECTION = 'scene_backup_jobs';
const MAX_ATTEMPTS = 8;
const LEASE_MS = 6 * 60 * 1000;

function assertBackupAccess(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  if (!['editor', 'moderator', 'admin'].includes(request.auth.token?.aleriaRole)) {
    throw new HttpsError('permission-denied', 'Szenenbackups benötigen die Firebase-Rolle Editor, Moderator oder Admin.');
  }
}

function publicState(job) {
  return { id: job.id, status: job.status, url: job.url || '', error: job.error || '', requestedAt: job.requestedAt, commentCount: job.summary?.commentCount ?? null };
}

export async function endSceneSessionOperation(request, { database = getFirestore(), now = Date.now(), newId = randomUUID, repository = 'VVhiteVVolf/Aleria', branch = 'master' } = {}) {
  assertBackupAccess(request);
  const threadId = String(request.data?.threadId || '');
  const moduleJson = JSON.stringify(request.data?.modulePayload || null);
  if (Buffer.byteLength(moduleJson) > 750_000) throw new HttpsError('invalid-argument', 'Der Modulstand ist für eine automatische Sicherung zu groß.');
  let location;
  try { location = validateSceneModule(JSON.parse(moduleJson), threadId); }
  catch (error) { throw new HttpsError('invalid-argument', error.message); }
  const turnRef = database.collection('comment_turns').doc(threadId);
  const jobId = newId();
  return database.runTransaction(async transaction => {
    const turn = (await transaction.get(turnRef)).data();
    if (turn?.current === 'ended' && turn.sceneBackup?.id) {
      const ref = database.collection(JOB_COLLECTION).doc(turn.sceneBackup.id);
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) throw new HttpsError('failed-precondition', 'Der Sicherungsauftrag fehlt. Bitte die Szene erneut öffnen und beenden.');
      const job = { ...snapshot.data(), id: snapshot.id };
      if (job.status === 'failed' || (job.status === 'working' && Number(job.leaseUntil) <= now)) {
        // A manual retry keeps the same immutable snapshot and GitHub destination.
        job.status = 'queued';
        job.error = '';
        job.attempts = 0;
        job.retryGeneration = (job.retryGeneration || 0) + 1;
        transaction.update(ref, { status: job.status, error: '', attempts: 0, retryGeneration: job.retryGeneration });
        transaction.set(turnRef, { sceneBackup: publicState(job) }, { merge: true });
      }
      return publicState(job);
    }
    const requestedAt = new Date(now).toISOString();
    const job = {
      id: jobId, threadId, moduleId: location.moduleId, moduleTitle: request.data.modulePayload.entry.title || '',
      moduleJson, requestedAt, createdBy: request.auth.uid,
      repository, branch,
      directory: sceneBackupDirectory(location.moduleId, jobId, requestedAt),
      status: 'queued', attempts: 0, retryGeneration: 0, createdAt: FieldValue.serverTimestamp()
    };
    transaction.create(database.collection(JOB_COLLECTION).doc(jobId), job);
    transaction.set(turnRef, { threadId, current: 'ended', updatedBy: request.auth.uid, updatedAt: FieldValue.serverTimestamp(), sceneBackup: publicState(job) }, { merge: true });
    return publicState(job);
  });
}

export const endSceneSession = onCall({ region: 'europe-west1', maxInstances: 3, concurrency: 5, timeoutSeconds: 60 }, request => endSceneSessionOperation(request, { repository: githubRepository.value(), branch: githubBranch.value() }));

async function updateJob(database, jobId, values) {
  const ref = database.collection(JOB_COLLECTION).doc(jobId);
  return database.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const job = { ...snapshot.data(), id: jobId, ...values };
    const turnRef = database.collection('comment_turns').doc(job.threadId);
    const turn = (await transaction.get(turnRef)).data();
    transaction.update(ref, values);
    if (turn?.sceneBackup?.id === jobId) transaction.set(turnRef, { sceneBackup: publicState(job) }, { merge: true });
  });
}

export async function processSceneBackupJob(jobId, { database = getFirestore(), bucket = getStorage().bucket(), github, now = Date.now } = {}) {
  const ref = database.collection(JOB_COLLECTION).doc(jobId);
  const job = await database.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) return null;
    const data = snapshot.data();
    if (['saved', 'failed'].includes(data.status)) return null;
    if (Number(data.leaseUntil) > now()) throw new Error('Der Sicherungsauftrag wird bereits verarbeitet.');
    const next = { ...data, id: jobId, status: 'working', attempts: (data.attempts || 0) + 1, leaseUntil: now() + LEASE_MS };
    transaction.update(ref, { status: next.status, attempts: next.attempts, leaseUntil: next.leaseUntil });
    return next;
  });
  if (!job) return;
  try {
    await updateJob(database, jobId, { status: 'working', error: '' });
    const snapshot = await getFrozenSceneBackup({ bucket, database, job });
    const result = await github.commitBackup({ directory: job.directory, files: snapshot.files, backupId: job.id, moduleTitle: job.moduleTitle, repository: job.repository, branch: job.branch });
    await updateJob(database, jobId, { status: 'saved', error: '', url: result.url, commitSha: result.commitSha, summary: snapshot.summary, leaseUntil: 0, savedAt: FieldValue.serverTimestamp() });
  } catch (error) {
    const retryable = error.retryable !== false && job.attempts < MAX_ATTEMPTS;
    const message = error.status
      ? `GitHub konnte die Sicherung nicht speichern (HTTP ${error.status}). Bitte die GitHub-Verbindung prüfen.`
      : 'Die Sicherung konnte nicht vollständig gespeichert werden. Der Auftrag und vorhandene Export bleiben erhalten.';
    await updateJob(database, jobId, { status: retryable ? 'retrying' : 'failed', error: message, leaseUntil: 0 });
    if (retryable) throw new Error('Temporärer Fehler beim Szenenbackup; automatischer Wiederholungsversuch.');
  }
}

export const writeSceneBackupToGitHub = onDocumentWritten({
  document: `${JOB_COLLECTION}/{jobId}`, region: 'europe-west1', secrets: [githubToken],
  retry: true, maxInstances: 2, concurrency: 1, timeoutSeconds: 300, memory: '1GiB'
}, async event => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  // Only a new queued generation starts work. Its own status writes cannot create loops.
  if (!after || after.status !== 'queued' || (before?.status === 'queued' && before.retryGeneration === after.retryGeneration)) return;
  const github = { commitBackup: options => createSceneBackupGitHub({ token: githubToken.value(), repository: options.repository, branch: options.branch }).commitBackup(options) };
  await processSceneBackupJob(event.params.jobId, { github });
});
