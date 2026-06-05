// Modal layout helpers: scroll reset, image resizer, and inline editor splitter.
let _resizerStartX = 0;
let _resizerStartW = 0;
let _resizerDragging = false;

function resetScroll() {
  const col = document.getElementById('modal-text-col-el');
  if (col) col.scrollTop = 0;
}

function initResizer() {
  const resizer = document.getElementById('modal-resizer');
  if (!resizer) return;
  resizer.addEventListener('mousedown', event => {
    const col = document.getElementById('modal-img-col-el');
    if (!col) return;
    _resizerStartX = event.clientX;
    _resizerStartW = col.offsetWidth;
    _resizerDragging = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    event.preventDefault();
  });
}

function getInlineModuleSplitPercent() {
  try {
    const value = Number(localStorage.getItem('aleria-inline-module-split'));
    if (Number.isFinite(value)) return Math.max(24, Math.min(76, value));
  } catch {
    // localStorage may be unavailable in restricted browser modes.
  }
  return 42;
}

function setInlineModuleSplitPercent(workspace, percent) {
  if (!workspace) return;
  const next = Math.max(24, Math.min(76, Math.round(Number(percent) || 42)));
  workspace.style.setProperty('--inline-edit-width', `${next}%`);
  const splitter = workspace.querySelector('.inline-module-splitter');
  if (splitter) splitter.setAttribute('aria-valuenow', String(next));
  try {
    localStorage.setItem('aleria-inline-module-split', String(next));
  } catch {
    // Ignore persistence failures; the splitter still works for this session.
  }
}

function initInlineModuleSplitter(scope = document) {
  const splitter = scope.querySelector?.('.inline-module-splitter');
  const workspace = splitter?.closest?.('.inline-module-workspace');
  if (!splitter || !workspace) return;

  setInlineModuleSplitPercent(workspace, getInlineModuleSplitPercent());
  if (splitter.dataset.inlineModuleSplitterBound === 'true') return;
  splitter.dataset.inlineModuleSplitterBound = 'true';

  splitter.addEventListener('pointerdown', event => {
    if (event.button != null && event.button !== 0) return;
    const rect = workspace.getBoundingClientRect();
    if (!rect.width) return;
    workspace.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    splitter.setPointerCapture?.(event.pointerId);

    const move = moveEvent => {
      const percent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      setInlineModuleSplitPercent(workspace, percent);
    };
    const up = upEvent => {
      workspace.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      splitter.releasePointerCapture?.(upEvent.pointerId);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
    };

    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
    move(event);
    event.preventDefault();
  });

  splitter.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const current = Number(splitter.getAttribute('aria-valuenow')) || getInlineModuleSplitPercent();
    const step = event.shiftKey ? 5 : 2;
    setInlineModuleSplitPercent(workspace, current + (event.key === 'ArrowRight' ? step : -step));
    event.preventDefault();
  });
}

document.addEventListener('mousemove', event => {
  if (!_resizerDragging) return;
  const col = document.getElementById('modal-img-col-el');
  if (!col) return;
  const width = Math.max(80, Math.min(window.innerWidth * 0.65, _resizerStartW + event.clientX - _resizerStartX));
  col.style.width = `${width}px`;
});

document.addEventListener('mouseup', () => {
  if (!_resizerDragging) return;
  _resizerDragging = false;
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
});
