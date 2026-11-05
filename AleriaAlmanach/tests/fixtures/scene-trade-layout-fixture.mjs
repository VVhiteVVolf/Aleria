import { createSceneTradeState, initializeSceneTradeDefaults, sceneTradeAccounts, addSceneTradeBuy, updateSceneTradeLine, sceneTradeSummary } from '../../modules/scene-trade/scene-trade-state.js';

export function createSceneTradeLayoutFixture() {
  const names = ['Gawain vom Außergewöhnlichlangen Händlerhof', 'Ylva mit dem außergewöhnlich langen Doppelnamen',
    'Änne-Luise aus dem Schwarzen Krähenmoor', 'Friedrich-Wilhelm aus der Silberküsten-Gemeinschaft',
    'Elisabeth vom Sehrweitentfernten Kräutergarten', 'Rüdiger von der Dreiunddreißigsten Brücke',
    'Jördis aus dem Amethystblick-Arkaneum', 'Konstantin von den Hohen Handelswegen'];
  const data = { access: { uid: 'layout-user', role: 'player' }, groups: [],
    providers: [{ id: 'module:layout-shop', title: 'Lothaires Arkaneum · Alchemistische Werkstatt und außergewöhnlich langer Händlername von Gwynthor' }],
    characters: Array.from({ length: 1000 }, (_, index) => ({ id: `person-${index}`, name: names[index] || `Weitere Person ${index}`,
      title: 'Reisende Figur', portrait: '/IconOrdner/ReiterIcons/Platzhalter.png', ...(index % 2 ? { ownerUid: 'another-user' } : {}),
      inventory: { revision: 1, moneyState: { totalCopper: 1000000000000 }, items: [] } })),
    offers: Array.from({ length: 1200 }, (_, index) => ({ id: `offer:${index}`, listId: index < 72 ? 'module:layout-shop' : `merchant:${Math.floor(index / 24)}`,
      title: index % 3 ? `Reisetauglicher Kräuteransatz mit Salbei und außergewöhnlich langem Warenname ${index}` : `AußergewöhnlichlangesalchemistischesReisegefäßmitwasserfestemSchraubverschluss ${index}`,
      type: 'Alchemie und Reisebedarf', category: 'alchemie', section: 'offer', moduleId: 'layout-shop',
      hiddenMeta: { unit: 'Ein vollständiges Reise-Set · für mehrere wohldosierte Anwendungen' },
      priceRange: { minCopper: 12.5 + index, maxCopper: 20 + index }, sourceRevision: 'layout-first', available: true })) };
  const state = createSceneTradeState('layout-shop::session:verkauf'); state.merchantId = 'module:layout-shop';
  initializeSceneTradeDefaults(state, data, 'person-0');
  const accounts = sceneTradeAccounts(data), selectableAccounts = accounts.slice(0, 8);
  for (let index = 0; index < 20; index++) {
    state.recipientKey = selectableAccounts[index % selectableAccounts.length].key;
    addSceneTradeBuy(state, data.offers[index], () => `line-${index}`);
  }
  updateSceneTradeLine(state.lines[0], 'agreedTotalMinor', '998877.66', accounts);
  state.openLine = state.lines[0].id;
  return { state, data, accounts, selectableAccounts, summary: sceneTradeSummary(state, data, accounts) };
}
