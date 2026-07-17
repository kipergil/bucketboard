import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { z } from 'zod';
import { getServerEnv } from '@/lib/env';
import { upsertDirectusUserFromClerk } from '@/services/users';
import { getServiceDirectusClient } from '@/lib/directus/client';
import { updateItem, readItems } from '@directus/sdk';
import { resolveClerkProvider } from '@/lib/auth/provider';

const clerkEmailSchema = z.object({
  id: z.string(),
  email_address: z.string().email(),
  verification: z.object({ strategy: z.string() }).nullable().optional(),
});

const clerkUserEventSchema = z.object({
  type: z.enum(['user.created', 'user.updated', 'user.deleted']),
  data: z.object({
    id: z.string(),
    email_addresses: z.array(clerkEmailSchema).default([]),
    primary_email_address_id: z.string().nullable().optional(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
    deleted: z.boolean().optional(),
  }),
});

/**
 * Verifies and applies Clerk's `user.*` webhooks, keeping directus_users
 * in sync as the primary path (see lib/auth/current-user.ts for the JIT
 * fallback that covers the gap before this lands, or a misconfigured
 * webhook in local dev).
 */
export async function POST(request: Request): Promise<NextResponse> {
  const env = getServerEnv();
  if (!env.CLERK_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const headerList = await headers();
  const svixId = headerList.get('svix-id');
  const svixTimestamp = headerList.get('svix-timestamp');
  const svixSignature = headerList.get('svix-signature');
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const body = await request.text();
  const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET);

  let event: unknown;
  try {
    event = webhook.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const parsed = clerkUserEventSchema.safeParse(event);
  if (!parsed.success) {
    // Event type we don't act on (e.g. session.*, organization.*) — ack and ignore.
    return NextResponse.json({ received: true });
  }

  const { type, data } = parsed.data;

  if (type === 'user.deleted') {
    await deactivateUser(data.id);
    return NextResponse.json({ received: true });
  }

  const primaryEmailAccount =
    data.email_addresses.find((e) => e.id === data.primary_email_address_id) ??
    data.email_addresses[0];

  await upsertDirectusUserFromClerk({
    clerkUserId: data.id,
    email: primaryEmailAccount?.email_address ?? null,
    firstName: data.first_name ?? null,
    lastName: data.last_name ?? null,
    avatarUrl: data.image_url ?? null,
    provider: resolveClerkProvider(primaryEmailAccount?.verification?.strategy ?? null),
  });

  return NextResponse.json({ received: true });
}

async function deactivateUser(clerkUserId: string): Promise<void> {
  const client = getServiceDirectusClient();
  const rows = await client.request(
    readItems('directus_users', {
      filter: { external_identifier: { _eq: clerkUserId } },
      fields: ['id'],
      limit: 1,
    }),
  );
  const user = rows[0] as { id: string } | undefined;
  if (!user) return;
  await client.request(
    updateItem('directus_users', user.id, { status: 'suspended' }, { fields: ['id'] }),
  );
}
