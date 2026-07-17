import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTenantBySlug } from '@/services/tenants';

export const metadata: Metadata = { title: 'Affiliate disclosure' };

export default async function AffiliateDisclosurePage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Affiliate disclosure</h1>
      <p>
        {tenant.name} participates in affiliate marketing programmes, including the Amazon
        Associates Programme and various UK retailer affiliate networks. This means that when you
        click a &ldquo;Buy&rdquo; link on this site and go on to make a purchase, we may earn a
        small commission — at no extra cost to you.
      </p>
      <p>
        We only list items and shops that our community has genuinely submitted and reviewed.
        Affiliate relationships never determine which items are featured or how they rank — rankings
        are driven entirely by community votes.
      </p>
      <p>
        Some listings are marked &ldquo;Official&rdquo; when the link goes to the brand&rsquo;s own
        site, and &ldquo;Sponsored&rdquo; where applicable, in line with ASA and CMA guidance on
        affiliate marketing disclosure in the UK.
      </p>
      <p>As an Amazon Associate, {tenant.name} earns from qualifying purchases.</p>
    </div>
  );
}
