import { updateDevelopmentSelection } from './development-ui.js';

const valueOf = target => target.type === 'checkbox' ? target.checked
  : target.type === 'number' && target.value !== '' ? Number(target.value) : target.value;

// Shared delegated input boundary for creation and later level changes.
export function updateDevelopmentPlan(plan, target) {
  if (updateDevelopmentSelection(plan, target)) return true;
  const { levelUpPath: path, levelUpAttribute: attribute, levelUpResource: resource,
    levelUpResourceProperty: property } = target.dataset;
  if (path) {
    const keys = path.split('.');
    if (keys.some(key => ['__proto__', 'prototype', 'constructor'].includes(key))) return false;
    let branch = plan;
    for (const key of keys.slice(0, -1)) {
      if (!branch[key] || typeof branch[key] !== 'object') return false;
      branch = branch[key];
    }
    branch[keys.at(-1)] = valueOf(target);
  } else if (attribute && Object.hasOwn(plan.attributeIncreases, attribute)) {
    plan.attributeIncreases[attribute] = valueOf(target);
  } else if (resource && ['current', 'maximum'].includes(property) && Object.hasOwn(plan.resourceIncreases, resource)) {
    plan.resourceIncreases[resource][property] = valueOf(target);
  } else return false;
  return true;
}
