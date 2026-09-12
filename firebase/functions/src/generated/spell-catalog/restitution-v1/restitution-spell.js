// Compact authoring for this edition; no mana or combat rules are duplicated here.
const actions = { A: 'action', B: 'bonus-action', R: 'reaction', S: 'special-action' };
const schoolLimits = 'Nur behandelbare lebende körperliche Ziele; Selbstheilung ist möglich. Keine Wiederbelebung, Heilung des Arkanistenfiebers oder automatische Auffüllung von Mana und Aktionen.';

function formData(source, base) {
  const form = { ...base, ...source };
  const healing = form.healing;
  return { ...form, actionIds: form.actions.split('+').map(id => actions[id]), damage: [], protectionRoll: '',
    effects: healing ? [{ type: 'healing', ...(typeof healing === 'number' ? { amount: healing } : { formula: healing }),
      on: 'always', magical: true, target: form.maximumTargets > 1 ? 'selected' : 'target' }] : [],
    outcome: { kind: form.outcomeKind || (healing ? 'healing' : 'treatment'),
      label: form.summary, formula: typeof healing === 'string' ? healing : form.previewFormula || '',
      amount: typeof healing === 'number' ? healing : null }
  };
}

export function defineRestitutionSpell(source) {
  const base = { maximumTargets: 1, range: 'Berührung; ein Ziel', duration: 'Sofort.', concentration: false,
    channelComments: 0, resolutionType: 'automatic', saveAttribute: '',
    requirements: 'Berührung, freie Hand und ein behandelbares lebendes Ziel.', iconPath: '',
    manualResolution: '', ...source };
  const form = formData(base, {});
  return { ...form, id: `restitution-${source.slug}`, revision: 1, catalog: 'restitution', school: 'Restitution',
    sourcePage: Number(source.sourceId.slice(1)) + 9, pagePath: 'Magie/restitution/index.html',
    targetPolicy: source.sourceId === 'R01' ? '' : 'living',
    limits: `${source.limits}${source.sourceId === 'R01' ? '' : ` ${schoolLimits}`}`,
    forms: (source.forms || []).map(higher => {
      const { forms, ...higherForm } = formData(higher, base);
      return { ...higherForm, changes: higher.changes || higher.summary };
    })
  };
}
