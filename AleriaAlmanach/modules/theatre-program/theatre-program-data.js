// A reusable repertoire, including deliberately empty slots for future works.
function sanitizeTheatreProgramData(value = {}) {
  if (!value || typeof value !== 'object') value = {};
  const text = value => String(value ?? '').trim();
  const fields = ['title', 'introduction', 'footer'];
  const itemFields = ['title', 'genre', 'setting', 'synopsis', 'cast', 'staging', 'image'];
  return {
    ...Object.fromEntries(fields.map(key => [key, text(value[key])])),
    items: (Array.isArray(value.items) ? value.items : []).map(item =>
      Object.fromEntries(itemFields.map(key => [key, text(item?.[key])]))
    )
  };
}

function createDefaultTheatreProgramPage(index = 0) {
  return { pageTitle: `${getRomanPageLabel(index)} — Repertoire`, theatreProgramPage: true,
    theatreProgram: sanitizeTheatreProgramData({ title: 'Auf unserer Bühne',
      introduction: 'Bekannte Stücke und Raum für kommende Inszenierungen.', items: Array.from({length:8}, () => ({})) }) };
}
