// Daily nutrition boundaries must use the user's timezone, not UTC midnight
// (spec section 61), so "today" is computed per-user rather than via
// `new Date().toISOString()`.
export function userLocalDateString(timezone: string, date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatLongDate(dateString: string, timezone: string): string {
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}
