(function () {
  const pending = new Set();
  const waiting = new Set(['queued', 'working', 'retrying']);

  function panels(threadId) {
    return Array.from(document.querySelectorAll('.comment-turn-bar')).filter(bar => bar.dataset.commentThreadId === threadId);
  }

  function refreshButtons(threadId) {
    panels(threadId).forEach(bar => {
      const button = bar.querySelector('[data-turn-value="ended"]');
      if (!button) return;
      button.disabled = pending.has(threadId);
      button.textContent = bar.dataset.sceneBackupStatus === 'failed' ? 'Sicherung erneut versuchen'
        : waiting.has(bar.dataset.sceneBackupStatus) ? 'Sicherungsstatus prüfen' : 'Sitzung beendet';
    });
  }

  function renderStatus(threadId, turn = {}, initial = false) {
    const backup = turn.sceneBackup;
    panels(threadId).forEach(bar => {
      const target = bar.querySelector('[data-scene-backup-status]');
      if (!target) return;
      // A fast worker may have already published a newer subscription update.
      if (initial && bar.dataset.sceneBackupId === backup?.id && bar.dataset.sceneBackupStatus) return;
      const status = String(backup?.status || '');
      bar.dataset.sceneBackupId = backup?.id || '';
      bar.dataset.sceneBackupStatus = status;
      target.hidden = !status;
      if (!status) return;
      const labels = {
        queued: 'GitHub-Sicherung vorgemerkt …', working: 'GitHub-Sicherung wird erstellt …',
        retrying: 'GitHub-Sicherung wartet auf einen erneuten Versuch …',
        failed: backup.error || 'GitHub-Sicherung fehlgeschlagen. Bitte erneut versuchen.',
        saved: `Auf GitHub gesichert${Number.isInteger(backup.commentCount) ? ` · ${backup.commentCount} Kommentare` : ''}`
      };
      target.textContent = labels[status] || 'GitHub-Sicherungsstatus unbekannt.';
      if (status === 'saved' && /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/tree\//.test(backup.url || '')) {
        const link = document.createElement('a');
        link.href = backup.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Backup ansehen';
        target.append(' · ', link);
      }
    });
    refreshButtons(threadId);
  }

  async function endSession(threadId, backend) {
    if (pending.has(threadId)) return;
    if (!backend?.endSceneSession) throw new Error('Die GitHub-Sicherung benötigt eine Online-Verbindung zu Firebase.');
    const location = parseCommentThreadLocation(threadId);
    const modulePayload = buildModuleExportPayload(location.baseEntryId);
    if (!modulePayload) throw new Error('Der Modulstand für die Szenensicherung ist nicht verfügbar.');
    pending.add(threadId);
    refreshButtons(threadId);
    try {
      const backup = await backend.endSceneSession(threadId, modulePayload);
      renderStatus(threadId, { sceneBackup: backup }, true);
      if (typeof showAppStatus === 'function') showAppStatus(backup.status === 'saved' ? 'Szenenbackup ist auf GitHub gespeichert.' : 'Sitzung beendet. Die GitHub-Sicherung wird serverseitig verarbeitet.', 'success');
      return backup;
    } finally {
      pending.delete(threadId);
      refreshButtons(threadId);
    }
  }

  window.AleriaSceneBackup = Object.freeze({ endSession, renderStatus });
})();
