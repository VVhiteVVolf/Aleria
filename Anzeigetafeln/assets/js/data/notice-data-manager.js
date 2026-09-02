(function () {
  'use strict';

  function open() {
    document.getElementById('datamgr-mo')?.classList.add('open');
  }

  function exportData() {
    const state = window.TafelState.snapshot();
    const payload = {
      exportedAt: new Date().toISOString(),
      schemaVersion: 2,
      kind: 'aleria-anzeigetafel',
      state,
    };
    const name = (state.regionTitle || 'Anzeigetafel').replace(/[^a-z0-9äöüß-]+/gi, '-').replace(/^-|-$/g, '');
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name || 'Anzeigetafel'}-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    window.TafelRuntime.toast('Tafel-Daten exportiert');
  }

  function importData(file) {
    if (!file || !file.name.toLocaleLowerCase('de').endsWith('.json')) {
      window.TafelRuntime.toast('Bitte eine JSON-Datei auswählen');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result || '{}'));
        const incoming = payload.kind === 'aleria-anzeigetafel' ? payload.state : payload;
        if (!incoming || !Array.isArray(incoming.zettel)) throw new Error('Die Datei enthält keine gültigen Aushänge.');
        window.TafelState.backup('Vor JSON-Import');
        window.TafelRuntime.applyState(incoming);
        window.TafelState.save();
        document.getElementById('datamgr-mo')?.classList.remove('open');
        window.TafelRuntime.toast(`${incoming.zettel.length} Aushänge importiert`);
      } catch (error) {
        window.TafelRuntime.toast(error.message || 'JSON-Datei konnte nicht gelesen werden');
      }
    };
    reader.readAsText(file);
  }

  window.TafelDataManager = Object.freeze({ open, exportData, importData });
})();
