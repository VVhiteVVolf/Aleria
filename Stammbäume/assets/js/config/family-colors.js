export const FAMILY_ROLES = Object.freeze({
  core: Object.freeze({
    id: 'core',
    label: 'Kernfamilie',
    description: 'Blutlinie und unmittelbare Dynastie',
    cssClass: 'role-core'
  }),
  married: Object.freeze({
    id: 'married',
    label: 'Eingeheiratet',
    description: 'Durch Ehe oder Bündnis Teil der Familie',
    cssClass: 'role-married'
  }),
  bastard: Object.freeze({
    id: 'bastard',
    label: 'Außerhalb der Ehe',
    description: 'Bastard oder außerhalb der Ehe gezeugte Person',
    cssClass: 'role-bastard'
  }),
  affair: Object.freeze({
    id: 'affair',
    label: 'Affäre / geheim',
    description: 'Geheime oder außereheliche Verbindung',
    cssClass: 'role-affair'
  }),
  forced: Object.freeze({
    id: 'forced',
    label: 'Erzwungen',
    description: 'Erzwungene oder politisch belastete Verbindung',
    cssClass: 'role-forced'
  }),
  ward: Object.freeze({
    id: 'ward',
    label: 'Mündel',
    description: 'Als Mündel in die Familie aufgenommen',
    cssClass: 'role-ward'
  }),
  'ward-away': Object.freeze({
    id: 'ward-away',
    label: 'Als Mündel fortgegeben',
    description: 'Aus der Familie als Mündel fortgegeben',
    cssClass: 'role-ward-away'
  }),
  adopted: Object.freeze({
    id: 'adopted',
    label: 'Adoptiert',
    description: 'Rechtlich oder familiär in die Linie aufgenommen',
    cssClass: 'role-adopted'
  })
});

export const DEFAULT_RELATIONSHIP_COLORS = Object.freeze({
  marriage: '#326c4a',
  engagement: '#b88b37',
  union: '#8e2724',
  affair: '#704485',
  concubinage: '#704485',
  political: '#9d7d48',
  forced: '#c7a974',
  biological: '#8e2724',
  adoptive: '#2f75a8',
  foster: '#2f75a8',
  step: '#7eb4d7',
  magical: '#704485',
  claimed: '#62615e'
});

export const PARTNERSHIP_LABELS = Object.freeze({
  marriage: 'Ehe',
  engagement: 'Verlobung',
  union: 'Verbindung',
  affair: 'Affäre',
  concubinage: 'Konkubinat',
  political: 'Politisches Bündnis',
  forced: 'Erzwungene Verbindung'
});

export const PARENTAGE_LABELS = Object.freeze({
  biological: 'Biologisch',
  adoptive: 'Adoptiert',
  foster: 'Pflege',
  step: 'Stiefbeziehung',
  magical: 'Magisch',
  claimed: 'Beansprucht'
});

export const LEGITIMACY_LABELS = Object.freeze({
  legitimate: 'Legitim',
  illegitimate: 'Unehelich',
  legitimized: 'Legitimiert',
  disputed: 'Umstritten',
  unknown: 'Unbekannt'
});

export const STATUS_LABELS = Object.freeze({
  alive: 'Lebend',
  dead: 'Verstorben',
  missing: 'Verschollen',
  unknown: 'Unbekannt'
});

export function getFamilyRole(roleId) {
  return FAMILY_ROLES[roleId] || FAMILY_ROLES.core;
}
