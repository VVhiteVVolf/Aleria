// Reusable organisation locations; independent of newspaper lore and remote services.
const ORGANIZATION_NETWORK_KINDS = Object.freeze([
  ['headquarters', 'Hauptsitz'], ['editorial', 'Redaktion'],
  ['printing', 'Druck- & Korrespondenzhaus'], ['distribution', 'Vertriebsstelle'],
  ['workshop', 'Werkstatt'], ['branch', 'Niederlassung']
]);

function sanitizeOrganizationNetworkData(value = {}) {
  const data = value && typeof value === 'object' ? value : {};
  const clean = value => String(value ?? '').trim();
  const kinds = new Set(ORGANIZATION_NETWORK_KINDS.map(([kind]) => kind));
  return {
    title: clean(data.title), introduction: clean(data.introduction),
    reach: clean(data.reach), model: clean(data.model), note: clean(data.note),
    footer: clean(data.footer),
    sites: (Array.isArray(data.sites) ? data.sites : []).map(site => ({
      name: clean(site?.name), region: clean(site?.region),
      kind: kinds.has(site?.kind) ? site.kind : 'branch',
      image: clean(site?.image), description: clean(site?.description),
      href: clean(site?.href), publicationHref: clean(site?.publicationHref)
    })).filter(site => site.name || site.description)
  };
}

function createDefaultOrganizationNetworkPage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} — Häuser & Wege`,
    organizationNetworkPage: true,
    organizationNetwork: sanitizeOrganizationNetworkData({
      title: 'Häuser, Niederlassungen & Verbreitung',
      introduction: 'Beschreibe die Verbindung zwischen der Hauptleitung und den Niederlassungen.',
      reach: 'Wirkungsgebiet der Organisation', model: 'Aufgaben und Zusammenarbeit',
      sites: [{ name: 'Zentrales Gildenhaus', kind: 'headquarters', description: 'Hier laufen die Wege der Organisation zusammen.' }]
    })
  };
}
