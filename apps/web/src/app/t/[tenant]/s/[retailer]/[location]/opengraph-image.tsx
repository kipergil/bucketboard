import { getRetailerBySlug, getRetailerLocationBySlug } from '@/services/retailers';
import { ogContentType, ogSize, renderOgImage } from '@/lib/og';

export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ tenant: string; retailer: string; location: string }>;
}) {
  const { retailer: retailerSlug, location: locationSlug } = await params;
  const retailer = await getRetailerBySlug(retailerSlug);
  const location = retailer ? await getRetailerLocationBySlug(retailer.id, locationSlug) : null;
  return renderOgImage(location?.name ?? 'Store', retailer?.name);
}
