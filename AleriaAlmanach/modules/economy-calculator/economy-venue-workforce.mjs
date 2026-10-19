const vacant = /\b(?:unbesetzt\w*|freier? (?:platz|posten)|frei(?:er)?, einzeln vorgesehener|neuer? (?:unterrang|rang))\b/i;
const anonymous = /^(?:name|(?:erster|zweiter|dritter|erste|zweite|dritte)\b|hausgardist|soldat|leutnant|braumeister|brennmeister|braugehilfe|brenngehilfe|küfer|feuerungs|lagermeister|lieferschreiber|fuhrmann|hof- und|empfang und|schreiber und|bader$|gästedienst|wäsche- und|heizer$)/i;
const textKey = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

export function rolePay(role, area) {
  if (/lehrling|in ausbildung/i.test(role)) return { kind: 'apprentice', days: 4, dailyCash: 1.5 };
  if (/hauptmann|unteroffizier|leutnant|hausvogt|hausmutter|verwalter|meister|schankvogt|leiter|leitung|bevollmächtigt/i.test(role)) return { dailyCash: 9 };
  if (/koch|köchin|schneider|geselle|harnisch|klinge|musikan|tänzerin|\bküche\b/i.test(role)) return { dailyCash: 7 };
  if (/kurtisane|gesellschafterin|dirne/i.test(role)) return { dailyCash: 2 };
  if (/magd|reinig|putz|wasser|küchengehilfe|laufbursche|hausbursche|lagergehilfe/i.test(role)) return { dailyCash: 3 };
  if (/wäch|wacht|türsteh|soldat|gardist|soldknecht|sicherheit/i.test(`${role} ${area}`)) return { dailyCash: 5.5 };
  return { dailyCash: 4.5 };
}

function hierarchyWorkers(entry, profile) {
  const workers = new Map();
  const trees = entry.pages.flatMap(page => page.hierarchyPage ? page.hierarchy?.trees || [] : []);
  for (const [ti, tree] of trees.entries()) for (const [li, level] of (tree.levels || []).entries()) for (const [ni, node] of (level.nodes || []).entries()) {
    const title = String(node.title || '').trim(), role = String(node.subtitle || '').trim();
    const alias = profile.personAliases?.[title], name = alias?.name || title, job = alias?.role || role;
    const isVacant = vacant.test(`${title} ${role}`), animal = /(?:tiere|haustiere)/i.test(tree.label) || /\b(?:wachhund|lagerkatze|hauskatze|haushund)\b/i.test(role);
    const unnamed = anonymous.test(title) || /unbenannte stelle/i.test(role);
    const id = !unnamed && !isVacant && name ? `person-${textKey(name)}` : `position-${node.id || `${ti}-${li}-${ni}`}`;
    if (workers.has(id)) { const worker = workers.get(id); if (!worker.areas.includes(tree.label)) worker.areas.push(tree.label); continue; }
    const owner = profile.owners.includes(name);
    const pay = rolePay(`${job} ${unnamed ? title : ''}`, tree.label);
    const kind = isVacant ? 'vacancy' : animal ? 'animal' : owner ? 'owner' : pay.kind || 'employee';
    workers.set(id, { id, name: name === 'Name' ? `Unbenannt · ${job || tree.label}` : name, role: job || title, areas: [tree.label], count: 1, kind,
      days: ['vacancy', 'animal'].includes(kind) ? 0 : pay.days || 6, dailyCash: owner || isVacant || animal ? 0 : pay.dailyCash,
      fairDaily: isVacant || animal ? 0 : owner ? 9 : pay.dailyCash, ownerShare: owner ? 1 / profile.owners.length : 0,
      boardDays: !owner && !isVacant && !animal ? 9 : 0, boardDaily: .5, lodgingWeekly: !owner && !isVacant && !animal ? 1 : 0,
      anonymous: unnamed, note: 'Lohnansatz für diese Rolle; Kost und einfacher Schlafplatz nur für die Person. Keine Lohnableitung aus Geschlecht oder Herkunft.',
      source: `Aktuelle Hierarchie · ${entry.title} · ${tree.label}` });
  }
  return [...workers.values()];
}

export function buildVenueWorkforce(entry, profile) {
  const workers = profile.modelStaff ? profile.modelStaff.map(([role, count, dailyCash], index) => ({ id: `model-staff-${index}`, name: 'Anonyme Modellbesetzung',
    role, areas: ['Angenommener Personalbedarf'], kind: 'employee', count, days: 6, dailyCash, fairDaily: dailyCash, boardDays: 9, boardDaily: .5, lodgingWeekly: 1,
    anonymous: true, source: 'Ausdrückliche Modellannahme bei noch nicht ausgearbeiteter Hierarchie', note: profile.note })) : hierarchyWorkers(entry, profile);
  if (profile.corporateOwner) workers.push({ id: 'business-owner', name: profile.corporateOwner, role: 'Besitz-/Betriebskonto · keine zusätzliche Arbeitskraft', areas: ['Besitzkonto'],
    kind: 'owner', count: 0, days: 0, dailyCash: 0, fairDaily: 0, ownerShare: 1 });
  const recipients = workers.filter(worker => /kurtisane|gesellschafterin|dirne/i.test(worker.role) && worker.kind !== 'vacancy');
  for (const worker of recipients) { worker.salesShare = (profile.commission || 0) / recipients.length; worker.salesChannelIds = ['service-private', 'service-short', 'service-company']; }
  return workers;
}
