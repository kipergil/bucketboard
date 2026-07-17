import type { AuthProvider } from '@bucketboard/shared';

/** Maps a Clerk verification strategy (e.g. "oauth_google", "password") to our AuthProvider enum. */
export function resolveClerkProvider(strategy: string | null | undefined): AuthProvider {
  if (!strategy) return 'password';
  if (strategy.includes('google')) return 'google';
  if (strategy.includes('apple')) return 'apple';
  if (strategy.includes('github')) return 'github';
  if (strategy.includes('facebook')) return 'facebook';
  return 'password';
}
