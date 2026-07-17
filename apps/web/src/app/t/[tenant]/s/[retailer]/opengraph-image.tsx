import { getRetailerBySlug } from '@/services/retailers';
import { getTenantBySlug } from '@/services/tenants';
import { ogContentType, ogSize, renderOgImage } from '@/lib/og';

export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ tenant: string; retailer: string }>;
}) {
  const { tenant: tenantSlug, retailer: retailerSlug } = await params;
  const [tenant, retailer] = await Promise.all([
    getTenantBySlug(tenantSlug),
    getRetailerBySlug(retailerSlug),
  ]);
  return renderOgImage(retailer?.name ?? 'Shop', tenant?.name);
}
