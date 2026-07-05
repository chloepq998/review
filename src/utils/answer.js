export function normalizeAnswer(value) {
  return String(value ?? '').trim().toUpperCase()
}
