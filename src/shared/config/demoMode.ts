export const DEMO_MODE = (() => {
  const raw = import.meta.env.VITE_DEMO_MODE;
  if (raw === undefined || raw === null) return true;
  const normalized = String(raw).trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  return true;
})();
