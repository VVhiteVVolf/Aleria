import {
  needsRegisteredFamilyUpgrade,
  resolveRegisteredFamilyUpgrade
} from '../../services/family-registry-upgrade.js';

export function reconcileFamilyWithProjectOrigin({ family, projectOriginFamily }) {
  if (
    !family
    || !projectOriginFamily
    || family.document?.id !== projectOriginFamily.document?.id
    || !needsRegisteredFamilyUpgrade(projectOriginFamily, family)
  ) {
    return Object.freeze({ family, upgraded: false });
  }

  return Object.freeze({
    family: resolveRegisteredFamilyUpgrade(projectOriginFamily, family),
    upgraded: true
  });
}

export function reconcileInitialFamilyDraft({ draft, projectOriginFamily }) {
  if (!draft?.family) return Object.freeze({ draft, upgraded: false });
  const reconciliation = reconcileFamilyWithProjectOrigin({
    family: draft.family,
    projectOriginFamily
  });
  if (!reconciliation.upgraded) return Object.freeze({ draft, upgraded: false });

  return Object.freeze({
    draft: Object.freeze({
      ...draft,
      family: reconciliation.family,
      // Eine neuere Projektquelle ist eine echte, noch zu veröffentlichende
      // Änderung. Ohne dirty=true würde die ältere GitHub-Fassung sie beim
      // Verbindungsaufbau sofort wieder verdrängen.
      dirty: true
    }),
    upgraded: true
  });
}
