import { FAMILY_REGISTRY } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { normalizePersonBiographyModule } from '../../../Stammbäume/assets/js/modules/person-biography/person-biography-model.js';
import { attachCreatureToInventory } from '../creatures/creature-companion-link.js';
import { BIOGRAPHY_ART_ROOT, GWYNTHOR_BIOGRAPHY_CONTENT } from './biography-content.mjs';
import { createGwynthorBiographyCompanions } from './biography-companions.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const paragraphs = values => values.map(value => `<p>${escape(value)}</p>`).join('');

function portraitFor(familyId, personId) {
  const person = FAMILY_REGISTRY.find(family => family.id === familyId)?.family.persons.find(person => person.id === personId);
  if (!person?.portrait) throw new Error(`Belegtes Personenporträt fehlt: ${familyId}/${personId}`);
  return `/Stammbäume/${person.portrait}`;
}

// Field-limited enrichment, also usable with a freshly read character before publication.
// Combat profiles, item instances, resources and existing image sets remain authoritative.
export function enrichGwynthorBiography(character, now) {
  const key = character.id.replace(/^person--haus-(?:wyrm|gafyr)--/, '');
  const content = GWYNTHOR_BIOGRAPHY_CONTENT[key];
  if (!content) return character;
  const creatures = createGwynthorBiographyCompanions(character, now);
  let inventory = character.inventory;
  for (const creature of creatures) inventory = attachCreatureToInventory({ ...character, inventory }, creature, now);
  const previous = character.biography.biography;
  const connections = structuredClone(previous.connections || []).filter(connection =>
    !creatures.some(creature => creature.name === connection.name)
    && !(connection.type === 'heading' && connection.title === 'Tierische Begleiter'));
  for (const [familyId, personId, name, detail] of content.connections) {
    const existing = connections.find(connection => connection.name === name);
    const connection = { type: 'connection', name, detail, image: portraitFor(familyId, personId), imageFormat: 'portrait' };
    if (existing) Object.assign(existing, connection); else connections.push(connection);
  }
  connections.push({ type: 'heading', title: 'Tierische Begleiter', detail: '' }, ...creatures.map(creature => ({
    type: 'connection', name: creature.name, detail: creature.species + (creature.name === 'Agravaine' ? ' · genannt Vain' : ''),
    image: creature.portrait, imageFormat: 'portrait'
  })));
  const extraSections = [...content.sections.map(section => ({ position: 'afterIntro', mode: 'text', title: section.title, text: paragraphs(section.paragraphs) })),
    ...(previous.extraSections || []).filter(section => section.title === 'Erscheinung')];
  const biography = normalizePersonBiographyModule({ ...character.biography, biography: { ...previous,
    biographyTitle: content.title, biographyText: paragraphs(content.introduction),
    historyTitle: content.historyTitle, historyText: paragraphs(content.history), extraSections,
    abilitiesTitle: 'Persönlichkeit und Begabung', abilities: content.traits.map(([title, detail, icon]) => ({ title, detail, icon: `/IconOrdner/Traits Icon/${icon}.png` })),
    knightMentors: content.mentors.map(([familyId, personId, name, role, detail]) => ({ name, role, detail, image: portraitFor(familyId, personId) })),
    portraitStages: content.portraits.map(file => BIOGRAPHY_ART_ROOT + file), portraitCaptions: content.captions, portraitFit: 'contain',
    connectionsTitle: 'Familie, Ausbildung und Begleiter', connections,
    documents: [...(previous.documents || []).filter(document => !creatures.some(creature => creature.name === document.title)),
      ...creatures.map(creature => ({ title: creature.name, icon: creature.portrait, text: creature.biography.summary, link: creature.bestiaryReference.url }))],
    footer: 'Personenakte · Weltjahr 1740'
  } });
  const bio = [...content.introduction, ...content.history, ...content.sections.flatMap(section => section.paragraphs)].join('\n\n');
  return { ...character, bio, biography, inventory };
}
