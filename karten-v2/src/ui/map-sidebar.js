import { renderFeatureDetails } from './feature-details.js';
import { renderFeatureForm } from '../editor/feature-form.js';

/**
 * Right-hand panel: swaps between the read-only "scroll" detail view and
 * the edit form, or shows nothing when no feature is selected.
 */
export function createMapSidebar(container) {
  function close() {
    container.classList.remove('open');
    container.innerHTML = '';
  }

  function showDetails(props) {
    container.classList.add('open');
    renderFeatureDetails(container, { ...props, onClose: close });
  }

  function showForm(props) {
    container.classList.add('open');
    const wrapper = document.createElement('div');
    wrapper.className = 'feature-form-panel';
    container.innerHTML = '';
    container.appendChild(wrapper);
    renderFeatureForm(wrapper, props);
  }

  return { showDetails, showForm, close };
}
