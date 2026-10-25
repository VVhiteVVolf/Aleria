for (const scope of document.querySelectorAll('[data-coastal-map]')) {
  const svg = scope.querySelector('[data-map-svg]');
  const phases = scope.querySelector('[data-map-phase]');
  const caption = scope.querySelector('[data-map-caption]');
  const connections = scope.querySelector('[data-map-connections]');
  scope.querySelector('[data-map-connections-toggle]').addEventListener('change', event => {
    connections.toggleAttribute('hidden', !event.target.checked);
  });
  phases.addEventListener('change', () => {
    const phase = phases.value;
    for (const marker of scope.querySelectorAll('[data-map-stage]')) {
      const active = phase === 'all' || marker.dataset.mapStage === phase;
      marker.classList.toggle('route-muted', !active);
      marker.setAttribute('tabindex', active ? '0' : '-1');
    }
    caption.textContent = phases.selectedOptions[0].textContent + ' · Marker öffnen die verknüpften Einzelberichte.';
    for (const connection of scope.querySelectorAll('[data-map-stages]')) connection.classList.toggle('route-muted', phase !== 'all' && !connection.dataset.mapStages.split(' ').includes(phase));
  });
  scope.addEventListener('click', event => {
    const button = event.target.closest('[data-map-action]');
    if (!button || !scope.contains(button)) return;
    svg.setAttribute('viewBox', button.dataset.mapAction === 'focus' ? svg.dataset.focus : svg.dataset.overview);
  });
}
