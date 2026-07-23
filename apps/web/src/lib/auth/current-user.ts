import 'server-only';
import { auth, currentUser } from '@clerk/nextjs/server';
import type { DirectusUser } from '@bucketboard/shared';
import { getDirectusUserByClerkId, upsertDirectusUserFromClerk } from '../../services/users';
import { resolveClerkProvider } from './provider';

/**
 * Resolves the signed-in Clerk session to its mapped directus_users row.
 * Returns null for anonymous visitors. The Clerk webhook
 * (app/api/webhooks/clerk/route.ts) keeps directus_users in sync as the
 * primary path; this JIT upsert is the fallback for the gap between
 * sign-up and the webhook landing (or a webhook misconfigured in local
 * dev) — same upsert function either way, so the two paths can't drift.
 */
export async function getCurrentDirectusUser(): Promise<DirectusUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await getDirectusUserByClerkId(userId);
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null;
  const primaryEmailAccount = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId,
  );

  return upsertDirectusUserFromClerk({
    clerkUserId: clerkUser.id,
    email: primaryEmail,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    avatarUrl: clerkUser.imageUrl,
    provider: resolveClerkProvider(primaryEmailAccount?.verification?.strategy ?? null),
  });
}

/** Thrown by requireCurrentDirectusUser only when the visitor is genuinely anonymous. */
export class NotSignedInError extends Error {
  constructor() {
    super('You must be signed in to do that.');
    this.name = 'NotSignedInError';
  }
}

/**
 * Throws NotSignedInError if anonymous — use in server actions that require
 * a signed-in user. Any other failure (Directus unreachable, bad service
 * credentials, etc.) propagates as-is so callers don't mistake an outage
 * for "you're not signed in".
 */
export async function requireCurrentDirectusUser(): Promise<DirectusUser> {
  const user = await getCurrentDirectusUser();
  if (!user) {
    throw new NotSignedInError();
  }
  return user;
}

/**
 * Maps a requireCurrentDirectusUser() failure to a user-facing message.
 * Only a genuine NotSignedInError gets the sign-in copy — anything else
 * (bad service credentials, Directus unreachable, etc.) is logged with its
 * real cause and reported as a generic failure, so an outage doesn't look
 * like the visitor forgot to sign in.
 */
export function authErrorMessage(error: unknown, signedOutMessage: string): string {
  if (error instanceof NotSignedInError) {
    return signedOutMessage;
  }
  console.error('requireCurrentDirectusUser failed unexpectedly:', error);
  return 'Something went wrong. Please try again.';
}
