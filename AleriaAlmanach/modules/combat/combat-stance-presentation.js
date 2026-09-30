export function describeStanceConsequences(resolution = {}) {
  const texts = [];
  for (const counter of resolution.counterAttacks || []) {
    if (counter.skipped) { texts.push(`${counter.actorName} kann ${counter.stance} nicht ausführen: ${counter.skipped}`); continue; }
    const hit = counter.resolution;
    texts.push(hit.attack.hit
      ? `${counter.actorName} nutzt die verfehlte Angriffslinie für ${counter.stance}. Der Gegenangriff mit ${hit.weapon.name} trifft ${counter.targetName} und verursacht ${hit.damage?.total || 0} Schaden.`
      : `${counter.actorName} antwortet aus ${counter.stance}, doch ${counter.targetName} entgeht dem Gegenangriff.`);
    if (hit.targetConditionSnapshot?.applied) texts.push(`${counter.targetName}: ${hit.targetConditionSnapshot.applied.name} – ${hit.targetConditionSnapshot.applied.description}`);
  }
  for (const result of resolution.effectResults || []) if (result.applied?.damageGuard) {
    texts.push(`${result.applied.damageGuard.name} fängt ${result.applied.damageGuard.reduction} Schaden ab und ist aufgebraucht.`);
  }
  for (const event of resolution.sceneItemEvents || []) texts.push(event.text);
  return texts.join(' ');
}
