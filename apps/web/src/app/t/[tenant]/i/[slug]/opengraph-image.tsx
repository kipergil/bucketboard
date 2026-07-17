import { getTenantBySlug } from '@/services/tenants';
import { getItemBySlug } from '@/services/items';
import { ogContentType, ogSize, renderOgImage } from '@/lib/og';

export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ tenant: string; slug: string }>;
}) {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const item = tenant ? await getItemBySlug(tenant.id, slug) : null;
  return renderOgImage(item?.title ?? 'Item', item?.brand ?? tenant?.name);
}
