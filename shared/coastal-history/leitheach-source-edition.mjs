import revision from './leitheach-source-revision.json' with { type: 'json' };
import { LEITHEACH_CHRONOLOGY as chronology, LEITHEACH_DURATION, raidIncidentLabel, raidTime } from './leitheach-chronology.mjs';

const cell = text => ({ text, colspan: 1, rowspan: 1 });
export const LEITHEACH_SOURCE_CHANGES = [
  ...revision.paragraphs,
  { sourceId: 'coastal-02', block: 26, cell: [3, 1], before: revision.beforeDuration, after: LEITHEACH_DURATION },
  { sourceId: 'coastal-02', block: 38, beforeRows: revision.beforeTimelineRows, afterRows: [
    [cell('Zeit'), cell('Ereignisse · redaktionell überarbeitet am 25.10.2026')],
    ...chronology.milestones.map(point => [cell(raidTime(point)), cell(point.text)])
  ] },
  ...Object.keys(chronology.incidents).map((id, index) => ({ sourceId: `coastal-${String(index + 3).padStart(2, '0')}`, block: 6, cell: [1, 1], before: revision.beforeIncidentTimes[index], after: `${chronology.period} | ${raidIncidentLabel(id)}` }))
].map(change => ({ ...change, reason: revision.reason, revisedOn: revision.revisedOn }));
