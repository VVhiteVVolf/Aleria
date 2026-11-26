import { geographicKey } from '../world-directory/geographic-key.mjs';
import { officeIcon } from './office-icons.mjs';
import { prepareOfficePlan } from './office-plan-assembly.mjs';
import { LEHENSWARTE_ID } from './lehenswarte-plan.mjs';
import { settlementDefinition } from './settlement-government.mjs';

export function buildSettlementPlans(house, plans, appointments) {
  const parent = plans[LEHENSWARTE_ID];
  if (!parent) return {};
  const existing = new Map(Object.values(plans).flatMap(plan => plan.slots.map(slot => [slot.key, slot])));
  return Object.fromEntries(parent.slots.flatMap(head => {
    if (!head.authority || geographicKey(head.place) === geographicKey(house.governmentSeat)) return [];
    const definition = settlementDefinition({ name: head.place, type: head.authority.type }, { authority: head.authority });
    if (!definition) return [];
    const { id, place, government, council, type } = definition;
    head.department = id;
    const official = { ...head, settlement: place };
    const sections = government.map(group => ({
      ...group,
      slots: group.slots.map(({ canonicalKey, ...slot }) => ({ ...slot, ...existing.get(canonicalKey), settlement: place })),
    }));
    const plan = prepareOfficePlan(house, id, {
      head: official,
      sections: [
        ...sections,
        { id: 'ortsrat', title: council.title, description: council.description, icon: 'records', repeatableHere: true,
          slots: council.seats.map(slot => ({ ...slot, settlement: place })) },
      ],
    }, appointments);
    return [[id, {
      ...plan, settlement: { name: place, type, kind: definition.kind }, parentArea: LEHENSWARTE_ID,
      department: { id, name: definition.label + ' ' + place, imageSrc: officeIcon(definition.head.icon) },
    }]];
  }));
}
