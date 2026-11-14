import { getSceneElementType } from './scene-element-model.js';
import { sceneElementEscape as escape } from './scene-element-markup.js';
import { renderChallengeSceneImage } from '../herausforderung/herausforderung-scene-image-ui.js';
import { renderSceneElementIcon } from './scene-element-icon-view.js';

export function getSceneElementCompletion(event, commentId, progress = new Map()) {
  const states = event.approaches.map(approach => progress.get(`herausforderung:${commentId}:${approach.approachId}`));
  const solved = event.completionMode === 'any' ? states.some(state => state?.solved)
    : states.length > 0 && states.every(state => state?.solved);
  return { solved, closed: solved || (!!event.reaction && states.some(state => state?.attempts > 0)) };
}

export function renderSceneElementReaction(reaction) {
  if (!reaction) return '';
  const proof = reaction.detection || {};
  const detail = proof.kind === 'roll' ? `${proof.name || reaction.actorName}: ${proof.skillName || 'Entdeckung'} · ${(proof.dice || []).join(' / ')} ${Number(proof.modifier) < 0 ? '−' : '+'} ${Math.abs(Number(proof.modifier) || 0)} = ${proof.total} gegen SG ${proof.minimum}.`
    : proof.kind === 'passive' ? `${proof.name || reaction.actorName}: passiver Wert ${proof.total}, benötigt ${proof.minimum}.`
      : proof.kind === 'unavailable' ? proof.reason : 'Keine zusätzliche Entdeckungsprobe.';
  return `<section class="scene-element-reaction ${reaction.detected ? 'is-detected' : 'is-surprised'}" aria-label="Entdeckung und Reaktion"><strong>${escape(reaction.actorName)} · ${reaction.detected ? 'Gefahr bemerkt' : 'Überrascht'}</strong>
    ${reaction.description ? `<p>${escape(reaction.description)}</p>` : ''}<p class="scene-element-reaction-mode">${reaction.detected ? 'Vorteil' : 'Nachteil'} auf die Reaktion. Weitere Vor-/Nachteile gelten nach den Figurenregeln.</p>
    <details><summary>Entdeckungsbeleg</summary><p>${escape(detail)}</p></details></section>`;
}

export function renderSceneElementSignal(comment) {
  const signal = comment.sceneElementSignal;
  if (!signal?.visible || signal.state !== 'armed' || signal.elementType !== 'item') return '';
  return `<section class="herausforderung-event scene-element-item"><header>${renderSceneElementIcon('item')}<div><small>Gegenstand</small><strong>${escape(signal.title)}</strong></div></header>
    ${renderChallengeSceneImage(signal.sceneImage, signal.title)}<p class="herausforderung-description">${escape(signal.publicDescription)}</p>
    <button type="button" class="herausforderung-button" data-scene-element-action="open" data-scene-element-id="${escape(comment.id)}">Gegenstand untersuchen</button></section>`;
}

export function collectPublicSceneElements(comments, progress = new Map()) {
  return comments.flatMap(comment => {
    if (comment.serverValidatedMechanics !== true || comment.importedHistoricalMechanics) return [];
    const signal = comment.sceneElementSignal;
    if (signal?.visible && signal.state === 'armed') return [{ id: comment.id, sourceId: signal.id, elementType: signal.elementType,
      title: signal.title || `${getSceneElementType(signal.elementType).label} untersuchen`, closed: false, comment }];
    const event = comment.herausforderung;
    if (!event || !['puzzle', 'danger', 'item'].includes(event.elementType)) return [];
    return [{ id: comment.id, sourceId: comment.id, elementType: event.elementType, title: event.title,
      ...getSceneElementCompletion(event, comment.id, progress), comment }];
  });
}

function renderSceneElementButtons(elements, { showTitles = false } = {}) {
  return elements.map(element => `<button type="button" class="scene-element-rail-button${element.closed ? ' is-complete' : ''}" data-scene-element-action="open" data-scene-element-id="${escape(element.id)}" aria-label="${escape(getSceneElementType(element.elementType).label + ': ' + element.title)}" title="${escape(element.title)}">${renderSceneElementIcon(element.elementType)}${element.closed ? '<em class="scene-element-complete-mark" aria-hidden="true">✓</em>' : ''}<small>${escape(getSceneElementType(element.elementType).label)}</small>${showTitles ? `<span>${escape(element.title)}</span>` : ''}</button>`).join('');
}

export function renderSceneElementSelection(elements) {
  return `<div class="scene-element-selection" aria-label="Verfügbare Szenenelemente">${renderSceneElementButtons(elements, { showTitles: true })}</div>`;
}

export function renderSceneElementRail(elements, { expanded = true, compact = false, controlsId = 'scene-element-rail-items' } = {}) {
  if (compact) return `<span class="scene-element-rail-label">In dieser Szene</span><button type="button" class="scene-element-rail-toggle" data-scene-element-action="open-list" aria-haspopup="dialog" aria-label="Szenenelemente öffnen (${elements.length})" title="Szenenelemente öffnen (${elements.length})"><span aria-hidden="true">‹</span><small>${elements.length}</small></button>`;
  const label = expanded ? 'Szenenelemente einklappen' : `Szenenelemente ausklappen (${elements.length})`;
  return `<span class="scene-element-rail-label">In dieser Szene</span><button type="button" class="scene-element-rail-toggle" data-scene-element-action="toggle-rail" aria-expanded="${expanded}" aria-controls="${escape(controlsId)}" aria-label="${label}" title="${label}"><span aria-hidden="true">${expanded ? '›' : '‹'}</span><small>${elements.length}</small></button><div class="scene-element-rail-items" id="${escape(controlsId)}"${expanded ? '' : ' hidden'}>${renderSceneElementButtons(elements)}</div>`;
}
