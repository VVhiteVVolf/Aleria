const statuses = new Set(['available', 'unavailable', 'owned', 'sold']);
const invalidResponse = () => Error('Der Händler hat keine gültige Verfügbarkeitsbestätigung geliefert. Bitte die Bestände neu laden.');

export function readSceneTradeAvailabilityResponse(response) {
  if (!Array.isArray(response?.products)) throw invalidResponse();
  const ids = new Set();
  for (const product of response.products) {
    if (!product || typeof product.productId !== 'string' || !product.productId.trim()
      || typeof product.available !== 'boolean' || !statuses.has(product.status)
      || product.available !== (product.status === 'available')
      || (product.unique !== undefined && typeof product.unique !== 'boolean') || ids.has(product.productId)) throw invalidResponse();
    ids.add(product.productId);
  }
  return response.products;
}

/** Missing catalog matches are unconfirmed, never proof that a ware is sold out. */
export function reconcileSceneTradeAvailability(offers, merchantId, products) {
  const confirmed = readSceneTradeAvailabilityResponse({ products });
  const byId = new Map(confirmed.map(product => [product.productId, product]));
  let unconfirmedCount = 0;
  const nextOffers = offers.map(product => {
    if (product.listId !== merchantId) return product;
    const availability = byId.get(product.id);
    if (!availability) {
      unconfirmedCount++;
      return { ...product, available: false, availabilityStatus: 'unknown' };
    }
    return { ...product, available: availability.available, availabilityStatus: availability.status,
      ...(availability.unique ? { definitionKind: 'unique' } : {}) };
  });
  return { offers: nextOffers, unconfirmedCount };
}
