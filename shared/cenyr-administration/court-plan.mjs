import { houseOfficeFor } from '../../Familien Häuser und Clans/modules/court/house-office-catalog.mjs';
import { completeHouseOffices, partitionHouseCourtEntries } from '../../Familien Häuser und Clans/modules/court/house-court-model.mjs';
import { geographicKey } from '../world-directory/geographic-key.mjs';
import { CENYR_HOUSE_COMMAND } from './military-organization.mjs';

const leadershipIds = ['vogt', 'schatzmeister', 'hausmacht'];
const courtGroups = [
  ['Hausverwaltung und Kanzlei', 'coordination', ['archiv']],
  ['Schutzdienst', 'watch', ['kerker']],
  ['Tafel, Empfänge und Hofkultur', 'hospitality', ['zeremonien', 'mundschenk', 'kueche', 'brot', 'narr']],
  ['Persönlicher Dienst und Hofkapelle', 'faith', ['hofdame', 'kaplan']],
  ['Stall, Jagd und Liegenschaften', 'horse', ['stall', 'jagd', 'hafen', 'falkner', 'zwinger', 'handwerk', 'garten']],
];
const icons = { hofmeister: 'learning', stall: 'horse', hafen: 'sailing', kerker: 'watch', kaplan: 'faith', falkner: 'scouting', zwinger: 'scouting', hofmagier: 'arcane', kartograf: 'records' };
const rareOffices = ['Hofmagier', 'Kartograf'];

export function indexCourtEntries(entries) {
  const occurrences = new Map();
  return entries.map(entry => {
    const office = houseOfficeFor(entry.role);
    const type = office?.id || geographicKey(entry.role);
    const number = (occurrences.get(type) || 0) + 1;
    occurrences.set(type, number);
    return { entry, office, type, id: number === 1 ? type : `${type}-${number}` };
  });
}

export function buildCourtPlan(house) {
  const { offices } = partitionHouseCourtEntries(house.court);
  const standard = completeHouseOffices(offices, true);
  const additional = rareOffices.filter(role => !standard.some(entry => houseOfficeFor(entry.role)?.title === role)).map(role => ({ role }));
  const entries = indexCourtEntries([...standard, ...additional]).map(({ entry, office, id, type }) => {
    return {
      id, type, title: type === 'narr' && entry.role === 'Narr' ? 'Hofnarr' : entry.role,
      description: type === 'hausmacht' && house.rank ? CENYR_HOUSE_COMMAND
        : office?.description || 'Versieht den zugewiesenen Dienst im Auftrag des Hauses.',
      icon: icons[type] || office?.duties[0]?.icon || 'coordination',
      note: entry.note,
      ...(type === 'hausmacht' && house.rank ? { reportsTo: 'dem zuständigen Marschall' } : {}),
    };
  });
  entries.push(
    { id: 'zofe', title: house.id === 'wyrm' ? 'Zofe von Rianna Wyrm' : 'Zofe', icon: 'hospitality', description: 'Übernimmt anvertraute persönliche Dienste und begleitet den Haushalt bei Hofanlässen.' },
    { id: 'kammerdiener', title: 'Kammerdiener', icon: 'secrecy', description: 'Betreut die persönlichen Räume und hält die zugewiesenen Dienste bereit.' },
  );
  const head = entries.find(slot => slot.id === 'hofmeister');
  const weaponMasters = entries.filter(slot => slot.type === 'waffen');
  const guard = entries.find(slot => slot.id === 'garde') || {
    id: 'garde', title: 'Hauptmann der Leibgarde', icon: 'command',
  };
  const household = entries.filter(slot => ['zofe', 'kammerdiener'].includes(slot.id));
  const leadership = {
    title: 'Oberste Hofämter',
    icon: 'court',
    leadership: true,
    slots: leadershipIds.map(id => entries.find(slot => slot.id === id)),
  };
  const remaining = entries.filter(slot => slot !== head && slot !== guard && !weaponMasters.includes(slot)
    && !household.includes(slot) && !leadershipIds.includes(slot.id));
  const sections = courtGroups.map(([title, icon, ids]) => ({
    title, icon, slots: remaining.filter(slot => ids.includes(slot.type)),
  }));
  sections.unshift({ title: 'Lehre und Mentorat', icon: 'learning', slots: [
    { ...head, key: 'hof/leitung', titleVariants: ['Hofmeister', 'Hofmeisterin'] },
    ...weaponMasters,
  ] });
  const extras = remaining.filter(slot => !courtGroups.some(([, , ids]) => ids.includes(slot.type)));
  if (extras.length) sections.push({ title: 'Weitere Hofämter', icon: 'coordination', slots: extras });
  return { leadership, sections, guard, household };
}
