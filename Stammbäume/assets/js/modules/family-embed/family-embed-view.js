// Presentation-only opt-in for the Almanach iframe. Data, permissions, card
// interactions and fit/zoom controls remain owned by the full workspace.
export function configureFamilyEmbedView({ documentRef, locationRef }) {
  const query = new URLSearchParams(locationRef.search);
  const enabled = query.get('embed') === '1' && query.get('mode') === 'view';
  documentRef.documentElement.toggleAttribute('data-family-embed', enabled);
  return enabled;
}
