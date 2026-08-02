// Scene-local creature instances for the comment composer.
// Creature records remain reusable templates; this module owns only the cast of
// the currently drafted scene contribution and gives every occurrence a stable ID.
(function initCommentSceneCast(global) {
  const createActors = [];
  const editActors = [];

  function clone(value) {
    if (!value || typeof value !== 'object') return value;
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function toRoman(value) {
    let remaining = Math.max(1, Math.min(3999, Number(value) || 1));
    const digits = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    return digits.reduce((result, [amount, digit]) => {
      while (remaining >= amount) {
        result += digit;
        remaining -= amount;
      }
      return result;
    }, '');
  }

  function baseCreatureName(value) {
    return String(value || 'Kreatur').replace(/\s+(?:[IVXLCDM]+|\d+)\.?\s*$/i, '').trim() || 'Kreatur';
  }

  function safeIdPart(value) {
    return String(value || 'kreatur')
      .toLocaleLowerCase('de')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'kreatur';
  }

  function getCurrentTemplate() {
    if (typeof _selectedCharId === 'undefined' || !_selectedCharId) return null;
    const actor = global.getAvailableCommentCharacterById?.(_selectedCharId);
    return actor?.entityType === 'creature' ? actor : null;
  }

  function normalizeStoredActor(value = {}) {
    const source = value && typeof value === 'object' ? value : {};
    const sourceId = String(source.sourceCreatureId || source.sceneActorSourceId || source.templateId || source.creatureId || '').trim();
    const id = String(source.id || source.sceneActorId || '').trim();
    if (!id || !sourceId) return null;
    const template = global.getAvailableCommentCharacterById?.(sourceId);
    return {
      ...(template ? clone(template) : {}),
      ...clone(source),
      id,
      sourceCreatureId: sourceId,
      entityType: 'creature',
      name: String(source.name || source.charName || template?.name || 'Kreatur').trim().slice(0, 140),
      title: String(source.title || source.charTitle || template?.title || '').trim().slice(0, 180),
      portrait: String(source.portrait || template?.portrait || ''),
      emotes: Array.isArray(source.emotes) ? clone(source.emotes) : clone(template?.emotes || []),
      combatProfile: clone(source.combatProfile || template?.combatProfile || {})
    };
  }

  function notifyChange() {
    render();
    document.dispatchEvent(new CustomEvent('aleria:comment-scene-cast-changed', {
      detail: { actors: getActors(false) }
    }));
    global.renderCommentSegmentList?.();
    global.persistCommentDraft?.();
  }

  function addSelectedCreature() {
    const template = getCurrentTemplate();
    if (!template) return;
    const sourceCreatureId = String(template.id || '').trim();
    const related = createActors.filter(actor => actor.sourceCreatureId === sourceCreatureId);
    const ordinal = Math.max(0, ...related.map(actor => Number(actor.instanceOrdinal) || 0)) + 1;
    const threadKey = safeIdPart(global.getCurrentCommentThreadId?.() || 'szene');
    const actor = normalizeStoredActor({
      ...clone(template),
      id: `scene-creature:${threadKey}:${safeIdPart(sourceCreatureId)}:${ordinal}`,
      sourceCreatureId,
      templateId: sourceCreatureId,
      instanceOrdinal: ordinal,
      name: `${baseCreatureName(template.name)} ${toRoman(ordinal)}.`
    });
    if (!actor) return;
    createActors.push(actor);
    if (Array.isArray(global._commentSegments)) {
      global._commentSegments.forEach(segment => {
        if (segment.kind !== 'action' && !segment.actorId) segment.actorId = actor.id;
      });
    } else if (typeof _commentSegments !== 'undefined' && Array.isArray(_commentSegments)) {
      _commentSegments.forEach(segment => {
        if (segment.kind !== 'action' && !segment.actorId) segment.actorId = actor.id;
      });
    }
    notifyChange();
  }

  function renameActor(id, name) {
    const actor = createActors.find(item => item.id === id);
    if (!actor) return;
    const nextName = String(name || '').trim().slice(0, 140);
    if (nextName) actor.name = nextName;
    document.dispatchEvent(new CustomEvent('aleria:comment-scene-cast-renamed', { detail: { actor: clone(actor) } }));
    global.persistCommentDraft?.();
  }

  function removeActor(id) {
    const index = createActors.findIndex(item => item.id === id);
    if (index < 0) return;
    createActors.splice(index, 1);
    const fallbackId = createActors[0]?.id || '';
    if (typeof _commentSegments !== 'undefined' && Array.isArray(_commentSegments)) {
      _commentSegments.forEach(segment => {
        if (segment.actorId === id) segment.actorId = fallbackId;
        if (segment.combatTargetId === id) segment.combatTargetId = '';
      });
    }
    notifyChange();
  }

  function getActors(edit = false) {
    return (edit ? editActors : createActors).map(clone);
  }

  function getActor(id, edit = false) {
    const actor = (edit ? editActors : createActors).find(item => item.id === String(id || ''));
    return actor ? clone(actor) : null;
  }

  function resetCreate() {
    createActors.splice(0, createActors.length);
    render();
  }

  function restoreCreate(values = []) {
    createActors.splice(0, createActors.length, ...(Array.isArray(values) ? values : [])
      .map(normalizeStoredActor)
      .filter(Boolean));
    render();
  }

  function setEditActorsFromSegments(segments = []) {
    const byId = new Map();
    (Array.isArray(segments) ? segments : []).forEach(segment => {
      const id = String(segment?.sceneActorId || segment?.actorId || '').trim();
      const sourceId = String(segment?.sceneActorSourceId || segment?.creatureId || '').trim();
      if (!id || !sourceId || byId.has(id)) return;
      const actor = normalizeStoredActor({
        id,
        sourceCreatureId: sourceId,
        name: segment.charName,
        title: segment.charTitle,
        portrait: segment.portrait
      });
      if (actor) byId.set(id, actor);
    });
    editActors.splice(0, editActors.length, ...byId.values());
  }

  function serializeCreate() {
    return createActors.map(actor => ({
      id: actor.id,
      sourceCreatureId: actor.sourceCreatureId,
      templateId: actor.templateId || actor.sourceCreatureId,
      instanceOrdinal: actor.instanceOrdinal || 0,
      entityType: 'creature',
      name: actor.name,
      title: actor.title || '',
      portrait: actor.portrait || '',
      emotes: clone(actor.emotes || []),
      combatProfile: clone(actor.combatProfile || {})
    }));
  }

  function render() {
    const root = document.getElementById('cf-creature-scene-cast');
    if (!root) return;
    const creatureMode = typeof _commentMode !== 'undefined' && _commentMode === 'creature';
    root.hidden = !creatureMode;
    if (!creatureMode) return;
    const template = getCurrentTemplate();
    root.innerHTML = `
      <div class="comment-scene-cast-head">
        <div><span>Szenenbesetzung</span><strong>Kreatureninstanzen</strong></div>
        <button type="button" data-scene-cast-action="add"${template ? '' : ' disabled'}>+ ${escapeHtml(template ? `${baseCreatureName(template.name)} einsetzen` : 'Kreatur wählen')}</button>
      </div>
      <p>Eine Vorlage darf mehrfach auftreten. Jede Instanz erhält eine eigene Kennung und kann pro Abschnitt als Sprecher oder Kampfziel gewählt werden.</p>
      <div class="comment-scene-cast-list">
        ${createActors.map(actor => `
          <article data-scene-actor-id="${escapeHtml(actor.id)}">
            ${actor.portrait ? `<img src="${escapeHtml(actor.portrait)}" alt="">` : '<span class="comment-scene-cast-placeholder">☠</span>'}
            <label><span>Anzeigename</span><input type="text" maxlength="140" value="${escapeHtml(actor.name)}" data-scene-cast-action="rename" data-scene-actor-id="${escapeHtml(actor.id)}"></label>
            <code>${escapeHtml(actor.id)}</code>
            <button type="button" class="comment-scene-cast-remove" data-scene-cast-action="remove" data-scene-actor-id="${escapeHtml(actor.id)}" aria-label="Instanz entfernen">×</button>
          </article>`).join('') || '<div class="comment-scene-cast-empty">Noch keine Instanz in dieser Szene. Wähle oben eine Vorlage und setze sie ein.</div>'}
      </div>`;
  }

  document.addEventListener('click', event => {
    const trigger = event.target?.closest?.('[data-scene-cast-action]');
    if (!trigger) return;
    if (trigger.dataset.sceneCastAction === 'add') addSelectedCreature();
    if (trigger.dataset.sceneCastAction === 'remove') removeActor(trigger.dataset.sceneActorId || '');
  });

  document.addEventListener('input', event => {
    const input = event.target?.closest?.('[data-scene-cast-action="rename"]');
    if (!input) return;
    renameActor(input.dataset.sceneActorId || '', input.value);
  });

  global.AleriaCommentSceneCast = Object.freeze({
    addSelectedCreature,
    getActor,
    getActors,
    render,
    resetCreate,
    restoreCreate,
    serializeCreate,
    setEditActorsFromSegments
  });
})(window);
