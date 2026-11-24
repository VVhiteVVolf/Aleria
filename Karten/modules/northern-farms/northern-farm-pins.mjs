import { NORTHERN_FARMS } from '../../../shared/gwynthor-northern-farms/northern-farms.mjs';

export function projectNorthernFarmPin(pin, farm) {
  const patch = {
    'Bewirtschaftung': pin.id === 'gwynthor-marking-042' ? farm.familyName : undefined,
    'Versorgung / Abnehmer': farm.recipients,
    'Besonderheiten': farm.slug === 'gwerfil' || farm.slug === 'cyffiniau' ? '' : undefined
  };
  const table = pin.table.filter(row => row.k !== 'Dienstbindung').map(row =>
    patch[row.k] === undefined ? row : { ...row, v: patch[row.k] });
  const tree = `/Stammbäume/Stammbaum.html?family=${farm.familyId}&mode=view`;
  const house = `/Familien Häuser und Clans/kleinehaeuser.html?haus=${farm.familyId}`;
  return {
    ...pin,
    residentFamilyIds: [farm.familyId],
    table: [...table, { k: 'Dienstbindung', v: farm.liegeName }],
    text: [farm.overview, farm.holdings, farm.relations,
      `[URL=${house}]Familienakte[/URL] · [URL=${tree}]Stammbaum[/URL]`].filter(Boolean).join('\n\n')
  };
}

export function projectNorthernFarmPins(pins) {
  const farms = new Map(NORTHERN_FARMS.map(farm => [farm.pinId, farm]));
  return pins.map(pin => farms.has(pin.id) ? projectNorthernFarmPin(pin, farms.get(pin.id)) : pin);
}
