/**
 * Generate a unique ID with an optional prefix.
 * Uses crypto.randomUUID when available, falls back to timestamp + random.
 */
export function generateId(prefix = ''): string {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  return prefix ? `${prefix}-${id}` : id;
}
