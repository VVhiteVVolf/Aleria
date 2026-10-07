// Service catalog data belongs to the template, independently of any particular guild.
function sanitizeGuildServicesData(value = {}) {
  const data = value && typeof value === 'object' ? value : {};
  const text = value => String(value ?? '').trim();
  const fields = ['title', 'introduction', 'process', 'conditions', 'footer'];
  return {
    ...Object.fromEntries(fields.map(key => [key, text(data[key])])),
    services: (Array.isArray(data.services) ? data.services : []).map(item => ({
      title: text(item?.title), icon: text(item?.icon), description: text(item?.description),
      clients: text(item?.clients), scope: text(item?.scope), terms: text(item?.terms)
    })).filter(item => item.title || item.description)
  };
}

function createDefaultGuildServicesPage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} — Aufgaben & Dienste`, guildServicesPage: true,
    guildServices: sanitizeGuildServicesData({ title: 'Aufgabenbereich & Service',
      introduction: 'Welche Dienste bietet die Gilde an und an wen richten sie sich?',
      services: [{ title: 'Schutz & Begleitung', clients: 'Reisende und Handelshäuser',
        description: 'Beschreibe die angebotene Leistung.', scope: 'Nach vereinbartem Auftrag', terms: 'Nach Absprache' }]
    })
  };
}
