// Falls back to localhost only for local dev. Production must set
// NEXT_PUBLIC_SITE_URL (e.g. https://slimorie.com) in Vercel's environment
// variables, or auth email links (confirmation, password reset) will point
// at localhost regardless of where the request actually came from.
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
