export function peopleGroups(pins, households, { filter = 'all' } = {}) {
  const byPin = new Map(pins.map(pin => [pin.id, pin]));
  return households.flatMap(household => {
    const pin = byPin.get(household.pinId);
    if (!pin || pin.secret || (filter !== 'all' && pin.cat !== filter) || !household.members?.length) return [];
    return [{ pin, members: household.members }];
  });
}
