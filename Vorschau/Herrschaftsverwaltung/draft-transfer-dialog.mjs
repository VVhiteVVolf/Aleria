const all = { label: 'Ganz Cenyr', scope: undefined };

export function transferChoices(house, offices = []) {
  const county = { label: house.countyName, scope: { type: 'county', id: house.countyId } };
  const domain = { label: house.name, scope: { type: 'house', id: house.id } };
  return offices.length ? [...offices.map(({ id, name }) => ({
    label: name, scope: { type: 'office', id: house.id, area: id },
  })), domain, county, all] : [all, county, domain];
}

export function fillTransferChoices(select, choices) {
  const selected = select.value;
  select.replaceChildren(...choices.map(({ label }, index) => new Option(label, String(index))));
  if (choices[selected]) select.value = selected;
}

export function bindDraftTransfer(input, dialog, state, defaultImport) {
  const window = input.ownerDocument.defaultView;
  const form = dialog.querySelector('form');
  const status = dialog.querySelector('[role="status"]');
  let active, pending;
  let importNumber = 0;

  function download(choice) {
    const scope = choice.scope;
    const filename = scope ? `cenyr-${scope.id}${scope.area ? '-' + scope.area : ''}-entwurf.json`
      : 'cenyr-herrschaftsplanung-entwurf.json';
    const url = window.URL.createObjectURL(new Blob([state.serialize(scope)], { type: 'application/json' }));
    const link = input.ownerDocument.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  }

  function chooseImport(choice, { notify, onImport }) {
    pending = { choice, notify, onImport };
    input.click();
  }

  input.addEventListener('change', async () => {
    const file = input.files[0];
    const request = pending || defaultImport();
    if (!file || !request) return;
    pending = undefined;
    input.value = '';
    const number = ++importNumber;
    request.notify('Entwurf wird geladen …');
    try {
      const text = await file.text();
      if (number !== importNumber) return;
      const partial = state.importDraft(text, request.choice.scope);
      request.onImport(request.choice.scope ? `Entwurf für ${request.choice.label} übernommen. Rückgängig ist möglich.`
        : `${partial ? 'Teilentwurf' : 'Gesamtentwurf'} geladen. Der Import kann rückgängig gemacht werden.`);
    } catch (error) {
      if (number === importNumber) request.notify(error.message || 'Der Entwurf konnte nicht geladen werden.');
    }
  });
  input.addEventListener('cancel', () => { pending = undefined; });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const transfer = active;
    const choice = transfer.choices[form.elements.scope.value];
    if (event.submitter?.value === 'export') {
      try { download(choice); status.textContent = `Entwurf für ${choice.label} exportiert.`; }
      catch (error) { status.textContent = error.message; }
    } else chooseImport(choice, {
      notify: message => { status.textContent = message; },
      onImport: message => { if (dialog.open && active === transfer) dialog.close(); transfer.onImport(message); },
    });
  });
  dialog.querySelector('[data-action="close-transfer"]').addEventListener('click', () => dialog.close());
  return {
    download, chooseImport,
    open(choices, onImport) {
      active = { choices, onImport };
      fillTransferChoices(form.elements.scope, choices);
      form.elements.scope.value = '0';
      status.textContent = '';
      dialog.showModal();
    },
  };
}
