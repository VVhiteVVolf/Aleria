import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

export function applyFamilyMetadataReview(record, review) {
  // Validate the complete review before restoring anything. Two profile paths
  // can deliberately share the same object in a registry record.
  const operations = review.fields.map(field => {
    let parent = record;
    for (const segment of field.path.slice(0, -1)) {
      if (segment.startsWith('@')) {
        assert(Array.isArray(parent));
        const matches = parent.filter(row => row.id === segment.slice(1));
        assert.equal(matches.length, 1); parent = matches[0];
      } else parent = parent?.[segment];
      assert(parent, `${review.familyId}/${field.path.join('/')}`);
    }
    assert(!Array.isArray(parent));
    const key = field.path.at(-1), label = `${review.familyId}/${field.path.join('/')}/approved-metadata`;
    assert.equal(Object.hasOwn(parent, key), field.afterPresent, label);
    if (field.afterPresent) {
      if (field.afterSha256) assert.equal(createHash('sha256').update(JSON.stringify(parent[key])).digest('hex'), field.afterSha256, label);
      else assert.deepEqual(parent[key], field.after, label);
    }
    return { field, parent, key };
  });
  for (const { field, parent, key } of operations) {
    if (field.beforePresent) parent[key] = structuredClone(field.before);
    else delete parent[key];
  }
  // The older proof hashes JSON bytes, including insertion order. Restore the
  // exact two reviewed metadata objects after their newly added fields vanish.
  for (const order of review.historicalObjectOrders || []) {
    let parent = record;
    for (const segment of order.path.slice(0, -1)) {
      parent = segment.startsWith('@')
        ? parent.find(row => row.id === segment.slice(1)) : parent[segment];
    }
    const key = order.path.at(-1), object = parent[key];
    assert.deepEqual(Object.keys(object).sort(), [...order.keys].sort());
    parent[key] = Object.fromEntries(order.keys.map(field => [field, object[field]]));
  }
  return record;
}
