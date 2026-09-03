/** Virtual file labels from the old CE Master store. */
export function woFileLabel(woNumber: string): string {
  const n = Number.parseInt(woNumber, 10);
  if (Number.isFinite(n) && n >= 1000) return `wo-${woNumber}.json`;
  return `${woNumber}.json`;
}

export function qtFileLabel(ticketNumber: string): string {
  return `${ticketNumber}.json`;
}

export function soFileLabel(soNumber: string): string {
  return `so-${soNumber}.json`;
}

export function ptFileLabel(prospectNumber: string): string {
  return `pt-${prospectNumber}.json`;
}
