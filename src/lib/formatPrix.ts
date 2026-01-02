export const formatPrixEuro = (valueInCents?: number | null): number => {
  if (valueInCents === null || valueInCents === undefined) return 0;
  if (!Number.isFinite(valueInCents)) return 0;
  return Math.round(valueInCents) / 100;
};
