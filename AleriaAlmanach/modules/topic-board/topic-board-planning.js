(function () {
  'use strict';

  const relevantStates = new Set(['today', 'active', 'overdue']);

  function getOpenProposals(input) {
    return (Array.isArray(input) ? input : []).filter(proposal =>
      proposal && proposal.status !== 'archived'
    );
  }

  function getSchedule(proposal) {
    return globalThis.AleriaTopicBoardSchedule.normalize(proposal?.schedule, {
      travel: proposal?.travel,
      fallbackDate: proposal?.travel?.departureDate
    });
  }

  function getTiming(proposal, currentDate) {
    return globalThis.AleriaTopicBoardSchedule.getTiming(getSchedule(proposal), currentDate);
  }

  function hasSchedule(proposal) {
    return globalThis.AleriaTopicBoardSchedule.hasDate(getSchedule(proposal).startDate);
  }

  function getVoteCount(proposal) {
    if (proposal?.votes && typeof proposal.votes === 'object') {
      return Object.values(proposal.votes).filter(value => value === true).length;
    }
    return Math.max(0, Number(proposal?.voteCount) || 0);
  }

  function sortChronologically(input) {
    return (Array.isArray(input) ? input : []).filter(Boolean).slice().sort((left, right) => {
      const leftOrdinal = globalThis.AleriaWorldDateModel.toOrdinal(getSchedule(left).startDate);
      const rightOrdinal = globalThis.AleriaWorldDateModel.toOrdinal(getSchedule(right).startDate);
      const dateDelta = (leftOrdinal ?? Number.MAX_SAFE_INTEGER) - (rightOrdinal ?? Number.MAX_SAFE_INTEGER);
      if (dateDelta) return dateDelta;
      const voteDelta = getVoteCount(right) - getVoteCount(left);
      return voteDelta || Number(right.updatedAtClient || 0) - Number(left.updatedAtClient || 0);
    });
  }

  function filterProposals(input, focus = 'all', currentDate) {
    const proposals = Array.isArray(input) ? input.filter(Boolean) : [];
    if (focus === 'unscheduled') return proposals.filter(proposal => !hasSchedule(proposal));
    if (focus === 'relevant') {
      return proposals.filter(proposal => relevantStates.has(getTiming(proposal, currentDate).state));
    }
    if (focus === 'upcoming') {
      return proposals.filter(proposal => getTiming(proposal, currentDate).state === 'upcoming');
    }
    return proposals.slice();
  }

  function getSummary(input, currentDate) {
    const proposals = Array.isArray(input) ? input.filter(Boolean) : [];
    const open = getOpenProposals(proposals);
    const summary = {
      open: open.length,
      archived: proposals.length - open.length,
      scheduled: 0,
      relevant: 0,
      upcoming: 0,
      unscheduled: 0,
      today: 0,
      active: 0,
      overdue: 0,
      nextProposal: null
    };
    for (const proposal of open) {
      if (!hasSchedule(proposal)) {
        summary.unscheduled += 1;
        continue;
      }
      summary.scheduled += 1;
      const state = getTiming(proposal, currentDate).state;
      if (state === 'upcoming') summary.upcoming += 1;
      if (relevantStates.has(state)) summary.relevant += 1;
      if (['today', 'active', 'overdue'].includes(state)) summary[state] += 1;
    }
    summary.nextProposal = sortChronologically(open)[0] || null;
    return summary;
  }

  globalThis.AleriaTopicBoardPlanning = Object.freeze({
    filterProposals,
    getSummary,
    getTiming,
    sortChronologically
  });
})();
