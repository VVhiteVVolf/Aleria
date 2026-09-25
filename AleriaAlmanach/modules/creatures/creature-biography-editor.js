import { normalizeCreatureBiography } from './creature-biography-model.js?v=20260925-creature-biography-v1';
import { renderCreatureBiography, renderCreatureBiographyDossier } from './creature-biography-view.js?v=20260925-creature-biography-v1';

export function collectCreatureBiography(root, fallback) {
  const fields = root?.querySelectorAll('[data-creature-biography-field]');
  if (!fields?.length) return normalizeCreatureBiography(fallback);
  const biography = { ...fallback };
  fields.forEach(field => { biography[field.dataset.creatureBiographyField] = field.value; });
  biography.facts = [...root.querySelectorAll('[data-creature-biography-fact]')].map(row => ({
    label: row.querySelector('[data-bio-label]').value, value: row.querySelector('[data-bio-value]').value
  }));
  biography.sections = [...root.querySelectorAll('[data-creature-biography-section]')].map(row => ({
    title: row.querySelector('[data-bio-title]').value, text: row.querySelector('[data-bio-text]').value
  }));
  return normalizeCreatureBiography(biography);
}

export function createCreatureBiographyEditor({ getRoot, getDraft, collect, render, escape }) {
  let editing = false;
  return {
    reset() { editing = false; },
    render(creature) { return renderCreatureBiography(creature, escape, editing); },
    handleClick(event) {
      const trigger = event.target.closest('[data-creature-biography-action]');
      if (!trigger || !getRoot()?.contains(trigger)) return false;
      collect();
      const biography = getDraft().biography;
      const action = trigger.dataset.creatureBiographyAction;
      if (action === 'edit') editing = true;
      else if (action === 'finish') editing = false;
      else if (action === 'add-fact' && biography.facts.length < 30) biography.facts.push({ label: '', value: '' });
      else if (action === 'add-section' && biography.sections.length < 20) biography.sections.push({ title: '', text: '' });
      else if (['remove-fact', 'remove-section'].includes(action)) {
        const index = Number(trigger.dataset.index);
        if (Number.isInteger(index) && index >= 0) biography[action === 'remove-fact' ? 'facts' : 'sections'].splice(index, 1);
      }
      render();
      return true;
    },
    handleInput(event) {
      if (!event.target.closest('[data-creature-biography-root]')) return;
      const root = getRoot();
      const preview = root?.querySelector('[data-creature-biography-preview]');
      if (!preview) return;
      const creature = getDraft();
      const biography = collectCreatureBiography(root, creature.biography);
      preview.innerHTML = renderCreatureBiographyDossier({ ...creature, biography }, escape);
    }
  };
}
