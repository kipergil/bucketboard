'use server';

import { updateTag } from 'next/cache';
import { submitItemSchema } from '@bucketboard/shared';
import { requireCurrentDirectusUser } from '@/lib/auth/current-user';
import { getTenantBySlug } from '@/services/tenants';
import { createSubmittedItem } from '@/services/items';
import { createPendingItemOffer } from '@/services/offers';
import { matchOrCreateRetailerForUrl } from '@/services/retailerMatching';
import { ensureMembership } from '@/services/users';
import { uploadImage, InvalidUploadError } from '@/services/files';

export interface SubmitItemActionResult {
  ok: boolean;
  error?: string;
  itemSlug?: string;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function submitItemAction(
  tenantSlug: string,
  input: unknown,
): Promise<SubmitItemActionResult> {
  const parsed = submitItemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid submission.' };
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return { ok: false, error: 'Tenant not found.' };

  let user;
  try {
    user = await requireCurrentDirectusUser();
  } catch {
    return { ok: false, error: 'Sign in to submit an item.' };
  }

  await ensureMembership(
    tenant.id,
    user.id,
    [user.first_name, user.last_name].filter(Boolean).join(' ') || null,
  );

  const slug = parsed.data.slug ?? slugify(parsed.data.title);

  const item = await createSubmittedItem({
    tenantId: tenant.id,
    categoryId: parsed.data.categoryId,
    title: parsed.data.title,
    slug,
    url: parsed.data.url ?? null,
    body: parsed.data.body ?? null,
    brand: parsed.data.brand ?? null,
    imageAssetId: parsed.data.imageAssetId ?? null,
    authorUserId: user.id,
    attributes: parsed.data.attributes.map((a) => ({
      definitionId: a.definitionId,
      value: a.value,
    })),
  });

  for (const link of parsed.data.shopLinks) {
    const retailerId = link.retailerId ?? (await matchOrCreateRetailerForUrl(link.url));
    await createPendingItemOffer({
      tenantId: tenant.id,
      itemId: item.id,
      retailerId,
      url: link.url,
      title: link.title ?? null,
      price: link.price ?? null,
      currency: link.currency ?? tenant.default_currency,
    });
  }

  updateTag(`items:${tenant.id}`);

  return { ok: true, itemSlug: slug };
}

export interface UploadImageActionResult {
  ok: boolean;
  error?: string;
  fileId?: string;
}

export async function uploadItemImageAction(formData: FormData): Promise<UploadImageActionResult> {
  try {
    await requireCurrentDirectusUser();
  } catch {
    return { ok: false, error: 'Sign in to upload images.' };
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false, error: 'No file provided.' };
  }

  try {
    const fileId = await uploadImage(file);
    return { ok: true, fileId };
  } catch (error) {
    if (error instanceof InvalidUploadError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Upload failed.' };
  }
}
