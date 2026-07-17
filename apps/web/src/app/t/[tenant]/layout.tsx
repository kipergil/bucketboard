import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTenantBySlug } from '@/services/tenants';
import { TenantProvider } from '@/lib/tenant/context';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>;
}): Promise<Metadata> {
  const { tenant: slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) return {};

  return {
    title: { default: tenant.name, template: `%s | ${tenant.name}` },
    description: tenant.description ?? undefined,
  };
}

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  const tenantContext = {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    defaultCurrency: tenant.default_currency,
    defaultLocale: tenant.default_locale,
  };

  return (
    <TenantProvider tenant={tenantContext}>
      <Header tenant={tenantContext} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      <Footer tenant={tenantContext} />
    </TenantProvider>
  );
}
