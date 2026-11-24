import { deaconSection } from './local-offices.mjs';
import { buildVicariatePlan } from './vicariate-plan.mjs';

const branches = [
  ['praelat', 'Prälat der Ortskirchen', 'Stimmt die Ortskirchen und die Aufsicht über ihre Diakone ab.'],
  ['kirchenkanzler', 'Kanzler der geistlichen Leitung', 'Leitet die Kanzlei und prüft die Ausfertigungen.'],
  ['visitator', 'Visitator', 'Besucht die Ortskirchen und berichtet über ihren Dienst.'],
  ['archivar', 'Archivar der Kirchenregister', 'Verwahrt Urkunden sowie die Register der Gemeinden.'],
  ['kirchgueter', 'Verwalter der Kirchengüter', 'Führt Aufzeichnungen über kirchliche Güter und Abgaben.'],
];

function staff(id, title, kind, count, description) {
  return Array.from({ length: count }, (_, index) => ({
    id: `${id}-${index + 1}`, title, kind, description, templateId: `r-${id}`,
  }));
}

export function buildRegionalChurchPlan(house, office) {
  if (!/^(?:(?:Erz)?Patriarch|Matriarch)/iu.test(office.title)) return buildVicariatePlan(house);
  const royal = house.rank === 'royal';
  return { sections: [
    { title: 'Geistliche Leitung', icon: 'faith', slots: [
      { id: 'kirchenadjutant', title: 'Adjutant der geistlichen Leitung', description: 'Koordiniert Audienzen, Aufträge und deren Übergabe an die Kanzlei.' },
    ] },
    { title: 'Die fünf Ämter der Kirchenleitung', icon: 'faith', core: true,
      slots: branches.map(([id, title, description]) => ({ id, title, description })) },
    { id: 'kirchenstab', title: 'Persönlicher Stab', icon: 'records', staff: true, slots: [
      ...staff('sekretaer', 'Sekretär', 'staff', royal ? 3 : 2, 'Hält Termine, Berichte und Weisungen der Leitung zusammen.'),
      ...staff('schreiber', 'Kirchenschreiber', 'staff', royal ? 5 : 3, 'Pflegt die Bücher und fertigt Abschriften an.'),
      ...staff('bote', 'Kirchenbote', 'staff', royal ? 4 : 2, 'Überbringt Briefe und Weisungen an die Ortskirchen.'),
    ] },
    deaconSection(house.places),
    { id: 'kirchenschutz', title: 'Kirchlicher Schutzdienst', icon: 'watch', repeatableHere: true, slots: [
      { id: 'hauptmann-schwurritter', title: 'Hauptmann der Schwurritter', description: 'Koordiniert den beauftragten Geleitdienst der geistlichen Leitung.' },
      ...staff('schwurritter', 'Schwurritter', 'other', royal ? 6 : 4, 'Versieht den eidverpflichteten kirchlichen Wach- und Geleitdienst.'),
      ...staff('buesser', 'Persönlicher Büßer', 'special', royal ? 4 : 2, 'Erfüllt die vereinbarte Buße unter geistlicher Leitung.'),
    ] },
  ] };
}
