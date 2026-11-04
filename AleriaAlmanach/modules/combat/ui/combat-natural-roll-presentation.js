/** Historical receipts remain self-contained; no current profile is consulted. */
export function describeNaturalRollReceipt(receipt = {}) {
  const parts = [];
  if (receipt.rerolls?.length) parts.push(`Glück: ${receipt.rerolls.map(roll => `${Number(roll.original)} → ${Number(roll.replacement)}`).join(', ')} · einmal neu gewürfelt, Ersatzwurf gilt`);
  if (Number(receipt.naturalRollPolicy?.criticalFailureMaximum) > 1) parts.push(`Pech: natürliche 1–${Number(receipt.naturalRollPolicy.criticalFailureMaximum)} sind kritische Fehlschläge`);
  return parts.join(' · ');
}
