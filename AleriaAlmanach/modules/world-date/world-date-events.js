async function handleWorldDateClick(event) {
  const button = event.target?.closest?.('[data-world-date-action]');
  if (!button) return;
  const action = button.dataset.worldDateAction;
  if (action === 'open-editor') {
    event.preventDefault();
    AleriaWorldDateUI.open();
  } else if (action === 'close-editor') {
    event.preventDefault();
    AleriaWorldDateUI.close();
  } else if (action === 'next-day') {
    event.preventDefault();
    button.disabled = true;
    try {
      const result = await AleriaWorldDateStore.shiftDate(1);
      const note = result.localOnly ? 'Das Datum wurde lokal auf den nächsten Tag gesetzt.' : 'Das Datum wurde auf den nächsten Tag gesetzt.';
      if (typeof showAppStatus === 'function') showAppStatus(note, 'success');
    } finally {
      button.disabled = false;
    }
  }
}

function handleWorldDateInput(event) {
  const form = event.target?.closest?.('[data-world-date-form]');
  if (form) AleriaWorldDateUI.renderPreview(form);
}

async function handleWorldDateSubmit(event) {
  const form = event.target?.closest?.('[data-world-date-form]');
  if (!form) return;
  event.preventDefault();
  const submit = form.querySelector('[type="submit"]');
  if (submit) submit.disabled = true;
  AleriaWorldDateUI.setStatus('Das Datum wird gespeichert …');
  try {
    const result = await AleriaWorldDateStore.setDate(AleriaWorldDateUI.getFormValue(form));
    AleriaWorldDateUI.close();
    if (typeof showAppStatus === 'function') {
      showAppStatus(result.localOnly ? 'Aktuelles Datum lokal gespeichert.' : 'Aktuelles Datum im Almanach gespeichert.', 'success');
    }
  } catch (error) {
    AleriaWorldDateUI.setStatus(String(error?.message || 'Das Datum konnte nicht gespeichert werden.'), 'error');
  } finally {
    if (submit) submit.disabled = false;
  }
}

function initializeWorldDateFeature() {
  AleriaWorldDateStore.initialize();
  AleriaWorldDateUI.renderSidebar();
}

document.addEventListener('click', handleWorldDateClick);
document.addEventListener('input', handleWorldDateInput);
document.addEventListener('change', handleWorldDateInput);
document.addEventListener('submit', handleWorldDateSubmit);
document.addEventListener('almanach-world-date-state', AleriaWorldDateUI.renderSidebar);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeWorldDateFeature, { once: true });
else initializeWorldDateFeature();
