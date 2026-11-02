const iconRoot = '/AleriaAlmanach/assets/development-traits/web/';
export const SUBSTANCE_PROFILES = Object.freeze({
  alcohol: { name: 'Alkohol', stateName: 'Betrunken', threshold: 4.8, baseMinutes: 60,
    icon: `${iconRoot}zustand-betrunken.webp`, mechanics: { attack: -1, skill: -2, initiative: -1, spellSaveDc: -1, saveModifiers: [{ kind: 'fear', bonus: 2 }] },
    description: '+2 auf Rettungswürfe gegen Furcht; −1 Angriff, Initiative und Zauber-SG, −2 auf Fertigkeitsproben.' },
  kriss: { name: 'Kriss', stateName: 'Kriss-Rausch', threshold: 1, baseMinutes: 60,
    icon: `${iconRoot}zustand-kriss-rausch.webp`, mechanics: { initiative: 1, skillModifiers: [{ name: 'Wahrnehmung', bonus: 2 }], saveAttributeModifiers: [{ attributeKey: 'dexterity', bonus: 1 }, { attributeKey: 'wisdom', bonus: -2 }] },
    description: '+2 Wahrnehmung, +1 Initiative und GES-Rettungswürfe; −2 auf WEI-Rettungswürfe. Hunger und starkes Verlangen können nachklingen.' },
  smaragdflux: { name: 'Smaragdflux', stateName: 'Smaragdflux-Rausch', threshold: 1, baseMinutes: 30,
    icon: `${iconRoot}zustand-smaragdflux-rausch.webp`, mechanics: { spellAttack: 2, spellSaveDc: 1, armorClass: -1, saveAttributeModifiers: [{ attributeKey: 'constitution', bonus: -2 }] },
    description: '+2 Zauberangriff und +1 Zauber-SG; −1 RK und −2 auf KON-Rettungswürfe. Hohe Belastung; mögliche Organschäden und Arkanistenfieber müssen gesondert beurteilt werden. Kein automatisches Manaauffüllen.' },
  blutstaub: { name: 'Blutstaub', stateName: 'Blutstaub-Rausch', threshold: 1, baseMinutes: 60,
    icon: `${iconRoot}zustand-blutstaub-rausch.webp`, mechanics: { initiative: 1, skillModifiers: [{ name: 'Nachforschungen', bonus: 2 }, { name: 'Motiv erkennen', bonus: -1 }], saveAttributeModifiers: [{ attributeKey: 'constitution', bonus: -1 }] },
    description: '+1 Initiative und +2 Nachforschungen; −1 auf Motiv erkennen und KON-Rettungswürfe. Organschäden sind keine Heilwirkung.' }
});
export function getSubstanceIcon(kind) { return SUBSTANCE_PROFILES[kind]?.icon || `${iconRoot}zustand-verkatert.webp`; }
export function normalizeSubstanceState(value = {}) {
  if (!Object.hasOwn(SUBSTANCE_PROFILES, value.kind) || !['exposure', 'intoxication', 'hangover'].includes(value.phase)) return null;
  const bounded = (key, maximum = 1000000) => Math.max(0, Math.min(maximum, Number(value[key]) || 0));
  return { version: 1, kind: value.kind, phase: value.phase, actorId: String(value.actorId || '').slice(0, 240),
    load: bounded('load'), peak: bounded('peak'), tolerance: Math.max(1, bounded('tolerance', 10)),
    atSeconds: bounded('atSeconds', Number.MAX_SAFE_INTEGER), hangoverSeconds: bounded('hangoverSeconds', 10800) };
}
export function normalizeSubstanceExposure(value) {
  if (value == null) return null;
  if (!value || typeof value !== 'object' || !Object.hasOwn(SUBSTANCE_PROFILES, value.kind)) throw Error('Wähle ein bekanntes Rauschmittelprofil.');
  const measured = value.kind === 'alcohol' && value.volumeMl != null && value.abv != null;
  const amount = measured ? Number(value.volumeMl) * Number(value.abv) / 1000 : Number(value.amount);
  if (measured && (!Number.isFinite(Number(value.volumeMl)) || Number(value.volumeMl) <= 0 || Number(value.volumeMl) > 1000000 || !Number.isFinite(Number(value.abv)) || Number(value.abv) <= 0 || Number(value.abv) > 100)) throw Error('Alkohol benötigt einen gültigen Inhalt in ml und einen Alkoholgehalt von 0–100 %.');
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) throw Error('Die Rauschmittelmenge muss größer als null sein.');
  return { kind: value.kind, amount: Math.round(amount * 1000000) / 1000000,
    ...(measured ? { volumeMl: Number(value.volumeMl), abv: Number(value.abv) } : {}) };
}
