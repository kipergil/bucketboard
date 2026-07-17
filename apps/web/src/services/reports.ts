import 'server-only';
import { createItem } from '@directus/sdk';
import type { ReportReason, ReportTargetCollection } from '@bucketboard/shared';
import { getServiceDirectusClient } from '../lib/directus/client';

export interface CreateReportInput {
  tenantId: string;
  reporterId: string;
  targetCollection: ReportTargetCollection;
  targetId: string;
  reason: ReportReason;
  details?: string;
}

export async function createReport(input: CreateReportInput): Promise<void> {
  const client = getServiceDirectusClient();
  await client.request(
    createItem(
      'reports',
      {
        tenant: input.tenantId,
        target_collection: input.targetCollection,
        target_id: input.targetId,
        reporter: input.reporterId,
        reason: input.reason,
        details: input.details ?? null,
        status: 'open',
      },
      { fields: ['id'] },
    ),
  );
}
