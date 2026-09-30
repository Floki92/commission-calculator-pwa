export function formatPercentage(value: number | null): string {
  if (value === null) return '—';
  return value.toFixed(2) + '%';
}
