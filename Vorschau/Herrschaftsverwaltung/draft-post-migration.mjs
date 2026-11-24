export const customKey = post => `${post.area}/extra-${post.id}`;

function unusedId(area, name, occupiedKeys) {
  let id = name;
  let index = 2;
  while (occupiedKeys.has(customKey({ area, id }))) {
    const suffix = '-' + index++;
    id = name.slice(0, 64 - suffix.length) + suffix;
  }
  occupiedKeys.add(customKey({ area, id }));
  return id;
}

export function migrateFormerPost(scope, key, posts, occupiedKeys) {
  const retired = scope.retired.get(key);
  if (retired === null) return null;
  const [area, slot] = key.split('/');
  const fields = typeof retired === 'string' ? { title: retired } : retired;
  const previous = { area, kind: 'other', description: 'Aus einer früheren Fassung des Entwurfs übernommen.', ...fields };
  previous.id = unusedId(previous.area, `alt-${slot}`, occupiedKeys);
  posts.push(previous);
  return customKey(previous);
}

function migrateMilitaryPosts(scope, posts) {
  const moved = new Map();
  const formerTroop = scope.retired.get('militaer/waffenknecht');
  if (!formerTroop) return { posts, moved };
  const transfer = post => post?.area === 'militaer' && post.templateId === 'r-waffenknecht';
  const occupiedKeys = new Set(posts.filter(post => post && !transfer(post)).map(customKey));
  const updated = posts.map(post => {
    if (!transfer(post) || typeof post.id !== 'string') return post;
    const name = scope.plans.militaer.localities.find(place => place.key === post.site)?.name;
    const station = name && scope.plans[formerTroop.area].localities.find(place => place.name === name);
    const id = unusedId(formerTroop.area, post.id, occupiedKeys);
    const replacement = { ...post, ...formerTroop, id, site: station?.key };
    moved.set(customKey(post), customKey(replacement));
    return replacement;
  });
  return { posts: updated, moved };
}

export function migrateStoredPosts(scope, posts, military) {
  const retired = post => typeof post?.templateId === 'string' && post.templateId.startsWith('r-')
    && scope.retired.get(`${post.area}/${post.templateId.slice(2)}`) === null;
  const obsolete = new Set(posts.filter(retired).map(customKey));
  const remaining = posts.filter(post => !retired(post));
  return { ...(military ? migrateMilitaryPosts(scope, remaining) : { posts: remaining, moved: new Map() }), obsolete };
}
