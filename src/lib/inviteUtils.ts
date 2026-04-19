/**
 * Generates a cryptographically random invite token (URL-safe base64-ish).
 */
export function generateInviteToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Builds the full invite URL for sharing with a System Owner.
 */
export function buildInviteUrl(token: string): string {
  const base = window.location.origin;
  return `${base}/invite/${token}`;
}

/**
 * Builds the suggested invite message text the Admin can copy & send.
 */
export function buildInviteMessage(caseNo: string, url: string): string {
  return `Welcome to Manta Ray Energy.\n\nPlease use this secure link to complete your property details for Case No. ${caseNo}:\n\n${url}\n\nThis link is unique to your job and should not be shared.`;
}
