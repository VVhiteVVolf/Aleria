import { HOF_MAPPED_POIS } from '../../../shared/tirfelyn-hof/hof-pois.mjs';
import { hofResidentsAt } from '../../../shared/tirfelyn-hof/hof-household.mjs';

export function buildHofPeopleLayer() {
  return { label: 'Personen', groups: HOF_MAPPED_POIS.filter(poi => poi.residenceId).map(poi => ({
    pinId: `tirfelyn-${poi.key}`,
    members: hofResidentsAt(poi).map(person => ({ id: person.actorId, name: person.name, role: person.work,
      portrait: person.portrait, href: `/AleriaAlmanach/AleriaAlmanach.html?character=${encodeURIComponent(person.actorId)}` }))
  })) };
}
