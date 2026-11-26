import { geographicKey } from '../world-directory/geographic-key.mjs';
import { officeIcon } from './office-icons.mjs';
import { prepareOfficePlan } from './office-plan-assembly.mjs';
import { LEHENSWARTE_ID } from './lehenswarte-plan.mjs';
import { settlementDefinition, settlementJurisdiction } from './settlement-government.mjs';
import { settlementOfficeStaff } from './settlement-office-staff.mjs';

export function buildSettlementOfficePlans(house, definition, appointments = new Map(), { head, standing = new Map() } = {}) {
  const { id, place, type, kind, government, council, garrison } = definition;
  const settlement = { name: place, type, kind };
  const departmentId = role => `ortsamt-${geographicKey(place)}--${role}`;
  const branchPost = (slot, incumbent) => ({
    ...slot, ...incumbent,
    icon: slot.icon, jurisdiction: slot.jurisdiction,
    description: slot.id === 'leitung' ? incumbent?.description || slot.description : slot.description,
    settlement: place, officeRole: slot.id, department: departmentId(slot.id),
  });
  const overview = prepareOfficePlan(house, id, {
    head: branchPost(definition.head, head),
    sections: [
      ...government.map(group => ({
        ...group,
        slots: group.slots.map(slot => branchPost(slot, standing.get(slot.canonicalKey))),
      })),
      { id: 'ortsrat', title: council.title, description: council.description, icon: 'council', repeatableHere: true,
        slots: council.seats.map(slot => ({ ...slot, settlement: place })) },
    ],
  }, appointments);
  const result = {
    [id]: { ...overview, settlement, parentArea: LEHENSWARTE_ID,
      department: { id, name: `${definition.label} ${place}`, imageSrc: officeIcon(definition.head.icon) } },
  };
  for (const slot of overview.slots.filter(slot => slot.department)) {
    const branch = slot.department;
    const { department, ...lead } = slot;
    const jurisdiction = settlementJurisdiction(kind, slot);
    const retained = garrison?.commander === slot.officeRole ? garrison.posts.map(post => ({
      ...post, key: `${id}/${post.id}`, reportsTo: 'der Garnisonsführung',
    })) : [];
    const sections = settlementOfficeStaff(definition, { ...lead, id: slot.officeRole }, retained).map(group => ({
      ...group, slots: group.slots.map(post => ({ ...post, settlement: place, jurisdiction })),
    }));
    const plan = prepareOfficePlan(house, branch, { head: lead, sections }, appointments);
    result[branch] = { ...plan, settlement, settlementOffice: true, parentArea: id,
      department: { id: branch, name: lead.title, imageSrc: officeIcon(slot.icon) } };
  }
  return result;
}

export function buildSettlementPlans(house, plans, appointments) {
  const parent = plans[LEHENSWARTE_ID];
  if (!parent) return {};
  const standing = new Map(Object.values(plans).flatMap(plan => plan.slots.map(slot => [slot.key, slot])));
  const result = {};
  for (const head of parent.slots) {
    if (!head.authority || geographicKey(head.place) === geographicKey(house.governmentSeat)) continue;
    const definition = settlementDefinition({ name: head.place, type: head.authority.type }, { authority: head.authority });
    if (!definition) continue;
    head.department = definition.id;
    Object.assign(result, buildSettlementOfficePlans(house, definition, appointments, { head, standing }));
  }
  return result;
}
