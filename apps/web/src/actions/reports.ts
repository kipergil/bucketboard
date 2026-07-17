'use server';

import { createReportSchema } from '@bucketboard/shared';
import { requireCurrentDirectusUser } from '@/lib/auth/current-user';
import { getTenantBySlug } from '@/services/tenants';
import { createReport } from '@/services/reports';

export interface ReportActionResult {
  ok: boolean;
  error?: string;
}

export async function createReportAction(
  tenantSlug: string,
  input: unknown,
): Promise<ReportActionResult> {
  const parsed = createReportSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid report.' };
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return { ok: false, error: 'Tenant not found.' };

  let user;
  try {
    user = await requireCurrentDirectusUser();
  } catch {
    return { ok: false, error: 'Sign in to report content.' };
  }

  await createReport({
    tenantId: tenant.id,
    reporterId: user.id,
    targetCollection: parsed.data.targetCollection,
    targetId: parsed.data.targetId,
    reason: parsed.data.reason,
    details: parsed.data.details,
  });

  return { ok: true };
}
