import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTenantBySlug } from '@/services/tenants';

export const metadata: Metadata = { title: 'About' };

export default async function AboutPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="font-heading text-2xl font-bold tracking-tight">About {tenant.name}</h1>
      {tenant.description ? <p className="text-muted-foreground">{tenant.description}</p> : null}
      <p>
        {tenant.name} is a community-driven platform where members submit and rate their favourite
        products, and share where to find them — both online and in independent local shops.
      </p>
    </div>
  );
}
