// Each preparation owns its public sources and generated output.
import { TROETZLI_QUEST_PREPARATIONS } from './quest-preparations/troetzli.generated.js';
import { FLEISCHSAMMLER_QUEST_PREPARATIONS } from './quest-preparations/fleischsammler.generated.js';

export const AUTHORED_QUEST_PREPARATIONS = Object.freeze({
  ...TROETZLI_QUEST_PREPARATIONS,
  ...FLEISCHSAMMLER_QUEST_PREPARATIONS
});
