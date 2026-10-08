import { createSourceHouseFamily } from './source-house-family-builder.js';
import { createParentages } from './family-record-builders.js';
import { normalizeHouseBiographyModule } from '../modules/house-biography/house-biography-model.js';

const TIARNATUM = 'Der Tiarna ist das albenische Gegenstück zum Ritter. Er verkörpert Ehre, Tapferkeit und Schutzpflicht sowie die alten Ideale der Clans. Er gilt als Vorstufe zum Fianna, den größten Helden des albenischen Volkes.';

function sourceBiography(definition, profile, source, warriorReference, catalog, principality) {
  const person = id => catalog.persons[id]?.name || '';
  return normalizeHouseBiographyModule({
    pageTitle: definition.title,
    image: warriorReference || definition.emblem,
    description: source.description,
    stats: [
      ['Sitz', profile.seat], ['Oberherrschaft', profile.county], ['Fürstentum', principality],
      ['Oberhaupt', person(source.currentHeadId)],
      ...(source.heirIds.length ? [['Erbfolge', source.heirIds.map(person).join(' → ')]] : []),
      ...(profile.liegeHouseName ? [['Lehensherr', profile.liegeHouseName]] : [])
    ],
    quote: '', quoteBy: '',
    house: {
      crestImage: definition.emblem,
      biographyTitle: definition.kind === 'sept' ? 'Über die Sept' : 'Über den Clan', biographyText: source.description,
      extraSections: definition.kind === 'sept' ? [] : [{ title: 'Tiarnatum', text: TIARNATUM }],
      documentsTitle: 'Abbildungen',
      documents: warriorReference ? [{ icon: definition.emblem, title: 'Kriegerdarstellung des Clans', text: '', link: warriorReference }] : []
    }
  });
}

export function createTerritorialSourceFamily(slug, source, { catalog, definitions, profiles, principality, sourceDate, sourceAudit }) {
  const definition = definitions.find(entry => entry.slug === slug);
  if (!definition) throw new Error(`Keine territoriale ${principality}-Akte für ${slug}.`);
  const profile = profiles[definition.familyId];
  const warriorReference = source.warriorReference ?? (definition.kind === 'sept' ? '' : `assets/images/references/${definition.familyId}/krieger.png`);
  const family = createSourceHouseFamily({
    id: definition.familyId, houseId: definition.houseId, title: definition.title,
    source, catalog: catalog, houseProfile: profile,
    description: source.description, emblem: definition.emblem,
    biography: sourceBiography(definition, profile, source, warriorReference, catalog, principality),
    territorialSource: definition.source,
    titleForPerson: personId => source.titles[personId] || '',
    crestSubtitle: `${profile.county} · ${profile.seat}`,
    extensions: {
      principality, territory: profile.county, albicRank: definition.rankId,
      administrativeRole: definition.administrativeRole || '',
      sourceNote: `Nutzerquellen und Stammbaumgrafiken vom ${sourceDate}. ${source.sourceNote} Eindeutige Gegenpersonen behalten ihre bestehenden IDs. Schreibvarianten und Gegenaktenkorrekturen sind im Quellen-Audit dokumentiert. ${source.unknownDataNote || 'Unbekannte Lebensjahre, Geschlechter und Herkunftshäuser werden nicht ergänzt.'}`,
      sourceAudit,
      warriorReference,
      registryManagedDocumentFields: ['description', 'emblem'],
      registryManagedExtensionFields: ['blankFamily', 'chartLayoutPolicy', 'sourceNote', 'sourceInventory', 'sourceAudit', 'warriorReference', 'houseBiographyModule']
    }
  });
  for (const pair of family.partnerships) {
    const layout = source.partnershipExtensions?.[pair.id];
    if (!layout) continue;
    pair.extensions = {
      ...pair.extensions, ...layout,
      registryManagedExtensionFields: [...new Set([
        ...pair.extensions.registryManagedExtensionFields, ...Object.keys(layout)
      ])]
    };
  }
  const guardiansByChild = new Map();
  for (const ward of source.foster) {
    if (!guardiansByChild.has(ward.childId)) guardiansByChild.set(ward.childId, new Set());
    guardiansByChild.get(ward.childId).add(ward.parentId);
  }
  for (const [childId, guardianIds] of guardiansByChild) {
    family.parentages.push(...createParentages([childId], [...guardianIds], '', {
      idPrefix: `${slug}-fosterage`, type: 'foster',
      notes: 'Ausdrücklich als Mündel bezeichnet; keine biologische Abstammung.'
    }));
  }
  if (source.founderPartnershipId) {
    family.lineage.founderPartnershipId = source.founderPartnershipId;
    family.view.focusPersonId = source.founderId;
  }
  return family;
}
