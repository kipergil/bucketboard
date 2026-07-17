import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTenantBySlug } from '@/services/tenants';
import { getPublicProfileByDisplayName } from '@/services/profiles';
import { ItemCard } from '@/components/item/item-card';
import { Badge } from '@/components/ui/badge';

interface ProfilePageProps {
  params: Promise<{ tenant: string; username: string }>;
}

async function load(props: ProfilePageProps) {
  const { tenant: tenantSlug, username } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return null;
  const profile = await getPublicProfileByDisplayName(tenant.id, decodeURIComponent(username));
  if (!profile) return null;
  return { tenant, profile };
}

export async function generateMetadata(props: ProfilePageProps): Promise<Metadata> {
  const loaded = await load(props);
  if (!loaded) return {};
  return { title: loaded.profile.membership.display_name ?? 'Member' };
}

export default async function ProfilePage(props: ProfilePageProps) {
  const loaded = await load(props);
  if (!loaded) notFound();
  const { tenant, profile } = loaded;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{profile.membership.display_name}</h1>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary">{profile.membership.role}</Badge>
          <span className="text-muted-foreground text-sm">{profile.membership.karma} karma</span>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Submitted items</h2>
        {profile.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {profile.items.map((item) => (
              <ItemCard key={item.id} item={item} tenantSlug={tenant.slug} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No items submitted yet.</p>
        )}
      </section>
    </div>
  );
}
