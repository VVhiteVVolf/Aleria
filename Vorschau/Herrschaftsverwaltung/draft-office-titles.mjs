export const MAX_TITLE_LENGTH = 90;

export const officeTitleKey = area => `amt/${area}`;
export const postTitleKey = key => `posten/${key}`;
const roleTitleKey = (area, kind, identity) => `rolle/${area}/${kind}/${identity}`;
export const titleKeyForTemplate = (area, template) => roleTitleKey(area, template.kind, template.id);

function titleKeyForRole(post) {
  const area = post.area || post.key.split('/', 1)[0];
  return roleTitleKey(area, post.kind, post.templateId || `name:${post.title.toLocaleLowerCase('de')}`);
}

function checkedTitle(value) {
  const name = typeof value === 'string' ? value.trim() : '';
  if (!name || name.length > MAX_TITLE_LENGTH || /[\u0000-\u001F\u007F]/u.test(name)) {
    throw new Error(`Der Titel muss 1 bis ${MAX_TITLE_LENGTH} Zeichen lang sein und in einer Zeile stehen.`);
  }
  return name;
}

export function validTitleKeys(plans, posts) {
  const keys = new Set(Object.entries(plans).flatMap(([area, plan]) => [
    ...(plan.head ? [] : [officeTitleKey(area)]),
    ...plan.templates.map(template => titleKeyForTemplate(area, template)),
  ]));
  for (const post of posts.values()) {
    keys.add(postTitleKey(post.key));
    if (post.kind) keys.add(titleKeyForRole(post));
  }
  return keys;
}

export function importTitleOverrides(input, keys) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Ungültige Amtstitel im Entwurf.');
  return Object.fromEntries(Object.entries(input).map(([key, value]) => {
    if (!keys.has(key)) throw new Error(`Ein Titel im Entwurf verweist auf kein verfügbares Amt und keinen Posten: ${key}`);
    return [key, checkedTitle(value)];
  }));
}

export function updateTitleOverrides(overrides, keys, key, value) {
  if (!keys.has(key)) throw new Error('Dieses Amt oder dieser Posten kann nicht umbenannt werden.');
  const title = value === null ? undefined : checkedTitle(value);
  if (overrides[key] === title) return overrides;
  const next = { ...overrides };
  if (title === undefined) delete next[key];
  else next[key] = title;
  return next;
}

export function applyPostTitles(post, overrides) {
  const roleKey = post.kind ? titleKeyForRole(post) : null;
  const roleOverride = roleKey && overrides[roleKey];
  const postOverride = overrides[postTitleKey(post.key)];
  const roleTitle = roleOverride || post.templateTitle || post.title;
  const title = postOverride || roleOverride || post.title;
  const localityTitle = post.locality && post.locality.type !== 'station' && overrides[postTitleKey(post.locality.key)];
  return {
    ...post, title, originalTitle: post.title, roleKey, roleTitle,
    titleVariants: postOverride || roleOverride ? undefined : post.titleVariants,
    ...(localityTitle ? { locality: { ...post.locality, title: localityTitle } } : {}),
  };
}
