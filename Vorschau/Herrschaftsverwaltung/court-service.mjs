import { isPersonReference } from './draft-assignment-references.mjs';

const serviceTemplates = new Map([
  ['r-zofenstelle', 'Zofe'], ['r-zofe-rianna', 'Zofe'], ['r-kammerstelle', 'Kammerdiener'],
]);
const recorded = {
  draig: {
    'hof/zofe': 'person--haus-draig--oweta-draig',
    'hof-vogt/zofenstelle-2': 'person--haus-draig--isobel-1719-draig',
    'hof-vogt/zofenstelle-3': 'person--haus-draig--rhiannon-draig',
    'hof-vogt/kammerstelle': 'person--haus-draig--anaraut-draig',
    'hof-vogt/kammerstelle-2': 'person--haus-draig--neithon-1718-draig',
  },
  wyrm: { 'hof/zofe': 'person--haus-wyrm--rianna-wyrm' },
};

export function courtServiceTitle(post) {
  if (post.key === 'hof/zofe') return 'Zofe';
  if (post.key === 'hof/kammerdiener') return 'Kammerdiener';
  if (post.area !== 'hof-vogt') return undefined;
  return serviceTemplates.get(post.templateId) || (post.kind === 'service' && (post.placement === 'hausdienst' || post.custom)
    ? post.originalTitle || post.title : undefined);
}

export function sourceServiceRecipient(scopeId, post, people) {
  const id = recorded[scopeId]?.[post.key];
  if (id) return people.get(id) || null;
  return scopeId === 'draig' && post.key === 'hof-vogt/zofenstelle' ? { name: 'Tegwen' } : null;
}

export function readServiceRecipients(input, posts) {
  if (input === undefined) return {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Ungültige persönliche Dienstzuteilungen.');
  for (const [key, id] of Object.entries(input)) {
    const post = posts.get(key);
    if (!post || !courtServiceTitle(post) || (id !== null && !isPersonReference(id))) {
      throw new Error('Eine persönliche Dienstzuteilung gehört zu keinem verfügbaren Hofposten.');
    }
  }
  return Object.fromEntries(Object.entries(input));
}

export function indexCourtRetinues(appointments, recipientFor) {
  const retinues = new Map();
  for (const [personId, entries] of appointments) {
    for (const entry of entries) {
      if (!courtServiceTitle(entry.post)) continue;
      const recipient = recipientFor(entry.scopeId, entry.post);
      if (!recipient?.id) continue;
      if (!retinues.has(recipient.id)) retinues.set(recipient.id, []);
      retinues.get(recipient.id).push({ personId, ...entry });
    }
  }
  return retinues;
}
