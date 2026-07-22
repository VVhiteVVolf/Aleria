const LINEAGE_PARTNERSHIP_TYPES = new Set(['marriage', 'union']);
const STATUS_PRIORITY = Object.freeze({
  active: 0,
  secret: 0,
  widowed: 1,
  divorced: 2,
  ended: 3
});

export function isLineagePartnership(partnership) {
  return Boolean(partnership && LINEAGE_PARTNERSHIP_TYPES.has(partnership.type));
}

/**
 * Liefert nur Verbindungen, unter denen fachlich ein Haus-/Linienknoten stehen
 * darf. Aktuelle Verbindungen kommen zuerst; historische Ehen bleiben bewusst
 * auswählbar, weil eine Wegverheiratung durch Scheidung oder Tod nicht aus der
 * Genealogie verschwindet.
 */
export function listLineagePartnerships(family, personId) {
  return (Array.isArray(family?.partnerships) ? family.partnerships : [])
    .filter(partnership => (
      isLineagePartnership(partnership)
      && Array.isArray(partnership.participantIds)
      && partnership.participantIds.includes(personId)
    ))
    .sort((first, second) => (
      (STATUS_PRIORITY[first.status] ?? 4) - (STATUS_PRIORITY[second.status] ?? 4)
      || String(second.start || '').localeCompare(String(first.start || ''), 'de')
      || first.id.localeCompare(second.id, 'de')
    ));
}
