import { readClergyCaste, writeClergyCaste } from './clergy-state.mjs?v=20260910-clergy-v1';

export function initializeClergyProfile(root, host = window) {
  const tabs = root.querySelector('[data-role="caste-tabs"]');
  const controls = [...tabs.querySelectorAll('[data-caste]')];
  const panels = [...root.querySelectorAll('[data-caste-panel]')];
  const ids = controls.map(control => control.dataset.caste);
  const controller = new AbortController();
  const options = { signal: controller.signal };
  tabs.setAttribute('role','tablist');
  controls.forEach(control => {
    control.setAttribute('role','tab');
    control.setAttribute('aria-controls',control.dataset.caste);
  });
  panels.forEach(panel => {
    panel.setAttribute('role','tabpanel');
    panel.setAttribute('aria-labelledby',`tab-${panel.dataset.castePanel}`);
    panel.tabIndex = 0;
  });

  function render(id) {
    for (const control of controls) {
      const selected = control.dataset.caste === id;
      control.setAttribute('aria-selected',String(selected));
      control.tabIndex = selected ? 0 : -1;
    }
    for (const panel of panels) panel.hidden = panel.dataset.castePanel !== id;
  }
  function select(id, focus = false) {
    const target = writeClergyCaste(host.location.href,id,ids);
    if (target.href !== host.location.href) host.history.pushState(null,'',target);
    render(id);
    if (focus) controls.find(control => control.dataset.caste === id).focus();
  }
  function readLocation() { render(readClergyCaste(host.location.href,ids)); }

  tabs.addEventListener('click',event => {
    const control = event.target.closest('[data-caste]');
    if (!control || !tabs.contains(control) || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    select(control.dataset.caste);
  },options);
  tabs.addEventListener('keydown',event => {
    const index = controls.indexOf(event.target);
    if (index < 0) return;
    let target;
    if (event.key === 'ArrowRight') target = (index + 1) % ids.length;
    if (event.key === 'ArrowLeft') target = (index + ids.length - 1) % ids.length;
    if (event.key === 'Home') target = 0;
    if (event.key === 'End') target = ids.length - 1;
    if (event.key === ' ' || event.key === 'Enter') target = index;
    if (target === undefined) return;
    event.preventDefault();
    select(ids[target],true);
  },options);
  host.addEventListener('popstate',readLocation,options);
  host.addEventListener('hashchange',readLocation,options);
  readLocation();
  root.querySelector('[data-role="switch-hint"]').hidden = false;
  if (ids.includes(host.location.hash.slice(1))) host.requestAnimationFrame(() => tabs.scrollIntoView({block:'start'}));
  return () => controller.abort();
}

const root = document.querySelector('[data-clergy-profile]');
if (root) initializeClergyProfile(root);
