// Read-only classification. Manual groups always win; profile and combat data
// are never changed just to organize the register.
const AleriaCharacterCategories = (() => {
  const kinds = {
    collection: 'Eigene Gruppen',
    family: 'Häuser & Familien',
    faction: 'Fraktionen & Gefolge',
    location: 'Aufenthaltsorte',
    unsorted: 'Noch zuordnen'
  };
  const clean = value => String(value || '').trim();
  const keyFor = (kind, label) => `${kind}:${clean(label).toLocaleLowerCase('de')}`;

  function classify(char) {
    const manual = getCharacterAssignedTab(char?.id);
    if (manual) return { kind: 'collection', key: keyFor('collection', manual), label: manual, automatic: false };

    const memberships = getCharacterRegisterFamilyMemberships(char);
    const house = clean(char?.genealogy?.houseName);
    const family = memberships.find(item => clean(item.familyTitle).toLocaleLowerCase('de') === house.toLocaleLowerCase('de'));
    let kind = 'family';
    let label = house;
    let emblem = family?.emblem || '';
    if (!label && memberships.length === 1) {
      label = clean(memberships[0].familyTitle || memberships[0].familyId);
      // The local fallback only knows stable family IDs, not registry titles.
      if (label === memberships[0].familyId) {
        label = label.split('-').map(word => word.charAt(0).toLocaleUpperCase('de') + word.slice(1)).join(' ');
      }
      emblem = memberships[0].emblem || '';
    }
    if (!label) {
      kind = 'faction';
      label = clean(char?.fraktion || char?.faction).split(/[,;·]/).map(clean).find(Boolean) || '';
    }
    if (!label) {
      kind = 'location';
      label = clean(char?.currentLocation);
    }
    if (!label) return { kind: 'unsorted', key: 'unsorted:', label: 'Noch zuordnen', automatic: false, emblem: '' };
    return { kind, key: keyFor(kind, label), label, automatic: true, emblem };
  }

  function buildBuckets(chars) {
    const buckets = new Map();
    for (const char of chars) {
      const category = classify(char);
      if (!buckets.has(category.key)) buckets.set(category.key, { ...category, chars: [] });
      buckets.get(category.key).chars.push(char);
    }
    const order = Object.keys(kinds);
    return [...buckets.values()].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind)
      || a.label.localeCompare(b.label, 'de', { sensitivity: 'base', numeric: true }));
  }

  return Object.freeze({ classify, buildBuckets, kinds });
})();
