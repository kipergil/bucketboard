import { getTenantBySlug } from '@/services/tenants';
import { ogContentType, ogSize, renderOgImage } from '@/lib/og';

export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params;
  const tenant = await getTenantBySlug(slug);
  return renderOgImage(tenant?.name ?? 'BucketBoard', tenant?.description ?? undefined);
}
