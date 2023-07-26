import { getBaseUrl } from "@/utils/api";

/**
 * Create a URL with a callback to a particular path.
 * @param backTo A part of URL to redirect back to after authentication.
 */
export function createAuthCallback(backTo: string) {
  return `/api/auth/signin?callbackUrl=${getBaseUrl()}/${backTo}`;
}
